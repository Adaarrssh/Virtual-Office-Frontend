import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import EmployeeCard from "./EmployeeCard";
import TasksPanel from "./TasksPanel";
import MeetingsPanel from "./MeetingsPanel";
import TeamsPanel from "./TeamsPanel";
import "../styles/dashboard.css";

// ✅ Accept the onLogout prop from App.js
const EmployeeDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("Home");

  const employeeData = {
    name: "Adarsh",
    email: "adarsh@badmashi.com",
    title: "Software Engineer",
    joined: 2025,
    status: "active",
    profileUrl: "https://i.pravatar.cc/100?img=3",
  };

  return (
    <div className="dashboard">
      <Sidebar
        onSelect={setActiveSection}
        activeSection={activeSection}
        role="employee"
      />
      <div className="main">
        {/* ✅ Pass the onLogout prop down to the Header */}
        <Header
          user={employeeData}
          onSelect={setActiveSection}
          onLogout={onLogout}
        />

        {activeSection === "Home" && (
          <>
            <div className="card">
              <EmployeeCard employee={employeeData} />
            </div>
            <div className="panel">
              <TasksPanel role="employee" limit />
            </div>
            <div className="panel">
              <MeetingsPanel limit />
            </div>
            <div className="panel">
              <TeamsPanel showActions={false} limit />
            </div>
          </>
        )}

        {activeSection === "Profile" && (
          <div className="card">
            <EmployeeCard employee={employeeData} />
          </div>
        )}

        {activeSection === "Tasks" && (
          <div className="panel">
            <TasksPanel role="employee" />
          </div>
        )}

        {activeSection === "Meetings" && (
          <div className="panel">
            <MeetingsPanel />
          </div>
        )}

        {activeSection === "Team" && (
          <div className="panel">
            <TeamsPanel showActions />
          </div>
        )}

        {activeSection === "Settings" && (
          <div className="panel">
            <h3>Settings Page (Coming Soon)</h3>
          </div>
        )}

        {activeSection === "VirtualMap" && (
          <div className="virtual-map-container">
            <div className="virtual-map-header">
              <button
                className="back-button"
                onClick={() => setActiveSection("Home")}
              >
                ← Back to Dashboard
              </button>
            </div>
            <iframe
              src={process.env.PUBLIC_URL + "/office.space/index.html"}
              title="Virtual Map"
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
