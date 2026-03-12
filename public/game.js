// Элемент игрового поля
const board = document.getElementById("board")

// Элемент фишки (для визуализации)
const playerEl = document.getElementById("player")

// Цвет игрока
const color = localStorage.getItem("color") || "yellow"
playerEl.classList.add(color)

// Массив координат клеток
let cells = []

// Функция поставить точку на поле
function placeCell(x, y) {
    const dot = document.createElement("div")
    dot.style.width = "12px"
    dot.style.height = "12px"
    dot.style.background = "red"
    dot.style.borderRadius = "50%"
    dot.style.position = "absolute"
    dot.style.left = (x - 6) + "px"
    dot.style.top = (y - 6) + "px"
    board.appendChild(dot)
    cells.push({x, y})
    console.log(`Клетка ${cells.length}: {x:${x}, y:${y}}`)
}

// Клик по полю добавляет клетку
board.addEventListener("click", e => {
    const rect = board.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    placeCell(x, y)
})

// Кнопка сброса всех точек
const resetBtn = document.createElement("button")
resetBtn.textContent = "Сбросить точки"
resetBtn.style.marginTop = "10px"
resetBtn.onclick = () => {
    cells = []
    const dots = board.querySelectorAll("div")
    dots.forEach(dot => dot.remove())
}
board.parentNode.appendChild(resetBtn)

// Кнопка копирования координат в консоль
const copyBtn = document.createElement("button")
copyBtn.textContent = "Скопировать координаты"
copyBtn.style.marginTop = "10px"
copyBtn.style.marginLeft = "10px"
copyBtn.onclick = () => {
    console.log("Массив координат для game.js:")
    console.log(JSON.stringify(cells, null, 4))
}
board.parentNode.appendChild(copyBtn)

// Опционально: показать фишку на старте
function moveToCell(i){
    if(cells[i]){
        playerEl.style.left = cells[i].x + "px"
        playerEl.style.top = cells[i].y + "px"
    }
}
moveToCell(0)
