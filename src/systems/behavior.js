/**
 * Behavior system for handling entity AI and decision-making
 */
class BehaviorSystem extends System {
    /**
     * Create a new behavior system
     */
    constructor() {
        super('behavior');
        this.requiredComponents = ['behavior', 'position'];
    }
    
    /**
     * Process behavior for entities
     * @param {Array<Entity>} entities - Entities to process
     * @param {number} deltaTime - Time since last update in seconds
     */
    processEntities(entities, deltaTime) {
        // Get current time from time system
        let hour = 6; // Default to 6 AM
        if (this.world && this.world.getSystem('time')) {
            hour = this.world.getSystem('time').getCurrentHour();
        }
        
        // Process behavior for each entity
        for (const entity of entities) {
            this.processBehavior(entity, deltaTime, hour);
        }
    }
    
    /**
     * Process behavior for an entity
     * @param {Entity} entity - Entity to process behavior for
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} hour - Current hour of the day
     */
    processBehavior(entity, deltaTime, hour) {
        const behavior = entity.getComponent('behavior');
        if (!behavior) return;
        
        // Set entity's world reference
        if (!entity.world) {
            entity.world = this.world;
            console.log(`Set world reference for entity ${entity.id} (${entity.type})`);
        }
        
        // Force daily routine update when hour changes
        const position = entity.getComponent('position');
        if (position && behavior.taskQueue.length === 0) {
            // Log that we're updating the daily routine
            console.log(`Updating daily routine for ${entity.type} ${entity.id} at hour ${hour}`);
            
            // Update daily routine
            behavior.updateDailyRoutine(hour);
            
            // Log the new tasks
            if (behavior.taskQueue.length > 0) {
                const taskTypes = behavior.taskQueue.map(task => task.type).join(', ');
                console.log(`Added tasks: ${taskTypes}`);
            }
        }
        
        // Update behavior
        behavior.update(deltaTime);
    }
    
    /**
     * Find nearby entities for an entity
     * @param {Entity} entity - Entity to find nearby entities for
     * @param {number} radius - Search radius
     * @returns {Array<Entity>} Nearby entities
     */
    findNearbyEntities(entity, radius) {
        const position = entity.getComponent('position');
        if (!position) return [];
        
        const nearbyEntities = [];
        
        for (const otherEntity of this.world.entities) {
            if (otherEntity === entity) continue;
            
            const otherPosition = otherEntity.getComponent('position');
            if (!otherPosition) continue;
            
            // Calculate distance
            const dx = position.x - otherPosition.x;
            const dz = position.z - otherPosition.z;
            const distanceSquared = dx * dx + dz * dz;
            
            // Check if within radius
            if (distanceSquared <= radius * radius) {
                nearbyEntities.push(otherEntity);
            }
        }
        
        return nearbyEntities;
    }
    
    /**
     * Find the nearest entity of a specific type
     * @param {Entity} entity - Entity to find nearest entity for
     * @param {string} type - Type of entity to find
     * @param {number} maxDistance - Maximum search distance
     * @returns {Entity|null} Nearest entity of the specified type, or null if none found
     */
    findNearestEntityOfType(entity, type, maxDistance = Infinity) {
        const position = entity.getComponent('position');
        if (!position) return null;
        
        let nearestEntity = null;
        let nearestDistanceSquared = maxDistance * maxDistance;
        
        for (const otherEntity of this.world.entities) {
            if (otherEntity === entity || otherEntity.type !== type) continue;
            
            const otherPosition = otherEntity.getComponent('position');
            if (!otherPosition) continue;
            
            // Calculate distance
            const dx = position.x - otherPosition.x;
            const dz = position.z - otherPosition.z;
            const distanceSquared = dx * dx + dz * dz;
            
            // Check if closer than current nearest
            if (distanceSquared < nearestDistanceSquared) {
                nearestEntity = otherEntity;
                nearestDistanceSquared = distanceSquared;
            }
        }
        
        return nearestEntity;
    }
    
    /**
     * Find a path between two points
     * @param {Object} start - Start position {x, z}
     * @param {Object} end - End position {x, z}
     * @param {Array<Object>} obstacles - Obstacles to avoid
     * @returns {Array<Object>} Path as array of points {x, z}
     */
    findPath(start, end, obstacles = []) {
        // Simple direct path for now
        // In a real implementation, this would use A* or another pathfinding algorithm
        return [
            { x: start.x, z: start.z },
            { x: end.x, z: end.z }
        ];
    }
    
    /**
     * Make an entity follow a path
     * @param {Entity} entity - Entity to make follow the path
     * @param {Array<Object>} path - Path to follow
     */
    followPath(entity, path) {
        const behavior = entity.getComponent('behavior');
        if (!behavior) return;
        
        // Clear current tasks
        behavior.clearTasks();
        
        // Add follow path task
        behavior.addTask({
            type: 'follow_path',
            data: { waypoints: path }
        });
    }
    
    /**
     * Make an entity move to a position
     * @param {Entity} entity - Entity to move
     * @param {Object} position - Position to move to {x, y, z}
     */
    moveEntityTo(entity, position) {
        const behavior = entity.getComponent('behavior');
        if (!behavior) return;
        
        // Clear current tasks
        behavior.clearTasks();
        
        // Add move to task
        behavior.addTask({
            type: 'move_to',
            data: { position }
        });
    }
    
    /**
     * Make an entity work
     * @param {Entity} entity - Entity to make work
     * @param {number} duration - Duration of work in seconds
     */
    makeEntityWork(entity, duration) {
        const behavior = entity.getComponent('behavior');
        if (!behavior) return;
        
        // Add work task
        behavior.addTask({
            type: 'work',
            data: { duration }
        });
    }
    
    /**
     * Make an entity wait
     * @param {Entity} entity - Entity to make wait
     * @param {number} duration - Duration of wait in seconds
     */
    makeEntityWait(entity, duration) {
        const behavior = entity.getComponent('behavior');
        if (!behavior) return;
        
        // Add wait task
        behavior.addTask({
            type: 'wait',
            data: { duration }
        });
    }
}
