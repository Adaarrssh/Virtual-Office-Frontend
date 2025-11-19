import React, { useState, useEffect } from "react";

import EmployeeDashboard from "./components/EmployeeDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import LoginPage from "./components/LoginPage"; // 1. LoginPage import kiya

function App() {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("selectedRole") || null;
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem("selectedRole", role);
    } else {
      localStorage.removeItem("selectedRole");
    }
  }, [role]);

  const handleSuccessfulLogin = (userRole) => {
    setRole(userRole);
  };

  const handleLogout = () => setRole(null);

  return (
    <div className="App">
      {role ? (
        role === "employee" ? (
          <EmployeeDashboard onLogout={handleLogout} />
        ) : (
          <ManagerDashboard onLogout={handleLogout} />
        )
      ) : (
        <LoginPage onSuccessfulLogin={handleSuccessfulLogin} />
      )}
    </div>
  );
}

export default App;
