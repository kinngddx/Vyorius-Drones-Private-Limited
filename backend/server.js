const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tasks = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("sync:tasks", tasks);

  socket.on("task:create", (task) => {
    if (!task || !task.id) {
      return;
    }
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

 socket.on("task:delete", ({ id }) => {       // ← destructure { id }
  tasks = tasks.filter((task) => task.id !== id);
  io.emit("sync:tasks", tasks);
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
