const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// отдаём статику
app.use(express.static('public'));

// структура комнат
let rooms = {}; // roomCode: {players:[], turn:0, positions:{}, hype:{}}

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('joinRoom', ({username, roomCode, color}) => {
        socket.join(roomCode);
        if(!rooms[roomCode]) rooms[roomCode] = {players: [], turn:0, positions:{}, hype:{}};
        if(rooms[roomCode].players.find(p=>p.color===color)){
            socket.emit('colorTaken');
            return;
        }
        rooms[roomCode].players.push({id: socket.id, username, color});
        rooms[roomCode].positions[socket.id]=0;
        rooms[roomCode].hype[socket.id]=0;

        io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
    });

    socket.on('startGame', ({roomCode})=>{
        io.to(roomCode).emit('gameStarted');
    });

    socket.on('rollDice', ({roomCode})=>{
        const room = rooms[roomCode];
        if(!room) return;
        const playerId = room.players[room.turn].id;
        const roll = Math.floor(Math.random()*6)+1;
        room.positions[playerId] = (room.positions[playerId]+roll)%20;
        io.to(roomCode).emit('diceRolled', {
            roll, playerId,
            position: room.positions[playerId],
            turn: room.turn,
            hype: room.hype[playerId]
        });
        room.turn = (room.turn+1)%room.players.length;
        io.to(roomCode).emit('nextTurn', room.turn);
    });

    socket.on('updateHype', ({roomCode, playerId, newHype})=>{
        const room = rooms[roomCode];
        if(!room) return;
        room.hype[playerId] = newHype;
        io.to(roomCode).emit('updateHype', {playerId, newHype});
    });

    socket.on('disconnect', ()=>{
        for(let roomCode in rooms){
            let room = rooms[roomCode];
            room.players = room.players.filter(p=>p.id!==socket.id);
            delete room.positions[socket.id];
            delete room.hype[socket.id];
            io.to(roomCode).emit('updatePlayers', room.players);
        }
    });
});

server.listen(3000, ()=>console.log('Сервер запущен на http://localhost:3000'));
