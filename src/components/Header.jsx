import React from "react";
import { LogOut, Map } from "lucide-react";

const Header = ({ user, onSelect, onLogout }) => {
  if (!user || !user.name) return null;

  const name = user?.name ? user.name : "Loading...";

  // 🔥 FIXED AVATAR (CLOUDINARY SUPPORT)
  const avatar = user.profileUrl
    ? user.profileUrl // ✅ direct cloudinary URL
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=4f46e5&color=fff`;

  return (
    <div className="header">
      <div className="user-info">
        <img
          src={avatar}
          alt="User"
          className="avatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name,
            )}`;
          }}
        />
        <span className="user-name">{name}</span>
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
