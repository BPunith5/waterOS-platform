import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AlertRecord, DeviceUpdatePayload } from '@/lib/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket>(() => io(SOCKET_URL, { transports: ['websocket', 'polling'] }));
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

/** Subscribes to `device:update` events for as long as `callback` is defined. */
export function useDeviceUpdates(callback?: (payload: DeviceUpdatePayload) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !callback) return;
    socket.on('device:update', callback);
    return () => {
      socket.off('device:update', callback);
    };
  }, [socket, callback]);
}

/** Subscribes to `alert:new` events for as long as `callback` is defined. */
export function useAlertUpdates(callback?: (alert: AlertRecord) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !callback) return;
    socket.on('alert:new', callback);
    return () => {
      socket.off('alert:new', callback);
    };
  }, [socket, callback]);
}

/** Joins the `tank:${tankId}` room while mounted, leaving it on unmount/change. */
export function useTankSubscription(tankId?: string | null) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected || !tankId) return;
    socket.emit('subscribe:tank', tankId);
    return () => {
      socket.emit('unsubscribe:tank', tankId);
    };
  }, [socket, connected, tankId]);
}

/** Joins the `tank:${id}` room for each of the given tank ids while mounted. */
export function useTanksSubscription(tankIds: string[]) {
  const { socket, connected } = useSocket();
  const key = tankIds.join(',');

  useEffect(() => {
    if (!socket || !connected || !key) return;
    const ids = key.split(',');
    ids.forEach((id) => socket.emit('subscribe:tank', id));
    return () => {
      ids.forEach((id) => socket.emit('unsubscribe:tank', id));
    };
  }, [socket, connected, key]);
}
