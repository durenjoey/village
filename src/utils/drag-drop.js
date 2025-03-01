/**
 * Drag and Drop utility for the Simple Land Simulation
 * Allows users to select and move objects in the scene
 */

/**
 * DragDropManager handles object selection, movement, and position saving
 */
class DragDropManager {
    /**
     * Create a new DragDropManager
     * @param {World} world - The world instance
     */
    constructor(world) {
        this.world = world;
        this.scene = world.scene;
        this.camera = world.camera;
        this.renderer = world.renderer;
        
        // Raycaster for object selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Currently selected object
        this.selectedObject = null;
        this.originalPosition = new THREE.Vector3();
        this.originalRotation = 0;
        this.dragOffset = new THREE.Vector3();
        this.dragPlane = new THREE.Plane();
        
        // Rotation settings
        this.rotationStep = Math.PI / 12; // 15 degrees
        
        // Edit mode state
        this.editMode = false;
        
        // Visual helpers
        this.selectionHelper = null;
        this.createSelectionHelper();
        
        // Auto-save settings
        this.autoSave = true;
        this.lastSaveTime = Date.now();
        this.saveInterval = 30000; // 30 seconds
        
        // Bind methods to maintain 'this' context
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        
        // Initialize
        this.init();
        
        if (window.Logger) {
            Logger.info('DragDropManager initialized');
        } else {
            console.log('DragDropManager initialized');
        }
    }
    
    /**
     * Initialize the drag and drop manager
     */
    init() {
        // Create UI elements
        this.createUI();
        
        // Add event listeners
        window.addEventListener('mousedown', this.onMouseDown, false);
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('mouseup', this.onMouseUp, false);
        window.addEventListener('keydown', this.onKeyDown, false);
        
        // Disable OrbitControls when in edit mode
        this.originalOrbitControlsEnabled = this.world.controls.enabled;
    }
    
    /**
     * Create UI elements for drag and drop functionality
     */
    createUI() {
        // Create edit mode indicator
        this.editModeIndicator = document.createElement('div');
        this.editModeIndicator.id = 'edit-mode-indicator';
        this.editModeIndicator.style.position = 'absolute';
        this.editModeIndicator.style.top = '50px';
        this.editModeIndicator.style.left = '10px';
        this.editModeIndicator.style.color = 'white';
        this.editModeIndicator.style.backgroundColor = 'rgba(0, 150, 0, 0.7)';
        this.editModeIndicator.style.padding = '10px';
        this.editModeIndicator.style.borderRadius = '5px';
        this.editModeIndicator.style.fontFamily = 'Arial, sans-serif';
        this.editModeIndicator.style.fontSize = '14px';
        this.editModeIndicator.style.display = 'none';
        this.editModeIndicator.innerHTML = 'EDIT MODE: Click and drag objects to move them';
        document.body.appendChild(this.editModeIndicator);
        
        // Create save button
        this.saveButton = document.createElement('button');
        this.saveButton.id = 'save-layout-button';
        this.saveButton.style.position = 'absolute';
        this.saveButton.style.top = '10px';
        this.saveButton.style.right = '10px';
        this.saveButton.style.padding = '8px 15px';
        this.saveButton.style.backgroundColor = '#4CAF50';
        this.saveButton.style.color = 'white';
        this.saveButton.style.border = 'none';
        this.saveButton.style.borderRadius = '5px';
        this.saveButton.style.cursor = 'pointer';
        this.saveButton.style.fontFamily = 'Arial, sans-serif';
        this.saveButton.style.fontSize = '14px';
        this.saveButton.style.display = 'none';
        this.saveButton.innerHTML = 'Save Layout';
        this.saveButton.addEventListener('click', () => this.saveLayout());
        document.body.appendChild(this.saveButton);
        
        // Create save notification
        this.saveNotification = document.createElement('div');
        this.saveNotification.id = 'save-notification';
        this.saveNotification.style.position = 'absolute';
        this.saveNotification.style.top = '50px';
        this.saveNotification.style.right = '10px';
        this.saveNotification.style.padding = '10px';
        this.saveNotification.style.backgroundColor = 'rgba(0, 150, 0, 0.7)';
        this.saveNotification.style.color = 'white';
        this.saveNotification.style.borderRadius = '5px';
        this.saveNotification.style.fontFamily = 'Arial, sans-serif';
        this.saveNotification.style.fontSize = '14px';
        this.saveNotification.style.opacity = '0';
        this.saveNotification.style.transition = 'opacity 0.5s ease-in-out';
        this.saveNotification.innerHTML = 'Layout Saved!';
        document.body.appendChild(this.saveNotification);
        
        // Update info panel with edit mode instructions
        const infoElement = document.getElementById('info');
        if (infoElement) {
            this.originalInfoContent = infoElement.innerHTML;
        }
    }
    
    /**
     * Create a visual helper for selected objects
     */
    createSelectionHelper() {
        // Create a wireframe box to show around selected objects
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        
        this.selectionHelper = new THREE.Mesh(geometry, material);
        this.selectionHelper.visible = false;
        this.scene.add(this.selectionHelper);
    }
    
    /**
     * Toggle edit mode on/off
     */
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        // Update UI
        this.editModeIndicator.style.display = this.editMode ? 'block' : 'none';
        this.saveButton.style.display = this.editMode ? 'block' : 'none';
        
        // Toggle orbit controls
        this.world.controls.enabled = this.editMode ? false : this.originalOrbitControlsEnabled;
        
        // Update info panel
        const infoElement = document.getElementById('info');
        if (infoElement) {
            if (this.editMode) {
                infoElement.innerHTML = `
                    Edit Mode Controls:<br>
                    <small>
                        - Click and drag objects to move them<br>
                        - Left/Right Arrow keys to rotate selected object<br>
                        - Press E to exit edit mode<br>
                        - Press S to save layout<br>
                        - Objects cannot overlap
                    </small>
                `;
            } else {
                infoElement.innerHTML = this.originalInfoContent;
                
                // Auto-save when exiting edit mode if enabled
                if (this.autoSave) {
                    this.saveLayout();
                }
            }
        }
        
        if (window.Logger) {
            Logger.info(`Edit mode ${this.editMode ? 'enabled' : 'disabled'}`);
        } else {
            console.log(`Edit mode ${this.editMode ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseDown(event) {
        if (!this.editMode) return;
        
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersected objects
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        // Filter for draggable objects (houses, trees, etc.)
        const draggableIntersects = intersects.filter(intersect => {
            // Traverse up to find the parent object with userData
            let object = intersect.object;
            while (object && (!object.userData || !object.userData.type)) {
                object = object.parent;
            }
            
            // Check if it's a draggable type
            return object && object.userData && 
                   (object.userData.type === 'house' || 
                    object.userData.type === 'tree' ||
                    object.userData.type === 'market_stand' ||
                    object.userData.type === 'blacksmith');
        });
        
        if (draggableIntersects.length > 0) {
            // Get the first intersected draggable object
            let intersect = draggableIntersects[0];
            let object = intersect.object;
            
            // Traverse up to find the parent object with userData
            while (object && (!object.userData || !object.userData.type)) {
                object = object.parent;
            }
            
            if (object) {
                // Disable orbit controls while dragging
                this.world.controls.enabled = false;
                
                // Store the selected object
                this.selectedObject = object;
                
                // Store original position and rotation
                this.originalPosition.copy(this.selectedObject.position);
                this.originalRotation = this.selectedObject.rotation.y;
                
                // Calculate drag offset
                const intersectionPoint = intersect.point;
                this.dragOffset.copy(this.selectedObject.position).sub(intersectionPoint);
                
                // Create a drag plane perpendicular to the camera
                this.dragPlane.setFromNormalAndCoplanarPoint(
                    this.camera.getWorldDirection(new THREE.Vector3()),
                    intersectionPoint
                );
                
                // Update selection helper
                this.updateSelectionHelper();
                
                if (window.Logger) {
                    Logger.debug(`Selected object: ${object.userData.type} ${object.userData.id}`);
                } else {
                    console.log(`Selected object: ${object.userData.type} ${object.userData.id}`);
                }
            }
        }
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseMove(event) {
        if (!this.editMode || !this.selectedObject) return;
        
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersection with the drag plane
        const ray = this.raycaster.ray;
        const intersectionPoint = new THREE.Vector3();
        
        if (this.dragPlane.intersectLine(
            new THREE.Line3(ray.origin, ray.origin.clone().add(ray.direction.clone().multiplyScalar(1000))),
            intersectionPoint
        )) {
            // Calculate new position
            const newPosition = intersectionPoint.add(this.dragOffset);
            
            // Keep y position constant (objects stay on the ground)
            newPosition.y = this.originalPosition.y;
            
            // Update object position
            this.selectedObject.position.copy(newPosition);
            
            // Update selection helper
            this.updateSelectionHelper();
            
            // Check for collisions
            this.checkCollisions();
        }
    }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseUp(event) {
        if (!this.editMode || !this.selectedObject) return;
        
        // Check for final collisions
        const hasCollision = this.checkCollisions();
        
        if (hasCollision) {
            // Revert to original position if there's a collision
            this.selectedObject.position.copy(this.originalPosition);
            
            if (window.Logger) {
                Logger.debug(`Reverted object position due to collision`);
            } else {
                console.log(`Reverted object position due to collision`);
            }
        } else {
            // Save the new position
            this.saveObjectPosition(this.selectedObject);
            
            if (window.Logger) {
                Logger.debug(`Moved object to new position: ${this.selectedObject.position.x.toFixed(2)}, ${this.selectedObject.position.z.toFixed(2)}`);
            } else {
                console.log(`Moved object to new position: ${this.selectedObject.position.x.toFixed(2)}, ${this.selectedObject.position.z.toFixed(2)}`);
            }
        }
        
        // Clear selection
        this.selectedObject = null;
        this.selectionHelper.visible = false;
        
        // Re-enable orbit controls if not in edit mode
        if (!this.editMode) {
            this.world.controls.enabled = this.originalOrbitControlsEnabled;
        }
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyDown(event) {
        // Toggle edit mode with 'E' key
        if (event.key === 'e' || event.key === 'E') {
            this.toggleEditMode();
        }
        
        // Save layout with 'S' key
        if ((event.key === 's' || event.key === 'S') && this.editMode) {
            this.saveLayout();
        }
        
        // Save layout with Ctrl+S
        if (event.key === 's' && event.ctrlKey) {
            event.preventDefault(); // Prevent browser save dialog
            this.saveLayout();
        }
        
        // Handle rotation with arrow keys when an object is selected
        if (this.editMode && this.selectedObject) {
            switch (event.key) {
                case 'ArrowLeft':
                    // Rotate counterclockwise
                    this.selectedObject.rotation.y += this.rotationStep;
                    this.updateSelectionHelper();
                    
                    if (window.Logger) {
                        Logger.debug(`Rotated object counterclockwise: ${this.selectedObject.rotation.y.toFixed(2)} radians`);
                    } else {
                        console.log(`Rotated object counterclockwise: ${this.selectedObject.rotation.y.toFixed(2)} radians`);
                    }
                    break;
                    
                case 'ArrowRight':
                    // Rotate clockwise
                    this.selectedObject.rotation.y -= this.rotationStep;
                    this.updateSelectionHelper();
                    
                    if (window.Logger) {
                        Logger.debug(`Rotated object clockwise: ${this.selectedObject.rotation.y.toFixed(2)} radians`);
                    } else {
                        console.log(`Rotated object clockwise: ${this.selectedObject.rotation.y.toFixed(2)} radians`);
                    }
                    break;
            }
            
            // Check for collisions after rotation
            const hasCollision = this.checkCollisions();
            
            if (hasCollision) {
                // Revert to original rotation if there's a collision
                this.selectedObject.rotation.y = this.originalRotation;
                
                if (window.Logger) {
                    Logger.debug(`Reverted object rotation due to collision`);
                } else {
                    console.log(`Reverted object rotation due to collision`);
                }
            } else {
                // Save the new rotation
                this.saveObjectPosition(this.selectedObject);
            }
        }
    }
    
    /**
     * Update the selection helper to match the selected object
     */
    updateSelectionHelper() {
        if (!this.selectedObject) {
            this.selectionHelper.visible = false;
            return;
        }
        
        // Make helper visible
        this.selectionHelper.visible = true;
        
        // Get object bounds
        const box = new THREE.Box3().setFromObject(this.selectedObject);
        const size = box.getSize(new THREE.Vector3());
        
        // Update helper size and position
        this.selectionHelper.scale.set(size.x, size.y, size.z);
        this.selectionHelper.position.copy(this.selectedObject.position);
        this.selectionHelper.rotation.copy(this.selectedObject.rotation);
        
        // Adjust helper color based on collision state
        const hasCollision = this.checkCollisions(true); // Just check, don't log
        this.selectionHelper.material.color.set(hasCollision ? 0xff0000 : 0x00ff00);
    }
    
    /**
     * Check for collisions with other objects
     * @param {boolean} [silentCheck=false] - Whether to suppress logging
     * @returns {boolean} True if there's a collision, false otherwise
     */
    checkCollisions(silentCheck = false) {
        if (!this.selectedObject) return false;
        
        // Get all objects in the scene
        const objects = [];
        this.scene.traverse(object => {
            // Only check objects with userData and a type
            if (object.userData && object.userData.type && object !== this.selectedObject) {
                // Only check houses, trees, and other structures
                if (['house', 'tree', 'market_stand', 'blacksmith', 'temple'].includes(object.userData.type)) {
                    objects.push(object);
                }
            }
        });
        
        // Get selected object bounds
        const selectedBox = new THREE.Box3().setFromObject(this.selectedObject);
        
        // Check for collisions with each object
        for (const object of objects) {
            const objectBox = new THREE.Box3().setFromObject(object);
            
            // Check if boxes intersect
            if (selectedBox.intersectsBox(objectBox)) {
                if (!silentCheck && window.Logger) {
                    Logger.debug(`Collision detected with ${object.userData.type} ${object.userData.id}`);
                } else if (!silentCheck) {
                    console.log(`Collision detected with ${object.userData.type} ${object.userData.id}`);
                }
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Save an object's position to localStorage
     * @param {THREE.Object3D} object - The object to save
     */
    saveObjectPosition(object) {
        if (!object || !object.userData || !object.userData.id) return;
        
        const objectType = object.userData.type;
        const objectId = object.userData.id;
        
        // Create a storage key based on object type and ID
        const storageKey = `${objectType}_${objectId}_position`;
        
        // Create position data
        const positionData = {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z,
            rotationY: object.rotation.y,
            timestamp: Date.now()
        };
        
        try {
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(positionData));
            
            if (window.Logger) {
                Logger.debug(`Saved position for ${objectType} ${objectId}`);
            } else {
                console.log(`Saved position for ${objectType} ${objectId}`);
            }
        } catch (e) {
            if (window.Logger) {
                Logger.error(`Failed to save position: ${e.message}`);
            } else {
                console.error(`Failed to save position: ${e.message}`);
            }
        }
    }
    
    /**
     * Load an object's position from localStorage
     * @param {THREE.Object3D} object - The object to load position for
     * @returns {boolean} True if position was loaded, false otherwise
     */
    loadObjectPosition(object) {
        if (!object || !object.userData || !object.userData.id) return false;
        
        const objectType = object.userData.type;
        const objectId = object.userData.id;
        
        // Create a storage key based on object type and ID
        const storageKey = `${objectType}_${objectId}_position`;
        
        try {
            // Load from localStorage
            const positionData = localStorage.getItem(storageKey);
            
            if (positionData) {
                const position = JSON.parse(positionData);
                
                // Update object position
                object.position.set(position.x, position.y, position.z);
                
                // Update rotation if available
                if (position.rotationY !== undefined) {
                    object.rotation.y = position.rotationY;
                }
                
                if (window.Logger) {
                    Logger.debug(`Loaded position for ${objectType} ${objectId}`);
                } else {
                    console.log(`Loaded position for ${objectType} ${objectId}`);
                }
                
                return true;
            }
        } catch (e) {
            if (window.Logger) {
                Logger.error(`Failed to load position: ${e.message}`);
            } else {
                console.error(`Failed to load position: ${e.message}`);
            }
        }
        
        return false;
    }
    
    /**
     * Save the entire layout to localStorage
     */
    saveLayout() {
        // Get all objects in the scene
        const objects = [];
        this.scene.traverse(object => {
            // Only save objects with userData and a type
            if (object.userData && object.userData.id && 
                ['house', 'tree', 'market_stand', 'blacksmith', 'temple'].includes(object.userData.type)) {
                objects.push(object);
            }
        });
        
        // Save each object's position
        let savedCount = 0;
        for (const object of objects) {
            this.saveObjectPosition(object);
            savedCount++;
        }
        
        // Update last save time
        this.lastSaveTime = Date.now();
        
        // Show save notification
        this.showSaveNotification(savedCount);
        
        if (window.Logger) {
            Logger.info(`Saved layout with ${savedCount} objects`);
        } else {
            console.log(`Saved layout with ${savedCount} objects`);
        }
    }
    
    /**
     * Show a save notification
     * @param {number} count - Number of objects saved
     */
    showSaveNotification(count) {
        // Update notification text
        this.saveNotification.innerHTML = `Layout Saved! (${count} objects)`;
        
        // Show notification
        this.saveNotification.style.opacity = '1';
        
        // Hide notification after 2 seconds
        setTimeout(() => {
            this.saveNotification.style.opacity = '0';
        }, 2000);
    }
    
    /**
     * Load positions for all objects in the scene
     */
    loadAllPositions() {
        // First, try to find the terrain entity and use its loadSavedPositions method
        let terrainEntity = null;
        
        // Find terrain entity in the world
        for (const entity of this.world.entities) {
            if (entity.type === 'terrain' && entity.loadSavedPositions) {
                terrainEntity = entity;
                break;
            }
        }
        
        if (terrainEntity) {
            // Use terrain's built-in method to load positions
            terrainEntity.loadSavedPositions();
            
            if (window.Logger) {
                Logger.info('Used terrain entity to load saved positions');
            } else {
                console.log('Used terrain entity to load saved positions');
            }
            
            return;
        }
        
        // Fallback: Load positions directly if terrain entity not found
        if (window.Logger) {
            Logger.warn('Terrain entity not found, using fallback method to load positions');
        } else {
            console.warn('Terrain entity not found, using fallback method to load positions');
        }
        
        // Get all objects in the scene
        const objects = [];
        this.scene.traverse(object => {
            // Only load objects with userData and a type
            if (object.userData && object.userData.id && 
                ['house', 'tree', 'market_stand', 'blacksmith', 'temple'].includes(object.userData.type)) {
                objects.push(object);
            }
        });
        
        // Load each object's position
        let loadedCount = 0;
        for (const object of objects) {
            if (this.loadObjectPosition(object)) {
                loadedCount++;
            }
        }
        
        if (window.Logger) {
            Logger.info(`Loaded positions for ${loadedCount} objects using fallback method`);
        } else {
            console.log(`Loaded positions for ${loadedCount} objects using fallback method`);
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    dispose() {
        // Remove event listeners
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('keydown', this.onKeyDown);
        
        // Remove UI elements
        if (this.editModeIndicator && this.editModeIndicator.parentNode) {
            this.editModeIndicator.parentNode.removeChild(this.editModeIndicator);
        }
        
        if (this.saveButton && this.saveButton.parentNode) {
            this.saveButton.parentNode.removeChild(this.saveButton);
        }
        
        if (this.saveNotification && this.saveNotification.parentNode) {
            this.saveNotification.parentNode.removeChild(this.saveNotification);
        }
        
        // Remove selection helper
        if (this.selectionHelper) {
            this.scene.remove(this.selectionHelper);
            this.selectionHelper.geometry.dispose();
            this.selectionHelper.material.dispose();
        }
        
        // Restore original info content
        const infoElement = document.getElementById('info');
        if (infoElement && this.originalInfoContent) {
            infoElement.innerHTML = this.originalInfoContent;
        }
        
        // Restore orbit controls
        if (this.world && this.world.controls) {
            this.world.controls.enabled = this.originalOrbitControlsEnabled;
        }
    }
}

// Export the DragDropManager
window.DragDropManager = DragDropManager;
