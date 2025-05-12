const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImage = document.querySelector(".save-img"),
  ctx = canvas.getContext("2d")

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000"

  
const undoStack = []
let redoStack = []
// Add animation class to buttons when clicked
const buttons = document.querySelectorAll("button")
buttons.forEach((button) => {
  button.addEventListener("click", function () {
    this.classList.add("button-click")
    setTimeout(() => {
      this.classList.remove("button-click")
    }, 500)
  })
})

// Add animation to tools when selected
toolBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    this.classList.add("tool-animation")
    setTimeout(() => {
      this.classList.remove("tool-animation")
    }, 1000)
  })
})

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = selectedColor
}

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  setCanvasBackground()

  // Add initial animations to rows
  const rows = document.querySelectorAll(".row")
  rows.forEach((row, index) => {
    row.style.opacity = "0"
    setTimeout(() => {
      row.style.opacity = "1"
      row.style.transform = "translateY(0)"
    }, 100 * index)
  })
})

// Resize canvas when window is resized
window.addEventListener("resize", () => {
  // Save the current canvas content
  const tempCanvas = document.createElement("canvas")
  const tempCtx = tempCanvas.getContext("2d")
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  tempCtx.drawImage(canvas, 0, 0)

  // Resize the canvas
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  // Restore the canvas content
  setCanvasBackground()
  ctx.drawImage(tempCanvas, 0, 0)
})

const drawRect = (e) => {
    if (!fillColor.checked) {
        const width = prevMouseX - e.offsetX;
        const height = prevMouseY - e.offsetY;
        return ctx.strokeRect(e.offsetX, e.offsetY,
        width, height);

    }
    const width = prevMouseX - e.offsetX;
    const height = prevMouseY - e.offsetY;
    ctx.fillRect(e.offsetX, e.offsetY, width, height);
}

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX -
    e.offsetX), 2) 
    + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    ctx.beginPath(); 
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY); 
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); 
    ctx.closePath(); 
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a square
const drawSquare = (e) => {
    const sideLength = Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    ctx.rect(e.offsetX, e.offsetY, sideLength, sideLength);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a hexagon
const drawHexagon = (e) => {
    const sideLength =
    Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (2 * Math.PI / 6) * i;
        const x = e.offsetX + sideLength 
        * Math.cos(angle);
        const y = e.offsetY + sideLength 
        * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a pentagon
const drawPentagon = (e) => {
    const sideLength = 
    Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI / 5) * 
        i - Math.PI / 2;
        const x = e.offsetX + sideLength 
        * Math.cos(angle);
        const y = e.offsetY + sideLength 
        * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

const drawArrow = (e) => {
    const headLength = 10;
    const angle = Math.atan2(e.offsetY - prevMouseY,
    e.offsetX - prevMouseX);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(e.offsetX - headLength * 
    Math.cos(angle - Math.PI / 6), 
    e.offsetY - headLength * 
    Math.sin(angle - Math.PI / 6));
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(e.offsetX - headLength * 
    Math.cos(angle + Math.PI / 6),
    e.offsetY - headLength * 
    Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

const startDraw = (e) => {
  isDrawing = true
  prevMouseX = e.offsetX
  prevMouseY = e.offsetY
  ctx.beginPath()
  ctx.lineWidth = brushWidth
  ctx.strokeStyle = selectedColor
  ctx.fillStyle = selectedColor
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
  undoStack.push(snapshot)
  redoStack = []
}

const drawPencil = (e) => {
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
}

const drawing = (e) => {
  if (!isDrawing) return
  ctx.putImageData(snapshot, 0, 0)

  if (selectedTool === "brush" || selectedTool === "pencil" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
  } else if (selectedTool === "rectangle") {
    drawRect(e)
  } else if (selectedTool === "circle") {
    drawCircle(e)
  } else if (selectedTool === "triangle") {
    drawTriangle(e)
  } else if (selectedTool === "square") {
    drawSquare(e)
  } else if (selectedTool === "hexagon") {
    drawHexagon(e)
  } else if (selectedTool === "pentagon") {
    drawPentagon(e)
  } else if (selectedTool === "line") {
    drawLine(e)
  } else if (selectedTool === "arrow") {
    drawArrow(e)
  } else {
    drawPencil(e)
  }
}

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active")
    btn.classList.add("active")
    selectedTool = btn.id
    console.log(selectedTool)
  })
})

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value))

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected")
    btn.classList.add("selected")
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color")
  })
})

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value
  colorPicker.parentElement.click()
})

clearCanvas.addEventListener("click", () => {
  // Add a fade out effect before clearing
  const fadeEffect = setInterval(() => {
    if (!canvas.style.opacity) {
      canvas.style.opacity = 1
    }
    if (canvas.style.opacity > 0) {
      canvas.style.opacity -= 0.1
    } else {
      clearInterval(fadeEffect)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setCanvasBackground()
      canvas.style.opacity = 1
    }
  }, 30)
})

saveImage.addEventListener("click", () => {
  // Add a flash effect when saving
  canvas.style.boxShadow = "0 0 30px rgba(37, 117, 252, 0.8)"
  setTimeout(() => {
    canvas.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.15)"
    const link = document.createElement("a")
    link.download = `${Date.now()}.jpg`
    link.href = canvas.toDataURL()
    link.click()
  }, 300)
})

canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", () => (isDrawing = false))

// Add touch support for mobile devices
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  canvas.dispatchEvent(mouseEvent)
})

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  canvas.dispatchEvent(mouseEvent)
})

canvas.addEventListener("touchend", () => {
  const mouseEvent = new MouseEvent("mouseup", {})
  canvas.dispatchEvent(mouseEvent)
})

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(undoStack.pop())
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0)
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(redoStack[redoStack.length - 1])
    ctx.putImageData(redoStack.pop(), 0, 0)
  }
}

document.getElementById("undo-btn").addEventListener("click", undo)
document.getElementById("redo-btn").addEventListener("click", redo)

