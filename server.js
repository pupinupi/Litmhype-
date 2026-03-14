const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const app = express()

app.use(express.static("public"))

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

let rooms = {}

function broadcast(room, data) {

if(!rooms[room]) return

rooms[room].players.forEach(p=>{
try{
p.ws.send(JSON.stringify(data))
}catch(e){}
})

}

wss.on("connection", ws=>{

ws.on("message", msg=>{

let data

try{
data = JSON.parse(msg)
}catch{
return
}

if(data.type === "join"){

if(!rooms[data.room]){

rooms[data.room] = {
players:[],
turn:0,
started:false
}

}

const room = rooms[data.room]

if(room.players.length >= 4){
ws.send(JSON.stringify({type:"full"}))
return
}

if(room.players.find(p=>p.color === data.color)){
ws.send(JSON.stringify({type:"colorTaken"}))
return
}

const player = {
name:data.name,
color:data.color,
pos:0,
hype:0,
ws:ws
}

ws.room = data.room
ws.name = data.name

room.players.push(player)

broadcast(data.room,{
type:"players",
players:room.players.map(p=>({
name:p.name,
color:p.color,
hype:p.hype
}))
})

}

if(data.type === "start"){

const room = rooms[data.room]

if(!room) return
if(room.players.length < 2) return

room.started = true
room.turn = 0

broadcast(data.room,{type:"startGame"})

broadcast(data.room,{
type:"turn",
player:room.players[0].name
})

}

if(data.type === "dice"){

const room = rooms[ws.room]
if(!room) return

const player = room.players.find(p=>p.name === ws.name)
if(!player) return

player.pos = data.pos
player.hype = data.hype

broadcast(ws.room,{
type:"move",
name:player.name,
color:player.color,
pos:player.pos,
hype:player.hype
})

room.turn++

if(room.turn >= room.players.length){
room.turn = 0
}

broadcast(ws.room,{
type:"turn",
player:room.players[room.turn].name
})

}

})

ws.on("close",()=>{

const room = rooms[ws.room]
if(!room) return

room.players = room.players.filter(p=>p.name !== ws.name)

broadcast(ws.room,{
type:"players",
players:room.players.map(p=>({
name:p.name,
color:p.color,
hype:p.hype
}))
})

})

})

server.listen(process.env.PORT || 3000, ()=>{
console.log("Server running")
})
