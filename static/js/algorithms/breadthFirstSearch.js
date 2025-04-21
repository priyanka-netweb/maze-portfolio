/**
 * Breadth-First Search Algorithm
 * 
 * This algorithm explores all possible paths by visiting cells in order of their distance
 * from the starting point. It guarantees finding the shortest path in unweighted graphs.
 */
class BreadthFirstSearch {
    constructor(maze, game) {
        this.maze = maze;
        this.game = game;
        
        // Queue for BFS
        this.queue = [];
        
        // Starting position
        this.queue.push({
            x: maze.start.x,
            y: maze.start.y,
            path: [{x: maze.start.x, y: maze.start.y}]
        });
        
        // Visited cells to prevent cycles
        this.visited = new Set();
        this.addToVisited(maze.start.x, maze.start.y);
        
        // Current path being explored
        this.currentPath = [{x: maze.start.x, y: maze.start.y}];
        
        // Final path from start to end (if found)
        this.finalPath = null;
        
        // Whether the algorithm has finished
        this.done = false;
    }
    
    step() {
        if (this.done) return true;
        
        // If queue is empty, we've explored all possible paths
        if (this.queue.length === 0) {
            this.done = true;
            return true;
        }
        
        // Get the next cell from the queue
        const current = this.queue.shift();
        this.currentPath = current.path;
        
        // Check if we've reached the goal
        if (current.x === this.maze.end.x && current.y === this.maze.end.y) {
            this.finalPath = current.path;
            this.done = true;
            return true;
        }
        
        // Try moving in all four directions
        const directions = [
            {dx: 0, dy: -1}, // Up
            {dx: 1, dy: 0},  // Right
            {dx: 0, dy: 1},  // Down
            {dx: -1, dy: 0}  // Left
        ];
        
        for (const dir of directions) {
            const nextX = current.x + dir.dx;
            const nextY = current.y + dir.dy;
            
            // Check if we can move to this cell and haven't visited it yet
            if (this.canMove(current.x, current.y, nextX, nextY) && !this.hasVisited(nextX, nextY)) {
                // Mark as visited
                this.addToVisited(nextX, nextY);
                
                // Create new path by copying current path and adding new position
                const newPath = [...current.path, {x: nextX, y: nextY}];
                
                // Add to queue
                this.queue.push({
                    x: nextX,
                    y: nextY,
                    path: newPath
                });
            }
        }
        
        return false;
    }
    
    canMove(fromX, fromY, toX, toY) {
        // Check if we can move to the given coordinates
        return this.game.canMove(fromX, fromY, toX, toY);
    }
    
    addToVisited(x, y) {
        this.visited.add(`${x},${y}`);
    }
    
    hasVisited(x, y) {
        return this.visited.has(`${x},${y}`);
    }
    
    draw(ctx, cellSize) {
        // Draw visited cells (light yellow)
        ctx.fillStyle = 'rgba(255, 235, 59, 0.3)'; // Yellow with transparency
        this.visited.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize
            );
        });
        
        // Draw the current exploration path (orange line)
        if (this.currentPath && this.currentPath.length > 1) {
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = cellSize / 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            const firstPoint = this.currentPath[0];
            ctx.moveTo(
                firstPoint.x * cellSize + cellSize / 2,
                firstPoint.y * cellSize + cellSize / 2
            );
            
            for (let i = 1; i < this.currentPath.length; i++) {
                const point = this.currentPath[i];
                ctx.lineTo(
                    point.x * cellSize + cellSize / 2,
                    point.y * cellSize + cellSize / 2
                );
            }
            
            ctx.stroke();
        }
        
        // If solution found, draw the final path (gold line)
        if (this.finalPath && this.finalPath.length > 1) {
            ctx.strokeStyle = '#FFC107';
            ctx.lineWidth = cellSize / 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            const firstPoint = this.finalPath[0];
            ctx.moveTo(
                firstPoint.x * cellSize + cellSize / 2,
                firstPoint.y * cellSize + cellSize / 2
            );
            
            for (let i = 1; i < this.finalPath.length; i++) {
                const point = this.finalPath[i];
                ctx.lineTo(
                    point.x * cellSize + cellSize / 2,
                    point.y * cellSize + cellSize / 2
                );
            }
            
            ctx.stroke();
            
            // Draw current position (yellow circle)
            const lastPoint = this.finalPath[this.finalPath.length - 1];
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.arc(
                lastPoint.x * cellSize + cellSize / 2,
                lastPoint.y * cellSize + cellSize / 2,
                cellSize / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else if (this.currentPath.length > 0) {
            // Draw current position (orange circle)
            const lastPoint = this.currentPath[this.currentPath.length - 1];
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(
                lastPoint.x * cellSize + cellSize / 2,
                lastPoint.y * cellSize + cellSize / 2,
                cellSize / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}
