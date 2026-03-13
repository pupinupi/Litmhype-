const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', ws => {
    ws.on('message', msg => {
        const data = JSON.parse(msg);

        switch(data.type){
            case "join":
                if(!rooms[data.room]) rooms[data.room]={players:[]};
                if(rooms[data.room].players.length >=4){
                    ws.send(JSON.stringify({type:"full"}));
                    ws.close();
                    return;
                }
                ws.room=data.room;
                ws.name=data.name;
                ws.color=data.color;
                ws.hype=0;
                rooms[data.room].players.push(ws);

                const playersInfo = rooms[data.room].players.map(p=>({name:p.name,color:p.color,hype:p.hype}));
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"players", players:playersInfo}));
                });
                break;

                case "startGame":
    if(rooms[data.room].players.length>=2){
        rooms[data.room].gameStarted=true;
        rooms[data.room].players.forEach(p=>{
            p.send(JSON.stringify({type:"gameStarted"}));
        });
    } else {
        ws.send(JSON.stringify({type:"error","message":"Нужно минимум 2 игрока"}));
    }
    break;

            case "move":
                ws.hype=data.hype;
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"move", player:data.player, position:data.position, hype:data.hype, color:ws.color}));
                });
                break;

            case "dice":
                rooms[data.room].players.forEach(p=>{
                    p.send(JSON.stringify({type:"dice", player:data.player, value:data.value}));
                });
                break;
        }
    });

    ws.on('close', ()=>{
        if(ws.room && rooms[ws.room]){
            rooms[ws.room].players = rooms[ws.room].players.filter(p=>p!==ws);
            const playersInfo = rooms[ws.room].players.map(p=>({name:p.name,color:p.color,hype:p.hype}));
            rooms[ws.room].players.forEach(p=>{
                p.send(JSON.stringify({type:"players", players:playersInfo}));
            });
        }
    });
});

server.listen(process.env.PORT || 3000, ()=> console.log("Server running on port 3000"));
