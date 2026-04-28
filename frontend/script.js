const socket = io();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.getElementById("gameContainer").appendChild(canvas);

// RESPONSIVE CANVAS FIX
canvas.width = window.innerWidth;
canvas.height = 300;

const jumpSound = new Audio("https://www.myinstants.com/media/sounds/jump.mp3");
const hitSound = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");

let username = "";
let gameStarted = false;
let gameOver = false;
let score = 0;

let speed = 6;
let spawnRate = 1400;

const player = {
    x: 60,
    y: 200,
    w: 35,
    h: 35,
    vy: 0,
    jumps: 0
};

let obstacles = [];
let birds = [];

// START GAME
function startGame() {
    username = document.getElementById("username").value;
    if (!username) return alert("Enter username");

    document.getElementById("loginScreen").style.display = "none";
    gameStarted = true;
}

// AI DIFFICULTY
function aiDifficulty() {
    if (score > 2000) speed = 8;
    if (score > 5000) speed = 10;
    if (score > 8000) speed = 12;

    if (score % 1000 === 0 && spawnRate > 700) {
        spawnRate -= 10;
    }
}

// OBSTACLES
function spawnObstacle() {
    if (!gameStarted || gameOver) return;

    let type = Math.random();

    if (type < 0.4) {
        obstacles.push({ x: canvas.width, y: 220, w: 20, h: 30 });
    } else if (type < 0.8) {
        for (let i = 0; i < 3; i++) {
            obstacles.push({ x: canvas.width + i * 25, y: 220, w: 20, h: 30 });
        }
    } else {
        obstacles.push({ x: canvas.width, y: 180, w: 25, h: 70 });
    }
}

// BIRDS (after 5k)
function spawnBird() {
    if (score < 5000 || !gameStarted) return;

    birds.push({
        x: canvas.width,
        y: 120 + Math.random() * 80,
        w: 30,
        h: 20
    });
}

// FIXED LOOP (dynamic spawn)
function obstacleLoop() {
    spawnObstacle();
    setTimeout(obstacleLoop, spawnRate);
}

// INPUT
document.addEventListener("keydown", (e) => {
    if (!gameStarted || gameOver) return;

    if (e.code === "Space" && player.jumps < 2) {
        player.vy = -15;
        player.jumps++;
        jumpSound.play();
    }

    if (gameOver && e.code === "Enter") location.reload();
});

// MOBILE TOUCH
document.addEventListener("touchstart", () => {

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
        jumpSound.play();
    }
});

// UPDATE
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
        if (collision(player, o)) endGame();
    });

    birds.forEach(b => {
        b.x -= speed + 2;
        if (collision(player, b)) endGame();
    });

    obstacles = obstacles.filter(o => o.x > -100);
    birds = birds.filter(b => b.x > -100);

    score++;

    document.getElementById("score").innerText = "Score: " + score;
}

// COLLISION
function collision(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// GAME OVER
function endGame() {
    gameOver = true;
    hitSound.play();

    socket.emit("score", {
        username,
        score
    });
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 250, canvas.width, 50);

    ctx.font = "30px Arial";
    ctx.fillText("🐯", player.x, player.y + 25);

    ctx.fillStyle = "red";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    ctx.fillStyle = "white";
    birds.forEach(b => ctx.fillText("🐦", b.x, b.y));

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 200, 140);
    }
}

// LEADERBOARD
socket.on("leaderboard", (data) => {
    let html = "<h3>Leaderboard</h3>";

    data.forEach((d, i) => {
        html += `<p>${i + 1}. ${d.username} - ${d.score}</p>`;
    });

    document.getElementById("leaderboard").innerHTML = html;
});

// LOOP
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
obstacleLoop();