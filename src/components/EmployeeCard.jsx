import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
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
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2 MB.");
      return;
    }

    try {
      setLoading(true);
      setPreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("profile", file);

      const res = await API.put("/users/upload-profile", formData);

      console.log("UPLOAD RESPONSE:", res.data);

      toast.success("Profile photo updated successfully");

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      toast.error(
        err?.response?.data?.message || "Failed to upload profile photo",
      );
    } finally {
      setLoading(false);
      setPreview(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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
