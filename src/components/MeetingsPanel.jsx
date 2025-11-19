import React, { useState } from "react";

const MeetingsPanel = ({ limit = false }) => {
  const [meetings, setMeetings] = useState([
    {
      title: "Sprint Planning",
      time: "2025-08-05 10:00 AM",
      status: "Upcoming",
    },
    { title: "Client Review", time: "2025-08-01 4:00 PM", status: "Completed" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", time: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMeeting = {
      title: formData.title,
      time: formData.time,
      status: "Upcoming",
    };
    setMeetings([newMeeting, ...meetings]);
    setFormData({ title: "", time: "" });
    setShowForm(false);
  };

  const displayMeetings = limit ? meetings.slice(0, 2) : meetings;

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "badge badge-green";
      case "Upcoming":
      default:
        return "badge badge-blue";
    }
  };

  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Meetings</h3>
        {!limit && (
          <button
            onClick={() => setShowForm(!showForm)}
            title={showForm ? "Cancel" : "Create Meeting"}
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2563eb",
              fontWeight: "bold",
            }}
          >
            {showForm ? "×" : "+"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-inline">
          <input
            type="text"
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
          <button type="submit">Add</button>
        </form>
      )}

      <ul className="meeting-list">
        {displayMeetings.map((meeting, i) => (
          <li key={i} className="meeting-item">
            <div>
              <strong>{meeting.title}</strong>
              <br />
              <small>{meeting.time}</small>
            </div>
            <span className={getStatusClass(meeting.status)}>
              {meeting.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingsPanel;
