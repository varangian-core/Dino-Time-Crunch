import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";
import PowerUpController from "./PowerUpController.js";
import Table from "./Table.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 1; // 1.0
const GAME_SPEED_INCREMENT = 0.00001;

const ebs = "https://www.varangianroute.com";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5; //58
const PLAYER_HEIGHT = 94 / 1.5; //62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const POWER_UP_WIDTH = 30;
const POWER_UP_HEIGHT = 30;

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: "images/cactus_1.png" },
  { width: 98 / 1.5, height: 100 / 1.5, image: "images/cactus_2.png" },
  { width: 68 / 1.5, height: 70 / 1.5, image: "images/cactus_3.png" },
];

// Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;
let powerUpController = null;
let table = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let gameStarted = false; //used to prevent leaderboard loading at the beginning
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;
let canUploadScore = true;

let cycleState = 0;
let cycleColors = ["#87CEEB", "#4682B4", "#000000", "#4682B4", "#87CEEB",
  "#FF0000", // Red
  "#FFA500", // Orange
  "#FFFF00", // Yellow
  "#008000", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#EE82EE", // Violet
]


const audio = new Audio("music/I_Can_Explain2.wav");
audio.loop = true;
audio.volume = 1;


//Mock Data
const mockScores = [
  { username: 'Player1', score: 1000 },
  { username: 'Player2', score: 900 },
  { username: 'Player3', score: 800 },
  { username: 'Player4', score: 700 },
  { username: 'Player5', score: 600 },
  { username: 'Player6', score: 5000 },
  { username: 'Player7', score: 400 },
  { username: 'Player8', score: 300 },
  { username: 'Player9', score: 200 },
  { username: 'Player10', score: 100 },
];

//Real API data
const mockData2 = {
  "error": false,
  "scores": [
    {
      "_id": "8a17707e-1530-4c70-bc42-4e330356cab2",
      "username": "jellyscriptjam",
      "score": 1337,
      "updatedAt": 1689410337575,
      "__v": 0
    },
    {
      "_id": "f1ae2638-e9fa-48e2-9b39-5982f12aced6",
      "username": "jellyscriptjam",
      "score": 1078,
      "updatedAt": 1689411352352,
      "__v": 0
    },
    {
      "_id": "0f31c52c-4ebc-4d9b-8985-3ebafe338f48",
      "username": "jellyscriptjam",
      "score": 1000,
      "updatedAt": 1689410316787,
      "__v": 0
    },
    {
      "_id": "f21504c0-c8f5-4117-94f6-5d6c01ad8514",
      "username": "jellyscriptjam",
      "score": 810,
      "updatedAt": 1689480521388,
      "__v": 0
    },
    {
      "_id": "19c07f56-c0ba-4a45-8ae2-a2c06997f7b6",
      "username": "jellyscriptjam",
      "score": 500,
      "updatedAt": 1689408773057,
      "__v": 0
    }
  ]
}

function playMusic() {
  audio.play();
}

function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
}

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);

  powerUpController = new PowerUpController(ctx, POWER_UP_WIDTH * scaleRatio, POWER_UP_HEIGHT * scaleRatio, GROUND_AND_CACTUS_SPEED, scaleRatio);

  table = new Table(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function uploadScore(score) {
  return fetch(ebs + '/scores', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      authorization: 'Bearer ' + window.Twitch.ext.viewer.sessionToken
    },
    body: JSON.stringify({
      score: score
    })
  })
    .then(resp => resp.json());
}

function listTopScores(count) {
  fetch(ebs + `/top-scores?count=${count}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      authorization: 'Bearer ' + window.Twitch.ext.viewer.sessionToken
    },
  })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return resp.json();
    })
    .then(data => {
      let scores = data.scores;
      if (!scores || scores.length === 0) {
        console.warn('No data received from API, using mock data instead');
        scores = mockScores.slice(0, count);
      }
      table.updateLeaders(scores);
      createModal(table.draw());
    })
    .catch(error => {
      console.error('Error fetching data from API, using mock data instead:', error);
      table.updateLeaders(mockScores.slice(0, count));
      createModal(table.draw());
    });
}

function createModal(content) {
  const modal = document.createElement('div');
  modal.classList.add('leaderboard-modal');

  const header = document.createElement('div');
  header.style.backgroundColor = 'purple';
  header.style.color = 'white';
  header.style.padding = '10px';
  header.style.marginBottom = '10px';
  header.textContent = 'Leaderboard';

  const leaderboardTable = document.createElement('table');
  leaderboardTable.classList.add('leaderboard-table');
  leaderboardTable.innerHTML = content;

  const modalContent = document.createElement('div');
  modalContent.classList.add('leaderboard-modal-content');
  modalContent.appendChild(header);
  modalContent.appendChild(leaderboardTable);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeyPress);

  function closeModal() {
      document.body.removeChild(modal);
      modal.removeEventListener('click', closeModal);
      document.removeEventListener('keydown', handleKeyPress);
  }

  function handleKeyPress(event) {
      if (event.code === 'Space' && !gameStarted) {
          closeModal();
      }
  }
}

function generateLeaderboardTable(leaderboardData) {
  let tableHTML = `
      <thead>
          <tr>
              <th>Username</th>
              <th>Score</th>
          </tr>
      </thead>
      <tbody>
  `;

  leaderboardData.forEach((leader) => {
      tableHTML += `
          <tr>
              <td>${leader.username}</td>
              <td>${leader.score}</td>
          </tr>
      `;
  });

  tableHTML += `
      </tbody>
  `;

  return tableHTML;
}

function createLeaderboard(leaderboardData) {
  const leaderboardTable = generateLeaderboardTable(leaderboardData);
  createModal(leaderboardTable);
}

const mockLeaderboardData = [
  { username: 'User1', score: 1000 },
  { username: 'User2', score: 900 },
  { username: 'User3', score: 800 },
  { username: 'User4', score: 700 },
  { username: 'User5', score: 600 },
  { username: 'User6', score: 500 },
  { username: 'User7', score: 400 },
  { username: 'User8', score: 300 },
  { username: 'User9', score: 200 },
  { username: 'User10', score: 100 },
];


function showGameOver(score) {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
  if (canUploadScore) {
    uploadScore(Math.floor(score))
      .then(() => {
        setTimeout(listTopScores, 300, 10);  // change the delay here
      });
  }
  canUploadScore = false;
  gameStarted = false;
  stopMusic();
}


function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  powerUpController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
  canUploadScore = true;
  gameStarted = true;
  playMusic(); // Start playing the music when the game resets

  showLeaderboardModal();
}


function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Tap Screen or Press Space To Start", x, y);
  playMusic(); // Start playing the music when waiting to start
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
  let gradient;
  if (gameSpeed >= 2.25) {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.15, "orange");
    gradient.addColorStop(0.3, "yellow");
    gradient.addColorStop(0.5, "green");
    gradient.addColorStop(0.65, "blue");
    gradient.addColorStop(0.8, "indigo");
    gradient.addColorStop(1, "violet");
  } else {
    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, cycleColors[cycleState]);
    gradient.addColorStop(1, cycleColors[(cycleState + 1) % (cycleColors.length - 1)]);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    ground.update(gameSpeed, frameTimeDelta);
    powerUpController.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta, gameSpeed);
    updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && (cactiController.collideWith(player) || powerUpController.collideWith(player))) {
    if (powerUpController.collideWith(player)) {
      // Player hit power up
      gameSpeed *= 1.20; // Increase speed by 20%
      console.log(`Game speed: ${gameSpeed}`);
      if (gameSpeed >= 2.25) {
        cycleState = cycleColors.length - 1;  // Set to rainbow state
      } else {
        cycleState = (cycleState + 1) % (cycleColors.length - 1);  // Cycle through dusk-dawn states
      }
      console.log(`Cycle state: ${cycleState}`);
      powerUpController.reset(); // Reset the power up
    } else {
      // Player hit cactus
      gameOver = true;
      setupGameReset();
      score.setHighScore();
    }
  }

  ground.draw();
  powerUpController.draw();
  cactiController.draw();
  player.draw();
  score.draw(gameSpeed);

  if (gameOver) {
    showGameOver(score.getScore());
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });

