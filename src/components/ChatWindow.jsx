import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { io } from "socket.io-client";
import "../styles/chatwindow.css";

const ChatWindow = ({ receiver, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  // 🔥 GLOBAL SOCKET
  useEffect(() => {
    if (!user?._id || !token) return;

    const socket = io(API.defaults.baseURL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.emit("joinRoom", user._id);

    socket.on("receiveMessage", (msg) => {
      if (
        receiver &&
        (msg.sender?._id === receiver._id || msg.receiver?._id === receiver._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.disconnect();
  }, [user?._id, token, receiver]);

  // 🔥 FETCH HISTORY
  useEffect(() => {
    if (!receiver?._id || !token) return;

    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${receiver._id}`);
        const data = res.data;
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };

    fetchHistory();
  }, [receiver?._id, token]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      receiver: receiver._id,
      message: newMessage.trim(),
    });

    setNewMessage("");
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
          <h3>{receiver.name}</h3>

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
            <div className="no-messages">Start conversation...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
