const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const DATA_FILE = "leaderboard.json";

// load saved data
let data = {
    lastReset: Date.now(),
    scores: []
};

if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

// reset every 2 days
function checkReset() {
    const now = Date.now();
    const twoDays = 2 * 24 * 60 * 60 * 1000;

    if (now - data.lastReset > twoDays) {
        data.scores = [];
        data.lastReset = now;
        saveData();
    }
}

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

// add score
app.post("/score", (req, res) => {
    checkReset();

    const { username, score } = req.body;

    if (!username) return res.sendStatus(400);

    data.scores.push({ username, score });

    // sort high to low
    data.scores.sort((a, b) => b.score - a.score);

    // keep top 10
    data.scores = data.scores.slice(0, 10);

    saveData();

    res.json({ success: true });
});

// get leaderboard
app.get("/leaderboard", (req, res) => {
    checkReset();
    res.json(data.scores);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});