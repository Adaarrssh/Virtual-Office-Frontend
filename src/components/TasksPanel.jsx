import React, { useState, useEffect } from "react";
import allTasks from "../data/tasks";
import allEmployees from "../data/employee.js";

const TasksPanel = ({ role, limit }) => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    status: "Pending",
  });
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  const currentUser = "Priya";

  useEffect(() => {
    if (role === "employee") {
      const employeeTasks = allTasks.filter(
        (task) => task.assignee === currentUser
      );
      setTasks(employeeTasks);
    } else {
      setTasks(allTasks);
    }

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [role, currentUser]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.title && newTask.assignee) {
      const newTaskId = Math.max(...allTasks.map((t) => t.id), 0) + 1;
      const taskToAdd = { ...newTask, id: newTaskId };
      allTasks.push(taskToAdd);
      setTasks([...tasks, taskToAdd]);
      setShowForm(false);
      setNewTask({ title: "", assignee: "", status: "Pending" });
    }
  };

  const visibleTasks = limit ? tasks.slice(0, 5) : tasks;

  // Added memoization for filtering to improve performance
  const filteredEmployees = React.useMemo(() => {
    const input = newTask.assignee.toLowerCase().trim();
    if (input.length < 1) return []; // Return empty array if input is empty
    return allEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(input)
    );
  }, [newTask.assignee]);

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

          <div className="assign-dropdown">
            <input
              type="text"
              placeholder="Assign to (Employee Name)"
              value={newTask.assignee}
              onChange={(e) =>
                setNewTask({ ...newTask, assignee: e.target.value })
              }
              required
              autoComplete="off"
            />

            {newTask.assignee && (
              <ul className="dropdown-list">
                {filteredEmployees.map((employee) => (
                  <li
                    key={employee.id} // Assuming each employee has a unique 'id'
                    onClick={() =>
                      setNewTask({ ...newTask, assignee: employee.name })
                    }
                  >
                    {employee.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="submit-task-btn">
            Add Task
          </button>
        </form>
      )}

      {visibleTasks.length > 0 ? (
        <ul className="tasks-list">
          {visibleTasks.map((task) => (
            <li key={task.id} className="task-item">
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                {!isSmallScreen && role === "manager" && (
                  <span className="task-assignee">
                    Assigned to: {task.assignee}
                  </span>
                )}
              </div>
              <span className={`task-status ${task.status.toLowerCase()}`}>
                {task.status}
              </span>
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
