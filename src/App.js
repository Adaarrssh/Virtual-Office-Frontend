import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import LoginPage from "./components/LoginPage";
import JitsiMeetPage from "./components/JitsiMeetPage";
import { SocketProvider } from "./context/SocketContext";
import "./styles/meeting.css";

function App() {
  const [role, setRole] = useState(null);
  const [popup, setPopup] = useState(null);

  const socketRef = useRef(null);

  const initSocket = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
    });
    socket.on("connect", () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?._id) {
        socket.emit("joinRoom", user._id);
      }
    });
    socketRef.current = socket;

    socket.on("meetingCreated", (data) => {
      setPopup(data);

      setTimeout(() => {
        setPopup(null);
      }, 4000);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (token && user?.role) {
        setRole(user.role);
        initSocket();
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("App initialization error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setRole(null);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [initSocket]);

  const handleSuccessfulLogin = (userRole) => {
    setRole(userRole);
    initSocket();
  };

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeSection");

    setRole(null);

    toast.success("Logged out successfully");
  };

  return (
    <SocketProvider>
      <Router>
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
      </Router>
    </SocketProvider>
  );
}

export default App;
