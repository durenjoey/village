/**
 * Market module for the Whiterun-inspired layout
 * Creates market stands with various items
 */

/**
 * Add a market stand at the specified position
 * @param {THREE.Group} parent - The parent group to add the market stand to
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} rotation - Stand rotation in radians
 * @returns {THREE.Group} The created market stand group
 */
function addMarketStand(parent, x, z, rotation) {
    // Create market stand group
    const stand = new THREE.Group();
    
    // Stand base
    const baseGeometry = new THREE.BoxGeometry(3, 0.2, 2);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.8; // Height of table
    base.castShadow = true;
    base.receiveShadow = true;
    stand.add(base);
    
    // Stand legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b3e1c, // Darker brown
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Add four legs
    const legPositions = [
        { x: 1.3, z: 0.8 },
        { x: 1.3, z: -0.8 },
        { x: -1.3, z: 0.8 },
        { x: -1.3, z: -0.8 }
    ];
    
    for (const pos of legPositions) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, 0.4, pos.z); // Position at corner
        leg.castShadow = true;
        stand.add(leg);
    }
    
    // Awning (canopy)
    const awningGeometry = new THREE.BoxGeometry(3.5, 0.1, 2.5);
    const awningMaterial = new THREE.MeshStandardMaterial({
        color: 0xA52A2A, // Brown-red
        roughness: 0.9,
        metalness: 0.1
    });
    const awning = new THREE.Mesh(awningGeometry, awningMaterial);
    awning.position.y = 2.2; // Above the stand
    awning.castShadow = true;
    stand.add(awning);
    
    // Awning supports
    const supportGeometry = new THREE.BoxGeometry(0.1, 1.4, 0.1);
    const supportMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b3e1c, // Darker brown
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Add four supports
    const supportPositions = [
        { x: 1.5, z: 1 },
        { x: 1.5, z: -1 },
        { x: -1.5, z: 1 },
        { x: -1.5, z: -1 }
    ];
    
    for (const pos of supportPositions) {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(pos.x, 1.5, pos.z); // Position at corner
        support.castShadow = true;
        stand.add(support);
    }
    
    // Add some items on the stand
    addMarketItems(stand);
    
    // Position and rotate stand
    stand.position.set(x, 0, z);
    stand.rotation.y = rotation;
    
    // Add to parent group
    parent.add(stand);
    
    return stand;
}

/**
 * Add items to a market stand
 * @param {THREE.Group} stand - The market stand to add items to
 */
function addMarketItems(stand) {
    // Add some boxes/crates
    const crateGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const crateMaterial = new THREE.MeshStandardMaterial({
        color: 0xCD853F, // Peru (wooden color)
        roughness: 0.9,
        metalness: 0.1
    });
    
    const crate1 = new THREE.Mesh(crateGeometry, crateMaterial);
    crate1.position.set(0.8, 1.1, 0.5); // On the stand
    crate1.castShadow = true;
    stand.add(crate1);
    
    const crate2 = new THREE.Mesh(crateGeometry, crateMaterial);
    crate2.position.set(-0.8, 1.1, -0.5); // On the stand
    crate2.castShadow = true;
    stand.add(crate2);
    
    // Add some fruits (spheres)
    const fruitGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const fruitMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 0.8 }), // Red
        new THREE.MeshStandardMaterial({ color: 0x00FF00, roughness: 0.8 }), // Green
        new THREE.MeshStandardMaterial({ color: 0xFFFF00, roughness: 0.8 })  // Yellow
    ];
    
    // Add a pile of fruits
    for (let i = 0; i < 8; i++) {
        const fruit = new THREE.Mesh(fruitGeometry, fruitMaterials[i % 3]);
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.15;
        fruit.position.set(
            0 + Math.cos(angle) * radius,
            1.1,
            0 + Math.sin(angle) * radius
        );
        fruit.castShadow = true;
        stand.add(fruit);
    }
    
    // Add some bread loaves using CylinderGeometry instead of CapsuleGeometry
    const breadMaterial = new THREE.MeshStandardMaterial({
        color: 0xD2691E, // Chocolate (bread-like color)
        roughness: 0.9,
        metalness: 0.0
    });
    
    // Add a few bread loaves
    for (let i = 0; i < 3; i++) {
        // Create a group for each bread loaf
        const breadGroup = new THREE.Group();
        
        // Main cylinder for the bread body
        const breadBodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        const breadBody = new THREE.Mesh(breadBodyGeometry, breadMaterial);
        breadBody.rotation.z = Math.PI / 2; // Lay flat
        breadGroup.add(breadBody);
        
        // Add spheres at the ends to round it
        const endCapGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        
        const endCap1 = new THREE.Mesh(endCapGeometry, breadMaterial);
        endCap1.position.set(0.15, 0, 0);
        breadGroup.add(endCap1);
        
        const endCap2 = new THREE.Mesh(endCapGeometry, breadMaterial);
        endCap2.position.set(-0.15, 0, 0);
        breadGroup.add(endCap2);
        
        // Position the bread group
        breadGroup.position.set(
            -0.8 + (i * 0.2),
            1.1,
            0.5
        );
        
        // Add shadows
        breadGroup.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
            }
        });
        
        stand.add(breadGroup);
    }
}

/**
 * Add multiple market stands in an area
 * @param {THREE.Group} parent - The parent group to add market stands to
 * @param {number} centerX - X coordinate of the market center
 * @param {number} centerZ - Z coordinate of the market center
 * @param {number} count - Number of stands to add
 */
function addMarketStands(parent, centerX, centerZ, count) {
    // Add several market stands
    for (let i = 0; i < count; i++) {
        const angle = Math.PI / 6 * i - Math.PI / 6;
        const distance = 5;
        const x = centerX + Math.cos(angle) * distance;
        const z = centerZ + Math.sin(angle) * distance;
        
        // Add market stand
        const stand = addMarketStand(parent, x, z, Math.PI / 2 + angle);
        
        // Mark position as occupied in terrain if possible
        // This helps with collision detection for trees
        if (parent.parent && parent.parent.markPositionOccupied) {
            const standRadius = 5; // Increased radius for better collision detection
            parent.parent.markPositionOccupied(x, z, standRadius, 'market_stand');
            
            if (window.Logger) {
                Logger.debug(`Marked market stand position as occupied: ${x}, ${z}`);
            } else {
                console.log(`Marked market stand position as occupied: ${x}, ${z}`);
            }
        }
    }
}

// Export functions
window.MarketBuilder = {
    addMarketStand,
    addMarketStands
};
