/**
 * NPC entity for the simulation
 * Represents characters in the world with AI behavior
 */
class NPC extends Entity {
    /**
     * Create a new NPC entity
     * @param {Object} options - NPC options
     * @param {string} options.type - Type of NPC (e.g., 'farmer', 'guard')
     * @param {string} options.name - Name of the NPC
     * @param {number} options.x - Initial X position
     * @param {number} options.y - Initial Y position
     * @param {number} options.z - Initial Z position
     */
    constructor(options = {}) {
        super();
        
        // NPC properties
        this.type = options.type || 'farmer';
        this.name = options.name || this.generateName();
        
        // Create mesh
        this.createMesh();
        
        // Add components
        this.addComponent(new PositionComponent(
            options.x || 0,
            options.y || 0,
            options.z || 0
        ));
        
        this.addComponent(new PhysicsComponent({
            mass: 70,
            isStatic: false,
            friction: 0.5,
            collisionRadius: 0.5
        }));
        
        this.addComponent(new AppearanceComponent(this.type));
        this.addComponent(new BehaviorComponent(this.type));
        
        // Store original positions for animation
        this.storeOriginalPositions();
    }
    
    /**
     * Generate a random name for the NPC
     * @returns {string} Random name
     */
    generateName() {
        const firstNames = [
            'John', 'Mary', 'James', 'Emma', 'William', 'Olivia', 'Henry', 'Ava',
            'Thomas', 'Sophia', 'George', 'Isabella', 'Joseph', 'Charlotte', 'Samuel', 'Amelia',
            'Edward', 'Mia', 'Charles', 'Harper', 'Daniel', 'Evelyn', 'Matthew', 'Abigail'
        ];
        
        const lastNames = [
            'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
            'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
            'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee'
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    /**
     * Create the NPC mesh based on type
     */
    createMesh() {
        switch (this.type) {
            case 'farmer':
                this.createFarmerMesh();
                break;
            case 'guard':
                this.createGuardMesh();
                break;
            case 'merchant':
                this.createMerchantMesh();
                break;
            default:
                this.createDefaultMesh();
                break;
        }
    }
    
    /**
     * Create a farmer mesh
     */
    createFarmerMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db }); // Bright blue
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xf1c40f }); // Bright yellow
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45; // Above body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Hat (farmer's hat)
        const hatGeometry = new THREE.ConeGeometry(0.4, 0.4, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c }); // Bright red
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.8; // Above head
        hat.castShadow = true;
        this.mesh.add(hat);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.4, 0.6, 0); // Right side of body
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.4, 0.6, 0); // Left side of body
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Darker brown
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.2, 0, 0); // Right side of body, bottom
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.2, 0, 0); // Left side of body, bottom
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Farming tool (hoe)
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(0.6, 0.6, 0.6); // In right hand, pointing forward
        handle.castShadow = true;
        this.mesh.add(handle);
        
        const bladeGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.2);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 0.6, 0); // At end of handle
        blade.castShadow = true;
        handle.add(blade);
    }
    
    /**
     * Create a guard mesh
     */
    createGuardMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.7, 1.3, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a6d8c }); // Blue-gray
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.65; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // Tan
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.55; // Above body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Helmet
        const helmetGeometry = new THREE.BoxGeometry(0.55, 0.2, 0.55);
        const helmetMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 1.7; // Above head
        helmet.castShadow = true;
        this.mesh.add(helmet);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4a6d8c }); // Blue-gray
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.475, 0.65, 0); // Right side of body
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.475, 0.65, 0); // Left side of body
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.3);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x36454f }); // Darker blue-gray
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.2, 0, 0); // Right side of body, bottom
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.2, 0, 0); // Left side of body, bottom
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Sword
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(-0.6, 0.65, 0.3); // In left hand
        handle.castShadow = true;
        this.mesh.add(handle);
        
        const bladeGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.05);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }); // Silver
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 0.6, 0); // At end of handle
        blade.castShadow = true;
        handle.add(blade);
    }
    
    /**
     * Create a merchant mesh
     */
    createMerchantMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x9b870c }); // Gold-ish
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // Tan
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45; // Above body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Hat (merchant's cap)
        const hatGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x800020 }); // Burgundy
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.8; // Above head
        hat.castShadow = true;
        this.mesh.add(hat);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x9b870c }); // Gold-ish
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.525, 0.6, 0); // Right side of body
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.525, 0.6, 0); // Left side of body
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.3);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Brown
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.25, 0, 0); // Right side of body, bottom
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.25, 0, 0); // Left side of body, bottom
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Bag/pouch
        const bagGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.2);
        const bagMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
        const bag = new THREE.Mesh(bagGeometry, bagMaterial);
        bag.position.set(-0.5, 0.4, 0.3); // At side
        bag.castShadow = true;
        this.mesh.add(bag);
    }
    
    /**
     * Create a default mesh
     */
    createDefaultMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // Tan
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45; // Above body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.4, 0.6, 0); // Right side of body
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.4, 0.6, 0); // Left side of body
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Darker gray
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.2, 0, 0); // Right side of body, bottom
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.2, 0, 0); // Left side of body, bottom
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
    }
    
    /**
     * Store original positions of mesh parts for animation
     */
    storeOriginalPositions() {
        if (!this.mesh) return;
        
        this.originalPositions = {};
        
        // Store head position
        if (this.mesh.children.length > 1) {
            this.originalPositions.head = this.mesh.children[1].position.clone();
        }
        
        // Store arm positions
        if (this.mesh.children.length > 3) {
            this.originalPositions.leftArm = this.mesh.children[3].position.clone();
            this.originalPositions.rightArm = this.mesh.children[4].position.clone();
        }
        
        // Store leg positions
        if (this.mesh.children.length > 5) {
            this.originalPositions.leftLeg = this.mesh.children[5].position.clone();
            this.originalPositions.rightLeg = this.mesh.children[6].position.clone();
        }
    }
    
    /**
     * Update the NPC
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Ensure entity has world reference
        if (!this.world && this.components['behavior'] && this.components['behavior'].entity.world) {
            this.world = this.components['behavior'].entity.world;
            console.log(`Set world reference for NPC ${this.name} (${this.id})`);
        }
        
        // Update components
        for (const type in this.components) {
            if (this.components[type].update) {
                this.components[type].update(deltaTime);
            }
        }
        
        // Update position and rotation
        this.updatePosition();
        this.updateRotation();
        
        // Occasionally add random movement to make NPCs more lively
        if (Math.random() < 0.01) { // 1% chance each update
            this.addRandomMovement();
        }
    }
    
    /**
     * Add random movement to make NPCs more lively
     */
    addRandomMovement() {
        const behavior = this.getComponent('behavior');
        if (!behavior) return;
        
        // Only add random movement if not already doing something important
        if (behavior.taskQueue.length === 0 || 
            (behavior.taskQueue.length === 1 && behavior.taskQueue[0].type === 'wait')) {
            
            // Get current position
            const position = this.getComponent('position');
            if (!position) return;
            
            // Generate a random position nearby
            const randomOffsetX = (Math.random() * 6) - 3; // -3 to 3
            const randomOffsetZ = (Math.random() * 6) - 3; // -3 to 3
            
            // Add a move task
            behavior.addTask({
                type: 'move_to',
                data: {
                    position: {
                        x: position.x + randomOffsetX,
                        y: position.y,
                        z: position.z + randomOffsetZ
                    }
                }
            });
            
            // Then wait a bit
            behavior.addTask({
                type: 'wait',
                data: { duration: 2 + Math.random() * 3 } // 2-5 seconds
            });
        }
    }
}
