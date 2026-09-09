import AsyncStorage from '@react-native-async-storage/async-storage';

// A durable queue of writes made while offline (or that failed on a dropped
// connection). Each op is a plain, serialisable descriptor; the app provider
// owns a `replay(op)` that maps a type back to the real service call. Ops are
// append-only logging actions (diary, streak, spend, usage, check-in, PGSI),
// so replaying them in order reproduces the same server state - no local IDs to
// reconcile. Flushed automatically when connectivity returns.
const KEY = 'write-outbox:v1';

export type OutboxOp = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  ts: number;
};

async function readAll(): Promise<OutboxOp[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OutboxOp[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(ops: OutboxOp[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ops));
  } catch {
    // ignore - if we can't persist the queue the op is lost, but the app
    // stays usable; nothing throws into the UI.
  }
}

export async function enqueue(type: string, payload: Record<string, unknown>): Promise<void> {
  const ops = await readAll();
  ops.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, payload, ts: Date.now() });
  await writeAll(ops);
}

export async function pendingCount(): Promise<number> {
  return (await readAll()).length;
}

// Replay queued ops oldest-first. Stops at the first failure (likely still
// offline) and keeps the remaining ops for the next attempt. Returns how many
// synced. `replay` should throw on failure so we know to stop.
export async function flush(replay: (op: OutboxOp) => Promise<void>): Promise<number> {
  const ops = await readAll();
  if (ops.length === 0) return 0;
  let synced = 0;
  for (const op of ops) {
    try {
      await replay(op);
      synced += 1;
    } catch {
      break; // still offline (or this op can't apply yet) - retry later
    }
  }
  if (synced > 0) await writeAll(ops.slice(synced));
  return synced;
}
