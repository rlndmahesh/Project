const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 300;

let gameStarted = false;
let score = 0;
let gameOver = false;

const player = {
    x: 60,
    y: 200,
    width: 30,
    height: 50,
    velocityY: 0,
    jumping: false,
    tilt: 0
};

const gravity = 1;
const groundY = 200;

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

// 🎮 start control
document.addEventListener("keydown", (e) => {

    // start game
    if (!gameStarted && e.code === "Space") {
        gameStarted = true;
        document.getElementById("startScreen").style.display = "none";
    }

    if (e.code === "Space" && gameStarted && !player.jumping) {
        player.velocityY = -15;
        player.jumping = true;
        player.tilt = -20;
    }

    if (gameOver && e.code === "Enter") {
        location.reload();
    }
});

function updateUI() {
    document.getElementById("score").innerText = "Score: " + score;
}

function update() {
    if (!gameStarted || gameOver) return;

    player.y += player.velocityY;
    player.velocityY += gravity;

    if (player.y >= groundY) {
        player.y = groundY;
        player.jumping = false;
        player.tilt *= 0.9;
    }

    player.tilt *= 0.95;

    obstacles.forEach(o => {
        o.x -= 6;

        if (
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) {
            gameOver = true;
        }
    });

    obstacles = obstacles.filter(o => o.x > -50);

    score++;
    updateUI();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 250, canvas.width, 50);

    // player (beer)
    ctx.fillStyle = "#d4aa00";
    ctx.fillRect(player.x, player.y, 30, 50);

    // spikes
    ctx.fillStyle = "#888";
    obstacles.forEach(o => {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + 30);
        ctx.lineTo(o.x + 10, o.y);
        ctx.lineTo(o.x + 20, o.y + 30);
        ctx.fill();
    });

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 280, 140);
        ctx.font = "16px Arial";
        ctx.fillText("Press ENTER to restart", 270, 170);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();