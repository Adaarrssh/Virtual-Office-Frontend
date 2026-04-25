import React, { useRef, useState } from "react";
import API from "../api";

const EmployeeCard = ({ employee, isSelf = false, refreshUser }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!employee) return null;

  const name = employee.name || "User";
  const role = employee.role || "employee";
  const email = employee.email || "";

  const avatar =
    preview ||
    employee.profileUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setPreview(URL.createObjectURL(file));
      setLoading(true);

      const formData = new FormData();
      formData.append("profile", file);

      const res = await API.put("/users/upload-profile", formData);

      console.log("UPLOAD RESPONSE:", res.data);

      setPreview(null);
      setLoading(false);

      alert("Profile updated ✅");

      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setLoading(false);
      setPreview(null);

      alert(err?.response?.data?.message || "Upload failed ❌");
    }
  };

  return (
    <div className="employee-card">
      <img src={avatar} alt={name} className="avatar-large" />

      {isSelf && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <button onClick={() => fileRef.current.click()} disabled={loading}>
            {loading ? "Uploading..." : "Change Photo"}
          </button>
        </>
      )}

      <h2>{name}</h2>
      <p>{role === "manager" ? "Project Manager" : "Employee"}</p>
      <p>{email}</p>
    </div>
  );
};

export default EmployeeCard;
