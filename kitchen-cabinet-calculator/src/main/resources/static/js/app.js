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
        this.selectedCabinet = null; // Currently selected cabinet from library
        this.placedCabinets = []; // Cabinets placed on walls
        this.placementCanvas = document.getElementById('placement-canvas');
        this.placementCtx = this.placementCanvas ? this.placementCanvas.getContext('2d') : null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadCabinetLibrary();
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

        // Cabinet system selector
        const cabinetSystemSelect = document.getElementById('cabinet-system-select');
        if (cabinetSystemSelect) {
            cabinetSystemSelect.addEventListener('change', (e) => {
                this.currentCabinetSystem = e.target.value;
                this.loadCabinetLibrary();
                this.selectedCabinet = null;
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

        // Placement actions
        const autoFillBtn = document.getElementById('auto-fill-btn');
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => {
                this.autoFillCabinets();
            });
        }

        const clearPlacementBtn = document.getElementById('clear-placement-btn');
        if (clearPlacementBtn) {
            clearPlacementBtn.addEventListener('click', () => {
                this.clearPlacement();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawElevation();
            if (this.placementCanvas) {
                this.drawPlacement();
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
        
        // Refresh canvas if switching to placement tab
        if (tabName === 'placement' && this.placementCanvas) {
            this.drawPlacement();
        }
    }

    // Cabinet Library
    loadCabinetLibrary() {
        if (!CABINET_SYSTEMS || !CABINET_SYSTEMS[this.currentCabinetSystem]) {
            console.error('Cabinet system not found:', this.currentCabinetSystem);
            return;
        }

        const system = CABINET_SYSTEMS[this.currentCabinetSystem];
        const categories = ['baseCabinets', 'wallCabinets', 'tallCabinets', 'specialtyCabinets'];
        const categoryNames = {
            baseCabinets: 'Base Cabinets',
            wallCabinets: 'Wall Cabinets',
            tallCabinets: 'Tall Cabinets',
            specialtyCabinets: 'Specialty Cabinets'
        };

        categories.forEach(category => {
            const container = document.getElementById(`${category}-grid`);
            if (container && system[category]) {
                container.innerHTML = ''; // Clear existing
                system[category].forEach(cabinet => {
                    const card = this.createCabinetCard(cabinet, categoryNames[category]);
                    container.appendChild(card);
                });
            }
        });
    }

    createCabinetCard(cabinet, categoryName) {
        const template = document.getElementById('cabinet-card-template');
        const card = template.content.cloneNode(true).querySelector('.cabinet-card');
        
        card.dataset.cabinetId = cabinet.id;
        card.querySelector('.cabinet-name').textContent = cabinet.name;
        card.querySelector('.cabinet-code').textContent = cabinet.code;
        card.querySelector('.cabinet-width').textContent = cabinet.width;
        card.querySelector('.cabinet-height').textContent = cabinet.height;
        card.querySelector('.cabinet-depth').textContent = cabinet.depth;
        card.querySelector('.cabinet-price').textContent = `$${cabinet.price.toFixed(2)}`;
        
        // Add category badge
        const badge = document.createElement('div');
        badge.className = 'cabinet-category-badge';
        badge.textContent = categoryName.replace(' Cabinets', '');
        card.appendChild(badge);
        
        // Add click event
        card.addEventListener('click', () => {
            this.selectCabinet(cabinet, card);
        });
        
        return card;
    }

    selectCabinet(cabinet, cardElement) {
        // Remove selection from all cards
        document.querySelectorAll('.cabinet-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select this cabinet
        this.selectedCabinet = cabinet;
        cardElement.classList.add('selected');
        
        // Update placement info
        this.updatePlacementInfo();
        
        // Switch to placement tab if not already there
        const placementTab = document.querySelector('[data-tab="placement"]');
        if (placementTab && !placementTab.classList.contains('active')) {
            this.switchTab('placement');
        }
    }

    updatePlacementInfo() {
        const infoDiv = document.querySelector('.placement-info');
        if (!infoDiv) return;
        
        if (this.selectedCabinet) {
            infoDiv.innerHTML = `
                <h4>Selected Cabinet</h4>
                <p><strong>Name:</strong> ${this.selectedCabinet.name}</p>
                <p><strong>Code:</strong> ${this.selectedCabinet.code}</p>
                <p><strong>Width:</strong> ${this.selectedCabinet.width}</p>
                <p><strong>Height:</strong> ${this.selectedCabinet.height}</p>
                <p><strong>Depth:</strong> ${this.selectedCabinet.depth}</p>
                <p><strong>Price:</strong> $${this.selectedCabinet.price.toFixed(2)}</p>
                <p style="margin-top: 15px; color: #3498db; font-weight: 600;">Click on a wall to place cabinet</p>
            `;
        } else {
            infoDiv.innerHTML = `
                <h4>No Cabinet Selected</h4>
                <p>Select a cabinet from the library to place it on a wall.</p>
            `;
        }
    }

    // Placement Canvas
    drawPlacement() {
        if (!this.placementCtx) return;
        
        const ctx = this.placementCtx;
        const canvas = this.placementCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.walls.length === 0) {
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Add walls in the "Walls" tab first', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw walls with same elevation view as main canvas
        this.drawElevation(this.placementCtx, this.placementCanvas);
        
        // Draw placed cabinets
        this.drawPlacedCabinets();
    }

    drawPlacedCabinets() {
        // TODO: Implement cabinet rendering on placement canvas
        // Will show placed cabinets on the elevation view
    }

    autoFillCabinets() {
        if (this.walls.length === 0) {
            alert('Please add walls first!');
            return;
        }
        
        alert('Auto-fill feature will be implemented in the next phase. It will automatically suggest the best cabinet combinations for your available spaces.');
        // TODO: Implement auto-fill algorithm
        // 1. Analyze leftover spaces for each wall
        // 2. Find best-fit cabinet combinations
        // 3. Place cabinets automatically
        // 4. Show total cost
    }

    clearPlacement() {
        if (confirm('Are you sure you want to clear all placed cabinets?')) {
            this.placedCabinets = [];
            this.drawPlacement();
        }
    }
}

// Initialize the calculator when page loads
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new KitchenCalculator();
});