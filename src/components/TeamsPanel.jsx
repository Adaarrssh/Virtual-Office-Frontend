import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import allEmployees from "../data/employee.js";
import "../styles/dashboard.css";

const TeamsPanel = ({ showActions = true, limit = false, role }) => {
  const displayMembers = limit ? allEmployees.slice(0, 2) : allEmployees;

  const [chatUser, setChatUser] = useState(null);

  const handleBroadcastClick = () => {
    setChatUser("All Employees");
  };

  return (
    <div className="panel">
      <h3>Your Team</h3>
      {role === "manager" && (
        <button onClick={handleBroadcastClick} className="broadcast-button">
          Broadcast to All
        </button>
      )}
      <ul className="team-list">
        {displayMembers.map((member) => (
          <li key={member.id} className="team-item">
            <div className="team-info">
              <img
                src={member.profileUrl}
                alt={`${member.name}'s avatar`}
                className="avatar"
              />
              <div>
                <strong>{member.name}</strong>
                <br />
                <small>{member.email}</small>
              </div>
            </div>
            {showActions && (
              <button onClick={() => setChatUser(member.name)}>Chat</button>
            )}
          </li>
        ))}
      </ul>

      {chatUser && (
        <ChatWindow receiverName={chatUser} onClose={() => setChatUser(null)} />
      )}
    </div>
  );
};

export default TeamsPanel;
