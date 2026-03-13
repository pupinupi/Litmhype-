const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const app = express()
app.use(express.static("public"))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let rooms = {}

function broadcast(room,data){
rooms[room].players.forEach(p=>{
p.ws.send(JSON.stringify(data))
})
}

wss.on("connection",ws=>{

ws.on("message",msg=>{

const data=JSON.parse(msg)

if(data.type==="join"){

if(!rooms[data.room]){
rooms[data.room]={players:[],started:false,turn:0}
}

const room=rooms[data.room]

// максимум 4 игрока
if(room.players.length>=4){
ws.send(JSON.stringify({type:"full"}))
return
}

// ПРОВЕРКА ЦВЕТА
const colorUsed = room.players.find(p=>p.color===data.color)

if(colorUsed){
ws.send(JSON.stringify({
type:"colorTaken"
}))
return
}

const player={
name:data.name,
color:data.color,
hype:0,
pos:0,
ws:ws
}

ws.room=data.room
ws.name=data.name

room.players.push(player)

// отправляем список игроков
broadcast(data.room,{
type:"players",
players:room.players.map(p=>({
name:p.name,
color:p.color,
hype:p.hype
}))
})

}

if(data.type==="start"){

const room=rooms[data.room]

if(room.players.length<2){
ws.send(JSON.stringify({
type:"error",
msg:"Минимум 2 игрока"
}))
return
}

room.started=true

broadcast(data.room,{
type:"startGame",
turn:room.players[0].name
})
}

if(data.type==="dice"){

const room=rooms[ws.room]

const player=room.players.find(p=>p.name===ws.name)

player.pos=data.pos
player.hype=data.hype

broadcast(ws.room,{
type:"move",
name:player.name,
pos:player.pos,
color:player.color,
hype:player.hype
})

room.turn++

if(room.turn>=room.players.length){
room.turn=0
}

broadcast(ws.room,{
type:"turn",
player:room.players[room.turn].name
})

}

})

})
server.listen(process.env.PORT||3000)
