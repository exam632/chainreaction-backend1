const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { board: [], players: [], turn: 0 };
    }
    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }
    io.to(roomId).emit("players_update", rooms[roomId].players);
  });

  socket.on("make_move", ({ roomId, x, y }) => {
    io.to(roomId).emit("move_made", { player: socket.id, x, y });
    if (rooms[roomId]) {
      rooms[roomId].turn = (rooms[roomId].turn + 1) % rooms[roomId].players.length;
      io.to(roomId).emit("turn_update", rooms[roomId].players[rooms[roomId].turn]);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p !== socket.id);
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Multiplayer Chain Reaction backend running!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});