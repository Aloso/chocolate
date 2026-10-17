class ChocolateBar {
  #width 
  #height 
  #showEval

  /** @type {number[]} */
  #rows
  #el
  #info
  #modal
  #currentPlayer
  /** @type {Map<string, boolean>} */
  #cache

  constructor(width, height, showEval) {
    this.#el = document.getElementById("chocolate-bar")
    this.#info = document.getElementById("info")
    this.#modal = document.getElementById("modal")
    this.#width = width
    this.#height = height
    this.#showEval = showEval
  }

  async startGame(title) {
    const [width, height, showEval] = await this.showModal({
      type: 'prompt',
      title,
      text: 'Set the dimensions of the chocolate bar:',
      defaults: [this.#width, this.#height]
    })
    this.initGame(width, height, showEval)
    this.startMove()
  }

  initGame(/** @type number */ width, /** @type number */ height, /** @type boolean */ showEval) {
    this.#width = width
    this.#height = height
    this.#showEval = showEval
    sessionStorage.setItem("current-state", JSON.stringify({ width, height, showEval }))

    this.#rows = Array.from({ length: this.#height }).fill(this.#width)
    this.#currentPlayer = 'A'
    this.#cache = new Map()

    this.#el.style.setProperty("--rows", height)
    this.#el.style.setProperty("--cols", width)
    this.#el.innerHTML = ''

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
  }

  startMove() {
    this.#info.textContent = `Player ${this.#currentPlayer}'s move.\n`
    if (this.haveLost(this.#rows)) {
      this.#info.textContent = `Player ${this.#currentPlayer} has lost!`
      setTimeout(() => {
        board.startGame('Restart game?')
      }, 1500)
    } else if (this.#showEval) {
      this.#info.textContent += `Player ${this.determineWinner()} can still win.`
    }
  }

  haveLost(rows) {
    return rows[0] == 1 && rows.slice(1).every(r => r == 0)
  }

  canWin(rows) {
    const cacheKey = rows.join(",")
    const cached = this.#cache.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    for (let i = 0; i < this.#height; i++) {
      for (let j = 0; j < this.#width; j++) {
        if (rows[i] > j && i + j > 0) {
          const copy = rows.slice()
          this.eatChocolate(copy, i, j)
          if (!this.canWin(copy)) {
            this.#cache.set(cacheKey, true)
            return true
          }
        }
      }
    }
    this.#cache.set(cacheKey, false)
    return false
  }

  determineWinner() {
    if (this.canWin(this.#rows)) {
      return this.#currentPlayer
    } else {
      return this.#currentPlayer === 'A' ? 'B' : 'A'
    }
  }

  eatChocolate(rows, row, col) {
    for (let i = row; i < this.#height; i++) {
      rows[i] = Math.min(rows[i], col)
    }
  }

  applyMove(row, col) {
    if (this.#rows[row] > col && row + col > 0) {
      this.eatChocolate(this.#rows, row, col)
      for (let i = row; i < this.#height; i++) {
        for (let j = col; j < this.#width; j++) {
          this.#el.children[i * this.#width + j].classList.add("removed");
        }
      }
      this.#currentPlayer = this.#currentPlayer === 'A' ? 'B' : 'A'
      this.startMove()
    }
  }

  async showModal({ type, title, text, defaults }) {
    return new Promise(resolve => {
      this.#modal.textContent = ''
      if (title) {
        const elem = document.createElement('h2')
        elem.textContent = title
        this.#modal.append(elem)
      }
      if (text) {
        const elem = document.createElement('p')
        elem.textContent = text
        this.#modal.append(elem)
      }

      if (type === "alert") {
        this.#modal.append(this.makeButton('Okay', 'modal-submit', () => {
          this.#modal.innerHTML = ''
          resolve(false)
        }))
      } else if (type === "confirm") {
        this.#modal.append(this.makeButton('Cancel', 'modal-cancel', () => {
          this.#modal.innerHTML = ''
          resolve(false)
        }))
        this.#modal.append(this.makeButton('Confirm', 'modal-confirm', () => {
          this.#modal.innerHTML = ''
          resolve(true)
        }))
      } else if (type === "prompt") {
        const w = this.makeNumberInput('modal-input', defaults[0] ?? "6")
        const h = this.makeNumberInput('modal-input', defaults[1] ?? "6")
        const e = this.makeCheckboxInput('Show evaluation', 'eval-checkbox', this.#showEval)
        this.#modal.append(w, h, e)
        this.#modal.append(this.makeButton('Submit', 'modal-submit', () => {
          const width = +w.value
          const height = +h.value
          const showEval = e.children[0].checked
          if (Number.isNaN(width) || Number.isNaN(height) || width === 0 || height === 0) {
            return
          }
          this.#modal.innerHTML = ''
          resolve([width, height, showEval])
        }))
      }
    })
  }

  makeButton(label, className, onClick) {
    const elem = document.createElement("button")
    elem.textContent = label
    elem.type = "button"
    elem.className = className
    elem.addEventListener("click", onClick)
    return elem
  }

  makeNumberInput(className, defaultValue) {
    const elem = document.createElement("input")
    elem.type = "number"
    elem.value = defaultValue
    elem.className = className
    elem.min = 1
    elem.max = 10
    return elem
  }

  makeCheckboxInput(label, className, defaultValue) {
    const elem = document.createElement("input")
    elem.type = "checkbox"
    elem.checked = defaultValue ?? false

    const labelElem = document.createElement("label")
    labelElem.className = className
    labelElem.append(elem, label)
    return labelElem
  }
}

const previousState = sessionStorage.getItem("current-state")
const { width, height, showEval } = previousState
  ? JSON.parse(previousState)
  : { width: 6, height: 6, showEval: false }

const board = new ChocolateBar(width, height, showEval)
board.startGame('Start game')
