/**
 * House building module for the Whiterun-inspired layout
 * Creates Nordic-style houses with various customizations
 */

/**
 * Add a house at the specified position
 * @param {THREE.Group} parent - The parent group to add the house to
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} scale - House scale
 * @param {number} rotation - House rotation in radians
 * @param {number} [angle] - Optional angle for houses in a circular pattern
 * @returns {THREE.Group} The created house group
 */
function addHouse(parent, x, z, scale, rotation, angle) {
    // Generate a unique ID for this house based on its position
    const houseId = window.LabelUtils ? window.LabelUtils.generateId('house', x, z, angle) : `H${Math.floor(Math.random() * 1000)}`;
    
    // Skip houses H5 and H10 as requested
    if (houseId === 'H5' || houseId === 'H10') {
        if (window.Logger) {
            Logger.info(`Skipping house ${houseId} at position ${x}, ${z}`);
        } else {
            console.log(`Skipping house ${houseId} at position ${x}, ${z}`);
        }
        return null;
    }
    
    // Create house group
    const house = new THREE.Group();
    house.userData = { id: houseId, type: 'house' };
    
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
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4d2600, // Dark brown
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 1.51); // Front of house, slightly above ground
    door.castShadow = true;
    house.add(door);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(0.7, 0.7);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xadd8e6, // Light blue
        roughness: 0.3,
        metalness: 0.5,
        side: THREE.DoubleSide
    });
    
    // Front windows
    const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow1.position.set(-1, 1.2, 1.51); // Left side of front
    frontWindow1.castShadow = true;
    house.add(frontWindow1);
    
    const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow2.position.set(1, 1.2, 1.51); // Right side of front
    frontWindow2.castShadow = true;
    house.add(frontWindow2);
    
    // Side windows
    const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow1.position.set(2.01, 1.2, 0); // Right side
    sideWindow1.rotation.y = Math.PI / 2; // Rotate to face outward
    sideWindow1.castShadow = true;
    house.add(sideWindow1);
    
    const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow2.position.set(-2.01, 1.2, 0); // Left side
    sideWindow2.rotation.y = Math.PI / 2; // Rotate to face outward
    sideWindow2.castShadow = true;
    house.add(sideWindow2);
    
    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
    const chimneyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000, // Dark red
        roughness: 0.9,
        metalness: 0.1
    });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1, 3.5, -0.5); // Top right of roof
    chimney.castShadow = true;
    house.add(chimney);
    
    // Position and scale house
    house.position.set(x, 0, z);
    house.rotation.y = rotation;
    house.scale.set(scale, scale, scale);
    
    // Add to parent group
    parent.add(house);
    
    // Add label to house if LabelUtils is available
    if (window.LabelUtils) {
        window.LabelUtils.addLabelToObject(house, houseId, 4 * scale, 0.5 * scale);
        
        if (window.Logger) {
            Logger.debug(`Added house ${houseId} at position ${x}, ${z}`);
        } else {
            console.log(`Added house ${houseId} at position ${x}, ${z}`);
        }
    }
    
    return house;
}

/**
 * Add houses in a circular pattern around a central point
 * @param {THREE.Group} parent - The parent group to add houses to
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerZ - Z coordinate of the center
 * @param {number} radius - Radius of the circular layout
 */
function addHousesInCircle(parent, centerX, centerZ, radius) {
    // Add houses in a circular pattern
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        // Skip positions where other buildings will be
        if (Math.abs(angle - Math.PI / 2) < 0.5) continue; // Skip blacksmith area
        if (Math.abs(angle - Math.PI) < 0.8) continue; // Skip market area
        if (Math.abs(angle) < 0.3) continue; // Skip entrance area
        
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        
        // Randomize house size and rotation
        const scale = 0.8 + Math.random() * 0.4;
        const rotation = angle + Math.PI + (Math.random() * 0.2 - 0.1);
        
        // Add house with angle parameter for consistent ID generation
        const house = addHouse(parent, x, z, scale, rotation, angle);
        
        // Log if house was skipped (H5)
        if (!house && window.Logger) {
            Logger.info(`House at angle ${angle.toFixed(2)} was skipped`);
        }
    }
}

/**
 * Add houses in the inner area of the town
 * @param {THREE.Group} parent - The parent group to add houses to
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerZ - Z coordinate of the center
 * @param {number} count - Number of houses to add
 */
function addInnerHouses(parent, centerX, centerZ, count) {
    // Add houses in the inner area
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = 10 + Math.random() * 5;
        const x = centerX + Math.cos(angle) * innerRadius;
        const z = centerZ + Math.sin(angle) * innerRadius;
        
        const scale = 0.7 + Math.random() * 0.3;
        const rotation = angle + Math.PI + (Math.random() * 0.4 - 0.2);
        
        // Change the color of the first inner house to bright red
        if (i === 0) {
            // Pass angle for consistent ID generation
            const house = addHouseWithCustomColor(parent, x, z, scale, rotation, 0xff0000, angle); // Bright red
            
            if (window.Logger) {
                if (house) {
                    Logger.info(`Changed inner house ${i} to red at position ${x}, ${z}`);
                } else {
                    Logger.info(`Skipped red inner house at position ${x}, ${z}`);
                }
            } else {
                if (house) {
                    console.log(`Changed inner house ${i} to red at position ${x}, ${z}`);
                } else {
                    console.log(`Skipped red inner house at position ${x}, ${z}`);
                }
            }
        } else {
            // Pass angle for consistent ID generation
            addHouse(parent, x, z, scale, rotation, angle);
        }
    }
}

/**
 * Add a house with a custom color
 * @param {THREE.Group} parent - The parent group to add the house to
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} scale - House scale
 * @param {number} rotation - House rotation in radians
 * @param {number} color - House color in hex format
 * @param {number} [angle] - Optional angle for houses in a circular pattern
 * @returns {THREE.Group} The created house group
 */
function addHouseWithCustomColor(parent, x, z, scale, rotation, color, angle) {
    // Generate a unique ID for this house based on its position
    const houseId = window.LabelUtils ? window.LabelUtils.generateId('house', x, z, angle) : `H${Math.floor(Math.random() * 1000)}`;
    
    // Skip houses H5 and H10 as requested
    if (houseId === 'H5' || houseId === 'H10') {
        if (window.Logger) {
            Logger.info(`Skipping custom colored house ${houseId} at position ${x}, ${z}`);
        } else {
            console.log(`Skipping custom colored house ${houseId} at position ${x}, ${z}`);
        }
        return null;
    }
    
    // Create house group
    const house = new THREE.Group();
    house.userData = { id: houseId, type: 'house' };
    
    // House base (walls) with custom color
    const baseGeometry = new THREE.BoxGeometry(4, 2, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: color, // Custom color
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
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4d2600, // Dark brown
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 1.51); // Front of house, slightly above ground
    door.castShadow = true;
    house.add(door);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(0.7, 0.7);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xadd8e6, // Light blue
        roughness: 0.3,
        metalness: 0.5,
        side: THREE.DoubleSide
    });
    
    // Front windows
    const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow1.position.set(-1, 1.2, 1.51); // Left side of front
    frontWindow1.castShadow = true;
    house.add(frontWindow1);
    
    const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow2.position.set(1, 1.2, 1.51); // Right side of front
    frontWindow2.castShadow = true;
    house.add(frontWindow2);
    
    // Side windows
    const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow1.position.set(2.01, 1.2, 0); // Right side
    sideWindow1.rotation.y = Math.PI / 2; // Rotate to face outward
    sideWindow1.castShadow = true;
    house.add(sideWindow1);
    
    const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow2.position.set(-2.01, 1.2, 0); // Left side
    sideWindow2.rotation.y = Math.PI / 2; // Rotate to face outward
    sideWindow2.castShadow = true;
    house.add(sideWindow2);
    
    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
    const chimneyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000, // Dark red
        roughness: 0.9,
        metalness: 0.1
    });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1, 3.5, -0.5); // Top right of roof
    chimney.castShadow = true;
    house.add(chimney);
    
    // Position and scale house
    house.position.set(x, 0, z);
    house.rotation.y = rotation;
    house.scale.set(scale, scale, scale);
    
    // Add to parent group
    parent.add(house);
    
    // Add label to house if LabelUtils is available
    if (window.LabelUtils) {
        window.LabelUtils.addLabelToObject(house, houseId, 4 * scale, 0.5 * scale);
        
        if (window.Logger) {
            Logger.debug(`Added custom colored house ${houseId} at position ${x}, ${z}`);
        } else {
            console.log(`Added custom colored house ${houseId} at position ${x}, ${z}`);
        }
    }
    
    return house;
}

// Export functions
window.HouseBuilder = {
    addHouse,
    addHousesInCircle,
    addInnerHouses,
    addHouseWithCustomColor
};
