/**
 * Utility functions for creating and managing labels in the 3D scene
 */

// Counter objects to track IDs for different entity types
const idCounters = {
    building: 0,
    house: 0,
    tree: 0,
    market: 0,
    blacksmith: 0,
    temple: 0
};

/**
 * Generate a unique ID for an entity type
 * @param {string} type - The type of entity (building, house, tree, etc.)
 * @returns {string} A unique ID with prefix (e.g., H1, T2, B3)
 */
function generateId(type) {
    // Increment the counter for this type
    idCounters[type] = (idCounters[type] || 0) + 1;
    
    // Generate ID with prefix
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
    
    return `${prefix}${idCounters[type]}`;
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
    generateId,
    createLabel,
    addLabelToObject
};
