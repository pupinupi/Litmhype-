const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

// Поле и события
const boardEvents = [
  "start","+3","+2","scandal","risk","+2","scandal","+3","+5","-10",
  "-10skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
];

// Карточки скандала
const scandalCards = [
  {text:"перегрел аудиторию🔥", hype:-1},
  {text:"громкий заголовок🫣", hype:-2},
  {text:"это монтаж 😱", hype:-3},
  {text:"меня взломали #️⃣", hype:"all-3"},
  {text:"подписчики в шоке 😮", hype:-4},
  {text:"удаляй пока не поздно🤫", hype:-5},
  {text:"это контент, вы не понимаете🙄", hype:-5, skip:true}
];

// Отправка сообщений всем игрокам комнаты
function broadcast(room,data){
  if(!rooms[room]) return;
  rooms[room].players.forEach(p=>{
    try{ p.ws.send(JSON.stringify(data)); }catch(e){}
  });
}

// Смена хода
function nextTurn(room){
  const r = rooms[room];
  if(!r) return;
  let start = r.turn;
  do{
    r.turn = (r.turn + 1) % r.players.length;
  } while(r.players[r.turn].skip && r.turn!==start);
  const nextPlayer = r.players[r.turn];
  nextPlayer.skip = false;
  broadcast(room, {type:"turn", player:nextPlayer.name});
}

wss.on("connection", ws => {
  ws.on("message", msg => {
    let data;
    try{ data = JSON.parse(msg); }catch{return;}

    // JOIN ROOM
    if(data.type==="join"){
      if(!rooms[data.room]){
        rooms[data.room]={
          players:[],
          turn:0,
          started:false
        }
      }
      const room = rooms[data.room];

      let existing = room.players.find(p=>p.name===data.name);
      if(existing){
        existing.ws = ws;
        ws.room = data.room;
        ws.name = data.name;
        broadcast(data.room,{
          type:"players",
          players:room.players.map(p=>({name:p.name,color:p.color,hype:p.hype}))
        });
        return;
      }

      if(room.players.length>=4){
        ws.send(JSON.stringify({type:"full"}))
        return;
      }

      if(room.players.find(p=>p.color===data.color)){
        ws.send(JSON.stringify({type:"colorTaken"}))
        return;
      }

      const player={
        name:data.name,
        color:data.color,
        pos:0,
        hype:0,
        laps:0,
        skip:false,
        ws:ws
      }

      ws.room = data.room;
      ws.name = data.name;

      room.players.push(player);

      broadcast(data.room,{
        type:"players",
        players:room.players.map(p=>({name:p.name,color:p.color,hype:p.hype}))
      })
    }

    // START GAME
    if(data.type==="start"){
      const room = rooms[data.room];
      if(!room || room.players.length<2) return;
      room.started = true;
      room.turn = 0;
      broadcast(data.room,{type:"startGame"});
      broadcast(data.room,{type:"turn",player:room.players[0].name});
    }

    // DICE
    if(data.type==="dice"){
      const room = rooms[ws.room];
      if(!room) return;
      const player = room.players.find(p=>p.name===ws.name);
      if(!player || player.skip) return;

      let pos = player.pos;
      let lapsBonus = 0;
      for(let i=0;i<data.roll;i++){
        pos++;
        if(pos>=boardEvents.length){
          pos = 0;
          player.laps++;
          lapsBonus = 10;
        }
      }
      player.pos = pos;

      const event = boardEvents[pos];
      let hypeChange = 0;
      let skipNext = false;
      let scandalCard = null;

      if(event==="start") hypeChange = 15 + lapsBonus;
      else if(event.startsWith("+")) hypeChange = parseInt(event.slice(1)) + lapsBonus;
      else if(event==="-10") hypeChange = -10 + lapsBonus;
      else if(event==="skip") skipNext = true;
      else if(event==="-10skip"){ hypeChange=-10+lapsBonus; skipNext=true;}
      else if(event==="scandal"){
        scandalCard = scandalCards[Math.floor(Math.random()*scandalCards.length)];
        if(scandalCard.hype==="all-3"){
          room.players.forEach(p=>p.hype -=3);
        } else hypeChange = scandalCard.hype + lapsBonus;
        if(scandalCard.skip) skipNext = true;
      } else if(event==="risk"){
        const roll = Math.floor(Math.random()*6)+1;
        hypeChange = (roll<=3?-5:5)+lapsBonus;
      }

      player.hype += hypeChange;
      if(player.hype<0) player.hype=0;
      if(skipNext) player.skip=true;

      broadcast(ws.room,{
        type:"move",
        name:player.name,
        pos:player.pos,
        hype:player.hype,
        color:player.color,
        hypeChange:hypeChange,
        scandalCard:scandalCard
      });

      if(player.hype>=70){
        broadcast(ws.room,{type:"win",name:player.name});
        return;
      }

      nextTurn(ws.room);
    }
  });

  ws.on("close", ()=>{
    const room = rooms[ws.room];
    if(!room) return;
    room.players = room.players.filter(p=>p.name!==ws.name);
    broadcast(ws.room,{
      type:"players",
      players:room.players.map(p=>({name:p.name,color:p.color,hype:p.hype}))
    });
  });
});

server.listen(process.env.PORT||3000, ()=>console.log("Server running"));
