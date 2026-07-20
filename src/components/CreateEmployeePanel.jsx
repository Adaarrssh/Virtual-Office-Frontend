import React, { useState } from "react";
import API from "../api";
import { toast } from "react-hot-toast";
const CreateEmployeePanel = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !password.trim()) {
      const msg = "Please fill in all fields.";
      setMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/users/create-employee", {
        name: name.trim(),
        password,
      });

      const data = res.data;

      setMessage(`Employee created successfully.\nEmail: ${data.email}`);
      toast.success("Employee created successfully");
      setName("");
      setPassword("");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Server error while creating employee";

      setMessage(msg);
      toast.error(msg);
    }

    setLoading(false);
  };

  return (
    <div className="panel">
      <h3>Create Employee</h3>

      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Employee Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.toLowerCase().includes("successfully")
              ? "#16a34a"
              : "#dc2626",
            whiteSpace: "pre-line",
            fontWeight: "500",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default CreateEmployeePanel;
