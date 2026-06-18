const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://vyorius-drones-private-limited-2fvmsgms5-kinngddxs-projects.vercel.app/"  
    ],
    methods: ["GET", "POST"]
  }
});

let tasks = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("sync:tasks", tasks);

  socket.on("task:create", (task) => {
    if (!task || !task.id) return;
    tasks.push(task);
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:update", ({ id, updates }) => {
    tasks = tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:move", ({ id, column }) => {
    tasks = tasks.map((task) => (task.id === id ? { ...task, column } : task));
    io.emit("sync:tasks", tasks);
  });

  socket.on("task:delete", ({ id }) => {
    tasks = tasks.filter((task) => task.id !== id);
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));