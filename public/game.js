const socket = io()

const board = document.getElementById("board-container")
const roomCode = localStorage.getItem("room")

let tokens = {}
let hype = {}
let skipTurn = {}

const cells = [

{x:91,y:583},   //1 старт
{x:91,y:442},   //2
{x:86,y:329},   //3
{x:86,y:218},   //4
{x:88,y:119},   //5

{x:207,y:94},   //6
{x:326,y:80},   //7
{x:497,y:91},   //8
{x:627,y:91},   //9
{x:776,y:88},   //10
{x:898,y:127},  //11

{x:912,y:243},  //12
{x:914,y:345},  //13
{x:906,y:456},  //14
{x:901,y:558},  //15

{x:776,y:588},  //16
{x:630,y:594},  //17
{x:494,y:586},  //18
{x:354,y:583},  //19
{x:215,y:586}   //20

]

const cellActions = {

2:{type:"hype",value:1},
3:{type:"hype",value:2},
4:{type:"scandal"},
5:{type:"risk"},
6:{type:"hype",value:2},
7:{type:"scandal"},
8:{type:"hype",value:3},
9:{type:"hype",value:5},
10:{type:"hype",value:-8},
11:{type:"skip"},
12:{type:"hype",value:3},
13:{type:"risk"},
14:{type:"hype",value:3},
15:{type:"skip"},
16:{type:"hype",value:2},
17:{type:"scandal"},
18:{type:"hype",value:8},
19:{type:"hype",value:-10},
20:{type:"hype",value:4}

}

socket.emit("requestGameState",roomCode)

socket.on("gameState",(data)=>{

const players=data.players
const positions=data.positions

players.forEach(player=>{

hype[player.id]=0
skipTurn[player.id]=false

const token=document.createElement("div")
token.className="token"
token.style.background=player.color

const label=document.createElement("div")
label.style.position="absolute"
label.style.fontSize="14px"
label.style.color="white"
label.innerText="0"

token.appendChild(label)

board.appendChild(token)

tokens[player.id]=token

moveToken(player.id,positions[player.id])

})

})

function moveToken(id,pos){

const cell=cells[pos]

const token=tokens[id]

token.style.transition="all 0.5s linear"

token.style.left=(cell.x/1024*100)+"%"
token.style.top=(cell.y/1024*100)+"%"

}

document.getElementById("dice").onclick=()=>{

socket.emit("rollDice",roomCode)

}

socket.on("diceResult",(data)=>{

const id=data.playerId
const roll=data.roll
const position=data.position

alert("Выпало "+roll)

moveToken(id,position)

setTimeout(()=>{

applyCell(id,position+1)

},600)

})

function applyCell(id,cellNumber){

const action = cellActions[cellNumber]

if(!action) return

if(action.type==="hype"){

hype[id]+=action.value

if(hype[id]<0) hype[id]=0

updateHype(id)

}

if(action.type==="skip"){

skipTurn[id]=true

alert("Пропусти следующий ход")

}

if(action.type==="risk"){

riskEvent(id)

}

if(action.type==="scandal"){

scandalEvent(id)

}

checkWin(id)

}

function updateHype(id){

const token=tokens[id]

token.firstChild.innerText=hype[id]

}

function checkWin(id){

if(hype[id]>=70){

alert("Игрок победил!")

}

}

function riskEvent(id){

const roll=Math.floor(Math.random()*6)+1

if(roll<=3){

hype[id]-=5
if(hype[id]<0) hype[id]=0

alert("Риск не удался -5 хайпа")

}else{

hype[id]+=5

alert("Риск удался +5 хайпа")

}

updateHype(id)

}

function scandalEvent(id){

const cards=[

{name:"Перегрел аудиторию 🔥",value:-1},
{name:"Громкий заголовок 🫣",value:-2},
{name:"Это монтаж 😱",value:-3},
{name:"Меня взломали #️⃣",value:-3,all:true},
{name:"Подписчики в шоке 😮",value:-4},
{name:"Удаляй пока не поздно 🤫",value:-5},
{name:"Это контент 🙄",value:-5,skip:true}

]

const card = cards[Math.floor(Math.random()*cards.length)]

alert(card.name)

if(card.all){

for(let p in hype){

hype[p]+=card.value

if(hype[p]<0) hype[p]=0

updateHype(p)

}

}else{

hype[id]+=card.value

if(hype[id]<0) hype[id]=0

updateHype(id)

}

if(card.skip){

skipTurn[id]=true

}

}
