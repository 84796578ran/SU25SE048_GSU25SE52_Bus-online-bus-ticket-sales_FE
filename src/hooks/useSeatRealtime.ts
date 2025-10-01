import { useEffect, useMemo, useRef, useState } from 'react';
import { realtimeService, type SeatLockEvent } from '@/services/realtime';
import { axiosInstance } from '@/services/api';

type LockedSeatKey = string; // `${tripId}:${seatId}:${fromStationId}:${toStationId}`

export function useSeatRealtime(params: {
  baseUrl?: string; // defaults to API base URL
  tripIds: number[]; // one or multiple trips (transfer & round-trip)
  fromStationId?: number; // optional; if omitted, accept all segments
  toStationId?: number;   // optional
}) {
  const { tripIds, fromStationId, toStationId } = params;
  const baseUrl = params.baseUrl || axiosInstance.defaults.baseURL || '';
  const [connected, setConnected] = useState(false);
  const [locked, setLocked] = useState<Record<number, Set<number>>>({}); // tripId -> set of seatId

  const keyMatchesSegment = (e: SeatLockEvent) => {
    if (typeof fromStationId !== 'number' || typeof toStationId !== 'number') return true;
    return e.fromStationId === fromStationId && e.toStationId === toStationId;
  };

  useEffect(() => {
    let unsubLock: (() => void) | null = null;
    let unsubUnlock: (() => void) | null = null;
    let active = true;
    (async () => {
      try {
        await realtimeService.start(baseUrl);
        if (!active) return;
        setConnected(true);

        // Join relevant trips
        for (const t of tripIds) {
          await realtimeService.joinTrip(t);
        }

        // Subscribe
        unsubLock = realtimeService.onLock((e) => {
          if (!keyMatchesSegment(e)) return;
          if (!tripIds.includes(e.tripId)) return;
          setLocked((prev) => {
            const next = { ...prev };
            const set = new Set(next[e.tripId] || []);
            set.add(e.seatId);
            next[e.tripId] = set;
            return next;
          });
        });
        unsubUnlock = realtimeService.onUnlock((e) => {
          if (!keyMatchesSegment(e)) return;
          if (!tripIds.includes(e.tripId)) return;
          setLocked((prev) => {
            const next = { ...prev };
            const set = new Set(next[e.tripId] || []);
            set.delete(e.seatId);
            next[e.tripId] = set;
            return next;
          });
        });
      } catch (e) {
        setConnected(false);
      }
    })();

    return () => {
      unsubLock?.();
      unsubUnlock?.();
      // Leave groups explicitly (keep connection alive for other pages)
      (async () => {
        for (const t of tripIds) {
          try { await realtimeService.leaveTrip(t); } catch {}
        }
      })();
    };
  }, [baseUrl, JSON.stringify(tripIds), fromStationId, toStationId]);

  const isLocked = (tripId: number, seatId: number) => {
    return !!locked[tripId]?.has(seatId);
  };

  const externallyLockedSeatIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of Object.keys(locked)) {
      const tid = Number(t);
      for (const s of locked[tid] || []) {
        ids.add(String(s));
      }
    }
    return ids;
  }, [locked]);

  return {
    connected,
    isLocked,
    externallyLockedSeatIds,
  } as const;
}


