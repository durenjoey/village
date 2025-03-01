/**
 * Blacksmith building module for the Whiterun-inspired layout
 * Creates a blacksmith shop with forge, anvil, and other elements
 */

/**
 * Add a blacksmith shop at the specified position
 * @param {THREE.Group} parent - The parent group to add the blacksmith to
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} rotation - Blacksmith rotation in radians
 * @returns {THREE.Group} The created blacksmith group
 */
function addBlacksmith(parent, x, z, rotation) {
    // Create blacksmith group
    const blacksmith = new THREE.Group();
    
    // Main building
    const buildingGeometry = new THREE.BoxGeometry(5, 3, 4);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.5; // Half height
    building.castShadow = true;
    building.receiveShadow = true;
    blacksmith.add(building);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(4, 2.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x3c280d, // Dark brown
        roughness: 0.9,
        metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4.25; // Above building
    roof.rotation.y = Math.PI / 4; // Rotate 45 degrees
    roof.castShadow = true;
    blacksmith.add(roof);
    
    // Forge (outside)
    const forgeGeometry = new THREE.BoxGeometry(2, 1, 2);
    const forgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555, // Dark gray
        roughness: 0.9,
        metalness: 0.5
    });
    const forge = new THREE.Mesh(forgeGeometry, forgeMaterial);
    forge.position.set(3.5, 0.5, 2); // Outside the building
    forge.castShadow = true;
    forge.receiveShadow = true;
    blacksmith.add(forge);
    
    // Anvil
    const anvilGeometry = new THREE.BoxGeometry(0.6, 0.4, 1.2);
    const anvilMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark gray
        roughness: 0.7,
        metalness: 0.8
    });
    const anvil = new THREE.Mesh(anvilGeometry, anvilMaterial);
    anvil.position.set(3.5, 1.2, 0); // Outside the building
    anvil.castShadow = true;
    anvil.receiveShadow = true;
    blacksmith.add(anvil);
    
    // Chimney with smoke
    const chimneyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
    const chimneyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000, // Dark red
        roughness: 0.9,
        metalness: 0.1
    });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1.5, 5.5, 0); // On the roof
    chimney.castShadow = true;
    blacksmith.add(chimney);
    
    // Add some tools
    addBlacksmithTools(blacksmith);
    
    // Position and rotate blacksmith
    blacksmith.position.set(x, 0, z);
    blacksmith.rotation.y = rotation;
    
    // Add to parent group
    parent.add(blacksmith);
    
    return blacksmith;
}

/**
 * Add tools and details to the blacksmith shop
 * @param {THREE.Group} blacksmith - The blacksmith group to add tools to
 */
function addBlacksmithTools(blacksmith) {
    // Add a workbench
    const benchGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const benchMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const workbench = new THREE.Mesh(benchGeometry, benchMaterial);
    workbench.position.set(2, 0.4, -1.5); // Inside the building
    workbench.castShadow = true;
    workbench.receiveShadow = true;
    blacksmith.add(workbench);
    
    // Add a hammer
    const hammerHandleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const hammerHeadGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.3);
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555, // Dark gray
        roughness: 0.7,
        metalness: 0.8
    });
    
    const hammerHandle = new THREE.Mesh(hammerHandleGeometry, woodMaterial);
    const hammerHead = new THREE.Mesh(hammerHeadGeometry, metalMaterial);
    
    hammerHandle.rotation.x = Math.PI / 2;
    hammerHead.position.set(0, 0.25, 0);
    
    const hammer = new THREE.Group();
    hammer.add(hammerHandle);
    hammer.add(hammerHead);
    hammer.position.set(3.5, 1.4, 0.3);
    hammer.rotation.z = Math.PI / 6;
    hammer.castShadow = true;
    
    blacksmith.add(hammer);
    
    // Add a bucket
    const bucketGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.5, 8);
    const bucketMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
    bucket.position.set(3, 0.25, 2.5);
    bucket.castShadow = true;
    bucket.receiveShadow = true;
    blacksmith.add(bucket);
}

// Export functions
window.BlacksmithBuilder = {
    addBlacksmith
};
