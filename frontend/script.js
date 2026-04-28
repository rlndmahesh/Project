const socket = io();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.getElementById("gameContainer").appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = 300;

/* PLAYER IMAGE (your WhatsApp sticker converted) */
const playerImg = new Image();
playerImg.src = "assets/tiger.png";

let username = "";
let gameStarted = false;
let gameOver = false;
let score = 0;

let speed = 6;
let spawnRate = 1400;

const player = {
    x: 60,
    y: 200,
    w: 40,
    h: 40,
    vy: 0,
    jumps: 0
};

let obstacles = [];
let birds = [];

/* START GAME */
function startGame() {
    username = document.getElementById("username").value;

    if (!username) {
        document.getElementById("username").focus();
        return;
    }

    document.getElementById("loginScreen").style.display = "none";
    gameStarted = true;
}

/* MOBILE FIX */
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("username").focus();
    }, 300);
});

/* AI DIFFICULTY */
function aiDifficulty() {
    if (score > 2000) speed = 8;
    if (score > 5000) speed = 10;
    if (score > 8000) speed = 12;
}

/* OBSTACLES */
function spawnObstacle() {
    if (!gameStarted || gameOver) return;

    obstacles.push({
        x: canvas.width,
        y: 220,
        w: 20,
        h: 30
    });
}

/* LOOP SPAWN */
function loopSpawn() {
    spawnObstacle();
    setTimeout(loopSpawn, spawnRate);
}

/* INPUT */
document.addEventListener("keydown", (e) => {

    if (!gameStarted || gameOver) return;

    if (e.code === "Space" && player.jumps < 2) {
        player.vy = -15;
        player.jumps++;
    }

    if (gameOver && e.code === "Enter") location.reload();
});

/* TOUCH */
canvas.addEventListener("touchstart", () => {

    if (!gameStarted) {
        startGame();
        return;
    }

    if (gameOver) {
        location.reload();
        return;
    }

    if (player.jumps < 2) {
        player.vy = -15;
        player.jumps++;
    }
});

/* UPDATE */
function update() {

    if (!gameStarted || gameOver) return;

    aiDifficulty();

    player.y += player.vy;
    player.vy += 1;

    if (player.y >= 200) {
        player.y = 200;
        player.jumps = 0;
    }

    obstacles.forEach(o => {
        o.x -= speed;

        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ) {
            gameOver = true;
            socket.emit("score", { username, score });
        }
    });

    obstacles = obstacles.filter(o => o.x > -100);

    score++;
    document.getElementById("score").innerText = "Score: " + score;
}

/* DRAW */
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 250, canvas.width, 50);

    /* PLAYER IMAGE */
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    } else {
        ctx.fillText("🐯", player.x, player.y);
    }

    ctx.fillStyle = "red";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 200, 140);
    }
}

/* LEADERBOARD */
socket.on("leaderboard", (data) => {

    let html = "<h3>Leaderboard</h3>";

    data.forEach((d, i) => {
        html += `<p>${i + 1}. ${d.username} - ${d.score}</p>`;
    });

    document.getElementById("leaderboard").innerHTML = html;
});

/* LOOP */
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
loopSpawn();