import React, { useState } from "react";
import { LogOut, Map, MessageCircle } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const Header = ({ user, onSelect, onLogout }) => {
  const { unreadMessages, messageNotifications, openChat } = useSocket();

  const [showNotifications, setShowNotifications] = useState(false);

  if (!user || !user.name) return null;

  const name = user.name || "Loading...";

  const avatar = user.profileUrl
    ? user.profileUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=4f46e5&color=fff`;

  const unreadCount = Object.values(unreadMessages || {}).reduce(
    (total, count) => total + count,
    0,
  );

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);

    openChat(notification.senderId);
    onSelect("Team");
  };

  return (
    <div className="header">
      <div className="user-info">
        <img
          src={avatar}
          alt="User"
          className="avatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name,
            )}`;
          }}
        />

        <span className="user-name">{name}</span>
      </div>

      <div className="header-actions">
        <div
          style={{
            position: "relative",
          }}
        >
          <button
            className="chat-notification-button"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Messages"
          >
            <MessageCircle size={18} />

            {unreadCount > 0 && (
              <span className="chat-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "320px",
                maxHeight: "380px",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                border: "1px solid #e5e7eb",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "700",
                  fontSize: "15px",
                  color: "#111827",
                }}
              >
                Messages
                {unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#4f46e5",
                    }}
                  >
                    ({unreadCount})
                  </span>
                )}
              </div>

              {messageNotifications?.length > 0 ? (
                messageNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "12px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <img
                      src={
                        notification.senderProfileUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          notification.senderName,
                        )}&background=10b981&color=fff`
                      }
                      alt={notification.senderName}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "#111827",
                          }}
                        >
                          {notification.senderName}
                        </strong>

                        <span
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                          }}
                        >
                          New
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "13px",
                          color: "#4b5563",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notification.message}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "30px 15px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No new messages
                </div>
              )}
            </div>
          )}
        </div>

        <button className="map-button" onClick={() => onSelect("VirtualMap")}>
          <Map size={16} />
          <span>Virtual Map</span>
        </button>

        <button className="logout-button" onClick={onLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
