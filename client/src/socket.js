import { io } from 'socket.io-client';

// Same-origin in production (Node serves the build); proxied in dev.
export const socket = io('/', { transports: ['websocket', 'polling'], autoConnect: true });
