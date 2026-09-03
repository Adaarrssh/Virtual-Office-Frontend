import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import API from "../api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const popupTimeoutRef = useRef(null);
  const activeChatRef = useRef(null);
  const notificationIdsRef = useRef(new Set());

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [popup, setPopup] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [chatToOpen, setChatToOpen] = useState(null);

  const getStorageKey = (userId) => `virtualOfficeUnreadMessages_${userId}`;

  const loadUnreadMessages = useCallback((userId) => {
    try {
      const saved = localStorage.getItem(getStorageKey(userId));

      if (!saved) {
        notificationIdsRef.current = new Set();
        setUnreadMessages({});
        setMessageNotifications([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (parsed?.counts && Array.isArray(parsed?.notifications)) {
        const uniqueNotifications = [];
        const seenIds = new Set();

        parsed.notifications.forEach((notification) => {
          const notificationId = String(notification?.id || "");

          if (!notificationId) return;

          if (seenIds.has(notificationId)) return;

          seenIds.add(notificationId);
          uniqueNotifications.push(notification);
        });

        notificationIdsRef.current = seenIds;

        setUnreadMessages(parsed.counts);
        setMessageNotifications(uniqueNotifications);
      } else {
        notificationIdsRef.current = new Set();
        setUnreadMessages({});
        setMessageNotifications([]);
      }
    } catch (err) {
      console.error("Unread messages load error:", err);

      notificationIdsRef.current = new Set();
      setUnreadMessages({});
      setMessageNotifications([]);
    }
  }, []);

  const saveUnreadMessages = useCallback((userId, counts, notifications) => {
    try {
      localStorage.setItem(
        getStorageKey(userId),
        JSON.stringify({
          counts,
          notifications,
        }),
      );
    } catch (err) {
      console.error("Unread messages save error:", err);
    }
  }, []);

  const markChatAsRead = useCallback(
    (userId) => {
      if (!userId) return;

      const currentUser = JSON.parse(localStorage.getItem("user"));

      const currentUserId = currentUser?._id;

      if (!currentUserId) return;

      const id = String(userId);

      setUnreadMessages((prevCounts) => {
        if (!prevCounts[id]) return prevCounts;

        const updatedCounts = { ...prevCounts };
        delete updatedCounts[id];

        setMessageNotifications((prevNotifications) => {
          const updatedNotifications = prevNotifications.filter(
            (notification) => {
              const senderId = String(notification?.senderId || "");

              if (senderId === id) {
                notificationIdsRef.current.delete(
                  String(notification?.id || ""),
                );

                return false;
              }

              return true;
            },
          );

          saveUnreadMessages(
            currentUserId,
            updatedCounts,
            updatedNotifications,
          );

          return updatedNotifications;
        });

        return updatedCounts;
      });
    },
    [saveUnreadMessages],
  );

  const setActiveChat = useCallback(
    (userId) => {
      activeChatRef.current = userId ? String(userId) : null;

      if (userId) {
        markChatAsRead(String(userId));
      }
    },
    [markChatAsRead],
  );

  const openChat = useCallback((userId) => {
    if (!userId) return;

    setChatToOpen(String(userId));
  }, []);

  const clearChatToOpen = useCallback(() => {
    setChatToOpen(null);
  }, []);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?._id) {
      return null;
    }

    loadUnreadMessages(user._id);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const SOCKET_URL = API.defaults.baseURL.replace(/\/api\/?$/, "");

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
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
      setOnlineUsers(users);
    });

    newSocket.on("receiveMessage", (msg) => {
      const senderId =
        typeof msg?.sender === "object" ? msg.sender?._id : msg?.sender;

      const receiverId =
        typeof msg?.receiver === "object" ? msg.receiver?._id : msg?.receiver;

      if (!senderId || !user?._id) {
        return;
      }

      const sender = String(senderId);
      const currentUserId = String(user._id);

      if (sender === currentUserId) {
        return;
      }

      if (receiverId && String(receiverId) !== currentUserId) {
        return;
      }

      if (activeChatRef.current === sender) {
        return;
      }

      const messageId = String(msg?._id || "");

      if (!messageId) {
        return;
      }

      if (notificationIdsRef.current.has(messageId)) {
        console.log("⚠️ Duplicate notification ignored:", messageId);

        return;
      }

      notificationIdsRef.current.add(messageId);

      const notification = {
        id: messageId,
        senderId: sender,
        senderName:
          typeof msg?.sender === "object"
            ? msg.sender?.name || "Unknown User"
            : "New Message",
        senderProfileUrl:
          typeof msg?.sender === "object" ? msg.sender?.profileUrl || "" : "",
        message: msg?.message || "",
        timestamp: msg?.createdAt || new Date().toISOString(),
      };

      setUnreadMessages((prevCounts) => {
        const updatedCounts = {
          ...prevCounts,
          [sender]: (prevCounts[sender] || 0) + 1,
        };

        setMessageNotifications((prevNotifications) => {
          const alreadyExists = prevNotifications.some(
            (item) => String(item?.id) === messageId,
          );

          if (alreadyExists) {
            return prevNotifications;
          }

          const updatedNotifications = [
            notification,
            ...prevNotifications,
          ].slice(0, 50);

          saveUnreadMessages(
            currentUserId,
            updatedCounts,
            updatedNotifications,
          );

          return updatedNotifications;
        });

        return updatedCounts;
      });
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
  }, [loadUnreadMessages, saveUnreadMessages]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    activeChatRef.current = null;
    notificationIdsRef.current = new Set();

    setSocket(null);
    setOnlineUsers([]);
    setPopup(null);
    setUnreadMessages({});
    setMessageNotifications([]);
    setChatToOpen(null);
  }, []);

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
  }, [connectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        popup,

        unreadMessages,
        messageNotifications,

        connectSocket,
        disconnectSocket,

        markChatAsRead,
        setActiveChat,

        chatToOpen,
        openChat,
        clearChatToOpen,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
