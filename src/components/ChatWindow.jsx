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

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user?._id || !token) return;

    const socket = io(API.defaults.baseURL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("joinRoom", user._id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
    });

    socket.on("receiveMessage", (msg) => {
      if (
        receiver &&
        (msg.sender?._id === receiver._id || msg.receiver?._id === receiver._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
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
                color: "#16a34a",
                fontWeight: "600",
              }}
            >
              Chat
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
            disabled={!isConnected || sending}
          />

          <button
            onClick={handleSendMessage}
            disabled={!isConnected || sending || !newMessage.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
