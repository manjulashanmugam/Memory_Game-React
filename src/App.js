import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [showNumbers, setShowNumbers] = useState(true);
  const [currentValue, setCurrentValue] = useState(0);
  const [userInput, setUserInput] = useState([]);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [bgAudio, setBgAudio] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Play any sound
  const playSound = (fileName, volume = 1) => {
    const audio = new Audio("/" + fileName);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((e) => console.log("Sound error:", e));
  };

  // Start background music
  const startBackgroundMusic = () => {
    if (!bgAudio) {
      const audio = new Audio("/background.mp3");
      audio.loop = true;
      audio.volume = 1;
      audio.play().catch((e) => console.log("Background error:", e));
      setBgAudio(audio);
    }
  };

  // Start game on first click
  const handleStartGame = () => {
    startBackgroundMusic();
    setGameStarted(true);
    startGame(level);
  };

  // Start a new game
  const startGame = (currentLevel) => {
    const nums = Array.from({ length: 5 + currentLevel - 1 }, () =>
      Math.floor(Math.random() * 9) + 1
    );
    setRandomNumbers(nums);
    setShowNumbers(true);
    setUserInput([]);
    setMessage("");
    setCurrentValue(0);
    setTimeLeft(30);

    setTimeout(() => setShowNumbers(false), 3000);
  };

  // Timer countdown
  useEffect(() => {
    if (!showNumbers && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft === 0 && !showNumbers) {
      setMessage("⏳ Time Up! You Lost!");
      playSound("lose.mp3");
      setTimeout(() => startGame(level), 2000); // same level numbers
    }
  }, [timeLeft, showNumbers, level]); // ✅ added level

  // Regenerate numbers automatically when level changes
  useEffect(() => {
    if (gameStarted) {
      startGame(level);
    }
  }, [level, gameStarted]); // ✅ added gameStarted

  // Add current value to user input
  const addNumber = () => {
    playSound("click.mp3", 0.5);
    if (userInput.length < randomNumbers.length) {
      setUserInput([...userInput, currentValue]);
    }
  };

  // Check result
  const checkResult = () => {
    if (JSON.stringify(userInput) === JSON.stringify(randomNumbers)) {
      playSound("win.mp3");
      setMessage("🎉 You Win!");
      setScore(score + 10 * level);

      // Increase level → useEffect triggers startGame automatically
      setLevel((prev) => prev + 1);
    } else {
      playSound("lose.mp3");
      setMessage("❌ You Lost!");

      // Same level → regenerate numbers after 2 sec
      setTimeout(() => startGame(level), 2000);
    }
  };

  return (
    <div className="container">
      <h1>🎮 Memory Game</h1>
      <h3>Level: {level}</h3>
      <h3>Score: {score}</h3>

      {!gameStarted ? (
        <button className="start-btn" onClick={handleStartGame}>
          ▶ Start Game
        </button>
      ) : (
        <>
          <div className="numbers">
            {showNumbers
              ? randomNumbers.map((num, i) => <span key={i}>{num}</span>)
              : userInput.map((num, i) => <span key={i}>{num}</span>)}
          </div>

          {!showNumbers && (
            <>
              <h2>⏳ Time Left: {timeLeft}s</h2>
              <h2>Current Value: {currentValue}</h2>

              <div className="buttons">
                <button
                  onClick={() => {
                    setCurrentValue(currentValue + 1);
                    playSound("click.mp3", 0.5);
                  }}
                >
                  + Increment
                </button>
                <button
                  onClick={() => {
                    setCurrentValue(currentValue - 1);
                    playSound("click.mp3", 0.5);
                  }}
                >
                  - Decrement
                </button>
                <button onClick={addNumber}>✔ Add</button>
              </div>

              {userInput.length === randomNumbers.length && (
                <button className="submit" onClick={checkResult}>
                  🎯 Submit
                </button>
              )}
            </>
          )}

          <div className="message">{message}</div>
        </>
      )}
    </div>
  );
}

export default App;
