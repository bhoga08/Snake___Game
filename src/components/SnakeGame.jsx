import { useCallback, useEffect, useRef, useState } from "react";
import "../css/SnakeGame.css";
import snakeMusic from "../assets/snake-music.mp3";

const ROWS = 20;
const COLS = 30;

const initialSnake = [
  { x: 15, y: 10 },
  { x: 14, y: 10 },
  { x: 13, y: 10 },
];

const getRandomFood = (snake) => {
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));

  return food;
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(getRandomFood(initialSnake));

  const [direction, setDirection] = useState("RIGHT");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("snakeHighScore")) || 0,
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const directionRef = useRef("RIGHT");

  const audioRef = useRef(null);

useEffect(() => {
  audioRef.current = new Audio(snakeMusic);
  audioRef.current.loop = true;
  audioRef.current.volume = 0.25;

  return () => {
    audioRef.current?.pause();
    audioRef.current = null;
  };
}, []);

  const startGame = () => {
    const newSnake = [
      { x: 15, y: 10 },
      { x: 14, y: 10 },
      { x: 13, y: 10 },
    ];

    setSnake(newSnake);
    setFood(getRandomFood(newSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    audioRef.current?.play().catch(() => {});
  };

  const changeDirection = useCallback((newDirection) => {
    const currentDirection = directionRef.current;

    const opposite = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (opposite[currentDirection] === newDirection) {
      return;
    }

    directionRef.current = newDirection;
    setDirection(newDirection);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        changeDirection("UP");
      }

      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        changeDirection("DOWN");
      }

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        e.preventDefault();
        changeDirection("LEFT");
      }

      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        e.preventDefault();
        changeDirection("RIGHT");
      }

      if (e.key === "Enter" && (!gameStarted || gameOver)) {
        startGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeDirection, gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const speed = Math.max(85, 150 - Math.floor(score / 50) * 8);

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];

        const newHead = {
          x: head.x,
          y: head.y,
        };

        switch (directionRef.current) {
          case "UP":
            newHead.y -= 1;
            break;

          case "DOWN":
            newHead.y += 1;
            break;

          case "LEFT":
            newHead.x -= 1;
            break;

          case "RIGHT":
            newHead.x += 1;
            break;

          default:
            break;
        }
// Infinite board - wrap around
if (newHead.x < 0) {
  newHead.x = COLS - 1;
}

if (newHead.x >= COLS) {
  newHead.x = 0;
}

if (newHead.y < 0) {
  newHead.y = ROWS - 1;
}

if (newHead.y >= ROWS) {
  newHead.y = 0;
}

        // Self collision
        const hitSelf = currentSnake.some(
          (part) => part.x === newHead.x && part.y === newHead.y,
        );

        if (hitSelf) {
          setGameOver(true);
          audioRef.current?.pause();
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;

          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);

            localStorage.setItem("snakeHighScore", newScore);
          }

          setFood(getRandomFood(newSnake));

          return newSnake;
        }

        // Normal movement
        newSnake.pop();

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, food, score, highScore]);

  return (
    <div className="snake-game">
      <div className="nokia-phone">
        <div className="phone-brand">NOKIA</div>

        <div className="game-screen">
          <div className="screen-top">
            <span>SNAKE</span>

            <span>{score.toString().padStart(4, "0")}</span>
          </div>

          <div className="board">
            {Array.from({
              length: ROWS * COLS,
            }).map((_, index) => {
              const x = index % COLS;
              const y = Math.floor(index / COLS);

              const snakePart = snake.find(
                (part) => part.x === x && part.y === y,
              );

              const isHead = snake[0]?.x === x && snake[0]?.y === y;

              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className={`
                    pixel
                    ${snakePart ? "snake" : ""}
                    ${isHead ? "head" : ""}
                    ${isFood ? "food" : ""}
                  `}
                />
              );
            })}

            {!gameStarted && (
              <div className="screen-message">
                <h2>SNAKE</h2>

                <p>PRESS ENTER</p>

                <button onClick={startGame}>START</button>
              </div>
            )}

            {gameOver && (
              <div className="screen-message">
                <h2>GAME OVER</h2>

                <p>SCORE: {score.toString().padStart(4, "0")}</p>

                <p>BEST: {highScore.toString().padStart(4, "0")}</p>

                <button onClick={startGame}>AGAIN</button>
              </div>
            )}
          </div>

          <div className="screen-bottom">
            <span>BEST</span>

            <span>{highScore.toString().padStart(4, "0")}</span>
          </div>
        </div>

        <div className="phone-controls">
          <div className="d-pad">
            <button onClick={() => changeDirection("UP")}>▲</button>

            <div>
              <button onClick={() => changeDirection("LEFT")}>◀</button>

              <button onClick={() => changeDirection("DOWN")}>▼</button>

              <button onClick={() => changeDirection("RIGHT")}>▶</button>
            </div>
          </div>
        </div>

        <div className="phone-label">SNAKE II</div>
      </div>
    </div>
  );
};

export default SnakeGame;
