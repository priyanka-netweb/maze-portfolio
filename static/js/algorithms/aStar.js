/**
 * A* (A-Star) Algorithm
 * 
 * A* is a best-first search algorithm that finds the least-cost path from a start
 * node to a goal node. It uses a heuristic function to estimate the cost to the goal,
 * which helps guide the search more efficiently than BFS or DFS.
 */
class AStar {
    constructor(maze, game) {
        this.maze = maze;
        this.game = game;
        
        // Open set - nodes to be evaluated
        this.openSet = new PriorityQueue();
        
        // Starting position with cost = 0 and initial path
        this.openSet.enqueue({
            x: maze.start.x,
            y: maze.start.y,
            g: 0, // Cost from start to current node
            f: this.heuristic(maze.start.x, maze.start.y), // Estimated total cost
            path: [{x: maze.start.x, y: maze.start.y}]
        });
        
        // Closed set - nodes already evaluated
        this.closedSet = new Set();
        
        // Current path being explored
        this.currentPath = [{x: maze.start.x, y: maze.start.y}];
        
        // Final path from start to end (if found)
        this.finalPath = null;
        
        // Whether the algorithm has finished
        this.done = false;
    }
    
    // Heuristic function - Manhattan distance to the goal
    heuristic(x, y) {
        return Math.abs(x - this.maze.end.x) + Math.abs(y - this.maze.end.y);
    }
    
    step() {
        if (this.done) return true;
        
        // If open set is empty, there's no path
        if (this.openSet.isEmpty()) {
            this.done = true;
            return true;
        }
        
        // Get the node with the lowest f score from the open set
        const current = this.openSet.dequeue();
        this.currentPath = current.path;
        
        // Check if we've reached the goal
        if (current.x === this.maze.end.x && current.y === this.maze.end.y) {
            this.finalPath = current.path;
            this.done = true;
            return true;
        }
        
        // Add current to closed set
        this.closedSet.add(`${current.x},${current.y}`);
        
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
            const neighborKey = `${nextX},${nextY}`;
            
            // Check if we can move to this cell and it's not in the closed set
            if (this.canMove(current.x, current.y, nextX, nextY) && !this.closedSet.has(neighborKey)) {
                // Calculate new g score (cost from start)
                // In this case, each move costs 1
                const tentativeG = current.g + 1;
                
                // Create neighbor node
                const neighbor = {
                    x: nextX,
                    y: nextY,
                    g: tentativeG,
                    f: tentativeG + this.heuristic(nextX, nextY),
                    path: [...current.path, {x: nextX, y: nextY}]
                };
                
                // Check if this neighbor is already in the open set with a better score
                let inOpenSet = false;
                for (let i = 0; i < this.openSet.items.length; i++) {
                    const item = this.openSet.items[i];
                    if (item.element.x === nextX && item.element.y === nextY) {
                        inOpenSet = true;
                        // If our new path is better, update it
                        if (tentativeG < item.element.g) {
                            item.element.g = tentativeG;
                            item.element.f = tentativeG + this.heuristic(nextX, nextY);
                            item.element.path = neighbor.path;
                            // Reorder the priority queue
                            this.openSet.items.sort((a, b) => a.priority - b.priority);
                        }
                        break;
                    }
                }
                
                // If not in open set, add it
                if (!inOpenSet) {
                    this.openSet.enqueue(neighbor);
                }
            }
        }
        
        return false;
    }
    
    canMove(fromX, fromY, toX, toY) {
        // Check if we can move to the given coordinates
        return this.game.canMove(fromX, fromY, toX, toY);
    }
    
    draw(ctx, cellSize) {
        // Draw closed set cells (light red)
        ctx.fillStyle = 'rgba(244, 67, 54, 0.3)'; // Red with transparency
        this.closedSet.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize
            );
        });
        
        // Draw open set cells (light cyan)
        ctx.fillStyle = 'rgba(0, 188, 212, 0.3)'; // Cyan with transparency
        this.openSet.items.forEach(item => {
            const { x, y } = item.element;
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize
            );
        });
        
        // Draw the current exploration path (teal line)
        if (this.currentPath && this.currentPath.length > 1) {
            ctx.strokeStyle = '#00796B';
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
        
        // If solution found, draw the final path (cyan line)
        if (this.finalPath && this.finalPath.length > 1) {
            ctx.strokeStyle = '#00BCD4';
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
            
            // Draw current position (cyan circle)
            const lastPoint = this.finalPath[this.finalPath.length - 1];
            ctx.fillStyle = '#00BCD4';
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
            // Draw current position (teal circle)
            const lastPoint = this.currentPath[this.currentPath.length - 1];
            ctx.fillStyle = '#00796B';
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

/**
 * Priority Queue implementation for A* algorithm
 */
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(element) {
        // Calculate priority based on f score
        const priority = element.f;
        
        // Create queue item with priority
        const queueElement = { element, priority };
        
        // Flag to check if element is added
        let added = false;
        
        // Add element based on priority (lower f = higher priority)
        for (let i = 0; i < this.items.length; i++) {
            if (priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        
        // If element has lowest priority, add at the end
        if (!added) {
            this.items.push(queueElement);
        }
    }
    
    dequeue() {
        // Remove element with highest priority (front of queue)
        if (this.isEmpty()) return null;
        return this.items.shift().element;
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}
