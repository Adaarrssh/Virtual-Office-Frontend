import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

const TasksPanel = ({ role, limit }) => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setTasks([]);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    if (role !== "manager") return;

    try {
      const res = await API.get("/users/team");

      // console.log("TEAM API RESPONSE:", res.data);

      const filtered = Array.isArray(res.data)
        ? res.data.filter((u) => u.role === "employee")
        : [];

      // console.log("EMPLOYEES:", filtered);

      setEmployees(filtered);
    } catch (err) {
      console.error("Fetch team error:", err);
      setEmployees([]);
    }
  }, [role]);

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
      await API.post("/tasks", newTask);

      setNewTask({
        title: "",
        assignedTo: "",
      });

      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  const updateTask = async (id, status, notes) => {
    try {
      await API.patch(`/tasks/${id}`, {
        status,
        notes,
      });

      fetchTasks();
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const visibleTasks = limit ? tasks.slice(0, 5) : tasks;

  // console.log("STATE:", employees);
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
              setNewTask({
                ...newTask,
                assignedTo: e.target.value,
              })
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
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
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
