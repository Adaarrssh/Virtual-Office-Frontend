import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-hot-toast";
import {
  LogIn,
  User,
  Lock,
  BriefcaseBusiness,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import API from "../api";
import "../styles/login.css";

const LoginPage = ({ onSuccessfulLogin }) => {
  const { connectSocket } = useSocket();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      const message = "Email and password are required.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await API.post("/auth/login", {
        email: username,
        password: password,
      });

      const data = res.data;

      if (!data?.token || !data?.user) {
        setError("Invalid login response from server");
        toast.error("Invalid server response");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      connectSocket();
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user?.role) {
        onSuccessfulLogin(data.user.role);
      } else {
        setError("User role missing");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const message =
        err?.response?.data?.message || "Server error. Please try again.";

      setError(message);
      toast.error(message);
    }

    setIsSubmitting(false);
  };

  const accentColor = username.toLowerCase().includes("manager")
    ? "#4f46e5"
    : "#10b981";

  const buttonClass = username.toLowerCase().includes("manager")
    ? "btn-manager"
    : "btn-employee";

  return (
    <div className="login-container">
      <div className="login-card" style={{ "--accent-color": accentColor }}>
        <button
          type="button"
          onClick={() => setShowDemo(true)}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            border: "none",
            background: "#eef2ff",
            color: "#4f46e5",
            padding: "8px 12px",
            borderRadius: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          }}
        >
          <>
            <Info size={16} />
            <span
              style={{ marginLeft: "6px", fontSize: "13px", fontWeight: "600" }}
            >
              Demo Login
            </span>
          </>
        </button>
        <BriefcaseBusiness className="icon-main animate-bounce-slow" />

        <h1 className="title">Office Portal Access</h1>

        <p className="subtitle">
          Securely log in to your Virtual Office Platform account.
        </p>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="input-wrapper">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Company Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="error-message animate-fadeIn">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={`submit-btn ${buttonClass}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <LogIn className="btn-icon" />
            )}
            {isSubmitting ? "Verifying..." : "Secure Sign In"}
          </button>
        </form>

        <p className="tip-text">
          <strong>Tip:</strong> Use your company email and password.
        </p>
        {showDemo && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: "360px",
                background: "#fff",
                borderRadius: "14px",
                padding: "22px",
                position: "relative",
                boxShadow: "0 10px 35px rgba(0,0,0,.25)",
              }}
            >
              <button
                onClick={() => setShowDemo(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

              <h3
                style={{
                  marginBottom: "15px",
                  color: "#4f46e5",
                }}
              >
                Demo Credentials
              </h3>

              <div
                style={{
                  background: "#eef2ff",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                <strong>👔 Manager</strong>

                <p style={{ margin: "8px 0 4px" }}>
                  Email: <b>savya@company.com</b>
                </p>

                <p>
                  Password: <b>123456</b>
                </p>
              </div>

              <div
                style={{
                  background: "#ecfdf5",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                <strong>👨‍💻 Employee</strong>

                <p style={{ margin: "8px 0 4px" }}>
                  Email: <b>raj246@company.com</b>
                </p>

                <p>
                  Password: <b>123443</b>
                </p>
              </div>

              <p
                style={{
                  marginTop: "16px",
                  fontSize: "13px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                These credentials are provided for evaluation purposes only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
