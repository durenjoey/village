/**
 * Physics component for handling entity physics properties and collision
 */
class PhysicsComponent extends Component {
    /**
     * Create a new physics component
     * @param {Object} options - Physics options
     * @param {number} options.mass - Entity mass
     * @param {boolean} options.isStatic - Whether the entity is static (immovable)
     * @param {number} options.friction - Friction coefficient
     * @param {number} options.restitution - Restitution (bounciness)
     * @param {number} options.collisionRadius - Radius for collision detection
     */
    constructor(options = {}) {
        super('physics');
        
        this.mass = options.mass || 1;
        this.isStatic = options.isStatic || false;
        this.friction = options.friction || 0.5;
        this.restitution = options.restitution || 0.2;
        this.collisionRadius = options.collisionRadius || 0.5;
        this.gravity = options.gravity !== undefined ? options.gravity : true;
        
        this.grounded = false;
        this.colliding = false;
        this.collidingWith = [];
    }
    
    /**
     * Check if this entity is colliding with another entity
     * @param {Entity} otherEntity - The other entity to check collision with
     * @returns {boolean} True if colliding
     */
    checkCollision(otherEntity) {
        // Get position components
        const myPosition = this.entity.getComponent('position');
        const otherPosition = otherEntity.getComponent('position');
        const otherPhysics = otherEntity.getComponent('physics');
        
        if (!myPosition || !otherPosition || !otherPhysics) {
            return false;
        }
        
        // Calculate distance between entities
        const dx = myPosition.x - otherPosition.x;
        const dz = myPosition.z - otherPosition.z;
        const distanceSquared = dx * dx + dz * dz;
        
        // Check if distance is less than sum of collision radii
        const minDistance = this.collisionRadius + otherPhysics.collisionRadius;
        return distanceSquared < minDistance * minDistance;
    }
    
    /**
     * Resolve collision with another entity
     * @param {Entity} otherEntity - The other entity to resolve collision with
     */
    resolveCollision(otherEntity) {
        const myPosition = this.entity.getComponent('position');
        const otherPosition = otherEntity.getComponent('position');
        const otherPhysics = otherEntity.getComponent('physics');
        
        if (!myPosition || !otherPosition || !otherPhysics) {
            return;
        }
        
        // Calculate collision normal
        const dx = myPosition.x - otherPosition.x;
        const dz = myPosition.z - otherPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Avoid division by zero
        if (distance === 0) return;
        
        const nx = dx / distance;
        const nz = dz / distance;
        
        // Calculate overlap
        const minDistance = this.collisionRadius + otherPhysics.collisionRadius;
        const overlap = minDistance - distance;
        
        // If both entities are dynamic, move them apart based on mass
        if (!this.isStatic && !otherPhysics.isStatic) {
            const totalMass = this.mass + otherPhysics.mass;
            const myRatio = otherPhysics.mass / totalMass;
            const otherRatio = this.mass / totalMass;
            
            // Move entities apart
            myPosition.x += nx * overlap * myRatio;
            myPosition.z += nz * overlap * myRatio;
            
            otherPosition.x -= nx * overlap * otherRatio;
            otherPosition.z -= nz * overlap * otherRatio;
            
            // Calculate relative velocity
            const rvx = myPosition.velocityX - otherPosition.velocityX;
            const rvz = myPosition.velocityZ - otherPosition.velocityZ;
            
            // Calculate impulse
            const velAlongNormal = rvx * nx + rvz * nz;
            
            // Only apply impulse if objects are moving toward each other
            if (velAlongNormal < 0) {
                // Calculate restitution (bounciness)
                const e = Math.min(this.restitution, otherPhysics.restitution);
                
                // Calculate impulse scalar
                const j = -(1 + e) * velAlongNormal;
                const impulseScalar = j / totalMass;
                
                // Apply impulse
                myPosition.velocityX += impulseScalar * otherPhysics.mass * nx;
                myPosition.velocityZ += impulseScalar * otherPhysics.mass * nz;
                
                otherPosition.velocityX -= impulseScalar * this.mass * nx;
                otherPosition.velocityZ -= impulseScalar * this.mass * nz;
            }
        }
        // If one entity is static, only move the dynamic one
        else if (!this.isStatic && otherPhysics.isStatic) {
            // Move dynamic entity away from static entity
            myPosition.x += nx * overlap;
            myPosition.z += nz * overlap;
            
            // Reflect velocity (bounce)
            const dot = myPosition.velocityX * nx + myPosition.velocityZ * nz;
            myPosition.velocityX -= (1 + this.restitution) * dot * nx;
            myPosition.velocityZ -= (1 + this.restitution) * dot * nz;
        }
        else if (this.isStatic && !otherPhysics.isStatic) {
            // Move dynamic entity away from static entity
            otherPosition.x -= nx * overlap;
            otherPosition.z -= nz * overlap;
            
            // Reflect velocity (bounce)
            const dot = otherPosition.velocityX * -nx + otherPosition.velocityZ * -nz;
            otherPosition.velocityX -= (1 + otherPhysics.restitution) * dot * -nx;
            otherPosition.velocityZ -= (1 + otherPhysics.restitution) * dot * -nz;
        }
    }
    
    /**
     * Apply gravity to the entity
     * @param {number} deltaTime - Time since last update in seconds
     */
    applyGravity(deltaTime) {
        if (!this.gravity || this.isStatic || this.grounded) {
            return;
        }
        
        const position = this.entity.getComponent('position');
        if (position) {
            // Simple gravity - just pull down
            position.velocityY -= 9.8 * deltaTime;
        }
    }
    
    /**
     * Check if entity is on the ground
     * @param {number} groundHeight - Height of the ground
     * @returns {boolean} Whether the entity is grounded
     */
    checkGrounded(groundHeight = 0) {
        const position = this.entity.getComponent('position');
        if (position) {
            // Check if entity is at or below ground level
            if (position.y <= groundHeight + this.collisionRadius) {
                position.y = groundHeight + this.collisionRadius;
                position.velocityY = 0;
                this.grounded = true;
                return true;
            } else {
                this.grounded = false;
                return false;
            }
        }
        return false;
    }
    
    /**
     * Apply a jump force
     * @param {number} force - Jump force
     * @returns {boolean} Whether the jump was successful
     */
    jump(force) {
        // Only allow jumping if on the ground
        if (!this.grounded) {
            return false;
        }
        
        const position = this.entity.getComponent('position');
        if (position) {
            position.jump(force);
            this.grounded = false;
            return true;
        }
        
        return false;
    }
    
    /**
     * Update the physics component
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Apply gravity
        this.applyGravity(deltaTime);
        
        // Check if on ground
        this.checkGrounded(0);
        
        // Reset collision state
        this.colliding = false;
        this.collidingWith = [];
    }
}
