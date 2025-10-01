import * as signalR from '@microsoft/signalr';

type SeatLockEvent = {
  tripId: number;
  seatId: number;
  fromStationId: number;
  toStationId: number;
};

type EventHandler = (payload: SeatLockEvent) => void;

class RealtimeService {
  private connection: signalR.HubConnection | null = null;
  private handlers: { lock: Set<EventHandler>; unlock: Set<EventHandler> } = {
    lock: new Set<EventHandler>(),
    unlock: new Set<EventHandler>(),
  };

  private joinedTrips = new Set<number>();

  async start(baseUrl: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const url = `${baseUrl.replace(/\/$/, '')}/seatHub`;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(url, { withCredentials: true })
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => 1500 })
      .build();

    this.connection.on('SeatLocked', (tripId: number, seatId: number, fromStationId: number, toStationId: number) => {
      const payload: SeatLockEvent = { tripId, seatId, fromStationId, toStationId };
      this.handlers.lock.forEach(h => h(payload));
    });

    this.connection.on('SeatUnlocked', (tripId: number, seatId: number, fromStationId: number, toStationId: number) => {
      const payload: SeatLockEvent = { tripId, seatId, fromStationId, toStationId };
      this.handlers.unlock.forEach(h => h(payload));
    });

    await this.connection.start();
  }

  onLock(handler: EventHandler) {
    this.handlers.lock.add(handler);
    return () => this.handlers.lock.delete(handler);
  }

  onUnlock(handler: EventHandler) {
    this.handlers.unlock.add(handler);
    return () => this.handlers.unlock.delete(handler);
  }

  async joinTrip(tripId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) return;
    if (this.joinedTrips.has(tripId)) return;
    await this.connection.invoke('JoinTripGroup', tripId);
    this.joinedTrips.add(tripId);
  }

  async leaveTrip(tripId: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) return;
    if (!this.joinedTrips.has(tripId)) return;
    await this.connection.invoke('LeaveTripGroup', tripId);
    this.joinedTrips.delete(tripId);
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try { await this.connection.stop(); } catch {}
      this.connection = null;
      this.joinedTrips.clear();
    }
  }
}

export const realtimeService = new RealtimeService();
export type { SeatLockEvent };

