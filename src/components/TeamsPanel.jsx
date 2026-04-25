import React, { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import "../styles/dashboard.css";

const API = "http://localhost:5000";

const TeamsPanel = ({ showActions = true, limit = false }) => {
  const [members, setMembers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API}/api/users/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch team");
        }

        const data = await res.json();
        console.log("TEAM API RESPONSE:", data);

        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Team fetch error:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTeam();
    }
  }, [token]);

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
                </div>
              </div>

              {member._id !== user?._id && (
                <button onClick={() => setChatUser(member)}>Chat</button>
              )}
            </li>
          );
        })}
      </ul>

      {chatUser && (
        <ChatWindow receiver={chatUser} onClose={() => setChatUser(null)} />
      )}
    </div>
  );
};

export default TeamsPanel;
