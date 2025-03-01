/**
 * Base Entity class for the Entity Component System
 * Entities are containers for components that define their behavior and properties
 */
class Entity {
    constructor() {
        this.id = Entity.nextId++;
        this.components = {};
        this.type = 'entity';
        this.mesh = null;
    }

    /**
     * Add a component to this entity
     * @param {Component} component - The component to add
     */
    addComponent(component) {
        this.components[component.type] = component;
        component.entity = this;
    }

    /**
     * Get a component by type
     * @param {string} type - The type of component to get
     * @returns {Component|null} The component, or null if not found
     */
    getComponent(type) {
        return this.components[type] || null;
    }

    /**
     * Check if this entity has a component
     * @param {string} type - The type of component to check for
     * @returns {boolean} True if the entity has the component
     */
    hasComponent(type) {
        return !!this.components[type];
    }

    /**
     * Remove a component from this entity
     * @param {string} type - The type of component to remove
     */
    removeComponent(type) {
        if (this.components[type]) {
            this.components[type].entity = null;
            delete this.components[type];
        }
    }

    /**
     * Update the entity's position based on its position component
     */
    updatePosition() {
        const position = this.getComponent('position');
        if (position && this.mesh) {
            // Update mesh position directly
            this.mesh.position.set(position.x, position.y, position.z);
            
            // Debug position updates for non-terrain entities
            if (this.type !== 'terrain') {
                // Log position updates less frequently to avoid console spam
                if (Math.random() < 0.1) { // Only log 10% of updates
                    console.log(`Entity ${this.id} (${this.type}) position updated to: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`);
                }
            }
            
            // Force immediate render update
            if (this.world && this.world.renderer && this.world.scene && this.world.camera) {
                this.world.renderer.render(this.world.scene, this.world.camera);
            }
        }
    }

    /**
     * Update the entity's rotation based on its position component
     */
    updateRotation() {
        const position = this.getComponent('position');
        if (position && this.mesh && position.direction !== undefined) {
            this.mesh.rotation.y = position.direction;
        }
    }
}

// Static counter for generating unique entity IDs
Entity.nextId = 1;
