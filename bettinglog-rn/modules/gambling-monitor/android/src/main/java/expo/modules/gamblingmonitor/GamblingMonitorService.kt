package expo.modules.gamblingmonitor

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import androidx.core.app.NotificationCompat

// Foreground service that watches which app is in the foreground by polling
// UsageStatsManager.queryEvents (ACTIVITY_RESUMED) every POLL_INTERVAL_MS.
// When the foreground app CHANGES to a package on the gambling watchlist, it
// reports the package via [onGamblingAppDetected] (wired to the JS event
// 'GamblingAppDetected' by GamblingMonitorModule). Emitting only on the
// transition debounces a session to a single detection — staying inside the
// app, or its own activity changes, emit nothing further.
//
// Requires the Usage Access special permission (PACKAGE_USAGE_STATS); without
// it queryEvents just returns no events, so the service is silent, never wrong.
class GamblingMonitorService : Service() {

  companion object {
    const val PREFS = "gambling_monitor"
    const val KEY_WATCHLIST = "watchlist"

    private const val CHANNEL_ID = "gambling-monitor"
    private const val NOTIFICATION_ID = 0x6A6D // "gm"
    // Fast poll so a gambling app is caught within ~half a second of opening.
    // UsageStatsManager has no push/callback API, so the poll interval is the
    // main source of detection latency — 400ms trades a little battery for a
    // near-immediate nudge, which is the whole point of the feature.
    // ponytail: fixed 400ms poll; only AccessibilityService gives true <100ms.
    private const val POLL_INTERVAL_MS = 400L

    // Set by GamblingMonitorModule while JS is alive; null-safe on purpose —
    // if the JS runtime is gone there is nobody to nudge, so we drop the event.
    @Volatile
    var onGamblingAppDetected: ((String) -> Unit)? = null

    @Volatile
    var isRunning = false
      private set
  }

  private lateinit var handlerThread: HandlerThread
  private lateinit var handler: Handler
  private var watchlist: Set<String> = emptySet()
  private var lastForeground: String? = null
  private var lastQueryEnd = 0L

  private val tick = object : Runnable {
    override fun run() {
      poll()
      handler.postDelayed(this, POLL_INTERVAL_MS)
    }
  }

  override fun onCreate() {
    super.onCreate()
    handlerThread = HandlerThread("GamblingMonitorPoll").also { it.start() }
    handler = Handler(handlerThread.looper)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    watchlist = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .getStringSet(KEY_WATCHLIST, emptySet()) ?: emptySet()

    startInForeground()

    handler.removeCallbacks(tick)
    lastQueryEnd = System.currentTimeMillis()
    handler.post(tick)
    isRunning = true
    return START_STICKY
  }

  override fun onDestroy() {
    isRunning = false
    handler.removeCallbacks(tick)
    handlerThread.quitSafely()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  // ── Polling ─────────────────────────────────────────────────────

  private fun poll() {
    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
    val now = System.currentTimeMillis()
    // Moving cursor so each event is seen exactly once across polls.
    val events = try {
      usm.queryEvents(lastQueryEnd, now)
    } catch (e: Exception) {
      return
    }
    lastQueryEnd = now

    // The newest foreground transition in the window wins.
    var newest: String? = null
    val event = UsageEvents.Event()
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      // ACTIVITY_RESUMED == MOVE_TO_FOREGROUND == 1 on all API levels.
      if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
        newest = event.packageName
      }
    }

    if (newest != null && newest != lastForeground) {
      lastForeground = newest
      if (watchlist.contains(newest)) {
        onGamblingAppDetected?.invoke(newest)
      }
    }
  }

  // ── Foreground notification ─────────────────────────────────────

  private fun startInForeground() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(
        NotificationChannel(
          CHANNEL_ID,
          "Background monitoring",
          NotificationManager.IMPORTANCE_LOW,
        ).apply {
          description = "Shown while BettingLog watches for gambling apps"
        },
      )
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val contentIntent = launchIntent?.let {
      PendingIntent.getActivity(
        this,
        0,
        it,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
    }

    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Monitoring is on")
      .setContentText("BettingLog will nudge you if a gambling app opens.")
      .setSmallIcon(android.R.drawable.ic_menu_view)
      .setOngoing(true)
      .setContentIntent(contentIntent)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }
}
