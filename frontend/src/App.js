import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./login";

const BASE_URL = "https://memeory-game-fullstack.onrender.com";

const symbols = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥝", "🍍", "🥑"];

const levelConfig = {
  easy: 4,
  medium: 6,
  hard: 8,
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [level, setLevel] = useState("easy");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [globalHighScore, setGlobalHighScore] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const count = levelConfig[level];
    const selectedSymbols = symbols.slice(0, count);
    setCards(shuffle([...selectedSymbols, ...selectedSymbols]));
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setStatusMessage("");
  }, [level]);

  useEffect(() => {
    if (user) {
      setHighScore(user.highScore || 0);
    }

    axios
      .get(`${BASE_URL}/highscore`)
      .then((response) => {
        setGlobalHighScore(response.data.score || 0);
      })
      .catch(() => {
        setStatusMessage("Unable to fetch global high score.");
      });
  }, [user]);

  useEffect(() => {
    if (!user || score <= highScore) return;

    axios
      .post(`${BASE_URL}/highscore`, {
        userId: user.id,
        score,
      })
      .then(() => {
        setHighScore(score);
        setStatusMessage("New personal high score saved!");
      })
      .catch(() => {
        setStatusMessage("Could not save high score.");
      });
  }, [score, highScore, user]);

  const clickCard = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index])) {
      return;
    }

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [firstIndex, secondIndex] = nextFlipped;
      if (cards[firstIndex] === cards[secondIndex]) {
        setMatched((prev) => [...prev, cards[firstIndex]]);
        setScore((prev) => prev + 10);
        setStatusMessage("Nice! You found a match.");
        setTimeout(() => setFlipped([]), 500);
      } else {
        setStatusMessage("Not a match. Try again.");
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setScore(0);
    setHighScore(0);
    setMatched([]);
    setFlipped([]);
    setStatusMessage("");
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #d0eaff 0%, #f7fbff 100%)",
        padding: "20px",
        color: "#0f3057",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Memory Game</h1>
            <p style={{ margin: "8px 0 0" }}>
              Welcome back, <strong>{user.username}</strong>!
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "14px 18px",
                boxShadow: "0 10px 25px rgba(15, 48, 87, 0.12)",
                minWidth: 220,
              }}
            >
              <p style={{ margin: 0, fontSize: 14 }}>Profile</p>
              <p style={{ margin: "8px 0 0", fontSize: 16 }}>
                <strong>{user.username}</strong>
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                High Score: <strong>{highScore}</strong>
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                Global Best: <strong>{globalHighScore}</strong>
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "#0f3057",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 15px 35px rgba(15, 48, 87, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Current Level: {level}</h2>
              <p style={{ margin: "8px 0 0" }}>
                Score: <strong>{score}</strong> | Personal Best: <strong>{highScore}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.keys(levelConfig).map((key) => (
                <button
                  key={key}
                  onClick={() => setLevel(key)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: level === key ? "2px solid #0f3057" : "1px solid #9bb4ce",
                    background: level === key ? "#0f3057" : "white",
                    color: level === key ? "white" : "#0f3057",
                    cursor: "pointer",
                  }}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <p style={{ marginTop: 16, color: "#0f3057" }}>{statusMessage}</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
              gap: 14,
              marginTop: 24,
            }}
          >
            {cards.map((symbol, index) => {
              const isVisible = flipped.includes(index) || matched.includes(symbol);
              return (
                <button
                  key={index}
                  onClick={() => clickCard(index)}
                  style={{
                    height: 100,
                    borderRadius: 18,
                    border: "none",
                    background: isVisible ? "#ffffff" : "#d6ebff",
                    boxShadow: "0 10px 20px rgba(15, 48, 87, 0.08)",
                    fontSize: 32,
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                >
                  {isVisible ? symbol : "?"}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
