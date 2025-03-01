/**
 * Time system for managing simulation time and day/night cycle
 */
class TimeSystem extends System {
    /**
     * Create a new time system
     */
    constructor() {
        super('time');
        
        // Time configuration
        this.ticksPerHour = 60; // 60 ticks = 1 in-game hour
        this.hoursPerDay = 24;  // 24 hours = 1 in-game day
        this.daysPerYear = 365; // 365 days = 1 in-game year
        
        // Current time state
        this.currentTick = 0;
        this.timeSpeed = 1;     // Default time speed multiplier
        
        // Time of day ranges
        this.dayStartHour = 6;  // 6 AM
        this.dayEndHour = 18;   // 6 PM
        
        // UI element for displaying time
        this.timeDisplay = document.getElementById('time-display');
    }
    
    /**
     * Get the current in-game hour (0-23)
     * @returns {number} The current hour
     */
    getCurrentHour() {
        return Math.floor((this.currentTick / this.ticksPerHour) % this.hoursPerDay);
    }
    
    /**
     * Get the current in-game day (0-364)
     * @returns {number} The current day
     */
    getCurrentDay() {
        return Math.floor(this.currentTick / (this.ticksPerHour * this.hoursPerDay)) % this.daysPerYear;
    }
    
    /**
     * Get the current in-game year
     * @returns {number} The current year
     */
    getCurrentYear() {
        return Math.floor(this.currentTick / (this.ticksPerHour * this.hoursPerDay * this.daysPerYear)) + 1;
    }
    
    /**
     * Check if it's currently daytime
     * @returns {boolean} True if it's daytime
     */
    isDaytime() {
        const hour = this.getCurrentHour();
        return hour >= this.dayStartHour && hour < this.dayEndHour;
    }
    
    /**
     * Get the current time of day as a normalized value (0-1)
     * 0 = midnight, 0.5 = noon, 1 = midnight again
     * @returns {number} Normalized time of day
     */
    getNormalizedTimeOfDay() {
        const hour = this.getCurrentHour();
        const minute = (this.currentTick % this.ticksPerHour) / this.ticksPerHour;
        return (hour + minute) / this.hoursPerDay;
    }
    
    /**
     * Get the sun position factor (-1 to 1)
     * -1 = midnight, 0 = sunrise/sunset, 1 = noon
     * @returns {number} Sun position factor
     */
    getSunPositionFactor() {
        const normalizedTime = this.getNormalizedTimeOfDay();
        // Convert from 0-1 range to -1 to 1 range, with noon at 1 and midnight at -1
        return Math.cos((normalizedTime * 2 - 0.5) * Math.PI);
    }
    
    /**
     * Set the time speed multiplier
     * @param {number} speed - The new time speed multiplier
     */
    setTimeSpeed(speed) {
        this.timeSpeed = Math.max(0, speed);
    }
    
    /**
     * Advance the simulation time by one tick
     * @param {number} deltaTime - Time since last update in seconds
     */
    advanceTime(deltaTime) {
        // Store previous hour for change detection
        const prevHour = this.getCurrentHour();
        
        // Advance time based on real time and speed multiplier - much faster
        this.currentTick += deltaTime * this.timeSpeed * 30; // Multiply by 30 for faster time progression
        
        // Update time display
        this.updateTimeDisplay();
        
        // Get current hour after update
        const currentHour = this.getCurrentHour();
        
        // Log time changes when hour changes
        if (prevHour !== currentHour) {
            console.log(`Time changed to: Day ${this.getCurrentDay() + 1}, ${currentHour}:00`);
            
            // Force behavior updates for all entities when hour changes
            if (this.world && this.world.entities) {
                for (const entity of this.world.entities) {
                    if (entity.type === 'farmer' || entity.type === 'guard' || entity.type === 'merchant') {
                        const behavior = entity.getComponent('behavior');
                        if (behavior) {
                            behavior.updateDailyRoutine(currentHour);
                            console.log(`Updated daily routine for ${entity.type} ${entity.id} due to hour change`);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Update the time display UI element
     */
    updateTimeDisplay() {
        if (this.timeDisplay) {
            const day = this.getCurrentDay() + 1; // 1-indexed for display
            const hour = this.getCurrentHour();
            const minute = Math.floor((this.currentTick % this.ticksPerHour) / this.ticksPerHour * 60);
            
            // Format hour as 12-hour time with AM/PM
            const hour12 = hour % 12 || 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            
            // Format time as "Day X, HH:MM AM/PM"
            this.timeDisplay.textContent = `Day ${day}, ${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        }
    }
    
    /**
     * Update the time system
     * @param {Array<Entity>} entities - All entities in the world
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(entities, deltaTime) {
        // Store world reference for use in advanceTime
        this.world = this.world || { entities };
        
        // Advance time
        this.advanceTime(deltaTime);
    }
}
