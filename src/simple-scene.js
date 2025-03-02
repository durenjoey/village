import * as BABYLON from '@babylonjs/core';
import { createNordicCabin, makeDraggable as makeCabinDraggable, savePosition as saveCabinPosition, loadSavedPosition as loadCabinPosition } from './cabin';
import { DayNightCycle } from './day-night-cycle';
import { TerrainGenerator } from './terrain';
import { createLavenderPlant, makeDraggable as makePlantDraggable, savePosition as savePlantPosition, makeGroupDraggable } from './lavender';

export async function createSimpleScene(engine) {
    console.log("Creating scene with grass textured ground");
    
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Sky blue color (will be overridden by skybox)
    
    // Add an ArcRotateCamera for easier panning and movement
    const camera = new BABYLON.ArcRotateCamera(
        "arcCamera", 
        0, // Alpha (rotation around Y axis)
        Math.PI / 4,  // Beta (rotation around X axis) - slightly from above
        40,           // Radius (distance from target)
        new BABYLON.Vector3(0, 3, -20), // Target position
        scene
    );
    
    // Set camera limits
    camera.lowerRadiusLimit = 5;   // Minimum zoom distance
    camera.upperRadiusLimit = 200; // Maximum zoom distance - increased for the larger landscape
    camera.wheelDeltaPercentage = 0.01; // Slower zoom speed
    
    // Set camera movement speeds
    camera.panningSensibility = 100; // Lower value = more sensitive panning
    camera.angularSensibilityX = 500; // Horizontal rotation sensitivity
    camera.angularSensibilityY = 500; // Vertical rotation sensitivity
    
    // Enable camera controls
    camera.attachControl(engine.getRenderingCanvas(), true);
    
    // Add keyboard controls for camera movement
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            const speed = 1;
            
            // WASD keys for panning
            if (kbInfo.event.keyCode === 87) { // W key
                camera.target.z += speed;
                camera.position.z += speed;
            }
            if (kbInfo.event.keyCode === 83) { // S key
                camera.target.z -= speed;
                camera.position.z -= speed;
            }
            if (kbInfo.event.keyCode === 65) { // A key
                camera.target.x -= speed;
                camera.position.x -= speed;
            }
            if (kbInfo.event.keyCode === 68) { // D key
                camera.target.x += speed;
                camera.position.x += speed;
            }
            
            // Q and E for height adjustment
            if (kbInfo.event.keyCode === 81) { // Q key
                camera.target.y -= speed;
                camera.position.y -= speed;
            }
            if (kbInfo.event.keyCode === 69) { // E key
                camera.target.y += speed;
                camera.position.y += speed;
            }
            
            // R key to reset camera position
            if (kbInfo.event.keyCode === 82) { // R key
                camera.alpha = 0;
                camera.beta = Math.PI / 4;
                camera.radius = 40;
                camera.target = new BABYLON.Vector3(0, 3, -20);
            }
            
            // C key to view the cabin
            if (kbInfo.event.keyCode === 67) { // C key
                camera.alpha = Math.PI / 6; // Slight angle for better view
                camera.beta = Math.PI / 4;
                camera.radius = 30;
                camera.target = new BABYLON.Vector3(15, 3, -35); // Cabin position
            }
            
            // M key to view the mountains
            if (kbInfo.event.keyCode === 77) { // M key
                camera.alpha = 0; // Directly facing north
                camera.beta = Math.PI / 6; // Lower angle to see mountains better
                camera.radius = 100; // Further back to see the whole range
                camera.target = new BABYLON.Vector3(0, 15, -80); // Look toward mountains (northern edge)
            }
        }
    });
    
    // Add lighting
    // Hemispheric light for ambient illumination
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Darker ground reflection
    
    // Directional light to create shadows and highlight the scene (sun)
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0.5, -0.5, 0.5), scene);
    dirLight.intensity = 0.8;
    dirLight.position = new BABYLON.Vector3(-30, 20, -10);
    
    // Enable shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurScale = 2;
    shadowGenerator.setDarkness(0.3);
    
    // Create skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Sky blue color
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    
    // Create terrain with integrated mountains at the northern boundary
    const terrainGenerator = new TerrainGenerator(scene);
    const ground = await terrainGenerator.createTerrain();
    
    // Create day-night cycle
    const dayNightCycle = new DayNightCycle(scene, {
        dayStart: 5,  // Day starts at 5am
        dayEnd: 19,   // Day ends at 7pm (19:00)
        timeScale: 60, // 1 real second = 1 minute in game
        initialHour: 12 // Start at noon
    });
    
    // Initialize day-night cycle with scene objects
    dayNightCycle.initialize(skybox);
    
    // Create a Skyrim-style Nordic cabin
    console.log("Adding Skyrim-style Nordic cabin");
    const nordicCabin = createNordicCabin(scene, ground, "cabin_1");
    
    // Make the cabin cast shadows
    if (nordicCabin) {
        dayNightCycle.addShadowCaster(nordicCabin);
    }
    
    // Make the ground receive shadows
    ground.receiveShadows = true;
    
    // Create lavender plants
    console.log("Adding lavender plants");
    const lavenderPlants = [];
    for (let i = 1; i <= 25; i++) {
        const plant = createLavenderPlant(scene, ground, i);
        if (plant) {
            lavenderPlants.push(plant);
            dayNightCycle.addShadowCaster(plant);
        }
    }
    
    // Get the dynamic lighting system's shadow generator
    const dynamicLighting = dayNightCycle.getDynamicLighting();
    if (dynamicLighting) {
        const shadowGenerator = dynamicLighting.getShadowGenerator();
        if (shadowGenerator) {
            // Add any additional shadow casters here if needed
        }
    }
    
    // Add scene controls to the UI
    const sceneControls = document.createElement("div");
    sceneControls.style.position = "absolute";
    sceneControls.style.top = "200px";
    sceneControls.style.left = "10px";
    sceneControls.style.color = "white";
    sceneControls.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    sceneControls.style.padding = "10px";
    sceneControls.style.fontFamily = "monospace";
    sceneControls.style.zIndex = "100";
    sceneControls.style.borderRadius = "5px";
    sceneControls.innerHTML = `
        <h4 style="margin-top: 0;">Scene Controls:</h4>
        <div style="margin-bottom: 10px;">
            <button id="viewMountainsBtn" style="width: 100%; margin-bottom: 10px; padding: 5px;">View Mountains</button>
            
            <h5 style="margin-top: 15px; margin-bottom: 5px;">Cabin Controls:</h5>
            <button id="selectCabinBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Select Cabin</button>
            <button id="toggleCabinDragBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Enable Cabin Drag</button>
            <button id="saveCabinPosBtn" style="width: 100%; margin-bottom: 15px; padding: 5px;">Save Cabin Position</button>
            
            <h5 style="margin-top: 15px; margin-bottom: 5px;">Lavender Controls:</h5>
            <div style="display: flex; margin-bottom: 5px;">
                <select id="lavenderSelect" style="flex-grow: 1; margin-right: 5px; padding: 5px;">
                    <option value="all">All Plants</option>
                    ${Array.from({length: 25}, (_, i) => `<option value="${i+1}">Lavender ${i+1}</option>`).join('')}
                </select>
                <button id="viewLavenderBtn" style="padding: 5px;">View</button>
            </div>
            <button id="toggleLavenderDragBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Enable Lavender Drag</button>
            <button id="saveLavenderPosBtn" style="width: 100%; padding: 5px;">Save Lavender Position</button>
        </div>
    `;
    document.body.appendChild(sceneControls);
    
    // Add debug info
    const debugText = document.createElement("div");
    debugText.style.position = "absolute";
    debugText.style.top = "10px";
    debugText.style.left = "10px";
    debugText.style.color = "white";
    debugText.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    debugText.style.padding = "10px";
    debugText.style.fontFamily = "monospace";
    debugText.style.zIndex = "100";
    debugText.style.borderRadius = "5px";
    debugText.innerHTML = `
        <h3 style="margin-top: 0;">Babylon.js Landscape</h3>
        <p>Skyrim-Inspired Scene with Nordic Cabin</p>
        <h4>Camera Controls:</h4>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            <li>Left Mouse: Rotate camera</li>
            <li>Right Mouse: Pan camera</li>
            <li>Mouse Wheel: Zoom in/out</li>
            <li>WASD: Pan camera position</li>
            <li>Q/E: Adjust height</li>
            <li>R: Reset camera position</li>
            <li>C: View the cabin</li>
            <li>M: View the mountains</li>
        </ul>
    `;
    document.body.appendChild(debugText);
    
    // Add event listeners for scene controls
    let cabinDragEnabled = false;
    let lavenderDragEnabled = false;
    let cabinDragBehavior = null;
    let lavenderDragBehaviors = [];
    let selectedLavender = "all";
    
    // Wait for DOM to be ready
    setTimeout(() => {
        const viewMountainsBtn = document.getElementById("viewMountainsBtn");
        const selectCabinBtn = document.getElementById("selectCabinBtn");
        const toggleCabinDragBtn = document.getElementById("toggleCabinDragBtn");
        const saveCabinPosBtn = document.getElementById("saveCabinPosBtn");
        const lavenderSelect = document.getElementById("lavenderSelect");
        const viewLavenderBtn = document.getElementById("viewLavenderBtn");
        const toggleLavenderDragBtn = document.getElementById("toggleLavenderDragBtn");
        const saveLavenderPosBtn = document.getElementById("saveLavenderPosBtn");
        
        if (viewMountainsBtn) {
            viewMountainsBtn.addEventListener("click", () => {
                // Focus camera on mountains
                camera.alpha = 0; // Directly facing north
                camera.beta = Math.PI / 6; // Lower angle to see mountains better
                camera.radius = 100; // Further back to see the whole range
                camera.target = new BABYLON.Vector3(0, 15, -80); // Look toward mountains
            });
        }
        
        if (selectCabinBtn) {
            selectCabinBtn.addEventListener("click", () => {
                // Focus camera on cabin
                camera.alpha = Math.PI / 6;
                camera.beta = Math.PI / 4;
                camera.radius = 30;
                camera.target = new BABYLON.Vector3(
                    nordicCabin.position.x,
                    nordicCabin.position.y + 3,
                    nordicCabin.position.z
                );
                
                // Highlight the cabin
                const highlightLayer = new BABYLON.HighlightLayer("highlightLayer", scene);
                highlightLayer.addMesh(nordicCabin, BABYLON.Color3.Yellow());
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    highlightLayer.dispose();
                }, 2000);
            });
        }
        
        if (toggleCabinDragBtn) {
            toggleCabinDragBtn.addEventListener("click", () => {
                cabinDragEnabled = !cabinDragEnabled;
                
                if (cabinDragEnabled) {
                    // Enable drag behavior
                    cabinDragBehavior = makeCabinDraggable(nordicCabin, scene, ground);
                    toggleCabinDragBtn.textContent = "Disable Cabin Drag";
                    toggleCabinDragBtn.style.backgroundColor = "#ff6347"; // Tomato color
                } else {
                    // Disable drag behavior
                    if (cabinDragBehavior) {
                        nordicCabin.removeBehavior(cabinDragBehavior);
                        cabinDragBehavior = null;
                    }
                    toggleCabinDragBtn.textContent = "Enable Cabin Drag";
                    toggleCabinDragBtn.style.backgroundColor = "";
                }
            });
        }
        
        if (saveCabinPosBtn) {
            saveCabinPosBtn.addEventListener("click", () => {
                // Save cabin position
                saveCabinPosition(nordicCabin);
                
                // Show confirmation
                const savedMsg = document.createElement("div");
                savedMsg.style.position = "absolute";
                savedMsg.style.top = "50%";
                savedMsg.style.left = "50%";
                savedMsg.style.transform = "translate(-50%, -50%)";
                savedMsg.style.color = "white";
                savedMsg.style.backgroundColor = "rgba(0, 128, 0, 0.8)";
                savedMsg.style.padding = "20px";
                savedMsg.style.fontFamily = "monospace";
                savedMsg.style.zIndex = "200";
                savedMsg.style.borderRadius = "5px";
                savedMsg.textContent = "Cabin position saved!";
                document.body.appendChild(savedMsg);
                
                // Remove message after 2 seconds
                setTimeout(() => {
                    document.body.removeChild(savedMsg);
                }, 2000);
            });
        }
        
        // Lavender plant selection
        if (lavenderSelect) {
            lavenderSelect.addEventListener("change", (event) => {
                selectedLavender = event.target.value;
            });
        }
        
        // View selected lavender plant
        if (viewLavenderBtn) {
            viewLavenderBtn.addEventListener("click", () => {
                if (selectedLavender === "all") {
                    // View all lavender plants - center camera on a random plant
                    const randomIndex = Math.floor(Math.random() * lavenderPlants.length);
                    const randomPlant = lavenderPlants[randomIndex];
                    
                    camera.alpha = Math.PI / 4; // 45 degrees
                    camera.beta = Math.PI / 4;  // 45 degrees
                    camera.radius = 20;
                    camera.target = new BABYLON.Vector3(
                        randomPlant.position.x,
                        randomPlant.position.y + 1,
                        randomPlant.position.z
                    );
                } else {
                    // View specific lavender plant
                    const plantIndex = parseInt(selectedLavender) - 1;
                    if (plantIndex >= 0 && plantIndex < lavenderPlants.length) {
                        const plant = lavenderPlants[plantIndex];
                        
                        camera.alpha = Math.PI / 4; // 45 degrees
                        camera.beta = Math.PI / 4;  // 45 degrees
                        camera.radius = 10;
                        camera.target = new BABYLON.Vector3(
                            plant.position.x,
                            plant.position.y + 1,
                            plant.position.z
                        );
                        
                        // Highlight the selected plant
                        const highlightLayer = new BABYLON.HighlightLayer("highlightLayer", scene);
                        highlightLayer.addMesh(plant, BABYLON.Color3.Purple());
                        
                        // Remove highlight after 2 seconds
                        setTimeout(() => {
                            highlightLayer.dispose();
                        }, 2000);
                    }
                }
            });
        }
        
        // Toggle lavender drag mode
        if (toggleLavenderDragBtn) {
            toggleLavenderDragBtn.addEventListener("click", () => {
                lavenderDragEnabled = !lavenderDragEnabled;
                
                if (lavenderDragEnabled) {
                    // Enable drag behavior for selected lavender plants
                    if (selectedLavender === "all") {
                        // Make all plants draggable
                        lavenderDragBehaviors = [];
                        lavenderPlants.forEach(plant => {
                            const behavior = makePlantDraggable(plant, scene, ground);
                            if (behavior) {
                                lavenderDragBehaviors.push({ plant, behavior });
                            }
                        });
                    } else {
                        // Make only the selected plant draggable
                        const plantIndex = parseInt(selectedLavender) - 1;
                        if (plantIndex >= 0 && plantIndex < lavenderPlants.length) {
                            const plant = lavenderPlants[plantIndex];
                            const behavior = makePlantDraggable(plant, scene, ground);
                            if (behavior) {
                                lavenderDragBehaviors = [{ plant, behavior }];
                            }
                        }
                    }
                    
                    toggleLavenderDragBtn.textContent = "Disable Lavender Drag";
                    toggleLavenderDragBtn.style.backgroundColor = "#9370db"; // Medium purple
                } else {
                    // Disable drag behaviors
                    lavenderDragBehaviors.forEach(item => {
                        item.plant.removeBehavior(item.behavior);
                    });
                    lavenderDragBehaviors = [];
                    
                    toggleLavenderDragBtn.textContent = "Enable Lavender Drag";
                    toggleLavenderDragBtn.style.backgroundColor = "";
                }
            });
        }
        
        // Save lavender positions
        if (saveLavenderPosBtn) {
            saveLavenderPosBtn.addEventListener("click", () => {
                // Save positions for selected lavender plants
                if (selectedLavender === "all") {
                    // Save all plants
                    lavenderPlants.forEach(plant => {
                        savePlantPosition(plant);
                    });
                } else {
                    // Save only the selected plant
                    const plantIndex = parseInt(selectedLavender) - 1;
                    if (plantIndex >= 0 && plantIndex < lavenderPlants.length) {
                        savePlantPosition(lavenderPlants[plantIndex]);
                    }
                }
                
                // Show confirmation
                const savedMsg = document.createElement("div");
                savedMsg.style.position = "absolute";
                savedMsg.style.top = "50%";
                savedMsg.style.left = "50%";
                savedMsg.style.transform = "translate(-50%, -50%)";
                savedMsg.style.color = "white";
                savedMsg.style.backgroundColor = "rgba(0, 128, 0, 0.8)";
                savedMsg.style.padding = "20px";
                savedMsg.style.fontFamily = "monospace";
                savedMsg.style.zIndex = "200";
                savedMsg.style.borderRadius = "5px";
                savedMsg.textContent = selectedLavender === "all" 
                    ? "All lavender positions saved!" 
                    : `Lavender ${selectedLavender} position saved!`;
                document.body.appendChild(savedMsg);
                
                // Remove message after 2 seconds
                setTimeout(() => {
                    document.body.removeChild(savedMsg);
                }, 2000);
            });
        }
    }, 1000);
    
    // Add day-night cycle controls to the UI
    const timeControls = document.createElement("div");
    timeControls.style.position = "absolute";
    timeControls.style.bottom = "10px";
    timeControls.style.right = "10px";
    timeControls.style.color = "white";
    timeControls.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    timeControls.style.padding = "10px";
    timeControls.style.fontFamily = "monospace";
    timeControls.style.zIndex = "100";
    timeControls.style.borderRadius = "5px";
    timeControls.innerHTML = `
        <h4 style="margin-top: 0;">Time Controls:</h4>
        <div style="margin-bottom: 5px;">
            <div id="currentSpeed" style="text-align: center; margin-bottom: 5px; font-size: 16px;">Speed: 1x</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <button id="slowDownBtn" style="width: 48%; padding: 5px;">Slower</button>
                <button id="speedUpBtn" style="width: 48%; padding: 5px;">Faster</button>
            </div>
            <button id="resetSpeedBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Reset to 1x</button>
            <button id="setTimeBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Set Time</button>
        </div>
    `;
    document.body.appendChild(timeControls);
    
    // Add event listeners for time controls
    setTimeout(() => {
        const slowDownBtn = document.getElementById("slowDownBtn");
        const speedUpBtn = document.getElementById("speedUpBtn");
        const resetSpeedBtn = document.getElementById("resetSpeedBtn");
        const currentSpeedDisplay = document.getElementById("currentSpeed");
        const setTimeBtn = document.getElementById("setTimeBtn");
        
        // Define time scales including slowdown options
        // Values < 1 are slowdowns, 1 is real-time, values > 1 are speedups
        const timeScales = [
            1/120, 1/60, 1/30, 1/10, 1/5,  // Slowdown options
            1,                             // Real-time
            5, 10, 30, 60, 120             // Speedup options
        ];
        
        // Start at index 5 (real-time, 1x)
        let currentTimeScaleIndex = 5;
        let currentTimeScale = timeScales[currentTimeScaleIndex];
        
        // Format time scale for display
        const formatTimeScale = (scale) => {
            if (scale === 1) return "1x";
            if (scale < 1) {
                // For slowdowns, show as fraction (e.g., 1/120x)
                const denominator = Math.round(1 / scale);
                return `1/${denominator}x`;
            }
            // For speedups, show as multiplier (e.g., 120x)
            return `${scale}x`;
        };
        
        // Update time scale display and apply to day-night cycle
        const updateTimeScale = () => {
            currentTimeScale = timeScales[currentTimeScaleIndex];
            currentSpeedDisplay.textContent = `Speed: ${formatTimeScale(currentTimeScale)}`;
            dayNightCycle.setTimeScale(currentTimeScale * 60); // Convert to minutes per second
            
            // Update button states
            slowDownBtn.disabled = currentTimeScaleIndex === 0;
            speedUpBtn.disabled = currentTimeScaleIndex === timeScales.length - 1;
        };
        
        // Initialize button states
        updateTimeScale();
        
        // Add event listeners for time control buttons
        if (slowDownBtn) {
            slowDownBtn.addEventListener("click", () => {
                if (currentTimeScaleIndex > 0) {
                    currentTimeScaleIndex--;
                    updateTimeScale();
                }
            });
        }
        
        if (speedUpBtn) {
            speedUpBtn.addEventListener("click", () => {
                if (currentTimeScaleIndex < timeScales.length - 1) {
                    currentTimeScaleIndex++;
                    updateTimeScale();
                }
            });
        }
        
        if (resetSpeedBtn) {
            resetSpeedBtn.addEventListener("click", () => {
                currentTimeScaleIndex = 5; // Reset to real-time (1x)
                updateTimeScale();
            });
        }
        
        if (setTimeBtn) {
            setTimeBtn.addEventListener("click", () => {
                // Create a simple time selection dialog
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    hours.push(i);
                }
                
                // Create time selection UI
                const timeDialog = document.createElement("div");
                timeDialog.style.position = "absolute";
                timeDialog.style.top = "50%";
                timeDialog.style.left = "50%";
                timeDialog.style.transform = "translate(-50%, -50%)";
                timeDialog.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                timeDialog.style.color = "white";
                timeDialog.style.padding = "20px";
                timeDialog.style.borderRadius = "10px";
                timeDialog.style.zIndex = "200";
                timeDialog.style.minWidth = "200px";
                
                let timeDialogHTML = `
                    <h3>Set Time</h3>
                    <div style="margin-bottom: 15px;">
                        <select id="hourSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                `;
                
                // Add hour options
                hours.forEach(hour => {
                    const hourStr = hour.toString().padStart(2, '0');
                    const ampm = hour < 12 ? 'AM' : 'PM';
                    const hour12 = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
                    const selected = hour === dayNightCycle.hour ? 'selected' : '';
                    timeDialogHTML += `<option value="${hour}" ${selected}>${hourStr}:00 (${hour12} ${ampm})</option>`;
                });
                
                timeDialogHTML += `
                        </select>
                        <div style="display: flex; justify-content: space-between;">
                            <button id="cancelTimeBtn" style="padding: 5px 10px;">Cancel</button>
                            <button id="setTimeConfirmBtn" style="padding: 5px 10px;">Set Time</button>
                        </div>
                    </div>
                `;
                
                timeDialog.innerHTML = timeDialogHTML;
                document.body.appendChild(timeDialog);
                
                // Add event listeners for dialog buttons
                document.getElementById("cancelTimeBtn").addEventListener("click", () => {
                    document.body.removeChild(timeDialog);
                });
                
                document.getElementById("setTimeConfirmBtn").addEventListener("click", () => {
                    const hourSelect = document.getElementById("hourSelect");
                    const selectedHour = parseInt(hourSelect.value);
                    
                    // Set time in day-night cycle
                    dayNightCycle.setTime(selectedHour, 0);
                    
                    // Remove dialog
                    document.body.removeChild(timeDialog);
                });
            });
        }
    }, 1000);
    
    // Register the day-night cycle to update on each frame
    scene.registerBeforeRender(() => {
        dayNightCycle.update();
    });
    
    console.log("Basic scene created successfully");
    return scene;
}
