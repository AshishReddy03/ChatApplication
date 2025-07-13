import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Chat backend is live.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to Vercel frontend URL later
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

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
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
