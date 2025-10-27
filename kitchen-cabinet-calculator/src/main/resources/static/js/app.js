// Kitchen Cabinet Cost Calculator - Main Application
class KitchenCalculator {
    constructor() {
        this.walls = [];
        this.currentWallIndex = null;
        this.scale = 20; // pixels per foot
        this.canvas = document.getElementById('elevation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wallLabels = ['A', 'B', 'C', 'D'];
        this.currentUnit = 'feet'; // Default unit
        this.unitSymbol = 'ft';
        this.currentCabinetSystem = 'european-metric'; // Default cabinet system
        this.selectedCabinets = []; // Cabinets selected for placement (checkbox selection)
        this.placedCabinets = []; // Cabinets actually placed on walls  
        this.placementCanvas = document.getElementById('placement-canvas');
        this.placementCtx = this.placementCanvas ? this.placementCanvas.getContext('2d') : null;
        this.selectedWallForPlacement = null; // Wall selected in placement tab
        this.draggedCabinet = null; // Cabinet being dragged
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateDisplay();
    }

    convertToFeet(value) {
        switch(this.currentUnit) {
            case 'meters':
                return value * 3.28084; // meters to feet
            case 'millimeters':
                return value / 304.8; // mm to feet
            case 'feet':
            default:
                return value;
        }
    }

    convertFromFeet(value) {
        switch(this.currentUnit) {
            case 'meters':
                return value / 3.28084; // feet to meters
            case 'millimeters':
                return value * 304.8; // feet to mm
            case 'feet':
            default:
                return value;
        }
    }

    getUnitSymbol() {
        switch(this.currentUnit) {
            case 'meters':
                return 'm';
            case 'millimeters':
                return 'mm';
            case 'feet':
            default:
                return 'ft';
        }
    }

    formatDimension(valueInFeet) {
        const converted = this.convertFromFeet(valueInFeet);
        const symbol = this.getUnitSymbol();
        
        if (this.currentUnit === 'millimeters') {
            return `${Math.round(converted)}${symbol}`;
        } else {
            return `${converted.toFixed(2)}${symbol}`;
        }
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = 600;
        
        if (this.placementCanvas) {
            this.placementCanvas.width = this.placementCanvas.offsetWidth;
            this.placementCanvas.height = 600;
        }
    }

    setupEventListeners() {
        // Unit selector
        document.getElementById('unit-select').addEventListener('change', (e) => {
            this.currentUnit = e.target.value;
            this.unitSymbol = this.getUnitSymbol();
            this.updateDisplay();
        });

        // Cabinet system selector in placement tab
        const placementCabinetSystem = document.getElementById('placement-cabinet-system');
        if (placementCabinetSystem) {
            placementCabinetSystem.addEventListener('change', (e) => {
                this.currentCabinetSystem = e.target.value;
                this.loadCabinetSelectionList();
            });
        }

        // Cabinet search box
        const cabinetSearch = document.getElementById('cabinet-search');
        if (cabinetSearch) {
            cabinetSearch.addEventListener('input', (e) => {
                this.filterCabinets(e.target.value);
            });
        }

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Add Wall Button
        document.getElementById('add-wall-btn').addEventListener('click', () => {
            if (this.walls.length < 4) {
                this.showWallForm();
            } else {
                alert('Maximum 4 walls (A, B, C, D) allowed');
            }
        });

        // Wall Form
        document.getElementById('wall-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWall();
        });

        document.getElementById('cancel-wall-btn').addEventListener('click', () => {
            this.hideWallForm();
        });

        // Add Door/Window Buttons
        document.getElementById('add-door-btn').addEventListener('click', () => {
            this.addDoorInput();
        });

        document.getElementById('add-window-btn').addEventListener('click', () => {
            this.addWindowInput();
        });

        // Zoom controls
        document.getElementById('zoom-in-btn').addEventListener('click', () => {
            this.scale *= 1.2;
            this.drawElevation();
        });

        document.getElementById('zoom-out-btn').addEventListener('click', () => {
            this.scale /= 1.2;
            this.drawElevation();
        });

        document.getElementById('reset-view-btn').addEventListener('click', () => {
            this.scale = 20;
            this.drawElevation();
        });

        // PLACEMENT: Wall selection
        const placementWallSelect = document.getElementById('placement-wall-select');
        if (placementWallSelect) {
            placementWallSelect.addEventListener('change', (e) => {
                this.selectedWallForPlacement = e.target.value ? parseInt(e.target.value) : null;
                this.drawPlacementCanvas();
            });
        }

        // PLACEMENT: Place selected cabinets button
        const placeSelectedBtn = document.getElementById('place-selected-btn');
        if (placeSelectedBtn) {
            placeSelectedBtn.addEventListener('click', () => {
                this.placeSelectedCabinets();
            });
        }

        // PLACEMENT: Auto-fill button
        const autoFillBtn = document.getElementById('auto-fill-btn');
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => {
                this.autoFillSpaces();
            });
        }

        // PLACEMENT: Clear all cabinets
        const clearPlacementBtn = document.getElementById('clear-placement-btn');
        if (clearPlacementBtn) {
            clearPlacementBtn.addEventListener('click', () => {
                this.clearAllCabinets();
            });
        }

        // PLACEMENT: Canvas mouse events for dragging
        if (this.placementCanvas) {
            this.placementCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            this.placementCanvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            this.placementCanvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawElevation();
            if (this.placementCanvas) {
                this.drawPlacementCanvas();
            }
        });
    }

    showWallForm() {
        const formSection = document.getElementById('wall-form-section');
        const wallLabel = this.wallLabels[this.walls.length];
        document.getElementById('wall-form-title').textContent = `Configure Wall ${wallLabel}`;
        
        // Update labels with current unit
        const unit = this.getUnitSymbol();
        document.querySelector('label[for="wall-length"]').textContent = `Wall Length (${unit}):`;
        document.querySelector('label[for="wall-height"]').textContent = `Wall Height (${unit}):`;
        
        // Reset form
        document.getElementById('wall-form').reset();
        document.getElementById('doors-container').innerHTML = '';
        document.getElementById('windows-container').innerHTML = '';
        
        formSection.style.display = 'block';
        formSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideWallForm() {
        document.getElementById('wall-form-section').style.display = 'none';
        this.currentWallIndex = null;
    }

    addDoorInput() {
        const template = document.getElementById('door-template');
        const clone = template.content.cloneNode(true);
        const container = document.getElementById('doors-container');
        
        // Add remove functionality
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.opening-input').remove();
        });
        
        container.appendChild(clone);
    }

    addWindowInput() {
        const template = document.getElementById('window-template');
        const clone = template.content.cloneNode(true);
        const container = document.getElementById('windows-container');
        
        // Add remove functionality
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.opening-input').remove();
        });
        
        container.appendChild(clone);
    }

    saveWall() {
        const length = this.convertToFeet(parseFloat(document.getElementById('wall-length').value));
        const height = this.convertToFeet(parseFloat(document.getElementById('wall-height').value));
        
        // Collect doors
        const doors = [];
        document.querySelectorAll('#doors-container .opening-input').forEach(doorEl => {
            doors.push({
                width: this.convertToFeet(parseFloat(doorEl.querySelector('.door-width').value)),
                height: this.convertToFeet(parseFloat(doorEl.querySelector('.door-height').value)),
                distanceFromLeft: this.convertToFeet(parseFloat(doorEl.querySelector('.door-distance').value))
            });
        });

        // Collect windows
        const windows = [];
        document.querySelectorAll('#windows-container .opening-input').forEach(windowEl => {
            windows.push({
                width: this.convertToFeet(parseFloat(windowEl.querySelector('.window-width').value)),
                height: this.convertToFeet(parseFloat(windowEl.querySelector('.window-height').value)),
                distanceFromLeft: this.convertToFeet(parseFloat(windowEl.querySelector('.window-distance').value)),
                distanceFromFloor: this.convertToFeet(parseFloat(windowEl.querySelector('.window-floor-distance').value))
            });
        });

        if (this.currentWallIndex !== null) {
            // Editing existing wall
            const wall = this.walls[this.currentWallIndex];
            wall.length = length;
            wall.height = height;
            wall.doors = doors;
            wall.windows = windows;
        } else {
            // Adding new wall
            const wallLabel = this.wallLabels[this.walls.length];
            const wall = {
                label: wallLabel,
                length,
                height,
                doors,
                windows
            };
            this.walls.push(wall);
        }

        this.hideWallForm();
        this.updateDisplay();
    }

    deleteWall(index) {
        if (confirm(`Delete Wall ${this.walls[index].label}?`)) {
            this.walls.splice(index, 1);
            // Relabel remaining walls
            this.walls.forEach((wall, i) => {
                wall.label = this.wallLabels[i];
            });
            this.updateDisplay();
        }
    }

    editWall(index) {
        const wall = this.walls[index];
        this.currentWallIndex = index;
        
        // Show form
        const formSection = document.getElementById('wall-form-section');
        document.getElementById('wall-form-title').textContent = `Edit Wall ${wall.label}`;
        
        // Populate form with existing data
        document.getElementById('wall-length').value = this.convertFromFeet(wall.length).toFixed(2);
        document.getElementById('wall-height').value = this.convertFromFeet(wall.height).toFixed(2);
        
        // Clear and populate doors
        const doorsContainer = document.getElementById('doors-container');
        doorsContainer.innerHTML = '';
        wall.doors.forEach(door => {
            this.addDoorInput();
            const doorEl = doorsContainer.lastElementChild;
            doorEl.querySelector('.door-width').value = this.convertFromFeet(door.width).toFixed(2);
            doorEl.querySelector('.door-height').value = this.convertFromFeet(door.height).toFixed(2);
            doorEl.querySelector('.door-distance').value = this.convertFromFeet(door.distanceFromLeft).toFixed(2);
        });
        
        // Clear and populate windows
        const windowsContainer = document.getElementById('windows-container');
        windowsContainer.innerHTML = '';
        wall.windows.forEach(window => {
            this.addWindowInput();
            const windowEl = windowsContainer.lastElementChild;
            windowEl.querySelector('.window-width').value = this.convertFromFeet(window.width).toFixed(2);
            windowEl.querySelector('.window-height').value = this.convertFromFeet(window.height).toFixed(2);
            windowEl.querySelector('.window-distance').value = this.convertFromFeet(window.distanceFromLeft).toFixed(2);
            windowEl.querySelector('.window-floor-distance').value = this.convertFromFeet(window.distanceFromFloor).toFixed(2);
        });
        
        formSection.style.display = 'block';
        formSection.scrollIntoView({ behavior: 'smooth' });
    }

    updateDisplay() {
        this.updateWallList();
        this.updateCostSummary();
        this.drawElevation();
    }

    updateWallList() {
        const wallList = document.getElementById('wall-list');
        
        if (this.walls.length === 0) {
            wallList.innerHTML = '<p class="empty-state">No walls added yet. Click "Add New Wall" to begin.</p>';
            return;
        }

        let html = '';
        this.walls.forEach((wall, index) => {
            html += `
                <div class="wall-item">
                    <div class="wall-item-header">
                        <h4>Wall ${wall.label}</h4>
                        <div>
                            <button class="btn-edit-wall" onclick="calculator.editWall(${index})" title="Edit Wall">✏️</button>
                            <button class="btn-remove-wall" onclick="calculator.deleteWall(${index})" title="Delete Wall">✕</button>
                        </div>
                    </div>
                    <div class="wall-item-details">
                        <p>Length: ${this.formatDimension(wall.length)}</p>
                        <p>Height: ${this.formatDimension(wall.height)}</p>
                        <p>Doors: ${wall.doors.length}</p>
                        <p>Windows: ${wall.windows.length}</p>
                    </div>
                </div>
            `;
        });
        
        wallList.innerHTML = html;
    }

    updateCostSummary() {
        let totalLength = 0;
        let availableSpace = 0;

        this.walls.forEach(wall => {
            totalLength += wall.length;
            let occupiedSpace = 0;
            
            wall.doors.forEach(door => {
                occupiedSpace += door.width;
            });
            
            availableSpace += (wall.length - occupiedSpace);
        });

        document.getElementById('total-length').textContent = this.formatDimension(totalLength);
        document.getElementById('available-space').textContent = this.formatDimension(availableSpace);
        
        // Simple cost calculation: $150 per linear foot of cabinet
        const estimatedCost = availableSpace * 150;
        document.getElementById('total-cost').textContent = `$${estimatedCost.toFixed(2)}`;
    }

    drawElevation() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.walls.length === 0) {
            ctx.fillStyle = '#95a5a6';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No walls to display. Add a wall to begin.', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Calculate total layout - centered in canvas
        let currentX = 80; // Start position with margin
        const startY = 120; // More space for top dimensions

        this.walls.forEach((wall, index) => {
            this.drawWall(wall, currentX, startY);
            currentX += wall.length * this.scale + 60; // Add spacing between walls
        });
    }

    drawGrid() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 0.5;

        // Light grid for reference
        for (let x = 0; x < canvas.width; x += this.scale * 2) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += this.scale * 2) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    drawWall(wall, startX, startY) {
        const ctx = this.ctx;
        const wallWidth = wall.length * this.scale;
        const wallHeight = wall.height * this.scale;

        // Draw wall label above
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`ELEVATION ${wall.label}`, startX + wallWidth / 2, startY - 80);

        // Draw main wall background (light gray)
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(startX, startY, wallWidth, wallHeight);

        // Draw main wall outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, wallWidth, wallHeight);

        // Draw doors
        wall.doors.forEach(door => {
            this.drawDoor(door, startX, startY, wallHeight);
        });

        // Draw windows
        wall.windows.forEach(window => {
            this.drawWindow(window, startX, startY, wallHeight);
        });

        // Draw dimension lines - multiple levels
        this.drawComprehensiveDimensions(wall, startX, startY, wallWidth, wallHeight);
    }

    drawUpperCabinets(wall, startX, startY, wallWidth, cabHeight) {
        // Cabinet rendering will be implemented in future iteration
        // For now, walls display blank with only doors and windows
    }

    drawLowerCabinets(wall, startX, startY, wallWidth, cabHeight) {
        // Cabinet rendering will be implemented in future iteration
        // For now, walls display blank with only doors and windows
    }

    calculateCabinetSections(wall, cabY, cabHeight, isUpper) {
        // Cabinet section calculation will be implemented in future iteration
        return [];
    }

    drawDoor(door, wallStartX, wallStartY, wallHeight) {
        const ctx = this.ctx;
        const doorX = wallStartX + door.distanceFromLeft * this.scale;
        const doorWidth = door.width * this.scale;
        const doorHeight = door.height * this.scale;
        const doorY = wallStartY + wallHeight - doorHeight;

        // Draw door frame
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
        
        // Door panel
        const panelMargin = this.scale * 0.2;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            doorX + panelMargin,
            doorY + panelMargin,
            doorWidth - (panelMargin * 2),
            doorHeight - (panelMargin * 2)
        );

        // Door knob
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            doorX + doorWidth * 0.75,
            doorY + doorHeight / 2,
            this.scale * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    drawWindow(window, wallStartX, wallStartY, wallHeight) {
        const ctx = this.ctx;
        const windowX = wallStartX + window.distanceFromLeft * this.scale;
        const windowWidth = window.width * this.scale;
        const windowHeight = window.height * this.scale;
        // Window lift is measured from floor (bottom of wall) to bottom of window
        const windowY = wallStartY + wallHeight - window.distanceFromFloor * this.scale - windowHeight;

        // Draw window frame
        ctx.fillStyle = '#E6F3FF';
        ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
        
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 3;
        ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);

        // Window panes (4 panes)
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        
        // Vertical divider
        ctx.beginPath();
        ctx.moveTo(windowX + windowWidth / 2, windowY);
        ctx.lineTo(windowX + windowWidth / 2, windowY + windowHeight);
        ctx.stroke();
        
        // Horizontal divider
        ctx.beginPath();
        ctx.moveTo(windowX, windowY + windowHeight / 2);
        ctx.lineTo(windowX + windowWidth, windowY + windowHeight / 2);
        ctx.stroke();
        
        // Diagonal lines in each pane for glass effect
        ctx.strokeStyle = '#B0E0E6';
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const paneX = windowX + (i * windowWidth / 2);
                const paneY = windowY + (j * windowHeight / 2);
                ctx.beginPath();
                ctx.moveTo(paneX, paneY);
                ctx.lineTo(paneX + windowWidth / 2, paneY + windowHeight / 2);
                ctx.stroke();
            }
        }
    }

    drawComprehensiveDimensions(wall, startX, startY, wallWidth, wallHeight) {
        const ctx = this.ctx;
        
        // Top dimension line (total width)
        this.drawDimensionLine(
            startX, 
            startY - 60, 
            startX + wallWidth, 
            startY - 60,
            this.formatDimension(wall.length),
            true
        );
        
        // Bottom dimension line (total width)
        this.drawDimensionLine(
            startX,
            startY + wallHeight + 40,
            startX + wallWidth,
            startY + wallHeight + 40,
            this.formatDimension(wall.length),
            true
        );
        
        // Right side dimension line (total height)
        this.drawDimensionLine(
            startX + wallWidth + 30,
            startY,
            startX + wallWidth + 30,
            startY + wallHeight,
            this.formatDimension(wall.height),
            false
        );
        
        // Calculate and draw leftover spaces with detailed dimensions
        this.drawLeftoverSpaces(wall, startX, startY, wallWidth, wallHeight);
        
        // Dimension lines for doors
        wall.doors.forEach(door => {
            const doorX = startX + door.distanceFromLeft * this.scale;
            const doorWidth = door.width * this.scale;
            const doorY = startY + wallHeight - (door.height * this.scale);
            
            // Distance from left
            if (door.distanceFromLeft > 0) {
                this.drawDimensionLine(
                    startX,
                    startY - 30,
                    doorX,
                    startY - 30,
                    this.formatDimension(door.distanceFromLeft),
                    true
                );
            }
            
            // Door width
            this.drawDimensionLine(
                doorX,
                startY - 30,
                doorX + doorWidth,
                startY - 30,
                this.formatDimension(door.width),
                true
            );
        });
        
        // Dimension lines for windows
        wall.windows.forEach(window => {
            const windowX = startX + window.distanceFromLeft * this.scale;
            const windowWidth = window.width * this.scale;
            const windowHeight = window.height * this.scale;
            // Window Y is measured from bottom of wall (floor) to bottom of window
            const windowY = startY + wallHeight - window.distanceFromFloor * this.scale - windowHeight;
            
            // Window width dimension (above window)
            this.drawDimensionLine(
                windowX,
                windowY - 15,
                windowX + windowWidth,
                windowY - 15,
                this.formatDimension(window.width),
                true
            );
            
            // Window height dimension (right side)
            this.drawDimensionLine(
                windowX + windowWidth + 15,
                windowY,
                windowX + windowWidth + 15,
                windowY + windowHeight,
                this.formatDimension(window.height),
                false
            );
            
            // Window lift from floor (left side) - from floor to bottom of window
            this.drawDimensionLine(
                windowX - 15,
                startY + wallHeight,
                windowX - 15,
                windowY + windowHeight,
                this.formatDimension(window.distanceFromFloor),
                false
            );
        });
        
        // Draw detailed segment dimensions at the bottom
        this.drawBottomSegmentDimensions(wall, startX, startY, wallWidth, wallHeight);
    }

    drawBottomSegmentDimensions(wall, startX, startY, wallWidth, wallHeight) {
        const ctx = this.ctx;
        const dimensionY = startY + wallHeight + 60; // Position below the main dimension line
        
        // Collect all elements (doors and windows) with their positions
        const elements = [];
        
        wall.doors.forEach(door => {
            elements.push({
                start: door.distanceFromLeft,
                end: door.distanceFromLeft + door.width,
                width: door.width,
                type: 'door'
            });
        });
        
        wall.windows.forEach(window => {
            elements.push({
                start: window.distanceFromLeft,
                end: window.distanceFromLeft + window.width,
                width: window.width,
                type: 'window'
            });
        });
        
        // Sort by start position
        elements.sort((a, b) => a.start - b.start);
        
        // Draw segments from left to right
        let currentPos = 0;
        let segmentIndex = 0;
        
        elements.forEach((element, index) => {
            // Draw leftover space before this element
            if (element.start > currentPos) {
                const leftoverStart = currentPos;
                const leftoverEnd = element.start;
                const leftoverWidth = leftoverEnd - leftoverStart;
                
                this.drawDimensionLine(
                    startX + (leftoverStart * this.scale),
                    dimensionY,
                    startX + (leftoverEnd * this.scale),
                    dimensionY,
                    this.formatDimension(leftoverWidth),
                    true
                );
            }
            
            // Draw the element (door/window)
            this.drawDimensionLine(
                startX + (element.start * this.scale),
                dimensionY,
                startX + (element.end * this.scale),
                dimensionY,
                this.formatDimension(element.width),
                true
            );
            
            currentPos = element.end;
        });
        
        // Draw final leftover space after last element
        if (currentPos < wall.length) {
            this.drawDimensionLine(
                startX + (currentPos * this.scale),
                dimensionY,
                startX + (wall.length * this.scale),
                dimensionY,
                this.formatDimension(wall.length - currentPos),
                true
            );
        }
    }

    drawLeftoverSpaces(wall, startX, startY, wallWidth, wallHeight) {
        const ctx = this.ctx;
        
        // Separate obstacles for upper and lower cabinets
        const upperObstacles = [];
        const lowerObstacles = [];
        
        // Both doors AND windows affect upper cabinets
        wall.windows.forEach(window => {
            upperObstacles.push({
                start: window.distanceFromLeft,
                end: window.distanceFromLeft + window.width,
                type: 'window'
            });
        });
        
        wall.doors.forEach(door => {
            upperObstacles.push({
                start: door.distanceFromLeft,
                end: door.distanceFromLeft + door.width,
                type: 'door'
            });
        });
        
        // Only doors affect lower cabinets
        wall.doors.forEach(door => {
            lowerObstacles.push({
                start: door.distanceFromLeft,
                end: door.distanceFromLeft + door.width,
                type: 'door'
            });
        });
        
        // Calculate upper cabinet spaces (affected by both doors and windows)
        const upperSpaces = this.calculateSpaces(wall.length, upperObstacles);
        
        // Calculate lower cabinet spaces (affected by doors only)
        const lowerSpaces = this.calculateSpaces(wall.length, lowerObstacles);
        
        // Draw upper cabinet area leftover spaces (blue)
        upperSpaces.forEach(space => {
            if (space.length > 0.5) { // Only show if space is significant (> 6 inches)
                const spaceStartX = startX + (space.start * this.scale);
                const spaceWidth = space.length * this.scale;
                const centerX = spaceStartX + spaceWidth / 2;
                
                const upperY = startY + this.scale * 1.5;
                const upperHeight = this.scale * 2.5;
                
                ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
                ctx.fillRect(spaceStartX, upperY, spaceWidth, upperHeight);
                
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(spaceStartX, upperY, spaceWidth, upperHeight);
                ctx.setLineDash([]);
                
                // Upper space label
                ctx.fillStyle = '#2980b9';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.formatDimension(space.length), centerX, upperY + upperHeight / 2);
            }
        });
        
        // Draw lower cabinet area leftover spaces (green)
        lowerSpaces.forEach(space => {
            if (space.length > 0.5) { // Only show if space is significant (> 6 inches)
                const spaceStartX = startX + (space.start * this.scale);
                const spaceWidth = space.length * this.scale;
                const centerX = spaceStartX + spaceWidth / 2;
                
                const lowerY = startY + wallHeight - (this.scale * 2.5);
                const lowerHeight = this.scale * 2.5;
                
                ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
                ctx.fillRect(spaceStartX, lowerY, spaceWidth, lowerHeight);
                
                ctx.strokeStyle = '#27ae60';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(spaceStartX, lowerY, spaceWidth, lowerHeight);
                ctx.setLineDash([]);
                
                // Lower space label
                ctx.fillStyle = '#229954';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.formatDimension(space.length), centerX, lowerY + lowerHeight / 2);
            }
        });
        
        // Add legend text
        ctx.fillStyle = '#2980b9';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Upper Cabinet Space (blocked by windows)', startX, startY - 70);
        
        ctx.fillStyle = '#229954';
        ctx.fillText('Lower Cabinet Space (blocked by doors)', startX, startY - 58);
    }

    calculateSpaces(wallLength, obstacles) {
        // Sort obstacles by start position
        obstacles.sort((a, b) => a.start - b.start);
        
        // Calculate leftover spaces
        let currentPos = 0;
        const spaces = [];
        
        obstacles.forEach(obstacle => {
            if (obstacle.start > currentPos) {
                spaces.push({
                    start: currentPos,
                    end: obstacle.start,
                    length: obstacle.start - currentPos
                });
            }
            currentPos = Math.max(currentPos, obstacle.end);
        });
        
        // Add final space
        if (currentPos < wallLength) {
            spaces.push({
                start: currentPos,
                end: wallLength,
                length: wallLength - currentPos
            });
        }
        
        return spaces;
    }

    drawDimensionLine(x1, y1, x2, y2, label, isHorizontal) {
        const ctx = this.ctx;
        const arrowSize = 6;
        const offset = 5;
        
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        ctx.lineWidth = 1;
        
        // Main dimension line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Extension lines
        if (isHorizontal) {
            // Vertical extension lines
            ctx.beginPath();
            ctx.moveTo(x1, y1 - offset);
            ctx.lineTo(x1, y1 + offset);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x2, y2 - offset);
            ctx.lineTo(x2, y2 + offset);
            ctx.stroke();
            
            // Arrows
            this.drawArrow(x1, y1, 1, 0, arrowSize);
            this.drawArrow(x2, y2, -1, 0, arrowSize);
        } else {
            // Horizontal extension lines
            ctx.beginPath();
            ctx.moveTo(x1 - offset, y1);
            ctx.lineTo(x1 + offset, y1);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x2 - offset, y2);
            ctx.lineTo(x2 + offset, y2);
            ctx.stroke();
            
            // Arrows
            this.drawArrow(x1, y1, 0, 1, arrowSize);
            this.drawArrow(x2, y2, 0, -1, arrowSize);
        }
        
        // Label with white background to prevent strikethrough
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Measure text width for background
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 12;
        const padding = 3;
        
        if (isHorizontal) {
            // Draw white background rectangle for text
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                midX - textWidth / 2 - padding,
                y1 - textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
            
            // Draw text
            ctx.fillStyle = '#000000';
            ctx.fillText(label, midX, y1);
        } else {
            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(-Math.PI / 2);
            
            // Draw white background rectangle for text
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                -textWidth / 2 - padding,
                -textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
            
            // Draw text
            ctx.fillStyle = '#000000';
            ctx.fillText(label, 0, 0);
            ctx.restore();
        }
    }

    drawArrow(x, y, dx, dy, size) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - dx * size - dy * size/2, y - dy * size + dx * size/2);
        ctx.lineTo(x - dx * size + dy * size/2, y - dy * size - dx * size/2);
        ctx.closePath();
        ctx.fill();
    }

    drawDimensions(startX, startY, wallWidth, wallHeight) {
        // This function is replaced by drawComprehensiveDimensions
        // Keeping for backward compatibility
    }

    // Tab Navigation
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Load cabinet list and walls when switching to placement tab
        if (tabName === 'placement') {
            this.loadCabinetSelectionList();
            this.populatePlacementWallSelector();
            if (this.placementCanvas) {
                this.drawPlacementCanvas();
            }
        }
    }

    // ====================
    // NEW CORRECT PLACEMENT FLOW
    // ====================

    // Step 1: Load cabinet selection list with checkboxes
    loadCabinetSelectionList() {
        const container = document.getElementById('cabinet-selection-list');
        if (!container || !CABINET_SYSTEMS || !CABINET_SYSTEMS[this.currentCabinetSystem]) {
            return;
        }

        container.innerHTML = ''; // Clear existing
        const system = CABINET_SYSTEMS[this.currentCabinetSystem];
        const categories = ['baseCabinets', 'wallCabinets', 'tallCabinets', 'specialtyCabinets'];
        
        categories.forEach(categoryKey => {
            if (system[categoryKey] && system[categoryKey].length > 0) {
                // Add category header
                const categoryHeader = document.createElement('h4');
                categoryHeader.style.color = '#2c3e50';
                categoryHeader.style.margin = '20px 0 10px 0';
                categoryHeader.style.padding = '10px';
                categoryHeader.style.background = '#ecf0f1';
                categoryHeader.style.borderRadius = '5px';
                categoryHeader.textContent = this.getCategoryName(categoryKey);
                container.appendChild(categoryHeader);

                // Add cabinets
                system[categoryKey].forEach(cabinet => {
                    const item = this.createCabinetSelectionItem(cabinet);
                    container.appendChild(item);
                });
            }
        });
    }

    getCategoryName(key) {
        const names = {
            'baseCabinets': '🔲 Base Cabinets',
            'wallCabinets': '🔳 Wall Cabinets',
            'tallCabinets': '📏 Tall Cabinets',
            'specialtyCabinets': '⭐ Specialty Units'
        };
        return names[key] || key;
    }

    createCabinetSelectionItem(cabinet) {
        const template = document.getElementById('cabinet-selection-template');
        const item = template.content.cloneNode(true).querySelector('.cabinet-selection-item');
        
        // Set cabinet data
        item.dataset.cabinetId = cabinet.id;
        item.dataset.cabinetName = cabinet.name.toLowerCase(); // For search
        item.dataset.cabinetCode = cabinet.code.toLowerCase(); // For search
        item.querySelector('.cabinet-name').textContent = cabinet.name;
        item.querySelector('.cabinet-code').textContent = cabinet.code;
        item.querySelector('.cabinet-width').textContent = cabinet.width;
        item.querySelector('.cabinet-height').textContent = cabinet.height;
        item.querySelector('.cabinet-depth').textContent = cabinet.depth;
        item.querySelector('.cabinet-price').textContent = `$${cabinet.price.toFixed(2)}`;
        
        // Checkbox change event
        const checkbox = item.querySelector('.cabinet-select-check');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                item.classList.add('selected');
                // Add to selected cabinets (create a copy with editable properties)
                this.selectedCabinets.push({...cabinet});
            } else {
                item.classList.remove('selected');
                // Remove from selected cabinets
                this.selectedCabinets = this.selectedCabinets.filter(c => c.id !== cabinet.id);
            }
            this.updatePlaceButton();
            // Show mock placeholders when ticking
            this.showMockPlaceholders();
        });
        
        // Edit button
        const editBtn = item.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => {
            this.showEditCabinetModal(cabinet);
        });
        
        return item;
    }

    updatePlaceButton() {
        const placeBtn = document.getElementById('place-selected-btn');
        if (placeBtn) {
            placeBtn.disabled = this.selectedCabinets.length === 0 || this.selectedWallForPlacement === null;
        }
    }

    // Filter cabinets by search term
    filterCabinets(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const items = document.querySelectorAll('.cabinet-selection-item');
        
        items.forEach(item => {
            const name = item.dataset.cabinetName || '';
            const code = item.dataset.cabinetCode || '';
            
            if (name.includes(term) || code.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        // Also hide/show category headers if all items are hidden
        const categoryHeaders = document.querySelectorAll('.cabinet-selection-list h4');
        categoryHeaders.forEach(header => {
            let nextElement = header.nextElementSibling;
            let hasVisibleItem = false;
            
            while (nextElement && !nextElement.tagName.match(/^H[1-6]$/)) {
                if (nextElement.classList.contains('cabinet-selection-item') && 
                    nextElement.style.display !== 'none') {
                    hasVisibleItem = true;
                    break;
                }
                nextElement = nextElement.nextElementSibling;
            }
            
            header.style.display = hasVisibleItem ? 'block' : 'none';
        });
    }

    // Show mock placeholders on canvas when selecting cabinets
    showMockPlaceholders() {
        if (this.selectedWallForPlacement === null) {
            // Just update button, no canvas to show
            return;
        }
        
        // Redraw the canvas with mock placeholders
        this.drawPlacementCanvas();
    }

    // Step 2: Edit cabinet modal
    showEditCabinetModal(cabinet) {
        const modal = document.getElementById('cabinet-edit-modal');
        if (!modal) return;

        // Populate form
        document.getElementById('edit-cabinet-id').value = cabinet.id;
        document.getElementById('edit-cabinet-name').textContent = cabinet.name;
        document.getElementById('edit-cabinet-width').value = parseFloat(cabinet.width);
        document.getElementById('edit-cabinet-height').value = parseFloat(cabinet.height);
        document.getElementById('edit-cabinet-depth').value = parseFloat(cabinet.depth);

        modal.classList.add('active');

        // Set up form submission
        const form = document.getElementById('cabinet-edit-form');
        const newSubmitHandler = (e) => {
            e.preventDefault();
            this.saveEditedCabinet(cabinet.id);
            form.removeEventListener('submit', newSubmitHandler);
        };
        form.addEventListener('submit', newSubmitHandler);

        // Close button
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        const closeModal = () => {
            modal.classList.remove('active');
            form.removeEventListener('submit', newSubmitHandler);
        };

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
    }

    saveEditedCabinet(cabinetId) {
        const newWidth = document.getElementById('edit-cabinet-width').value;
        const newHeight = document.getElementById('edit-cabinet-height').value;
        const newDepth = document.getElementById('edit-cabinet-depth').value;

        // Update in selectedCabinets
        const cabinet = this.selectedCabinets.find(c => c.id === cabinetId);
        if (cabinet) {
            cabinet.width = newWidth + (this.currentCabinetSystem.includes('metric') ? 'mm' : '"');
            cabinet.height = newHeight + (this.currentCabinetSystem.includes('metric') ? 'mm' : '"');
            cabinet.depth = newDepth + (this.currentCabinetSystem.includes('metric') ? 'mm' : '"');
        }

        // Close modal
        document.getElementById('cabinet-edit-modal').classList.remove('active');
        
        // Refresh the cabinet list display
        this.loadCabinetSelectionList();
        
        alert('Cabinet dimensions updated! The changes will apply when you place it.');
    }

    // Step 3: Populate wall selector
    populatePlacementWallSelector() {
        const select = document.getElementById('placement-wall-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- Choose a Wall --</option>';
        
        this.walls.forEach((wall, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Wall ${this.wallLabels[index]} (${this.formatDimension(wall.length)} × ${this.formatDimension(wall.height)})`;
            select.appendChild(option);
        });

        this.updatePlaceButton();
    }

    // Step 4: Place selected cabinets on wall
    placeSelectedCabinets() {
        if (this.selectedCabinets.length === 0) {
            alert('Please select at least one cabinet!');
            return;
        }

        if (this.selectedWallForPlacement === null) {
            alert('Please select a wall first!');
            return;
        }

        const wall = this.walls[this.selectedWallForPlacement];
        let currentX = 0; // Start from left edge

        // Try to place each selected cabinet
        this.selectedCabinets.forEach(cabinet => {
            const cabinetWidthInFeet = this.parseDimensionToFeet(cabinet.width);
            const cabinetHeightInFeet = this.parseDimensionToFeet(cabinet.height);

            // Check if it fits
            if (currentX + cabinetWidthInFeet <= wall.length) {
                // Check for overlaps with doors/windows
                const overlaps = this.checkOverlap(wall, currentX, cabinetWidthInFeet, cabinetHeightInFeet, cabinet.type);
                
                if (overlaps) {
                    alert(`⚠️ Cabinet "${cabinet.name}" cannot be placed at position ${this.formatDimension(currentX)} because it overlaps with a door or window.\n\nPlease edit the cabinet dimensions or place it manually by dragging after placement.`);
                    // Still place it but mark as invalid
                }

                // Create placed cabinet
                const placedCabinet = new PlacedCabinet(
                    cabinet,
                    this.selectedWallForPlacement,
                    currentX,
                    0 // Y position (we'll calculate based on cabinet type)
                );

                this.placedCabinets.push(placedCabinet);
                currentX += cabinetWidthInFeet + 0.05; // Small gap between cabinets
            } else {
                alert(`⚠️ Cabinet "${cabinet.name}" exceeds available space on wall.\n\nRemaining space: ${this.formatDimension(wall.length - currentX)}\nCabinet width: ${cabinet.width}\n\nPlease edit the cabinet dimensions.`);
            }
        });

        // Clear selections
        this.selectedCabinets = [];
        document.querySelectorAll('.cabinet-select-check').forEach(cb => cb.checked = false);
        document.querySelectorAll('.cabinet-selection-item').forEach(item => item.classList.remove('selected'));
        
        // Update display
        this.drawPlacementCanvas();
        this.updatePlacedSummary();
        this.updatePlaceButton();
    }

    // Check if cabinet overlaps with obstacles
    checkOverlap(wall, x, width, height, cabinetType) {
        const cabinetRight = x + width;
        
        // Check doors
        for (let door of wall.doors) {
            const doorLeft = door.distanceFromLeft;
            const doorRight = doorLeft + door.width;
            
            if (!(cabinetRight < doorLeft || x > doorRight)) {
                return true; // Overlaps with door
            }
        }

        // Check windows (if it's a wall/upper cabinet)
        if (cabinetType === 'wall' || height > 5) { // Upper cabinets
            for (let window of wall.windows) {
                const windowLeft = window.distanceFromLeft;
                const windowRight = windowLeft + window.width;
                
                if (!(cabinetRight < windowLeft || x > windowRight)) {
                    return true; // Overlaps with window
                }
            }
        }

        return false;
    }

    parseDimensionToFeet(dimensionStr) {
        const numValue = parseFloat(dimensionStr);
        if (dimensionStr.includes('mm')) {
            return numValue / 304.8; // mm to feet
        } else if (dimensionStr.includes('"')) {
            return numValue / 12; // inches to feet
        } else if (dimensionStr.includes('m')) {
            return numValue * 3.28084; // meters to feet
        }
        return numValue; // assume feet
    }

    // Step 5: Draw placement canvas
    drawPlacementCanvas() {
        if (!this.placementCtx || this.selectedWallForPlacement === null) {
            // Show message
            const overlay = document.getElementById('canvas-message');
            if (overlay) overlay.style.display = 'flex';
            return;
        }

        const overlay = document.getElementById('canvas-message');
        if (overlay) overlay.style.display = 'none';

        const wall = this.walls[this.selectedWallForPlacement];
        const ctx = this.placementCtx;
        const canvas = this.placementCanvas;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw wall elevation (same as main canvas)
        const startX = 50;
        const startY = 50;
        const wallWidth = wall.length * this.scale;
        const wallHeight = wall.height * this.scale;

        // Draw wall outline
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, startY, wallWidth, wallHeight);

        // Draw doors
        ctx.fillStyle = '#8b4513';
        wall.doors.forEach(door => {
            const doorX = startX + door.distanceFromLeft * this.scale;
            const doorY = startY + wallHeight - door.distanceFromFloor * this.scale - door.height * this.scale;
            const doorWidth = door.width * this.scale;
            const doorHeight = door.height * this.scale;
            ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        });

        // Draw windows
        ctx.fillStyle = '#87CEEB';
        wall.windows.forEach(window => {
            const windowX = startX + window.distanceFromLeft * this.scale;
            const windowY = startY + wallHeight - window.distanceFromFloor * this.scale;
            const windowWidth = window.width * this.scale;
            const windowHeight = window.height * this.scale;
            ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
        });

        // Draw placed cabinets
        this.drawPlacedCabinetsOnCanvas(startX, startY, wallHeight);
        
        // Draw mock placeholders for selected cabinets (not yet placed)
        this.drawMockPlaceholders(startX, startY, wallHeight);
    }

    drawPlacedCabinetsOnCanvas(wallStartX, wallStartY, wallHeight) {
        const ctx = this.placementCtx;
        
        this.placedCabinets.forEach(placedCabinet => {
            if (placedCabinet.wallIndex !== this.selectedWallForPlacement) return;

            const cabinet = placedCabinet.cabinet;
            const widthInFeet = this.parseDimensionToFeet(cabinet.width);
            const heightInFeet = this.parseDimensionToFeet(cabinet.height);

            const cabinetX = wallStartX + placedCabinet.x * this.scale;
            let cabinetY;
            
            // Determine Y position based on cabinet type
            if (cabinet.type === 'wall') {
                cabinetY = wallStartY + 20; // Upper cabinet
            } else if (cabinet.type === 'tall') {
                cabinetY = wallStartY; // Floor to ceiling
            } else {
                cabinetY = wallStartY + wallHeight - heightInFeet * this.scale; // Base cabinet (on floor)
            }

            const cabinetWidth = widthInFeet * this.scale;
            const cabinetHeight = heightInFeet * this.scale;

            // Draw cabinet box
            ctx.fillStyle = placedCabinet === this.draggedCabinet ? '#3498db' : '#95a5a6';
            ctx.fillRect(cabinetX, cabinetY, cabinetWidth, cabinetHeight);
            
            // Draw cabinet border
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(cabinetX, cabinetY, cabinetWidth, cabinetHeight);

            // Draw cabinet label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(cabinet.code, cabinetX + cabinetWidth / 2, cabinetY + cabinetHeight / 2);

            // Store bounds for dragging
            placedCabinet.bounds = {
                x: cabinetX,
                y: cabinetY,
                width: cabinetWidth,
                height: cabinetHeight
            };
        });
    }

    // Draw mock placeholders for selected (but not yet placed) cabinets
    drawMockPlaceholders(wallStartX, wallStartY, wallHeight) {
        if (this.selectedCabinets.length === 0) return;

        const ctx = this.placementCtx;
        const wall = this.walls[this.selectedWallForPlacement];
        
        let currentX = 0; // Start from left edge

        this.selectedCabinets.forEach((cabinet, index) => {
            const widthInFeet = this.parseDimensionToFeet(cabinet.width);
            const heightInFeet = this.parseDimensionToFeet(cabinet.height);

            // Check if it fits
            if (currentX + widthInFeet > wall.length) {
                return; // Skip if doesn't fit
            }

            const cabinetX = wallStartX + currentX * this.scale;
            let cabinetY;
            
            // Determine Y position based on cabinet type
            if (cabinet.type === 'wall') {
                cabinetY = wallStartY + 20; // Upper cabinet
            } else if (cabinet.type === 'tall') {
                cabinetY = wallStartY; // Floor to ceiling
            } else {
                cabinetY = wallStartY + wallHeight - heightInFeet * this.scale; // Base cabinet
            }

            const cabinetWidth = widthInFeet * this.scale;
            const cabinetHeight = heightInFeet * this.scale;

            // Draw mock placeholder with dashed outline and semi-transparent
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#f39c12'; // Orange for mock
            ctx.fillRect(cabinetX, cabinetY, cabinetWidth, cabinetHeight);
            
            // Draw dashed border
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(cabinetX, cabinetY, cabinetWidth, cabinetHeight);
            ctx.setLineDash([]); // Reset dash
            
            // Draw label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PREVIEW', cabinetX + cabinetWidth / 2, cabinetY + cabinetHeight / 2 - 6);
            ctx.font = '10px Arial';
            ctx.fillText(cabinet.code, cabinetX + cabinetWidth / 2, cabinetY + cabinetHeight / 2 + 6);
            
            ctx.restore();

            currentX += widthInFeet + 0.05; // Small gap
        });

        // Add instruction text if mock placeholders are shown
        if (this.selectedCabinets.length > 0) {
            ctx.save();
            ctx.fillStyle = '#e67e22';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👆 PREVIEW - Click "Place Selected Cabinets" to confirm', 
                this.placementCanvas.width / 2, wallStartY + wallHeight + 40);
            ctx.restore();
        }
    }

    // Step 6: Drag and drop with snapping
    handleCanvasMouseDown(e) {
        if (this.selectedWallForPlacement === null) return;

        const rect = this.placementCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Find clicked cabinet
        for (let cabinet of this.placedCabinets) {
            if (cabinet.wallIndex !== this.selectedWallForPlacement) continue;
            if (!cabinet.bounds) continue;

            const bounds = cabinet.bounds;
            if (mouseX >= bounds.x && mouseX <= bounds.x + bounds.width &&
                mouseY >= bounds.y && mouseY <= bounds.y + bounds.height) {
                this.draggedCabinet = cabinet;
                this.dragOffset = {
                    x: mouseX - bounds.x,
                    y: mouseY - bounds.y
                };
                this.placementCanvas.style.cursor = 'grabbing';
                break;
            }
        }
    }

    handleCanvasMouseMove(e) {
        if (!this.draggedCabinet) return;

        const rect = this.placementCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const wall = this.walls[this.selectedWallForPlacement];
        const wallStartX = 50;
        
        // Calculate new position in feet
        let newX = (mouseX - this.dragOffset.x - wallStartX) / this.scale;
        
        // Snap to edges and other cabinets
        const SNAP_THRESHOLD = 0.2; // feet
        
        // Snap to left edge
        if (Math.abs(newX) < SNAP_THRESHOLD) {
            newX = 0;
        }
        
        // Snap to right edge
        const cabinetWidth = this.parseDimensionToFeet(this.draggedCabinet.cabinet.width);
        if (Math.abs((newX + cabinetWidth) - wall.length) < SNAP_THRESHOLD) {
            newX = wall.length - cabinetWidth;
        }

        // Snap to other cabinets
        for (let other of this.placedCabinets) {
            if (other === this.draggedCabinet || other.wallIndex !== this.selectedWallForPlacement) continue;
            
            const otherWidth = this.parseDimensionToFeet(other.cabinet.width);
            const otherRight = other.x + otherWidth;
            
            // Snap to left edge of other cabinet
            if (Math.abs((newX + cabinetWidth) - other.x) < SNAP_THRESHOLD) {
                newX = other.x - cabinetWidth;
            }
            
            // Snap to right edge of other cabinet
            if (Math.abs(newX - otherRight) < SNAP_THRESHOLD) {
                newX = otherRight;
            }
        }

        // Keep within wall bounds
        newX = Math.max(0, Math.min(newX, wall.length - cabinetWidth));

        this.draggedCabinet.x = newX;
        this.drawPlacementCanvas();
    }

    handleCanvasMouseUp(e) {
        if (this.draggedCabinet) {
            this.draggedCabinet = null;
            this.placementCanvas.style.cursor = 'move';
        }
    }

    // Update placed cabinets summary
    updatePlacedSummary() {
        const container = document.getElementById('placed-cabinets-summary');
        const totalCostEl = document.getElementById('total-cost');
        
        if (!container) return;

        if (this.placedCabinets.length === 0) {
            container.innerHTML = '<p class="empty-state">No cabinets placed yet</p>';
            if (totalCostEl) totalCostEl.textContent = '0.00';
            return;
        }

        container.innerHTML = '';
        let totalCost = 0;

        this.placedCabinets.forEach((placed, index) => {
            const div = document.createElement('div');
            div.style.padding = '8px';
            div.style.background = 'white';
            div.style.marginBottom = '5px';
            div.style.borderRadius = '5px';
            div.style.fontSize = '0.85em';
            
            const wallLabel = this.wallLabels[placed.wallIndex];
            div.innerHTML = `
                <strong>${placed.cabinet.name}</strong><br>
                Wall ${wallLabel} @ ${this.formatDimension(placed.x)}<br>
                $${placed.cabinet.price.toFixed(2)}
            `;
            container.appendChild(div);
            
            totalCost += placed.cabinet.price;
        });

        if (totalCostEl) {
            totalCostEl.textContent = totalCost.toFixed(2);
        }
    }

    // Step 7: Auto-fill spaces
    autoFillSpaces() {
        if (this.walls.length === 0) {
            alert('Please add walls first!');
            return;
        }

        alert('🤖 Auto-Fill Algorithm\n\nThis feature will:\n1. Analyze all available spaces on each wall\n2. Find the best-fit cabinet combinations\n3. Consider doors, windows, and existing cabinets\n4. Suggest optimal placement\n5. Calculate total cost\n\nComing in next iteration!');
        
        // TODO: Implement intelligent auto-fill
        // - Calculate leftover spaces
        // - Match with available cabinet sizes
        // - Optimize for standard modules (600mm/24")
        // - Minimize cuts and waste
    }

    // Clear all placed cabinets
    clearAllCabinets() {
        if (this.placedCabinets.length === 0) {
            alert('No cabinets to clear!');
            return;
        }

        if (confirm(`Are you sure you want to remove all ${this.placedCabinets.length} placed cabinets?`)) {
            this.placedCabinets = [];
            this.drawPlacementCanvas();
            this.updatePlacedSummary();
        }
    }
}

// Initialize the calculator when page loads
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new KitchenCalculator();
});