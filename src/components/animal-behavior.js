/**
 * Animal behavior component for handling animal AI and decision-making
 */
class AnimalBehaviorComponent extends Component {
    /**
     * Create a new animal behavior component
     * @param {string} type - The animal type (e.g., 'dog', 'cat', 'cow')
     * @param {string} species - The species category (e.g., 'domestic', 'livestock', 'wild')
     */
    constructor(type = 'dog', species = 'domestic') {
        super('behavior');
        
        this.type = type;
        this.species = species;
        this.currentState = 'idle';
        this.previousState = 'idle';
        this.stateTime = 0;
        this.targetEntity = null;
        this.targetPosition = { x: 0, y: 0, z: 0 };
        this.waypoints = [];
        this.currentWaypoint = 0;
        this.waitTime = 0;
        this.taskQueue = [];
        this.owner = null;
        
        // Needs system (0-100 scale)
        this.needs = {
            hunger: Math.random() * 20, // Start with low hunger
            energy: 100, // Start with full energy
            social: 50, // Start with moderate social need
            freedom: 50, // Start with moderate freedom need
        };
        
        // Personality traits (0-100 scale)
        this.personality = {
            friendliness: this.generatePersonalityTrait(),
            playfulness: this.generatePersonalityTrait(),
            loyalty: this.generatePersonalityTrait(),
            aggression: this.generatePersonalityTrait(),
            curiosity: this.generatePersonalityTrait(),
        };
        
        // Memory for important locations and entities
        this.memory = {
            home: null,
            foodSources: [],
            waterSources: [],
            territory: {
                center: { x: 0, y: 0, z: 0 },
                radius: 10
            },
            knownEntities: {}
        };
        
        // Behavior properties
        this.properties = {
            moveSpeed: 1.0,
            interactionRadius: 1.5,
            sightRadius: 10,
            wanderRadius: 5,
            minStateTime: 2, // Minimum time to stay in a state
            maxIdleTime: 5,  // Maximum time to stay idle
            maxWanderTime: 10, // Maximum time to wander
            sleepStartHour: 20, // Hour to start sleeping (8 PM)
            sleepEndHour: 6,  // Hour to end sleeping (6 AM)
            homePosition: { x: 0, y: 0, z: 0 },
            foodPosition: { x: 0, y: 0, z: 0 }
        };
        
        // Set behavior properties based on type and species
        this.setBehaviorByType(type, species);
    }
    
    /**
     * Generate a random personality trait value (0-100)
     * @returns {number} Personality trait value
     */
    generatePersonalityTrait() {
        return Math.floor(Math.random() * 101); // 0-100
    }
    
    /**
     * Set behavior properties based on type and species
     * @param {string} type - The animal type
     * @param {string} species - The species category
     */
    setBehaviorByType(type, species) {
        // Base properties by species
        switch (species) {
            case 'domestic':
                this.properties.moveSpeed = 1.2;
                this.properties.sightRadius = 12;
                this.properties.wanderRadius = 8;
                this.properties.homePosition = { x: -8, y: 0, z: -8 }; // Near village homes
                this.properties.foodPosition = { x: -6, y: 0, z: -6 }; // Near village homes
                break;
            case 'livestock':
                this.properties.moveSpeed = 0.8;
                this.properties.sightRadius = 8;
                this.properties.wanderRadius = 5;
                this.properties.homePosition = { x: 12, y: 0, z: 12 }; // Near farm
                this.properties.foodPosition = { x: 15, y: 0, z: 15 }; // Farm position
                break;
            case 'wild':
                this.properties.moveSpeed = 1.5;
                this.properties.sightRadius = 15;
                this.properties.wanderRadius = 15;
                this.properties.homePosition = { x: 20, y: 0, z: -20 }; // Forest area
                this.properties.foodPosition = { x: 15, y: 0, z: -15 }; // Forest edge
                break;
            case 'aquatic':
                this.properties.moveSpeed = 1.0;
                this.properties.sightRadius = 10;
                this.properties.wanderRadius = 10;
                this.properties.homePosition = { x: -20, y: 0, z: 20 }; // Water area
                this.properties.foodPosition = { x: -18, y: 0, z: 18 }; // Water edge
                break;
        }
        
        // Specific adjustments by animal type
        switch (type) {
            case 'dog':
                this.properties.moveSpeed = 1.5;
                this.properties.loyalty = 90;
                this.personality.friendliness = 80;
                this.personality.playfulness = 70;
                break;
            case 'cat':
                this.properties.moveSpeed = 1.3;
                this.personality.independence = 90;
                this.personality.curiosity = 80;
                break;
            case 'cow':
                this.properties.moveSpeed = 0.6;
                this.properties.wanderRadius = 3;
                break;
            case 'chicken':
                this.properties.moveSpeed = 0.7;
                this.properties.wanderRadius = 4;
                break;
            case 'sheep':
                this.properties.moveSpeed = 0.7;
                this.properties.wanderRadius = 3;
                break;
            case 'rabbit':
                this.properties.moveSpeed = 1.8;
                this.personality.skittishness = 90;
                break;
            case 'bird':
                this.properties.moveSpeed = 2.0;
                this.properties.wanderRadius = 20;
                break;
        }
        
        // Set territory based on home position
        this.memory.territory.center = { ...this.properties.homePosition };
        
        // Add some randomness to home and food positions
        const randomOffsetX = (Math.random() * 4) - 2; // -2 to 2
        const randomOffsetZ = (Math.random() * 4) - 2; // -2 to 2
        
        this.properties.homePosition.x += randomOffsetX;
        this.properties.homePosition.z += randomOffsetZ;
        
        this.properties.foodPosition.x += randomOffsetX * 0.5;
        this.properties.foodPosition.z += randomOffsetZ * 0.5;
    }
    
    /**
     * Change the current state
     * @param {string} newState - The new state to change to
     */
    changeState(newState) {
        if (this.currentState !== newState) {
            this.previousState = this.currentState;
            this.currentState = newState;
            this.stateTime = 0;
            
            // Update appearance animation state
            const appearance = this.entity.getComponent('appearance');
            if (appearance) {
                switch (newState) {
                    case 'walking':
                    case 'running':
                    case 'wandering':
                        appearance.setAnimationState('walking');
                        break;
                    case 'eating':
                        appearance.setAnimationState('eating');
                        break;
                    case 'sleeping':
                        appearance.setAnimationState('sleeping');
                        break;
                    case 'playing':
                        appearance.setAnimationState('playing');
                        break;
                    case 'idle':
                    default:
                        appearance.setAnimationState('idle');
                        break;
                }
            }
        }
    }
    
    /**
     * Add a task to the queue
     * @param {Object} task - The task to add
     * @param {string} task.type - The type of task
     * @param {Object} task.data - Task-specific data
     */
    addTask(task) {
        this.taskQueue.push(task);
    }
    
    /**
     * Clear all tasks
     */
    clearTasks() {
        this.taskQueue = [];
    }
    
    /**
     * Process the current task
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} hour - Current hour of the day
     * @returns {boolean} True if task was completed
     */
    processCurrentTask(deltaTime, hour) {
        if (this.taskQueue.length === 0) {
            return true; // No tasks to process
        }
        
        const task = this.taskQueue[0];
        let taskCompleted = false;
        
        switch (task.type) {
            case 'move_to':
                taskCompleted = this.processMoveToTask(task, deltaTime);
                break;
            case 'follow':
                taskCompleted = this.processFollowTask(task, deltaTime);
                break;
            case 'eat':
                taskCompleted = this.processEatTask(task, deltaTime);
                break;
            case 'sleep':
                taskCompleted = this.processSleepTask(task, deltaTime, hour);
                break;
            case 'play':
                taskCompleted = this.processPlayTask(task, deltaTime);
                break;
            case 'wait':
                taskCompleted = this.processWaitTask(task, deltaTime);
                break;
            case 'wander':
                taskCompleted = this.processWanderTask(task, deltaTime);
                break;
            default:
                // Unknown task type, just remove it
                taskCompleted = true;
                break;
        }
        
        if (taskCompleted) {
            this.taskQueue.shift(); // Remove completed task
            return true;
        }
        
        return false;
    }
    
    /**
     * Process a move_to task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processMoveToTask(task, deltaTime) {
        const position = this.entity.getComponent('position');
        if (!position) return true;
        
        // Set target position
        this.targetPosition = task.data.position;
        
        // Change state to walking
        this.changeState('walking');
        
        // Move toward target
        const reached = position.moveToward(
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z,
            this.properties.moveSpeed
        );
        
        // If we've been trying to reach this target for too long, force completion
        this.stateTime += deltaTime;
        if (this.stateTime > 10) { // 10 seconds max for any movement task
            console.log(`${this.entity.type} ${this.entity.id} task timed out, forcing completion`);
            this.stateTime = 0;
            return true;
        }
        
        return reached;
    }
    
    /**
     * Process a follow task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processFollowTask(task, deltaTime) {
        const position = this.entity.getComponent('position');
        if (!position) return true;
        
        // Get target entity
        const targetEntity = task.data.entity;
        if (!targetEntity) return true;
        
        // Get target position
        const targetPosition = targetEntity.getComponent('position');
        if (!targetPosition) return true;
        
        // Change state to walking
        this.changeState('walking');
        
        // Calculate distance to target
        const dx = targetPosition.x - position.x;
        const dz = targetPosition.z - position.z;
        const distanceSquared = dx * dx + dz * dz;
        
        // If too far from target, move closer
        if (distanceSquared > 4) { // Keep 2 units away
            // Move toward target
            position.moveToward(
                targetPosition.x,
                targetPosition.y,
                targetPosition.z,
                this.properties.moveSpeed
            );
        } else if (distanceSquared < 1) { // If too close, back up
            // Move away from target
            const direction = Math.atan2(dx, dz) + Math.PI; // Opposite direction
            position.moveInDirection(direction, this.properties.moveSpeed * 0.5);
        } else {
            // Just stand and face the target
            position.direction = Math.atan2(dx, dz);
            this.changeState('idle');
        }
        
        // Check if task duration is over
        this.waitTime += deltaTime;
        if (this.waitTime >= task.data.duration) {
            this.waitTime = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Process an eat task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processEatTask(task, deltaTime) {
        // Change state to eating
        this.changeState('eating');
        
        // Reduce hunger
        this.needs.hunger = Math.max(0, this.needs.hunger - 10 * deltaTime);
        
        // Check if eating is done
        this.waitTime += deltaTime;
        if (this.waitTime >= task.data.duration || this.needs.hunger <= 0) {
            this.waitTime = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Process a sleep task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} hour - Current hour of the day
     * @returns {boolean} True if task was completed
     */
    processSleepTask(task, deltaTime, hour) {
        // Change state to sleeping
        this.changeState('sleeping');
        
        // Increase energy
        this.needs.energy = Math.min(100, this.needs.energy + 5 * deltaTime);
        
        // Check if sleep hours are over
        if (hour >= this.properties.sleepEndHour && hour < this.properties.sleepStartHour) {
            return true;
        }
        
        // Check if energy is full
        if (this.needs.energy >= 100) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Process a play task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processPlayTask(task, deltaTime) {
        // Change state to playing
        this.changeState('playing');
        
        // Increase social need
        this.needs.social = Math.min(100, this.needs.social + 10 * deltaTime);
        
        // Decrease energy
        this.needs.energy = Math.max(0, this.needs.energy - 5 * deltaTime);
        
        // Get position component
        const position = this.entity.getComponent('position');
        if (position) {
            // Add random movement for playing
            if (Math.random() < 0.1) {
                const playDirection = Math.random() * Math.PI * 2;
                const playSpeed = this.properties.moveSpeed * 1.5;
                position.moveInDirection(playDirection, playSpeed);
            }
        }
        
        // Check if play time is over
        this.waitTime += deltaTime;
        if (this.waitTime >= task.data.duration || this.needs.energy <= 20) {
            this.waitTime = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Process a wait task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processWaitTask(task, deltaTime) {
        // Change state to idle
        this.changeState('idle');
        
        // Increment wait time
        this.waitTime += deltaTime;
        
        // Check if wait time is over
        if (this.waitTime >= task.data.duration) {
            this.waitTime = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Process a wander task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processWanderTask(task, deltaTime) {
        const position = this.entity.getComponent('position');
        if (!position) return true;
        
        // Change state to wandering
        this.changeState('wandering');
        
        // If we don't have a target position, generate one
        if (!this.targetPosition || 
            (Math.abs(position.x - this.targetPosition.x) < 0.5 && 
             Math.abs(position.z - this.targetPosition.z) < 0.5)) {
            
            // Generate a random position within wander radius of home
            const home = this.properties.homePosition;
            const radius = this.properties.wanderRadius;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            
            this.targetPosition = {
                x: home.x + Math.cos(angle) * distance,
                y: home.y,
                z: home.z + Math.sin(angle) * distance
            };
        }
        
        // Move toward target
        position.moveToward(
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z,
            this.properties.moveSpeed * 0.7 // Slower for wandering
        );
        
        // Check if wander time is over
        this.stateTime += deltaTime;
        if (this.stateTime >= task.data.duration) {
            this.stateTime = 0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Update daily routine based on time of day
     * @param {number} hour - Current hour of the day
     */
    updateDailyRoutine(hour) {
        // Clear current tasks
        this.clearTasks();
        
        // Check if it's sleep time
        if (hour >= this.properties.sleepStartHour || hour < this.properties.sleepEndHour) {
            // Sleep time
            console.log(`${this.entity.type} ${this.entity.name} should be sleeping at hour ${hour}`);
            
            // First move to home location
            this.addTask({
                type: 'move_to',
                data: { position: this.properties.homePosition }
            });
            
            // Then sleep
            this.addTask({
                type: 'sleep',
                data: { duration: 3600 } // Sleep until morning
            });
            
            return;
        }
        
        // Check needs and decide what to do
        if (this.needs.hunger > 70) {
            // Hungry, go eat
            console.log(`${this.entity.type} ${this.entity.name} is hungry (${this.needs.hunger.toFixed(0)})`);
            
            // Move to food location
            this.addTask({
                type: 'move_to',
                data: { position: this.properties.foodPosition }
            });
            
            // Eat
            this.addTask({
                type: 'eat',
                data: { duration: 10 }
            });
        } else if (this.needs.energy < 30) {
            // Tired, go rest
            console.log(`${this.entity.type} ${this.entity.name} is tired (${this.needs.energy.toFixed(0)})`);
            
            // Move to home location
            this.addTask({
                type: 'move_to',
                data: { position: this.properties.homePosition }
            });
            
            // Rest
            this.addTask({
                type: 'wait',
                data: { duration: 20 }
            });
        } else if (this.needs.social < 30 && this.species === 'domestic') {
            // Lonely (only for domestic animals), find owner or other animals
            console.log(`${this.entity.type} ${this.entity.name} is lonely (${this.needs.social.toFixed(0)})`);
            
            // Find nearby entities
            const nearbyEntities = this.findNearbyEntities();
            
            if (nearbyEntities.length > 0) {
                // Follow a random entity
                const targetEntity = nearbyEntities[Math.floor(Math.random() * nearbyEntities.length)];
                
                this.addTask({
                    type: 'follow',
                    data: { 
                        entity: targetEntity,
                        duration: 30
                    }
                });
                
                // Play
                this.addTask({
                    type: 'play',
                    data: { duration: 15 }
                });
            } else {
                // No one nearby, wander around
                this.addTask({
                    type: 'wander',
                    data: { duration: 30 }
                });
            }
        } else if (this.needs.freedom < 50 || Math.random() < 0.3) {
            // Need freedom or just random wandering
            console.log(`${this.entity.type} ${this.entity.name} is wandering`);
            
            // Wander around
            this.addTask({
                type: 'wander',
                data: { duration: 30 + Math.random() * 30 }
            });
            
            // Then wait a bit
            this.addTask({
                type: 'wait',
                data: { duration: 10 + Math.random() * 10 }
            });
        } else {
            // Default behavior: stay near home
            console.log(`${this.entity.type} ${this.entity.name} is staying near home`);
            
            // Move near home
            const homeOffset = {
                x: this.properties.homePosition.x + (Math.random() * 4) - 2,
                y: this.properties.homePosition.y,
                z: this.properties.homePosition.z + (Math.random() * 4) - 2
            };
            
            this.addTask({
                type: 'move_to',
                data: { position: homeOffset }
            });
            
            // Wait there
            this.addTask({
                type: 'wait',
                data: { duration: 20 + Math.random() * 20 }
            });
        }
    }
    
    /**
     * Find nearby entities
     * @returns {Array<Entity>} Nearby entities
     */
    findNearbyEntities() {
        if (!this.entity || !this.entity.world) return [];
        
        const position = this.entity.getComponent('position');
        if (!position) return [];
        
        const nearbyEntities = [];
        const sightRadius = this.properties.sightRadius;
        
        for (const otherEntity of this.entity.world.entities) {
            if (otherEntity === this.entity) continue;
            
            // Only interested in NPCs and other animals
            if (otherEntity.type !== 'farmer' && 
                otherEntity.type !== 'guard' && 
                otherEntity.type !== 'merchant' && 
                !otherEntity.species) continue;
            
            const otherPosition = otherEntity.getComponent('position');
            if (!otherPosition) continue;
            
            // Calculate distance
            const dx = position.x - otherPosition.x;
            const dz = position.z - otherPosition.z;
            const distanceSquared = dx * dx + dz * dz;
            
            // Check if within sight radius
            if (distanceSquared <= sightRadius * sightRadius) {
                nearbyEntities.push(otherEntity);
            }
        }
        
        return nearbyEntities;
    }
    
    /**
     * Update needs over time
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateNeeds(deltaTime) {
        // Increase hunger over time
        this.needs.hunger = Math.min(100, this.needs.hunger + 1 * deltaTime);
        
        // Decrease energy over time (unless sleeping)
        if (this.currentState !== 'sleeping') {
            this.needs.energy = Math.max(0, this.needs.energy - 0.5 * deltaTime);
        }
        
        // Decrease social need over time (for domestic animals)
        if (this.species === 'domestic') {
            this.needs.social = Math.max(0, this.needs.social - 0.5 * deltaTime);
        }
        
        // Increase freedom need when not wandering
        if (this.currentState !== 'wandering') {
            this.needs.freedom = Math.min(100, this.needs.freedom + 0.5 * deltaTime);
        } else {
            // Decrease freedom need when wandering
            this.needs.freedom = Math.max(0, this.needs.freedom - 1 * deltaTime);
        }
    }
    
    /**
     * Update the behavior component
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Ensure entity has world reference
        if (!this.entity.world && this.entity.getComponent) {
            const position = this.entity.getComponent('position');
            if (position && position.entity && position.entity.world) {
                this.entity.world = position.entity.world;
                console.log(`Set world reference for entity ${this.entity.id} from position component`);
            }
        }
        
        // Get current hour
        let hour = 6; // Default to 6 AM
        if (this.entity.world && this.entity.world.getSystem && this.entity.world.getSystem('time')) {
            hour = this.entity.world.getSystem('time').getCurrentHour();
        }
        
        // Update needs
        this.updateNeeds(deltaTime);
        
        // Increment state time
        this.stateTime += deltaTime;
        
        // Update daily routine based on time of day and needs
        if (this.taskQueue.length === 0) {
            this.updateDailyRoutine(hour);
            console.log(`${this.entity.type} ${this.entity.name} updated routine for hour ${hour}, tasks: ${this.taskQueue.length}`);
        }
        
        // Process current task
        const taskCompleted = this.processCurrentTask(deltaTime, hour);
        
        // If task was completed, log it and start next task
        if (taskCompleted) {
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue[0];
                console.log(`${this.entity.type} ${this.entity.name} starting new task: ${nextTask.type}`);
            } else {
                // If no tasks, force a new daily routine update
                this.updateDailyRoutine(hour);
                console.log(`${this.entity.type} ${this.entity.name} has no tasks, forcing routine update`);
            }
        }
        
        // Occasionally add random movement to make animals more lively
        if (Math.random() < 0.02) { // 2% chance each update
            const position = this.entity.getComponent('position');
            if (position) {
                // Add a small random velocity
                position.velocityX += (Math.random() * 0.6) - 0.3;
                position.velocityZ += (Math.random() * 0.6) - 0.3;
            }
        }
        
        // Interact with nearby entities
        if (Math.random() < 0.01) { // 1% chance each update
            this.interactWithNearbyEntities();
        }
    }
    
    /**
     * Interact with nearby entities
     */
    interactWithNearbyEntities() {
        const nearbyEntities = this.findNearbyEntities();
        if (nearbyEntities.length === 0) return;
        
        // Pick a random nearby entity
        const otherEntity = nearbyEntities[Math.floor(Math.random() * nearbyEntities.length)];
        
        // Get positions
        const position = this.entity.getComponent('position');
        const otherPosition = otherEntity.getComponent('position');
        if (!position || !otherPosition) return;
        
        // Calculate distance
        const dx = otherPosition.x - position.x;
        const dz = otherPosition.z - position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // If close enough, interact
        if (distance <= this.properties.interactionRadius) {
            // Different interactions based on entity types
            if (otherEntity.type === 'farmer' || otherEntity.type === 'guard' || otherEntity.type === 'merchant') {
                // Interacting with an NPC
                if (this.species === 'domestic') {
                    // Domestic animals are friendly to NPCs
                    console.log(`${this.entity.type} ${this.entity.name} is being friendly to ${otherEntity.type} ${otherEntity.id}`);
                    
                    // Face the NPC
                    position.direction = Math.atan2(dx, dz);
                    
                    // Increase social need
                    this.needs.social = Math.min(100, this.needs.social + 10);
                } else if (this.species === 'wild') {
                    // Wild animals run away from NPCs
                    console.log(`${this.entity.type} ${this.entity.name} is running away from ${otherEntity.type} ${otherEntity.id}`);
                    
                    // Run in opposite direction
                    const runDirection = Math.atan2(-dx, -dz);
                    position.moveInDirection(runDirection, this.properties.moveSpeed * 1.5);
                }
            } else if (otherEntity.species) {
                // Interacting with another animal
                if (otherEntity.species === this.species) {
                    // Same species, be friendly
                    console.log(`${this.entity.type} ${this.entity.name} is being friendly to ${otherEntity.type} ${otherEntity.name}`);
                    
                    // Face the other animal
                    position.direction = Math.atan2(dx, dz);
                    
                    // Increase social need
                    this.needs.social = Math.min(100, this.needs.social + 5);
                } else if (this.personality.aggression > 70) {
                    // Aggressive animals might chase others
                    console.log(`${this.entity.type} ${this.entity.name} is chasing ${otherEntity.type} ${otherEntity.name}`);
                    
                    // Chase the other animal
                    position.moveToward(
                        otherPosition.x,
                        otherPosition.y,
                        otherPosition.z,
                        this.properties.moveSpeed
                    );
                } else {
                    // Different species, ignore or avoid
                    if (this.personality.skittishness > 50) {
                        // Skittish animals run away
                        console.log(`${this.entity.type} ${this.entity.name} is avoiding ${otherEntity.type} ${otherEntity.name}`);
                        
                        // Move away
                        const avoidDirection = Math.atan2(-dx, -dz);
                        position.moveInDirection(avoidDirection, this.properties.moveSpeed);
                    }
                }
            }
        }
    }
}
