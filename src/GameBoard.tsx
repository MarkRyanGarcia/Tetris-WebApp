import React from "react";

interface GameBoardProps {
  board: (string | null)[][];
  tetromino: { shape: number[][]; color: string; x: number; y: number };
}

const GameBoard: React.FC<GameBoardProps> = ({ board, tetromino }) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board[0].length}, 30px)`,
          gap: "2px",
          backgroundColor: "#000",
          padding: "10px",
          border: "2px solid white",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isTetrominoPart =
              tetromino.shape.some((tRow, tY) =>
                tRow.some(
                  (value, tX) =>
                    value && tetromino.y + tY === rowIndex && tetromino.x + tX === colIndex
                )
              );
  
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: isTetrominoPart ? tetromino.color : cell || "black",
                  border: "1px solid gray",
                }}
              />
            );
          })
        )}
      </div>
    );
  };

export default GameBoard;