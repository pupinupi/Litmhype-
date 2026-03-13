const board = document.getElementById("board")
const textarea = document.getElementById("coords")

let cells = []

board.addEventListener("click", function(e){

const rect = board.getBoundingClientRect()

const x = Math.round(e.clientX - rect.left)
const y = Math.round(e.clientY - rect.top)

const dot = document.createElement("div")
dot.className = "dot"
dot.style.left = x + "px"
dot.style.top = y + "px"

board.appendChild(dot)

cells.push({x,y})

updateTextarea()

})

function updateTextarea(){

textarea.value = JSON.stringify(cells, null, 4)

}

function copyCoords(){

textarea.select()
document.execCommand("copy")
alert("Координаты скопированы!")

}

function resetCoords(){

cells = []
textarea.value = ""

const dots = document.querySelectorAll(".dot")

dots.forEach(d=>d.remove())

}
