import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [token]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
