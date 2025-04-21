/**
 * Right Wall Follower Algorithm
 * 
 * This algorithm follows the right wall of the maze to find the exit.
 * It's guaranteed to find the exit in a simply connected maze (without loops).
 */
class RightWallFollower {
    constructor(maze, game) {
        this.maze = maze;
        this.game = game;
        
        // Current position, starting at the entrance
        this.currentX = maze.start.x;
        this.currentY = maze.start.y;
        
        // Direction: 0 = up, 1 = right, 2 = down, 3 = left
        this.direction = 1; // Start facing right
        
        // Path history
        this.path = [{x: this.currentX, y: this.currentY}];
        
        // Visited cells
        this.visited = new Set();
        this.addToVisited(this.currentX, this.currentY);
        
        // Whether the algorithm has finished
        this.done = false;
    }
    
    step() {
        if (this.done) return true;
        
        // Check if we've reached the goal
        if (this.currentX === this.maze.end.x && this.currentY === this.maze.end.y) {
            this.done = true;
            return true;
        }
        
        // Right Wall Follower logic:
        // 1. Try to turn right and move
        // 2. If can't turn right, try to go straight
        // 3. If can't go straight, try to turn left
        // 4. If can't turn left, turn around
        
        // Calculate the direction to our right
        const rightDirection = (this.direction + 1) % 4;
        // Calculate coordinates if we turn right
        let nextX = this.currentX;
        let nextY = this.currentY;
        
        // Determine next position based on turning right
        if (rightDirection === 0) { // Up
            nextY--;
        } else if (rightDirection === 1) { // Right
            nextX++;
        } else if (rightDirection === 2) { // Down
            nextY++;
        } else { // Left
            nextX--;
        }
        
        // Try to turn right
        if (this.canMove(nextX, nextY)) {
            // Can move right, update direction and position
            this.direction = rightDirection;
            this.updatePosition(nextX, nextY);
            return false;
        }
        
        // Can't turn right, try going straight
        nextX = this.currentX;
        nextY = this.currentY;
        
        if (this.direction === 0) { // Up
            nextY--;
        } else if (this.direction === 1) { // Right
            nextX++;
        } else if (this.direction === 2) { // Down
            nextY++;
        } else { // Left
            nextX--;
        }
        
        if (this.canMove(nextX, nextY)) {
            // Can move straight, update position
            this.updatePosition(nextX, nextY);
            return false;
        }
        
        // Can't go straight, try turning left
        const leftDirection = (this.direction + 3) % 4;
        nextX = this.currentX;
        nextY = this.currentY;
        
        if (leftDirection === 0) { // Up
            nextY--;
        } else if (leftDirection === 1) { // Right
            nextX++;
        } else if (leftDirection === 2) { // Down
            nextY++;
        } else { // Left
            nextX--;
        }
        
        if (this.canMove(nextX, nextY)) {
            // Can turn left, update direction and position
            this.direction = leftDirection;
            this.updatePosition(nextX, nextY);
            return false;
        }
        
        // Can't go right, straight, or left - turn around
        this.direction = (this.direction + 2) % 4;
        return false;
    }
    
    updatePosition(x, y) {
        this.currentX = x;
        this.currentY = y;
        this.path.push({x, y});
        this.addToVisited(x, y);
    }
    
    canMove(x, y) {
        // Check if we can move to the given coordinates
        return this.game.canMove(this.currentX, this.currentY, x, y);
    }
    
    addToVisited(x, y) {
        this.visited.add(`${x},${y}`);
    }
    
    hasVisited(x, y) {
        return this.visited.has(`${x},${y}`);
    }
    
    draw(ctx, cellSize) {
        // Draw visited cells (light purple)
        ctx.fillStyle = 'rgba(186, 104, 200, 0.3)'; // Purple with transparency
        this.visited.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize
            );
        });
        
        // Draw the path (purple line)
        if (this.path.length > 1) {
            ctx.strokeStyle = '#8E24AA';
            ctx.lineWidth = cellSize / 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            const firstPoint = this.path[0];
            ctx.moveTo(
                firstPoint.x * cellSize + cellSize / 2,
                firstPoint.y * cellSize + cellSize / 2
            );
            
            for (let i = 1; i < this.path.length; i++) {
                const point = this.path[i];
                ctx.lineTo(
                    point.x * cellSize + cellSize / 2,
                    point.y * cellSize + cellSize / 2
                );
            }
            
            ctx.stroke();
        }
        
        // Draw current position (purple circle)
        ctx.fillStyle = '#8E24AA';
        ctx.beginPath();
        ctx.arc(
            this.currentX * cellSize + cellSize / 2,
            this.currentY * cellSize + cellSize / 2,
            cellSize / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}
