package expo.modules.gamblingmonitor

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.nio.ByteBuffer

// Mechanism 3 — "Website shield". A local VpnService that captures ONLY DNS
// traffic (we advertise a virtual DNS server and route just that address into
// the tun), inspects each lookup's hostname, and substring-matches it against
// the gambling domain list. Traffic never leaves the phone except the DNS
// query we forward to a real upstream resolver on the user's behalf — the whole
// point of the privacy story: no packet contents are read or exfiltrated, only
// the hostname is examined locally.
//
//   detect-only : forward the query upstream so the site still loads, and emit.
//   block       : answer the query with NXDOMAIN so the site fails to resolve,
//                 and emit.
//
// Requires the user to approve the system VPN consent dialog (VpnService.prepare,
// surfaced from the module). Runs as a foreground service with its own notice.
class GamblingVpnService : VpnService() {

  companion object {
    const val PREFS = "gambling_monitor"
    const val KEY_DOMAINS = "blocklist"
    const val KEY_BLOCK_MODE = "block_mode"

    private const val CHANNEL_ID = "gambling-shield"
    private const val NOTIFICATION_ID = 0x7368 // "sh"

    // Virtual addresses that live only inside the tun. The system sends DNS to
    // VIRTUAL_DNS; we route only that /32 so all other traffic is untouched.
    private const val TUN_ADDRESS = "10.111.222.3"
    private const val VIRTUAL_DNS = "10.111.222.4"
    // Real resolver we forward queries to (over a protected socket, i.e. the
    // underlying network, bypassing our own tun).
    private const val UPSTREAM_DNS = "8.8.8.8"

    private const val DNS_PORT = 53
    private const val EMIT_DEBOUNCE_MS = 60_000L

    // Wired to the JS event by GamblingMonitorModule; null when JS is gone.
    @Volatile
    var onGamblingSiteDetected: ((String) -> Unit)? = null

    @Volatile
    var isRunning = false
      private set
  }

  private var vpnInterface: ParcelFileDescriptor? = null
  private var worker: Thread? = null
  @Volatile private var running = false

  private var domains: List<String> = emptyList()
  private var blockMode = false
  private val lastEmit = HashMap<String, Long>()

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    domains = (prefs.getStringSet(KEY_DOMAINS, emptySet()) ?: emptySet())
      .map { it.lowercase() }
    blockMode = prefs.getBoolean(KEY_BLOCK_MODE, false)

    startInForeground()

    if (!running) {
      running = true
      isRunning = true
      worker = Thread({ runLoop() }, "GamblingVpnLoop").also { it.start() }
    }
    return START_STICKY
  }

  override fun onDestroy() {
    teardown()
    super.onDestroy()
  }

  override fun onRevoke() {
    // Another VPN took the single VPN slot, or the user revoked ours.
    teardown()
    super.onRevoke()
  }

  private fun teardown() {
    running = false
    isRunning = false
    worker?.interrupt()
    worker = null
    try {
      vpnInterface?.close()
    } catch (e: Exception) {
      // already closed
    }
    vpnInterface = null
  }

  // ── VPN setup + packet loop ──────────────────────────────────────

  private fun runLoop() {
    val builder = Builder()
      .setSession("BettingLog Website Shield")
      .addAddress(TUN_ADDRESS, 32)
      .addDnsServer(VIRTUAL_DNS)
      // Route ONLY the virtual DNS address into the tun. Everything else uses
      // the normal network, so we never see (or need to forward) real traffic.
      .addRoute(VIRTUAL_DNS, 32)
    // Don't capture our own DNS, to avoid loops.
    try {
      builder.addDisallowedApplication(packageName)
    } catch (e: Exception) {
      // ignore — our own queries are forwarded upstream anyway
    }

    val iface = try {
      builder.establish()
    } catch (e: Exception) {
      // establish() throws/returns null if consent was lost or another VPN owns
      // the slot. Stop the service; JS surfaces the "another VPN active" case.
      stopSelf()
      return
    }
    if (iface == null) {
      stopSelf()
      return
    }
    vpnInterface = iface

    val input = FileInputStream(iface.fileDescriptor)
    val output = FileOutputStream(iface.fileDescriptor)
    val buffer = ByteArray(32767)

    while (running && !Thread.currentThread().isInterrupted) {
      val length = try {
        input.read(buffer)
      } catch (e: Exception) {
        break
      }
      if (length <= 0) continue
      try {
        handlePacket(buffer, length, output)
      } catch (e: Exception) {
        // A malformed packet must never kill the loop.
      }
    }
  }

  // Parse an outbound IPv4/UDP/DNS packet, inspect the hostname, then either
  // forward (detect-only) or synthesize NXDOMAIN (block) — writing the DNS
  // response back into the tun so the querying app gets an answer.
  private fun handlePacket(packet: ByteArray, length: Int, output: FileOutputStream) {
    if (length < 28) return
    val version = (packet[0].toInt() and 0xF0) shr 4
    if (version != 4) return
    val ihl = (packet[0].toInt() and 0x0F) * 4
    val protocol = packet[9].toInt() and 0xFF
    if (protocol != 17) return // UDP only

    val udpStart = ihl
    val dstPort = ((packet[udpStart + 2].toInt() and 0xFF) shl 8) or
      (packet[udpStart + 3].toInt() and 0xFF)
    if (dstPort != DNS_PORT) return

    val dnsStart = udpStart + 8
    if (dnsStart >= length) return
    val dnsPayload = packet.copyOfRange(dnsStart, length)
    val hostname = parseDnsQname(dnsPayload) ?: return

    val matched = domains.any { hostname.contains(it) }
    if (matched) maybeEmit(hostname)

    if (matched && blockMode) {
      val response = buildDnsResponsePacket(packet, ihl, dnsPayload, nxDomain = true)
      if (response != null) output.write(response)
    } else {
      forwardAndReply(packet, ihl, dnsPayload, output)
    }
  }

  // Forward the DNS query to the real upstream resolver over a protected socket
  // (so it goes out the underlying network, not back into our tun), then wrap
  // the reply in an IP/UDP packet aimed back at the querying app.
  private fun forwardAndReply(
    packet: ByteArray,
    ihl: Int,
    dnsPayload: ByteArray,
    output: FileOutputStream,
  ) {
    val socket = DatagramSocket()
    try {
      protect(socket)
      socket.soTimeout = 3000
      val upstream = InetAddress.getByName(UPSTREAM_DNS)
      socket.send(DatagramPacket(dnsPayload, dnsPayload.size, InetSocketAddress(upstream, DNS_PORT)))
      val replyBuf = ByteArray(4096)
      val reply = DatagramPacket(replyBuf, replyBuf.size)
      socket.receive(reply)
      val responsePayload = replyBuf.copyOfRange(0, reply.length)
      val ipPacket = buildDnsResponsePacket(packet, ihl, responsePayload, nxDomain = false)
      if (ipPacket != null) output.write(ipPacket)
    } catch (e: Exception) {
      // Upstream timeout/unreachable — drop; the app will retry its lookup.
    } finally {
      socket.close()
    }
  }

  private fun maybeEmit(hostname: String) {
    val now = System.currentTimeMillis()
    val last = lastEmit[hostname] ?: 0L
    if (now - last < EMIT_DEBOUNCE_MS) return
    lastEmit[hostname] = now
    onGamblingSiteDetected?.invoke(hostname)
  }

  // ── DNS + packet helpers ─────────────────────────────────────────

  // Extract the first question's QNAME as a dotted hostname.
  private fun parseDnsQname(dns: ByteArray): String? {
    if (dns.size < 13) return null
    val qdcount = ((dns[4].toInt() and 0xFF) shl 8) or (dns[5].toInt() and 0xFF)
    if (qdcount < 1) return null
    var pos = 12
    val sb = StringBuilder()
    while (pos < dns.size) {
      val len = dns[pos].toInt() and 0xFF
      if (len == 0) break
      if (len and 0xC0 != 0) return null // compression pointer — not in a question
      pos++
      if (pos + len > dns.size) return null
      if (sb.isNotEmpty()) sb.append('.')
      sb.append(String(dns, pos, len, Charsets.US_ASCII))
      pos += len
    }
    return if (sb.isEmpty()) null else sb.toString().lowercase()
  }

  // Build an IPv4/UDP packet carrying `responsePayload` back to the app: swap
  // src/dst addresses and ports from the original query. When nxDomain, mark the
  // payload (a copy of the query) as an authoritative "no such domain" answer.
  private fun buildDnsResponsePacket(
    query: ByteArray,
    ihl: Int,
    responsePayload: ByteArray,
    nxDomain: Boolean,
  ): ByteArray? {
    val payload = if (nxDomain) {
      // Turn the query into a response: QR=1, RD copied, RA=1, RCODE=3.
      val r = responsePayload.copyOf()
      if (r.size < 4) return null
      r[2] = (0x81).toByte() // QR=1, Opcode=0, AA=0, TC=0, RD=1
      r[3] = (0x83).toByte() // RA=1, Z=0, RCODE=3 (NXDOMAIN)
      // Zero answer/authority/additional counts.
      for (i in 6..11) if (i < r.size) r[i] = 0
      r
    } else {
      responsePayload
    }

    val udpStart = ihl
    val srcPort = ((query[udpStart].toInt() and 0xFF) shl 8) or
      (query[udpStart + 1].toInt() and 0xFF)
    val dstPort = ((query[udpStart + 2].toInt() and 0xFF) shl 8) or
      (query[udpStart + 3].toInt() and 0xFF)

    val ipHeaderLen = 20
    val udpLen = 8 + payload.size
    val totalLen = ipHeaderLen + udpLen
    val out = ByteBuffer.allocate(totalLen)

    // ── IPv4 header ──
    out.put(0x45.toByte())          // version 4, IHL 5
    out.put(0)                      // DSCP/ECN
    out.putShort(totalLen.toShort())
    out.putShort(0)                 // identification
    out.putShort(0x4000.toShort())  // flags: don't fragment
    out.put(64)                     // TTL
    out.put(17)                     // protocol UDP
    out.putShort(0)                 // header checksum (filled below)
    // Source = the virtual DNS server (original destination).
    out.put(query, 16, 4)
    // Destination = the original source (the querying app).
    out.put(query, 12, 4)

    // ── UDP header ── (swap ports; server 53 → app's ephemeral port)
    out.putShort(dstPort.toShort())
    out.putShort(srcPort.toShort())
    out.putShort(udpLen.toShort())
    out.putShort(0)                 // UDP checksum 0 = not computed (legal on IPv4)

    out.put(payload)

    val bytes = out.array()
    writeIpChecksum(bytes)
    return bytes
  }

  private fun writeIpChecksum(packet: ByteArray) {
    packet[10] = 0
    packet[11] = 0
    var sum = 0
    var i = 0
    while (i < 20) {
      sum += ((packet[i].toInt() and 0xFF) shl 8) or (packet[i + 1].toInt() and 0xFF)
      i += 2
    }
    while (sum shr 16 != 0) sum = (sum and 0xFFFF) + (sum shr 16)
    val checksum = sum.inv() and 0xFFFF
    packet[10] = (checksum shr 8).toByte()
    packet[11] = (checksum and 0xFF).toByte()
  }

  // ── Foreground notification ─────────────────────────────────────

  private fun startInForeground() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(
        NotificationChannel(
          CHANNEL_ID,
          "Website shield",
          NotificationManager.IMPORTANCE_LOW,
        ).apply { description = "Shown while the on-device website shield is active" },
      )
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val contentIntent = launchIntent?.let {
      PendingIntent.getActivity(
        this, 0, it,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
    }

    val text = if (blockMode) {
      "Blocking gambling sites on this device."
    } else {
      "Watching for gambling sites on this device."
    }
    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Website shield is on")
      .setContentText(text)
      .setSmallIcon(android.R.drawable.ic_lock_lock)
      .setOngoing(true)
      .setContentIntent(contentIntent)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }
}
