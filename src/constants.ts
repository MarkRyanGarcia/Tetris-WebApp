export type TetrominoShape = number[][];

export interface Tetromino {
  shape: TetrominoShape;
  color: string;
}

export const TETROMINOES: Record<string, Tetromino> = {
  I: { shape: [[1, 1, 1, 1]], color: "cyan" },
  J: { shape: [[0, 0, 1], [1, 1, 1]], color: "blue" },
  L: { shape: [[1, 0, 0], [1, 1, 1]], color: "orange" },
  O: { shape: [[1, 1], [1, 1]], color: "yellow" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "green" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "red" },
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;