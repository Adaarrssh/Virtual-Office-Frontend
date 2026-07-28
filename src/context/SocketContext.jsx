import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?._id) return;

    const SOCKET_URL = API.defaults.baseURL.replace("/api", "");

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", user._id);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.off("onlineUsers");
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
