const socket = io()

const username = localStorage.getItem("username")
const roomCode = localStorage.getItem("room")
const color = localStorage.getItem("color")

const board = document.getElementById("board-container")
const diceBtn = document.getElementById("diceBtn")
const popup = document.getElementById("popup")
const hypeBoard = document.getElementById("hype-board")

let players = []
let tokens = {}
let hype = {}
let positions = {}

const cells = [
{ x:91,y:583,type:"start"},
{ x:91,y:442,type:"hype",value:3},
{ x:86,y:329,type:"hype",value:3},
{ x:86,y:218,type:"hype",value:2},

{ x:88,y:119,type:"scandal"},

{ x:207,y:94,type:"risk"},
{ x:326,y:80,type:"hype",value:2},
{ x:497,y:91,type:"scandal"},
{ x:627,y:91,type:"hype",value:3},
{ x:776,y:88,type:"hype",value:5},
{ x:898,y:127,type:"hype",value:-8},

{ x:912,y:243,type:"skip"},
{ x:914,y:345,type:"hype",value:3},
{ x:906,y:456,type:"risk"},
{ x:901,y:558,type:"hype",value:3},

{ x:776,y:588,type:"skip"},
{ x:630,y:594,type:"hype",value:2},
{ x:494,y:586,type:"scandal"},
{ x:354,y:583,type:"hype",value:8},
{ x:215,y:586,type:"hype",value:-10}
]

const scandals = [
{t:"Перегрел аудиторию 🔥",v:-1},
{t:"Громкий заголовок 🫣",v:-2},
{t:"Это монтаж 😱",v:-3},
{t:"Меня взломали #️⃣",v:-3,all:true},
{t:"Подписчики в шоке 😮",v:-4},
{t:"Удаляй пока не поздно 🤫",v:-5},
{t:"Это контент, вы не понимаете 🙄",v:-5,skip:true}
]

function showPopup(text,button=true,cb=null){
popup.innerHTML=`<div>${text}</div>`
if(button){
const b=document.createElement("button")
b.innerText="OK"
b.onclick=()=>{
popup.style.display="none"
if(cb)cb()
}
popup.appendChild(b)
}
popup.style.display="block"
}

function showRules(){
showPopup(`
<h2>Правила</h2>
Победа при <b>70 хайпа</b><br><br>

<b>Риск</b><br>
1-3 → -5 хайпа<br>
4-6 → +5 хайпа<br><br>

<b>Скандал</b><br>
всегда штраф
`)
}

function createToken(player){
const token=document.createElement("div")
token.className="token"
token.style.background=player.color
token.innerText=player.username[0].toUpperCase()

const hypeLabel=document.createElement("div")
hypeLabel.style.position="absolute"
hypeLabel.style.top="-18px"
hypeLabel.style.color="white"
hypeLabel.style.fontSize="14px"
hypeLabel.innerText="0"

token.appendChild(hypeLabel)

board.appendChild(token)

tokens[player.id]=token
hype[player.id]=0
positions[player.id]=0

moveToken(player.id,0)
createHypeBar(player)
}

function createHypeBar(player){

const wrap=document.createElement("div")

const name=document.createElement("div")
name.innerText=player.username

const bar=document.createElement("div")
bar.className="hype-bar"

const fill=document.createElement("div")
fill.className="hype-fill"

bar.appendChild(fill)

wrap.appendChild(name)
wrap.appendChild(bar)

hypeBoard.appendChild(wrap)

player.barFill=fill
}

function moveToken(id,pos){

const token=tokens[id]
const cell=cells[pos]

token.style.left=(cell.x-20)+"px"
token.style.top=(cell.y-20)+"px"

}

function animateMove(id,start,steps){

let i=0

const interval=setInterval(()=>{

positions[id]++
if(positions[id]>=cells.length)positions[id]=0

moveToken(id,positions[id])

i++

if(i>=steps){

clearInterval(interval)
handleCell(id)

}

},350)

}

function updateHype(id,val){

hype[id]+=val

if(hype[id]<0)hype[id]=0

const token=tokens[id]
const label=token.children[0]
label.innerText=hype[id]

players.forEach(p=>{
if(p.id===id){
p.barFill.style.width=Math.min(hype[id],70)/70*100+"%"
}
})

if(hype[id]>=70){
showPopup("🏆 Победитель "+players.find(p=>p.id===id).username,false)
}

socket.emit("updateHype",{roomCode,playerId:id,newHype:hype[id]})

}

function handleCell(id){

const cell=cells[positions[id]]

if(cell.type==="hype"){

updateHype(id,cell.value)

}

if(cell.type==="risk"){

showPopup("Клетка Риск! Бросаем кубик...",true,()=>{

const r=Math.floor(Math.random()*6)+1

if(r<=3){

showPopup("Выпало "+r+"<br>-5 хайпа")
updateHype(id,-5)

}else{

showPopup("Выпало "+r+"<br>+5 хайпа")
updateHype(id,5)

}

})

}

if(cell.type==="scandal"){

const card=scandals[Math.floor(Math.random()*scandals.length)]

showPopup("<b>Скандал!</b><br>"+card.t+" "+card.v+" хайпа")

if(card.all){

players.forEach(p=>{
updateHype(p.id,card.v)
})

}else{

updateHype(id,card.v)

}

}

}

diceBtn.onclick=()=>{
socket.emit("rollDice",{roomCode})
}

socket.on("updatePlayers",(p)=>{

players=p

if(Object.keys(tokens).length===0){

players.forEach(createToken)

showRules()

}

})

socket.on("diceRolled",(data)=>{

showPopup("🎲 Выпало число "+data.roll,false)

animateMove(data.playerId,positions[data.playerId],data.roll)

})

socket.on("updateHype",(data)=>{

hype[data.playerId]=data.newHype

})
