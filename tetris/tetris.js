const canvas = document.getElementById("tetris");
const scoreElement = document.querySelector("#score")
const context = canvas.getContext('2d');
const audio = new Audio("https://ia902905.us.archive.org/11/items/TetrisThemeMusic/Tetris.mp3");
const startGameButton = document.querySelector("#gameStart");
const startGameContainer = document.querySelector(".inital-game-screen");
audio.volume = 0.25;


const BLOCK_SIZE = 20;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
context.scale(BLOCK_SIZE, BLOCK_SIZE);
let board = [];
let score = 0;

const TETRAS = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 2, 0, 0],
    [0, 2, 0, 0],
    [0, 2, 0, 0],
    [0, 2, 0, 0]
  ],
  [
    [3, 3, 0],
    [0, 3, 3],
    [0, 0, 0],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  [
    [5, 0],
    [5, 0],
    [5, 5]
  ],
  [
    [0, 6],
    [0, 6],
    [6, 6]
  ],
  [
    [7, 7, 7],
    [0, 7, 0],
    [0, 0, 0],
  ]
];

const colors = [
  null,
  '#5F33FF',
  '#56E8D7',
  '#AF48F6',
  '#D14D63',
  '#DCBE70',
  '#EAF27C',
  '#FF5CEC'
];

const player = {
  position: { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 },
  shape: TETRAS[Math.floor(Math.random() * TETRAS.length)],
}

function initialBoard() {;
  board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
}

let lastTime = 0;
let dropCount = 0;

function updateGame(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCount += deltaTime;

  if (dropCount > 1000) {
    moveDownPlayer();
    dropCount = 0;
  }
  drawFrame();
  window.requestAnimationFrame(updateGame);
}

function moveDownPlayer() {
  if (!collides({...player.position, y: player.position.y + 1}, player.shape)) {
    player.position.y++;
  } else {
    mergeBoard();
    clearRows();
  }
  score += 1;
}

function drawFrame() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = colors[cell];
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  player.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = "#eee";
        context.fillRect(x + player.position.x, y + player.position.y, 1, 1);
      }
    });
  });

  scoreElement.innerText = score;
}

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") {
    rotatePlayerShape();
  }

  if (key === "ArrowLeft") {
    if (!collides({...player.position, x: player.position.x - 1}, player.shape)) {
      player.position.x--;
    }
  }

  if (key === "ArrowRight") {
    if (!collides({...player.position, x: player.position.x + 1}, player.shape)) {
      player.position.x++;
    }
  }

  if (key === "ArrowDown") moveDownPlayer();
});

audio.addEventListener("ended", function() {
  this.currentTime = 0;
  this.play();
});

function collides(newPlayerPosition, shape) {
  return shape.find((row, y) => {
    return row.find((cell, x) => {
      return (
        cell !== 0 &&
        board[y + newPlayerPosition.y]?.[x + newPlayerPosition.x] !== 0
      )
    });
  });
}

function mergeBoard() {
  player.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[y + player.position.y][x + player.position.x] = cell;
      }
    });
  });

  player.shape = TETRAS[Math.floor(Math.random() * TETRAS.length)];

  player.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
  player.position.y = 0;

  if (collides(player.position, player.shape)) {
    initialBoard();
    window.alert(`Game over! your score is ${score}`);
  }
}

function clearRows() {
  const rowsToRemove = board.reduce((rowsList, row, index) => {
    if (row.every(cell => cell > 0)) return [...rowsList, index];
    return rowsList;
  }, []);

  rowsToRemove.forEach(y => {
    board.splice(y, 1);
    const newRow = new Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
  });

  score += rowsToRemove.length * 100;
}

function rotatePlayerShape() {
  const transposed = player.shape[0].map((_, colIndex) => player.shape.map(row => row[colIndex]));
  const rotatedShape = transposed.map(row => row.reverse());

  if (!collides(player.position, rotatedShape)) {
    player.shape = rotatedShape;
  }
}

function startGame() {
  score = 0;
  initialBoard();
  updateGame();
  audio.play();
}

startGameButton.addEventListener("click", () => {
  startGameContainer.classList.add("hide");
  startGame();
});

