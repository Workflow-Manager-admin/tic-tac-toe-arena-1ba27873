import React, { useState, useEffect } from "react";
import "./App.css";
import SnakeLadderGame from "./SnakeLadderGame";

/**
 * PUBLIC_INTERFACE
 * Main App component - Tic Tac Toe or Snake & Ladder entry.
 * Switches between the 2 games, holding menus and UI routing.
 */
function App() {
  const COLORS = {
    primary: "#1976d2",
    secondary: "#424242",
    accent: "#ffc107",
    boardBG: "#f8f9fa",
    x: "#1976d2",
    o: "#ffc107",
  };

  const [theme, setTheme] = useState("light");
  // App-level game selector: "menu" = select, "ttt" = tic tac toe, "snl" = snake & ladder
  const [appScreen, setAppScreen] = useState("menu");

  // --- Tic Tac Toe state ---
  const [gameMode, setGameMode] = useState(null); // "ai" or "local"
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState(""); // "X wins", "O wins", "Draw", or ""
  const [animWinLine, setAnimWinLine] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function startNewGame(mode) {
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus("");
    setAnimWinLine(null);
    setAppScreen("ttt");
  }

  // TicTacToe helpers
  function calculateWinner(b) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b2, c] = line;
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
        return { winner: b[a], line };
      }
    }
    if (b.every(Boolean)) return { winner: "draw", line: null };
    return null;
  }

  function handleClick(idx) {
    if (board[idx] || status) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      if (result.winner === "draw") {
        setStatus("Draw!");
      } else {
        setStatus(`${result.winner} wins!`);
        setAnimWinLine(result.line);
      }
    } else {
      setXIsNext(!xIsNext);
    }
  }

  function makeAIMove() {
    if (status || gameMode !== "ai" || xIsNext) return; // AI is always "O"
    const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
    if (empty.length === 0) return;
    setTimeout(() => {
      const choice = empty[Math.floor(Math.random() * empty.length)];
      handleClick(choice);
    }, 500);
  }

  useEffect(() => {
    if (gameMode === "ai" && !status && !xIsNext) {
      makeAIMove();
    }
    // eslint-disable-next-line
  }, [board, xIsNext, status, gameMode]);

  function renderSquare(i) {
    const isWinCell = animWinLine && animWinLine.includes(i);
    return (
      <button
        className={`ttt-square${isWinCell ? " ttt-win" : ""}`}
        style={{
          color: board[i] === "X" ? COLORS.x : board[i] === "O" ? COLORS.o : COLORS.secondary,
          borderColor: isWinCell
            ? COLORS.accent
            : COLORS.secondary,
          background: "var(--bg-secondary)",
          transition: "border-color 0.3s, color 0.25s",
        }}
        onClick={() => handleClick(i)}
        aria-label={board[i] ? board[i] : `Square ${i + 1}`}
        key={i}
        disabled={!!status || !!board[i]}
      >
        <span className="ttt-piece">{board[i] || ""}</span>
      </button>
    );
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus("");
    setAnimWinLine(null);
  }

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  // Main Menu: choose TicTacToe or SnakeLadder
  function MainMenu() {
    return (
      <div className="ttt-menu" style={{ marginBottom: 32 }}>
        <h1 className="ttt-title" style={{ color: COLORS.primary, letterSpacing: 1, fontSize: '2.25rem', marginBottom: 16 }}>Game Arena</h1>
        <div className="ttt-select-mode" style={{ marginBottom: 28 }}>
          <button
            className="ttt-btn"
            style={{ background: COLORS.primary, color: "#fff", marginRight: 10 }}
            onClick={() => setAppScreen("ttt")}
          >
            Play Tic Tac Toe
          </button>
          <button
            className="ttt-btn"
            style={{ background: COLORS.accent, color: "#222", marginRight: 10 }}
            onClick={() => setAppScreen("snl")}
          >
            Snake &amp; Ladder
          </button>
        </div>
        <div style={{ fontSize: 13.5, color: COLORS.secondary, opacity: 0.7 }}>
          Choose your game! Minimal, fast, and beautiful.
        </div>
      </div>
    );
  }

  // Tic Tac Toe mode select
  function GameMenu() {
    return (
      <div className="ttt-menu" style={{ marginBottom: 32 }}>
        <h1 className="ttt-title" style={{ color: COLORS.primary, letterSpacing: 1 }}>Tic Tac Toe Arena</h1>
        <div className="ttt-select-mode">
          <button
            className="ttt-btn"
            style={{
              background: COLORS.primary,
              color: "#fff",
              marginRight: 10,
            }}
            onClick={() => startNewGame("ai")}
          >
            Play vs AI
          </button>
          <button
            className="ttt-btn"
            style={{
              background: COLORS.secondary,
              color: "#fff",
              marginRight: 10,
            }}
            onClick={() => startNewGame("local")}
          >
            2 Player Local
          </button>
        </div>
        <button
          className="ttt-btn ttt-btn-link"
          style={{ marginTop: 22, fontSize: 15, textDecoration: "underline", background: "none", color: COLORS.secondary }}
          onClick={() => setAppScreen("menu")}
        >
          ← Back to Main Menu
        </button>
      </div>
    );
  }

  function GameStatus() {
    let msg;
    if (status === "Draw!") msg = "It's a draw!";
    else if (status) msg = `Winner: ${status[0]}`;
    else if (gameMode === "ai") msg = xIsNext ? "Your turn (X)" : "AI's turn (O)";
    else msg = xIsNext ? "Player X's turn" : "Player O's turn";
    return (
      <div className="ttt-status" aria-live="polite" style={{ margin: "16px 0", fontWeight: 600 }}>
        {msg}
      </div>
    );
  }

  const Board = () => (
    <div className="ttt-board" role="grid" aria-label="Game board">
      {[0, 1, 2].map((r) => (
        <div className="ttt-row" key={"row" + r} role="row">
          {[0, 1, 2].map((c) => renderSquare(r * 3 + c))}
        </div>
      ))}
      {animWinLine && (
        <div className={`ttt-anim-line ttt-line-${animWinLine[0]}-${animWinLine[2]}`} />
      )}
    </div>
  );

  // Main render
  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <header className="ttt-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{
            background: COLORS.primary,
            color: "#fff",
          }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      <main className="ttt-main">
        {appScreen === "menu" && (
          <MainMenu />
        )}
        {appScreen === "ttt" && (
          !gameMode ? (
            <GameMenu />
          ) : (
            <div className="ttt-game-wrapper">
              <h2 className="ttt-subtitle" style={{ color: COLORS.primary, marginBottom: 12 }}>
                {gameMode === "ai" ? "Single Player (vs AI)" : "Local Multiplayer"}
              </h2>
              <GameStatus />
              <Board />
              {(status || board.every(Boolean)) && (
                <button
                  className="ttt-btn"
                  style={{
                    background: COLORS.accent,
                    color: "#222",
                    marginTop: 20,
                    fontWeight: 600,
                    boxShadow: "0 1px 4px rgba(32,32,60,0.10)",
                  }}
                  onClick={restartGame}
                >
                  Restart Game
                </button>
              )}
              <button
                className="ttt-btn ttt-btn-link"
                style={{
                  color: COLORS.secondary,
                  marginTop: 20,
                  background: "none",
                  border: "none",
                  fontSize: 15,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setGameMode(null);
                }}
              >
                ← Back to Mode Select
              </button>
            </div>
          )
        )}
        {appScreen === "snl" && (
          <div>
            <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
              <SnakeLadderGame />
            </div>
            <div style={{ textAlign: "center", margin: "16px 0 0 0" }}>
              <button
                className="ttt-btn ttt-btn-link"
                style={{ fontSize: 15, textDecoration: "underline", background: "none", color: COLORS.secondary }}
                onClick={() => setAppScreen("menu")}
              >← Back to Main Menu</button>
            </div>
          </div>
        )}
      </main>
      <footer className="ttt-footer">
        <span style={{ color: COLORS.secondary, fontSize: 13, opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} Game Arena
        </span>
      </footer>
    </div>
  );
}

export default App;
