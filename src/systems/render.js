/**
 * Render system for updating entity visuals in the Three.js scene
 */
class RenderSystem extends System {
    /**
     * Create a new render system
     */
    constructor() {
        super('render');
        this.requiredComponents = ['position'];
    }
    
    /**
     * Update entity meshes based on their position components
     * @param {Array<Entity>} entities - All entities in the world
     * @param {number} deltaTime - Time since last update in seconds
     */
    processEntities(entities, deltaTime) {
        for (const entity of entities) {
            // Update entity position in the scene
            this.updateEntityPosition(entity);
            
            // Update entity appearance
            this.updateEntityAppearance(entity, deltaTime);
        }
    }
    
    /**
     * Update entity position in the scene
     * @param {Entity} entity - The entity to update
     */
    updateEntityPosition(entity) {
        const position = entity.getComponent('position');
        
        if (entity.mesh && position) {
            // Update mesh position
            entity.mesh.position.set(position.x, position.y, position.z);
            
            // Update mesh rotation (direction)
            if (position.direction !== undefined) {
                entity.mesh.rotation.y = position.direction;
            }
        }
    }
    
    /**
     * Update entity appearance in the scene
     * @param {Entity} entity - The entity to update
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateEntityAppearance(entity, deltaTime) {
        const appearance = entity.getComponent('appearance');
        
        if (entity.mesh && appearance) {
            // Update appearance
            appearance.update(deltaTime);
        }
    }
    
    /**
     * Create a debug visualization for an entity
     * @param {Entity} entity - The entity to visualize
     */
    createDebugVisualization(entity) {
        const physics = entity.getComponent('physics');
        
        if (entity.mesh && physics && !entity.debugMesh) {
            // Create a wireframe sphere to visualize collision radius
            const geometry = new THREE.SphereGeometry(physics.collisionRadius, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            
            entity.debugMesh = new THREE.Mesh(geometry, material);
            entity.mesh.add(entity.debugMesh);
        }
    }
    
    /**
     * Remove debug visualization from an entity
     * @param {Entity} entity - The entity to remove visualization from
     */
    removeDebugVisualization(entity) {
        if (entity.mesh && entity.debugMesh) {
            entity.mesh.remove(entity.debugMesh);
            entity.debugMesh.geometry.dispose();
            entity.debugMesh.material.dispose();
            entity.debugMesh = null;
        }
    }
    
    /**
     * Toggle debug visualization for all entities
     * @param {boolean} enabled - Whether debug visualization should be enabled
     */
    toggleDebugVisualization(enabled) {
        const entities = this.world.entities;
        
        for (const entity of entities) {
            if (enabled) {
                this.createDebugVisualization(entity);
            } else {
                this.removeDebugVisualization(entity);
            }
        }
    }
}
