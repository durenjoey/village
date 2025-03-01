/**
 * Behavior component for handling entity AI and decision-making
 */
class BehaviorComponent extends Component {
    /**
     * Create a new behavior component
     * @param {string} type - The behavior type (e.g., 'farmer', 'guard')
     */
    constructor(type = 'default') {
        super('behavior');
        
        this.type = type;
        this.currentState = 'idle';
        this.previousState = 'idle';
        this.stateTime = 0;
        this.targetEntity = null;
        this.targetPosition = { x: 0, y: 0, z: 0 };
        this.waypoints = [];
        this.currentWaypoint = 0;
        this.waitTime = 0;
        this.taskQueue = [];
        
        // Behavior properties
        this.properties = {
            moveSpeed: 1.0,
            interactionRadius: 1.5,
            sightRadius: 10,
            wanderRadius: 5,
            minStateTime: 2, // Minimum time to stay in a state
            maxIdleTime: 5,  // Maximum time to stay idle
            maxWanderTime: 10, // Maximum time to wander
            workStartHour: 8, // Hour to start working
            workEndHour: 18,  // Hour to end working
            homePosition: { x: 0, y: 0, z: 0 },
            workPosition: { x: 0, y: 0, z: 0 }
        };
        
        // Set behavior properties based on type
        this.setBehaviorByType(type);
    }
    
    /**
     * Set behavior properties based on type
     * @param {string} type - The behavior type
     */
    setBehaviorByType(type) {
        switch (type) {
            case 'farmer':
                this.properties.moveSpeed = 0.8;
                this.properties.workPosition = { x: 15, y: 0, z: 15 }; // Farm position
                this.properties.homePosition = { x: -10, y: 0, z: -10 }; // Home position
                this.properties.workStartHour = 6; // Start work early
                this.properties.workEndHour = 18; // End work at 6 PM
                break;
            case 'guard':
                this.properties.moveSpeed = 1.2;
                this.properties.sightRadius = 15;
                this.properties.workPosition = { x: 0, y: 0, z: 0 }; // Village center
                this.properties.homePosition = { x: -5, y: 0, z: 5 }; // Guard post
                this.properties.workStartHour = 8;
                this.properties.workEndHour = 20; // Guards work later
                break;
            case 'merchant':
                this.properties.moveSpeed = 0.7;
                this.properties.workPosition = { x: 5, y: 0, z: 5 }; // Market position
                this.properties.homePosition = { x: -8, y: 0, z: 8 }; // Home position
                this.properties.workStartHour = 9; // Start work later
                this.properties.workEndHour = 17; // End work earlier
                break;
            default:
                // Default behavior properties
                break;
        }
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
                    case 'moving_to_work':
                    case 'moving_to_home':
                    case 'wandering':
                        appearance.setAnimationState('walking');
                        break;
                    case 'working':
                        if (this.type === 'farmer') {
                            appearance.setAnimationState('farming');
                        } else {
                            appearance.setAnimationState('idle');
                        }
                        break;
                    case 'idle':
                    case 'resting':
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
            case 'wait':
                taskCompleted = this.processWaitTask(task, deltaTime);
                break;
            case 'work':
                taskCompleted = this.processWorkTask(task, deltaTime, hour);
                break;
            case 'follow_path':
                taskCompleted = this.processFollowPathTask(task, deltaTime);
                break;
            case 'follow_player':
                taskCompleted = this.processFollowPlayerTask(task, deltaTime);
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
        
        // Log task processing
        console.log(`${this.entity.type} ${this.entity.id} moving to (${this.targetPosition.x.toFixed(2)}, ${this.targetPosition.z.toFixed(2)})`);
        
        // Move toward target with increased speed
        const speed = this.properties.moveSpeed * 2; // Double the speed for more visible movement
        const reached = position.moveToward(
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z,
            speed
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
     * Process a work task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} hour - Current hour of the day
     * @returns {boolean} True if task was completed
     */
    processWorkTask(task, deltaTime, hour) {
        // Change state to working
        this.changeState('working');
        
        // Check if work hours are over
        if (hour >= this.properties.workEndHour) {
            return true;
        }
        
        // For farmers, move around the farm area slightly
        if (this.type === 'farmer') {
            const position = this.entity.getComponent('position');
            if (position) {
                // Every few seconds, pick a new spot to work
                if (this.stateTime > 5) {
                    const farmCenter = this.properties.workPosition;
                    const offsetX = (Math.random() - 0.5) * 8;
                    const offsetZ = (Math.random() - 0.5) * 8;
                    
                    this.targetPosition = {
                        x: farmCenter.x + offsetX,
                        y: farmCenter.y,
                        z: farmCenter.z + offsetZ
                    };
                    
                    this.stateTime = 0;
                }
                
                // Move toward the target position
                position.moveToward(
                    this.targetPosition.x,
                    this.targetPosition.z,
                    this.properties.moveSpeed * 0.5 // Move slower while working
                );
            }
        }
        
        return false; // Work task continues until work hours are over
    }
    
    /**
     * Process a follow_path task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processFollowPathTask(task, deltaTime) {
        const position = this.entity.getComponent('position');
        if (!position) return true;
        
        // If no waypoints, complete the task
        if (!task.data.waypoints || task.data.waypoints.length === 0) {
            return true;
        }
        
        // If first time processing this task, set waypoints
        if (this.waypoints.length === 0) {
            this.waypoints = task.data.waypoints;
            this.currentWaypoint = 0;
        }
        
        // Change state to walking
        this.changeState('walking');
        
        // Get current waypoint
        const waypoint = this.waypoints[this.currentWaypoint];
        
        // Move toward current waypoint
        const reached = position.moveToward(
            waypoint.x,
            waypoint.z,
            this.properties.moveSpeed
        );
        
        // If reached waypoint, move to next one
        if (reached) {
            this.currentWaypoint++;
            
            // If reached last waypoint, complete the task
            if (this.currentWaypoint >= this.waypoints.length) {
                this.waypoints = [];
                this.currentWaypoint = 0;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Process a follow_player task
     * @param {Object} task - The task to process
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} True if task was completed
     */
    processFollowPlayerTask(task, deltaTime) {
        const position = this.entity.getComponent('position');
        if (!position || !this.entity.world || !this.entity.world.camera) return true;
        
        // Change state to walking
        this.changeState('walking');
        
        // Get camera position (player position)
        const cameraPosition = this.entity.world.camera.position;
        
        // Calculate distance to player
        const dx = cameraPosition.x - position.x;
        const dz = cameraPosition.z - position.z;
        const distanceSquared = dx * dx + dz * dz;
        
        // If too far from player, move closer
        if (distanceSquared > 9) { // Keep 3 units away
            // Move toward player
            position.moveToward(
                cameraPosition.x,
                cameraPosition.y,
                cameraPosition.z,
                this.properties.moveSpeed
            );
        } else if (distanceSquared < 4) { // If too close, back up
            // Move away from player
            const direction = Math.atan2(dx, dz) + Math.PI; // Opposite direction
            position.moveInDirection(direction, this.properties.moveSpeed * 0.5);
        } else {
            // Just stand and face the player
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
     * Update daily routine based on time of day
     * @param {number} hour - Current hour of the day
     */
    updateDailyRoutine(hour) {
        // Clear current tasks
        this.clearTasks();
        
        // Add some randomness to work and home positions to avoid NPCs clustering
        const randomOffsetX = (Math.random() * 4) - 2; // -2 to 2
        const randomOffsetZ = (Math.random() * 4) - 2; // -2 to 2
        
        if (hour >= this.properties.workStartHour && hour < this.properties.workEndHour) {
            // Work time
            console.log(`${this.entity.type} ${this.entity.id} should be working at hour ${hour}`);
            
            // First move to work location with slight randomness
            this.addTask({
                type: 'move_to',
                data: { 
                    position: {
                        x: this.properties.workPosition.x + randomOffsetX,
                        y: this.properties.workPosition.y,
                        z: this.properties.workPosition.z + randomOffsetZ
                    }
                }
            });
            
            // Then start working
            this.addTask({
                type: 'work',
                data: { duration: 300 } // Work for a shorter time to make movement more frequent
            });
            
            // Add occasional wandering
            this.addTask({
                type: 'move_to',
                data: { 
                    position: {
                        x: this.properties.workPosition.x + (Math.random() * 8) - 4,
                        y: this.properties.workPosition.y,
                        z: this.properties.workPosition.z + (Math.random() * 8) - 4
                    }
                }
            });
            
            this.changeState('moving_to_work');
            console.log(`${this.entity.type} ${this.entity.id} is now moving to work`);
        } else {
            // Rest time
            console.log(`${this.entity.type} ${this.entity.id} should be resting at hour ${hour}`);
            
            // First move to home location with slight randomness
            this.addTask({
                type: 'move_to',
                data: { 
                    position: {
                        x: this.properties.homePosition.x + randomOffsetX,
                        y: this.properties.homePosition.y,
                        z: this.properties.homePosition.z + randomOffsetZ
                    }
                }
            });
            
            // Then rest
            this.addTask({
                type: 'wait',
                data: { duration: 300 } // Rest for a shorter time
            });
            
            // Add occasional wandering around home
            this.addTask({
                type: 'move_to',
                data: { 
                    position: {
                        x: this.properties.homePosition.x + (Math.random() * 6) - 3,
                        y: this.properties.homePosition.y,
                        z: this.properties.homePosition.z + (Math.random() * 6) - 3
                    }
                }
            });
            
            this.changeState('moving_to_home');
            console.log(`${this.entity.type} ${this.entity.id} is now moving home`);
        }
    }
    
    /**
     * Find nearby animals
     * @param {number} radius - Search radius
     * @returns {Array<Entity>} Nearby animals
     */
    findNearbyAnimals(radius = 10) {
        if (!this.entity || !this.entity.world) return [];
        
        const position = this.entity.getComponent('position');
        if (!position) return [];
        
        const nearbyAnimals = [];
        
        for (const otherEntity of this.entity.world.entities) {
            if (otherEntity === this.entity) continue;
            
            // Only interested in animals
            if (!otherEntity.species) continue;
            
            const otherPosition = otherEntity.getComponent('position');
            if (!otherPosition) continue;
            
            // Calculate distance
            const dx = position.x - otherPosition.x;
            const dz = position.z - otherPosition.z;
            const distanceSquared = dx * dx + dz * dz;
            
            // Check if within radius
            if (distanceSquared <= radius * radius) {
                nearbyAnimals.push(otherEntity);
            }
        }
        
        return nearbyAnimals;
    }
    
    /**
     * Interact with a nearby animal
     * @param {Entity} animal - The animal to interact with
     */
    interactWithAnimal(animal) {
        if (!animal || !animal.species) return;
        
        const position = this.entity.getComponent('position');
        const animalPosition = animal.getComponent('position');
        if (!position || !animalPosition) return;
        
        // Calculate direction to animal
        const dx = animalPosition.x - position.x;
        const dz = animalPosition.z - position.z;
        
        // Face the animal
        position.direction = Math.atan2(dx, dz);
        
        // Different interactions based on animal species and NPC type
        if (animal.species === 'domestic') {
            // Pet the animal
            console.log(`${this.entity.type} ${this.entity.id} is petting ${animal.type} ${animal.name}`);
            
            // If it's a farmer, they might feed domestic animals
            if (this.entity.type === 'farmer') {
                console.log(`${this.entity.type} ${this.entity.id} is feeding ${animal.type} ${animal.name}`);
                
                // Reduce animal's hunger if it has that need
                const animalBehavior = animal.getComponent('behavior');
                if (animalBehavior && animalBehavior.needs && animalBehavior.needs.hunger) {
                    animalBehavior.needs.hunger = Math.max(0, animalBehavior.needs.hunger - 30);
                }
            }
        } else if (animal.species === 'livestock') {
            // Farmers tend to livestock
            if (this.entity.type === 'farmer') {
                console.log(`${this.entity.type} ${this.entity.id} is tending to ${animal.type} ${animal.name}`);
                
                // Reduce animal's hunger if it has that need
                const animalBehavior = animal.getComponent('behavior');
                if (animalBehavior && animalBehavior.needs && animalBehavior.needs.hunger) {
                    animalBehavior.needs.hunger = Math.max(0, animalBehavior.needs.hunger - 20);
                }
            }
        } else if (animal.species === 'wild') {
            // Guards might chase away wild animals
            if (this.entity.type === 'guard') {
                console.log(`${this.entity.type} ${this.entity.id} is chasing away ${animal.type} ${animal.name}`);
                
                // Make the animal run away
                const animalBehavior = animal.getComponent('behavior');
                if (animalBehavior) {
                    // Clear animal's tasks
                    animalBehavior.clearTasks();
                    
                    // Add task to run away
                    const runDirection = Math.atan2(-dx, -dz); // Opposite direction
                    const runDistance = 10;
                    const runPosition = {
                        x: animalPosition.x + Math.sin(runDirection) * runDistance,
                        y: animalPosition.y,
                        z: animalPosition.z + Math.cos(runDirection) * runDistance
                    };
                    
                    animalBehavior.addTask({
                        type: 'move_to',
                        data: { position: runPosition }
                    });
                }
            }
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
        
        // Update daily routine based on time of day
        if (this.taskQueue.length === 0) {
            this.updateDailyRoutine(hour);
            console.log(`${this.entity.type} ${this.entity.id} updated daily routine for hour ${hour}, tasks: ${this.taskQueue.length}`);
        }
        
        // Process current task
        const taskCompleted = this.processCurrentTask(deltaTime, hour);
        
        // If task was completed, log it and start next task
        if (taskCompleted) {
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue[0];
                console.log(`${this.entity.type} ${this.entity.id} starting new task: ${nextTask.type}`);
            } else {
                // If no tasks, force a new daily routine update
                this.updateDailyRoutine(hour);
                console.log(`${this.entity.type} ${this.entity.id} has no tasks, forcing daily routine update`);
            }
        }
        
        // Occasionally interact with nearby animals
        if (Math.random() < 0.01) { // 1% chance each update
            const nearbyAnimals = this.findNearbyAnimals(5); // 5 unit radius
            if (nearbyAnimals.length > 0) {
                // Pick a random animal to interact with
                const randomAnimal = nearbyAnimals[Math.floor(Math.random() * nearbyAnimals.length)];
                this.interactWithAnimal(randomAnimal);
            }
        }
        
        // Always add some random movement to make NPCs more lively
        if (Math.random() < 0.05) { // 5% chance each update - much higher
            const position = this.entity.getComponent('position');
            if (position) {
                // Add a larger random velocity
                position.velocityX += (Math.random() * 1.0) - 0.5; // Larger random movement
                position.velocityZ += (Math.random() * 1.0) - 0.5;
                console.log(`Added random movement to ${this.entity.type} ${this.entity.id}`);
            }
        }
        
        // Force position update
        if (this.entity.updatePosition) {
            this.entity.updatePosition();
        }
        
        // Force rotation update
        if (this.entity.updateRotation) {
            this.entity.updateRotation();
        }
    }
}
