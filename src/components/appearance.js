/**
 * Appearance component for handling entity visual appearance
 */
class AppearanceComponent extends Component {
    /**
     * Create a new appearance component
     * @param {string} type - The appearance type (e.g., 'farmer', 'villager')
     */
    constructor(type = 'default') {
        super('appearance');
        this.type = type;
        this.color = 0xffffff;
        this.scale = 1;
        this.animationState = 'idle';
        this.animationTime = 0;
        this.animationSpeed = 1;
        
        // Store original positions for animation
        this.originalPositions = {};
        
        // Set default appearance based on type
        this.setAppearanceByType(type);
    }
    
    /**
     * Set appearance properties based on type
     * @param {string} type - The appearance type
     */
    setAppearanceByType(type) {
        switch (type) {
            case 'farmer':
                // Don't set color here, use the colors from the NPC class
                this.scale = 1;
                break;
            case 'guard':
                // Don't set color here, use the colors from the NPC class
                this.scale = 1.1;
                break;
            case 'merchant':
                // Don't set color here, use the colors from the NPC class
                this.scale = 1;
                break;
            case 'terrain':
                // Don't set color here, use the colors from the Terrain class
                this.scale = 1;
                break;
            default:
                this.color = 0xffffff; // White
                this.scale = 1;
                break;
        }
    }
    
    /**
     * Set the animation state
     * @param {string} state - The animation state (e.g., 'idle', 'walking', 'farming')
     */
    setAnimationState(state) {
        if (this.animationState !== state) {
            this.animationState = state;
            this.animationTime = 0;
        }
    }
    
    /**
     * Update the animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update animation time
        this.animationTime += deltaTime * this.animationSpeed;
        
        // If entity has a mesh, update its appearance
        if (this.entity && this.entity.mesh) {
            // Apply scale
            this.entity.mesh.scale.set(this.scale, this.scale, this.scale);
            
            // Apply animation based on state
            this.updateAnimation();
        }
    }
    
    /**
     * Update the entity's animation based on current state
     */
    updateAnimation() {
        // Animation cycle (0-1)
        const cycle = (Math.sin(this.animationTime * Math.PI * 2) + 1) / 2;
        
        switch (this.animationState) {
            case 'walking':
                this.animateWalking(cycle);
                break;
            case 'farming':
                this.animateFarming(cycle);
                break;
            case 'idle':
            default:
                this.animateIdle(cycle);
                break;
        }
    }
    
    /**
     * Animate the entity in idle state
     * @param {number} cycle - Animation cycle (0-1)
     */
    animateIdle(cycle) {
        // Subtle idle animation - small up/down movement
        if (this.entity.mesh.children.length > 0) {
            // Animate head (usually the first child)
            const head = this.entity.mesh.children[0];
            if (head) {
                head.position.y = this.originalPositions.head?.y || 0.85;
                head.position.y += Math.sin(this.animationTime * 1.5) * 0.02;
            }
            
            // Reset arm and leg rotations
            if (this.entity.mesh.children.length > 2) {
                // Arms
                this.entity.mesh.children[1].rotation.x = 0;
                this.entity.mesh.children[2].rotation.x = 0;
                
                // Legs
                if (this.entity.mesh.children.length > 4) {
                    this.entity.mesh.children[3].rotation.x = 0;
                    this.entity.mesh.children[4].rotation.x = 0;
                }
            }
        }
    }
    
    /**
     * Animate the entity in walking state
     * @param {number} cycle - Animation cycle (0-1)
     */
    animateWalking(cycle) {
        if (this.entity.mesh.children.length > 4) {
            // Animate arms (swing back and forth)
            const armSwing = Math.sin(this.animationTime * 5) * 0.5;
            this.entity.mesh.children[1].rotation.x = armSwing;
            this.entity.mesh.children[2].rotation.x = -armSwing;
            
            // Animate legs (opposite of arms)
            this.entity.mesh.children[3].rotation.x = -armSwing;
            this.entity.mesh.children[4].rotation.x = armSwing;
        }
    }
    
    /**
     * Animate the entity in farming state
     * @param {number} cycle - Animation cycle (0-1)
     */
    animateFarming(cycle) {
        if (this.entity.mesh.children.length > 4) {
            // Bend forward slightly
            this.entity.mesh.rotation.x = 0.2;
            
            // Animate arms for farming motion
            const toolArm = this.entity.mesh.children[1]; // Assuming right arm holds tool
            toolArm.rotation.x = -0.5 - Math.sin(this.animationTime * 3) * 0.3;
            
            // Other arm stays relatively still
            this.entity.mesh.children[2].rotation.x = -0.2;
            
            // Legs stay in place
            this.entity.mesh.children[3].rotation.x = 0;
            this.entity.mesh.children[4].rotation.x = 0;
            
            // Animate farming tool if present
            if (this.entity.mesh.children.length > 5) {
                const tool = this.entity.mesh.children[5];
                if (tool) {
                    tool.rotation.x = Math.sin(this.animationTime * 3) * 0.5;
                }
            }
        }
    }
    
    /**
     * Store original positions of mesh parts for animation reference
     */
    storeOriginalPositions() {
        if (!this.entity || !this.entity.mesh) return;
        
        this.originalPositions = {};
        
        // Store head position
        if (this.entity.mesh.children.length > 0) {
            this.originalPositions.head = this.entity.mesh.children[0].position.clone();
        }
        
        // Store arm positions
        if (this.entity.mesh.children.length > 2) {
            this.originalPositions.leftArm = this.entity.mesh.children[1].position.clone();
            this.originalPositions.rightArm = this.entity.mesh.children[2].position.clone();
        }
        
        // Store leg positions
        if (this.entity.mesh.children.length > 4) {
            this.originalPositions.leftLeg = this.entity.mesh.children[3].position.clone();
            this.originalPositions.rightLeg = this.entity.mesh.children[4].position.clone();
        }
    }
}
