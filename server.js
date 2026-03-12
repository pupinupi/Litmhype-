const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let rooms = {}

io.on("connection", (socket) => {

    socket.on("joinRoom", data => {
        const {name, room, color} = data

        if (!rooms[room]) rooms[room] = {players: [], turn: 0}

        if (rooms[room].players.length >= 4) {
            socket.emit("roomFull")
            return
        }

        const player = {
            id: socket.id,
            name,
            color,
            position: 0,
            hype: 0,
            skip: false
        }

        rooms[room].players.push(player)
        socket.join(room)
        io.to(room).emit("updatePlayers", rooms[room].players)
    })

    socket.on("rollDice", room => {
        const dice = Math.floor(Math.random() * 6) + 1
        io.to(room).emit("diceResult", dice)
    })

    socket.on("move", data => {
        const {room, playerId, position} = data
        const player = rooms[room].players.find(p => p.id === playerId)
        if (player) player.position = position
        io.to(room).emit("updatePlayers", rooms[room].players)
    })

    socket.on("disconnecting", () => {
        for (let room in rooms) {
            rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id)
            io.to(room).emit("updatePlayers", rooms[room].players)
        }
    })

})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => console.log("Server started on port", PORT))
