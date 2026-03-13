// координаты клеток
const cells = [
{x:103,y:600},{x:107,y:473},{x:100,y:353},{x:103,y:235},{x:91,y:134},
{x:213,y:98},{x:353,y:102},{x:505,y:105},{x:659,y:102},{x:802,y:103},
{x:920,y:123},{x:928,y:252},{x:933,y:359},{x:926,y:466},{x:907,y:601},
{x:802,y:611},{x:651,y:608},{x:501,y:603},{x:361,y:611},{x:213,y:615}
]

// действия клеток
const cellActions = [
"start","+3","+2","scandal","risk","+2","scandal","+3","+5",
"-15","-8skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
]

const player = document.getElementById("player")
const hypeText = document.getElementById("hype")

let position=0, hype=0, skipTurn=false

// поставить фишку
function moveToCell(i){
    const cell=cells[i]
    player.style.left=cell.x+"px"
    player.style.top=cell.y+"px"

    // подсветка клетки
    const highlight=document.createElement("div")
    highlight.style.position="absolute"
    highlight.style.width="40px"
    highlight.style.height="40px"
    highlight.style.border="3px solid #fff"
    highlight.style.borderRadius="50%"
    highlight.style.left=cell.x+"px"
    highlight.style.top=cell.y+"px"
    highlight.style.transform="translate(-50%,-50%)"
    highlight.style.pointerEvents="none"
    highlight.style.boxShadow="0 0 15px #ff0"
    document.getElementById("board").appendChild(highlight)
    setTimeout(()=>highlight.remove(),350)
}

moveToCell(position)

// карточки скандала
function showScandalPopup(text){
    const popup=document.createElement("div")
    popup.style.position="fixed"
    popup.style.top="50%"
    popup.style.left="50%"
    popup.style.transform="translate(-50%,-50%)"
    popup.style.background="linear-gradient(45deg,#ff4444,#ffcc00)"
    popup.style.color="#fff"
    popup.style.fontSize="22px"
    popup.style.padding="20px 40px"
    popup.style.borderRadius="15px"
    popup.style.boxShadow="0 0 20px #000"
    popup.style.zIndex="9999"
    popup.innerText=text
    document.body.appendChild(popup)
    setTimeout(()=>popup.remove(),2000)
}

// действия клетки
function applyCell(){
    const action=cellActions[position]
    if(action==="start") return

    if(action.includes("+")) hype+=parseInt(action)
    if(action.includes("-") && !action.includes("skip")) hype+=parseInt(action)
    if(action==="skip") skipTurn=true
    if(action==="-8skip"){ hype-=8; skipTurn=true }

    if(action==="risk"){
        const roll=Math.floor(Math.random()*6)+1
        if(roll<=3){ hype-=5; showScandalPopup("Риск не удался −5 хайпа") }
        else { hype+=5; showScandalPopup("Риск удался +5 хайпа") }
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
        ]
        const s=scandals[Math.floor(Math.random()*scandals.length)]
        hype+=s.v
        if(s.skip) skipTurn=true
        showScandalPopup(s.t)
    }

    if(hype<0) hype=0
    hypeText.innerText="Хайп: "+hype
    if(hype>=100) showScandalPopup("🎉 ПОБЕДА! Ты набрал 100 хайпа! 🎉")
}

// движение фишки автоматически
function movePlayer(steps){
    let i=0
    function step(){
        if(i<steps){
            position++
            if(position>=cells.length) position=0
            moveToCell(position)
            i++
            setTimeout(step,400)
        }else{
            applyCell()
        }
    }
    step()
}

// кубик: показывает цифру и сразу идёт движение
document.getElementById("dice").onclick=()=>{
    if(skipTurn){ showScandalPopup("Пропускаешь ход"); skipTurn=false; return }
    const dice=Math.floor(Math.random()*6)+1
    showScandalPopup("Выпало: "+dice)
    movePlayer(dice)
}
