import { ApiMessage } from 'api-types';
import {
  createContext,
  onCleanup,
  onMount,
  ParentProps,
  useContext,
} from 'solid-js';
import { createStore } from 'solid-js/store';

export interface SocketState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  messages: ApiMessage[];
  send: (data: string) => void;
}

const SOCKET_URL = `/api/ws`;
const SocketContext = createContext<SocketState>(undefined);

interface ActiveSocket {
  send: (data: string) => void;
  dispose: () => void;
}

export function SocketProvider(props: ParentProps) {
  const [socketState, setSocketState] = createStore<SocketState>({
    messages: [],
    status: 'disconnected',
    send: (data: string) => {
      if (activeSocket && socketState.status === 'connected') {
        activeSocket.send(data);
      } else {
        console.warn('Socket is not connected. Cannot send message.');
      }
    },
  });

  let activeSocket: ActiveSocket | null = null;

  function disconnectSocket() {
    activeSocket?.dispose();
    activeSocket = null;
    setSocketState('status', 'disconnected');
  }

  function connectSocket() {
    activeSocket?.dispose();
    let disposed = false;
    const socket = new WebSocket(SOCKET_URL);

    setSocketState('status', 'connecting');

    function handleOpen() {
      setSocketState('status', 'connected');
    }
    function handleClose() {
      setSocketState('status', 'connecting');
      setTimeout(() => {
        connectSocket();
      }, 1_000);
    }
    function handleError() {
      setSocketState('status', 'connecting');
      setTimeout(() => {
        connectSocket();
      }, 1_000);
    }
    function handleMessage(event: MessageEvent) {
      const data = JSON.parse(event.data) as ApiMessage[];
      setSocketState('messages', (m) => [...m, ...data]);
    }

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);
    socket.addEventListener('message', handleMessage);

    activeSocket = {
      send: (data: string) => {
        socket.send(data);
      },
      dispose: () => {
        if (disposed) return;

        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('close', handleClose);
        socket.removeEventListener('error', handleError);
        socket.removeEventListener('message', handleMessage);
        socket.close();
        disposed = true;
      },
    };
  }

  onMount(() => connectSocket());
  onCleanup(() => disconnectSocket());

  return (
    <SocketContext.Provider value={socketState}>
      {props.children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return ctx;
};
