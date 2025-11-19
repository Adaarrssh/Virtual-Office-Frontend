import React, { useState } from "react";
import "../styles/chatwindow.css";

const ChatWindow = ({ receiverName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      text: newMessage,
      sender: "Manager",
    };

    if (receiverName === "All Employees") {
      console.log(`Broadcasting to all: ${newMessage}`);
    } else {
      console.log(`Sending message to ${receiverName}: ${newMessage}`);
    }

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleOpen = () => {
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <div className="minimized-chat-window" onClick={handleOpen}>
        <div className="minimized-icon">💬</div>
        <span className="minimized-text">Chat with {receiverName}</span>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="chat-window">
        <div className="chat-header">
          {receiverName === "All Employees" ? (
            <h3>Broadcast to All Employees</h3>
          ) : (
            <h3>Chat with {receiverName}</h3>
          )}
          <div className="header-actions">
            <button onClick={handleMinimize} className="minimize-chat-btn">
              −
            </button>
            <button onClick={onClose} className="close-chat-btn">
              &times;
            </button>
          </div>
        </div>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              Start your conversation.
              {receiverName === "All Employees" && (
                <p>This message will be sent to the entire team.</p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.sender === "Manager" ? "sent" : "received"
                }`}
              >
                {msg.text}
              </div>
            ))
          )}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} className="send-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
