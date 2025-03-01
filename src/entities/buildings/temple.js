/**
 * Temple module for the Whiterun-inspired layout
 * Creates a religious temple with columns and distinctive architecture
 */

/**
 * Add a temple at the specified position
 * @param {THREE.Group} parent - The parent group to add the temple to
 * @param {number} x - X position
 * @param {number} z - Z position
 * @param {number} rotation - Temple rotation in radians
 * @returns {THREE.Group} The created temple group
 */
function addTemple(parent, x, z, rotation) {
    // Create temple group
    const temple = new THREE.Group();
    
    // Temple base (platform)
    const baseGeometry = new THREE.BoxGeometry(12, 1, 12);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC, // Light gray
        roughness: 0.9,
        metalness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.5; // Half height
    base.castShadow = true;
    base.receiveShadow = true;
    temple.add(base);
    
    // Temple steps
    const stepsGeometry = new THREE.BoxGeometry(14, 0.5, 3);
    const steps = new THREE.Mesh(stepsGeometry, baseMaterial);
    steps.position.set(0, 0.25, 7.5); // Front of temple
    steps.castShadow = true;
    steps.receiveShadow = true;
    temple.add(steps);
    
    // Temple main building
    const buildingGeometry = new THREE.BoxGeometry(10, 6, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0xE5E5E5, // Off-white
        roughness: 0.8,
        metalness: 0.2
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 4; // Above platform
    building.castShadow = true;
    building.receiveShadow = true;
    temple.add(building);
    
    // Temple roof
    const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x4682B4, // Steel blue
        roughness: 0.7,
        metalness: 0.3
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9; // Above building
    roof.rotation.y = Math.PI / 4; // Rotate 45 degrees
    roof.castShadow = true;
    temple.add(roof);
    
    // Add temple details
    addTempleDetails(temple);
    
    // Position and rotate temple
    temple.position.set(x, 0, z);
    temple.rotation.y = rotation;
    
    // Add to parent group
    parent.add(temple);
    
    return temple;
}

/**
 * Add details to the temple
 * @param {THREE.Group} temple - The temple group to add details to
 */
function addTempleDetails(temple) {
    // Temple columns
    const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD, // Light gray
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Add columns at the front
    const columnPositions = [
        { x: 4, z: 4 },
        { x: -4, z: 4 },
        { x: 4, z: -4 },
        { x: -4, z: -4 }
    ];
    
    for (const pos of columnPositions) {
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(pos.x, 4, pos.z); // At corners
        column.castShadow = true;
        temple.add(column);
    }
    
    // Temple door
    const doorGeometry = new THREE.PlaneGeometry(2, 4);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 3, 5.01); // Front of temple
    door.castShadow = true;
    temple.add(door);
    
    // Temple windows
    const windowGeometry = new THREE.PlaneGeometry(1, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xadd8e6, // Light blue
        roughness: 0.3,
        metalness: 0.5,
        side: THREE.DoubleSide
    });
    
    // Add windows on sides
    const windowPositions = [
        { x: 5.01, z: 0, rotation: Math.PI / 2 },
        { x: -5.01, z: 0, rotation: Math.PI / 2 },
        { x: 0, z: -5.01, rotation: 0 }
    ];
    
    for (const pos of windowPositions) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(pos.x, 3, pos.z);
        window.rotation.y = pos.rotation;
        window.castShadow = true;
        temple.add(window);
    }
    
    // Add decorative elements
    addTempleDecorations(temple);
}

/**
 * Add decorative elements to the temple
 * @param {THREE.Group} temple - The temple group to add decorations to
 */
function addTempleDecorations(temple) {
    // Add a statue on the platform
    const statueBaseGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const statueFigureGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const statueHeadGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    
    const statueMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD, // Light gray
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create statue parts
    const statueBase = new THREE.Mesh(statueBaseGeometry, statueMaterial);
    const statueFigure = new THREE.Mesh(statueFigureGeometry, statueMaterial);
    const statueHead = new THREE.Mesh(statueHeadGeometry, statueMaterial);
    
    // Position statue parts
    statueBase.position.set(0, 1.25, 0);
    statueFigure.position.set(0, 2.5, 0);
    statueHead.position.set(0, 3.5, 0);
    
    // Create statue group
    const statue = new THREE.Group();
    statue.add(statueBase);
    statue.add(statueFigure);
    statue.add(statueHead);
    
    // Position statue in temple
    statue.position.set(0, 0, -2);
    statue.castShadow = true;
    
    temple.add(statue);
    
    // Add decorative pillars at the entrance
    const pillarGeometry = new THREE.BoxGeometry(1, 3, 1);
    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC, // Light gray
        roughness: 0.9,
        metalness: 0.2
    });
    
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-5, 2, 6);
    leftPillar.castShadow = true;
    temple.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(5, 2, 6);
    rightPillar.castShadow = true;
    temple.add(rightPillar);
    
    // Add decorative orbs on top of pillars
    const orbGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Gold
        roughness: 0.3,
        metalness: 0.8
    });
    
    const leftOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    leftOrb.position.set(-5, 4, 6);
    leftOrb.castShadow = true;
    temple.add(leftOrb);
    
    const rightOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    rightOrb.position.set(5, 4, 6);
    rightOrb.castShadow = true;
    temple.add(rightOrb);
}

// Export functions
window.TempleBuilder = {
    addTemple
};
