import * as BABYLON from '@babylonjs/core';

// Create a tree with the given ID
export function createTree(scene, ground, id) {
    console.log(`Creating tree with ID: ${id}`);
    
    try {
        // Create a parent mesh to hold all tree components
        const treeParent = new BABYLON.TransformNode(`tree_${id}`, scene);
        
        // Add ID and group ID as properties for easy access
        treeParent.plantId = id;
        treeParent.groupId = "tree";
        
        // Random position within the scene bounds
        const randomX = Math.random() * 160 - 80; // -80 to 80
        const randomZ = Math.random() * 160 - 80; // -80 to 80
        
        // Avoid placing too close to the cabin
        const distanceFromCabin = Math.sqrt(Math.pow(randomX - 15, 2) + Math.pow(randomZ + 35, 2));
        const position = new BABYLON.Vector3(
            distanceFromCabin < 25 ? randomX + 40 : randomX, // Trees need more space
            0,
            distanceFromCabin < 25 ? randomZ - 40 : randomZ
        );
        
        // Create the tree components
        const { trunk, height: trunkHeight, diameter: trunkDiameter } = createTreeTrunk(scene, treeParent, position);
        createTreeFoliage(scene, treeParent, position, trunkHeight, trunkDiameter);
        
        // Position the tree slightly above ground to avoid z-fighting
        treeParent.position.y = 0.01;
        
        // Try to load saved position or use the random position
        if (!loadSavedPosition(treeParent)) {
            // If no saved position, check for collisions at initial position
            if (checkCollisions(treeParent, scene)) {
                // If collision detected, try to find a valid position
                let attempts = 0;
                let validPositionFound = false;
                
                while (attempts < 20 && !validPositionFound) {
                    // Generate a new random position
                    const newX = Math.random() * 160 - 80;
                    const newZ = Math.random() * 160 - 80;
                    
                    // Avoid placing too close to the cabin
                    const newDistanceFromCabin = Math.sqrt(Math.pow(newX - 15, 2) + Math.pow(newZ + 35, 2));
                    treeParent.position.x = newDistanceFromCabin < 25 ? newX + 40 : newX;
                    treeParent.position.z = newDistanceFromCabin < 25 ? newZ - 40 : newZ;
                    
                    // Check if this position is valid
                    if (!checkCollisions(treeParent, scene)) {
                        validPositionFound = true;
                    }
                    
                    attempts++;
                }
                
                if (!validPositionFound) {
                    console.warn(`Could not find valid position for tree ${id} after ${attempts} attempts`);
                }
            }
            
            // Save the initial position
            savePosition(treeParent);
        }
        
        console.log(`Tree ${id} created successfully`);
        return treeParent;
    } catch (error) {
        console.error(`Error creating tree ${id}:`, error);
        return null;
    }
}

// Create the trunk of the tree
function createTreeTrunk(scene, parent, position) {
    // Create trunk material (wood)
    const trunkMaterial = new BABYLON.PBRMaterial("treeTrunkMaterial", scene);
    
    // Brown color with slight variation
    const brownHue = 0.25 + Math.random() * 0.1;
    trunkMaterial.albedoColor = new BABYLON.Color3(brownHue, brownHue * 0.6, brownHue * 0.4);
    
    // Wood-like properties
    trunkMaterial.metallic = 0;
    trunkMaterial.roughness = 0.7 + Math.random() * 0.3;
    
    // Add bark-like texture with noise
    const barkNoiseTexture = new BABYLON.NoiseProceduralTexture("barkNoise", 256, scene);
    barkNoiseTexture.octaves = 4;
    barkNoiseTexture.persistence = 0.7;
    trunkMaterial.bumpTexture = barkNoiseTexture;
    trunkMaterial.bumpTexture.level = 0.6;
    
    // Create trunk as cylinder
    const trunkHeight = 4 + Math.random() * 2; // 4-6 units tall
    const trunkDiameter = 0.5 + Math.random() * 0.3; // 0.5-0.8 units diameter
    
    const trunk = BABYLON.MeshBuilder.CreateCylinder(
        "treeTrunk",
        {
            height: trunkHeight,
            diameter: trunkDiameter,
            tessellation: 16
        },
        scene
    );
    
    // Position trunk
    trunk.position = new BABYLON.Vector3(
        position.x,
        position.y + trunkHeight / 2,
        position.z
    );
    
    // Apply material
    trunk.material = trunkMaterial;
    
    // Parent to the tree
    trunk.parent = parent;
    
    return { trunk, height: trunkHeight, diameter: trunkDiameter };
}

// Create the foliage of the tree
function createTreeFoliage(scene, parent, position, trunkHeight, trunkDiameter) {
    // Create foliage material
    const foliageMaterial = new BABYLON.PBRMaterial("treeFoliageMaterial", scene);
    
    // Green color with variation
    const greenHue = 0.3 + Math.random() * 0.1;
    foliageMaterial.albedoColor = new BABYLON.Color3(0.2, greenHue, 0.1);
    
    // Leaf-like properties
    foliageMaterial.metallic = 0;
    foliageMaterial.roughness = 0.8;
    
    // Add leaf texture with noise
    const leafNoiseTexture = new BABYLON.NoiseProceduralTexture("leafNoise", 256, scene);
    leafNoiseTexture.octaves = 3;
    leafNoiseTexture.persistence = 0.8;
    foliageMaterial.bumpTexture = leafNoiseTexture;
    foliageMaterial.bumpTexture.level = 0.4;
    
    // Translucency for leaves
    foliageMaterial.subSurface.isTranslucencyEnabled = true;
    foliageMaterial.subSurface.translucencyIntensity = 0.2;
    
    // Create main foliage as a cone
    const foliageSize = trunkDiameter * 5; // Proportional to trunk
    const foliageHeight = trunkHeight * 0.7; // Proportional to trunk
    
    // Create main foliage shape
    const mainFoliage = BABYLON.MeshBuilder.CreateCylinder(
        "treeMainFoliage",
        {
            height: foliageHeight,
            diameterTop: 0.1, // Point at top
            diameterBottom: foliageSize,
            tessellation: 16
        },
        scene
    );
    
    // Position foliage on top of trunk
    mainFoliage.position = new BABYLON.Vector3(
        position.x,
        position.y + trunkHeight + foliageHeight/2 - 0.5, // Overlap with trunk
        position.z
    );
    
    // Apply material
    mainFoliage.material = foliageMaterial;
    
    // Parent to the tree
    mainFoliage.parent = parent;
    
    // Add additional foliage clusters for fuller appearance
    const numClusters = 3 + Math.floor(Math.random() * 2); // 3-4 additional clusters
    
    for (let i = 0; i < numClusters; i++) {
        // Create cluster with slight variation
        const clusterMaterial = foliageMaterial.clone(`treeFoliageMaterial_${i}`);
        const clusterGreenHue = greenHue * (0.9 + Math.random() * 0.2);
        clusterMaterial.albedoColor = new BABYLON.Color3(0.2, clusterGreenHue, 0.1);
        
        // Create smaller cone
        const clusterHeight = foliageHeight * (0.7 + Math.random() * 0.3);
        const clusterSize = foliageSize * (0.7 + Math.random() * 0.3);
        
        const cluster = BABYLON.MeshBuilder.CreateCylinder(
            `treeCluster_${i}`,
            {
                height: clusterHeight,
                diameterTop: 0.1,
                diameterBottom: clusterSize,
                tessellation: 16
            },
            scene
        );
        
        // Position cluster with slight offset
        const heightOffset = (i / numClusters) * (trunkHeight * 0.4);
        cluster.position = new BABYLON.Vector3(
            position.x,
            position.y + trunkHeight + clusterHeight/2 - 0.5 - heightOffset,
            position.z
        );
        
        // Apply material
        cluster.material = clusterMaterial;
        
        // Parent to the tree
        cluster.parent = parent;
    }
    
    return mainFoliage;
}

// Function to check if a tree collides with any other object
function checkCollisions(tree, scene) {
    // Get all relevant objects to check against
    const objects = scene.meshes.filter(mesh => 
        (mesh.parent && (
            (mesh.parent.groupId === "lavender") || 
            (mesh.parent.groupId === "dandelion") || 
            (mesh.parent.groupId === "bush") ||
            (mesh.parent.groupId === "tree") ||
            (mesh.parent.name && mesh.parent.name.includes("cabin"))
        )) && 
        mesh.parent !== tree
    );
    
    // Define buffer distance to prevent touching
    const bufferDistance = 2.0; // Larger buffer for trees
    
    // Check each object
    for (const object of objects) {
        // Skip if object doesn't have bounding info
        if (!object.getBoundingInfo || !tree.getBoundingInfo) {
            continue;
        }
        
        try {
            // Get bounding info
            const treeBounding = tree.getBoundingInfo().boundingSphere;
            const objectBounding = object.getBoundingInfo().boundingSphere;
            
            // Calculate centers and combined radius with buffer
            const treeCenter = tree.getAbsolutePosition();
            const objectCenter = object.getAbsolutePosition();
            const distance = BABYLON.Vector3.Distance(treeCenter, objectCenter);
            const combinedRadius = treeBounding.radius + objectBounding.radius + bufferDistance;
            
            // If distance is less than combined radius, collision detected
            if (distance < combinedRadius) {
                return true;
            }
        } catch (error) {
            console.warn("Error checking collision:", error);
            continue;
        }
    }
    
    return false;
}

// Function to highlight collision state
function highlightCollision(tree, scene, isColliding) {
    // Remove any existing highlight
    const existingHighlight = scene.getHighlightLayerByName("treeHighlight");
    if (existingHighlight) {
        existingHighlight.dispose();
    }
    
    if (isColliding) {
        // Create red highlight for collision
        const highlightLayer = new BABYLON.HighlightLayer("treeHighlight", scene);
        highlightLayer.addMesh(tree, new BABYLON.Color3(1, 0, 0)); // Red for collision
    } else {
        // Create green highlight for valid position
        const highlightLayer = new BABYLON.HighlightLayer("treeHighlight", scene);
        highlightLayer.addMesh(tree, new BABYLON.Color3(0, 1, 0)); // Green for valid
    }
}

// Function to show collision message
function showCollisionMessage(scene) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById("collisionMessage");
    if (!messageElement) {
        messageElement = document.createElement("div");
        messageElement.id = "collisionMessage";
        messageElement.style.position = "absolute";
        messageElement.style.top = "50%";
        messageElement.style.left = "50%";
        messageElement.style.transform = "translate(-50%, -50%)";
        messageElement.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
        messageElement.style.color = "white";
        messageElement.style.padding = "20px";
        messageElement.style.borderRadius = "5px";
        messageElement.style.fontFamily = "Arial, sans-serif";
        messageElement.style.zIndex = "1000";
        document.body.appendChild(messageElement);
    }
    
    // Set message text
    messageElement.textContent = "Cannot place tree here - too close to other objects!";
    
    // Show message
    messageElement.style.display = "block";
    
    // Hide after 2 seconds
    setTimeout(() => {
        messageElement.style.display = "none";
    }, 2000);
}

// Function to make a tree draggable
export function makeDraggable(tree, scene, ground) {
    console.log(`Making ${tree.name} draggable`);
    
    try {
        // Create a drag behavior for XZ plane (horizontal movement only)
        const dragBehavior = new BABYLON.PointerDragBehavior({
            dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) // Y-axis as normal means XZ plane
        });
        
        // Keep track of original position for undo functionality
        let originalPosition = tree.position.clone();
        
        // Add visual feedback when dragging starts
        dragBehavior.onDragStartObservable.add(() => {
            // Store the original position when drag starts
            originalPosition = tree.position.clone();
            
            // Visual feedback - slightly elevate the tree
            tree.position.y += 0.3;
            
            // Change cursor
            scene.getEngine().getRenderingCanvas().style.cursor = "grabbing";
            
            console.log(`Started dragging ${tree.name}`);
        });
        
        // Handle drag movement
        dragBehavior.onDragObservable.add(() => {
            // Keep the tree at the correct height above ground
            tree.position.y = 0.01 + 0.3; // Original height + drag elevation
            
            // Check for collisions with other objects
            const collisionDetected = checkCollisions(tree, scene);
            
            // Visual feedback for collision state
            highlightCollision(tree, scene, collisionDetected);
        });
        
        // Handle drag end
        dragBehavior.onDragEndObservable.add(() => {
            // Check final position for collisions
            const collisionDetected = checkCollisions(tree, scene);
            
            if (collisionDetected) {
                // Revert to original position if collision detected
                tree.position = originalPosition.clone();
                
                // Show feedback to user
                showCollisionMessage(scene);
            }
            
            // Return to normal height
            tree.position.y = 0.01;
            
            // Reset cursor
            scene.getEngine().getRenderingCanvas().style.cursor = "default";
            
            // Remove any highlight
            const existingHighlight = scene.getHighlightLayerByName("treeHighlight");
            if (existingHighlight) {
                existingHighlight.dispose();
            }
            
            // Save the new position (only if valid)
            if (!collisionDetected) {
                savePosition(tree);
            }
            
            console.log(`Finished dragging ${tree.name} to position:`, tree.position);
        });
        
        // Add the behavior to the tree
        tree.addBehavior(dragBehavior);
        
        // Add a hover effect
        tree.actionManager = new BABYLON.ActionManager(scene);
        
        // Change cursor on hover
        tree.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOverTrigger,
                function() {
                    scene.getEngine().getRenderingCanvas().style.cursor = "grab";
                }
            )
        );
        
        // Reset cursor when not hovering
        tree.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOutTrigger,
                function() {
                    scene.getEngine().getRenderingCanvas().style.cursor = "default";
                }
            )
        );
        
        console.log(`Successfully made ${tree.name} draggable`);
        
        // Return the drag behavior for external control
        return dragBehavior;
    } catch (error) {
        console.error(`Error making ${tree.name} draggable:`, error);
        return null;
    }
}

// Function to save the position of a tree
export function savePosition(tree) {
    try {
        // Get the tree's ID and position
        const treeId = tree.plantId;
        const position = {
            x: tree.position.x,
            y: tree.position.y,
            z: tree.position.z,
            rotation: tree.rotation.y
        };
        
        // Save to localStorage for persistence
        const savedTrees = JSON.parse(localStorage.getItem('savedTrees') || '{}');
        savedTrees[treeId] = position;
        localStorage.setItem('savedTrees', JSON.stringify(savedTrees));
        
        console.log(`Saved position for ${treeId}:`, position);
    } catch (error) {
        console.error("Error saving tree position:", error);
    }
}

// Function to load saved position for a tree
export function loadSavedPosition(tree) {
    try {
        const treeId = tree.plantId;
        const savedTrees = JSON.parse(localStorage.getItem('savedTrees') || '{}');
        
        if (savedTrees[treeId]) {
            const savedPos = savedTrees[treeId];
            tree.position.x = savedPos.x;
            tree.position.y = savedPos.y;
            tree.position.z = savedPos.z;
            tree.rotation.y = savedPos.rotation;
            console.log(`Loaded saved position for ${treeId}:`, savedPos);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error loading saved position:", error);
        return false;
    }
}

// Function to make all trees in a group draggable
export function makeGroupDraggable(trees, scene, ground) {
    trees.forEach(tree => {
        makeDraggable(tree, scene, ground);
    });
}

// Function to save positions for all trees in a group
export function saveGroupPositions(trees) {
    trees.forEach(tree => {
        savePosition(tree);
    });
}
