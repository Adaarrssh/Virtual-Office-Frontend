import React, { useState } from "react";

const CreateEmployeePanel = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Employee name required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/create-employee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            password,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(`Employee created. Email: ${data.email}`);
        setName("");
        setPassword("");
      } else {
        setMessage(data.message || "Failed to create employee");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while creating employee");
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
        <p style={{ marginTop: "10px", color: "#2563eb" }}>{message}</p>
      )}
    </div>
  );
};

export default CreateEmployeePanel;
