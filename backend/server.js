import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://192.168.29.148:5173", // You can also use "*"
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;
let socketsConnected = new Set();

io.on("connection", (socket) => {
  socketsConnected.add(socket.id);
  io.emit("clients-total", socketsConnected.size);

  socket.on("disconnect", () => {
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Socket.IO server running on http://192.168.29.148:${PORT}`);
});
