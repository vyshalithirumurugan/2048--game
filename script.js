const board = document.getElementById('board');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const restartBtn = document.getElementById('restart-btn');
const messageContainer = document.getElementById('message-container');
const message = document.getElementById('message');
const tryAgainBtn = document.getElementById('try-again');
const moveSound = document.getElementById('move-sound');
const mergeSound = document.getElementById('merge-sound');
const gameoverSound = document.getElementById('gameover-sound');

let grid = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;

function initGame() {
  grid = Array(4).fill().map(() => Array(4).fill(0));
  score = 0;
  updateScore();
  messageContainer.style.display = 'none';
  addTile();
  addTile();
  renderBoard();
}

function updateScore() {
  scoreDisplay.textContent = score;
  bestScoreDisplay.textContent = bestScore;
}

function addTile() {
  let empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }
  if (empty.length) {
    let { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function renderBoard() {
  board.innerHTML = '';
  grid.forEach(row => {
    row.forEach(cell => {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      if (cell !== 0) {
        tile.textContent = cell;
        tile.classList.add(`tile-${cell}`);
      }
      board.appendChild(tile);
    });
  });
}

function move(direction) {
  let moved = false;
  let merged = false;

  const rotate = dir => {
    if (dir === 'left') return grid;
    if (dir === 'right') return grid.map(row => row.reverse());
    if (dir === 'up') return rotateLeft(grid);
    if (dir === 'down') return rotateRight(grid);
  };

  const unrotate = (newGrid, dir) => {
    if (dir === 'left') return newGrid;
    if (dir === 'right') return newGrid.map(row => row.reverse());
    if (dir === 'up') return rotateRight(newGrid);
    if (dir === 'down') return rotateLeft(newGrid);
  };

  const rotateLeft = g => g[0].map((_, i) => g.map(row => row[i])).reverse();
  const rotateRight = g => g[0].map((_, i) => g.map(row => row[i]).reverse());

  let temp = rotate(direction);
  let newGrid = [];

  for (let row of temp) {
    let newRow = row.filter(x => x);
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        if (newRow[i] === 2048) win();
        newRow[i + 1] = 0;
        merged = true;
      }
    }
    newRow = newRow.filter(x => x);
    while (newRow.length < 4) newRow.push(0);
    newGrid.push(newRow);
  }

  newGrid = unrotate(newGrid, direction);

  if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
    moved = true;
    grid = newGrid;
    addTile();
    renderBoard();
    updateScore();
    moveSound.play();
    if (merged) mergeSound.play();
  }

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }

  if (isGameOver()) gameOver();
}

function isGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function gameOver() {
  gameoverSound.play();
  message.textContent = 'Game Over';
  messageContainer.style.display = 'flex';
}

function win() {
  message.textContent = 'You Win!';
  messageContainer.style.display = 'flex';
}

restartBtn.addEventListener('click', initGame);
tryAgainBtn.addEventListener('click', initGame);

window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp': move('up'); break;
    case 'ArrowDown': move('down'); break;
    case 'ArrowLeft': move('left'); break;
    case 'ArrowRight': move('right'); break;
  }
});

initGame();
