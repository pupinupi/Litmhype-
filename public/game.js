const socket = io();
const roomCode = localStorage.getItem("room");

const board = document.getElementById("board-container");
let tokens = {};
let positions = {};
let players = [];

const cells = [
  {x:91,y:583},{x:91,y:442},{x:86,y:329},{x:86,y:218},{x:88,y:119},
  {x:207,y:94},{x:326,y:80},{x:497,y:91},{x:627,y:91},{x:776,y:88},
  {x:898,y:127},{x:912,y:243},{x:914,y:345},{x:906,y:456},{x:901,y:558},
  {x:776,y:588},{x:630,y:594},{x:494,y:586},{x:354,y:583},{x:215,y:586}
];

// Создаём фишку игрока
function createToken(playerId, color){
  if(tokens[playerId]) return;
  const token = document.createElement("div");
  token.className = "token";
  token.style.background = color;
  board.appendChild(token);
  tokens[playerId] = token;
}

// Двигаем фишку
function moveToken(playerId, pos){
  const token = tokens[playerId];
  const cell = cells[pos];
  if(!cell) return;
  token.style.transition = "all 0.5s linear";
  token.style.left = (cell.x/1024*100) + "%";
  token.style.top = (cell.y/1024*100) + "%";
}

// Получаем состояние игры
socket.on("state", (data) => {
  players = data.players;
  positions = data.positions;
  players.forEach(p => {
    createToken(p.id, p.color);
    moveToken(p.id, positions[p.id]);
  });
});

// Обновление игроков (новый игрок зашёл)
socket.on("playersUpdate", (list) => {
  list.forEach(p => {
    createToken(p.id, p.color);
    if(positions[p.id] !== undefined){
      moveToken(p.id, positions[p.id]);
    } else {
      positions[p.id] = 0;
      moveToken(p.id, 0);
    }
  });
});

// Клик кубика
document.getElementById("dice").onclick = () => {
  socket.emit("rollDice", roomCode);
};

// Результат кубика
socket.on("diceResult", (data) => {
  positions[data.playerId] = data.position;
  moveToken(data.playerId, data.position);
  alert(`Выпало ${data.roll}`);
});

// При загрузке страницы запрашиваем состояние
socket.emit("joinRoom", { username: localStorage.getItem("username") || "Игрок", roomCode, color: "red" });
socket.emit("getState", roomCode);
