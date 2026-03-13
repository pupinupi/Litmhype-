// координаты клеток
const cells = [
{x:103,y:600},{x:107,y:473},{x:100,y:353},{x:103,y:235},{x:91,y:134},
{x:213,y:98},{x:353,y:102},{x:505,y:105},{x:659,y:102},{x:802,y:103},
{x:920,y:123},{x:928,y:252},{x:933,y:359},{x:926,y:466},{x:907,y:601},
{x:802,y:611},{x:651,y:608},{x:501,y:603},{x:361,y:611},{x:213,y:615}
];

// типы клеток
const cellActions = [
"start","+3","+2","scandal","risk","+2","scandal","+3","+5",
"-15","-8skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
];

const player = document.getElementById("player");
const hypeBar = document.getElementById("hypeBar");
const hypeTextLabel = document.getElementById("hypeText");

let position=0, hype=0, skipTurn=false, rounds=0;

// показать правила перед игрой
function showGameRules(){
    const rules = `
    <b>Правила "Литвин: Путь к хайпу"</b><br><br>
    1. Цель: набрать 70 хайпа.<br>
    2. Каждый ход бросаем кубик и двигаем фишку.<br>
    3. Попадание на +Хайп / Скандал / Риск изменяет очки.<br>
    4. За каждый полный круг +10 хайпа.<br>
    5. Скандалы уменьшают хайп, могут пропустить ход.<br>
    6. Риск: бросок кубика дает шанс +5 или -5.<br><br>
    Удачи!
    `;
    const popup=document.createElement("div");
    popup.className="scandalPopup";
    popup.innerHTML=rules;
    document.body.appendChild(popup);
    setTimeout(()=>popup.remove(),6000);
}

// показать плавающий +Хайп / -Хайп
function showFloatingHype(amount){
    if(amount===0) return;
    const floatDiv = document.createElement("div");
    floatDiv.innerText = (amount>0?"+":"−")+Math.abs(amount);
    floatDiv.style.position="absolute";
    floatDiv.style.left=player.style.left;
    floatDiv.style.top=player.style.top;
    floatDiv.style.transform="translate(-50%,-50%)";
    floatDiv.style.fontWeight="bold";
    floatDiv.style.fontSize="20px";
    floatDiv.style.color=amount>0?"#0f0":"#f00";
    floatDiv.style.textShadow="1px 1px 5px #000";
    floatDiv.style.pointerEvents="none";
    document.getElementById("board").appendChild(floatDiv);
    let offset = 0;
    const interval = setInterval(()=>{
        offset -= 2;
        floatDiv.style.top = `calc(${player.style.top} + ${offset}px)`;
    }, 30);
    setTimeout(()=>{
        clearInterval(interval);
        floatDiv.remove();
    }, 800);
}

// подсветка клетки
function moveToCell(i){
    const cell=cells[i];
    player.style.left=cell.x+"px";
    player.style.top=cell.y+"px";

    const highlight=document.createElement("div");
    highlight.style.position="absolute";
    highlight.style.width="40px";
    highlight.style.height="40px";
    highlight.style.border="3px solid #fff";
    highlight.style.borderRadius="50%";
    highlight.style.left=cell.x+"px";
    highlight.style.top=cell.y+"px";
    highlight.style.transform="translate(-50%,-50%)";
    highlight.style.pointerEvents="none";
    highlight.style.boxShadow="0 0 15px #ff0";
    document.getElementById("board").appendChild(highlight);
    setTimeout(()=>highlight.remove(),350);
}

// старт
moveToCell(position);

// обновление шкалы хайпа
function updateHype(){
    if(hype<0) hype=0;
    if(hype>70) hype=70;
    const percent=(hype/70)*70;
    hypeBar.style.width = percent + "%";
    hypeTextLabel.innerText = `${hype} / 70`;
}

// показать карточку скандала
function showScandalPopup(text, amount){
    const popup=document.createElement("div");
    popup.className="scandalPopup";
    if(amount!==0){
        popup.innerHTML=`${text} <br> ${amount>0?"+":"−"}${Math.abs(amount)} хайп`;
        showFloatingHype(amount);
    } else {
        popup.innerHTML=text;
    }
    document.body.appendChild(popup);
    setTimeout(()=>popup.remove(),2500);
}

// применение действия клетки
function applyCell(){
    const action=cellActions[position];
    if(action==="start") return;

    let amount = 0;

    if(action.includes("+") && !action.includes("skip")) { amount = parseInt(action); hype += amount; }
    if(action.includes("-") && !action.includes("skip")) { amount = parseInt(action); hype += amount; }
    if(action==="skip") skipTurn=true;
    if(action==="-8skip"){ amount=-8; hype-=8; skipTurn=true; }

    if(action==="risk"){ riskAction(); return; }
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
        amount = s.v;
        hype += s.v;
        if(s.skip) skipTurn=true;
        showScandalPopup(s.t, amount);
    } else {
        showFloatingHype(amount);
    }

    updateHype();

    if(hype>=70) showScandalPopup("🎉 ПОБЕДА! Ты набрал 700 хайпа! 🎉", 0);
}

// Риск: шанс бросить кубик
function riskAction(){
    showScandalPopup("Риск! Бросьте кубик: 1-3 → -5, 4-6 → +5", 0);
    document.getElementById("dice").onclick = () => {
        const dice = Math.floor(Math.random()*6)+1;
        let amount = (dice<=3)?-5:5;
        hype += amount;
        showScandalPopup(`Выпало: ${dice}`, amount);
        updateHype();
        document.getElementById("dice").onclick = normalDiceClick;
    }
}

// движение фишки
function movePlayer(steps){
    let i=0;
    function step(){
        if(i<steps){
            position++;
            if(position>=cells.length){
                position=0;
                rounds++;
                hype+=10;
                showFloatingHype(10);
                updateHype();
            }
            moveToCell(position);
            i++;
            setTimeout(step,400);
        } else {
            applyCell();
        }
    }
    step();
}

// кнопка кубика
function normalDiceClick(){
    if(skipTurn){ showScandalPopup("Пропускаешь ход",0); skipTurn=false; return; }
    const dice = Math.floor(Math.random()*6)+1;
    showScandalPopup("Выпало: "+dice,0);
    movePlayer(dice);
}

document.getElementById("dice").onclick = normalDiceClick;
