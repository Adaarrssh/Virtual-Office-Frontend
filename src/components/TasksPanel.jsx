import React, { useState, useEffect, useCallback } from "react";

const TasksPanel = ({ role, limit }) => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [notesMap, setNotesMap] = useState({});

  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "",
  });

  const token = localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setTasks([]);
    }
  }, [token]); // ✅ FIXED (removed role)

  const fetchTeam = useCallback(async () => {
    if (role !== "manager") return;

    try {
      const res = await fetch("http://localhost:5000/api/users/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEmployees(
        Array.isArray(data) ? data.filter((u) => u.role === "employee") : [],
      );
    } catch (err) {
      console.error("Fetch team error:", err);
      setEmployees([]);
    }
  }, [token, role]);

  useEffect(() => {
    fetchTasks();
    fetchTeam();

    const interval = setInterval(fetchTasks, 3000);

    return () => clearInterval(interval);
  }, [fetchTasks, fetchTeam]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title || !newTask.assignedTo) return;

    try {
      await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      setNewTask({ title: "", assignedTo: "" });
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  const updateTask = async (id, status, notes) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      });

      fetchTasks();
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const visibleTasks = limit ? tasks.slice(0, 5) : tasks;

  return (
    <div className="tasks-panel">
      <div className="panel-header">
        <h3 className="panel-title">Tasks</h3>

        {role === "manager" && (
          <button
            className="add-task-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Assign New Task"}
          </button>
        )}
      </div>

      {showForm && role === "manager" && (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />

          <select
            value={newTask.assignedTo}
            onChange={(e) =>
              setNewTask({ ...newTask, assignedTo: e.target.value })
            }
            required
          >
            <option value="">Assign Employee</option>

            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          <button type="submit" className="submit-task-btn">
            Assign
          </button>
        </form>
      )}

      {visibleTasks.length > 0 ? (
        <ul className="tasks-list">
          {visibleTasks.map((task) => (
            <li key={task._id} className="task-item">
              <div className="task-info">
                <span className="task-title">{task.title}</span>

                {role === "manager" && (
                  <span className="task-assignee">
                    Assigned to: {task.assignedTo?.name}
                  </span>
                )}

                {task.notes && (
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Notes: {task.notes}
                  </div>
                )}
              </div>

              {role === "employee" ? (
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTask(task._id, e.target.value, task.notes)
                    }
                  >
                    <option>Not Completed</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>

                  <textarea
                    placeholder="Add notes..."
                    value={notesMap[task._id] ?? task.notes ?? ""}
                    onChange={(e) =>
                      setNotesMap({
                        ...notesMap,
                        [task._id]: e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() =>
                      updateTask(task._id, task.status, notesMap[task._id])
                    }
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <span
                    style={{
                      color: task.status === "Completed" ? "green" : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {task.status}
                  </span>

                  {task.status === "Completed" && (
                    <button onClick={() => deleteTask(task._id)}>Remove</button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-tasks-message">No tasks assigned.</p>
      )}
    </div>
  );
};

export default TasksPanel;
