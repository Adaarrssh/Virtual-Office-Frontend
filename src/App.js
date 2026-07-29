import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import LoginPage from "./components/LoginPage";
import JitsiMeetPage from "./components/JitsiMeetPage";
import { SocketProvider, useSocket } from "./context/SocketContext";
import "./styles/meeting.css";

function AppContent() {
  const [role, setRole] = useState(null);
  const { popup } = useSocket();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (token && user?.role) {
        setRole(user.role);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("App initialization error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setRole(null);
    }
  }, []);

  const handleSuccessfulLogin = (userRole) => {
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeSection");

    setRole(null);

    toast.success("Logged out successfully");
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 2500,
          style: {
            background: "#fff",
            color: "#111827",
            borderRadius: "10px",
            fontSize: "14px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#16a34a",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#fff",
            },
          },
        }}
      />

      {popup && (
        <div className="global-popup">📢 New Meeting: {popup.title}</div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            role ? (
              role === "employee" ? (
                <EmployeeDashboard onLogout={handleLogout} />
              ) : (
                <ManagerDashboard onLogout={handleLogout} />
              )
            ) : (
              <LoginPage onSuccessfulLogin={handleSuccessfulLogin} />
            )
          }
        />

        <Route path="/meet/:roomId" element={<JitsiMeetPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <Router>
        <AppContent />
      </Router>
    </SocketProvider>
  );
}
