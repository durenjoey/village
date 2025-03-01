/**
 * Physics system for handling physics simulation and collision detection
 */
class PhysicsSystem extends System {
    /**
     * Create a new physics system
     */
    constructor() {
        super('physics');
        this.requiredComponents = ['position', 'physics'];
        
        // Physics configuration
        this.gravity = -9.8;
        this.groundLevel = 0;
        this.spatialGrid = null;
        this.gridCellSize = 10;
        this.worldSize = 100;
        this.enableGravity = true; // Flag to enable/disable gravity
        
        // Create ground plane for visualization
        this.createGroundPlane();
    }
    
    /**
     * Initialize the physics system
     */
    init() {
        // Create spatial grid for efficient collision detection
        this.createSpatialGrid();
    }
    
    /**
     * Create a spatial grid for efficient collision detection
     */
    createSpatialGrid() {
        this.spatialGrid = new Array(Math.ceil(this.worldSize / this.gridCellSize) ** 2).fill().map(() => []);
    }
    
    /**
     * Get the grid cell index for a position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Grid cell index
     */
    getGridCellIndex(x, z) {
        const gridSize = Math.ceil(this.worldSize / this.gridCellSize);
        const cellX = Math.floor((x + this.worldSize / 2) / this.gridCellSize);
        const cellZ = Math.floor((z + this.worldSize / 2) / this.gridCellSize);
        
        // Clamp to grid bounds
        const clampedCellX = Math.max(0, Math.min(gridSize - 1, cellX));
        const clampedCellZ = Math.max(0, Math.min(gridSize - 1, cellZ));
        
        return clampedCellZ * gridSize + clampedCellX;
    }
    
    /**
     * Update the spatial grid with entity positions
     * @param {Array<Entity>} entities - Entities to update in the grid
     */
    updateSpatialGrid(entities) {
        // Clear the grid
        for (let i = 0; i < this.spatialGrid.length; i++) {
            this.spatialGrid[i] = [];
        }
        
        // Add entities to the grid
        for (const entity of entities) {
            const position = entity.getComponent('position');
            if (position) {
                const cellIndex = this.getGridCellIndex(position.x, position.z);
                this.spatialGrid[cellIndex].push(entity);
            }
        }
    }
    
    /**
     * Get nearby entities for an entity
     * @param {Entity} entity - The entity to get nearby entities for
     * @returns {Array<Entity>} Nearby entities
     */
    getNearbyEntities(entity) {
        const position = entity.getComponent('position');
        if (!position) return [];
        
        const cellIndex = this.getGridCellIndex(position.x, position.z);
        const gridSize = Math.ceil(this.worldSize / this.gridCellSize);
        const cellX = cellIndex % gridSize;
        const cellZ = Math.floor(cellIndex / gridSize);
        
        const nearbyEntities = [];
        
        // Check the entity's cell and adjacent cells
        for (let z = Math.max(0, cellZ - 1); z <= Math.min(gridSize - 1, cellZ + 1); z++) {
            for (let x = Math.max(0, cellX - 1); x <= Math.min(gridSize - 1, cellX + 1); x++) {
                const neighborCellIndex = z * gridSize + x;
                nearbyEntities.push(...this.spatialGrid[neighborCellIndex]);
            }
        }
        
        // Remove the entity itself from the list
        return nearbyEntities.filter(e => e !== entity);
    }
    
    /**
     * Create a ground plane for visualization
     */
    createGroundPlane() {
        // Create a large ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x555555,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2 // Very subtle
        });
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        
        // Rotate to be horizontal
        this.groundPlane.rotation.x = Math.PI / 2;
        
        // Position at ground level
        this.groundPlane.position.y = this.groundLevel;
        
        // Add to scene when world is set
        this.groundPlane.receiveShadow = true;
    }
    
    /**
     * Set the world reference for this system
     * @param {World} world - The world this system belongs to
     */
    setWorld(world) {
        super.setWorld(world);
        
        // Add ground plane to scene
        if (this.world && this.world.scene && this.groundPlane) {
            this.world.scene.add(this.groundPlane);
        }
    }
    
    /**
     * Apply gravity to entities
     * @param {Array<Entity>} entities - Entities to apply gravity to
     * @param {number} deltaTime - Time since last update in seconds
     */
    applyGravity(entities, deltaTime) {
        // Skip gravity if disabled
        if (!this.enableGravity) return;
        
        for (const entity of entities) {
            const physics = entity.getComponent('physics');
            const position = entity.getComponent('position');
            
            if (physics && position && !physics.isStatic && physics.gravity) {
                // Apply gravity
                position.velocityY += this.gravity * deltaTime;
                
                // Check if entity is on the ground
                if (position.y <= this.groundLevel + physics.collisionRadius) {
                    position.y = this.groundLevel + physics.collisionRadius;
                    position.velocityY = 0;
                    physics.grounded = true;
                } else {
                    physics.grounded = false;
                }
            }
        }
    }
    
    /**
     * Toggle gravity on/off
     * @returns {boolean} New gravity state
     */
    toggleGravity() {
        this.enableGravity = !this.enableGravity;
        return this.enableGravity;
    }
    
    /**
     * Detect and resolve collisions between entities
     * @param {Array<Entity>} entities - Entities to check for collisions
     */
    handleCollisions(entities) {
        // Update spatial grid
        this.updateSpatialGrid(entities);
        
        // Check for collisions
        for (const entity of entities) {
            const physics = entity.getComponent('physics');
            if (!physics) continue;
            
            // Reset collision state
            physics.colliding = false;
            physics.collidingWith = [];
            
            // Get nearby entities
            const nearbyEntities = this.getNearbyEntities(entity);
            
            // Check for collisions with nearby entities
            for (const otherEntity of nearbyEntities) {
                const otherPhysics = otherEntity.getComponent('physics');
                if (!otherPhysics) continue;
                
                // Check if entities are colliding
                if (physics.checkCollision(otherEntity)) {
                    // Mark as colliding
                    physics.colliding = true;
                    physics.collidingWith.push(otherEntity);
                    
                    // Resolve collision
                    physics.resolveCollision(otherEntity);
                }
            }
        }
    }
    
    /**
     * Update entity positions based on velocity
     * @param {Array<Entity>} entities - Entities to update
     * @param {number} deltaTime - Time since last update in seconds
     */
    updatePositions(entities, deltaTime) {
        for (const entity of entities) {
            const position = entity.getComponent('position');
            if (position) {
                position.update(deltaTime);
            }
        }
    }
    
    /**
     * Update the physics system
     * @param {Array<Entity>} entities - All entities in the world
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(entities, deltaTime) {
        // Get relevant entities (those with position and physics components)
        const relevantEntities = this.getRelevantEntities(entities);
        
        // Process physics for relevant entities
        this.processEntities(relevantEntities, deltaTime);
    }
    
    /**
     * Process physics for entities
     * @param {Array<Entity>} entities - Entities to process
     * @param {number} deltaTime - Time since last update in seconds
     */
    processEntities(entities, deltaTime) {
        // Apply gravity
        this.applyGravity(entities, deltaTime);
        
        // Update positions based on velocity
        this.updatePositions(entities, deltaTime);
        
        // Handle collisions
        this.handleCollisions(entities);
        
        // Update physics components
        for (const entity of entities) {
            const physics = entity.getComponent('physics');
            if (physics) {
                physics.update(deltaTime);
            }
        }
    }
}
