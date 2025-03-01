/**
 * Paths module for the Whiterun-inspired layout
 * Creates paths connecting different areas of the town
 */

/**
 * Add a path between two points
 * @param {THREE.Group} parent - The parent group to add the path to
 * @param {number} x1 - Start X position
 * @param {number} z1 - Start Z position
 * @param {number} x2 - End X position
 * @param {number} z2 - End Z position
 * @param {number} width - Path width
 * @returns {THREE.Mesh} The created path mesh
 */
function addPath(parent, x1, z1, x2, z2, width) {
    // Calculate path length and angle
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    
    // Create path material
    const pathMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    // Create path geometry
    const pathGeometry = new THREE.PlaneGeometry(length, width);
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    
    // Position and rotate path
    path.rotation.x = -Math.PI / 2;
    path.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);
    path.rotation.z = angle;
    path.receiveShadow = true;
    
    // Add to parent group
    parent.add(path);
    
    return path;
}

/**
 * Add a circular path
 * @param {THREE.Group} parent - The parent group to add the path to
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerZ - Z coordinate of the center
 * @param {number} innerRadius - Inner radius of the ring
 * @param {number} outerRadius - Outer radius of the ring
 * @returns {THREE.Mesh} The created circular path mesh
 */
function addCircularPath(parent, centerX, centerZ, innerRadius, outerRadius) {
    // Create path material
    const pathMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    // Create circular path geometry
    const pathGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    
    // Position path
    path.rotation.x = -Math.PI / 2;
    path.position.set(centerX, 0.05, centerZ);
    path.receiveShadow = true;
    
    // Add to parent group
    parent.add(path);
    
    return path;
}

/**
 * Add a complete path system for a Whiterun-inspired layout
 * @param {THREE.Group} parent - The parent group to add paths to
 */
function addWhiterunPaths(parent) {
    // Main circular path
    const centerX = 0;
    const centerZ = 0;
    const outerRadius = 25;
    const innerRadius = 20;
    
    addCircularPath(parent, centerX, centerZ, innerRadius, outerRadius);
    
    // Path to entrance
    addPath(parent, 0, outerRadius, 0, outerRadius + 5, 5);
    
    // Path to temple
    addPath(parent, 0, -outerRadius, 0, -35, 5);
    
    // Path to blacksmith
    addPath(parent, outerRadius * 0.7, outerRadius * 0.7, 25, 5, 3);
    
    // Path to market
    addPath(parent, -outerRadius * 0.7, -outerRadius * 0.7, -15, -5, 3);
    
    // Add some small connecting paths
    addPath(parent, innerRadius * 0.5, 0, 0, innerRadius * 0.5, 2);
    addPath(parent, -innerRadius * 0.5, 0, 0, -innerRadius * 0.5, 2);
}

// Export functions
window.PathBuilder = {
    addPath,
    addCircularPath,
    addWhiterunPaths
};
