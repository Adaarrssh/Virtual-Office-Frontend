import React from "react";

const EmployeeCard = ({ employee }) => {
  const statusClass =
    employee.status === "active" ? "status-active" : "status-offline";

  return (
    <div className="employee-card">
      <img src={employee.profileUrl} alt="Profile" className="profile-pic" />
      <h3 className="employee-name">{employee.name}</h3>
      <p className="employee-title">{employee.title}</p>
      <p className="employee-email">{employee.email}</p>

      <div className="status-row">
        <span className={`status-dot ${statusClass}`}></span>
        <span className="status-label">{employee.status}</span>
      </div>

      <p className="joined-info">Joined: {employee.joined}</p>
    </div>
  );
};

export default EmployeeCard;
