import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [popup, setPopup] = useState(null);

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
      console.log("✅ Socket Connected:", newSocket.id);
      newSocket.emit("joinRoom", user._id);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("meetingCreated", (data) => {
      setPopup(data);

      setTimeout(() => {
        setPopup(null);
      }, 4000);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      newSocket.off("onlineUsers");
      newSocket.off("meetingCreated");
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
      setPopup(null);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        popup,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
