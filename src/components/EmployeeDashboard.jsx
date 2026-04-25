import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import EmployeeCard from "./EmployeeCard";
import TasksPanel from "./TasksPanel";
import MeetingsPanel from "./MeetingsPanel";
import TeamsPanel from "./TeamsPanel";
import "../styles/dashboard.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const EmployeeDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState(
    localStorage.getItem("activeSection") || "Home",
  );

  const [employeeData, setEmployeeData] = useState(null);
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

      setEmployeeData(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("User fetch error:", err);
      setEmployeeData({});
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

  if (!employeeData) {
    return <div className="dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar
        onSelect={setActiveSection}
        activeSection={activeSection}
        role="employee"
      />

      <div className="main">
        <Header
          user={employeeData}
          onSelect={setActiveSection}
          onLogout={onLogout}
        />

        {activeSection === "Home" && (
          <>
            <div className="card">
              <EmployeeCard
                employee={employeeData}
                isSelf={true}
                refreshUser={fetchUser}
              />
            </div>

            <div className="panel">
              <TasksPanel role="employee" limit />
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
              employee={employeeData}
              isSelf={true}
              refreshUser={fetchUser}
            />
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
            <TeamsPanel />
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
