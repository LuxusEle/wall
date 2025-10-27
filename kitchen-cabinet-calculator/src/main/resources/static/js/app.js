// Kitchen Cabinet Cost Calculator - Main Application
class KitchenCalculator {
    constructor() {
        this.walls = [];
        this.currentWallIndex = null;
        this.scale = 20; // pixels per foot
        this.canvas = document.getElementById('elevation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wallLabels = ['A', 'B', 'C', 'D'];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = 600;
    }

    setupEventListeners() {
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

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawElevation();
        });
    }

    showWallForm() {
        const formSection = document.getElementById('wall-form-section');
        const wallLabel = this.wallLabels[this.walls.length];
        document.getElementById('wall-form-title').textContent = `Configure Wall ${wallLabel}`;
        
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
        const length = parseFloat(document.getElementById('wall-length').value);
        const height = parseFloat(document.getElementById('wall-height').value);
        
        // Collect doors
        const doors = [];
        document.querySelectorAll('#doors-container .opening-input').forEach(doorEl => {
            doors.push({
                width: parseFloat(doorEl.querySelector('.door-width').value),
                height: parseFloat(doorEl.querySelector('.door-height').value),
                distanceFromLeft: parseFloat(doorEl.querySelector('.door-distance').value)
            });
        });

        // Collect windows
        const windows = [];
        document.querySelectorAll('#windows-container .opening-input').forEach(windowEl => {
            windows.push({
                width: parseFloat(windowEl.querySelector('.window-width').value),
                height: parseFloat(windowEl.querySelector('.window-height').value),
                distanceFromLeft: parseFloat(windowEl.querySelector('.window-distance').value),
                distanceFromFloor: parseFloat(windowEl.querySelector('.window-floor-distance').value)
            });
        });

        const wallLabel = this.wallLabels[this.walls.length];
        const wall = {
            label: wallLabel,
            length,
            height,
            doors,
            windows
        };

        this.walls.push(wall);
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
                        <button class="btn-remove-wall" onclick="calculator.deleteWall(${index})">✕</button>
                    </div>
                    <div class="wall-item-details">
                        <p>Length: ${wall.length} ft</p>
                        <p>Height: ${wall.height} ft</p>
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

        document.getElementById('total-length').textContent = `${totalLength.toFixed(1)} ft`;
        document.getElementById('available-space').textContent = `${availableSpace.toFixed(1)} ft`;
        
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
        const windowY = wallStartY + window.distanceFromFloor * this.scale;

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
            `${wall.length}'`,
            true
        );
        
        // Bottom dimension line (total width)
        this.drawDimensionLine(
            startX,
            startY + wallHeight + 40,
            startX + wallWidth,
            startY + wallHeight + 40,
            `${wall.length}'`,
            true
        );
        
        // Right side dimension line (total height)
        this.drawDimensionLine(
            startX + wallWidth + 30,
            startY,
            startX + wallWidth + 30,
            startY + wallHeight,
            `${wall.height}'`,
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
                    `${door.distanceFromLeft.toFixed(1)}"`,
                    true
                );
            }
            
            // Door width
            this.drawDimensionLine(
                doorX,
                startY - 30,
                doorX + doorWidth,
                startY - 30,
                `${door.width}'`,
                true
            );
        });
        
        // Dimension lines for windows
        wall.windows.forEach(window => {
            const windowX = startX + window.distanceFromLeft * this.scale;
            const windowWidth = window.width * this.scale;
            const windowY = startY + window.distanceFromFloor * this.scale;
            const windowHeight = window.height * this.scale;
            
            // Window width dimension
            this.drawDimensionLine(
                windowX,
                windowY - 15,
                windowX + windowWidth,
                windowY - 15,
                `${window.width}'`,
                true
            );
            
            // Window height dimension
            this.drawDimensionLine(
                windowX + windowWidth + 15,
                windowY,
                windowX + windowWidth + 15,
                windowY + windowHeight,
                `${window.height}'`,
                false
            );
        });
    }

    drawLeftoverSpaces(wall, startX, startY, wallWidth, wallHeight) {
        const ctx = this.ctx;
        
        // Collect all obstacles (doors and windows)
        const obstacles = [];
        
        wall.doors.forEach(door => {
            obstacles.push({
                start: door.distanceFromLeft,
                end: door.distanceFromLeft + door.width,
                type: 'door'
            });
        });
        
        wall.windows.forEach(window => {
            obstacles.push({
                start: window.distanceFromLeft,
                end: window.distanceFromLeft + window.width,
                type: 'window'
            });
        });
        
        // Sort by start position
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
        if (currentPos < wall.length) {
            spaces.push({
                start: currentPos,
                end: wall.length,
                length: wall.length - currentPos
            });
        }
        
        // Draw leftover space annotations on the wall
        spaces.forEach(space => {
            if (space.length > 0.5) { // Only show if space is significant (> 6 inches)
                const spaceStartX = startX + (space.start * this.scale);
                const spaceWidth = space.length * this.scale;
                const centerX = spaceStartX + spaceWidth / 2;
                
                // Draw upper cabinet area leftover space (light blue box)
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
                ctx.fillText(`${space.length.toFixed(1)}'`, centerX, upperY + upperHeight / 2);
                
                // Draw lower cabinet area leftover space (light green box)
                const lowerY = startY + wallHeight - (this.scale * 2.5);
                const lowerHeight = this.scale * 2.5;
                
                // Check if there's a door blocking this lower space
                const hasDoorHere = wall.doors.some(door => 
                    door.distanceFromLeft < space.end && 
                    (door.distanceFromLeft + door.width) > space.start
                );
                
                if (!hasDoorHere) {
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
                    ctx.fillText(`${space.length.toFixed(1)}'`, centerX, lowerY + lowerHeight / 2);
                }
            }
        });
        
        // Add legend text
        ctx.fillStyle = '#2980b9';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Upper Cabinet Space', startX, startY - 70);
        
        ctx.fillStyle = '#229954';
        ctx.fillText('Lower Cabinet Space', startX, startY - 58);
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
        
        // Label
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (isHorizontal) {
            ctx.fillText(label, (x1 + x2) / 2, y1 - 8);
        } else {
            ctx.save();
            ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
            ctx.rotate(-Math.PI / 2);
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
}

// Initialize the calculator when page loads
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new KitchenCalculator();
});