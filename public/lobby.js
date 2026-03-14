const socket = new WebSocket(location.origin.replace(/^http/, "ws"));
let color=null;

document.querySelectorAll(".color").forEach(c=>{
  c.onclick=()=>{
    document.querySelectorAll(".color").forEach(x=>x.classList.remove("selected"));
    c.classList.add("selected");
    color = c.dataset.color;
  }
});

document.getElementById("join").onclick=()=>{
  const name = document.getElementById("name").value.trim();
  const room = document.getElementById("room").value.trim();
  if(!name || !room || !color){ alert("Введите имя, комнату и выберите фишку"); return;}
  localStorage.setItem("name", name);
  localStorage.setItem("room", room);
  localStorage.setItem("color", color);
  socket.send(JSON.stringify({type:"join", name:name, room:room, color:color}));
};

document.getElementById("start").onclick=()=>{
  socket.send(JSON.stringify({type:"start", room:localStorage.getItem("room")}));
};

socket.onmessage = e=>{
  const data=JSON.parse(e.data);
  if(data.type==="players"){
    let html="<h3>Игроки</h3>";
    data.players.forEach(p=>{ html+=`<div style="color:${p.color}">${p.name}</div>`; });
    document.getElementById("players").innerHTML=html;
  }
  if(data.type==="startGame") location="room.html";
  if(data.type==="colorTaken") alert("Эта фишка занята");
  if(data.type==="full") alert("Комната заполнена");
};
