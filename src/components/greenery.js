/**
 * Greenery component for the simulation
 * Handles vegetation like grass, trees, and bushes
 */
class GreeneryComponent extends Component {
    /**
     * Create a new greenery component
     * @param {Object} options - Greenery options
     * @param {string} options.type - Type of greenery (grass, tree, bush, etc.)
     * @param {number} options.density - Density of the greenery (0-1)
     * @param {Object} options.customization - Custom options for specific greenery types
     */
    constructor(options = {}) {
        super('greenery');
        
        // Greenery options
        this.greeneryType = options.type || 'grass';
        this.density = Math.min(Math.max(options.density || 0.5, 0), 1); // Clamp between 0 and 1
        this.customization = options.customization || {};
        
        // Mesh group to hold all greenery elements
        this.meshGroup = new THREE.Group();
        
        // Track if greenery has been generated
        this.generated = false;
        
        if (window.Logger) {
            Logger.debug(`Created greenery component of type: ${this.greeneryType}`);
        }
    }
    
    /**
     * Generate greenery based on type and density
     * @param {THREE.Object3D} parentMesh - The parent mesh to add greenery to
     */
    generate(parentMesh) {
        if (this.generated) return;
        
        if (window.Logger) {
            Logger.info(`Generating ${this.greeneryType} with density ${this.density}`);
        }
        
        switch (this.greeneryType) {
            case 'grass':
                this.generateGrass(parentMesh);
                break;
            case 'trees':
                this.generateTrees(parentMesh);
                break;
            case 'bushes':
                this.generateBushes(parentMesh);
                break;
            case 'flowers':
                this.generateFlowers(parentMesh);
                break;
            case 'mixed':
                this.generateMixed(parentMesh);
                break;
            default:
                if (window.Logger) {
                    Logger.warn(`Unknown greenery type: ${this.greeneryType}`);
                }
                this.generateGrass(parentMesh); // Default to grass
        }
        
        // Add the greenery mesh group to the parent mesh
        if (parentMesh && this.meshGroup) {
            parentMesh.add(this.meshGroup);
            this.generated = true;
            
            if (window.Logger) {
                Logger.debug(`Added ${this.meshGroup.children.length} greenery elements to parent mesh`);
            }
        }
    }
    
    /**
     * Generate grass patches
     * @param {THREE.Object3D} parentMesh - The parent mesh to add grass to
     */
    generateGrass(parentMesh) {
        const size = parentMesh.geometry ? 
            Math.max(parentMesh.geometry.parameters.width, parentMesh.geometry.parameters.height) : 
            100;
        
        // Calculate number of grass patches based on density
        const patchCount = Math.floor(size * size * this.density * 0.01);
        
        // Create grass material
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: this.customization.color || 0x4CAF50, // Default green
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        // Create grass patches
        for (let i = 0; i < patchCount; i++) {
            // Random position within the terrain bounds
            const x = (Math.random() - 0.5) * size * 0.9;
            const z = (Math.random() - 0.5) * size * 0.9;
            
            // Random size for variety
            const patchSize = 0.5 + Math.random() * 1.5;
            const patchHeight = 0.2 + Math.random() * 0.3;
            
            // Create grass blade geometry
            const bladeGeometry = new THREE.ConeGeometry(patchSize * 0.3, patchHeight, 4);
            const blade = new THREE.Mesh(bladeGeometry, grassMaterial);
            
            // Position grass blade
            blade.position.set(x, patchHeight / 2, z);
            
            // Random rotation for natural look
            blade.rotation.y = Math.random() * Math.PI * 2;
            blade.rotation.x = Math.random() * 0.2;
            
            // Add to mesh group
            this.meshGroup.add(blade);
        }
    }
    
    /**
     * Generate trees
     * @param {THREE.Object3D} parentMesh - The parent mesh to add trees to
     */
    generateTrees(parentMesh) {
        const size = parentMesh.geometry ? 
            Math.max(parentMesh.geometry.parameters.width, parentMesh.geometry.parameters.height) : 
            100;
        
        // Calculate number of trees based on density
        const treeCount = Math.floor(size * this.density * 0.2); // Increased density
        
        // Create trunk material
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create leaves material
        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: this.customization.color || 0x2E8B57, // Default forest green
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create trees
        for (let i = 0; i < treeCount; i++) {
            // Random position within the terrain bounds
            const x = (Math.random() - 0.5) * size * 0.9;
            const z = (Math.random() - 0.5) * size * 0.9;
            
            // Random size for variety (increased size)
            const treeHeight = 5 + Math.random() * 5; // Taller trees
            const trunkRadius = 0.3 + Math.random() * 0.4; // Thicker trunks
            
            // Create tree group
            const tree = new THREE.Group();
            
            // Create trunk
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, treeHeight, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = treeHeight / 2;
            trunk.castShadow = true;
            tree.add(trunk);
            
            // Create leaves (cone shape for pine trees, sphere for deciduous)
            const leavesType = this.customization.leavesType || (Math.random() > 0.5 ? 'pine' : 'deciduous');
            
            if (leavesType === 'pine') {
                const leavesGeometry = new THREE.ConeGeometry(treeHeight * 0.3, treeHeight * 0.7, 8);
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = treeHeight * 0.8;
                leaves.castShadow = true;
                tree.add(leaves);
            } else {
                const leavesGeometry = new THREE.SphereGeometry(treeHeight * 0.3, 8, 8);
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = treeHeight * 0.8;
                leaves.scale.y = 1.2; // Slightly elongated
                leaves.castShadow = true;
                tree.add(leaves);
            }
            
            // Position tree
            tree.position.set(x, 0, z);
            
            // Add to mesh group
            this.meshGroup.add(tree);
        }
    }
    
    /**
     * Generate bushes
     * @param {THREE.Object3D} parentMesh - The parent mesh to add bushes to
     */
    generateBushes(parentMesh) {
        const size = parentMesh.geometry ? 
            Math.max(parentMesh.geometry.parameters.width, parentMesh.geometry.parameters.height) : 
            100;
        
        // Calculate number of bushes based on density
        const bushCount = Math.floor(size * this.density * 0.08);
        
        // Create bush material
        const bushMaterial = new THREE.MeshStandardMaterial({
            color: this.customization.color || 0x3A5F0B, // Default dark green
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create bushes
        for (let i = 0; i < bushCount; i++) {
            // Random position within the terrain bounds
            const x = (Math.random() - 0.5) * size * 0.9;
            const z = (Math.random() - 0.5) * size * 0.9;
            
            // Random size for variety
            const bushSize = 0.5 + Math.random() * 1;
            
            // Create bush group
            const bush = new THREE.Group();
            
            // Create main bush shape
            const mainGeometry = new THREE.SphereGeometry(bushSize, 8, 8);
            const mainBush = new THREE.Mesh(mainGeometry, bushMaterial);
            mainBush.position.y = bushSize * 0.8;
            mainBush.scale.y = 0.8; // Slightly flattened
            mainBush.castShadow = true;
            bush.add(mainBush);
            
            // Add some smaller spheres for detail
            const detailCount = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < detailCount; j++) {
                const detailSize = bushSize * (0.5 + Math.random() * 0.3);
                const detailGeometry = new THREE.SphereGeometry(detailSize, 8, 8);
                const detail = new THREE.Mesh(detailGeometry, bushMaterial);
                
                // Random position around the main bush
                const angle = Math.random() * Math.PI * 2;
                const radius = bushSize * 0.5;
                detail.position.x = Math.cos(angle) * radius;
                detail.position.z = Math.sin(angle) * radius;
                detail.position.y = bushSize * 0.6 + Math.random() * 0.4;
                
                detail.castShadow = true;
                bush.add(detail);
            }
            
            // Position bush
            bush.position.set(x, 0, z);
            
            // Add to mesh group
            this.meshGroup.add(bush);
        }
    }
    
    /**
     * Generate flowers
     * @param {THREE.Object3D} parentMesh - The parent mesh to add flowers to
     */
    generateFlowers(parentMesh) {
        const size = parentMesh.geometry ? 
            Math.max(parentMesh.geometry.parameters.width, parentMesh.geometry.parameters.height) : 
            100;
        
        // Calculate number of flowers based on density
        const flowerCount = Math.floor(size * size * this.density * 0.02);
        
        // Create stem material
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x3A5F0B, // Dark green
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create flowers
        for (let i = 0; i < flowerCount; i++) {
            // Random position within the terrain bounds
            const x = (Math.random() - 0.5) * size * 0.9;
            const z = (Math.random() - 0.5) * size * 0.9;
            
            // Random size for variety
            const stemHeight = 0.3 + Math.random() * 0.5;
            const flowerSize = 0.1 + Math.random() * 0.2;
            
            // Create flower group
            const flower = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 4);
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = stemHeight / 2;
            flower.add(stem);
            
            // Create flower head with random color
            const flowerColors = [
                0xFF5555, // Red
                0xFFFF55, // Yellow
                0x5555FF, // Blue
                0xFF55FF, // Purple
                0xFFFFFF  // White
            ];
            
            const flowerColor = this.customization.color || 
                flowerColors[Math.floor(Math.random() * flowerColors.length)];
            
            const flowerMaterial = new THREE.MeshStandardMaterial({
                color: flowerColor,
                roughness: 0.7,
                metalness: 0.2
            });
            
            // Create flower head (either cone or sphere)
            if (Math.random() > 0.5) {
                const flowerGeometry = new THREE.ConeGeometry(flowerSize, flowerSize * 1.5, 8, 1, true);
                const flowerHead = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flowerHead.position.y = stemHeight + flowerSize * 0.5;
                flowerHead.rotation.x = Math.PI; // Flip cone upside down
                flower.add(flowerHead);
            } else {
                const flowerGeometry = new THREE.SphereGeometry(flowerSize, 8, 8);
                const flowerHead = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flowerHead.position.y = stemHeight + flowerSize;
                flower.add(flowerHead);
            }
            
            // Position flower
            flower.position.set(x, 0, z);
            
            // Add to mesh group
            this.meshGroup.add(flower);
        }
    }
    
    /**
     * Generate mixed vegetation
     * @param {THREE.Object3D} parentMesh - The parent mesh to add mixed vegetation to
     */
    generateMixed(parentMesh) {
        // Save original density
        const originalDensity = this.density;
        
        // Generate grass with full density
        this.greeneryType = 'grass';
        this.density = originalDensity * 0.8;
        this.generateGrass(parentMesh);
        
        // Generate trees with reduced density
        this.greeneryType = 'trees';
        this.density = originalDensity * 0.3;
        this.generateTrees(parentMesh);
        
        // Generate bushes with reduced density
        this.greeneryType = 'bushes';
        this.density = originalDensity * 0.4;
        this.generateBushes(parentMesh);
        
        // Generate flowers with reduced density
        this.greeneryType = 'flowers';
        this.density = originalDensity * 0.2;
        this.generateFlowers(parentMesh);
        
        // Restore original values
        this.greeneryType = 'mixed';
        this.density = originalDensity;
    }
    
    /**
     * Update the greenery (e.g., for wind animation)
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Could be used for animations like wind effects
        // Not implemented in this version
    }
}
