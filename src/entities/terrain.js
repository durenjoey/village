/**
 * Terrain entity for the simulation
 * Creates a simple land with grass, dirt patches, and Whiterun-inspired buildings
 */
class Terrain extends Entity {
    /**
     * Create a new terrain entity
     * @param {Object} options - Terrain options
     * @param {number} options.size - Size of the terrain
     * @param {number} options.resolution - Resolution of the terrain mesh
     * @param {number} options.maxHeight - Maximum height of the terrain
     */
    constructor(options = {}) {
        super();
        this.type = 'terrain';
        
        // Terrain options
        this.size = options.size || 100;
        this.resolution = options.resolution || 100;
        this.maxHeight = options.maxHeight || 3;
        
        // Track occupied positions to prevent overlaps
        this.occupiedPositions = [];
        
        // Create terrain mesh
        this.createMesh();
        
        // Add components
        this.addComponent(new PositionComponent(0, 0, 0));
        this.addComponent(new PhysicsComponent({ isStatic: true }));
        this.addComponent(new AppearanceComponent('terrain'));
        
        // Add greenery component with mixed vegetation
        this.addComponent(new GreeneryComponent({
            type: 'mixed',
            density: 0.9, // Increased density
            customization: {
                // Custom options can be set here
                color: 0x228B22 // Forest green for better visibility
            }
        }));
        
        if (window.Logger) {
            Logger.info('Terrain entity created with mesh:', this.mesh ? 'Yes' : 'No');
        } else {
            console.log('Terrain entity created with mesh:', this.mesh ? 'Yes' : 'No');
        }
    }
    
    /**
     * Create the terrain mesh
     */
    createMesh() {
        // Create group to hold all terrain elements
        this.mesh = new THREE.Group();
        
        // Create main terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.resolution,
            this.resolution
        );
        
        // Generate heightmap
        this.generateHeightmap(geometry);
        
        // Create materials
        const materials = this.createMaterials();
        
        // Create terrain mesh
        const terrainMesh = new THREE.Mesh(geometry, materials.ground);
        terrainMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        terrainMesh.receiveShadow = true;
        this.mesh.add(terrainMesh);
        
        // Add a flat ground plane below the terrain for better visibility
        const groundGeometry = new THREE.PlaneGeometry(this.size * 2, this.size * 2);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a7d44, // Darker green
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        groundPlane.position.y = -0.1; // Slightly below terrain
        groundPlane.receiveShadow = true;
        this.mesh.add(groundPlane);
        
        // Add a grid helper for better spatial awareness
        const gridHelper = new THREE.GridHelper(this.size * 2, 20, 0x000000, 0x555555);
        gridHelper.position.y = 0.01; // Slightly above ground
        this.mesh.add(gridHelper);
        
        // Add dirt patches
        this.addDirtPatches();
        
        // Add buildings in a specific order to ensure proper collision detection
        this.addBuildingsInOrder();
        
        // Add trees after all buildings to ensure proper collision detection
        this.addTrees();
        
        if (window.Logger) {
            Logger.info('Terrain mesh created with', this.mesh.children.length, 'children');
        } else {
            console.log('Terrain mesh created with', this.mesh.children.length, 'children');
        }
    }
    
    /**
     * Check if a position is occupied
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {number} radius - Radius to check for occupation
     * @returns {boolean} True if position is occupied, false otherwise
     */
    isPositionOccupied(x, z, radius) {
        for (const pos of this.occupiedPositions) {
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2));
            if (distance < (radius + pos.radius)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Mark a position as occupied
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {number} radius - Radius of occupation
     * @param {string} type - Type of object occupying the position
     */
    markPositionOccupied(x, z, radius, type) {
        this.occupiedPositions.push({
            x: x,
            z: z,
            radius: radius,
            type: type
        });
    }
    
    /**
     * Add trees directly to the terrain
     */
    addTrees() {
        if (window.Logger) {
            Logger.info('Adding trees directly to terrain');
        } else {
            console.log('Adding trees directly to terrain');
        }
        
        const size = this.size;
        const treeCount = 50; // Add a significant number of trees
        
        // Create trunk material
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create leaves material
        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22, // Forest green
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create trees
        let treesAdded = 0;
        let attempts = 0;
        const maxAttempts = 200; // Prevent infinite loops
        
        while (treesAdded < treeCount && attempts < maxAttempts) {
            attempts++;
            
            // Random position within the terrain bounds
            const x = (Math.random() - 0.5) * size * 0.9;
            const z = (Math.random() - 0.5) * size * 0.9;
            
            // Smaller size for better proportion
            const treeHeight = 3 + Math.random() * 2;
            const trunkRadius = 0.2 + Math.random() * 0.2;
            
            // Check if position is already occupied
            const occupationRadius = treeHeight * 0.6; // Increased radius for better collision detection
            if (this.isPositionOccupied(x, z, occupationRadius)) {
                continue; // Skip this position and try again
            }
            
            // Create tree group
            const tree = new THREE.Group();
            
            // Create trunk
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, treeHeight, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = treeHeight / 2;
            trunk.castShadow = true;
            tree.add(trunk);
            
            // Create leaves
            const leavesType = Math.random() > 0.5 ? 'pine' : 'deciduous';
            
            if (leavesType === 'pine') {
                const leavesGeometry = new THREE.ConeGeometry(treeHeight * 0.4, treeHeight * 0.8, 8);
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = treeHeight * 0.9;
                leaves.castShadow = true;
                tree.add(leaves);
            } else {
                const leavesGeometry = new THREE.SphereGeometry(treeHeight * 0.4, 8, 8);
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = treeHeight * 0.9;
                leaves.scale.y = 1.2; // Slightly elongated
                leaves.castShadow = true;
                tree.add(leaves);
            }
            
            // Position tree
            tree.position.set(x, 0, z);
            
            // Add to terrain mesh
            this.mesh.add(tree);
            
            // Mark position as occupied
            this.markPositionOccupied(x, z, occupationRadius, 'tree');
            
            treesAdded++;
            
            if (window.Logger && treesAdded === 1) {
                Logger.info(`Added tree at position ${x}, 0, ${z} with height ${treeHeight}`);
            }
        }
        
        if (window.Logger) {
            Logger.info(`Added ${treesAdded} trees to terrain after ${attempts} attempts`);
        } else {
            console.log(`Added ${treesAdded} trees to terrain after ${attempts} attempts`);
        }
    }
    
    /**
     * Generate heightmap for terrain
     * @param {THREE.PlaneGeometry} geometry - Terrain geometry
     */
    generateHeightmap(geometry) {
        // Use simplex noise for terrain generation
        // Check if SimplexNoise is available globally or create a new instance
        const simplex = window.SimplexNoise ? new SimplexNoise() : {
            noise2D: (x, z) => (Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5)
        };
        const vertices = geometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Generate height using multiple layers of noise
            let height = 0;
            
            // Large features (gentle hills)
            height += simplex.noise2D(x * 0.01, z * 0.01) * this.maxHeight * 0.7;
            
            // Medium features
            height += simplex.noise2D(x * 0.03, z * 0.03) * this.maxHeight * 0.2;
            
            // Small details
            height += simplex.noise2D(x * 0.1, z * 0.1) * this.maxHeight * 0.1;
            
            // Set vertex height
            vertices[i + 1] = height;
        }
        
        // Update geometry
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
    
    /**
     * Create materials for terrain
     * @returns {Object} Materials for different terrain types
     */
    createMaterials() {
        // Ground material (grass)
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50, // Green
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide // Render both sides
        });
        
        // Dirt material
        const dirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
        
        return {
            ground: groundMaterial,
            dirt: dirtMaterial
        };
    }
    
    /**
     * Add dirt patches to the terrain
     */
    addDirtPatches() {
        // Add several dirt patches at random positions
        for (let i = 0; i < 8; i++) {
            // Random position
            const x = Math.random() * 80 - 40; // -40 to 40
            const z = Math.random() * 80 - 40; // -40 to 40
            
            // Random size
            const size = 3 + Math.random() * 5;
            
            this.addDirtPatch(x, z, size);
        }
    }
    
    /**
     * Add a dirt patch at the specified position
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} size - Size of the dirt patch
     */
    addDirtPatch(x, z, size) {
        // Create dirt patch geometry
        const dirtGeometry = new THREE.CircleGeometry(size, 8);
        const dirtMaterial = this.createMaterials().dirt;
        const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
        
        // Position dirt patch
        dirt.rotation.x = -Math.PI / 2;
        dirt.position.set(x, 0.05, z); // Slightly above terrain
        dirt.receiveShadow = true;
        
        // Add to terrain mesh
        this.mesh.add(dirt);
    }
    
    /**
     * Add buildings in a specific order to ensure proper collision detection
     */
    addBuildingsInOrder() {
        if (window.Logger) {
            Logger.info('Adding buildings in order...');
        } else {
            console.log('Adding buildings in order...');
        }
        
        // First add paths
        this.addPaths();
        
        // Then add market stands (they should be placed first to avoid houses overlapping them)
        this.addMarketBuildings();
        
        // Then add temple (large central building)
        this.addTempleBuilding();
        
        // Then add blacksmith
        this.addBlacksmithBuilding();
        
        // Finally add houses (they should be placed last to avoid overlapping with other buildings)
        this.addHouseBuildings();
        
        if (window.Logger) {
            Logger.info('All buildings added in order');
            Logger.info(`Total occupied positions: ${this.occupiedPositions.length}`);
        } else {
            console.log('All buildings added in order');
            console.log(`Total occupied positions: ${this.occupiedPositions.length}`);
        }
    }
    
    /**
     * Add paths to the terrain
     */
    addPaths() {
        if (window.PathBuilder) {
            if (window.Logger) {
                Logger.info('Adding paths with PathBuilder');
            } else {
                console.log('Adding paths with PathBuilder');
            }
            window.PathBuilder.addWhiterunPaths(this.mesh);
        } else {
            if (window.Logger) {
                Logger.warn('PathBuilder not available, using fallback method');
            } else {
                console.warn('PathBuilder not available, using fallback method');
            }
            this.addCentralPath(); // Fallback to internal method
        }
    }
    
    /**
     * Add market buildings to the terrain
     */
    addMarketBuildings() {
        if (window.MarketBuilder) {
            if (window.Logger) {
                Logger.info('Adding market stands with MarketBuilder');
            } else {
                console.log('Adding market stands with MarketBuilder');
            }
            window.MarketBuilder.addMarketStands(this.mesh, -15, -5, 3);
        } else {
            if (window.Logger) {
                Logger.warn('MarketBuilder not available, using fallback method');
            } else {
                console.warn('MarketBuilder not available, using fallback method');
            }
            this.addMarketStands(); // Fallback to internal method
        }
    }
    
    /**
     * Add temple building to the terrain
     */
    addTempleBuilding() {
        if (window.TempleBuilder) {
            if (window.Logger) {
                Logger.info('Adding temple with TempleBuilder');
            } else {
                console.log('Adding temple with TempleBuilder');
            }
            window.TempleBuilder.addTemple(this.mesh, 0, -35, 0);
        } else {
            if (window.Logger) {
                Logger.warn('TempleBuilder not available, using fallback method');
            } else {
                console.warn('TempleBuilder not available, using fallback method');
            }
            this.addTemple(); // Fallback to internal method
        }
    }
    
    /**
     * Add blacksmith building to the terrain
     */
    addBlacksmithBuilding() {
        if (window.BlacksmithBuilder) {
            if (window.Logger) {
                Logger.info('Adding blacksmith with BlacksmithBuilder');
            } else {
                console.log('Adding blacksmith with BlacksmithBuilder');
            }
            window.BlacksmithBuilder.addBlacksmith(this.mesh, 25, 5, Math.PI / 4);
        } else {
            if (window.Logger) {
                Logger.warn('BlacksmithBuilder not available, using fallback method');
            } else {
                console.warn('BlacksmithBuilder not available, using fallback method');
            }
            this.addBlacksmith(); // Fallback to internal method
        }
    }
    
    /**
     * Add house buildings to the terrain
     */
    addHouseBuildings() {
        // Extend HouseBuilder with collision detection
        if (window.HouseBuilder) {
            if (window.Logger) {
                Logger.info('Adding houses with HouseBuilder');
            } else {
                console.log('Adding houses with HouseBuilder');
            }
            
            // Override the addHouse method to include collision detection
            const originalAddHouse = window.HouseBuilder.addHouse;
            window.HouseBuilder.addHouse = (parent, x, z, scale, rotation) => {
                // Calculate house occupation radius based on scale
                const houseRadius = 4 * scale; // Base size is 4 units
                
                // Check if position is already occupied
                if (this.isPositionOccupied(x, z, houseRadius)) {
                    if (window.Logger) {
                        Logger.debug(`Skipped house at occupied position ${x}, ${z}`);
                    } else {
                        console.log(`Skipped house at occupied position ${x}, ${z}`);
                    }
                    return null; // Skip this house
                }
                
                // Add the house using the original method
                const house = originalAddHouse(parent, x, z, scale, rotation);
                
                // Mark position as occupied
                this.markPositionOccupied(x, z, houseRadius, 'house');
                
                if (window.Logger) {
                    Logger.debug(`Added house at position ${x}, ${z} with radius ${houseRadius}`);
                } else {
                    console.log(`Added house at position ${x}, ${z} with radius ${houseRadius}`);
                }
                
                return house;
            };
            
            // Add houses with collision detection
            window.HouseBuilder.addHousesInCircle(this.mesh, 0, 0, 25);
            window.HouseBuilder.addInnerHouses(this.mesh, 0, 0, 3);
        } else {
            if (window.Logger) {
                Logger.warn('HouseBuilder not available, using fallback method');
            } else {
                console.warn('HouseBuilder not available, using fallback method');
            }
            this.addHouses(); // Fallback to internal method
        }
    }
    
    /**
     * Add Whiterun-inspired buildings to the terrain (legacy method, not used)
     */
    addWhiterunBuildings() {
        try {
            if (window.Logger) {
                Logger.info('Adding Whiterun buildings...');
            } else {
                console.log('Adding Whiterun buildings...');
            }
            
            // Check if modules are available
            if (window.PathBuilder) {
                if (window.Logger) {
                    Logger.info('PathBuilder is available');
                } else {
                    console.log('PathBuilder is available');
                }
                window.PathBuilder.addWhiterunPaths(this.mesh);
            } else {
                if (window.Logger) {
                    Logger.error('PathBuilder is not available');
                } else {
                    console.error('PathBuilder is not available');
                }
                this.addCentralPath(); // Fallback to internal method
            }
            
            // Extend HouseBuilder with collision detection
            if (window.HouseBuilder) {
                if (window.Logger) {
                    Logger.info('HouseBuilder is available');
                } else {
                    console.log('HouseBuilder is available');
                }
                
                // Override the addHouse method to include collision detection
                const originalAddHouse = window.HouseBuilder.addHouse;
                window.HouseBuilder.addHouse = (parent, x, z, scale, rotation) => {
                    // Calculate house occupation radius based on scale
                    const houseRadius = 4 * scale; // Base size is 4 units
                    
                    // Check if position is already occupied
                    if (this.isPositionOccupied(x, z, houseRadius)) {
                        if (window.Logger) {
                            Logger.debug(`Skipped house at occupied position ${x}, ${z}`);
                        }
                        return null; // Skip this house
                    }
                    
                    // Add the house using the original method
                    const house = originalAddHouse(parent, x, z, scale, rotation);
                    
                    // Mark position as occupied
                    this.markPositionOccupied(x, z, houseRadius, 'house');
                    
                    return house;
                };
                
                // Add houses with collision detection
                window.HouseBuilder.addHousesInCircle(this.mesh, 0, 0, 25);
                window.HouseBuilder.addInnerHouses(this.mesh, 0, 0, 3);
            } else {
                if (window.Logger) {
                    Logger.error('HouseBuilder is not available');
                } else {
                    console.error('HouseBuilder is not available');
                }
                this.addHouses(); // Fallback to internal method
            }
            
            if (window.BlacksmithBuilder) {
                if (window.Logger) {
                    Logger.info('BlacksmithBuilder is available');
                } else {
                    console.log('BlacksmithBuilder is available');
                }
                window.BlacksmithBuilder.addBlacksmith(this.mesh, 25, 5, Math.PI / 4);
            } else {
                if (window.Logger) {
                    Logger.error('BlacksmithBuilder is not available');
                } else {
                    console.error('BlacksmithBuilder is not available');
                }
                this.addBlacksmith(); // Fallback to internal method
            }
            
            if (window.MarketBuilder) {
                if (window.Logger) {
                    Logger.info('MarketBuilder is available');
                } else {
                    console.log('MarketBuilder is available');
                }
                window.MarketBuilder.addMarketStands(this.mesh, -15, -5, 3);
            } else {
                if (window.Logger) {
                    Logger.error('MarketBuilder is not available');
                } else {
                    console.error('MarketBuilder is not available');
                }
                this.addMarketStands(); // Fallback to internal method
            }
            
            if (window.TempleBuilder) {
                if (window.Logger) {
                    Logger.info('TempleBuilder is available');
                } else {
                    console.log('TempleBuilder is available');
                }
                window.TempleBuilder.addTemple(this.mesh, 0, -35, 0);
            } else {
                if (window.Logger) {
                    Logger.error('TempleBuilder is not available');
                } else {
                    console.error('TempleBuilder is not available');
                }
                this.addTemple(); // Fallback to internal method
            }
            
            if (window.Logger) {
                Logger.info('Whiterun buildings added successfully');
            } else {
                console.log('Whiterun buildings added successfully');
            }
        } catch (error) {
            if (window.Logger) {
                Logger.error('Error adding Whiterun buildings:', error);
            } else {
                console.error('Error adding Whiterun buildings:', error);
            }
        }
    }
    
    /**
     * Add a central path through the town (fallback method)
     */
    addCentralPath() {
        if (window.Logger) {
            Logger.warn('Using fallback method for central path');
        } else {
            console.log('Using fallback method for central path');
        }
        
        // Create path material
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
        
        // Main circular path
        const outerRadius = 25;
        const innerRadius = 20;
        const pathGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        path.position.y = 0.05; // Slightly above ground
        path.receiveShadow = true;
        this.mesh.add(path);
        
        // Path to entrance
        const entrancePathGeometry = new THREE.PlaneGeometry(10, 5);
        const entrancePath = new THREE.Mesh(entrancePathGeometry, pathMaterial);
        entrancePath.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        entrancePath.position.set(0, 0.05, outerRadius + 2.5); // Position at entrance
        entrancePath.receiveShadow = true;
        this.mesh.add(entrancePath);
        
        // Path to temple
        const templePathGeometry = new THREE.PlaneGeometry(5, 15);
        const templePath = new THREE.Mesh(templePathGeometry, pathMaterial);
        templePath.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        templePath.position.set(0, 0.05, -(outerRadius + 7.5)); // Position towards temple
        templePath.receiveShadow = true;
        this.mesh.add(templePath);
    }
    
    /**
     * Add houses to the terrain (fallback method)
     */
    addHouses() {
        if (window.Logger) {
            Logger.warn('Using fallback method for houses');
        } else {
            console.log('Using fallback method for houses');
        }
        
        // Add a simple house in the center for testing
        const x = 10;
        const z = 10;
        const houseRadius = 4; // Size of house for collision detection
        
        // Check if position is already occupied
        if (this.isPositionOccupied(x, z, houseRadius)) {
            if (window.Logger) {
                Logger.debug(`Skipped house at occupied position ${x}, ${z}`);
            }
            return;
        }
        
        const house = new THREE.Group();
        
        // House base (walls)
        const baseGeometry = new THREE.BoxGeometry(4, 2, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan
            roughness: 0.8,
            metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1; // Half height
        base.castShadow = true;
        base.receiveShadow = true;
        house.add(base);
        
        // Roof (pyramid)
        const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 3; // Above walls
        roof.rotation.y = Math.PI / 4; // Rotate 45 degrees
        roof.castShadow = true;
        house.add(roof);
        
        // Position house
        house.position.set(x, 0, z);
        
        // Add to terrain mesh
        this.mesh.add(house);
        
        // Mark position as occupied
        this.markPositionOccupied(x, z, houseRadius, 'house');
    }
    
    /**
     * Add a blacksmith shop to the terrain (fallback method)
     */
    addBlacksmith() {
        if (window.Logger) {
            Logger.warn('Using fallback method for blacksmith');
        } else {
            console.log('Using fallback method for blacksmith');
        }
        
        // Position and size
        const x = 25;
        const z = 5;
        const buildingSize = 5; // Size of the blacksmith building
        
        // Check if position is already occupied
        if (this.isPositionOccupied(x, z, buildingSize)) {
            if (window.Logger) {
                Logger.debug(`Skipped blacksmith at occupied position ${x}, ${z}`);
            }
            return;
        }
        
        // Add a simple blacksmith shop for testing
        const blacksmith = new THREE.Group();
        
        // Main building
        const buildingGeometry = new THREE.BoxGeometry(5, 3, 4);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 1.5; // Half height
        building.castShadow = true;
        building.receiveShadow = true;
        blacksmith.add(building);
        
        // Position blacksmith
        blacksmith.position.set(x, 0, z);
        
        // Add to terrain mesh
        this.mesh.add(blacksmith);
        
        // Mark position as occupied
        this.markPositionOccupied(x, z, buildingSize, 'blacksmith');
    }
    
    /**
     * Add market stands to the terrain (fallback method)
     */
    addMarketStands() {
        if (window.Logger) {
            Logger.warn('Using fallback method for market stands');
        } else {
            console.log('Using fallback method for market stands');
        }
        
        // Position and size
        const x = -15;
        const z = -5;
        const standSize = 5; // Increased size of the market stand for better collision detection
        
        // Check if position is already occupied
        if (this.isPositionOccupied(x, z, standSize)) {
            if (window.Logger) {
                Logger.debug(`Skipped market stand at occupied position ${x}, ${z}`);
            }
            return;
        }
        
        // Add a simple market stand for testing
        const stand = new THREE.Group();
        
        // Stand base
        const baseGeometry = new THREE.BoxGeometry(3, 0.2, 2);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.8; // Height of table
        base.castShadow = true;
        base.receiveShadow = true;
        stand.add(base);
        
        // Position stand
        stand.position.set(x, 0, z);
        
        // Add to terrain mesh
        this.mesh.add(stand);
        
        // Mark position as occupied
        this.markPositionOccupied(x, z, standSize, 'market_stand');
    }
    
    /**
     * Add a temple to the terrain (fallback method)
     */
    addTemple() {
        if (window.Logger) {
            Logger.warn('Using fallback method for temple');
        } else {
            console.log('Using fallback method for temple');
        }
        
        // Position and size
        const x = 0;
        const z = -35;
        const templeSize = 12; // Size of the temple
        
        // Check if position is already occupied
        if (this.isPositionOccupied(x, z, templeSize)) {
            if (window.Logger) {
                Logger.debug(`Skipped temple at occupied position ${x}, ${z}`);
            }
            return;
        }
        
        // Add a simple temple for testing
        const temple = new THREE.Group();
        
        // Temple base (platform)
        const baseGeometry = new THREE.BoxGeometry(12, 1, 12);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC, // Light gray
            roughness: 0.9,
            metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5; // Half height
        base.castShadow = true;
        base.receiveShadow = true;
        temple.add(base);
        
        // Position temple
        temple.position.set(x, 0, z);
        
        // Add to terrain mesh
        this.mesh.add(temple);
        
        // Mark position as occupied
        this.markPositionOccupied(x, z, templeSize, 'temple');
    }
}
