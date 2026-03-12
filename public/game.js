const name = localStorage.getItem("name")
const room = localStorage.getItem("room")
const color = localStorage.getItem("color")

const player = document.getElementById("player")

player.classList.add(color)

let position = 0

const cells = [

{ x:110, y:850 }, //1 старт

{ x:110, y:720 },
{ x:110, y:580 },
{ x:110, y:440 },
{ x:110, y:300 },

{ x:250, y:200 },
{ x:400, y:200 },
{ x:540, y:200 },
{ x:680, y:200 },
{ x:820, y:200 },
{ x:900, y:300 },

{ x:900, y:450 },
{ x:900, y:600 },
{ x:900, y:750 },
{ x:820, y:850 },

{ x:680, y:850 },
{ x:540, y:850 },
{ x:400, y:850 },
{ x:250, y:850 },

{ x:110, y:850 }

]

moveToCell(0)

function moveToCell(i){

player.style.left = cells[i].x + "px"
player.style.top = cells[i].y + "px"

}

function movePlayer(steps){

let i = 0

function step(){

if(i < steps){

position++

if(position >= cells.length){
position = 0
}

moveToCell(position)

i++

setTimeout(step,400)

}

}

step()

}

document.getElementById("dice").onclick=()=>{

const dice = Math.floor(Math.random()*6)+1

alert("Выпало: "+dice)

movePlayer(dice)

}
