const socket=new WebSocket(location.origin.replace("http","ws"))

const name=localStorage.getItem("name")
const room=localStorage.getItem("room")
const color=localStorage.getItem("color")

const board=document.getElementById("playersBoard")

const cells=[
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

let pos=0
let hype=0

const player=document.createElement("div")
player.className="player"
player.style.background=color
board.appendChild(player)

function move(){
player.style.left=cells[pos].x+"px"
player.style.top=cells[pos].y+"px"
}

move()

document.getElementById("dice").onclick=()=>{

const dice=Math.floor(Math.random()*6)+1

for(let i=0;i<dice;i++){

setTimeout(()=>{

pos++

if(pos>=cells.length){
pos=0
hype+=7
}

move()

if(i===dice-1){

socket.send(JSON.stringify({
type:"dice",
pos:pos,
hype:hype
}))

}

},i*400)

}

}

socket.onmessage=e=>{

const data=JSON.parse(e.data)

if(data.type==="move"){

if(data.name!==name){

let p=document.getElementById(data.name)

if(!p){

p=document.createElement("div")
p.className="player"
p.id=data.name
p.style.background=data.color

board.appendChild(p)

}

p.style.left=cells[data.pos].x+"px"
p.style.top=cells[data.pos].y+"px"

}

}

if(data.type==="turn"){

document.getElementById("turn").innerText="Ходит: "+data.player

}

}
