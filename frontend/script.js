const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.getElementById("gameContainer").appendChild(canvas);

canvas.width = 800;
canvas.height = 300;

// UI elements (safe)
const startScreen = document.getElementById("startScreen");
const scoreEl = document.getElementById("score");

let gameStarted = false;
let gameOver = false;
let score = 0;

// PLAYER
const player = {
    x: 60,
    y: 200,
    width: 30,
    height: 50,
    velocityY: 0,
    jumping: false
};

const gravity = 1;
const groundY = 200;

// OBSTACLES
let obstacles = [];

function spawnObstacle() {
    if (!gameStarted || gameOver) return;

    obstacles.push({
        x: canvas.width,
        y: 220,
        width: 20,
        height: 30
    });
}

setInterval(spawnObstacle, 1500);

// INPUT
document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {

        // START GAME
        if (!gameStarted) {
            gameStarted = true;
            if (startScreen) startScreen.style.display = "none";
        }

        // JUMP
        if (!player.jumping && gameStarted && !gameOver) {
            player.velocityY = -15;
            player.jumping = true;
        }
    }

    // RESTART
    if (e.code === "Enter" && gameOver) {
        location.reload();
    }
});

// UPDATE UI
function updateUI() {
    if (scoreEl) {
        scoreEl.innerText = "Score: " + score;
    }
}

// UPDATE GAME
function update() {
    if (!gameStarted || gameOver) return;

    // PLAYER PHYSICS
    player.y += player.velocityY;
    player.velocityY += gravity;

    if (player.y >= groundY) {
        player.y = groundY;
        player.jumping = false;
    }

    // OBSTACLES MOVE
    obstacles.forEach(o => {
        o.x -= 6;

        // COLLISION
        if (
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) {
            gameOver = true;
        }
    });

    // CLEAN OLD OBSTACLES
    obstacles = obstacles.filter(o => o.x > -50);

    score++;
    updateUI();
}

// DRAW GAME
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // GROUND
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 250, canvas.width, 50);

    // PLAYER
    ctx.fillStyle = "#d4aa00";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // OBSTACLES
    ctx.fillStyle = "#888";
    obstacles.forEach(o => {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + 30);
        ctx.lineTo(o.x + 10, o.y);
        ctx.lineTo(o.x + 20, o.y + 30);
        ctx.fill();
    });

    // GAME OVER SCREEN
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 280, 140);
        ctx.font = "16px Arial";
        ctx.fillText("Press ENTER to restart", 270, 170);
    }
}

// GAME LOOP
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();