const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {}; // {roomCode: {players: [], states: []}}

wss.on('connection', ws => {
    ws.on('message', msg => {
        const data = JSON.parse(msg);

        switch(data.type){
            case "join":
                if(!rooms[data.room]) rooms[data.room]={players:[], states:[]};
                ws.room=data.room;
                ws.name=data.name;
                ws.color=data.color;
                rooms[data.room].players.push(ws);

                // Отправляем текущие состояния новым игрокам
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"players", players:rooms[data.room].players.map(pl=>({name:pl.name,color:pl.color}))}));
                });
                break;

            case "move":
                // Рассылаем движение всем игрокам
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"move", player:data.player, position:data.position, hype:data.hype}));
                });
                break;

            case "dice":
                // Рассылаем результат кубика всем
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"dice", player:data.player, value:data.value}));
                });
                break;
        }
    });

    ws.on('close', ()=>{
        if(ws.room && rooms[ws.room]){
            rooms[ws.room].players = rooms[ws.room].players.filter(p=>p!==ws);
        }
    });
});

server.listen(process.env.PORT || 3000, ()=>{
    console.log("Server running on port 3000");
});
