class ChocolateBar {
  #width
  #height
  #cells
  #el
  #info
  #move

  constructor(width, height) {
    this.#width = width
    this.#height = height
    this.#cells = Array.from({ length: this.#height })
      .fill(0)
      .map(row => Array.from({ length: this.#width }).fill(true))
    this.#move = 'A'

    this.#el = document.getElementById("chocolate-bar")
    this.#el.style.setProperty("--rows", height)
    this.#el.style.setProperty("--cols", width)

    this.#info = document.getElementById("info")

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = document.createElement("button")
        cell.classList.add("cell")
        cell.addEventListener('click', () => {
          this.applyMove(i, j)
        })
        this.#el.append(cell)
      }
    }

    this.startMove()
  }

  startMove() {
    this.#info.textContent = `Player ${this.#move}`
  }

  applyMove(row, col) {
    if (this.#cells[row][col]) {
      for (let i = row; i < this.#height; i++) {
        for (let j = col; j < this.#width; j++) {
          this.#cells[i][j] = false;
          this.#el.children[i * this.#width + j].classList.add("removed");
        }
      }
      this.#move = this.#move === 'A' ? 'B' : 'A'
      this.startMove()
    }
  }
}

const board = new ChocolateBar(5, 4)