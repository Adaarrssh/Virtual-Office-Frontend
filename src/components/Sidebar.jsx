import React from "react";

const Sidebar = ({ onSelect, activeSection, role }) => {
  // Define navigation items based on the user's role
  const navItems =
    role === "manager"
      ? ["Home", "Tasks", "Meetings", "Team", "Reports", "Settings"]
      : ["Home", "Profile", "Tasks", "Meetings", "Team", "Settings"];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        {role === "manager" ? "Manager Dashboard" : "Employee Dashboard"}
      </h2>
      <ul className="nav-list">
        {navItems.map((item, index) => (
          <li
            key={index}
            className={`nav-item ${activeSection === item ? "active-nav" : ""}`}
            onClick={() => onSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
