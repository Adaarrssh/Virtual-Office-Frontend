import React, { useState, useEffect } from "react";
import "../styles/meeting.css";

const API = process.env.REACT_APP_API_URL;

const MeetingsPanel = () => {
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    time: "",
    inviteType: "selected",
    selectedUsers: [],
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${API}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMeetings(Array.isArray(data) ? data : []);
      } catch {
        setMeetings([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/api/users/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch {
        setEmployees([]);
      }
    };

    fetchMeetings();
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          time: formData.time,
        }),
      });

      const newMeeting = await res.json();

      setMeetings((prev) => [newMeeting, ...prev]);

      setFormData({
        title: "",
        time: "",
        inviteType: "selected",
        selectedUsers: [],
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/meetings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setMeetings((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatus = (time) => {
    const now = new Date();
    const start = new Date(time);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    if (now >= new Date(start.getTime() - 2 * 60 * 1000) && now <= end) {
      return "live";
    }

    if (now > end) return "completed";

    return "upcoming";
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Meetings</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          +
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Meeting Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <input
            type="datetime-local"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />

          {user.role === "manager" && (
            <select
              value={formData.inviteType}
              onChange={(e) =>
                setFormData({ ...formData, inviteType: e.target.value })
              }
            >
              <option value="selected">Select Users</option>
              <option value="all">Invite All</option>
            </select>
          )}

          {formData.inviteType === "selected" && (
            <select
              multiple
              value={formData.selectedUsers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  selectedUsers: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value,
                  ),
                })
              }
            >
              {employees
                .filter((u) => u._id !== user._id)
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
            </select>
          )}

          <button className="create-btn">Create Meeting</button>
        </form>
      )}

      {meetings.length === 0 && <p>No meetings scheduled</p>}

      {meetings.map((m) => {
        const status = getStatus(m.time);

        return (
          <div key={m._id} className="card">
            <div className="card-left">
              <strong>{m.title}</strong>

              <p>
                {new Date(m.time).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              <span className={`status ${status}`}>{status}</span>
            </div>

            <div className="card-actions">
              <button
                className={`join-btn ${
                  status === "completed" ? "disabled" : ""
                }`}
                disabled={status === "completed"}
                onClick={() => window.open(m.meetingLink, "_blank")}
              >
                Join
              </button>

              {m.createdBy === user._id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MeetingsPanel;
