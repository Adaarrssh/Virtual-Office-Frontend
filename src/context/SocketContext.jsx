import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API from "../api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const popupTimeoutRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [popup, setPopup] = useState(null);

  const connectSocket = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?._id) return null;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const SOCKET_URL = API.defaults.baseURL.replace(/\/api\/?$/, "");

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket Connected:", newSocket.id);
      console.log("👤 Current User:", user);
      newSocket.emit("joinRoom", user._id);
    });

    newSocket.on("onlineUsers", (users) => {
      console.log("🟢 ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    newSocket.on("meetingCreated", (data) => {
      setPopup(data);

      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }

      popupTimeoutRef.current = setTimeout(() => {
        setPopup(null);
      }, 4000);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ CONNECT ERROR:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected:", reason);
    });

    return newSocket;
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSocket(null);
    setOnlineUsers([]);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?._id) {
      connectSocket();
    }

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        popup,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
