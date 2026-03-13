const socket=new WebSocket(location.origin.replace("http","ws"))

const name=localStorage.getItem("name")
const room=localStorage.getItem("room")
const color=localStorage.getItem("color")

const board=document.getElementById("playersBoard")

const dice=document.getElementById("dice")

const card=document.getElementById("card")

let pos=0
let hype=0
let myTurn=false

// клетки поля
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

// типы клеток
const cellType=[
"start","+3","+2","scandal","risk","+2","scandal","+3","+5",
"-15","skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
]

// карточки
const scandals=[
["Перегрел аудиторию 🔥",-1],
["Громкий заголовок 🫣",-2],
["Это монтаж 😱",-3],
["Меня взломали #",-3],
["Подписчики в шоке 😮",-4],
["Удаляй пока не поздно 🤫",-5],
["Это контент 🙄",-5]
]

const player=document.createElement("div")
player.className="player"
player.style.background=color
board.appendChild(player)

function move(){
player.style.left=cells[pos].x+"px"
player.style.top=cells[pos].y+"px"
}

move()

function showCard(text){

card.innerText=text
card.style.display="block"

setTimeout(()=>{
card.style.display="none"
},2500)

}

function applyCell(){

const type=cellType[pos]

if(type==="start"){
hype+=15
showCard("+15 хайпа")
}

if(type==="risk"){

const r=Math.floor(Math.random()*6)+1

if(r<=3){
hype-=5
showCard("Риск не удался -5")
}else{
hype+=5
showCard("Риск удался +5")
}

}

if(type==="scandal"){

const s=scandals[Math.floor(Math.random()*scandals.length)]

hype+=s[1]

showCard(s[0]+" "+s[1])

}

if(type==="skip"){
showCard("Пропуск хода")
}

if(type.includes("+")){
hype+=parseInt(type)
showCard("+"+type)
}

if(type.includes("-")){
hype+=parseInt(type)
showCard(type)
}

if(hype<0) hype=0

if(hype>=70){
showCard(name+" победил!")
}

}

dice.onclick=()=>{

if(!myTurn) return

const roll=Math.floor(Math.random()*6)+1

dice.innerText=roll

for(let i=0;i<roll;i++){

setTimeout(()=>{

pos++

if(pos>=cells.length){
pos=0
hype+=7
}

move()

if(i===roll-1){

applyCell()

socket.send(JSON.stringify({
type:"dice",
pos:pos,
hype:hype
}))

}

},i*350)

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

document.getElementById("turn").innerText="Ход: "+data.player

myTurn=data.player===name

}

if(data.type==="players"){

let html=""

data.players.forEach(p=>{
html+=`<div style="color:${p.color}">
${p.name}: ${p.hype} хайпа
</div>`
})

document.getElementById("score").innerHTML=html

}

}
