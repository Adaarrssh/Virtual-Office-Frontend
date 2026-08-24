import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import ChatWindow from "./ChatWindow";
import "../styles/dashboard.css";
import API from "../api";

const TeamsPanel = ({ showActions = true, limit = false }) => {
  const [members, setMembers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { onlineUsers, chatToOpen, clearChatToOpen, setActiveChat } =
    useSocket();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await API.get("/users/team");
        console.log("TEAM API RESPONSE:", res.data);

        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Team fetch error:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    if (!chatToOpen || members.length === 0) return;

    const member = members.find(
      (item) => String(item._id) === String(chatToOpen),
    );

    if (member) {
      setChatUser(member);
      setActiveChat(member._id);
    }

    clearChatToOpen();
  }, [chatToOpen, members, clearChatToOpen, setActiveChat]);

  const handleOpenChat = (member) => {
    setChatUser(member);
    setActiveChat(member._id);
  };

  const handleCloseChat = () => {
    setChatUser(null);
    setActiveChat(null);
  };

  const displayMembers = limit ? members.slice(0, 2) : members;

  if (loading) {
    return (
      <div className="panel">
        <h3>Your Team</h3>
        <p>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>Your Team</h3>

      <ul className="team-list">
        {displayMembers.length === 0 && <li>No team members found</li>}

        {displayMembers.map((member) => {
          const isManager = member.role === "manager";
          const isOnline = onlineUsers.includes(member._id);

          const avatar = member.profileUrl
            ? member.profileUrl
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                member.name,
              )}&background=${isManager ? "4f46e5" : "10b981"}&color=fff`;

          return (
            <li key={member._id} className="team-item">
              <div className="team-info">
                <img src={avatar} alt={member.name} className="avatar" />

                <div>
                  <strong>
                    {member.name} {isManager && "(Manager)"}
                  </strong>

                  <br />

                  <small>{member.email}</small>

                  <br />

                  <small
                    style={{
                      color: isOnline ? "#16a34a" : "#9ca3af",
                      fontWeight: "600",
                    }}
                  >
                    {isOnline ? "🟢 Online" : "⚪ Offline"}
                  </small>
                </div>
              </div>

              {member._id !== user?._id && (
                <button onClick={() => handleOpenChat(member)}>Chat</button>
              )}
            </li>
          );
        })}
      </ul>

      {chatUser && <ChatWindow receiver={chatUser} onClose={handleCloseChat} />}
    </div>
  );
};

export default TeamsPanel;
