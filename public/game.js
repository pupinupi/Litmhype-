const socket = new WebSocket(location.origin.replace("http","ws"))

const name = localStorage.getItem("name")
const room = localStorage.getItem("room")
const color = localStorage.getItem("color")

const board = document.getElementById("playersBoard")
const dice = document.getElementById("dice")

let players={}
let myTurn=false

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

socket.onopen=()=>{

socket.send(JSON.stringify({
type:"join",
name:name,
room:room,
color:color
}))

}

// создать фишку
function createPlayer(p){

const el=document.createElement("div")

el.className="player"
el.style.background=p.color
el.id="player_"+p.name

board.appendChild(el)

players[p.name]={
pos:0,
hype:p.hype,
el:el
}

movePlayer(p.name)

}

// переместить фишку
function movePlayer(playerName){

const p=players[playerName]

if(!p) return

const c=cells[p.pos]

p.el.style.left=c.x+"px"
p.el.style.top=c.y+"px"

}

// всплывающий хайп
function showHype(name,value){

const p=players[name]

const el=document.createElement("div")

el.className="hypeFloat"

el.innerText=(value>0?"+":"")+value

el.style.color=value>0?"#00ff88":"#ff4444"

el.style.left=p.el.style.left
el.style.top=p.el.style.top

board.appendChild(el)

setTimeout(()=>el.remove(),1000)

}

// бросок кубика
dice.onclick=()=>{

if(!myTurn) return

dice.innerText="🎲..."

setTimeout(()=>{

const roll=Math.floor(Math.random()*6)+1

dice.innerText="🎲 "+roll

socket.send(JSON.stringify({
type:"dice",
roll:roll
}))

},400)

}

socket.onmessage=e=>{

const data=JSON.parse(e.data)

// список игроков
if(data.type==="players"){

document.getElementById("score").innerHTML=""
document.getElementById("hypeBars").innerHTML=""

data.players.forEach(p=>{

if(!players[p.name]){
createPlayer(p)
}

document.getElementById("score").innerHTML+=`
<div style="color:${p.color}">
${p.name}: ${p.hype}/70
</div>
`

document.getElementById("hypeBars").innerHTML+=`
<div>${p.name}</div>
<div class="hypeBar">
<div class="hypeFill" style="width:${p.hype/70*100}%"></div>
</div>
`

})

}

// движение
if(data.type==="move"){

if(!players[data.name]){
createPlayer(data)
}

players[data.name].pos=data.pos
players[data.name].hype=data.hype

movePlayer(data.name)

if(data.hypeChange){
showHype(data.name,data.hypeChange)
}

if(data.scandalCard){

const card=document.getElementById("card")

card.innerText="СКАНДАЛ\n"+data.scandalCard.text

card.style.display="block"

setTimeout(()=>{
card.style.display="none"
},2500)

}

}

// ход
if(data.type==="turn"){

document.getElementById("turn").innerText="Ход: "+data.player

myTurn=data.player===name

}

// победа
if(data.type==="win"){

alert("🏆 Победил "+data.name)

}

}
