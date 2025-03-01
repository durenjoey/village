/**
 * Base Component class for the Entity Component System
 * Components store data and properties for entities
 */
class Component {
    /**
     * Create a new component
     * @param {string} type - The type of component
     */
    constructor(type) {
        this.type = type;
        this.entity = null;
    }

    /**
     * Initialize the component with an entity
     * @param {Entity} entity - The entity to attach this component to
     */
    init(entity) {
        this.entity = entity;
    }

    /**
     * Update the component
     * This method should be overridden by subclasses
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // To be implemented by subclasses
    }
}
