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

  haveLost(cells) {
    const flattened = cells.flat()
    return flattened[0] == true && flattened.slice(1).every(c => !c)
  }

  cloneCells(cells) {
    return cells.map(r => r.slice())
  }

  canWin(cells) {
    for (let i = 0; i < this.#height; i++) {
      for (let j = 0; j < this.#width; j++) {
        if (cells[i][j] && i + j > 0) {
          const copy = this.cloneCells(cells)
          this.eatChocolate(copy, i, j)
          if (!this.canWin(copy)) { return true }
        }
      }
    }
    return false
  }

  determineWinner() {
    if (this.canWin(this.#cells)) {
      return this.#move
    }
    else return this.#move === 'A' ? 'B' : 'A'
  }

  startMove() {
    this.#info.textContent = `Player ${this.#move}'s move. `
    if (this.haveLost(this.#cells)) {
      this.#info.textContent += `Player ${this.#move} has lost`
    }
    else this.#info.textContent += `Player ${this.determineWinner()} can still win`
  }

  eatChocolate(cells, row, col) {
    for (let i = row; i < this.#height; i++) {
      for (let j = col; j < this.#width; j++) {
        cells[i][j] = false;
      }
    }
  }

  applyMove(row, col) {
    if (this.#cells[row][col] && row + col > 0) {
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