/**
 * Math utilities for the simulation
 */
const MathUtils = {
    /**
     * Clamp a value between a minimum and maximum
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Calculate the distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} z1 - Z coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} z2 - Z coordinate of second point
     * @returns {number} Distance between points
     */
    distance: function(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    },
    
    /**
     * Calculate the squared distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} z1 - Z coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} z2 - Z coordinate of second point
     * @returns {number} Squared distance between points
     */
    distanceSquared: function(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return dx * dx + dz * dz;
    },
    
    /**
     * Calculate the direction (angle) from one point to another
     * @param {number} x1 - X coordinate of first point
     * @param {number} z1 - Z coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} z2 - Z coordinate of second point
     * @returns {number} Direction in radians
     */
    direction: function(x1, z1, x2, z2) {
        return Math.atan2(x2 - x1, z2 - z1);
    },
    
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Generate a random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random float
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Generate a random point within a circle
     * @param {number} centerX - X coordinate of circle center
     * @param {number} centerZ - Z coordinate of circle center
     * @param {number} radius - Circle radius
     * @returns {Object} Random point {x, z}
     */
    randomPointInCircle: function(centerX, centerZ, radius) {
        // Generate random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * radius;
        
        // Calculate point
        const x = centerX + Math.sin(angle) * distance;
        const z = centerZ + Math.cos(angle) * distance;
        
        return { x, z };
    },
    
    /**
     * Generate perlin noise
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Noise value (-1 to 1)
     */
    perlinNoise: function(x, y = 0, z = 0) {
        // Simple implementation using simplex noise if available
        if (typeof SimplexNoise !== 'undefined') {
            if (!this.noiseGenerator) {
                this.noiseGenerator = new SimplexNoise();
            }
            return this.noiseGenerator.noise3D(x, y, z);
        }
        
        // Fallback to simple pseudo-random noise
        return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453 % 1;
    },
    
    /**
     * Generate fractal noise (multiple octaves of perlin noise)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @param {number} octaves - Number of octaves
     * @param {number} persistence - Persistence (amplitude multiplier)
     * @param {number} lacunarity - Lacunarity (frequency multiplier)
     * @returns {number} Noise value (-1 to 1)
     */
    fractalNoise: function(x, y = 0, z = 0, octaves = 4, persistence = 0.5, lacunarity = 2) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.perlinNoise(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    },
    
    /**
     * Ease in out function
     * @param {number} t - Value to ease (0-1)
     * @returns {number} Eased value (0-1)
     */
    easeInOut: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
};
