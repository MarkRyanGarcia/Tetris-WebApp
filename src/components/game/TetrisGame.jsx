import { useState, useEffect, useCallback } from 'react';
import { Tetrominoes, TetrominoNames } from './tetrominoes';
import './TetrisGame.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_RATE = 800; // ms

export default function TetrisGame() {
    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPiece, setCurrentPiece] = useState(null);
    const [nextPiece, setNextPiece] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [holdPiece, setHoldPiece] = useState(null);
    const [canHold, setCanHold] = useState(true);
    const [pieceBag, setPieceBag] = useState([]);

    // Initialize the bag with all tetrominoes
    const initializeBag = useCallback(() => {
        const newBag = [...TetrominoNames].sort(() => Math.random() - 0.5);
        setPieceBag(newBag);
    }, []);

    // Get the next piece from the bag
    const getRandomPiece = useCallback(() => {
        if (pieceBag.length === 0) {
            initializeBag();
            return TetrominoNames[Math.floor(Math.random() * TetrominoNames.length)];
        }
        
        const nextPieceName = pieceBag[0];
        setPieceBag(prev => prev.slice(1));
        return nextPieceName;
    }, [pieceBag, initializeBag]);

    // Initialize game
    const startGame = useCallback(() => {
        setBoard(createEmptyBoard());
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        setIsPaused(false);
        setHoldPiece(null);
        setCanHold(true);
        
        initializeBag();
        
        const firstPiece = getRandomPiece();
        const next = getRandomPiece();
        
        setCurrentPiece(firstPiece);
        setNextPiece(next);
        setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
        setRotation(0);
    }, [initializeBag, getRandomPiece]);

    // Game tick - move piece down
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const tick = setInterval(() => {
            moveDown();
        }, TICK_RATE);

        return () => clearInterval(tick);
    }, [gameStarted, gameOver, isPaused, currentPiece, position, rotation]);

    // Keyboard controls
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const handleKeyDown = (e) => {
            if (isPaused) return;

            switch (e.key) {
                case 'a':
                case 'A':
                    moveLeft();
                    break;
                case 'd':
                case 'D':
                    moveRight();
                    break;
                case 's':
                case 'S':
                    moveDown();
                    break;
                case 'w':
                case 'W':
                    hardDrop();
                    break;
                case 'Shift':
                    holdCurrentPiece();
                    break;
                case 'ArrowLeft':
                    rotateLeft();
                    break;
                case 'ArrowRight':
                    rotateRight();
                    break;
                case 'p':
                case 'P':
                    setIsPaused(prev => !prev);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStarted, gameOver, isPaused, currentPiece, position, rotation, holdPiece, canHold]);

    const checkCollision = useCallback((x, y, rot) => {
        if (!currentPiece) return true;
        
        const shape = Tetrominoes[currentPiece][rot];
        
        for (const block of shape) {
            const newX = x + block.x;
            const newY = y + block.y;
            
            if (
                newX < 0 ||
                newX >= BOARD_WIDTH ||
                newY >= BOARD_HEIGHT ||
                (newY >= 0 && board[newY][newX])
            ) {
                return true;
            }
        }
        return false;
    }, [currentPiece, board]);

    const spawnNewPiece = useCallback(() => {
        const newPieceName = nextPiece || getRandomPiece();
        const next = getRandomPiece();
        
        setCurrentPiece(newPieceName);
        setNextPiece(next);
        setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
        setRotation(0);
        setCanHold(true); // Reset hold ability when new piece spawns
        
        if (checkCollision(Math.floor(BOARD_WIDTH / 2) - 1, 0, 0)) {
            setGameOver(true);
        }
    }, [nextPiece, getRandomPiece, checkCollision]);

 
const renderHoldPiece = () => {
    if (!holdPiece) return Array(4).fill().map(() => Array(4).fill(null));
    
    const grid = Array(4).fill().map(() => Array(4).fill(null));
    const shape = Tetrominoes[holdPiece][0]; // Always show first rotation for preview
    
    // Calculate center position
    const width = Math.max(...shape.map(b => b.x)) + 1;
    const height = Math.max(...shape.map(b => b.y)) + 1;
    const offsetX = Math.floor((4 - width) / 2);
    const offsetY = Math.floor((4 - height) / 2);
    
    shape.forEach(block => {
        const x = block.x + offsetX;
        const y = block.y + offsetY;
        if (x >= 0 && x < 4 && y >= 0 && y < 4) {
            grid[y][x] = holdPiece;
        }
    });
    
    return grid;
};

    const moveLeft = () => {
        if (checkCollision(position.x - 1, position.y, rotation)) return;
        setPosition(prev => ({ ...prev, x: prev.x - 1 }));
    };

    const moveRight = () => {
        if (checkCollision(position.x + 1, position.y, rotation)) return;
        setPosition(prev => ({ ...prev, x: prev.x + 1 }));
    };

    const moveDown = () => {
        if (checkCollision(position.x, position.y + 1, rotation)) {
            lockPiece();
            return;
        }
        setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    };

    const hardDrop = useCallback(() => {
        if (!currentPiece) return;
    
        let dropY = position.y;
        while (!checkCollision(position.x, dropY + 1, rotation)) {
            dropY++;
        }
    
        const newBoard = [...board];
        let gameEnd = false;
    
        for (const block of Tetrominoes[currentPiece][rotation]) {
            const y = dropY + block.y;
            const x = position.x + block.x;
    
            if (y < 0) {
                gameEnd = true;
                break;
            }
    
            if (y >= 0 && x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT) {
                newBoard[y][x] = currentPiece;
            }
        }
    
        if (gameEnd) {
            setGameOver(true);
            return;
        }
    
        setBoard(newBoard);
        clearLines(newBoard);
        spawnNewPiece();
    }, [currentPiece, position, rotation, board, checkCollision, spawnNewPiece]);

    const rotateLeft = () => {
        const newRotation = (rotation - 1 + 4) % 4;
        if (!checkCollision(position.x, position.y, newRotation)) {
            setRotation(newRotation);
            return;
        }
        
        // Wall kicks
        const kicks = [-1, 1, -2, 2];
        for (const kick of kicks) {
            if (!checkCollision(position.x + kick, position.y, newRotation)) {
                setPosition(prev => ({ ...prev, x: prev.x + kick }));
                setRotation(newRotation);
                return;
            }
        }
    };

    const rotateRight = () => {
        const newRotation = (rotation + 1) % 4;
        if (!checkCollision(position.x, position.y, newRotation)) {
            setRotation(newRotation);
            return;
        }
        
        // Wall kicks
        const kicks = [-1, 1, -2, 2];
        for (const kick of kicks) {
            if (!checkCollision(position.x + kick, position.y, newRotation)) {
                setPosition(prev => ({ ...prev, x: prev.x + kick }));
                setRotation(newRotation);
                return;
            }
        }
    };

    const holdCurrentPiece = useCallback(() => {
        if (!canHold || !currentPiece) return;
        
        const newHold = currentPiece;
        let newCurrent;
        
        if (holdPiece) {
            // If there's already a held piece, swap with current
            newCurrent = holdPiece;
        } else {
            // If no held piece, get a new piece
            newCurrent = getRandomPiece();
        }
        
        setHoldPiece(newHold);
        setCurrentPiece(newCurrent);
        setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
        setRotation(0);
        setCanHold(false);
        
        // Check if new position is valid
        if (checkCollision(Math.floor(BOARD_WIDTH / 2) - 1, 0, 0)) {
            setGameOver(true);
        }
    }, [canHold, currentPiece, holdPiece, getRandomPiece, checkCollision]);

    const lockPiece = useCallback(() => {
        if (!currentPiece) return;

        const newBoard = [...board];
        let gameEnd = false;

        for (const block of Tetrominoes[currentPiece][rotation]) {
            const y = position.y + block.y;
            const x = position.x + block.x;

            if (y < 0) {
                gameEnd = true;
                break;
            }

            if (y >= 0 && x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT) {
                newBoard[y][x] = currentPiece;
            }
        }

        if (gameEnd) {
            setGameOver(true);
            return;
        }

        setBoard(newBoard);
        clearLines(newBoard);
        spawnNewPiece();
    }, [currentPiece, rotation, position, board, spawnNewPiece]);

    const clearLines = useCallback((boardState) => {
        const newBoard = [...boardState];
        let linesCleared = 0;

        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (newBoard[y].every(cell => cell)) {
                newBoard.splice(y, 1);
                newBoard.unshift(Array(BOARD_WIDTH).fill(null));
                linesCleared++;
                y++; // Check same row again
            }
        }

        if (linesCleared > 0) {
            setScore(prev => prev + linesCleared * 100);
            setBoard(newBoard);
        }
    }, []);

    const renderBoard = () => {
        const displayBoard = createEmptyBoard();

        // Add locked pieces
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (board[y][x]) {
                    displayBoard[y][x] = board[y][x];
                }
            }
        }

        // Add current piece
        if (currentPiece && !gameOver) {
            const shape = Tetrominoes[currentPiece][rotation];
            for (const block of shape) {
                const y = position.y + block.y;
                const x = position.x + block.x;
                
                if (y >= 0 && x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT) {
                    displayBoard[y][x] = currentPiece;
                }
            }
        }

        return displayBoard;
    };

    const renderNextPiece = () => {
        if (!nextPiece) return Array(4).fill().map(() => Array(4).fill(null));
        
        const grid = Array(4).fill().map(() => Array(4).fill(null));
        const shape = Tetrominoes[nextPiece][0]; // Always show first rotation for preview
        
        // Calculate center position
        const width = Math.max(...shape.map(b => b.x)) + 1;
        const height = Math.max(...shape.map(b => b.y)) + 1;
        const offsetX = Math.floor((4 - width) / 2);
        const offsetY = Math.floor((4 - height) / 2);
        
        shape.forEach(block => {
            const x = block.x + offsetX;
            const y = block.y + offsetY;
            if (x >= 0 && x < 4 && y >= 0 && y < 4) {
                grid[y][x] = nextPiece;
            }
        });
        
        return grid;
    };

    return (
        <div className="tetris-game">
            <div className="game-layout">
                {/* Left Panel - Controls */}
                <div className="left-panel">
                    <div className="controls">
                        {!gameStarted ? (
                            <button onClick={startGame}>Start Game</button>
                        ) : gameOver ? (
                            <button onClick={startGame}>Game Over - Play Again</button>
                        ) : (
                            <button onClick={() => setIsPaused(prev => !prev)}>
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                        )}
                    </div>

                    <div className="instructions">
                        <h3>Controls:</h3>
                        <p>A: Move Left</p>
                        <p>D: Move Right</p>
                        <p>S: Move Down</p>
                        <p>W: Hard Drop</p>
                        <p>Shift: Hold</p>
                        <p>← : Rotate Left</p>
                        <p>→ : Rotate Right</p>
                    </div>

                    <div className="score-display">
                        <h3>Score</h3>
                        <div className="score">{score}</div>
                    </div>
                </div>

                {/* Center Panel - Game Board */}
                <div className="center-panel">
                    <div className="game-board">
                        {renderBoard().map((row, y) => (
                            <div key={y} className="board-row">
                                {row.map((cell, x) => (
                                    <div
                                        key={`${y}-${x}`}
                                        className={`cell ${cell ? `cell-${cell}` : ''}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Next & Hold Pieces */}
                <div className="right-panel">
                    <div className="info-box">
                        <h3>Next</h3>
                        <div className="piece-preview">
                            {renderNextPiece().map((row, y) => (
                                row.map((cell, x) => (
                                    <div
                                        key={`next-${y}-${x}`}
                                        className={`preview-cell ${cell ? cell : ''}`}
                                    />
                                ))
                            ))}
                        </div>
                    </div>

                    <div className="info-box">
                        <h3>Hold</h3>
                        <div className="piece-preview">
                            {renderHoldPiece().map((row, y) => (
                                row.map((cell, x) => (
                                    <div
                                        key={`hold-${y}-${x}`}
                                        className={`preview-cell ${cell ? cell : ''}`}
                                    />
                                ))
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
}