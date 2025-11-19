import React, { useState } from "react";
import "../styles/dashboard.css";
import allTasks from "../data/tasks.js";
import allEmployees from "../data/employee.js";

const ReportsPanel = () => {
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(null);

  // Calculate team performance based on the centralized task data
  const teamPerformanceMap = allEmployees.reduce((acc, employee) => {
    const employeeTasks = allTasks.filter(
      (task) => task.assignee === employee.name
    );
    const completedTasks = employeeTasks.filter(
      (task) => task.status === "Completed"
    ).length;
    const pendingTasks = employeeTasks.filter(
      (task) => task.status === "Pending"
    ).length;
    const inProgressTasks = employeeTasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    acc[employee.name] = {
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
    };
    return acc;
  }, {});

  const handleEmployeeClick = (employeeName) => {
    setSelectedEmployeeName(employeeName);
  };

  const handleBackClick = () => {
    setSelectedEmployeeName(null);
  };

  if (selectedEmployeeName) {
    const employeeTasks = allTasks.filter(
      (task) => task.assignee === selectedEmployeeName
    );
    const completedTasks = employeeTasks.filter(
      (task) => task.status === "Completed"
    );
    const pendingTasks = employeeTasks.filter(
      (task) => task.status === "Pending"
    );
    const inProgressTasks = employeeTasks.filter(
      (task) => task.status === "In Progress"
    );

    return (
      <div className="reports-panel">
        <button className="back-button" onClick={handleBackClick}>
          &larr; Back to Reports
        </button>
        <h2 className="report-detail-heading">
          Task Breakdown for {selectedEmployeeName}
        </h2>

        <div className="task-breakdown-container">
          <div className="breakdown-section completed-tasks">
            <h3>Completed Tasks ({completedTasks.length})</h3>
            <ul className="breakdown-list">
              {completedTasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>

          <div className="breakdown-section in-progress-tasks">
            <h3>In Progress Tasks ({inProgressTasks.length})</h3>
            <ul className="breakdown-list">
              {inProgressTasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>

          <div className="breakdown-section pending-tasks">
            <h3>Pending Tasks ({pendingTasks.length})</h3>
            <ul className="breakdown-list">
              {pendingTasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-panel">
      <h2>Team Performance Reports</h2>
      <div className="team-performance-grid">
        {Object.keys(teamPerformanceMap).map((name) => {
          const totalTasks =
            teamPerformanceMap[name].completed +
            teamPerformanceMap[name].pending +
            teamPerformanceMap[name].inProgress;
          const completedPercentage =
            totalTasks > 0
              ? (teamPerformanceMap[name].completed / totalTasks) * 100
              : 0;

          return (
            <div
              key={name}
              className="report-card"
              onClick={() => handleEmployeeClick(name)}
            >
              <h3>{name}</h3>
              <div className="progress-bar-container">
                <div
                  className="completed-bar"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
              <div className="report-metrics">
                <span className="metric-item">
                  <strong>Completed:</strong>{" "}
                  {teamPerformanceMap[name].completed}
                </span>
                <span className="metric-item">
                  <strong>Pending:</strong> {teamPerformanceMap[name].pending}
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
