import React, { useState } from "react";
import {
  LogIn,
  User,
  Lock,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";

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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || !data?.token || !data?.user) {
        setError(data?.message || "Invalid login response from server");
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
    } catch {
      setError("Server error. Please try again.");
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
              placeholder="Company Email (e.g. emp.EMP001@company.com)"
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
          <strong>Tip:</strong> Use your company email and password provided by
          your manager.
        </p>
      </div>

      <style jsx="true">{`
        :root {
          --color-indigo: #4f46e5;
          --color-emerald: #10b981;
          --color-red: #ef4444;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1f2937;
          padding: 16px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
        }

        .login-card {
          --accent-color: #4f46e5;
          max-width: 448px;
          width: 100%;
          background-color: white;
          padding: 48px;
          border-radius: 16px;
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.2),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          text-align: center;
          transition: transform 0.3s ease-in-out;
          border-top: 8px solid var(--accent-color);
        }

        .login-card:hover {
          transform: scale(1.01);
        }

        .icon-main {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          color: var(--color-indigo);
        }

        .title {
          font-size: 30px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-right: 35px;
        }

        .input-wrapper {
          position: relative;
          padding: 11px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px 14px 40px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 16px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-field:focus {
          border-color: var(--color-indigo);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          padding: 12px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 8px;
          font-size: 14px;
          border: 1px solid #fecaca;
        }

        .error-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }

        .submit-btn {
          padding: 16px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 35px;
        }

        .btn-manager {
          background-color: var(--color-indigo);
        }

        .btn-employee {
          background-color: var(--color-emerald);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }

        .tip-text {
          margin-top: 32px;
          font-size: 12px;
          color: #9ca3af;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
