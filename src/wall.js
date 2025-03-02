import * as BABYLON from '@babylonjs/core';

export function createStoneWall(scene, ground) {
    console.log("Creating stone wall with gate");
    
    try {
        // Create a parent mesh to hold all wall components
        const wallParent = new BABYLON.Mesh("stoneWall", scene);
        
        // Wall parameters
        const wallPosition = new BABYLON.Vector3(0, 0, -20); // Position the wall in front of the camera
        const wallWidth = 30;  // Total width of the wall
        const wallHeight = 6;  // Height of the wall
        const wallDepth = 1.5; // Thickness of the wall
        const gateWidth = 6;   // Width of the gate opening
        const gateHeight = 4;  // Height of the gate arch
        
        // Create stone material
        const stoneMaterial = createStoneMaterial(scene);
        
        // Create the wall sections
        createWallSections(scene, wallParent, wallPosition, wallWidth, wallHeight, wallDepth, gateWidth, stoneMaterial);
        
        // Create the gate arch
        createGateArch(scene, wallParent, wallPosition, gateWidth, gateHeight, wallDepth, stoneMaterial);
        
        // Create decorative elements
        createDecorativeElements(scene, wallParent, wallPosition, wallWidth, wallHeight, wallDepth, gateWidth, stoneMaterial);
        
        // Position the wall slightly above ground to avoid z-fighting
        wallParent.position.y = 0.01;
        
        console.log("Stone wall created successfully");
        return wallParent;
    } catch (error) {
        console.error("Error creating stone wall:", error);
        return null;
    }
}

// Create the main wall sections (left and right of the gate)
function createWallSections(scene, parent, position, wallWidth, wallHeight, wallDepth, gateWidth, material) {
    // Calculate dimensions for left and right wall sections
    const sectionWidth = (wallWidth - gateWidth) / 2;
    
    // Create left wall section
    const leftWall = BABYLON.MeshBuilder.CreateBox(
        "leftWall",
        {
            width: sectionWidth,
            height: wallHeight,
            depth: wallDepth
        },
        scene
    );
    
    // Position left wall section
    leftWall.position = new BABYLON.Vector3(
        position.x - (gateWidth / 2) - (sectionWidth / 2),
        position.y + (wallHeight / 2),
        position.z
    );
    
    // Create right wall section
    const rightWall = BABYLON.MeshBuilder.CreateBox(
        "rightWall",
        {
            width: sectionWidth,
            height: wallHeight,
            depth: wallDepth
        },
        scene
    );
    
    // Position right wall section
    rightWall.position = new BABYLON.Vector3(
        position.x + (gateWidth / 2) + (sectionWidth / 2),
        position.y + (wallHeight / 2),
        position.z
    );
    
    // Create wall top (crenellations)
    createWallTop(scene, parent, position, wallWidth, wallHeight, wallDepth, gateWidth, material);
    
    // Add stone texture details to make the walls look like they're made of individual stones
    createStoneDetails(scene, leftWall, material);
    createStoneDetails(scene, rightWall, material);
    
    // Parent to the wall
    leftWall.parent = parent;
    rightWall.parent = parent;
    
    // Apply material
    leftWall.material = material;
    rightWall.material = material;
}

// Create the top of the wall with crenellations (battlements)
function createWallTop(scene, parent, position, wallWidth, wallHeight, wallDepth, gateWidth, material) {
    // Calculate dimensions for left and right wall sections
    const sectionWidth = (wallWidth - gateWidth) / 2;
    
    // Number of crenellations per section
    const crenel_count = Math.floor(sectionWidth / 2);
    const crenel_width = sectionWidth / crenel_count;
    const crenel_height = 1.0;
    
    // Create crenellations for left wall
    for (let i = 0; i < crenel_count; i++) {
        // Skip every other position to create the crenellation pattern
        if (i % 2 === 0) {
            const crenel = BABYLON.MeshBuilder.CreateBox(
                `leftCrenel_${i}`,
                {
                    width: crenel_width * 0.8,
                    height: crenel_height,
                    depth: wallDepth
                },
                scene
            );
            
            crenel.position = new BABYLON.Vector3(
                position.x - (gateWidth / 2) - sectionWidth + (i * crenel_width) + (crenel_width / 2),
                position.y + wallHeight + (crenel_height / 2),
                position.z
            );
            
            crenel.material = material;
            crenel.parent = parent;
        }
    }
    
    // Create crenellations for right wall
    for (let i = 0; i < crenel_count; i++) {
        // Skip every other position to create the crenellation pattern
        if (i % 2 === 0) {
            const crenel = BABYLON.MeshBuilder.CreateBox(
                `rightCrenel_${i}`,
                {
                    width: crenel_width * 0.8,
                    height: crenel_height,
                    depth: wallDepth
                },
                scene
            );
            
            crenel.position = new BABYLON.Vector3(
                position.x + (gateWidth / 2) + (i * crenel_width) + (crenel_width / 2),
                position.y + wallHeight + (crenel_height / 2),
                position.z
            );
            
            crenel.material = material;
            crenel.parent = parent;
        }
    }
}

// Create the gate arch
function createGateArch(scene, parent, position, gateWidth, gateHeight, wallDepth, material) {
    // Create the arch using a custom shape
    const archShape = [];
    const archSegments = 12; // Number of segments in the arch
    
    // Create the arch shape (half circle on top of a rectangle)
    for (let i = 0; i <= archSegments; i++) {
        const angle = (Math.PI * i) / archSegments;
        const x = (gateWidth / 2) * Math.cos(angle);
        const y = gateHeight - (gateWidth / 2) + (gateWidth / 2) * Math.sin(angle);
        
        if (y >= 0) { // Only include points above ground
            archShape.push(new BABYLON.Vector3(x, y, 0));
        }
    }
    
    // Add bottom points to complete the shape
    archShape.push(new BABYLON.Vector3(gateWidth / 2, 0, 0));
    archShape.push(new BABYLON.Vector3(-gateWidth / 2, 0, 0));
    
    // Close the shape by connecting back to the first point
    if (archShape.length > 0 && archShape[0]) {
        archShape.push(archShape[0].clone());
    }
    
    // Create extruded shape for the arch
    const archOptions = {
        shape: archShape,
        depth: wallDepth,
        updatable: true,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    };
    
    const arch = BABYLON.MeshBuilder.ExtrudeShape("gateArch", archOptions, scene);
    
    // Position the arch
    arch.position = new BABYLON.Vector3(
        position.x,
        position.y,
        position.z - wallDepth / 2
    );
    
    // Rotate the arch to align with the wall
    arch.rotation.x = Math.PI / 2;
    
    // Apply material
    arch.material = material;
    
    // Parent to the wall
    arch.parent = parent;
}

// Create decorative elements for the wall
function createDecorativeElements(scene, parent, position, wallWidth, wallHeight, wallDepth, gateWidth, material) {
    // Create two towers on either side of the gate
    const towerRadius = 1.5;
    const towerHeight = wallHeight + 2; // Towers are taller than the wall
    
    // Left tower
    const leftTower = BABYLON.MeshBuilder.CreateCylinder(
        "leftTower",
        {
            height: towerHeight,
            diameter: towerRadius * 2,
            tessellation: 16
        },
        scene
    );
    
    // Position left tower
    leftTower.position = new BABYLON.Vector3(
        position.x - (gateWidth / 2) - towerRadius,
        position.y + (towerHeight / 2),
        position.z
    );
    
    // Right tower
    const rightTower = BABYLON.MeshBuilder.CreateCylinder(
        "rightTower",
        {
            height: towerHeight,
            diameter: towerRadius * 2,
            tessellation: 16
        },
        scene
    );
    
    // Position right tower
    rightTower.position = new BABYLON.Vector3(
        position.x + (gateWidth / 2) + towerRadius,
        position.y + (towerHeight / 2),
        position.z
    );
    
    // Create tower tops (cones)
    const leftTowerTop = BABYLON.MeshBuilder.CreateCylinder(
        "leftTowerTop",
        {
            height: 2,
            diameterTop: 0,
            diameterBottom: towerRadius * 2,
            tessellation: 16
        },
        scene
    );
    
    leftTowerTop.position = new BABYLON.Vector3(
        position.x - (gateWidth / 2) - towerRadius,
        position.y + towerHeight + 1,
        position.z
    );
    
    const rightTowerTop = BABYLON.MeshBuilder.CreateCylinder(
        "rightTowerTop",
        {
            height: 2,
            diameterTop: 0,
            diameterBottom: towerRadius * 2,
            tessellation: 16
        },
        scene
    );
    
    rightTowerTop.position = new BABYLON.Vector3(
        position.x + (gateWidth / 2) + towerRadius,
        position.y + towerHeight + 1,
        position.z
    );
    
    // Apply material
    leftTower.material = material;
    rightTower.material = material;
    leftTowerTop.material = material;
    rightTowerTop.material = material;
    
    // Parent to the wall
    leftTower.parent = parent;
    rightTower.parent = parent;
    leftTowerTop.parent = parent;
    rightTowerTop.parent = parent;
}

// Create stone texture details
function createStoneDetails(scene, mesh, material) {
    // We'll use the existing material but add some vertex coloring or normal mapping
    // to give the impression of individual stones
    
    // This would typically involve UV mapping and texturing
    // For now, we'll just ensure the material is applied
    mesh.material = material;
}

// Create a stone material for the wall
function createStoneMaterial(scene) {
    // Create material for the stones
    const stoneMaterial = new BABYLON.StandardMaterial("stoneMaterial", scene);
    
    // Set stone color properties - grayish with slight variations
    stoneMaterial.diffuseColor = new BABYLON.Color3(0.65, 0.65, 0.65);
    stoneMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    stoneMaterial.specularPower = 64;
    
    // Add some ambient lighting to the stones
    stoneMaterial.ambientColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    
    // Add a subtle bump texture for stone detail
    try {
        // Use the grass bump texture for now (could be replaced with a stone texture)
        const bumpTexture = new BABYLON.Texture("textures/grass_bump.jpg", scene);
        bumpTexture.uScale = 2;
        bumpTexture.vScale = 2;
        stoneMaterial.bumpTexture = bumpTexture;
        stoneMaterial.bumpTexture.level = 0.5; // Medium bump effect
    } catch (e) {
        console.warn("Could not load bump texture for stones:", e);
    }
    
    return stoneMaterial;
}
