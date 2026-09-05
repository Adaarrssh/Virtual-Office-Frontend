import React, { useState, useEffect, useCallback } from "react";
import API from "../api";
import "../styles/dashboard.css";

const ReportsPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const [tasksRes, teamRes, meetingsRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/users/team"),
        API.get("/meetings"),
      ]);

      const taskData = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : tasksRes.data?.tasks || [];

      const teamData = Array.isArray(teamRes.data)
        ? teamRes.data
        : teamRes.data?.users ||
          teamRes.data?.team ||
          teamRes.data?.employees ||
          [];

      const meetingData = Array.isArray(meetingsRes.data)
        ? meetingsRes.data
        : meetingsRes.data?.meetings || [];

      setTasks(taskData);
      setEmployees(teamData);
      setMeetings(meetingData);
    } catch (error) {
      console.error("Reports fetch error:", error);
      setTasks([]);
      setEmployees([]);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Create report for EVERY employee
  const teamMap = employees.reduce((acc, employee) => {
    const employeeId = String(employee._id);

    acc[employeeId] = {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      tasks: [],
      completed: 0,
      inProgress: 0,
      notCompleted: 0,
    };

    return acc;
  }, {});

  // Add tasks to their respective employees
  tasks.forEach((task) => {
    const employeeId =
      task.assignedTo?._id || task.assignedTo?.id || task.assignedTo;

    if (!employeeId) return;

    const id = String(employeeId);

    if (!teamMap[id]) return;

    teamMap[id].tasks.push(task);

    if (task.status === "Completed") {
      teamMap[id].completed++;
    } else if (task.status === "In Progress") {
      teamMap[id].inProgress++;
    } else {
      teamMap[id].notCompleted++;
    }
  });

  const employeeReports = Object.values(teamMap);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const notCompletedTasks = tasks.filter(
    (task) => task.status !== "Completed" && task.status !== "In Progress",
  ).length;

  const completionPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.time) >= new Date(),
  ).length;

  const attentionEmployees = employeeReports.filter((employee) => {
    const total = employee.tasks.length;

    if (!total) return false;

    const completion = (employee.completed / total) * 100;

    return completion < 50 || employee.notCompleted >= 2;
  });

  if (loading) {
    return (
      <div className="reports-panel">
        <h2>Reports</h2>
        <p>Loading reports...</p>
      </div>
    );
  }

  // Employee detailed report
  if (selectedEmployee) {
    const employee = employeeReports.find(
      (item) => String(item.id || item.name) === String(selectedEmployee),
    );

    if (!employee) {
      return (
        <div className="reports-panel">
          <button
            className="back-button"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back to Reports
          </button>

          <p>Employee report not found.</p>
        </div>
      );
    }

    const total = employee.tasks.length;

    const percent = total ? Math.round((employee.completed / total) * 100) : 0;

    return (
      <div className="reports-panel">
        <button
          className="back-button"
          onClick={() => setSelectedEmployee(null)}
        >
          ← Back to Reports
        </button>

        <h2>{employee.name} - Task Details</h2>

        <div className="report-summary-grid">
          <div className="summary-card">
            <h4>Total Tasks</h4>
            <strong>{total}</strong>
          </div>

          <div className="summary-card">
            <h4>Completed</h4>
            <strong>{employee.completed}</strong>
          </div>

          <div className="summary-card">
            <h4>In Progress</h4>
            <strong>{employee.inProgress}</strong>
          </div>

          <div className="summary-card">
            <h4>Pending</h4>
            <strong>{employee.notCompleted}</strong>
          </div>

          <div className="summary-card">
            <h4>Completion</h4>
            <strong>{percent}%</strong>
          </div>
        </div>

        <ul className="breakdown-list">
          {employee.tasks.length === 0 && (
            <li className="task-item">No tasks assigned.</li>
          )}

          {employee.tasks.map((task) => (
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

              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                }}
              >
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
      <h2>Team Reports</h2>

      {/* TEAM OVERVIEW */}

      <h3>Team Overview</h3>

      <div className="report-summary-grid">
        <div className="summary-card">
          <h4>Employees</h4>
          <strong>{employees.length}</strong>
        </div>

        <div className="summary-card">
          <h4>Total Tasks</h4>
          <strong>{totalTasks}</strong>
        </div>

        <div className="summary-card">
          <h4>Completed</h4>
          <strong>{completedTasks}</strong>
        </div>

        <div className="summary-card">
          <h4>In Progress</h4>
          <strong>{inProgressTasks}</strong>
        </div>

        <div className="summary-card">
          <h4>Pending</h4>
          <strong>{notCompletedTasks}</strong>
        </div>

        <div className="summary-card">
          <h4>Completion</h4>
          <strong>{completionPercent}%</strong>
        </div>
      </div>

      {/* MEETINGS */}

      <h3>Meetings Summary</h3>

      <div className="report-summary-grid">
        <div className="summary-card">
          <h4>Total Meetings</h4>
          <strong>{meetings.length}</strong>
        </div>

        <div className="summary-card">
          <h4>Upcoming Meetings</h4>
          <strong>{upcomingMeetings}</strong>
        </div>

        <div className="summary-card">
          <h4>Past Meetings</h4>
          <strong>{meetings.length - upcomingMeetings}</strong>
        </div>
      </div>

      {/* EMPLOYEE PERFORMANCE */}

      <h3>Employee Performance</h3>

      <div className="team-performance-grid">
        {employeeReports.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          employeeReports.map((employee) => {
            const total = employee.tasks.length;

            const percent = total
              ? Math.round((employee.completed / total) * 100)
              : 0;

            return (
              <div
                key={employee.id}
                className="report-card"
                onClick={() => setSelectedEmployee(employee.id)}
              >
                <h3>{employee.name}</h3>

                <small>{employee.email}</small>

                <div className="progress-bar-container">
                  <div
                    className="completed-bar"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>

                <p>
                  <strong>{percent}%</strong> Completion
                </p>

                <div className="report-metrics">
                  <span style={{ color: "green" }}>
                    Completed: {employee.completed}
                  </span>

                  <span style={{ color: "orange" }}>
                    In Progress: {employee.inProgress}
                  </span>

                  <span style={{ color: "red" }}>
                    Pending: {employee.notCompleted}
                  </span>

                  <span>Total Tasks: {total}</span>
                </div>

                {total === 0 && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    No tasks assigned
                  </p>
                )}

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedEmployee(employee.id);
                  }}
                >
                  View Tasks
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ATTENTION REQUIRED */}

      <h3>Attention Required</h3>

      <div className="attention-section">
        {attentionEmployees.length === 0 ? (
          <p>✅ No employees currently require attention.</p>
        ) : (
          attentionEmployees.map((employee) => (
            <div key={employee.id} className="attention-card">
              <strong>{employee.name}</strong>

              <span>{employee.notCompleted} pending task(s)</span>

              <button onClick={() => setSelectedEmployee(employee.id)}>
                View Tasks
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsPanel;
