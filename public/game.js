const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const color = localStorage.getItem("color");

socket.emit("joinRoom",{name,room,color});

document.getElementById("dice").onclick=()=>{
socket.emit("rollDice",room);
};

socket.on("diceResult",(dice)=>{
alert("Выпало: "+dice);
});
