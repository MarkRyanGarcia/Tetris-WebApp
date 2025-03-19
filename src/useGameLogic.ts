import { useState, useEffect } from "react";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, Tetromino } from "./constants";

type Board = (string | null)[][];

const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const randomTetromino = (): Tetromino & { x: number; y: number } => {
  const keys = Object.keys(TETROMINOES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOES[key], x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
};

const useGameLogic = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [tetromino, setTetromino] = useState(randomTetromino);

  useEffect(() => {
    const interval = setInterval(() => {
      moveTetromino(0, 1);
    }, 500);
    return () => clearInterval(interval);
  }, [tetromino]);

  const moveTetromino = (dx: number, dy: number) => {
    setTetromino((prev) => {
      if (checkCollision(prev, dx, dy, board)) return prev; // Don't move if collision
      return { ...prev, x: prev.x + dx, y: prev.y + dy };
    });
  };

  return { board, tetromino, moveTetromino };
};

const checkCollision = (tetromino: { shape: number[][]; x: number; y: number }, dx: number, dy: number, board: Board): boolean => {
    return tetromino.shape.some((row, rowIndex) =>
      row.some((cell, colIndex) => {
        if (cell === 0) return false; // Skip empty parts of the Tetromino
        const newX = tetromino.x + colIndex + dx;
        const newY = tetromino.y + rowIndex + dy;
        return (
          newX < 0 || // Left boundary
          newX >= BOARD_WIDTH || // Right boundary
          newY >= BOARD_HEIGHT || // Bottom boundary
          (newY >= 0 && board[newY][newX] !== null) // Collision with placed blocks
        );
      })
    );
  };

export default useGameLogic;