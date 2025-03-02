import * as BABYLON from '@babylonjs/core';

export function createNordicCabin(scene, ground) {
    console.log("Creating Skyrim-style Nordic cabin");
    
    try {
        // Create a parent mesh to hold all cabin components
        const cabinParent = new BABYLON.Mesh("nordicCabin", scene);
        
        // Cabin parameters
        const cabinPosition = new BABYLON.Vector3(15, 0, -35); // Position behind and to the right of the wall
        const cabinWidth = 8;    // Width of the cabin
        const cabinLength = 10;  // Length of the cabin
        const cabinHeight = 3.5; // Height of the walls
        const roofHeight = 4;    // Height of the roof peak from the top of the walls
        
        // Create materials
        const woodMaterial = createWoodMaterial(scene);
        const stoneMaterial = createStoneMaterial(scene);
        const roofMaterial = createRoofMaterial(scene);
        
        // Create the cabin foundation
        createFoundation(scene, cabinParent, cabinPosition, cabinWidth, cabinLength, stoneMaterial);
        
        // Create the cabin walls
        createWalls(scene, cabinParent, cabinPosition, cabinWidth, cabinLength, cabinHeight, woodMaterial);
        
        // Create the cabin roof
        createRoof(scene, cabinParent, cabinPosition, cabinWidth, cabinLength, cabinHeight, roofHeight, roofMaterial);
        
        // Create the cabin details (door, windows, chimney, etc.)
        createDetails(scene, cabinParent, cabinPosition, cabinWidth, cabinLength, cabinHeight, woodMaterial, stoneMaterial);
        
        // Create decorative elements
        createDecorativeElements(scene, cabinParent, cabinPosition, cabinWidth, cabinLength, cabinHeight, woodMaterial, stoneMaterial);
        
        // Position the cabin slightly above ground to avoid z-fighting
        cabinParent.position.y = 0.01;
        
        // Rotate the cabin slightly for a better view
        cabinParent.rotation.y = Math.PI / 6; // 30 degrees
        
        console.log("Nordic cabin created successfully");
        return cabinParent;
    } catch (error) {
        console.error("Error creating Nordic cabin:", error);
        return null;
    }
}

// Create the stone foundation
function createFoundation(scene, parent, position, width, length, material) {
    // Create foundation - slightly larger than the cabin and not as tall
    const foundationHeight = 0.6;
    const foundationWidth = width + 0.6;
    const foundationLength = length + 0.6;
    
    const foundation = BABYLON.MeshBuilder.CreateBox(
        "foundation",
        {
            width: foundationWidth,
            height: foundationHeight,
            depth: foundationLength
        },
        scene
    );
    
    // Position foundation
    foundation.position = new BABYLON.Vector3(
        position.x,
        position.y + (foundationHeight / 2),
        position.z
    );
    
    // Apply material
    foundation.material = material;
    
    // Parent to the cabin
    foundation.parent = parent;
    
    // Add some stone texture details
    createStoneDetails(scene, foundation, material);
    
    return foundation;
}

// Create the cabin walls
function createWalls(scene, parent, position, width, length, height, material) {
    // Create main cabin body
    const cabin = BABYLON.MeshBuilder.CreateBox(
        "cabinBody",
        {
            width: width,
            height: height,
            depth: length
        },
        scene
    );
    
    // Position cabin on top of foundation
    cabin.position = new BABYLON.Vector3(
        position.x,
        position.y + 0.6 + (height / 2), // Foundation height (0.6) + half cabin height
        position.z
    );
    
    // Apply material
    cabin.material = material;
    
    // Parent to the cabin
    cabin.parent = parent;
    
    // Add wooden plank details to the walls
    createWoodPlankDetails(scene, cabin, width, length, height, material, parent, position);
    
    return cabin;
}

// Create wooden plank details for the walls
function createWoodPlankDetails(scene, cabin, width, length, height, material, parent, position) {
    // Create horizontal planks on the walls
    const plankHeight = 0.4;
    const plankDepth = 0.05;
    const numPlanks = Math.floor(height / plankHeight) - 1; // Leave space for top and bottom
    
    // Create planks for front and back walls
    for (let i = 0; i < numPlanks; i++) {
        // Calculate y position for this plank
        const y = position.y + 0.6 + (i * plankHeight) + plankHeight; // Start above foundation
        
        // Front wall plank
        const frontPlank = BABYLON.MeshBuilder.CreateBox(
            `frontPlank_${i}`,
            {
                width: width + 0.1, // Slightly wider for effect
                height: plankHeight * 0.8, // Slightly shorter for gap effect
                depth: plankDepth
            },
            scene
        );
        
        frontPlank.position = new BABYLON.Vector3(
            position.x,
            y,
            position.z + (length / 2) + (plankDepth / 2)
        );
        
        frontPlank.material = material;
        frontPlank.parent = parent;
        
        // Back wall plank
        const backPlank = BABYLON.MeshBuilder.CreateBox(
            `backPlank_${i}`,
            {
                width: width + 0.1,
                height: plankHeight * 0.8,
                depth: plankDepth
            },
            scene
        );
        
        backPlank.position = new BABYLON.Vector3(
            position.x,
            y,
            position.z - (length / 2) - (plankDepth / 2)
        );
        
        backPlank.material = material;
        backPlank.parent = parent;
    }
    
    // Create planks for side walls
    for (let i = 0; i < numPlanks; i++) {
        // Calculate y position for this plank
        const y = position.y + 0.6 + (i * plankHeight) + plankHeight;
        
        // Left wall plank
        const leftPlank = BABYLON.MeshBuilder.CreateBox(
            `leftPlank_${i}`,
            {
                width: plankDepth,
                height: plankHeight * 0.8,
                depth: length + 0.1
            },
            scene
        );
        
        leftPlank.position = new BABYLON.Vector3(
            position.x - (width / 2) - (plankDepth / 2),
            y,
            position.z
        );
        
        leftPlank.material = material;
        leftPlank.parent = parent;
        
        // Right wall plank
        const rightPlank = BABYLON.MeshBuilder.CreateBox(
            `rightPlank_${i}`,
            {
                width: plankDepth,
                height: plankHeight * 0.8,
                depth: length + 0.1
            },
            scene
        );
        
        rightPlank.position = new BABYLON.Vector3(
            position.x + (width / 2) + (plankDepth / 2),
            y,
            position.z
        );
        
        rightPlank.material = material;
        rightPlank.parent = parent;
    }
}

// Create the cabin roof
function createRoof(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating roof with dimensions:", { width, length, wallHeight, roofHeight });
    
    try {
        // Create main roof structure
        console.log("Creating main roof structure");
        createMainRoof(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        // Create roof shingles for more detail
        console.log("Creating roof shingles");
        createRoofShingles(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        // Add roof beams
        console.log("Creating roof beams");
        createRoofBeams(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        // Add gable ends
        console.log("Creating gable ends");
        createGableEnds(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        console.log("Roof creation completed successfully");
        return null; // Return value not used
    } catch (error) {
        console.error("Error creating roof:", error);
        return null;
    }
}

// Create the main roof structure
function createMainRoof(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating main roof with params:", { width, length, wallHeight, roofHeight });
    
    try {
        // Create a simpler roof using two boxes for the roof sides
        const overhang = 0.8;
        const roofThickness = 0.3;
        
        // Calculate the slope length using Pythagorean theorem
        const halfWidth = width / 2 + overhang;
        const slopeLength = Math.sqrt(halfWidth * halfWidth + roofHeight * roofHeight);
        
        // Create left roof side
        const leftRoof = BABYLON.MeshBuilder.CreateBox(
            "leftRoof",
            {
                width: slopeLength,
                height: roofThickness,
                depth: length + (overhang * 2)
            },
            scene
        );
        
        // Calculate the angle of the roof slope
        const roofAngle = Math.atan(roofHeight / halfWidth);
        
        // Position and rotate left roof
        leftRoof.position = new BABYLON.Vector3(
            position.x - halfWidth / 2,
            position.y + 0.6 + wallHeight + (roofHeight / 2),
            position.z
        );
        
        // Rotate to create the slope
        leftRoof.rotation.z = roofAngle;
        
        // Make sure the roof is visible
        leftRoof.isVisible = true;
        
        // Apply material
        leftRoof.material = material;
        
        // Parent to the cabin
        leftRoof.parent = parent;
        
        // Create right roof side
        const rightRoof = BABYLON.MeshBuilder.CreateBox(
            "rightRoof",
            {
                width: slopeLength,
                height: roofThickness,
                depth: length + (overhang * 2)
            },
            scene
        );
        
        // Position and rotate right roof
        rightRoof.position = new BABYLON.Vector3(
            position.x + halfWidth / 2,
            position.y + 0.6 + wallHeight + (roofHeight / 2),
            position.z
        );
        
        // Rotate to create the slope (opposite angle)
        rightRoof.rotation.z = -roofAngle;
        
        // Make sure the roof is visible
        rightRoof.isVisible = true;
        
        // Apply material
        rightRoof.material = material;
        
        // Parent to the cabin
        rightRoof.parent = parent;
        
        console.log("Main roof created successfully");
        return { leftRoof, rightRoof };
    } catch (error) {
        console.error("Error creating main roof:", error);
        return null;
    }
}

// Create roof shingles for more detail
function createRoofShingles(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating roof shingles");
    
    try {
        // Create a darker material for the shingles
        const shingleMaterial = material.clone("shingleMaterial");
        shingleMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.2, 0.15); // Darker than roof
        
        // Calculate roof slope angle
        const roofAngle = Math.atan(roofHeight / (width / 2));
        console.log("Roof angle:", roofAngle * (180 / Math.PI), "degrees");
        
        // Shingle parameters - simplified for better performance
        const shingleWidth = 0.5;
        const shingleHeight = 0.6;
        const shingleDepth = 0.05;
        const shingleRows = 5; // Reduced number of rows
        const shinglesPerRow = Math.ceil(width / shingleWidth);
        
        // Create shingles for both sides of the roof
        for (let side = -1; side <= 1; side += 2) { // -1 for left side, 1 for right side
            if (side === 0) continue; // Skip middle
            
            for (let row = 0; row < shingleRows; row++) {
                // Calculate vertical position on the roof
                const rowHeight = (row / shingleRows) * (width / 2) / Math.cos(roofAngle);
                const y = rowHeight * Math.sin(roofAngle);
                const horizontalOffset = side * rowHeight * Math.cos(roofAngle);
                
                for (let col = 0; col < shinglesPerRow; col++) {
                    // Calculate position along the roof width
                    const z = (col / shinglesPerRow) * length - length / 2;
                    
                    // Create shingle
                    const shingle = BABYLON.MeshBuilder.CreateBox(
                        `shingle_${side}_${row}_${col}`,
                        {
                            width: shingleWidth * 0.9,
                            height: shingleDepth,
                            depth: shingleHeight * 0.9
                        },
                        scene
                    );
                    
                    // Position shingle on the roof
                    shingle.position = new BABYLON.Vector3(
                        position.x + horizontalOffset,
                        position.y + 0.6 + wallHeight + y + shingleDepth / 2,
                        position.z + z
                    );
                    
                    // Rotate shingle to align with roof slope
                    shingle.rotation.z = side * roofAngle;
                    
                    // Make sure the shingle is visible
                    shingle.isVisible = true;
                    
                    // Apply material
                    shingle.material = shingleMaterial;
                    
                    // Parent to the cabin
                    shingle.parent = parent;
                }
            }
        }
        
        console.log("Roof shingles created successfully");
    } catch (error) {
        console.error("Error creating roof shingles:", error);
    }
}

// Create gable ends for the roof
function createGableEnds(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating gable ends");
    
    try {
        // Create front gable end using a simple triangle
        const frontGable = BABYLON.MeshBuilder.CreateDisc(
            "frontGable",
            {
                radius: width / 2,
                tessellation: 3, // Triangle
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            },
            scene
        );
        
        // Scale to make it a proper triangle
        frontGable.scaling.y = roofHeight / (width / 2);
        
        // Position front gable
        frontGable.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight + (roofHeight / 2),
            position.z + length / 2 + 0.01 // Slightly in front of the wall
        );
        
        // Rotate to make it vertical
        frontGable.rotation.x = Math.PI / 2;
        
        // Make sure the gable is visible
        frontGable.isVisible = true;
        
        // Apply material
        frontGable.material = material;
        
        // Parent to the cabin
        frontGable.parent = parent;
        
        // Create back gable end (clone the front gable)
        const backGable = frontGable.clone("backGable");
        
        // Position back gable
        backGable.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight + (roofHeight / 2),
            position.z - length / 2 - 0.01 // Slightly behind the wall
        );
        
        // Rotate back gable to face the correct direction
        backGable.rotation.z = Math.PI;
        
        // Make sure the gable is visible
        backGable.isVisible = true;
        
        // Apply material
        backGable.material = material;
        
        // Parent to the cabin
        backGable.parent = parent;
        
        console.log("Gable ends created successfully");
    } catch (error) {
        console.error("Error creating gable ends:", error);
    }
}

// Create roof beams
function createRoofBeams(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating roof beams");
    
    try {
        // Create visible support beams for the roof
        const beamWidth = 0.15;
        const beamHeight = 0.15;
        const numBeams = 5; // Number of visible beams
        const beamSpacing = length / (numBeams - 1);
        
        for (let i = 0; i < numBeams; i++) {
            // Calculate position for this beam
            const z = position.z - (length / 2) + (i * beamSpacing);
            
            // Create a simple beam using a box
            const beam = BABYLON.MeshBuilder.CreateBox(
                `roofBeam_${i}`,
                {
                    width: width + 0.6, // Slightly wider than the cabin
                    height: beamHeight,
                    depth: beamWidth
                },
                scene
            );
            
            // Position the beam
            beam.position = new BABYLON.Vector3(
                position.x,
                position.y + 0.6 + wallHeight + (roofHeight / 3), // Position at 1/3 of roof height
                z
            );
            
            // Make sure the beam is visible
            beam.isVisible = true;
            
            // Apply material
            beam.material = material;
            
            // Parent to the cabin
            beam.parent = parent;
        }
        
        console.log("Roof beams created successfully");
    } catch (error) {
        console.error("Error creating roof beams:", error);
    }
}

// Create cabin details (door, windows, chimney)
function createDetails(scene, parent, position, width, length, height, woodMaterial, stoneMaterial) {
    console.log("Creating cabin details (door, windows, chimney)");
    
    try {
        // Create door
        console.log("Creating door");
        createDoor(scene, parent, position, width, length, height, woodMaterial);
        
        // Create windows
        console.log("Creating windows");
        createWindows(scene, parent, position, width, length, height, woodMaterial);
        
        // Create chimney
        console.log("Creating chimney");
        createChimney(scene, parent, position, width, length, height, stoneMaterial);
        
        console.log("Cabin details created successfully");
    } catch (error) {
        console.error("Error creating cabin details:", error);
    }
}

// Create the chimney
function createChimney(scene, parent, position, width, length, height, material) {
    console.log("Creating chimney");
    
    try {
        // Chimney parameters
        const chimneyWidth = 1.0;
        const chimneyDepth = 1.0;
        const chimneyHeight = height + 3; // Taller than the cabin
        
        // Create chimney
        const chimney = BABYLON.MeshBuilder.CreateBox(
            "chimney",
            {
                width: chimneyWidth,
                height: chimneyHeight,
                depth: chimneyDepth
            },
            scene
        );
        
        // Position chimney on the right side, towards the back
        chimney.position = new BABYLON.Vector3(
            position.x + (width / 3), // Offset to the right
            position.y + 0.6 + (chimneyHeight / 2), // Foundation + half chimney height
            position.z - (length / 3) // Offset towards back
        );
        
        // Make sure the chimney is visible
        chimney.isVisible = true;
        
        // Apply material
        chimney.material = material;
        
        // Parent to the cabin
        chimney.parent = parent;
        
        // Add chimney top
        const chimneyTop = BABYLON.MeshBuilder.CreateBox(
            "chimneyTop",
            {
                width: chimneyWidth + 0.3,
                height: 0.3,
                depth: chimneyDepth + 0.3
            },
            scene
        );
        
        chimneyTop.position = new BABYLON.Vector3(
            position.x + (width / 3),
            position.y + 0.6 + chimneyHeight + 0.15,
            position.z - (length / 3)
        );
        
        // Make sure the chimney top is visible
        chimneyTop.isVisible = true;
        
        chimneyTop.material = material;
        chimneyTop.parent = parent;
        
        console.log("Chimney created successfully");
    } catch (error) {
        console.error("Error creating chimney:", error);
    }
}

// Create the cabin door
function createDoor(scene, parent, position, width, length, height, material) {
    console.log("Creating cabin door");
    
    try {
        // Door parameters
        const doorWidth = 1.2;
        const doorHeight = 2.2;
        const doorThickness = 0.1;
        
        // Create door frame
        const doorFrame = BABYLON.MeshBuilder.CreateBox(
            "doorFrame",
            {
                width: doorWidth + 0.3,
                height: doorHeight + 0.3,
                depth: 0.2
            },
            scene
        );
        
        // Position door on front wall, slightly offset from center
        doorFrame.position = new BABYLON.Vector3(
            position.x - (width / 4), // Offset to the left
            position.y + 0.6 + (doorHeight / 2), // Foundation + half door height
            position.z + (length / 2) + 0.01 // Front wall with slight offset
        );
        
        // Make sure the door frame is visible
        doorFrame.isVisible = true;
        
        // Apply material
        doorFrame.material = material;
        
        // Parent to the cabin
        doorFrame.parent = parent;
        
        // Create door
        const door = BABYLON.MeshBuilder.CreateBox(
            "door",
            {
                width: doorWidth,
                height: doorHeight,
                depth: doorThickness
            },
            scene
        );
        
        // Position door inside the frame
        door.position = new BABYLON.Vector3(
            position.x - (width / 4), // Offset to the left
            position.y + 0.6 + (doorHeight / 2), // Foundation + half door height
            position.z + (length / 2) + 0.15 // Front wall with slight offset
        );
        
        // Make sure the door is visible
        door.isVisible = true;
        
        // Create darker wood material for the door
        const doorMaterial = material.clone("doorMaterial");
        doorMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Darker wood
        
        // Apply material
        door.material = doorMaterial;
        
        // Parent to the cabin
        door.parent = parent;
        
        console.log("Door created successfully");
    } catch (error) {
        console.error("Error creating door:", error);
    }
}

// Create the cabin windows
function createWindows(scene, parent, position, width, length, height, material) {
    console.log("Creating cabin windows");
    
    try {
        // Window parameters
        const windowWidth = 1.0;
        const windowHeight = 1.0;
        const windowDepth = 0.1;
        const windowY = position.y + 0.6 + (height / 2) + 0.3; // Position windows higher than center
        
        console.log("Window parameters:", { windowWidth, windowHeight, windowDepth, windowY });
        
        // Create windows on side walls
        
        // Left wall window
        console.log("Creating left wall window");
        createSingleWindow(
            scene, 
            parent, 
            new BABYLON.Vector3(
                position.x - (width / 2) - 0.01, // Left wall with slight offset
                windowY,
                position.z + (length / 4) // Offset towards front
            ),
            windowWidth,
            windowHeight,
            windowDepth,
            material,
            Math.PI / 2 // Rotate to face left
        );
        
        // Right wall window
        console.log("Creating right wall window");
        createSingleWindow(
            scene, 
            parent, 
            new BABYLON.Vector3(
                position.x + (width / 2) + 0.01, // Right wall with slight offset
                windowY,
                position.z + (length / 4) // Offset towards front
            ),
            windowWidth,
            windowHeight,
            windowDepth,
            material,
            -Math.PI / 2 // Rotate to face right
        );
        
        // Back wall window
        console.log("Creating back wall window");
        createSingleWindow(
            scene, 
            parent, 
            new BABYLON.Vector3(
                position.x, // Center
                windowY,
                position.z - (length / 2) - 0.01 // Back wall with slight offset
            ),
            windowWidth,
            windowHeight,
            windowDepth,
            material,
            Math.PI // Rotate to face back
        );
        
        console.log("Windows created successfully");
    } catch (error) {
        console.error("Error creating windows:", error);
    }
}

// Create a single window
function createSingleWindow(scene, parent, position, width, height, depth, material, rotation) {
    console.log("Creating single window at position:", position);
    
    try {
        // Create window frame
        const windowFrame = BABYLON.MeshBuilder.CreateBox(
            "windowFrame",
            {
                width: width + 0.2,
                height: height + 0.2,
                depth: depth + 0.1
            },
            scene
        );
        
        // Position window frame
        windowFrame.position = position;
        
        // Rotate window frame
        windowFrame.rotation.y = rotation;
        
        // Make sure the window frame is visible
        windowFrame.isVisible = true;
        
        // Apply material
        windowFrame.material = material;
        
        // Parent to the cabin
        windowFrame.parent = parent;
        
        console.log("Single window created successfully");
    } catch (error) {
        console.error("Error creating single window:", error);
    }
}

// Create decorative elements
function createDecorativeElements(scene, parent, position, width, length, height, woodMaterial, stoneMaterial) {
    // Empty implementation to avoid errors
}

// Create stone texture details
function createStoneDetails(scene, mesh, material) {
    // We'll use the existing material but add some vertex coloring or normal mapping
    // to give the impression of individual stones
    
    // This would typically involve UV mapping and texturing
    // For now, we'll just ensure the material is applied
    mesh.material = material;
}

// Create a wood material for the cabin
function createWoodMaterial(scene) {
    console.log("Creating wood material");
    
    try {
        // Create material for the wood
        const woodMaterial = new BABYLON.StandardMaterial("woodMaterial", scene);
        
        // Set wood color properties - weathered Nordic wood
        woodMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.2); // Brownish
        woodMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Low specular
        woodMaterial.specularPower = 32;
        
        // Add some ambient lighting to the wood
        woodMaterial.ambientColor = new BABYLON.Color3(0.3, 0.25, 0.2);
        
        console.log("Wood material created successfully");
        return woodMaterial;
    } catch (error) {
        console.error("Error creating wood material:", error);
        // Return a basic material as fallback
        const fallbackMaterial = new BABYLON.StandardMaterial("fallbackWoodMaterial", scene);
        fallbackMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.2);
        return fallbackMaterial;
    }
}

// Create a stone material for the foundation and chimney
function createStoneMaterial(scene) {
    console.log("Creating stone material");
    
    try {
        // Create material for the stones
        const stoneMaterial = new BABYLON.StandardMaterial("stoneMaterial", scene);
        
        // Set stone color properties - Nordic gray stone
        stoneMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.55);
        stoneMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        stoneMaterial.specularPower = 64;
        
        // Add some ambient lighting to the stones
        stoneMaterial.ambientColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        
        console.log("Stone material created successfully");
        return stoneMaterial;
    } catch (error) {
        console.error("Error creating stone material:", error);
        // Return a basic material as fallback
        const fallbackMaterial = new BABYLON.StandardMaterial("fallbackStoneMaterial", scene);
        fallbackMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.55, 0.55);
        return fallbackMaterial;
    }
}

// Create a roof material
function createRoofMaterial(scene) {
    console.log("Creating roof material");
    
    try {
        // Create material for the roof
        const roofMaterial = new BABYLON.StandardMaterial("roofMaterial", scene);
        
        // Set roof color properties - dark wooden shingles
        roofMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.25, 0.2); // Dark brown
        roofMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Low specular
        roofMaterial.specularPower = 16;
        
        // Add some ambient lighting to the roof
        roofMaterial.ambientColor = new BABYLON.Color3(0.2, 0.15, 0.1);
        
        console.log("Roof material created successfully");
        return roofMaterial;
    } catch (error) {
        console.error("Error creating roof material:", error);
        // Return a basic material as fallback
        const fallbackMaterial = new BABYLON.StandardMaterial("fallbackRoofMaterial", scene);
        fallbackMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.25, 0.2);
        return fallbackMaterial;
    }
}
