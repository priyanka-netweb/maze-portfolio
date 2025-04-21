import os
import logging
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

@app.route('/')
def index():
    """Render the home page with the maze game."""
    return render_template('index.html')

@app.route('/projects')
def projects():
    """Render the projects page."""
    return render_template('projects.html')

@app.route('/about')
def about():
    """Render the about page."""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Render the contact page."""
    return render_template('contact.html')

@app.route('/generate-maze', methods=['POST'])
def generate_maze():
    """
    Generate a new maze with specified dimensions.
    
    This endpoint receives maze dimensions and returns a JSON representation
    of a randomly generated maze.
    """
    data = request.get_json()
    width = data.get('width', 15)
    height = data.get('height', 15)
    
    # The maze generation function is defined below in this file
    # No import needed as we can use the function directly
    
    # Generate new maze
    maze = generate_maze(width, height)
    
    return jsonify(maze)

# Maze generation module for backend
class Cell:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.visited = False
        self.walls = {"top": True, "right": True, "bottom": True, "left": True}

def generate_maze(width, height):
    """
    Implementation of depth-first search maze generation algorithm.
    Returns a JSON-serializable representation of the maze.
    """
    import random
    
    # Initialize the grid
    grid = [[Cell(x, y) for y in range(height)] for x in range(width)]
    stack = []
    
    # Choose a random starting cell
    current_cell = grid[random.randint(0, width-1)][random.randint(0, height-1)]
    current_cell.visited = True
    stack.append(current_cell)
    
    # DFS maze generation
    while stack:
        current_cell = stack[-1]
        neighbors = get_unvisited_neighbors(current_cell, grid, width, height)
        
        if not neighbors:
            stack.pop()
            continue
        
        next_cell = random.choice(neighbors)
        remove_walls(current_cell, next_cell)
        
        next_cell.visited = True
        stack.append(next_cell)
    
    # Set start and end points (top-left and bottom-right)
    start = {"x": 0, "y": 0}
    end = {"x": width-1, "y": height-1}
    
    # Convert to JSON-serializable format
    maze_data = {
        "width": width,
        "height": height,
        "start": start,
        "end": end,
        "cells": [
            {
                "x": cell.x,
                "y": cell.y,
                "walls": cell.walls
            }
            for row in grid for cell in row
        ]
    }
    
    return maze_data

def get_unvisited_neighbors(cell, grid, width, height):
    """Get unvisited neighboring cells."""
    neighbors = []
    directions = [
        {"dx": 0, "dy": -1, "direction": "top"},  # top
        {"dx": 1, "dy": 0, "direction": "right"},  # right
        {"dx": 0, "dy": 1, "direction": "bottom"},  # bottom
        {"dx": -1, "dy": 0, "direction": "left"}   # left
    ]
    
    for direction in directions:
        nx, ny = cell.x + direction["dx"], cell.y + direction["dy"]
        
        if 0 <= nx < width and 0 <= ny < height and not grid[nx][ny].visited:
            neighbors.append(grid[nx][ny])
    
    return neighbors

def remove_walls(current, next_cell):
    """Remove walls between two cells."""
    dx = current.x - next_cell.x
    dy = current.y - next_cell.y
    
    if dx == 1:  # next_cell is to the left
        current.walls["left"] = False
        next_cell.walls["right"] = False
    elif dx == -1:  # next_cell is to the right
        current.walls["right"] = False
        next_cell.walls["left"] = False
    
    if dy == 1:  # next_cell is above
        current.walls["top"] = False
        next_cell.walls["bottom"] = False
    elif dy == -1:  # next_cell is below
        current.walls["bottom"] = False
        next_cell.walls["top"] = False

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
