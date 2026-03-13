document.addEventListener("DOMContentLoaded",()=>{

// координаты клеток
const cells = [
{x:103,y:600},{x:107,y:473},{x:100,y:353},{x:103,y:235},{x:91,y:134},
{x:213,y:98},{x:353,y:102},{x:505,y:105},{x:659,y:102},{x:802,y:103},
{x:920,y:123},{x:928,y:252},{x:933,y:359},{x:926,y:466},{x:907,y:601},
{x:802,y:611},{x:651,y:608},{x:501,y:603},{x:361,y:611},{x:213,y:615}
];

const cellActions = [
"start","+3","+2","scandal","risk","+2","scandal","+3","+5","-15",
"-8skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
];

const player = document.getElementById("player");
const hypeText = document.getElementById("hype");

let position = 0;
let hype = 0;
let skipTurn = false;

// ставим фишку на клетку
function moveToCell(i){
    const cell = cells[i];
    player.style.left = cell.x+"px";
    player.style.top = cell.y+"px";
}

// стартовая позиция
moveToCell(position);

// действия клетки
function applyCell(){
    const action = cellActions[position];

    if(action==="start") return;

    if(action.includes("+")){
        hype += parseInt(action);
    }

    if(action.includes("-") && !action.includes("skip")){
        hype += parseInt(action);
    }

    if(action==="skip"){
        alert("Пропусти ход");
        skipTurn = true;
    }

    if(action==="-8skip"){
        hype -=8;
        skipTurn = true;
        alert("-8 хайпа и пропуск хода");
    }

    if(action==="risk"){
        const roll = Math.floor(Math.random()*6)+1;
        if(roll<=3){
            hype -=5;
            alert("Риск не удался -5 хайпа");
        }else{
            hype +=5;
            alert("Риск удался +5 хайпа");
        }
    }

    if(action==="scandal"){
    const scandals=[
        {t:"Перегрел аудиторию 🔥",v:-1},
        {t:"Громкий заголовок 🫣",v:-2},
        {t:"Это монтаж 😱",v:-3},
        {t:"Меня взломали #️⃣",v:-3},
        {t:"Подписчики в шоке 😮",v:-4},
        {t:"Удаляй пока не поздно 🤫",v:-5},
        {t:"Это контент 🙄 (пропусти ход)",v:-5,skip:true}
    ];

    const s = scandals[Math.floor(Math.random()*scandals.length)];
    // цвет в зависимости от плюса/минуса
    const sign = s.v>=0?"+":"";
    alert(`${s.t}\n${sign}${s.v} хайп`);
    
    hype += s.v;
    if(s.skip) skipTurn = true;
}

    if(hype<0) hype=0;
    hypeText.innerText = "Хайп: "+hype;

    if(hype>=100){
        alert("ПОБЕДА! Ты набрал 100 хайпа!");
    }
}

// движение фишки
function movePlayer(steps){
    let i=0;
    function step(){
        if(i<steps){
            position++;
            if(position>=cells.length) position=0;
            moveToCell(position);
            i++;
            setTimeout(step,350);
        }else{
            applyCell();
        }
    }
    step();
}

// кубик
document.getElementById("dice").addEventListener("click",()=>{
    if(skipTurn){
        alert("Пропускаешь ход");
        skipTurn=false;
        return;
    }
    const dice = Math.floor(Math.random()*6)+1;
    alert("Выпало: "+dice);
    movePlayer(dice);
});

});
