const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

let leaderboard = [];

io.on("connection", (socket) => {

    socket.emit("leaderboard", leaderboard);

    socket.on("score", (data) => {

        const index = leaderboard.findIndex(p => p.username === data.username);

        if (index !== -1) {
            if (data.score > leaderboard[index].score) {
                leaderboard[index].score = data.score;
            }
        } else {
            leaderboard.push(data);
        }

        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);

        io.emit("leaderboard", leaderboard);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on " + PORT);
});