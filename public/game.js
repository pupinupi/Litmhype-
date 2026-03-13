```javascript
// ====== ПОЛНЫЙ GAME.JS ======

const socket = io()

const name = localStorage.getItem("name")
const room = localStorage.getItem("room")
const color = localStorage.getItem("color")

const player = document.getElementById("player")

// если цвет не выбран — жёлтый
player.classList.add(color || "yellow")

// координаты клеток твоего поля
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

let position = 0

// поставить фишку на клетку
function moveToCell(index){

    const cell = cells[index]

    player.style.left = cell.x + "px"
    player.style.top = cell.y + "px"

}

// стартовая позиция
moveToCell(position)


// движение фишки
function movePlayer(steps){

    let stepCount = 0

    function step(){

        if(stepCount < steps){

            position++

            if(position >= cells.length){
                position = 0
            }

            moveToCell(position)

            stepCount++

            setTimeout(step, 350)
        }

    }

    step()

}


// кнопка броска кубика
const diceButton = document.getElementById("dice")

diceButton.onclick = () => {

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


// обновление игроков (пока просто вывод в консоль)
socket.on("updatePlayers",(players)=>{
    console.log(players)
})
```
