/**
 * Animal entity for the simulation
 * Represents various animals in the world with their own behaviors
 */
class Animal extends Entity {
    /**
     * Create a new Animal entity
     * @param {Object} options - Animal options
     * @param {string} options.type - Type of animal (e.g., 'dog', 'cat', 'cow')
     * @param {string} options.name - Name of the animal (optional)
     * @param {number} options.x - Initial X position
     * @param {number} options.y - Initial Y position
     * @param {number} options.z - Initial Z position
     * @param {Entity} options.owner - Owner entity (optional)
     */
    constructor(options = {}) {
        super();
        
        // Animal properties
        this.type = options.type || 'dog';
        this.name = options.name || this.generateName();
        this.owner = options.owner || null;
        this.species = this.getSpecies(this.type);
        
        // Create mesh
        this.createMesh();
        
        // Add components
        this.addComponent(new PositionComponent(
            options.x || 0,
            options.y || 0,
            options.z || 0
        ));
        
        this.addComponent(new PhysicsComponent({
            mass: this.getMass(),
            isStatic: false,
            friction: 0.5,
            collisionRadius: this.getSize() / 2
        }));
        
        this.addComponent(new AppearanceComponent(this.type));
        
        // Add behavior component - use standard BehaviorComponent for simplicity
        // This will make animals move around like NPCs
        const behavior = new BehaviorComponent(this.type);
        
        // Customize behavior properties based on animal type
        behavior.properties.moveSpeed = this.getSpeed();
        behavior.properties.wanderRadius = this.getWanderRadius();
        
        // Set home and work positions based on species
        if (this.species === 'domestic') {
            behavior.properties.homePosition = { x: -8, y: 0, z: -8 }; // Near village homes
            behavior.properties.workPosition = { x: -6, y: 0, z: -6 }; // Near village homes
        } else if (this.species === 'livestock') {
            behavior.properties.homePosition = { x: 12, y: 0, z: 12 }; // Near farm
            behavior.properties.workPosition = { x: 15, y: 0, z: 15 }; // Farm position
        } else if (this.species === 'wild') {
            behavior.properties.homePosition = { x: 20, y: 0, z: -20 }; // Forest area
            behavior.properties.workPosition = { x: 15, y: 0, z: -15 }; // Forest edge
        }
        
        // Add randomness to positions
        const randomOffset = (Math.random() * 6) - 3;
        behavior.properties.homePosition.x += randomOffset;
        behavior.properties.homePosition.z += randomOffset;
        behavior.properties.workPosition.x += randomOffset;
        behavior.properties.workPosition.z += randomOffset;
        
        this.addComponent(behavior);
    }
    
    /**
     * Get the species category for this animal type
     * @param {string} type - Animal type
     * @returns {string} Species category
     */
    getSpecies(type) {
        const speciesMap = {
            // Domestic
            'dog': 'domestic',
            'cat': 'domestic',
            
            // Livestock
            'cow': 'livestock',
            'chicken': 'livestock',
            'sheep': 'livestock',
            'pig': 'livestock',
            
            // Wild
            'rabbit': 'wild',
            'deer': 'wild',
            'fox': 'wild',
            'bird': 'wild',
            
            // Aquatic
            'fish': 'aquatic',
            'duck': 'aquatic'
        };
        
        return speciesMap[type] || 'wild';
    }
    
    /**
     * Get the mass for this animal type
     * @returns {number} Mass in kg
     */
    getMass() {
        const massMap = {
            'dog': 20,
            'cat': 5,
            'cow': 500,
            'chicken': 2,
            'sheep': 80,
            'pig': 100,
            'rabbit': 2,
            'deer': 80,
            'fox': 10,
            'bird': 0.5,
            'fish': 1,
            'duck': 3
        };
        
        return massMap[this.type] || 10;
    }
    
    /**
     * Get the size for this animal type
     * @returns {number} Size in units
     */
    getSize() {
        const sizeMap = {
            'dog': 0.5,
            'cat': 0.3,
            'cow': 1.2,
            'chicken': 0.2,
            'sheep': 0.7,
            'pig': 0.8,
            'rabbit': 0.2,
            'deer': 1.0,
            'fox': 0.4,
            'bird': 0.1,
            'fish': 0.2,
            'duck': 0.3
        };
        
        return sizeMap[this.type] || 0.5;
    }
    
    /**
     * Get the movement speed for this animal type
     * @returns {number} Speed multiplier
     */
    getSpeed() {
        const speedMap = {
            'dog': 1.5,
            'cat': 1.3,
            'cow': 0.6,
            'chicken': 0.7,
            'sheep': 0.7,
            'pig': 0.6,
            'rabbit': 1.8,
            'deer': 2.0,
            'fox': 1.6,
            'bird': 2.0,
            'fish': 1.0,
            'duck': 1.0
        };
        
        return speedMap[this.type] || 1.0;
    }
    
    /**
     * Get the wander radius for this animal type
     * @returns {number} Wander radius
     */
    getWanderRadius() {
        const radiusMap = {
            'dog': 8,
            'cat': 6,
            'cow': 3,
            'chicken': 4,
            'sheep': 3,
            'pig': 3,
            'rabbit': 10,
            'deer': 15,
            'fox': 12,
            'bird': 20,
            'fish': 5,
            'duck': 8
        };
        
        return radiusMap[this.type] || 5;
    }
    
    /**
     * Generate a random name for the animal
     * @returns {string} Random name
     */
    generateName() {
        const dogNames = ['Buddy', 'Max', 'Charlie', 'Cooper', 'Rocky', 'Bear', 'Duke', 'Tucker', 'Jack', 'Oliver'];
        const catNames = ['Luna', 'Bella', 'Lucy', 'Lily', 'Kitty', 'Chloe', 'Stella', 'Zoe', 'Lola', 'Penny'];
        const cowNames = ['Daisy', 'Bessie', 'Buttercup', 'Clarabelle', 'Dottie', 'Elsie', 'Maggie', 'Molly', 'Rosie', 'Spot'];
        const chickenNames = ['Hen', 'Cluck', 'Nugget', 'Feathers', 'Peck', 'Sunny', 'Goldie', 'Pip', 'Chick', 'Coop'];
        const sheepNames = ['Woolly', 'Fluffy', 'Baa', 'Cotton', 'Lamb', 'Shear', 'Fleece', 'Dolly', 'Ewe', 'Ram'];
        const wildNames = ['Wild', 'Forest', 'Swift', 'Shadow', 'Hunter', 'Scout', 'Tracker', 'Ranger', 'Nimble', 'Prowler'];
        
        let nameList;
        switch (this.type) {
            case 'dog':
                nameList = dogNames;
                break;
            case 'cat':
                nameList = catNames;
                break;
            case 'cow':
                nameList = cowNames;
                break;
            case 'chicken':
                nameList = chickenNames;
                break;
            case 'sheep':
                nameList = sheepNames;
                break;
            default:
                nameList = wildNames;
                break;
        }
        
        return nameList[Math.floor(Math.random() * nameList.length)];
    }
    
    /**
     * Create the animal mesh based on type
     */
    createMesh() {
        switch (this.type) {
            case 'dog':
                this.createDogMesh();
                break;
            case 'cat':
                this.createCatMesh();
                break;
            case 'cow':
                this.createCowMesh();
                break;
            case 'chicken':
                this.createChickenMesh();
                break;
            case 'sheep':
                this.createSheepMesh();
                break;
            case 'rabbit':
                this.createRabbitMesh();
                break;
            case 'bird':
                this.createBirdMesh();
                break;
            default:
                this.createDefaultAnimalMesh();
                break;
        }
    }
    
    /**
     * Create a dog mesh
     */
    createDogMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.25; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.4, 0.3); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Ears
        const earGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        
        // Left ear
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.15, 0.5, 0.3);
        leftEar.castShadow = true;
        this.mesh.add(leftEar);
        
        // Right ear
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(-0.15, 0.5, 0.3);
        rightEar.castShadow = true;
        this.mesh.add(rightEar);
        
        // Snout
        const snoutGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const snoutMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(0, 0.35, 0.5); // In front of head
        snout.castShadow = true;
        this.mesh.add(snout);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.15, 0.1, 0.2);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.15, 0.1, 0.2);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.15, 0.1, -0.2);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.15, 0.1, -0.2);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.2);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.3, -0.4); // Behind body
        tail.castShadow = true;
        this.mesh.add(tail);
    }
    
    /**
     * Create a cat mesh
     */
    createCatMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.2; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.35, 0.25); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Ears (triangular)
        const earGeometry = new THREE.ConeGeometry(0.05, 0.1, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        
        // Left ear
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.1, 0.5, 0.25);
        leftEar.castShadow = true;
        this.mesh.add(leftEar);
        
        // Right ear
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(-0.1, 0.5, 0.25);
        rightEar.castShadow = true;
        this.mesh.add(rightEar);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.07, 0.15, 0.07);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.1, 0.075, 0.15);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.1, 0.075, 0.15);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.1, 0.075, -0.15);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.1, 0.075, -0.15);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
        
        // Tail (curved)
        const tailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.25, -0.3); // Behind body
        tail.rotation.x = Math.PI / 4; // Angle up
        tail.castShadow = true;
        this.mesh.add(tail);
    }
    
    /**
     * Create a cow mesh
     */
    createCowMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.2);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Add black spots
        const spotGeometry1 = new THREE.BoxGeometry(0.4, 0.1, 0.4);
        const spotMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black
        const spot1 = new THREE.Mesh(spotGeometry1, spotMaterial);
        spot1.position.set(0.2, 0.7, 0.3);
        this.mesh.add(spot1);
        
        const spotGeometry2 = new THREE.BoxGeometry(0.3, 0.1, 0.5);
        const spot2 = new THREE.Mesh(spotGeometry2, spotMaterial);
        spot2.position.set(-0.2, 0.7, -0.3);
        this.mesh.add(spot2);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.5);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.7, 0.7); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Horns
        const hornGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 }); // Light gray
        
        // Left horn
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(0.2, 0.9, 0.6);
        leftHorn.rotation.z = Math.PI / 4; // Angle outward
        leftHorn.castShadow = true;
        this.mesh.add(leftHorn);
        
        // Right horn
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(-0.2, 0.9, 0.6);
        rightHorn.rotation.z = -Math.PI / 4; // Angle outward
        rightHorn.castShadow = true;
        this.mesh.add(rightHorn);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.3, 0.25, 0.5);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.3, 0.25, 0.5);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.3, 0.25, -0.5);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.3, 0.25, -0.5);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
        
        // Udder
        const udderGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.3);
        const udderMaterial = new THREE.MeshLambertMaterial({ color: 0xFFCCCC }); // Pink
        const udder = new THREE.Mesh(udderGeometry, udderMaterial);
        udder.position.set(0, 0.3, -0.5); // Under back of body
        udder.castShadow = true;
        this.mesh.add(udder);
    }
    
    /**
     * Create a chicken mesh
     */
    createChickenMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.15; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.3, 0.1); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Beak
        const beakGeometry = new THREE.ConeGeometry(0.03, 0.06, 4);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 0.3, 0.2);
        beak.rotation.x = -Math.PI / 2; // Point forward
        beak.castShadow = true;
        this.mesh.add(beak);
        
        // Comb
        const combGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const combMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red
        const comb = new THREE.Mesh(combGeometry, combMaterial);
        comb.position.set(0, 0.35, 0.1);
        comb.castShadow = true;
        this.mesh.add(comb);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.05, 0.05, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.05, 0.05, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.03, 0.01, 0.05);
        const footMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
        
        // Left foot
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(0.05, 0, 0.02);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        // Right foot
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.05, 0, 0.02);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Tail feathers
        const tailGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.05);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.2, -0.15);
        tail.rotation.x = Math.PI / 4; // Angle up
        tail.castShadow = true;
        this.mesh.add(tail);
    }
    
    /**
     * Create a sheep mesh
     */
    createSheepMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body (fluffy)
        const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 }); // White
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4; // Half height
        body.scale.set(1, 0.8, 1.2); // Elongate body
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.5, 0.5); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Ears
        const earGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.05);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black
        
        // Left ear
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.15, 0.6, 0.5);
        leftEar.castShadow = true;
        this.mesh.add(leftEar);
        
        // Right ear
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(-0.15, 0.6, 0.5);
        rightEar.castShadow = true;
        this.mesh.add(rightEar);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.2, 0.2, 0.3);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.2, 0.2, 0.3);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.2, 0.2, -0.3);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.2, 0.2, -0.3);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
    }
    
    /**
     * Create a rabbit mesh
     */
    createRabbitMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xBBBBBB }); // Light gray
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.15;
        body.scale.set(1, 0.8, 1.2); // Elongate body
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xBBBBBB }); // Light gray
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.25, 0.2); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Ears
        const earGeometry = new THREE.BoxGeometry(0.03, 0.15, 0.03);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xBBBBBB }); // Light gray
        
        // Left ear
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.05, 0.4, 0.2);
        leftEar.castShadow = true;
        this.mesh.add(leftEar);
        
        // Right ear
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(-0.05, 0.4, 0.2);
        rightEar.castShadow = true;
        this.mesh.add(rightEar);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xBBBBBB }); // Light gray
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.07, 0.05, 0.15);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.07, 0.05, 0.15);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.07, 0.05, -0.15);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.07, 0.05, -0.15);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
        
        // Tail (small puff)
        const tailGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.15, -0.2); // Behind body
        tail.castShadow = true;
        this.mesh.add(tail);
    }
    
    /**
     * Create a bird mesh
     */
    createBirdMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3399FF }); // Blue
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.1;
        body.scale.set(1, 0.8, 1.2); // Elongate body
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.07, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x3399FF }); // Blue
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.15, 0.1); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Beak
        const beakGeometry = new THREE.ConeGeometry(0.02, 0.04, 4);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 }); // Orange
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 0.15, 0.18);
        beak.rotation.x = -Math.PI / 2; // Point forward
        beak.castShadow = true;
        this.mesh.add(beak);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.1);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x3399FF }); // Blue
        
        // Left wing
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(0.15, 0.12, 0);
        leftWing.castShadow = true;
        this.mesh.add(leftWing);
        
        // Right wing
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(-0.15, 0.12, 0);
        rightWing.castShadow = true;
        this.mesh.add(rightWing);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.08);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x3399FF }); // Blue
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.1, -0.15);
        tail.castShadow = true;
        this.mesh.add(tail);
    }
    
    /**
     * Create a default animal mesh
     */
    createDefaultAnimalMesh() {
        // Create group to hold all parts
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D }); // Brown
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.25; // Half height
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D }); // Brown
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.4, 0.3); // Above and in front of body
        head.castShadow = true;
        this.mesh.add(head);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D }); // Brown
        
        // Front left leg
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(0.15, 0.1, 0.2);
        frontLeftLeg.castShadow = true;
        this.mesh.add(frontLeftLeg);
        
        // Front right leg
        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(-0.15, 0.1, 0.2);
        frontRightLeg.castShadow = true;
        this.mesh.add(frontRightLeg);
        
        // Back left leg
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(0.15, 0.1, -0.2);
        backLeftLeg.castShadow = true;
        this.mesh.add(backLeftLeg);
        
        // Back right leg
        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(-0.15, 0.1, -0.2);
        backRightLeg.castShadow = true;
        this.mesh.add(backRightLeg);
    }
    
    /**
     * Store original positions of mesh parts for animation
     */
    storeOriginalPositions() {
        if (!this.mesh) return;
        
        this.originalPositions = {};
        
        // Store positions of all mesh children
        for (let i = 0; i < this.mesh.children.length; i++) {
            this.originalPositions[`part_${i}`] = this.mesh.children[i].position.clone();
        }
    }
    
    /**
     * Update the animal
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update components - the behavior system will handle this
        // We don't need to manually update components here
        
        // Animate the animal based on movement
        this.animateMovement(deltaTime);
    }
    
    /**
     * Animate the animal based on movement
     * @param {number} deltaTime - Time since last update in seconds
     */
    animateMovement(deltaTime) {
        const position = this.getComponent('position');
        if (!position || !this.mesh) return;
        
        // Store original positions if not already stored
        if (!this.originalPositions) {
            this.storeOriginalPositions();
        }
        
        // Only animate if moving
        if (position.speed > 0.01) {
            // Get animation time
            const time = performance.now() * 0.001;
            
            // Animate legs
            for (let i = 0; i < this.mesh.children.length; i++) {
                const child = this.mesh.children[i];
                const originalPos = this.originalPositions ? this.originalPositions[`part_${i}`] : null;
                
                if (originalPos) {
                    // Legs animation (simple up and down)
                    if (child.position.y < 0.5 && child.position.y > 0) {
                        // This is likely a leg
                        const legOffset = Math.sin(time * 10 * position.speed) * 0.05;
                        child.position.y = originalPos.y + legOffset;
                    }
                    
                    // Tail animation (simple wagging)
                    if (i === this.mesh.children.length - 1 && this.type === 'dog') {
                        // This is likely the tail
                        const tailOffset = Math.sin(time * 5) * 0.1;
                        child.rotation.z = tailOffset;
                    }
                }
            }
        }
    }
}
