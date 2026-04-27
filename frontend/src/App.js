import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./login";
// all symbols
const symbols = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥝", "🍍", "🥑"];

// level config
const levelConfig = {
    easy: 4,
    medium: 6,
    hard: 8
};

// shuffle function
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

export default function App() {
    const [level, setLevel] = useState("easy");
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [showProfile, setShowProfile] = useState(false);
    const [globalHighScore, setGlobalHighScore] = useState(0);
    const [loading, setLoading] = useState(true);

    // fetch user details from backend on app load
    useEffect(() => {
        const fetchUserDetails = async() => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                try {
                    console.log("Fetching user:", parsedUser.id);
                    const res = await axios.get(`http://localhost:5000/user/${parsedUser.id}`);
                    console.log("Fetched user data:", res.data);
                    const updatedUser = { id: parsedUser.id, ...res.data };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } catch (error) {
                    console.log("Failed to fetch user details:", error.message);
                    alert("Failed to load user details. Please login again.");
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        fetchUserDetails();
    }, []);

    // setup game based on level
    useEffect(() => {
        const count = levelConfig[level];
        const selected = symbols.slice(0, count);
        const data = shuffle([...selected, ...selected]);

        setCards(data);
        setFlipped([]);
        setMatched([]);
        setScore(0);
    }, [level]);

    // get high score from backend
    useEffect(() => {
        axios.get("http://localhost:5000/highscore")
            .then(res => setGlobalHighScore(res.data.score))
            .catch(() => console.log("Backend not connected"));

        if (user) {
            setHighScore(user.highScore);
        }
    }, [user]);

    // card click
    const clickCard = (i) => {
        if (flipped.length === 2 || flipped.includes(i)) return;

        const newFlip = [...flipped, i];
        setFlipped(newFlip);

        if (newFlip.length === 2) {
            const [a, b] = newFlip;

            if (cards[a] === cards[b]) {
                setMatched([...matched, cards[a]]);
                setScore(prev => prev + 10);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    // check high score
    useEffect(() => {
        if (user && score > highScore) {
            let message = `🎉 New Personal High Score for ${user.username}!`;
            if (score > globalHighScore) {
                message += " And it's a New Global High Score!";
            }
            alert(message);
            axios.post("http://localhost:5000/highscore", { score, userId: user.id });
            setHighScore(score);
        }
    }, [score, highScore, user, globalHighScore]);

    if (!user) {
        return <Login setUser = { setUser }
        />;
    }

    if (loading) {
        return ( <
            div style = {
                { textAlign: "center", backgroundColor: "lightblue", minHeight: "100vh", color: "white", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" } } >
            <
            h2 > Loading your profile... < /h2> <
            /div>
        );
    }

    return ( <
        div style = {
            { textAlign: "center", backgroundColor: "lightblue", minHeight: "100vh", color: "white", padding: "20px", position: "relative" } } >
        <
        div style = {
            { position: "absolute", top: "20px", right: "20px", color: "white", fontSize: "18px", cursor: "pointer" } }
        onClick = {
            () => setShowProfile(!showProfile) } > 👤{ user.username } <
        /div> {
            showProfile && ( <
                div style = {
                    { position: "absolute", top: "60px", right: "20px", backgroundColor: "white", color: "black", padding: "15px", borderRadius: "5px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", minWidth: "200px" } } >
                <
                h3 style = {
                    { marginTop: 0 } } > Profile < /h3> <
                p > < strong > Name: < /strong> {user.username}</p >
                <
                p > < strong > Current Score: < /strong> {score}</p >
                <
                p > < strong > Highest Score: < /strong> {user.highScore}</p >
                <
                button style = {
                    { backgroundColor: "lightblue", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", width: "100%" } }
                onClick = {
                    () => { setUser(null);
                        setShowProfile(false);
                        localStorage.removeItem('user'); } } > Logout < /button> <
                /div>
            )
        } <
        h1 > Welcome { user.username } - Memory Game🎮 < /h1> <
        h2 > Level: { level.toUpperCase() } | Score: { score } | Personal High Score: { highScore } | Global High Score: { globalHighScore } < /h2> { /* LEVEL BUTTONS */ } <
        div style = {
            { marginBottom: "20px" } } >
        <
        button style = {
            { backgroundColor: "white", color: "black", margin: "5px", padding: "10px 20px", border: "none", borderRadius: "5px" } }
        onClick = {
            () => setLevel("easy") } > Easy < /button> <
        button style = {
            { backgroundColor: "white", color: "black", margin: "5px", padding: "10px 20px", border: "none", borderRadius: "5px" } }
        onClick = {
            () => setLevel("medium") } > Medium < /button> <
        button style = {
            { backgroundColor: "white", color: "black", margin: "5px", padding: "10px 20px", border: "none", borderRadius: "5px" } }
        onClick = {
            () => setLevel("hard") } > Hard < /button> <
        /div> { /* GAME GRID */ } <
        div style = {
            {
                display: "grid",
                gridTemplateColumns: "repeat(4, 80px)",
                gap: "10px",
                justifyContent: "center"
            }
        } > {
            cards.map((c, i) => ( <
                div key = { i }
                onClick = {
                    () => clickCard(i) }
                style = {
                    {
                        width: "80px",
                        height: "80px",
                        backgroundColor: "white",
                        color: "black",
                        fontSize: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border: "2px solid #ccc"
                    }
                } > { flipped.includes(i) || matched.includes(c) ? c : "?" } <
                /div>
            ))
        } <
        /div> <
        /div>
    );
}
import React, { useEffect, useState } from "react";

function App() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("https://memeory-game-fullstack.onrender.com/highscore")
      .then(res => res.json())
      .then(data => setScore(data.score))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>High Score: {score}</h1>
    </div>
  );
}

export default App;