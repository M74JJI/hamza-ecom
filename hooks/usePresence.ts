'use client';

import { useEffect, useRef, useState } from 'react';

export function usePresence(room: string = 'global') {
  const base = process.env.NEXT_PUBLIC_PRESENCE_URL!;
  const [count, setCount] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const unloadingRef = useRef(false);

  useEffect(() => {
    if (!base) return;
    let stop = false;

    const connect = () => {
      if (stop || unloadingRef.current) return;
      const url = `${base.replace(/\/$/, '')}/ws?room=${encodeURIComponent(room)}&t=${Date.now()}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        try { ws.send('ping'); } catch {}
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.type === 'count' && typeof data.count === 'number') setCount(data.count);
        } catch {}
      };

      ws.onclose = () => {
        if (!stop && !unloadingRef.current) setTimeout(connect, 1000);
      };

      ws.onerror = () => { try { ws.close(); } catch {}; };
    };

    connect();

    // Heartbeat every 10s (server treats any message as a heartbeat)
    const hb = setInterval(() => {
      try { wsRef.current?.send('ping'); } catch {}
    }, 10_000);

    // Close cleanly on page unload (fast decrement)
    const handleUnload = () => {
      unloadingRef.current = true;
      try { wsRef.current?.close(1000, 'tab closing'); } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      stop = true;
      clearInterval(hb);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      try { wsRef.current?.close(1000, 'hook unmount'); } catch {}
    };
  }, [base, room]);

  return count;
}
