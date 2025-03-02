import * as BABYLON from '@babylonjs/core';
import { createNordicCabin, makeDraggable, savePosition, loadSavedPosition } from './cabin';
import { DayNightCycle } from './day-night-cycle';

export function createSimpleScene(engine) {
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
    
    // Create a larger ground with grass texture to accommodate the river
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 200}, scene);
    
    // Create day-night cycle
    const dayNightCycle = new DayNightCycle(scene, {
        dayStart: 5,  // Day starts at 5am
        dayEnd: 19,   // Day ends at 7pm (19:00)
        timeScale: 60, // 1 real second = 1 minute in game
        initialHour: 12 // Start at noon
    });
    
    // Initialize day-night cycle with scene objects
    dayNightCycle.initialize(skybox, dirLight, hemiLight);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    
    // Apply grass texture with error handling
    try {
        console.log("Loading grass texture...");
        const grassTexture = new BABYLON.Texture("textures/grass.jpg", scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE, 
            function() {
                console.log("Grass texture loaded successfully");
            }, 
            function(error) {
                console.error("Error loading grass texture:", error);
                // Fallback to color if texture fails to load
                groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
            }
        );
        
        // Set texture scaling to avoid obvious repetition
        grassTexture.uScale = 20;
        grassTexture.vScale = 20;
        groundMaterial.diffuseTexture = grassTexture;
        
        // Apply bump texture for depth
        console.log("Loading grass bump texture...");
        const bumpTexture = new BABYLON.Texture("textures/grass_bump.jpg", scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
            function() {
                console.log("Grass bump texture loaded successfully");
            },
            function(error) {
                console.error("Error loading grass bump texture:", error);
            }
        );
        
        bumpTexture.uScale = 20;
        bumpTexture.vScale = 20;
        groundMaterial.bumpTexture = bumpTexture;
        groundMaterial.bumpTexture.level = 0.8; // Adjust bump intensity
        
        // Optimize material properties for grass
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularPower = 64;
        
    } catch (e) {
        console.error("Exception while setting up grass texture:", e);
        // Fallback to a simple color if textures fail to load
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    }
    
    ground.material = groundMaterial;
    
    // Create a Skyrim-style Nordic cabin
    console.log("Adding Skyrim-style Nordic cabin");
    const nordicCabin = createNordicCabin(scene, ground, "cabin_1");
    
    // Make the cabin cast shadows
    if (nordicCabin && nordicCabin.getChildMeshes) {
        const cabinMeshes = nordicCabin.getChildMeshes();
        cabinMeshes.forEach(mesh => {
            shadowGenerator.addShadowCaster(mesh);
        });
    } else if (nordicCabin) {
        shadowGenerator.addShadowCaster(nordicCabin);
    }
    
    // Make the ground receive shadows
    ground.receiveShadows = true;
    
    // Add cabin controls to the UI
    const cabinControls = document.createElement("div");
    cabinControls.style.position = "absolute";
    cabinControls.style.top = "200px";
    cabinControls.style.left = "10px";
    cabinControls.style.color = "white";
    cabinControls.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    cabinControls.style.padding = "10px";
    cabinControls.style.fontFamily = "monospace";
    cabinControls.style.zIndex = "100";
    cabinControls.style.borderRadius = "5px";
    cabinControls.innerHTML = `
        <h4 style="margin-top: 0;">Cabin Controls:</h4>
        <div style="margin-bottom: 10px;">
            <button id="selectCabinBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Select Cabin</button>
            <button id="toggleDragBtn" style="width: 100%; margin-bottom: 5px; padding: 5px;">Enable Drag Mode</button>
            <button id="savePosBtn" style="width: 100%; padding: 5px;">Save Position</button>
        </div>
    `;
    document.body.appendChild(cabinControls);
    
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
        </ul>
    `;
    document.body.appendChild(debugText);
    
    // Add event listeners for cabin controls
    let dragEnabled = false;
    let cabinDragBehavior = null;
    
    // Wait for DOM to be ready
    setTimeout(() => {
        const selectCabinBtn = document.getElementById("selectCabinBtn");
        const toggleDragBtn = document.getElementById("toggleDragBtn");
        const savePosBtn = document.getElementById("savePosBtn");
        
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
        
        if (toggleDragBtn) {
            toggleDragBtn.addEventListener("click", () => {
                dragEnabled = !dragEnabled;
                
                if (dragEnabled) {
                    // Enable drag behavior
                    cabinDragBehavior = makeDraggable(nordicCabin, scene, ground);
                    toggleDragBtn.textContent = "Disable Drag Mode";
                    toggleDragBtn.style.backgroundColor = "#ff6347"; // Tomato color
                } else {
                    // Disable drag behavior
                    if (cabinDragBehavior) {
                        nordicCabin.removeBehavior(cabinDragBehavior);
                        cabinDragBehavior = null;
                    }
                    toggleDragBtn.textContent = "Enable Drag Mode";
                    toggleDragBtn.style.backgroundColor = "";
                }
            });
        }
        
        if (savePosBtn) {
            savePosBtn.addEventListener("click", () => {
                // Save cabin position
                savePosition(nordicCabin);
                
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
