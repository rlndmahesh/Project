const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.getElementById("gameContainer").appendChild(canvas);

canvas.width = 800;
canvas.height = 300;

let username = "";
let gameStarted = false;
let gameOver = false;
let score = 0;

const player = {
    x: 60,
    y: 200,
    width: 35,
    height: 35,
    velocityY: 0,
    jumps: 0
};

let gravity = 1;
let groundY = 200;

let obstacles = [];
let speed = 6;
let spawnRate = 1500;

// START GAME
function startGame() {
    username = document.getElementById("username").value;

    if (!username) return alert("Enter username");

    document.getElementById("loginScreen").style.display = "none";

    gameStarted = true;
}

// OBSTACLES
function spawnObstacle() {
    if (!gameStarted || gameOver) return;

    obstacles.push({
        x: canvas.width,
        y: 220,
        w: 20,
        h: 30
    });
}

setInterval(spawnObstacle, spawnRate);

// INPUT (PC)
document.addEventListener("keydown", (e) => {

    if (!gameStarted || gameOver) return;

    if (e.code === "Space") {
        if (player.jumps < 2) {
            player.velocityY = -15;
            player.jumps++;
        }
    }

    if (gameOver && e.code === "Enter") {
        location.reload();
    }
});

// TOUCH (MOBILE)
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
        player.velocityY = -15;
        player.jumps++;
    }
});

// UPDATE
function update() {

    if (!gameStarted || gameOver) return;

    player.y += player.velocityY;
    player.velocityY += gravity;

    if (player.y >= groundY) {
        player.y = groundY;
        player.jumps = 0;
    }

    // SPEED INCREASE (difficulty scaling)
    if (score % 500 === 0) {
        speed += 0.5;
    }

    obstacles.forEach(o => {
        o.x -= speed;

        if (
            player.x < o.x + o.w &&
            player.x + player.width > o.x &&
            player.y < o.y + o.h &&
            player.y + player.height > o.y
        ) {
            gameOver = true;
            sendScore();
            loadLeaderboard();
        }
    });

    obstacles = obstacles.filter(o => o.x > -50);

    score++;
    document.getElementById("score").innerText = "Score: " + score;

    if (score >= 10000) {
        alert("Thank you for playing by SK MAMA 🎉");
    }
}

// SEND SCORE
function sendScore() {
    fetch("/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, score })
    });
}

// LOAD LEADERBOARD
function loadLeaderboard() {
    fetch("/leaderboard")
        .then(res => res.json())
        .then(data => {

            let html = "<h3>Leaderboard</h3>";

            data.forEach((d, i) => {
                html += `<p>${i+1}. ${d.username} - ${d.score}</p>`;
            });

            document.getElementById("leaderboard").innerHTML = html;
        });
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 250, canvas.width, 50);

    // TIGER CHARACTER 🐯
    ctx.font = "30px Arial";
    ctx.fillText("🐯", player.x, player.y + 25);

    // obstacles
    ctx.fillStyle = "red";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 250, 140);
    }
}

// LOOP
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();