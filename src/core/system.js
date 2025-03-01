/**
 * Base System class for the Entity Component System
 * Systems operate on entities with specific components to implement game logic
 */
class System {
    /**
     * Create a new system
     * @param {string} type - The type of system
     */
    constructor(type) {
        this.type = type;
        this.world = null;
        this.requiredComponents = [];
    }

    /**
     * Set the world reference for this system
     * @param {World} world - The world this system belongs to
     */
    setWorld(world) {
        this.world = world;
    }

    /**
     * Check if an entity has all required components for this system
     * @param {Entity} entity - The entity to check
     * @returns {boolean} True if the entity has all required components
     */
    checkRequirements(entity) {
        return this.requiredComponents.every(type => entity.hasComponent(type));
    }

    /**
     * Get all entities that meet this system's requirements
     * @param {Array<Entity>} entities - All entities to filter
     * @returns {Array<Entity>} Entities that have all required components
     */
    getRelevantEntities(entities) {
        return entities.filter(entity => this.checkRequirements(entity));
    }

    /**
     * Update the system
     * This method should be overridden by subclasses
     * @param {Array<Entity>} entities - All entities in the world
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(entities, deltaTime) {
        // To be implemented by subclasses
        const relevantEntities = this.getRelevantEntities(entities);
        this.processEntities(relevantEntities, deltaTime);
    }

    /**
     * Process entities that meet this system's requirements
     * This method should be overridden by subclasses
     * @param {Array<Entity>} entities - Entities that have all required components
     * @param {number} deltaTime - Time since last update in seconds
     */
    processEntities(entities, deltaTime) {
        // To be implemented by subclasses
    }
}
