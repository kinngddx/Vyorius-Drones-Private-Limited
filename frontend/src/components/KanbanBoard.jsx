import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./KanbanBoard.css";

const columns = [
  { id: "todo", label: "To Do", color: "#3b82f6" },
  { id: "in-progress", label: "In Progress", color: "#f59e0b" },
  { id: "done", label: "Done", color: "#10b981" },
];

const priorities = ["Low", "Medium", "High"];
const categories = ["Bug", "Feature", "Enhancement"];

const initialForm = {
  title: "",
  description: "",
  priority: "Medium",
  category: "Feature",
  attachment: null,
  preview: null,
};

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // ── Socket Setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const socketClient = io(backendUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("Connected to backend:", socketClient.id);
    });

    socketClient.on("sync:tasks", (serverTasks) => {
      setTasks(Array.isArray(serverTasks) ? serverTasks : []);
      setLoading(false);
    });

    socketClient.on("task:created", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socketClient.on("task:updated", (updated) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
    });

    socketClient.on("task:moved", ({ id, column }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, column } : t))
      );
    });


socketClient.on("task:deleted", (payload) => {
  const id = typeof payload === "string" ? payload : payload?.id;
  if (id) setTasks((prev) => prev.filter((t) => t.id !== id));
});

    socketClient.on("disconnect", () => {
      console.log("Disconnected from backend");
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  // ── Socket Emitter ──────────────────────────────────────────────────────────
  const sendSocketEvent = (eventName, payload) => {
    if (!socket) return;
    socket.emit(eventName, payload);
  };

  // ── Form Handlers ───────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, attachment: null, preview: null }));
      return;
    }

    const attachment = { name: file.name, type: file.type };

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({
          ...prev,
          attachment: { ...attachment, url: reader.result },
          preview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, attachment, preview: null }));
    }
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const createTask = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      category: form.category,
      column: "todo",
      attachment: form.attachment,
      createdAt: Date.now(),
    };

    setTasks((prev) => [...prev, task]);
    sendSocketEvent("task:create", task);
    setForm(initialForm);
    setFileInputKey(Date.now());
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
    sendSocketEvent("task:update", { id, updates });
  };

  const moveTask = (id, column) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, column } : task))
    );
    sendSocketEvent("task:move", { id, column });
  };

  const deleteTask = (id) => {
    // setTasks((prev) => prev.filter((task) => task.id !== id));
    sendSocketEvent("task:delete", { id });
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, column) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) moveTask(taskId, column);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ── Derived State ───────────────────────────────────────────────────────────
  const tasksByColumn = useMemo(
    () =>
      columns.reduce((acc, col) => ({
        ...acc,
        [col.id]: tasks.filter((t) => t.column === col.id),
      }), {}),
    [tasks]
  );

  const totalTasks = tasks.length;
  const doneCount = tasksByColumn["done"]?.length || 0;
  const completionPercent =
    totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="kanban-board">

      {/* ── LEFT PANEL ── */}
      <section className="task-panel">
        <h2>Kanban Board</h2>

        {/* Create Task Form */}
        <form className="task-form" onSubmit={createTask}>
          <div className="field-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              placeholder="Task title..."
              value={form.title}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Add more details..."
              value={form.description}
              onChange={handleFormChange}
            />
          </div>

          <div className="split-row">
            <div className="field-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="attachment">Attachment</label>
            <input
              id="attachment"
              key={fileInputKey}
              type="file"
              accept="image/*,.pdf,.txt"
              onChange={handleFileChange}
            />
            {form.preview && (
              <div className="attachment-preview">
                <img src={form.preview} alt="Preview" />
              </div>
            )}
            {form.attachment && !form.preview && (
              <div className="attachment-meta">📎 {form.attachment.name}</div>
            )}
          </div>

          <button type="submit" className="primary-action">
            + Create Task
          </button>
        </form>

        {/* Progress Overview */}
        <section className="task-summary">
          <h3>Progress Overview</h3>

          {columns.map((col) => {
            const count = tasksByColumn[col.id]?.length || 0;
            const width =
              totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);
            const fillClass = `fill-${col.id.replace("-", "")}`;

            return (
              <div className="progress-row" key={col.id}>
                <div>
                  <span>{col.label}</span>
                  <span>{count} task{count !== 1 ? "s" : ""}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${fillClass}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="completion-summary">
            <strong>{completionPercent}%</strong>
            <span>{doneCount} of {totalTasks} tasks done</span>
          </div>
        </section>
      </section>

      {/* ── BOARD ── */}
      <section className="board">
        {loading ? (
          <div className="loading">⏳ Syncing tasks from server...</div>
        ) : (
          <div className="board-grid">
            {columns.map((col) => (
              <div
                key={col.id}
                className="column"
                data-testid={`column-${col.id}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="column-header">
                  <div className="column-title">
                    <span
                      className="column-dot"
                      style={{ background: col.color }}
                    />
                    {col.label}
                  </div>
                  <span className="column-count">
                    {tasksByColumn[col.id]?.length || 0}
                  </span>
                </div>

                {/* Empty State */}
                {tasksByColumn[col.id]?.length === 0 ? (
                  <div className="empty-state">
                    Drop tasks here or add a new one.
                  </div>
                ) : (
                  tasksByColumn[col.id].map((task) => (
                    <article
                      key={task.id}
                      className="task-card"
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      data-testid={`task-card-${task.id}`}
                    >
                      {/* Card Header */}
                      <div className="task-card-header">
                        <h4>{task.title}</h4>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteTask(task.id)}
                          data-testid={`delete-task-${task.id}`}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}

                      {/* Priority & Category Badges */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <span className={`badge badge-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="badge badge-cat">
                          {task.category}
                        </span>
                      </div>

                      {/* Inline Selects */}
                      <div className="task-meta">
                        <div>
                          <label>Priority</label>
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              updateTask(task.id, { priority: e.target.value })
                            }
                          >
                            {priorities.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>Category</label>
                          <select
                            value={task.category}
                            onChange={(e) =>
                              updateTask(task.id, { category: e.target.value })
                            }
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Attachment */}
                      {task.attachment && (
                        <div className="task-attachment">
                          {task.attachment.url ? (
                            <img
                              src={task.attachment.url}
                              alt={task.attachment.name}
                            />
                          ) : (
                            <span>📎 {task.attachment.name}</span>
                          )}
                        </div>
                      )}

                      {/* Move Buttons */}
                      <div className="task-actions">
                        {col.id !== "todo" && (
                          <button
                            type="button"
                            onClick={() => moveTask(task.id, "todo")}
                          >
                            ← To Do
                          </button>
                        )}
                        {col.id === "todo" && (
                          <button
                            type="button"
                            onClick={() => moveTask(task.id, "in-progress")}
                          >
                            → In Progress
                          </button>
                        )}
                        {col.id === "in-progress" && (
                          <button
                            type="button"
                            onClick={() => moveTask(task.id, "done")}
                          >
                            → Done
                          </button>
                        )}
                        {col.id === "done" && (
                          <button
                            type="button"
                            onClick={() => moveTask(task.id, "in-progress")}
                          >
                            ← In Progress
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default KanbanBoard;