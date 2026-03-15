const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ username, roomCode, color }) => {

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        positions: {},
        turn: 0
      };
    }

    const room = rooms[roomCode];

    if (room.players.length >= 4) return;

    room.players.push({
      id: socket.id,
      username,
      color
    });

    room.positions[socket.id] = 0;

    socket.join(roomCode);

    io.to(roomCode).emit("playersUpdate", room.players);
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    io.to(roomCode).emit("startGame");
  });

  socket.on("getState", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    socket.emit("state", {
      players: room.players,
      positions: room.positions,
      turn: room.turn
    });
  });

  socket.on("rollDice", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    const currentPlayer = room.players[room.turn];
    if (!currentPlayer) return;

    const roll = Math.floor(Math.random() * 6) + 1;

    room.positions[currentPlayer.id] += roll;
    if (room.positions[currentPlayer.id] > 19) {
      room.positions[currentPlayer.id] = 19;
    }

    io.to(roomCode).emit("diceResult", {
      playerId: currentPlayer.id,
      roll,
      position: room.positions[currentPlayer.id]
    });

    room.turn++;
    if (room.turn >= room.players.length) room.turn = 0;
  });

});
server.listen(3000, "0.0.0.0");

