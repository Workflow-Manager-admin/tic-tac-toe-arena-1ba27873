import React, { useState, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Snake & Ladder Game Component
 * - Responsive, modern UI for classic two-player (local) Snake & Ladder.
 * - Supports board rendering, dice roll, player position, win/restart logic.
 */
const BOARD_SIZE = 10;
const WIN_CELL = 100;

// Board snakes & ladders { [from]: to }
const BOARD_PORTALS = {
  // ladders
  2: 23, 6: 45, 20: 59, 52: 72, 57: 96, 71: 92,
  // snakes
  43: 17, 50: 5, 56: 8, 73: 15, 84: 58, 87: 49, 98: 40
};

const PIECE_COLORS = ["#1976d2", "#ffc107"];
const PIECE_ICONS = ["🟦", "🟨"];

function generateBoard() {
  // Generates board layout numbered snake-style
  const rows = [];
  let num = 100;
  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = [];
    for (let j = 0; j < BOARD_SIZE; j++) row.push(num--);
    if (i % 2 === 1) row.reverse();
    rows.push(row);
  }
  return rows;
}

/**
 * Returns board cell style classes.
 */
function cellClass(cell, playerPos, portals) {
  let extra = "";
  if (cell === playerPos[0] && cell === playerPos[1]) extra = " both";
  else if (cell === playerPos[0]) extra = " p1";
  else if (cell === playerPos[1]) extra = " p2";
  if (portals[cell]) extra += portals[cell] > cell ? " ladder" : " snake";
  if (cell === WIN_CELL) extra += " finish";
  return `sl-cell${extra}`;
}

const initialState = {
  positions: [1, 1],
  turn: 0, // 0: player 1, 1: player 2
  rolling: false,
  dice: null,
  status: "",
  winner: null
};

function SnakeLadderGame() {
  const [state, setState] = useState(initialState);

  // Reset state to new game
  function newGame() {
    setState(initialState);
  }

  // Apply snake/ladder and return updated pos
  function resolvePortals(pos) {
    let prev;
    do {
      prev = pos;
      pos = BOARD_PORTALS[pos] || pos;
    } while (prev !== pos);
    return pos;
  }

  // Roll dice on turn, advance player and handle snakes/ladders
  function handleRollDice() {
    if (state.rolling || state.winner) return;
    setState((s) => ({ ...s, rolling: true, dice: null }));
    setTimeout(() => {
      const dice = 1 + Math.floor(Math.random() * 6);
      setState((prev) => {
        const i = prev.turn;
        let npos = prev.positions.slice();
        let newPos = npos[i] + dice <= WIN_CELL ? npos[i] + dice : npos[i]; // can't overshoot
        newPos = resolvePortals(newPos);
        npos[i] = newPos;

        // Win check
        let win = null;
        let status = "";
        if (newPos === WIN_CELL) {
          win = i;
          status = `Player ${i + 1} wins!`;
        }
        return {
          ...prev,
          positions: npos,
          rolling: false,
          dice,
          status: win !== null ? status : "",
          winner: win
        };
      });
      // Next turn for non-win
      setTimeout(() => setState((s) => s.winner !== null ? s : { ...s, turn: s.turn === 0 ? 1 : 0 }), 750);
    }, 480);
  }

  // Keyboard accessibility: spacebar or enter to roll if active
  function handleKeyPress(e) {
    if ((e.key === " " || e.key === "Enter") && !state.rolling && state.winner == null) {
      handleRollDice();
    }
  }

  useEffect(() => {
    // Focus dice roll button on turn
    if (!state.winner) {
      document.getElementById("roll-dice-btn")?.focus();
    }
  }, [state.turn, state.winner, state.rolling]);

  const boardRows = generateBoard();
  const playerIcons = [
    <span title="Player 1" style={{ color: PIECE_COLORS[0], fontSize: 20 }}>{PIECE_ICONS[0]}</span>,
    <span title="Player 2" style={{ color: PIECE_COLORS[1], fontSize: 20, marginLeft: 2 }}>{PIECE_ICONS[1]}</span>
  ];

  return (
    <div className="sl-main">
      <h1 className="sl-title">Snake &amp; Ladder</h1>
      <div className="sl-board" role="grid" aria-label="Snake and Ladder board">
        {boardRows.map((row, rIdx) => (
          <div className="sl-row" role="row" key={"row" + rIdx}>
            {row.map((cell, cIdx) => (
              <div
                className={cellClass(cell, state.positions, BOARD_PORTALS)}
                key={"cell" + cell}
                role="gridcell"
                tabIndex={0}
                aria-label={`Cell ${cell}${cell === state.positions[0] ? "; Player 1" : ""}${cell === state.positions[1] ? "; Player 2" : ""}${BOARD_PORTALS[cell] ? (BOARD_PORTALS[cell] > cell ? "; Ladder" : "; Snake") : ""}${cell === WIN_CELL ? "; Finish" : ""}`}
              >
                <div className="sl-cell-label">{cell}</div>
                {cell === state.positions[0] && <span className="sl-piece" aria-label="Player 1">{playerIcons[0]}</span>}
                {cell === state.positions[1] && <span className="sl-piece" aria-label="Player 2">{playerIcons[1]}</span>}
                {/* Ladder/snake icons */}
                {BOARD_PORTALS[cell] && (
                  <span className={`sl-portal ${BOARD_PORTALS[cell] > cell ? "ladder" : "snake"}`} aria-label={BOARD_PORTALS[cell] > cell ? "Ladder" : "Snake"}>
                    {BOARD_PORTALS[cell] > cell ? "🪜" : "🐍"}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sl-panel">
        <div className={`sl-status${state.status ? " win" : ""}`}>
          {state.status
            ? state.status
            : `Player ${state.turn + 1}'s turn` +
              (state.dice !== null ? ` - Rolled a ${state.dice}` : "")
          }
        </div>
        <button
          id="roll-dice-btn"
          className={"sl-btn" + (state.rolling || !!state.winner ? " disabled" : "")}
          style={{
            background: PIECE_COLORS[state.turn],
            color: "#fff",
            fontWeight: 700
          }}
          onClick={handleRollDice}
          disabled={state.rolling || !!state.winner}
          aria-label="Roll dice"
          tabIndex={0}
          onKeyDown={handleKeyPress}
        >
          {state.rolling ? "Rolling..." : "Roll Dice 🎲"}
        </button>
        {state.dice !== null && !state.rolling && !state.winner &&
          <div className="sl-dice-result">Dice: <span className="sl-dice-num">{state.dice}</span></div>
        }
        {state.winner !== null && (
          <button
            className="sl-btn sl-btn-restart"
            onClick={newGame}
            autoFocus
            aria-label="Restart Game"
          >
            Restart Game
          </button>
        )}
      </div>
      <div className="sl-players">
        <span className="sl-pl sl-p1">{playerIcons[0]} Player 1 (Blue)</span>
        <span className="sl-pl sl-p2">{playerIcons[1]} Player 2 (Yellow)</span>
      </div>
    </div>
  );
}

export default SnakeLadderGame;
