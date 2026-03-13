const player=document.getElementById("player");
const hypeBar=document.getElementById("hypeBar");
const hypeTextLabel=document.getElementById("hypeText");

// Координаты клеток
const cells=[
{x:103,y:600},{x:107,y:473},{x:100,y:353},{x:103,y:235},{x:91,y:134},
{x:213,y:98},{x:353,y:102},{x:505,y:105},{x:659,y:102},{x:802,y:103},
{x:920,y:123},{x:928,y:252},{x:933,y:359},{x:926,y:466},{x:907,y:601},
{x:802,y:611},{x:651,y:608},{x:501,y:603},{x:361,y:611},{x:213,y:615}
];

// Действия клеток
const cellActions=[
"start","+3","+2","scandal","risk","+2","scandal","+3","+5",
"-15","-8skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
];

let position=0, hype=0, skipTurn=false, rounds=0, gameEnded=false;

// Настройки игрока
const playerName = localStorage.getItem("name");
const playerColor = localStorage.getItem("color") || "yellow";

player.style.background=playerColor;

// WebSocket
const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

socket.addEventListener('open', ()=> {
    socket.send(JSON.stringify({type:"join", name:playerName, room:localStorage.getItem("room"), color:playerColor}));
});

socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if(data.type==="move" && data.player!==playerName){
        let el = document.querySelector(`.player[data-name='${data.player}']`);
        if(!el){
            el = document.createElement("div");
            el.className="player";
            el.style.background = data.color;
            el.setAttribute("data-name", data.player);
            document.getElementById("board").appendChild(el);
        }
        el.style.left = data.position.x+"px";
        el.style.top = data.position.y+"px";
    }
    if(data.type==="dice" && data.player!==playerName){
        showScandalPopup(`Игрок ${data.player} бросил кубик: ${data.value}`,0);
    }
});

// ---------------- Функции игры -----------------

function showGameRules(){
    const rules=`<b>Правила "Литвин: Путь к хайпу"</b><br><br>
    1. Цель: набрать 70 хайпа.<br>
    2. Каждый ход бросаем кубик и двигаем фишку.<br>
    3. Попадание на +Хайп / Скандал / Риск изменяет очки.<br>
    4. За каждый полный круг +7 хайпа.<br>
    5. Скандалы уменьшают хайп, могут пропустить ход.<br>
    6. Риск: бросок кубика дает шанс +5 или -5.<br><br>
    Удачи!`;
    const popup=document.createElement("div");
    popup.className="scandalPopup";
    popup.innerHTML=rules;
    document.body.appendChild(popup);
    setTimeout(()=>popup.remove(),6000);
}

showGameRules();

// Плавающий +Хайп/-Хайп
function showFloatingHype(amount){
    if(amount===0) return;
    const floatDiv=document.createElement("div");
    floatDiv.className="floatingHype";
    floatDiv.innerText=(amount>0?"+":"−")+Math.abs(amount);
    floatDiv.style.left=player.style.left;
    floatDiv.style.top=player.style.top;
    document.getElementById("board").appendChild(floatDiv);
    let offset=0;
    const interval=setInterval(()=>{
        offset-=2;
        floatDiv.style.top=`calc(${player.style.top} + ${offset}px)`;
    },30);
    setTimeout(()=>{clearInterval(interval); floatDiv.remove();},800);
}

function updateHype(){
    if(hype<0) hype=0;
    if(hype>70) hype=70;
    hypeBar.style.width=(hype/70*100)+"%";
    hypeTextLabel.innerText=`${hype} / 70`;
    if(hype>=70 && !gameEnded){
        showScandalPopup("🎉 ПОБЕДА! Ты набрал 70 хайпа! 🎉",0);
        gameEnded=true;
    }
}

function moveToCell(i){
    const cell=cells[i];
    player.style.left=cell.x+"px";
    player.style.top=cell.y+"px";
}

moveToCell(position);

// Всплывающее окно
function showScandalPopup(text,amount){
    const popup=document.createElement("div");
    popup.className="scandalPopup";
    if(amount!==0){
        popup.innerHTML=`${text} <br> ${amount>0?"+":"−"}${Math.abs(amount)} хайп`;
        showFloatingHype(amount);
    } else { popup.innerHTML=text; }
    document.body.appendChild(popup);
    setTimeout(()=>popup.remove(),2500);
}

// Применение действия клетки
function applyCell(){
    if(gameEnded) return;
    const action=cellActions[position];
    let amount=0;

    if(action==="start"){
        amount=15; hype+=15; showFloatingHype(amount);
    } else if(action.includes("+") && !action.includes("skip")){ 
        amount=parseInt(action); hype+=amount; 
    } else if(action.includes("-") && !action.includes("skip")){ 
        amount=parseInt(action); hype+=amount; 
    } else if(action==="skip") skipTurn=true;
    else if(action==="-8skip"){ amount=-8; hype-=8; skipTurn=true; }
    else if(action==="risk"){ riskAction(); return; }
    else if(action==="scandal"){
        const scandals=[
            {t:"Перегрел аудиторию 🔥",v:-1},
            {t:"Громкий заголовок 🫣",v:-2},
            {t:"Это монтаж 😱",v:-3},
            {t:"Меня взломали #️⃣",v:-3},
            {t:"Подписчики в шоке 😮",v:-4},
            {t:"Удаляй пока не поздно 🤫",v:-5},
            {t:"Это контент 🙄 (пропусти ход)",v:-5,skip:true}
        ];
        const s=scandals[Math.floor(Math.random()*scandals.length)];
        amount=s.v; hype+=s.v;
        if(s.skip) skipTurn=true;
        showScandalPopup(s.t,amount);
    } else showFloatingHype(amount);

    updateHype();
    socket.send(JSON.stringify({type:"move", player:playerName, position:{x:cells[position].x,y:cells[position].y}, hype:hype}));
}

// Действие Риск
function riskAction(){
    showScandalPopup("Риск! Бросьте кубик: 1-3 → -5, 4-6 → +5",0);
    document.getElementById("dice").onclick=()=>{
        const dice=Math.floor(Math.random()*6)+1;
        const amount=(dice<=3)?-5:5;
        hype+=amount;
        showScandalPopup(`Выпало: ${dice}`,amount);
        updateHype();
        document.getElementById("dice").onclick=normalDiceClick;
        socket.send(JSON.stringify({type:"dice", player:playerName, value:dice}));
    }
}

// Движение фишки
function movePlayer(steps){
    if(gameEnded) return;
    let i=0;
    function step(){
        if(i<steps){
            position++;
            if(position>=cells.length){
                position=0; rounds++; hype+=7; showFloatingHype(7); updateHype();
            }
            moveToCell(position);
            i++;
            setTimeout(step,400);
        } else applyCell();
    }
    step();
}

// Кубик
function normalDiceClick(){
    if(skipTurn){ showScandalPopup("Пропускаешь ход",0); skipTurn=false; return; }
    const dice=Math.floor(Math.random()*6)+1;
    showScandalPopup("Выпало: "+dice,0);
    movePlayer(dice);
    socket.send(JSON.stringify({type:"dice", player:playerName, value:dice}));
}

document.getElementById("dice").onclick=normalDiceClick;
