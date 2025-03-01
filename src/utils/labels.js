/**
 * Utility functions for creating and managing labels in the 3D scene
 */

/**
 * Generate a unique ID for an entity based on its position and type
 * @param {string} type - The type of entity (building, house, tree, etc.)
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @param {number} [angle] - Optional angle for circular arrangements
 * @returns {string} A unique ID with prefix (e.g., H1, T2, B3)
 */
function generateAbsoluteId(type, x, z, angle) {
    // Generate prefix based on type
    let prefix = '';
    switch (type) {
        case 'house':
            prefix = 'H';
            break;
        case 'tree':
            prefix = 'T';
            break;
        case 'market':
            prefix = 'M';
            break;
        case 'blacksmith':
            prefix = 'BS';
            break;
        case 'temple':
            prefix = 'TP';
            break;
        default:
            prefix = 'B'; // Default to Building
    }
    
    // Generate a number based on position
    let number;
    
    if (angle !== undefined) {
        // For objects arranged in a circle (like houses)
        // Convert angle to a number between 1-12 (like a clock)
        const clockPosition = Math.floor((angle / (Math.PI * 2)) * 12) + 1;
        number = clockPosition;
    } else {
        // For randomly placed objects (like trees)
        // Use a grid-based system - divide the world into a 10x10 grid
        const gridSize = 10;
        const gridX = Math.floor((x + 50) / gridSize); // Assuming world is -50 to 50
        const gridZ = Math.floor((z + 50) / gridSize);
        
        // Create a unique number from the grid coordinates
        number = gridX * 100 + gridZ;
    }
    
    return `${prefix}${number}`;
}

/**
 * Create a text label for an object
 * @param {string} text - The text to display
 * @param {Object} position - The position to place the label
 * @param {number} position.x - X coordinate
 * @param {number} position.y - Y coordinate
 * @param {number} position.z - Z coordinate
 * @param {number} scale - Scale of the label
 * @returns {THREE.Object3D} The label object
 */
function createLabel(text, position, scale = 1) {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Set up text style
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text with black outline for better visibility
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create sprite material with the texture
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    
    // Create sprite
    const sprite = new THREE.Sprite(material);
    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(scale * 5, scale * 2.5, 1); // Adjust scale for readability
    
    return sprite;
}

/**
 * Add a label to an object
 * @param {THREE.Object3D} object - The object to label
 * @param {string} text - The text to display
 * @param {number} yOffset - Vertical offset for the label
 * @param {number} scale - Scale of the label
 */
function addLabelToObject(object, text, yOffset = 2, scale = 1) {
    // Create label
    // Note: We use local coordinates (0,0,0) for the label position
    // because we're adding it as a child of the object
    const label = createLabel(text, {x: 0, y: yOffset, z: 0}, scale);
    
    // Add label to object
    object.add(label);
    
    // Log label creation
    if (window.Logger) {
        Logger.debug(`Added label "${text}" to object at local position 0, ${yOffset}, 0`);
    } else {
        console.log(`Added label "${text}" to object at local position 0, ${yOffset}, 0`);
    }
    
    return label;
}

// Export functions
window.LabelUtils = {
    generateId: generateAbsoluteId, // Use the new absolute ID function
    createLabel,
    addLabelToObject
};
