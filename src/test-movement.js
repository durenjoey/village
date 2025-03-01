/**
 * Test script for diagnosing movement issues
 * This script creates a simple test entity and logs its movement
 */

// Global variables
let world;
let testEntity;
let logElement;
let logCount = 0;
const MAX_LOGS = 100;

// Initialize the test
function initTest() {
    console.log('Initializing movement test...');
    
    // Create log element
    createLogElement();
    
    // Create world
    world = new World();
    
    // Add systems
    initSystems();
    
    // Create test entity
    createTestEntity();
    
    // Start the simulation
    world.start();
    
    // Set up periodic logging
    setInterval(logEntityState, 1000);
    
    console.log('Test started!');
    logToScreen('Test started!');
}

// Initialize systems with debug logging
function initSystems() {
    // Add time system
    const timeSystem = new TimeSystem();
    timeSystem.update = function(entities, deltaTime) {
        // Call original update
        TimeSystem.prototype.update.call(this, entities, deltaTime);
        
        // Log time updates occasionally
        if (Math.random() < 0.1) {
            console.log(`Time system update: hour=${this.getCurrentHour()}, deltaTime=${deltaTime.toFixed(4)}`);
            logToScreen(`Time: hour=${this.getCurrentHour()}, deltaTime=${deltaTime.toFixed(4)}`);
        }
    };
    world.addSystem(timeSystem);
    
    // Add physics system with debug logging
    const physicsSystem = new PhysicsSystem();
    physicsSystem.init();
    
    // Override update method to add logging
    const originalPhysicsUpdate = physicsSystem.update;
    physicsSystem.update = function(entities, deltaTime) {
        console.log(`Physics system update: entities=${entities.length}, deltaTime=${deltaTime.toFixed(4)}`);
        logToScreen(`Physics update: entities=${entities.length}`);
        
        // Call original update
        originalPhysicsUpdate.call(this, entities, deltaTime);
    };
    world.addSystem(physicsSystem);
    
    // Add behavior system with debug logging
    const behaviorSystem = new BehaviorSystem();
    
    // Override update method to add logging
    const originalBehaviorUpdate = behaviorSystem.update;
    behaviorSystem.update = function(entities, deltaTime) {
        console.log(`Behavior system update: entities=${entities.length}, deltaTime=${deltaTime.toFixed(4)}`);
        logToScreen(`Behavior update: entities=${entities.length}`);
        
        // Call original update
        originalBehaviorUpdate.call(this, entities, deltaTime);
    };
    world.addSystem(behaviorSystem);
    
    // Add render system with debug logging
    const renderSystem = new RenderSystem();
    
    // Override update method to add logging
    const originalRenderUpdate = renderSystem.update;
    renderSystem.update = function(entities, deltaTime) {
        // Call original update
        originalRenderUpdate.call(this, entities, deltaTime);
        
        // Log render updates occasionally
        if (Math.random() < 0.05) {
            console.log(`Render system update: entities=${entities.length}, deltaTime=${deltaTime.toFixed(4)}`);
            logToScreen(`Render update: entities=${entities.length}`);
        }
    };
    world.addSystem(renderSystem);
}

// Create a test entity that should move
function createTestEntity() {
    testEntity = new Entity();
    testEntity.type = 'test';
    
    // Add position component
    const position = new PositionComponent(0, 0, 0);
    
    // Override position update method to add logging
    const originalPositionUpdate = position.update;
    position.update = function(deltaTime) {
        console.log(`Position before update: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}, z=${this.z.toFixed(2)}`);
        
        // Call original update
        originalPositionUpdate.call(this, deltaTime);
        
        console.log(`Position after update: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}, z=${this.z.toFixed(2)}`);
        logToScreen(`Position: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}, z=${this.z.toFixed(2)}`);
    };
    testEntity.addComponent(position);
    
    // Add physics component
    const physics = new PhysicsComponent({
        mass: 10,
        isStatic: false,
        friction: 0.5,
        collisionRadius: 0.5
    });
    testEntity.addComponent(physics);
    
    // Add appearance component
    const appearance = new AppearanceComponent('test');
    testEntity.addComponent(appearance);
    
    // Create mesh
    testEntity.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xFF0000 })
    );
    testEntity.mesh.position.set(0, 0.5, 0);
    testEntity.mesh.castShadow = true;
    
    // Add to world
    world.addEntity(testEntity);
    console.log('Test entity created');
    logToScreen('Test entity created');
    
    // Set initial velocity
    setTimeout(() => {
        const position = testEntity.getComponent('position');
        if (position) {
            position.setVelocity(1, 0, 1);
            console.log('Set initial velocity: (1, 0, 1)');
            logToScreen('Set initial velocity: (1, 0, 1)');
        }
    }, 2000);
}

// Log entity state
function logEntityState() {
    if (!testEntity) return;
    
    const position = testEntity.getComponent('position');
    if (!position) return;
    
    console.log(`Entity state: position=(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}), velocity=(${position.velocityX.toFixed(2)}, ${position.velocityY.toFixed(2)}, ${position.velocityZ.toFixed(2)}), speed=${position.speed.toFixed(2)}`);
    logToScreen(`Entity state: position=(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}), velocity=(${position.velocityX.toFixed(2)}, ${position.velocityY.toFixed(2)}, ${position.velocityZ.toFixed(2)}), speed=${position.speed.toFixed(2)}`);
    
    // Force movement if not moving
    if (Math.abs(position.velocityX) < 0.01 && Math.abs(position.velocityZ) < 0.01) {
        position.setVelocity(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
        console.log(`Forced new velocity: (${position.velocityX.toFixed(2)}, ${position.velocityY.toFixed(2)}, ${position.velocityZ.toFixed(2)})`);
        logToScreen(`Forced new velocity: (${position.velocityX.toFixed(2)}, ${position.velocityY.toFixed(2)}, ${position.velocityZ.toFixed(2)})`);
    }
    
    // Force position update
    testEntity.updatePosition();
}

// Create log element
function createLogElement() {
    logElement = document.createElement('div');
    logElement.id = 'log-display';
    logElement.style.position = 'absolute';
    logElement.style.bottom = '10px';
    logElement.style.left = '10px';
    logElement.style.width = '400px';
    logElement.style.height = '300px';
    logElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    logElement.style.color = 'white';
    logElement.style.padding = '10px';
    logElement.style.fontFamily = 'monospace';
    logElement.style.fontSize = '12px';
    logElement.style.overflow = 'auto';
    document.body.appendChild(logElement);
}

// Log to screen
function logToScreen(message) {
    if (!logElement) return;
    
    // Create log entry
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    // Add to log element
    logElement.appendChild(logEntry);
    
    // Scroll to bottom
    logElement.scrollTop = logElement.scrollHeight;
    
    // Limit number of logs
    logCount++;
    if (logCount > MAX_LOGS) {
        logElement.removeChild(logElement.firstChild);
        logCount--;
    }
}

// Run test when button is clicked
function runTest() {
    initTest();
}

// Add test button
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = 'Run Movement Test';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.onclick = runTest;
    document.body.appendChild(button);
}

// Initialize when the page loads
window.addEventListener('load', addTestButton);
