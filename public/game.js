const socket = new WebSocket(location.origin.replace(/^http/, "ws"))

const name = localStorage.getItem("name")

const board = document.getElementById("playersBoard")
const dice = document.getElementById("dice")

let players = {}
let myTurn = false

const cells = [
{x:103,y:600},
{x:107,y:473},
{x:100,y:353},
{x:103,y:235},
{x:91,y:134},
{x:213,y:98},
{x:353,y:102},
{x:505,y:105},
{x:659,y:102},
{x:802,y:103},
{x:920,y:123},
{x:928,y:252},
{x:933,y:359},
{x:926,y:466},
{x:907,y:601},
{x:802,y:611},
{x:651,y:608},
{x:501,y:603},
{x:361,y:611},
{x:213,y:615}
]

function createPlayer(p){

const el = document.createElement("div")

el.className = "player"
el.style.background = p.color
el.id = "player_" + p.name

board.appendChild(el)

players[p.name] = {
pos:0,
hype:p.hype,
el:el
}

movePlayer(p.name)

}

function movePlayer(playerName){

const p = players[playerName]

if(!p) return

const c = cells[p.pos]

p.el.style.left = c.x + "px"
p.el.style.top = c.y + "px"

}

dice.onclick = ()=>{

if(!myTurn) return

const roll = Math.floor(Math.random()*6)+1

dice.innerText = "🎲 "+roll

let pos = players[name].pos

for(let i=0;i<roll;i++){

setTimeout(()=>{

pos++

if(pos >= cells.length){

pos = 0
players[name].hype += 7

}

players[name].pos = pos

movePlayer(name)

if(i === roll-1){

socket.send(JSON.stringify({
type:"dice",
pos:pos,
hype:players[name].hype
}))

}

}, i*350)

}

}

socket.onmessage = e=>{

const data = JSON.parse(e.data)

if(data.type === "players"){

document.getElementById("score").innerHTML = ""

data.players.forEach(p=>{

if(!players[p.name]){
createPlayer(p)
}

document.getElementById("score").innerHTML += `
<div style="color:${p.color}">
${p.name}: ${p.hype}
</div>
`

})

}

if(data.type === "move"){

if(!players[data.name]){
createPlayer(data)
}

players[data.name].pos = data.pos
players[data.name].hype = data.hype

movePlayer(data.name)

}

if(data.type === "turn"){

document.getElementById("turn").innerText = "Ход: " + data.player

myTurn = data.player === name

}

}
