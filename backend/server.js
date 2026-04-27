const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/memory-game");

const Score = mongoose.model("Score", { score: Number });

app.get("/highscore", async(req, res) => {
    const top = await User.find().sort({ highScore: -1 }).limit(1);
    res.json({ score: top.length > 0 ? top[0].highScore : 0 });
});

app.post("/highscore", async(req, res) => {
    const user = await User.findById(req.body.userId);
    if (user && req.body.score > user.highScore) {
        user.highScore = req.body.score;
        await user.save();
    }
    res.json({ message: "Updated" });
});
const User = mongoose.model("User", {
    username: String,
    password: String,
    highScore: { type: Number, default: 0 }
});
const bcrypt = require("bcryptjs");

app.post("/register", async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        username: req.body.username,
        password: hashedPassword,
        highScore: 0
    });

    await user.save();
    res.json({ message: "User registered" });
});
const jwt = require("jsonwebtoken");

app.post("/login", async(req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.json({ message: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secret");

    res.json({ token, userId: user._id, username: user.username, highScore: user.highScore });
});

app.get("/user/:id", async(req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ username: user.username, highScore: user.highScore });
});

app.listen(5000, () => console.log("Server running on 5000"));