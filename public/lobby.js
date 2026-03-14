const socket=new WebSocket(location.origin.replace("http","ws"))

let color=null
let playersDiv=document.getElementById("players")

document.querySelectorAll(".color").forEach(c=>{
  c.onclick=()=>{
    document.querySelectorAll(".color").forEach(x=>x.classList.remove("selected"))
    c.classList.add("selected")
    color=c.dataset.color
  }
})

document.getElementById("join").onclick=()=>{
  const name=document.getElementById("name").value
  const room=document.getElementById("room").value
  if(!name||!room||!color) return alert("Введите имя, код комнаты и выберите цвет")

  localStorage.setItem("name",name)
  localStorage.setItem("room",room)
  localStorage.setItem("color",color)

  socket.send(JSON.stringify({
    type:"join",
    name:name,
    room:room,
    color:color
  }))
}

document.getElementById("start").onclick=()=>{
  socket.send(JSON.stringify({
    type:"start",
    room:localStorage.getItem("room")
  }))
}

socket.onmessage=e=>{
  const data=JSON.parse(e.data)
  if(data.type==="players"){
    let html="<h3>Игроки</h3>"
    data.players.forEach(p=>{
      html+=`
      <div style="color:${p.color}; display:flex; align-items:center; margin:4px 0;">
        <div style="width:20px; height:20px; background:${p.color}; border-radius:50%; margin-right:6px;"></div>
        ${p.name}
      </div>
      `
    })
    playersDiv.innerHTML=html
  }

  if(data.type==="startGame"){
    location="room.html"
  }
}
