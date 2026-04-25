import React, { useState } from "react";
import {
  LogIn,
  User,
  Lock,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";
import API from "../api";

const LoginPage = ({ onSuccessfulLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Email aur password dono zaroori hain.");
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
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.role) {
        onSuccessfulLogin(data.user.role);
      } else {
        setError("User role missing");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err?.response?.data?.message || "Server error. Please try again.",
      );
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
      </div>
    </div>
  );
};

export default LoginPage;
