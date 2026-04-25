import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";

import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import LoginPage from "./components/LoginPage";
import JitsiMeetPage from "./components/JitsiMeetPage";
import "./styles/meeting.css";

function App() {
  const [role, setRole] = useState(null);
  const [popup, setPopup] = useState(null);

  const socketRef = useRef(null);

  const initSocket = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io("http://localhost:5000", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("meetingCreated", (data) => {
      setPopup(data);

      setTimeout(() => {
        setPopup(null);
      }, 4000);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.role) {
      setRole(user.role);
      initSocket();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleSuccessfulLogin = (userRole) => {
    setRole(userRole);
    initSocket();
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;
