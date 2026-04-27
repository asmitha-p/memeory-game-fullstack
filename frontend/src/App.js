import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./login";

const BASE_URL = "https://memeory-game-fullstack.onrender.com";

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
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [globalHighScore, setGlobalHighScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        try {
          const res = await axios.get(`${BASE_URL}/user/${parsedUser.id}`);
          const updatedUser = { id: parsedUser.id, ...res.data };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
          alert("Login again");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUserDetails();
  }, []);

  // setup game
  useEffect(() => {
    const count = levelConfig[level];
    const selected = symbols.slice(0, count);
    const data = shuffle([...selected, ...selected]);

    setCards(data);
    setFlipped([]);
    setMatched([]);
    setScore(0);
  }, [level]);

  // fetch global score
  useEffect(() => {
    axios
      .get(`${BASE_URL}/highscore`)
      .then((res) => setGlobalHighScore(res.data.score))
      .catch(() => console.log("Backend not connected"));

    if (user) setHighScore(user.highScore);
  }, [user]);

  // click card
  const clickCard = (i) => {
    if (flipped.length === 2 || flipped.includes(i)) return;

    const newFlip = [...flipped, i];
    setFlipped(newFlip);

    if (newFlip.length === 2) {
      const [a, b] = newFlip;

      if (cards[a] === cards[b]) {
        setMatched([...matched, cards[a]]);
        setScore((prev) => prev + 10);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  // update score
  useEffect(() => {
    if (user && score > highScore) {
      axios.post(`${BASE_URL}/highscore`, {
        score,
        userId: user.id
      });
      setHighScore(score);
    }
  }, [score, user, highScore]);

  if (!user) return <Login setUser={setUser} />;

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ textAlign: "center", background: "lightblue", minHeight: "100vh" }}>
      <h1>Welcome {user.username} 🎮</h1>
      <h2>
        Level: {level} | Score: {score} | High Score: {highScore} | Global: {globalHighScore}
      </h2>

      <div>
        <button onClick={() => setLevel("easy")}>Easy</button>
        <button onClick={() => setLevel("medium")}>Medium</button>
        <button onClick={() => setLevel("hard")}>Hard</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,80px)", gap: "10px", justifyContent: "center" }}>
        {cards.map((c, i) => (
          <div
            key={i}
            onClick={() => clickCard(i)}
            style={{
              width: "80px",
              height: "80px",
              background: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "30px",
              borderRadius: "10px"
            }}
          >
            {flipped.includes(i) || matched.includes(c) ? c : "?"}
          </div>
        ))}
      </div>
    </div>
  );
}