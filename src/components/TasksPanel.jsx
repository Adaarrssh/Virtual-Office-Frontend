import React, { useState, useEffect, useCallback } from "react";
import API from "../api";
import toast from "react-hot-toast";

const TasksPanel = ({ role, limit }) => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [assigningTask, setAssigningTask] = useState(false);

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

      const filtered = Array.isArray(res.data)
        ? res.data.filter((u) => u.role === "employee")
        : [];

      setEmployees(filtered);
    } catch (err) {
      console.error("Fetch team error:", err);
      setEmployees([]);
      toast.error("Unable to load employees");
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

    if (!newTask.title.trim() || !newTask.assignedTo) {
      toast.error("Please enter task title and employee.");
      return;
    }

    try {
      setAssigningTask(true);

      await API.post("/tasks", newTask);

      toast.success("Task assigned successfully");

      setNewTask({
        title: "",
        assignedTo: "",
      });

      setShowForm(false);

      fetchTasks();
    } catch (err) {
      console.error("Add task error:", err.response?.data || err);

      toast.error(err?.response?.data?.message || "Failed to assign task");
    } finally {
      setAssigningTask(false);
    }
  };

  const updateTask = async (id, status, notes) => {
    try {
      setSavingTaskId(id);

      await API.patch(`/tasks/${id}`, {
        status,
        notes,
      });

      setStatusMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setNotesMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      fetchTasks();

      if (status === "Completed") {
        toast.success("🎉 Task marked as Completed");
      } else if (status === "In Progress") {
        toast.success("🟦 Task marked as In Progress");
      } else {
        toast.success("✅ Task updated successfully");
      }
    } catch (err) {
      console.error("Update task error:", err.response?.data || err);

      toast.error(err?.response?.data?.message || "Failed to update task");
    } finally {
      setSavingTaskId(null);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);

      toast.success("Task removed successfully");

      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err.response?.data || err);

      toast.error(err?.response?.data?.message || "Failed to remove task");
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
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
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

          <button
            type="submit"
            className="submit-task-btn"
            disabled={assigningTask}
          >
            {assigningTask ? "Assigning..." : "Assign"}
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
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    <strong>Notes:</strong> {task.notes}
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
                    value={statusMap[task._id] ?? task.status}
                    onChange={(e) =>
                      setStatusMap((prev) => ({
                        ...prev,
                        [task._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="Not Completed">Not Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <textarea
                    placeholder="Add notes..."
                    value={notesMap[task._id] ?? task.notes ?? ""}
                    onChange={(e) =>
                      setNotesMap((prev) => ({
                        ...prev,
                        [task._id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    disabled={savingTaskId === task._id}
                    onClick={() =>
                      updateTask(
                        task._id,
                        statusMap[task._id] ?? task.status,
                        notesMap[task._id] ?? task.notes,
                      )
                    }
                  >
                    {savingTaskId === task._id ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <span
                    style={{
                      color:
                        task.status === "Completed"
                          ? "green"
                          : task.status === "In Progress"
                            ? "#2563eb"
                            : "orange",
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
