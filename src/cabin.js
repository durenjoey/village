import * as BABYLON from '@babylonjs/core';

export function createNordicCabin(scene, ground, id = "cabin_1") {
    console.log(`Creating Skyrim-style Nordic cabin with ID: ${id}`);
    
    try {
        // Create a parent mesh to hold all cabin components
        const cabinParent = new BABYLON.Mesh(`nordicCabin_${id}`, scene);
        
        // Add ID as a property for easy access
        cabinParent.cabinId = id;
        
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
        
        // Removed decorative elements to simplify the cabin
        
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
        
        // Add gable ends
        console.log("Creating gable ends");
        createGableEnds(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        // Add logs to conceal any remaining transparency
        console.log("Adding logs to roof");
        addRoofLogs(scene, parent, position, width, length, wallHeight, roofHeight, material);
        
        console.log("Roof creation completed successfully");
        return null; // Return value not used
    } catch (error) {
        console.error("Error creating roof:", error);
        return null;
    }
}

// Add logs to the roof to conceal any remaining transparency
function addRoofLogs(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Adding logs to roof");
    
    try {
        // Create a darker material for the logs
        const logMaterial = material.clone("logMaterial");
        logMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.2, 0.15); // Darker than roof
        
        // Create a log along the ridge
        const ridgeLog = BABYLON.MeshBuilder.CreateCylinder(
            "ridgeLog",
            {
                height: length + 0.4,
                diameter: 0.3,
                tessellation: 12
            },
            scene
        );
        
        // Position the ridge log
        ridgeLog.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight + roofHeight - 0.1,
            position.z
        );
        
        // Rotate to align with the ridge
        ridgeLog.rotation.x = Math.PI / 2;
        
        // Apply material
        ridgeLog.material = logMaterial;
        
        // Parent to the cabin
        ridgeLog.parent = parent;
        
        // Add horizontal logs to fill the gap between the walls and roof
        console.log("Adding horizontal logs to fill wall-roof gap");
        addWallToRoofLogs(scene, parent, position, width, length, wallHeight, roofHeight, logMaterial);
        
        console.log("Roof logs added successfully");
    } catch (error) {
        console.error("Error adding roof logs:", error);
    }
}

// Add horizontal logs to fill the gap between the walls and roof
function addWallToRoofLogs(scene, parent, position, width, length, wallHeight, roofHeight, logMaterial) {
    try {
        // Parameters for the horizontal logs
        const logHeight = 0.25;
        const logDepth = 0.3;
        const overhang = 0.8;
        
        // Calculate the angle of the roof slope
        const roofAngle = Math.atan(roofHeight / (width/2 + overhang));
        
        // Create logs for front and back gable ends
        for (let side = -1; side <= 1; side += 2) { // -1 for back, 1 for front
            if (side === 0) continue;
            
            const zPos = position.z + side * length/2;
            
            // Calculate how many logs we need based on the height
            const maxHeight = roofHeight - 0.2; // Leave a small gap at the top
            const numLogs = Math.floor(maxHeight / logHeight);
            
            for (let i = 0; i < numLogs; i++) {
                // Calculate the height of this log from the wall top
                const logY = i * logHeight;
                
                // Calculate the width of this log based on the roof slope
                // As we go higher, the log gets shorter
                const logWidth = width - (2 * (logY / Math.tan(roofAngle)));
                
                if (logWidth <= 0.2) continue; // Skip if too short
                
                // Create the horizontal log
                const horizontalLog = BABYLON.MeshBuilder.CreateBox(
                    `horizontalLog_${side}_${i}`,
                    {
                        width: logWidth,
                        height: logHeight * 0.9, // Slightly shorter for gap effect
                        depth: logDepth
                    },
                    scene
                );
                
                // Position the log
                horizontalLog.position = new BABYLON.Vector3(
                    position.x,
                    position.y + 0.6 + wallHeight + logY + (logHeight/2),
                    zPos + (side * logDepth/2)
                );
                
                // Apply material
                horizontalLog.material = logMaterial;
                
                // Parent to the cabin
                horizontalLog.parent = parent;
            }
        }
        
        console.log("Wall-to-roof logs added successfully");
    } catch (error) {
        console.error("Error adding wall-to-roof logs:", error);
    }
}

// Simple roof structure function
function createMainRoof(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating main roof with params:", { width, length, wallHeight, roofHeight });
    
    try {
        // Create a simple roof using two boxes for the roof sides
        const overhang = 0.8;
        const roofThickness = 0.3;
        
        // Calculate the slope length using Pythagorean theorem
        const halfWidth = width / 2 + overhang;
        const slopeLength = Math.sqrt(halfWidth * halfWidth + roofHeight * roofHeight);
        
        // Calculate the angle of the roof slope
        const roofAngle = Math.atan(roofHeight / halfWidth);
        
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
        
        // Position left roof
        leftRoof.position = new BABYLON.Vector3(
            position.x - halfWidth/2,
            position.y + 0.6 + wallHeight + roofHeight/2,
            position.z
        );
        
        // Rotate to create the slope
        leftRoof.rotation.z = roofAngle;
        
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
        
        // Position right roof
        rightRoof.position = new BABYLON.Vector3(
            position.x + halfWidth/2,
            position.y + 0.6 + wallHeight + roofHeight/2,
            position.z
        );
        
        // Rotate to create the slope (opposite angle)
        rightRoof.rotation.z = -roofAngle;
        
        // Apply material
        rightRoof.material = material;
        
        // Parent to the cabin
        rightRoof.parent = parent;
        
        // Add a ridge cap at the top to cover any gap
        const ridgeCap = BABYLON.MeshBuilder.CreateBox(
            "ridgeCap",
            {
                width: 0.5,
                height: 0.4,
                depth: length + (overhang * 2)
            },
            scene
        );
        
        ridgeCap.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight + roofHeight - 0.2,
            position.z
        );
        
        ridgeCap.material = material;
        ridgeCap.parent = parent;
        
        console.log("Main roof created successfully");
        return { leftRoof, rightRoof, ridgeCap };
    } catch (error) {
        console.error("Error creating main roof:", error);
        return null;
    }
}

// FIX 6: Better roof shingles function for better performance and appearance
function createRoofShingles(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating roof shingles");
    
    try {
        // Create a darker material for the shingles
        const shingleMaterial = material.clone("shingleMaterial");
        shingleMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.2, 0.15);
        
        // Instead of creating individual shingles, create shingle rows for better performance
        const shingleRowHeight = 0.4;
        const shingleRowsPerSide = 6;
        const overhang = 0.8;
        
        // Calculate roof slope angle
        const roofAngle = Math.atan(roofHeight / (width/2));
        const slopeLength = Math.sqrt(Math.pow(width/2 + overhang, 2) + Math.pow(roofHeight, 2));
        
        // Create shingle rows for both sides
        for (let side = -1; side <= 1; side += 2) {
            if (side === 0) continue;
            
            for (let row = 0; row < shingleRowsPerSide; row++) {
                // Calculate row position along the slope
                const rowOffset = (row + 0.5) * (slopeLength / shingleRowsPerSide);
                const x = side * (rowOffset * Math.cos(roofAngle));
                const y = rowOffset * Math.sin(roofAngle);
                
                // Create shingle row
                const shingleRow = BABYLON.MeshBuilder.CreateBox(
                    `shingleRow_${side}_${row}`,
                    {
                        width: slopeLength / shingleRowsPerSide * 1.05,
                        height: 0.05,
                        depth: length + (overhang * 1.5)
                    },
                    scene
                );
                
                // Position shingle row on the roof
                shingleRow.position = new BABYLON.Vector3(
                    position.x + x * 0.8,
                    position.y + 0.6 + wallHeight + y - 0.2,
                    position.z
                );
                
                // Rotate shingle row to align with roof slope
                shingleRow.rotation.z = side * roofAngle;
                
                // Apply material
                shingleRow.material = shingleMaterial;
                
                // Parent to cabin
                shingleRow.parent = parent;
            }
        }
        
        console.log("Roof shingles created successfully");
    } catch (error) {
        console.error("Error creating roof shingles:", error);
    }
}

// FIX 5: Better gable ends function
function createGableEnds(scene, parent, position, width, length, wallHeight, roofHeight, material) {
    console.log("Creating gable ends");
    
    try {
        // Create a custom shape for the gable instead of a disc
        const gablePoints = [
            new BABYLON.Vector3(-width/2, 0, 0),
            new BABYLON.Vector3(width/2, 0, 0),
            new BABYLON.Vector3(0, roofHeight, 0)
        ];
        
        // Create front gable
        const frontGable = BABYLON.MeshBuilder.CreatePolygon(
            "frontGable",
            {
                shape: gablePoints,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            },
            scene
        );
        
        // Position front gable
        frontGable.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight,
            position.z + length/2 + 0.05
        );
        
        // Rotate to make it vertical
        frontGable.rotation.x = Math.PI/2;
        
        // Apply material
        frontGable.material = material;
        
        // Parent to the cabin
        frontGable.parent = parent;
        
        // Create back gable
        const backGable = frontGable.clone("backGable");
        
        // Position back gable
        backGable.position.z = position.z - length/2 - 0.05;
        
        // Rotate back gable
        backGable.rotation.y = Math.PI;
        
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
        const numBeams = 3; // Reduced number of beams
        const beamSpacing = length / (numBeams + 1);
        
        // Create a ridge beam along the top of the roof
        const ridgeBeam = BABYLON.MeshBuilder.CreateBox(
            "ridgeBeam",
            {
                width: beamWidth,
                height: beamHeight,
                depth: length - 0.2 // Slightly shorter than the cabin
            },
            scene
        );
        
        // Position the ridge beam at the peak of the roof
        ridgeBeam.position = new BABYLON.Vector3(
            position.x,
            position.y + 0.6 + wallHeight + roofHeight - (beamHeight / 2),
            position.z
        );
        
        // Apply material
        ridgeBeam.material = material;
        
        // Parent to the cabin
        ridgeBeam.parent = parent;
        
        // Create cross beams
        for (let i = 1; i <= numBeams; i++) {
            // Calculate position for this beam
            const z = position.z - (length / 2) + (i * beamSpacing);
            
            // Create a cross beam
            const crossBeam = BABYLON.MeshBuilder.CreateBox(
                `crossBeam_${i}`,
                {
                    width: width - 0.2, // Slightly narrower than the cabin
                    height: beamHeight,
                    depth: beamWidth
                },
                scene
            );
            
            // Position the beam
            crossBeam.position = new BABYLON.Vector3(
                position.x,
                position.y + 0.6 + wallHeight + 0.5, // Just above the walls
                z
            );
            
            // Apply material
            crossBeam.material = material;
            
            // Parent to the cabin
            crossBeam.parent = parent;
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

// FIX 7: Modified door function for better appearance
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
                depth: 0.3
            },
            scene
        );
        
        // Position door on front wall, slightly offset from center
        doorFrame.position = new BABYLON.Vector3(
            position.x - (width / 4), // Offset to the left
            position.y + 0.6 + (doorHeight / 2), // Foundation + half door height
            position.z + (length / 2) // Front wall
        );
        
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
        
        // Create darker wood material for the door
        const doorMaterial = material.clone("door
