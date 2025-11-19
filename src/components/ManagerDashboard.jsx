import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import EmployeeCard from "./EmployeeCard";
import TasksPanel from "./TasksPanel";
import MeetingsPanel from "./MeetingsPanel";
import TeamsPanel from "./TeamsPanel";
import ReportsPanel from "./ReportsPanel";
import "../styles/dashboard.css";

const ManagerDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("Home");

  const managerData = {
    name: "Manager John",
    email: "manager@company.com",
    title: "Project Manager",
    joined: 2023,
    status: "active",
    profileUrl: "https://i.pravatar.cc/100?img=5",
  };

  const currentUserRole = "manager";

  return (
    <div className="dashboard">
      <Sidebar
        onSelect={setActiveSection}
        activeSection={activeSection}
        role="manager"
      />

      <div className="main">
        <Header
          user={managerData}
          onSelect={setActiveSection}
          onLogout={onLogout}
        />

        {activeSection === "Home" && (
          <>
            <div className="card">
              <EmployeeCard employee={managerData} />
            </div>
            <div className="panel">
              <TasksPanel role="manager" limit />
            </div>
            <div className="panel">
              <MeetingsPanel limit />
            </div>
            <div className="panel">
              {/* ✅ Corrected: Add the 'role' prop here for the home view */}
              <TeamsPanel role={currentUserRole} showActions limit />
            </div>
          </>
        )}

        {activeSection === "Profile" && (
          <div className="card">
            <EmployeeCard employee={managerData} />
          </div>
        )}

        {activeSection === "Tasks" && (
          <div className="panel">
            <TasksPanel role="manager" />
          </div>
        )}

        {activeSection === "Meetings" && (
          <div className="panel">
            <MeetingsPanel />
          </div>
        )}

        {activeSection === "Team" && (
          <div className="panel">
            {/* ✅ Corrected: Add the 'role' prop here for the full team view */}
            <TeamsPanel role={currentUserRole} showActions />
          </div>
        )}

        {activeSection === "Reports" && (
          <div className="panel">
            <ReportsPanel />
          </div>
        )}

        {activeSection === "Settings" && (
          <div className="panel">
            <h3>Manager Settings Page (Coming Soon)</h3>
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

export default ManagerDashboard;
