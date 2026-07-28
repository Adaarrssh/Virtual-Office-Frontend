import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import "../styles/chatwindow.css";

const ChatWindow = ({ receiver, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user?._id || !token) return;

    const SOCKET_URL = API.defaults.baseURL.replace("/api", "");

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
      setIsConnected(true);
      socket.emit("joinRoom", user._id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err.message);
      setIsConnected(false);
    });

    socket.on("receiveMessage", (msg) => {
      if (!receiver) return;

      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      const receiverId =
        typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;

      if (
        (senderId === receiver._id && receiverId === user._id) ||
        (senderId === user._id && receiverId === receiver._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.disconnect();
    };
  }, [user?._id, token, receiver]);

  useEffect(() => {
    if (!receiver?._id) return;

    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${receiver._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setMessages([]);
        toast.error("Unable to load chat history");
      }
    };

    fetchHistory();
  }, [receiver?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!socketRef.current || !isConnected) {
      toast.error("Socket is disconnected");
      return;
    }

    try {
      setSending(true);

      socketRef.current.emit("sendMessage", {
        receiver: receiver._id,
        message: newMessage.trim(),
      });

      setNewMessage("");
    } catch (err) {
      console.error(err);

      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  const isReceiverOnline = receiver
    ? onlineUsers.includes(receiver._id)
    : false;
  if (!receiver) return null;

  if (isMinimized) {
    return (
      <div
        className="minimized-chat-window"
        onClick={() => setIsMinimized(false)}
      >
        💬 {receiver.name}
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="chat-window">
        <div className="chat-header">
          <div>
            <h3>{receiver.name}</h3>

            <small
              style={{
                color: isReceiverOnline ? "#16a34a" : "#9ca3af",
                fontWeight: "600",
              }}
            >
              {isReceiverOnline ? "🟢 Online" : "⚪ Offline"}
            </small>
          </div>

          <div>
            <button onClick={() => setIsMinimized(true)}>−</button>

            <button onClick={onClose}>×</button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isMe =
                msg?.sender?._id === user?._id || msg?.sender === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`chat-message ${isMe ? "sent" : "received"}`}
                >
                  {msg.message}
                </div>
              );
            })
          ) : (
            <div
              className="no-messages"
              style={{
                textAlign: "center",
                color: "#6b7280",
                padding: "20px",
              }}
            >
              👋 Start a conversation
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type message..."
            disabled={sending}
          />

          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
