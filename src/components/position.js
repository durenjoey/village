/**
 * Position component for storing entity position and movement data
 */
class PositionComponent extends Component {
    /**
     * Create a new position component
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     */
    constructor(x = 0, y = 0, z = 0) {
        super('position');
        this.x = x;
        this.y = y;
        this.z = z;
        this.previousX = x;
        this.previousZ = z;
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityZ = 0;
        this.direction = 0; // Rotation in radians around Y axis
        this.speed = 0;     // Current movement speed
        this.maxSpeed = 2;  // Maximum movement speed
    }
    
    /**
     * Set the position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     */
    setPosition(x, y, z) {
        this.previousX = this.x;
        this.previousZ = this.z;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    /**
     * Set the velocity
     * @param {number} x - X velocity
     * @param {number} y - Y velocity
     * @param {number} z - Z velocity
     */
    setVelocity(x, y, z) {
        this.velocityX = x;
        this.velocityY = y;
        this.velocityZ = z;
        
        // Calculate speed and direction from velocity
        this.speed = Math.sqrt(x * x + z * z);
        if (this.speed > 0) {
            this.direction = Math.atan2(x, z);
        }
    }
    
    /**
     * Move in a direction
     * @param {number} direction - Direction in radians
     * @param {number} speed - Speed to move at
     * @param {number} verticalSpeed - Optional vertical speed component
     */
    moveInDirection(direction, speed, verticalSpeed = 0) {
        this.direction = direction;
        this.speed = Math.min(speed, this.maxSpeed);
        
        // Calculate velocity from direction and speed
        this.velocityX = Math.sin(direction) * speed;
        this.velocityZ = Math.cos(direction) * speed;
        
        // Set vertical velocity if provided
        if (verticalSpeed !== 0) {
            this.velocityY = verticalSpeed;
        }
    }
    
    /**
     * Move toward a target position
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate (optional)
     * @param {number} targetZ - Target Z coordinate
     * @param {number} speed - Speed to move at
     * @returns {boolean} True if reached the target
     */
    moveToward(targetX, targetY, targetZ, speed) {
        // Handle the case where targetY is actually targetZ (backward compatibility)
        if (targetZ === undefined) {
            targetZ = targetY;
            targetY = this.y; // Keep current Y if not specified
        }
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dz = targetZ - this.z;
        const horizontalDistanceSquared = dx * dx + dz * dz;
        const totalDistanceSquared = horizontalDistanceSquared + dy * dy;
        
        // Log movement attempt
        console.log(`Entity moving toward (${targetX.toFixed(2)}, ${targetY.toFixed(2)}, ${targetZ.toFixed(2)}) from (${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}), distance: ${Math.sqrt(totalDistanceSquared).toFixed(2)}`);
        
        // If we're close enough, stop moving
        if (totalDistanceSquared < 0.25) { // Increased threshold to 0.5 units (squared)
            this.setVelocity(0, 0, 0);
            console.log(`Entity reached target (${targetX.toFixed(2)}, ${targetZ.toFixed(2)})`);
            return true;
        }
        
        // Calculate direction to target (horizontal plane)
        const direction = Math.atan2(dx, dz);
        
        // Calculate vertical speed component
        let verticalSpeed = 0;
        if (Math.abs(dy) > 0.01) {
            // Scale vertical speed based on distance
            verticalSpeed = Math.sign(dy) * Math.min(Math.abs(dy), speed);
        }
        
        // Move in that direction with vertical component
        this.moveInDirection(direction, speed, verticalSpeed);
        
        // Force immediate position update for more responsive movement
        if (this.entity && this.entity.mesh) {
            this.entity.updatePosition();
        }
        
        return false;
    }
    
    /**
     * Update the position based on velocity
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        this.previousX = this.x;
        this.previousZ = this.z;
        
        // Update position based on velocity (use larger multiplier for testing)
        const multiplier = 20.0; // Make movement even more noticeable
        this.x += this.velocityX * deltaTime * multiplier;
        this.y += this.velocityY * deltaTime * multiplier;
        this.z += this.velocityZ * deltaTime * multiplier;
        
        // Apply friction to gradually slow down (horizontal movement only)
        const friction = 0.99; // Even less friction for testing
        this.velocityX *= Math.pow(friction, deltaTime * 60);
        this.velocityZ *= Math.pow(friction, deltaTime * 60);
        
        // Update speed (horizontal only)
        this.speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityZ * this.velocityZ);
        
        // If speed is very small, stop horizontal movement completely
        if (this.speed < 0.01) {
            this.velocityX = 0;
            this.velocityZ = 0;
            this.speed = 0;
        }
        
        // Check if position has changed significantly
        const hasMoved = Math.abs(this.x - this.previousX) > 0.05 || Math.abs(this.z - this.previousZ) > 0.05;
        
        // If position has changed, update the mesh
        if (hasMoved) {
            // Log position change
            console.log(`Entity moved: (${this.previousX.toFixed(2)}, ${this.previousZ.toFixed(2)}) -> (${this.x.toFixed(2)}, ${this.z.toFixed(2)})`);
            
            // If entity has a mesh, ensure it's updated
            if (this.entity && this.entity.mesh) {
                // Update mesh position directly
                this.entity.mesh.position.set(this.x, this.y, this.z);
            }
        }
    }
    
    /**
     * Apply a vertical impulse (jump)
     * @param {number} force - Force to apply
     */
    jump(force) {
        this.velocityY = force;
    }
}
