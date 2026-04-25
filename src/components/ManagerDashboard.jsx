import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import EmployeeCard from "./EmployeeCard";
import TasksPanel from "./TasksPanel";
import MeetingsPanel from "./MeetingsPanel";
import TeamsPanel from "./TeamsPanel";
import ReportsPanel from "./ReportsPanel";
import CreateEmployeePanel from "./CreateEmployeePanel";
import "../styles/dashboard.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ManagerDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState(
    localStorage.getItem("activeSection") || "Home",
  );

  const [managerData, setManagerData] = useState(null);
  const token = localStorage.getItem("token");

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();

      setManagerData(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("User fetch error:", err);
      setManagerData({});
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [fetchUser, token]);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  if (!managerData) {
    return <div className="dashboard">Loading...</div>;
  }

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
              <EmployeeCard
                employee={managerData}
                isSelf={true}
                refreshUser={fetchUser}
              />
            </div>

            <div className="panel">
              <CreateEmployeePanel />
            </div>

            <div className="panel">
              <TasksPanel role="manager" limit />
            </div>

            <div className="panel">
              <MeetingsPanel limit />
            </div>

            <div className="panel">
              <TeamsPanel limit />
            </div>
          </>
        )}

        {activeSection === "Profile" && (
          <div className="card">
            <EmployeeCard
              employee={managerData}
              isSelf={true}
              refreshUser={fetchUser}
            />
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
            <TeamsPanel />
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
