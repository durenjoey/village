/**
 * Main entry point for the Simple Land Simulation
 * Creates the world, adds terrain, and starts the simulation
 */

// Global variables
let world;
let infoElement;
let debugMode = false;

// Initialize the simulation
function init() {
    if (window.Logger) {
        Logger.info('Initializing Simple Land Simulation...');
    } else {
        console.log('Initializing Simple Land Simulation...');
    }
    
    // Get UI elements
    infoElement = document.getElementById('info');
    
    // Create world
    world = new World();
    
    // Add systems
    initSystems();
    
    // Create terrain
    createTerrain();
    
    // Add event listeners
    addEventListeners();
    
    // Start the simulation
    world.start();
    
    if (window.Logger) {
        Logger.info('Simulation started!');
    } else {
        console.log('Simulation started!');
    }
    
    // Update info display after a short delay
    setTimeout(updateInfoDisplay, 500);
}

// Initialize systems
function initSystems() {
    // Time system removed
    
    // Add physics system
    const physicsSystem = new PhysicsSystem();
    world.addSystem(physicsSystem);
    physicsSystem.init();
    
    // Add render system
    const renderSystem = new RenderSystem();
    world.addSystem(renderSystem);
}

// Create terrain
function createTerrain() {
    if (window.Logger) {
        Logger.info('Creating terrain...');
    } else {
        console.log('Creating terrain...');
    }
    
    const terrain = new Terrain({
        size: 100,
        resolution: 50,  // Reduced resolution for better performance
        maxHeight: 3     // Lower height for more gentle hills
    });
    
    // Log terrain mesh details
    if (window.Logger) {
        Logger.debug('Terrain mesh created:', terrain.mesh ? 'Yes' : 'No');
        if (terrain.mesh) {
            Logger.debug('Terrain mesh children:', terrain.mesh.children.length);
        }
    } else {
        console.log('Terrain mesh created:', terrain.mesh ? 'Yes' : 'No');
        if (terrain.mesh) {
            console.log('Terrain mesh children:', terrain.mesh.children.length);
        }
    }
    
    world.addEntity(terrain);
    
    if (window.Logger) {
        Logger.info('Terrain added to world');
    } else {
        console.log('Terrain added to world');
    }
}

// Add event listeners
function addEventListeners() {
    // Toggle debug mode on 'D' key press
    window.addEventListener('keydown', (event) => {
        if (event.key === 'd' || event.key === 'D') {
            toggleDebugMode();
        }
        
        // Time-related keyboard controls removed
    });
    
    // Add info about controls
    updateInfoDisplay();
}

// Toggle debug mode
function toggleDebugMode() {
    debugMode = !debugMode;
    
    // Toggle debug visualization in render system
    const renderSystem = world.getSystem('render');
    if (renderSystem) {
        renderSystem.toggleDebugVisualization(debugMode);
    }
    
    updateInfoDisplay();
}

// Change time speed
function changeTimeSpeed(factor) {
    const timeSystem = world.getSystem('time');
    if (timeSystem) {
        timeSystem.setTimeSpeed(timeSystem.timeSpeed * factor);
        updateInfoDisplay();
    }
}

// Reset time speed
function resetTimeSpeed() {
    const timeSystem = world.getSystem('time');
    if (timeSystem) {
        timeSystem.setTimeSpeed(1);
        updateInfoDisplay();
    }
}

// Update info display
function updateInfoDisplay() {
    if (!infoElement) return;
    
    infoElement.innerHTML = `
        Simple Land Simulation<br>
        <small>
            Debug Mode: ${debugMode ? 'ON' : 'OFF'} (Press 'D' to toggle)<br>
            <br>
            Controls:<br>
            - D: Toggle debug mode<br>
            - L: Toggle log panel<br>
        </small>
    `;
}

// Initialize when the page loads
window.addEventListener('load', function() {
    if (window.Logger) {
        Logger.info('Page loaded, initializing...');
    } else {
        console.log('Page loaded, initializing...');
    }
    
    init();
    
    // Add additional debugging
    setTimeout(function() {
        if (window.Logger) {
            Logger.debug('Debug info after initialization:');
            Logger.debug('World entities:', world.entities.length);
            Logger.debug('Scene children:', world.scene.children.length);
            Logger.debug('Camera position:', world.camera.position);
            Logger.debug('Renderer:', world.renderer ? 'Created' : 'Not created');
            
            // Force a render
            if (world.renderer && world.scene && world.camera) {
                Logger.debug('Forcing render...');
                world.renderer.render(world.scene, world.camera);
            }
        } else {
            console.log('Debug info after initialization:');
            console.log('World entities:', world.entities.length);
            console.log('Scene children:', world.scene.children.length);
            console.log('Camera position:', world.camera.position);
            console.log('Renderer:', world.renderer ? 'Created' : 'Not created');
            
            // Force a render
            if (world.renderer && world.scene && world.camera) {
                console.log('Forcing render...');
                world.renderer.render(world.scene, world.camera);
            }
        }
    }, 1000);
});
