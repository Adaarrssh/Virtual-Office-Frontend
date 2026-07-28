import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "../styles/meeting.css";
import API from "../api";

const MeetingsPanel = () => {
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState(null);
  const [joiningMeetingId, setJoiningMeetingId] = useState(null);
  const [endingMeetingId, setEndingMeetingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    title: "",
    time: "",
    inviteType: "selected",
    selectedUsers: [],
  });

  useEffect(() => {
    fetchMeetings();
    fetchUsers();

    const interval = setInterval(fetchMeetings, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await API.get("/meetings");
      setMeetings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMeetings([]);
      toast.error("Failed to load meetings");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users/team");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    if (!formData.time) {
      toast.error("Meeting time is required");
      return;
    }

    try {
      setCreatingMeeting(true);

      const localTime = new Date(formData.time);

      const res = await API.post("/meetings", {
        ...formData,
        time: localTime.toISOString(),
      });

      const newMeeting = res.data;

      setMeetings((prev) => [newMeeting, ...prev]);

      setFormData({
        title: "",
        time: "",
        inviteType: "selected",
        selectedUsers: [],
      });

      setShowForm(false);

      toast.success("Meeting created successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingMeetingId(id);

      await API.delete(`/meetings/${id}`);

      setMeetings((prev) => prev.filter((m) => m._id !== id));

      toast.success("Meeting deleted successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Failed to delete meeting");
    } finally {
      setDeletingMeetingId(null);
    }
  };
  const handleEndMeeting = async (id) => {
    try {
      setEndingMeetingId(id);
      await API.patch(`/meetings/${id}/end`);
      await fetchMeetings();
      toast.success("Meeting ended successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Unable to end meeting");
    } finally {
      setEndingMeetingId(null);
    }
  };
  const handleJoinMeeting = async (meeting) => {
    try {
      setJoiningMeetingId(meeting._id);

      window.open(meeting.meetingLink, "_blank");

      toast.success("Joining meeting...");
    } catch (err) {
      console.error(err);

      toast.error("Unable to join meeting");
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const getStatus = (time) => {
    const now = new Date();

    const start = new Date(time);

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    if (now >= end) {
      return "completed";
    }

    if (now >= start) {
      return "live";
    }

    return "upcoming";
  };
  const canJoinMeeting = (meetingTime) => {
    const now = new Date();

    const start = new Date(meetingTime);

    const joinTime = new Date(start.getTime() - 2 * 60 * 1000);

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return now >= joinTime && now <= end;
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Meetings</h2>

        <button
          type="button"
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕" : "+"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Meeting Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            required
          />

          <input
            type="datetime-local"
            value={formData.time}
            onChange={(e) =>
              setFormData({
                ...formData,
                time: e.target.value,
              })
            }
            required
          />

          {user.role === "manager" && (
            <select
              value={formData.inviteType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inviteType: e.target.value,
                })
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

          <button
            type="submit"
            className="create-btn"
            disabled={creatingMeeting}
          >
            {creatingMeeting ? "Creating..." : "Create Meeting"}
          </button>
        </form>
      )}

      {meetings.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#6b7280",
          }}
        >
          No meetings scheduled yet.
        </p>
      ) : (
        meetings.map((m) => {
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

                <span
                  className={`status ${
                    m.status === "completed" ? "completed" : status
                  }`}
                >
                  {m.status === "completed" ? "completed" : status}
                </span>
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className={`join-btn ${
                    m.status === "completed" || status === "completed"
                      ? "disabled"
                      : ""
                  }`}
                  disabled={
                    m.status === "completed" ||
                    status === "completed" ||
                    !canJoinMeeting(m.time) ||
                    joiningMeetingId === m._id
                  }
                  onClick={() => handleJoinMeeting(m)}
                >
                  {joiningMeetingId === m._id
                    ? "Joining..."
                    : m.status === "completed" || status === "completed"
                      ? "Ended"
                      : canJoinMeeting(m.time)
                        ? "Join"
                        : "Available 2 min before"}
                </button>

                {m.createdBy === user._id && (
                  <>
                    {m.status !== "completed" && (
                      <button
                        type="button"
                        className="end-btn"
                        disabled={endingMeetingId === m._id}
                        onClick={() => handleEndMeeting(m._id)}
                      >
                        {endingMeetingId === m._id
                          ? "Ending..."
                          : "End Meeting"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-btn"
                      disabled={deletingMeetingId === m._id}
                      onClick={() => handleDelete(m._id)}
                    >
                      {deletingMeetingId === m._id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MeetingsPanel;
