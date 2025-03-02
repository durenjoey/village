import * as BABYLON from '@babylonjs/core';

// Create a lavender plant with the given ID
export function createLavenderPlant(scene, ground, id) {
    console.log(`Creating lavender plant with ID: ${id}`);
    
    try {
        // Create a parent mesh to hold all lavender components
        const lavenderParent = new BABYLON.TransformNode(`lavender_${id}`, scene);
        
        // Add ID and group ID as properties for easy access
        lavenderParent.plantId = id;
        lavenderParent.groupId = "lavender";
        
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
        
        // Create the lavender plant components
        createLavenderBase(scene, lavenderParent, position);
        createLavenderStems(scene, lavenderParent, position);
        
        // Position the plant slightly above ground to avoid z-fighting
        lavenderParent.position.y = 0.01;
        
    // Try to load saved position or use the random position
    if (!loadSavedPosition(lavenderParent)) {
        // If no saved position, save the initial random position
        savePosition(lavenderParent);
    }
        
        console.log(`Lavender plant ${id} created successfully`);
        return lavenderParent;
    } catch (error) {
        console.error(`Error creating lavender plant ${id}:`, error);
        return null;
    }
}

// Create the base/soil of the lavender plant
function createLavenderBase(scene, parent, position) {
    // Create base material (soil)
    const baseMaterial = new BABYLON.StandardMaterial("lavenderBaseMaterial", scene);
    baseMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Brown soil color
    
    // Create the base as a small cylinder
    const base = BABYLON.MeshBuilder.CreateCylinder(
        "lavenderBase",
        {
            height: 0.3,
            diameter: 1.2,
            tessellation: 16
        },
        scene
    );
    
    // Position the base
    base.position = new BABYLON.Vector3(
        position.x,
        position.y + 0.15, // Half the height
        position.z
    );
    
    // Apply material
    base.material = baseMaterial;
    
    // Parent to the lavender plant
    base.parent = parent;
    
    return base;
}

// Create the stems and flowers of the lavender plant
function createLavenderStems(scene, parent, position) {
    // Create stem material
    const stemMaterial = new BABYLON.StandardMaterial("lavenderStemMaterial", scene);
    stemMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.6, 0.3); // Green stem color
    
    // Create flower material
    const flowerMaterial = new BABYLON.StandardMaterial("lavenderFlowerMaterial", scene);
    flowerMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.8); // Purple flower color
    
    // Number of stems
    const numStems = 12 + Math.floor(Math.random() * 8); // 12-20 stems
    
    // Create stems in a circular pattern
    for (let i = 0; i < numStems; i++) {
        // Calculate angle for this stem
        const angle = (i / numStems) * Math.PI * 2;
        
        // Calculate offset from center
        const offsetRadius = 0.4 * Math.random() + 0.1; // 0.1 to 0.5
        const offsetX = Math.cos(angle) * offsetRadius;
        const offsetZ = Math.sin(angle) * offsetRadius;
        
        // Stem height varies slightly
        const stemHeight = 1.0 + Math.random() * 0.5; // 1.0 to 1.5
        
        // Create stem
        const stem = BABYLON.MeshBuilder.CreateCylinder(
            `lavenderStem_${i}`,
            {
                height: stemHeight,
                diameter: 0.05,
                tessellation: 8
            },
            scene
        );
        
        // Position stem
        stem.position = new BABYLON.Vector3(
            position.x + offsetX,
            position.y + 0.3 + stemHeight / 2, // Base height + half stem height
            position.z + offsetZ
        );
        
        // Add slight random tilt to stems
        stem.rotation.x = (Math.random() - 0.5) * 0.3;
        stem.rotation.z = (Math.random() - 0.5) * 0.3;
        
        // Apply material
        stem.material = stemMaterial;
        
        // Parent to the lavender plant
        stem.parent = parent;
        
        // Create flower bud at top of stem
        const flower = BABYLON.MeshBuilder.CreateCylinder(
            `lavenderFlower_${i}`,
            {
                height: 0.4,
                diameterTop: 0.05,
                diameterBottom: 0.15,
                tessellation: 8
            },
            scene
        );
        
        // Position flower at top of stem
        flower.position = new BABYLON.Vector3(
            position.x + offsetX + Math.sin(stem.rotation.z) * stemHeight / 2,
            position.y + 0.3 + stemHeight + 0.2, // Base + stem + half flower height
            position.z + offsetZ - Math.sin(stem.rotation.x) * stemHeight / 2
        );
        
        // Match stem rotation
        flower.rotation.x = stem.rotation.x;
        flower.rotation.z = stem.rotation.z;
        
        // Apply material
        flower.material = flowerMaterial;
        
        // Parent to the lavender plant
        flower.parent = parent;
    }
}

// Function to make a lavender plant draggable
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

// Function to save the position of a lavender plant
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
        const savedPlants = JSON.parse(localStorage.getItem('savedLavenderPlants') || '{}');
        savedPlants[plantId] = position;
        localStorage.setItem('savedLavenderPlants', JSON.stringify(savedPlants));
        
        console.log(`Saved position for ${plantId}:`, position);
    } catch (error) {
        console.error("Error saving lavender plant position:", error);
    }
}

// Function to load saved position for a lavender plant
export function loadSavedPosition(plant) {
    try {
        const plantId = plant.plantId;
        const savedPlants = JSON.parse(localStorage.getItem('savedLavenderPlants') || '{}');
        
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

// Function to make all lavender plants in a group draggable
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
