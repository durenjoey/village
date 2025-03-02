import * as BABYLON from '@babylonjs/core';

// Create a dandelion plant with the given ID
export function createDandelionPlant(scene, ground, id) {
    console.log(`Creating dandelion plant with ID: ${id}`);
    
    try {
        // Create a parent mesh to hold all dandelion components
        const dandelionParent = new BABYLON.TransformNode(`dandelion_${id}`, scene);
        
        // Add ID and group ID as properties for easy access
        dandelionParent.plantId = id;
        dandelionParent.groupId = "dandelion";
        
        // Random position within the scene bounds
        const randomX = Math.random() * 160 - 80; // -80 to 80
        const randomZ = Math.random() * 160 - 80; // -80 to 80
        
        // Avoid placing too close to the cabin
        const distanceFromCabin = Math.sqrt(Math.pow(randomX - 15, 2) + Math.pow(randomZ + 35, 2));
        const position = new BABYLON.Vector3(
            distanceFromCabin < 20 ? randomX + 30 : randomX,
            0,
            distanceFromCabin < 20 ? randomZ - 30 : randomZ
        );
        
        // Create the dandelion plant components
        createDandelionBase(scene, dandelionParent, position);
        createDandelionStem(scene, dandelionParent, position);
        
        // Position the plant slightly above ground to avoid z-fighting
        dandelionParent.position.y = 0.01;
        
        // Try to load saved position or use the random position
        if (!loadSavedPosition(dandelionParent)) {
            // If no saved position, save the initial random position
            savePosition(dandelionParent);
        }
        
        console.log(`Dandelion plant ${id} created successfully`);
        return dandelionParent;
    } catch (error) {
        console.error(`Error creating dandelion plant ${id}:`, error);
        return null;
    }
}

// Create the base/soil and leaves of the dandelion plant
function createDandelionBase(scene, parent, position) {
    // Create base material (soil)
    const baseMaterial = new BABYLON.StandardMaterial("dandelionBaseMaterial", scene);
    baseMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Brown soil color
    
    // Create leaf material
    const leafMaterial = new BABYLON.StandardMaterial("dandelionLeafMaterial", scene);
    leafMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.65, 0.1); // Green leaf color
    
    // Create the base as a small cylinder
    const base = BABYLON.MeshBuilder.CreateCylinder(
        "dandelionBase",
        {
            height: 0.2,
            diameter: 0.8,
            tessellation: 16
        },
        scene
    );
    
    // Position the base
    base.position = new BABYLON.Vector3(
        position.x,
        position.y + 0.1, // Half the height
        position.z
    );
    
    // Apply material
    base.material = baseMaterial;
    
    // Parent to the dandelion plant
    base.parent = parent;
    
    // Create leaves in a circular pattern
    const numLeaves = 6 + Math.floor(Math.random() * 3); // 6-8 leaves
    
    for (let i = 0; i < numLeaves; i++) {
        // Calculate angle for this leaf
        const angle = (i / numLeaves) * Math.PI * 2;
        
        // Create leaf as a flattened box
        const leaf = BABYLON.MeshBuilder.CreateBox(
            `dandelionLeaf_${i}`,
            {
                width: 0.1,
                height: 0.05,
                depth: 0.6 + Math.random() * 0.3 // Varying leaf lengths
            },
            scene
        );
        
        // Position leaf
        leaf.position = new BABYLON.Vector3(
            position.x + Math.cos(angle) * 0.3,
            position.y + 0.1,
            position.z + Math.sin(angle) * 0.3
        );
        
        // Rotate leaf to lay flat and point outward
        leaf.rotation.y = angle;
        leaf.rotation.x = Math.PI / 12; // Slight upward tilt
        
        // Apply material
        leaf.material = leafMaterial;
        
        // Parent to the dandelion plant
        leaf.parent = parent;
    }
    
    return base;
}

// Create the stem and flower of the dandelion plant
function createDandelionStem(scene, parent, position) {
    // Create stem material
    const stemMaterial = new BABYLON.StandardMaterial("dandelionStemMaterial", scene);
    stemMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.6, 0.3); // Green stem color
    
    // Create flower material
    const flowerMaterial = new BABYLON.StandardMaterial("dandelionFlowerMaterial", scene);
    flowerMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.9, 0.2); // Yellow flower color
    
    // Stem height varies slightly
    const stemHeight = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    // Create stem
    const stem = BABYLON.MeshBuilder.CreateCylinder(
        "dandelionStem",
        {
            height: stemHeight,
            diameter: 0.05,
            tessellation: 8
        },
        scene
    );
    
    // Position stem
    stem.position = new BABYLON.Vector3(
        position.x,
        position.y + 0.2 + stemHeight / 2, // Base height + half stem height
        position.z
    );
    
    // Add slight random tilt to stem
    stem.rotation.x = (Math.random() - 0.5) * 0.2;
    stem.rotation.z = (Math.random() - 0.5) * 0.2;
    
    // Apply material
    stem.material = stemMaterial;
    
    // Parent to the dandelion plant
    stem.parent = parent;
    
    // Create flower head as a sphere
    const flowerSize = 0.15 + Math.random() * 0.1; // 0.15 to 0.25
    const flower = BABYLON.MeshBuilder.CreateSphere(
        "dandelionFlower",
        {
            diameter: flowerSize * 2,
            segments: 12
        },
        scene
    );
    
    // Position flower at top of stem
    flower.position = new BABYLON.Vector3(
        position.x + Math.sin(stem.rotation.z) * stemHeight / 2,
        position.y + 0.2 + stemHeight + flowerSize, // Base + stem + half flower height
        position.z - Math.sin(stem.rotation.x) * stemHeight / 2
    );
    
    // Apply material
    flower.material = flowerMaterial;
    
    // Parent to the dandelion plant
    flower.parent = parent;
    
    return stem;
}

// Function to make a dandelion plant draggable
export function makeDraggable(plant, scene, ground) {
    console.log(`Making ${plant.name} draggable`);
    
    try {
        // Create a drag behavior for XZ plane (horizontal movement only)
        const dragBehavior = new BABYLON.PointerDragBehavior({
            dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) // Y-axis as normal means XZ plane
        });
        
        // Keep track of original position for undo functionality
        let originalPosition = plant.position.clone();
        
        // Add visual feedback when dragging starts
        dragBehavior.onDragStartObservable.add(() => {
            // Store the original position when drag starts
            originalPosition = plant.position.clone();
            
            // Visual feedback - slightly elevate the plant
            plant.position.y += 0.3;
            
            // Change cursor
            scene.getEngine().getRenderingCanvas().style.cursor = "grabbing";
            
            console.log(`Started dragging ${plant.name}`);
        });
        
        // Handle drag movement
        dragBehavior.onDragObservable.add(() => {
            // Keep the plant at the correct height above ground
            plant.position.y = 0.01 + 0.3; // Original height + drag elevation
        });
        
        // Handle drag end
        dragBehavior.onDragEndObservable.add(() => {
            // Return to normal height
            plant.position.y = 0.01;
            
            // Reset cursor
            scene.getEngine().getRenderingCanvas().style.cursor = "default";
            
            // Save the new position
            savePosition(plant);
            
            console.log(`Finished dragging ${plant.name} to position:`, plant.position);
        });
        
        // Add the behavior to the plant
        plant.addBehavior(dragBehavior);
        
        // Add a hover effect
        plant.actionManager = new BABYLON.ActionManager(scene);
        
        // Change cursor on hover
        plant.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOverTrigger,
                function() {
                    scene.getEngine().getRenderingCanvas().style.cursor = "grab";
                }
            )
        );
        
        // Reset cursor when not hovering
        plant.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOutTrigger,
                function() {
                    scene.getEngine().getRenderingCanvas().style.cursor = "default";
                }
            )
        );
        
        console.log(`Successfully made ${plant.name} draggable`);
        
        // Return the drag behavior for external control
        return dragBehavior;
    } catch (error) {
        console.error(`Error making ${plant.name} draggable:`, error);
        return null;
    }
}

// Function to save the position of a dandelion plant
export function savePosition(plant) {
    try {
        // Get the plant's ID and position
        const plantId = plant.plantId;
        const position = {
            x: plant.position.x,
            y: plant.position.y,
            z: plant.position.z,
            rotation: plant.rotation.y
        };
        
        // Save to localStorage for persistence
        const savedPlants = JSON.parse(localStorage.getItem('savedDandelionPlants') || '{}');
        savedPlants[plantId] = position;
        localStorage.setItem('savedDandelionPlants', JSON.stringify(savedPlants));
        
        console.log(`Saved position for ${plantId}:`, position);
    } catch (error) {
        console.error("Error saving dandelion plant position:", error);
    }
}

// Function to load saved position for a dandelion plant
export function loadSavedPosition(plant) {
    try {
        const plantId = plant.plantId;
        const savedPlants = JSON.parse(localStorage.getItem('savedDandelionPlants') || '{}');
        
        if (savedPlants[plantId]) {
            const savedPos = savedPlants[plantId];
            plant.position.x = savedPos.x;
            plant.position.y = savedPos.y;
            plant.position.z = savedPos.z;
            plant.rotation.y = savedPos.rotation;
            console.log(`Loaded saved position for ${plantId}:`, savedPos);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error loading saved position:", error);
        return false;
    }
}

// Function to make all dandelion plants in a group draggable
export function makeGroupDraggable(plants, scene, ground) {
    plants.forEach(plant => {
        makeDraggable(plant, scene, ground);
    });
}

// Function to save positions for all plants in a group
export function saveGroupPositions(plants) {
    plants.forEach(plant => {
        savePosition(plant);
    });
}
