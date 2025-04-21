/**
 * Maze Game - Main Controller
 * This file manages the maze generation, rendering and algorithm execution
 */

class MazeGame {
    constructor(canvasId, algorithmSelector, speedSlider, stepBtn, resetBtn, generateBtn) {
        // Canvas setup
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // UI elements
        this.algorithmSelector = document.getElementById(algorithmSelector);
        this.speedSlider = document.getElementById(speedSlider);
        this.stepBtn = document.getElementById(stepBtn);
        this.resetBtn = document.getElementById(resetBtn);
        this.generateBtn = document.getElementById(generateBtn);
        
        // Maze properties
        this.cellSize = 25;
        this.maze = null;
        this.mazeWidth = 15;
        this.mazeHeight = 15;
        
        // Algorithm properties
        this.algorithm = null;
        this.isRunning = false;
        this.speed = 100; // Default speed in ms
        this.animationInterval = null;
        
        // Initialize
        this.setupEventListeners();
        this.generateMaze();
    }
    
    setupEventListeners() {
        // Algorithm selection
        this.algorithmSelector.addEventListener('change', () => {
            this.resetAlgorithm();
            this.initializeAlgorithm();
        });
        
        // Speed slider
        this.speedSlider.addEventListener('input', () => {
            this.speed = 1000 - this.speedSlider.value; // Invert so higher = faster
            if (this.isRunning) {
                this.stopAnimation();
                this.startAnimation();
            }
        });
        
        // Step button
        this.stepBtn.addEventListener('click', () => {
            if (this.algorithm) {
                this.algorithm.step();
                this.drawMaze();
            }
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.resetAlgorithm();
            this.drawMaze();
        });
        
        // Generate new maze button
        this.generateBtn.addEventListener('click', () => {
            this.stopAnimation();
            this.generateMaze();
        });
        
        // Canvas resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    async generateMaze() {
        try {
            const response = await fetch('/generate-maze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    width: this.mazeWidth,
                    height: this.mazeHeight
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate maze');
            }
            
            this.maze = await response.json();
            this.resizeCanvas();
            this.resetAlgorithm();
            this.drawMaze();
        } catch (error) {
            console.error('Error generating maze:', error);
            // Fallback to client-side maze generation
            this.generateMazeClientSide();
        }
    }
    
    generateMazeClientSide() {
        // Simple client-side maze generation as fallback
        const cells = [];
        
        for (let x = 0; x < this.mazeWidth; x++) {
            for (let y = 0; y < this.mazeHeight; y++) {
                // Create cells with random walls
                cells.push({
                    x: x,
                    y: y,
                    walls: {
                        top: y === 0 ? true : Math.random() > 0.7,
                        right: x === this.mazeWidth - 1 ? true : Math.random() > 0.7,
                        bottom: y === this.mazeHeight - 1 ? true : Math.random() > 0.7,
                        left: x === 0 ? true : Math.random() > 0.7
                    }
                });
            }
        }
        
        // Ensure path from start to end by removing some walls
        const start = { x: 0, y: 0 };
        const end = { x: this.mazeWidth - 1, y: this.mazeHeight - 1 };
        
        // Make sure the start and end cells are accessible
        const startCell = cells.find(cell => cell.x === start.x && cell.y === start.y);
        const endCell = cells.find(cell => cell.x === end.x && cell.y === end.y);
        
        if (startCell) startCell.walls.left = false;
        if (endCell) endCell.walls.right = false;
        
        this.maze = {
            width: this.mazeWidth,
            height: this.mazeHeight,
            start: start,
            end: end,
            cells: cells
        };
    }
    
    resizeCanvas() {
        // Calculate the appropriate canvas size based on maze dimensions
        // and available space, ensuring it fits within the viewport
        const containerWidth = this.canvas.parentElement.clientWidth;
        const maxCellSize = Math.floor(containerWidth / this.mazeWidth);
        
        this.cellSize = Math.min(maxCellSize, 40); // Cap cell size
        
        // Set canvas dimensions
        this.canvas.width = this.cellSize * this.mazeWidth;
        this.canvas.height = this.cellSize * this.mazeHeight;
        
        // Redraw maze if it exists
        if (this.maze) {
            this.drawMaze();
        }
    }
    
    drawMaze() {
        if (!this.maze) return;
        
        const { ctx, cellSize } = this;
        const { cells, start, end } = this.maze;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        
        // Draw cells
        cells.forEach(cell => {
            const x = cell.x * cellSize;
            const y = cell.y * cellSize;
            
            // Draw walls
            ctx.beginPath();
            
            if (cell.walls.top) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
            }
            
            if (cell.walls.right) {
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            
            if (cell.walls.bottom) {
                ctx.moveTo(x, y + cellSize);
                ctx.lineTo(x + cellSize, y + cellSize);
            }
            
            if (cell.walls.left) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + cellSize);
            }
            
            ctx.stroke();
        });
        
        // Draw start point (green)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
            start.x * cellSize + cellSize * 0.2,
            start.y * cellSize + cellSize * 0.2,
            cellSize * 0.6,
            cellSize * 0.6
        );
        
        // Draw end point (red)
        ctx.fillStyle = '#F44336';
        ctx.fillRect(
            end.x * cellSize + cellSize * 0.2,
            end.y * cellSize + cellSize * 0.2,
            cellSize * 0.6,
            cellSize * 0.6
        );
        
        // If an algorithm is active, draw its path and visited cells
        if (this.algorithm) {
            this.algorithm.draw(ctx, cellSize);
        }
    }
    
    initializeAlgorithm() {
        const algorithmName = this.algorithmSelector.value;
        
        // Create the appropriate algorithm instance
        switch (algorithmName) {
            case 'leftWallFollower':
                this.algorithm = new LeftWallFollower(this.maze, this);
                break;
            case 'rightWallFollower':
                this.algorithm = new RightWallFollower(this.maze, this);
                break;
            case 'breadthFirstSearch':
                this.algorithm = new BreadthFirstSearch(this.maze, this);
                break;
            case 'depthFirstSearch':
                this.algorithm = new DepthFirstSearch(this.maze, this);
                break;
            case 'aStar':
                this.algorithm = new AStar(this.maze, this);
                break;
            default:
                console.error('Unknown algorithm:', algorithmName);
                return;
        }
        
        // Update UI
        this.stepBtn.disabled = false;
        this.resetBtn.disabled = false;
    }
    
    resetAlgorithm() {
        this.stopAnimation();
        this.isRunning = false;
        this.algorithm = null;
        
        if (this.algorithmSelector.value) {
            this.initializeAlgorithm();
        }
    }
    
    startAnimation() {
        if (!this.algorithm || this.isRunning) return;
        
        this.isRunning = true;
        this.animationInterval = setInterval(() => {
            const isDone = this.algorithm.step();
            this.drawMaze();
            
            if (isDone) {
                this.stopAnimation();
            }
        }, this.speed);
    }
    
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isRunning = false;
    }
    
    toggleAnimation() {
        if (this.isRunning) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    
    // Helper function to get cell at specific coordinates
    getCell(x, y) {
        if (!this.maze) return null;
        return this.maze.cells.find(cell => cell.x === x && cell.y === y);
    }
    
    // Helper function to check if a move is valid (no wall in the way)
    canMove(fromX, fromY, toX, toY) {
        const fromCell = this.getCell(fromX, fromY);
        if (!fromCell) return false;
        
        // Determine which direction we're moving
        if (fromX < toX) { // Moving right
            return !fromCell.walls.right;
        } else if (fromX > toX) { // Moving left
            return !fromCell.walls.left;
        } else if (fromY < toY) { // Moving down
            return !fromCell.walls.bottom;
        } else if (fromY > toY) { // Moving up
            return !fromCell.walls.top;
        }
        
        return false;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mazeGame = new MazeGame(
        'mazeCanvas', 
        'algorithmSelector', 
        'speedSlider', 
        'stepButton', 
        'resetButton', 
        'generateButton'
    );
    
    // Add play/pause button functionality
    const playPauseBtn = document.getElementById('playPauseButton');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            mazeGame.toggleAnimation();
            playPauseBtn.innerHTML = mazeGame.isRunning ? 
                '<i class="fas fa-pause"></i> Pause' : 
                '<i class="fas fa-play"></i> Play';
        });
    }
});
