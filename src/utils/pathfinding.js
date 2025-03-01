/**
 * Pathfinding utilities for the simulation
 */
class Pathfinder {
    /**
     * Create a new pathfinder
     */
    constructor() {
        this.grid = null;
        this.gridSize = 100;
        this.cellSize = 1;
        this.obstacles = [];
    }
    
    /**
     * Initialize the pathfinding grid
     * @param {number} gridSize - Size of the grid (world size)
     * @param {number} cellSize - Size of each grid cell
     */
    initGrid(gridSize, cellSize) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        
        // Create grid
        const gridCells = Math.ceil(gridSize / cellSize);
        this.grid = new Array(gridCells);
        
        for (let i = 0; i < gridCells; i++) {
            this.grid[i] = new Array(gridCells).fill(0);
        }
    }
    
    /**
     * Add an obstacle to the grid
     * @param {Object} obstacle - Obstacle to add
     * @param {number} obstacle.x - X coordinate
     * @param {number} obstacle.z - Z coordinate
     * @param {number} obstacle.radius - Obstacle radius
     */
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
        
        // Update grid with obstacle
        if (this.grid) {
            const gridCells = this.grid.length;
            const halfGrid = this.gridSize / 2;
            
            // Calculate grid coordinates
            const gridX = Math.floor((obstacle.x + halfGrid) / this.cellSize);
            const gridZ = Math.floor((obstacle.z + halfGrid) / this.cellSize);
            const gridRadius = Math.ceil(obstacle.radius / this.cellSize);
            
            // Mark grid cells as obstacles
            for (let z = Math.max(0, gridZ - gridRadius); z <= Math.min(gridCells - 1, gridZ + gridRadius); z++) {
                for (let x = Math.max(0, gridX - gridRadius); x <= Math.min(gridCells - 1, gridX + gridRadius); x++) {
                    // Check if cell is within obstacle radius
                    const dx = (x - gridX) * this.cellSize;
                    const dz = (z - gridZ) * this.cellSize;
                    const distanceSquared = dx * dx + dz * dz;
                    
                    if (distanceSquared <= obstacle.radius * obstacle.radius) {
                        this.grid[z][x] = 1; // Mark as obstacle
                    }
                }
            }
        }
    }
    
    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles = [];
        
        // Reset grid
        if (this.grid) {
            const gridCells = this.grid.length;
            
            for (let z = 0; z < gridCells; z++) {
                for (let x = 0; x < gridCells; x++) {
                    this.grid[z][x] = 0;
                }
            }
        }
    }
    
    /**
     * Convert world coordinates to grid coordinates
     * @param {number} x - World X coordinate
     * @param {number} z - World Z coordinate
     * @returns {Object} Grid coordinates {x, z}
     */
    worldToGrid(x, z) {
        const halfGrid = this.gridSize / 2;
        const gridX = Math.floor((x + halfGrid) / this.cellSize);
        const gridZ = Math.floor((z + halfGrid) / this.cellSize);
        
        return { x: gridX, z: gridZ };
    }
    
    /**
     * Convert grid coordinates to world coordinates
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridZ - Grid Z coordinate
     * @returns {Object} World coordinates {x, z}
     */
    gridToWorld(gridX, gridZ) {
        const halfGrid = this.gridSize / 2;
        const x = (gridX * this.cellSize) - halfGrid + (this.cellSize / 2);
        const z = (gridZ * this.cellSize) - halfGrid + (this.cellSize / 2);
        
        return { x, z };
    }
    
    /**
     * Check if a grid cell is walkable
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridZ - Grid Z coordinate
     * @returns {boolean} True if walkable
     */
    isWalkable(gridX, gridZ) {
        // Check grid bounds
        if (!this.grid || gridX < 0 || gridX >= this.grid.length || gridZ < 0 || gridZ >= this.grid.length) {
            return false;
        }
        
        // Check if cell is an obstacle
        return this.grid[gridZ][gridX] === 0;
    }
    
    /**
     * Get the neighbors of a grid cell
     * @param {Object} node - Current node
     * @param {boolean} allowDiagonal - Whether to allow diagonal movement
     * @returns {Array<Object>} Neighboring nodes
     */
    getNeighbors(node, allowDiagonal = true) {
        const neighbors = [];
        const { x, z } = node;
        
        // Cardinal directions
        const directions = [
            { x: 0, z: -1 }, // North
            { x: 1, z: 0 },  // East
            { x: 0, z: 1 },  // South
            { x: -1, z: 0 }  // West
        ];
        
        // Add diagonal directions if allowed
        if (allowDiagonal) {
            directions.push(
                { x: 1, z: -1 },  // Northeast
                { x: 1, z: 1 },   // Southeast
                { x: -1, z: 1 },  // Southwest
                { x: -1, z: -1 }  // Northwest
            );
        }
        
        // Check each direction
        for (const dir of directions) {
            const neighborX = x + dir.x;
            const neighborZ = z + dir.z;
            
            // Check if walkable
            if (this.isWalkable(neighborX, neighborZ)) {
                neighbors.push({ x: neighborX, z: neighborZ });
            }
        }
        
        return neighbors;
    }
    
    /**
     * Calculate the heuristic (estimated cost) between two points
     * @param {Object} a - First point
     * @param {Object} b - Second point
     * @returns {number} Heuristic value
     */
    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
    }
    
    /**
     * Find a path between two points using A* algorithm
     * @param {Object} start - Start position {x, z}
     * @param {Object} end - End position {x, z}
     * @returns {Array<Object>} Path as array of points {x, z}
     */
    findPath(start, end) {
        // If grid not initialized, use direct path
        if (!this.grid) {
            return [
                { x: start.x, z: start.z },
                { x: end.x, z: end.z }
            ];
        }
        
        // Convert world coordinates to grid coordinates
        const gridStart = this.worldToGrid(start.x, start.z);
        const gridEnd = this.worldToGrid(end.x, end.z);
        
        // Check if start or end is not walkable
        if (!this.isWalkable(gridStart.x, gridStart.z) || !this.isWalkable(gridEnd.x, gridEnd.z)) {
            // Find nearest walkable cell for start
            const nearestStart = this.findNearestWalkable(gridStart.x, gridStart.z);
            if (nearestStart) {
                gridStart.x = nearestStart.x;
                gridStart.z = nearestStart.z;
            }
            
            // Find nearest walkable cell for end
            const nearestEnd = this.findNearestWalkable(gridEnd.x, gridEnd.z);
            if (nearestEnd) {
                gridEnd.x = nearestEnd.x;
                gridEnd.z = nearestEnd.z;
            }
        }
        
        // A* algorithm
        const openSet = new PriorityQueue();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        // Initialize start node
        const startKey = `${gridStart.x},${gridStart.z}`;
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(gridStart, gridEnd));
        openSet.enqueue(gridStart, fScore.get(startKey));
        
        // A* main loop
        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();
            const currentKey = `${current.x},${current.z}`;
            
            // Check if reached end
            if (current.x === gridEnd.x && current.z === gridEnd.z) {
                // Reconstruct path
                const path = this.reconstructPath(cameFrom, current);
                
                // Convert grid coordinates to world coordinates
                return path.map(point => this.gridToWorld(point.x, point.z));
            }
            
            // Add to closed set
            closedSet.add(currentKey);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.z}`;
                
                // Skip if in closed set
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                // Calculate tentative g score
                const tentativeGScore = gScore.get(currentKey) + 1;
                
                // Check if new path is better
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    // Update path
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, gridEnd));
                    
                    // Add to open set if not already there
                    if (!openSet.contains(neighbor)) {
                        openSet.enqueue(neighbor, fScore.get(neighborKey));
                    }
                }
            }
        }
        
        // No path found, return direct path
        return [
            { x: start.x, z: start.z },
            { x: end.x, z: end.z }
        ];
    }
    
    /**
     * Find the nearest walkable cell to a given cell
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridZ - Grid Z coordinate
     * @returns {Object|null} Nearest walkable cell {x, z}, or null if none found
     */
    findNearestWalkable(gridX, gridZ) {
        // Check in expanding rings around the cell
        for (let radius = 1; radius < 10; radius++) {
            for (let dz = -radius; dz <= radius; dz++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    // Skip cells that aren't on the edge of the ring
                    if (Math.abs(dx) < radius && Math.abs(dz) < radius) {
                        continue;
                    }
                    
                    const x = gridX + dx;
                    const z = gridZ + dz;
                    
                    if (this.isWalkable(x, z)) {
                        return { x, z };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Reconstruct path from A* result
     * @param {Map} cameFrom - Map of nodes to their predecessors
     * @param {Object} current - End node
     * @returns {Array<Object>} Path as array of points {x, z}
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (cameFrom.has(`${current.x},${current.z}`)) {
            current = cameFrom.get(`${current.x},${current.z}`);
            path.unshift(current);
        }
        
        return path;
    }
}

/**
 * Priority queue for A* algorithm
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
        this.priorities = new Map();
    }
    
    isEmpty() {
        return this.elements.length === 0;
    }
    
    contains(element) {
        return this.priorities.has(`${element.x},${element.z}`);
    }
    
    enqueue(element, priority) {
        this.elements.push(element);
        this.priorities.set(`${element.x},${element.z}`, priority);
        this.elements.sort((a, b) => {
            return this.priorities.get(`${a.x},${a.z}`) - this.priorities.get(`${b.x},${b.z}`);
        });
    }
    
    dequeue() {
        return this.elements.shift();
    }
}
