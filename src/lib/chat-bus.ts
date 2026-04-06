/**
 * In-process pub/sub for chat SSE (single Node instance / one PM2 fork).
 * For horizontal scale, replace with Redis pub/sub.
 */

type Listener = (payload: string) => void;

const listeners = new Map<string, Set<Listener>>();

export function chatSubscribe(threadId: string, listener: Listener): () => void {
  let set = listeners.get(threadId);
  if (!set) {
    set = new Set();
    listeners.set(threadId, set);
  }
  set.add(listener);
  return () => {
    const s = listeners.get(threadId);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) listeners.delete(threadId);
  };
}

export function chatPublish(threadId: string, payload: unknown): void {
  const data = JSON.stringify(payload);
  const set = listeners.get(threadId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(data);
    } catch {
      /* ignore */
    }
  }
}
