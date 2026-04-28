const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

const products = [
  { id: 1, name: "Dog Food", price: 25 },
  { id: 2, name: "Cat Toy", price: 10 },
  { id: 3, name: "Bird Cage", price: 120 }
];

app.get("/products", (req, res) => {
  res.json(products);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});