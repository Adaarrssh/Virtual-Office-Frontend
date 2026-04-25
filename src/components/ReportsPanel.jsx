import React, { useState, useEffect, useCallback } from "react";
import "../styles/dashboard.css";

const ReportsPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(fetchTasks, 3000);

    return () => clearInterval(interval);
  }, [fetchTasks]);

  const teamMap = tasks.reduce((acc, task) => {
    const name = task.assignedTo?.name || "Unknown";

    if (!acc[name]) {
      acc[name] = {
        tasks: [],
        completed: 0,
        inProgress: 0,
        notCompleted: 0,
      };
    }

    acc[name].tasks.push(task);

    if (task.status === "Completed") acc[name].completed++;
    else if (task.status === "In Progress") acc[name].inProgress++;
    else acc[name].notCompleted++;

    return acc;
  }, {});

  if (loading) return <div className="reports-panel">Loading...</div>;

  if (selectedEmployee) {
    const data = teamMap[selectedEmployee];

    return (
      <div className="reports-panel">
        <button
          className="back-button"
          onClick={() => setSelectedEmployee(null)}
        >
          ← Back
        </button>

        <h2>{selectedEmployee} - Tasks</h2>

        <ul className="breakdown-list">
          {data.tasks.map((task) => (
            <li key={task._id} className="task-item">
              <strong>{task.title}</strong>

              <div
                style={{
                  color:
                    task.status === "Completed"
                      ? "green"
                      : task.status === "In Progress"
                        ? "orange"
                        : "red",
                  fontWeight: "bold",
                }}
              >
                {task.status}
              </div>

              <div style={{ fontSize: "12px", color: "#555" }}>
                {task.notes || "No notes"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="reports-panel">
      <h2>Team Performance</h2>

      <div className="team-performance-grid">
        {Object.keys(teamMap).map((name) => {
          const data = teamMap[name];

          const total = data.completed + data.inProgress + data.notCompleted;

          const percent = total ? (data.completed / total) * 100 : 0;

          return (
            <div
              key={name}
              className="report-card"
              onClick={() => setSelectedEmployee(name)}
            >
              <h3>{name}</h3>

              <div className="progress-bar-container">
                <div
                  className="completed-bar"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="report-metrics">
                <span style={{ color: "green" }}>
                  Completed: {data.completed}
                </span>

                <span style={{ color: "orange" }}>
                  In Progress: {data.inProgress}
                </span>

                <span style={{ color: "red" }}>
                  Not Completed: {data.notCompleted}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsPanel;
