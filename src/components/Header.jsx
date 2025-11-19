import React from "react";
import { LogOut, Map } from "lucide-react";
const Header = ({ user, onSelect, onLogout }) => {
  return (
    <div className="header">
      <div className="user-info">
        <img src={user.profileUrl} alt="User" className="avatar" />
        <span className="user-name">{user.name}</span>
      </div>
      <div className="header-actions">
        <button className="map-button" onClick={() => onSelect("VirtualMap")}>
          <Map size={16} /> Virtual Map
        </button>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
