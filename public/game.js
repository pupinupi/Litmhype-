```javascript
// подключение сокета
const socket = io()

// данные игрока
const name = localStorage.getItem("name")
const room = localStorage.getItem("room")
const color = localStorage.getItem("color")

// элемент фишки
const player = document.getElementById("player")

player.classList.add(color || "yellow")

// координаты клеток
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

// действия клеток
const cellActions = [
"start",
"+3",
"+2",
"scandal",
"risk",
"+2",
"scandal",
"+3",
"+5",
"-15",
"-8skip",
"+3",
"risk",
"+3",
"skip",
"+2",
"scandal",
"+8",
"-10",
"+4"
]

// позиция игрока
let position = 0

// хайп игрока
let hype = 0

// пропуск хода
let skipTurn = false

// создать счетчик хайпа
const hypeText = document.createElement("h3")
hypeText.innerText = "Хайп: 0"
document.body.appendChild(hypeText)

// поставить фишку
function moveToCell(index){

const cell = cells[index]

player.style.left = cell.x + "px"
player.style.top = cell.y + "px"

}

// старт
moveToCell(position)

// применить действие клетки
function applyCell(){

const action = cellActions[position]

if(action === "start") return

if(action.includes("+")){
const value = parseInt(action)
hype += value
}

if(action.includes("-") && !action.includes("skip")){
const value = parseInt(action)
hype += value
}

if(action === "skip"){
alert("Пропусти ход")
skipTurn = true
}

if(action === "-8skip"){
hype -= 8
alert("−8 хайпа и пропусти ход")
skipTurn = true
}

if(action === "risk"){

const roll = Math.floor(Math.random()*6)+1

if(roll <=3){
alert("Риск не удался −5 хайпа")
hype -=5
}else{
alert("Риск удался +5 хайпа")
hype +=5
}

}

if(action === "scandal"){

const scandals = [
"Перегрел аудиторию −1 хайп",
"Громкий заголовок −2 хайп",
"Это монтаж −3 хайп",
"Меня взломали −3 хайп",
"Подписчики в шоке −4 хайп",
"Удаляй пока не поздно −5 хайп",
"Это контент −5 хайп и пропуск хода"
]

const random = Math.floor(Math.random()*scandals.length)

alert(scandals[random])

if(random === 0) hype -=1
if(random === 1) hype -=2
if(random === 2) hype -=3
if(random === 3) hype -=3
if(random === 4) hype -=4
if(random === 5) hype -=5
if(random === 6){
hype -=5
skipTurn = true
}

}

// хайп не может быть меньше 0
if(hype < 0) hype = 0

// обновить счетчик
hypeText.innerText = "Хайп: " + hype

// проверка победы
if(hype >= 100){
alert(name + " победил!")
}

}

// движение фишки
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

setTimeout(step,350)

}else{

applyCell()

}

}

step()

}

// кнопка кубика
const diceButton = document.getElementById("dice")

diceButton.onclick = () => {

if(skipTurn){
alert("Ты пропускаешь ход")
skipTurn = false
return
}

const dice = Math.floor(Math.random()*6)+1

alert("Выпало: " + dice)

movePlayer(dice)

}

// подключение к комнате
socket.emit("joinRoom",{
name:name,
room:room,
color:color
})

// обновление игроков
socket.on("updatePlayers",(players)=>{
console.log(players)
})
```
