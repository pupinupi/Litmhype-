const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

  // Игрок заходит в комнату
  socket.on("joinRoom", ({ username, roomCode, color }) => {
    socket.roomCode = roomCode;

    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], positions: {}, turn: 0 };
    }

    const room = rooms[roomCode];

    if (!room.players.find(p => p.id === socket.id)) {
      room.players.push({ id: socket.id, username, color });
      room.positions[socket.id] = 0;
    }

    socket.join(roomCode);

    // Всем игрокам отправляем список игроков
    io.to(roomCode).emit("playersUpdate", room.players);

    // Новому игроку отправляем состояние игры
    socket.emit("state", { players: room.players, positions: room.positions, turn: room.turn });
  });

  // Начало игры
  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    io.to(roomCode).emit("startGame");
  });

  // Бросок кубика
  socket.on("rollDice", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    const currentPlayer = room.players[room.turn];
    if (!currentPlayer || currentPlayer.id !== socket.id) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    room.positions[currentPlayer.id] += roll;
    if (room.positions[currentPlayer.id] > 19) room.positions[currentPlayer.id] = 19;

    io.to(roomCode).emit("diceResult", {
      playerId: currentPlayer.id,
      roll,
      positions: { ...room.positions }
    });

    room.turn++;
    if (room.turn >= room.players.length) room.turn = 0;

    io.to(roomCode).emit("turnUpdate", room.turn);
  });

  // Игрок отключился
  socket.on("disconnect", () => {
    const roomCode = socket.roomCode;
    if (!roomCode) return;
    const room = rooms[roomCode];
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    delete room.positions[socket.id];

    io.to(roomCode).emit("playersUpdate", room.players);
  });

});

server.listen(3000, () => console.log("Server running on port 3000"));
