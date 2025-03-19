import React, { useEffect } from "react";
import GameBoard from "./GameBoard";
import useGameLogic from "./useGameLogic";

const App: React.FC = () => {
  const { board, tetromino, moveTetromino } = useGameLogic();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveTetromino(-1, 0);
      if (event.key === "ArrowRight") moveTetromino(1, 0);
      if (event.key === "ArrowDown") moveTetromino(0, 1);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [moveTetromino]);

  return (
    <div>
      <h1>Tetris</h1>
      <GameBoard board={board} tetromino={tetromino} />
    </div>
  );
};

export default App;