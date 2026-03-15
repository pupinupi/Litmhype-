const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let rooms = {}

io.on("connection",(socket)=>{

console.log("player connected",socket.id)

socket.on("joinRoom",({username,roomCode,color})=>{

if(!rooms[roomCode]){
rooms[roomCode]={
players:[],
positions:{},
turn:0
}
}

const room = rooms[roomCode]

room.players.push({
id:socket.id,
username:username,
color:color
})

room.positions[socket.id]=0

socket.join(roomCode)

io.to(roomCode).emit("updatePlayers",room.players)

})

socket.on("startGame",({roomCode})=>{

const room = rooms[roomCode]

io.to(roomCode).emit("gameStarted",{
players:room.players
})

})

socket.on("rollDice",({roomCode})=>{

const room = rooms[roomCode]

if(!room) return

const currentPlayer = room.players[room.turn]

if(currentPlayer.id !== socket.id) return

const roll = Math.floor(Math.random()*6)+1

room.positions[socket.id]+=roll

if(room.positions[socket.id] >= 20){
room.positions[socket.id]-=20
}

io.to(roomCode).emit("diceRolled",{
playerId:socket.id,
roll:roll,
position:room.positions[socket.id]
})

room.turn++

if(room.turn >= room.players.length){
room.turn = 0
}

})

socket.on("disconnect",()=>{

for(let roomCode in rooms){

let room = rooms[roomCode]

room.players = room.players.filter(p=>p.id!==socket.id)

delete room.positions[socket.id]

io.to(roomCode).emit("updatePlayers",room.players)

}

})

})

server.listen(3000,()=>{
console.log("server running on http://localhost:3000")
})
