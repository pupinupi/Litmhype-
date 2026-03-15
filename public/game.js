const socket = io()

const board = document.getElementById("board-container")

const players = JSON.parse(localStorage.getItem("players"))

const roomCode = localStorage.getItem("room")

let tokens = {}

const cells = [

{x:91,y:583},
{x:91,y:442},
{x:86,y:329},
{x:86,y:218},
{x:88,y:119},

{x:207,y:94},
{x:326,y:80},
{x:497,y:91},
{x:627,y:91},
{x:776,y:88},
{x:898,y:127},

{x:912,y:243},
{x:914,y:345},
{x:906,y:456},
{x:901,y:558},

{x:776,y:588},
{x:630,y:594},
{x:494,y:586},
{x:354,y:583},
{x:215,y:586}

]

players.forEach(player=>{

const token = document.createElement("div")

token.className="token"

token.style.background=player.color

board.appendChild(token)

tokens[player.id]=token

moveToken(player.id,0)

})

function moveToken(id,pos){

const cell = cells[pos]

const token = tokens[id]

token.style.left = (cell.x/1024*100)+"%"
token.style.top = (cell.y/1024*100)+"%"

}

document.getElementById("dice").onclick=()=>{

socket.emit("rollDice",{roomCode})

}

socket.on("diceRolled",(data)=>{

alert("Выпало "+data.roll)

moveToken(data.playerId,data.position)

})
