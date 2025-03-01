/**
 * World class for managing the simulation environment
 * Contains entities, systems, and the Three.js scene
 */
class World {
    /**
     * Create a new world
     */
    constructor() {
        // Entities and systems
        this.entities = [];
        this.systems = {};
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        
        // Three.js setup
        this.setupScene();
        
        // Animation loop
        this.lastTime = 0;
        this.running = false;
    }
    
    /**
     * Set up the Three.js scene, camera, renderer, and controls
     */
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Position camera for isometric-like view (similar to RuneScape)
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(0, 0, 0);
        
        if (window.Logger) {
            Logger.debug('Camera position set to:', this.camera.position);
            Logger.debug('Camera looking at: 0, 0, 0');
        } else {
            console.log('Camera position set to:', this.camera.position);
            console.log('Camera looking at: 0, 0, 0');
        }
        
        // Create renderer with improved settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        
        if (window.Logger) {
            Logger.debug('Renderer created');
        } else {
            console.log('Renderer created');
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Improved color rendering
        this.renderer.gammaFactor = 2.2; // Standard gamma correction
        this.renderer.gammaOutput = true; // Apply gamma correction to output
        document.body.appendChild(this.renderer.domElement);
        
        // Create orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Limit camera angle to just above ground level
        
        // Set up lighting
        this.setupLighting();
        
        // Initial render to make sure everything is visible
        this.renderer.render(this.scene, this.camera);
        if (window.Logger) {
            Logger.debug('Initial render completed');
        } else {
            console.log('Initial render completed');
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Set up scene lighting
     */
    setupLighting() {
        // Ambient light for base illumination
        this.ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Increased intensity
        this.scene.add(this.ambientLight);
        
        // Directional light for sun
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
        this.sunLight.position.set(20, 50, 20); // Adjusted position for better illumination
        this.sunLight.castShadow = true;
        
        // Configure shadow properties
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        
        this.scene.add(this.sunLight);
        
        // Helper to visualize light direction (uncomment for debugging)
        // const helper = new THREE.DirectionalLightHelper(this.sunLight, 10);
        // this.scene.add(helper);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Add an entity to the world
     * @param {Entity} entity - The entity to add
     */
    addEntity(entity) {
        // Set world reference
        entity.world = this;
        
        // Set world reference for all components
        for (const type in entity.components) {
            if (entity.components[type].entity) {
                entity.components[type].entity.world = this;
            }
        }
        
        // Add to pending entities
        this.entitiesToAdd.push(entity);
        
        if (window.Logger) {
            Logger.info(`Added entity to world: ${entity.type} (${entity.id})`);
        } else {
            console.log(`Added entity to world: ${entity.type} (${entity.id})`);
        }
        
        // Force initial behavior update for NPCs
        if (entity.type === 'farmer' || entity.type === 'guard' || entity.type === 'merchant') {
            const behavior = entity.getComponent('behavior');
            if (behavior) {
                // Get current hour
                let hour = 6; // Default to 6 AM
                if (this.getSystem('time')) {
                    hour = this.getSystem('time').getCurrentHour();
                }
                
                // Update daily routine
                behavior.updateDailyRoutine(hour);
                if (window.Logger) {
                    Logger.debug(`Initialized behavior for ${entity.type} ${entity.id}`);
                } else {
                    console.log(`Initialized behavior for ${entity.type} ${entity.id}`);
                }
            }
        }
    }
    
    /**
     * Remove an entity from the world
     * @param {Entity} entity - The entity to remove
     */
    removeEntity(entity) {
        this.entitiesToRemove.push(entity);
    }
    
    /**
     * Process pending entity additions and removals
     */
    processEntityChanges() {
        // Add new entities
        for (const entity of this.entitiesToAdd) {
            this.entities.push(entity);
            
            // Set world reference
            entity.world = this;
            
            // Add mesh to scene if it exists
            if (entity.mesh) {
                this.scene.add(entity.mesh);
            }
            
            if (window.Logger) {
                Logger.info(`Added entity: ${entity.type} (${entity.id})`);
            } else {
                console.log(`Added entity: ${entity.type} (${entity.id})`);
            }
        }
        this.entitiesToAdd = [];
        
        // Remove entities
        for (const entity of this.entitiesToRemove) {
            const index = this.entities.indexOf(entity);
            if (index !== -1) {
                this.entities.splice(index, 1);
                
                // Remove mesh from scene if it exists
                if (entity.mesh) {
                    this.scene.remove(entity.mesh);
                }
            }
        }
        this.entitiesToRemove = [];
    }
    
    /**
     * Add a system to the world
     * @param {System} system - The system to add
     */
    addSystem(system) {
        this.systems[system.type] = system;
        system.setWorld(this);
    }
    
    /**
     * Get a system by type
     * @param {string} type - The type of system to get
     * @returns {System|null} The system, or null if not found
     */
    getSystem(type) {
        return this.systems[type] || null;
    }
    
    /**
     * Set up fixed lighting (no day/night cycle)
     */
    setupFixedLighting() {
        // Set permanent daytime lighting
        
        // Position sun at a fixed position (noon-like)
        const sunDistance = 100;
        const sunHeight = 80; // High in the sky
        const sunHorizontal = 50; // Slightly to the side
        
        this.sunLight.position.set(sunHorizontal, sunHeight, 0);
        
        // Set fixed sun intensity
        this.sunLight.intensity = 1.5;
        
        // Set fixed ambient light intensity
        this.ambientLight.intensity = 1.0;
        
        // Set fixed sky color (daytime blue)
        this.scene.background = new THREE.Color(0x87ceeb);
    }
    
    /**
     * Start the simulation
     */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(time => this.update(time));
        }
    }
    
    /**
     * Stop the simulation
     */
    stop() {
        this.running = false;
    }
    
    /**
     * Update the world
     * @param {number} time - Current time in milliseconds
     */
    update(time) {
        if (!this.running) {
            console.log("World is not running, update skipped");
            return;
        }
        
        // Calculate delta time in seconds
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        // Debug: Log update call
        console.log(`World update called, deltaTime: ${deltaTime.toFixed(4)}`);
        
        // Process entity changes
        this.processEntityChanges();
        
        // Apply fixed lighting instead of day/night cycle
        this.setupFixedLighting();
        
        // Debug: Log systems before update
        console.log(`Updating ${Object.keys(this.systems).length} systems: ${Object.keys(this.systems).join(', ')}`);
        
        // Update all systems
        for (const type in this.systems) {
            console.log(`Updating system: ${type}`);
            this.systems[type].update(this.entities, deltaTime);
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Request next frame
        requestAnimationFrame(time => this.update(time));
    }
}
