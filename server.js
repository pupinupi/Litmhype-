const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

    socket.on("joinRoom", (data) => {

        const {room, name, color} = data;

        if(!rooms[room]) rooms[room] = {players: []};

        if(rooms[room].players.length >= 4){
            socket.emit("roomFull");
            return;
        }

        const player = {
            id: socket.id,
            name,
            color,
            hype:0,
            position:0,
            skip:false
        };

        rooms[room].players.push(player);

        socket.join(room);

        io.to(room).emit("updatePlayers", rooms[room].players);
    });

    socket.on("rollDice",(room)=>{

        const dice = Math.floor(Math.random()*6)+1;

        io.to(room).emit("diceResult",dice);

    });

});
http.listen(3000,()=>console.log("Server started"));
