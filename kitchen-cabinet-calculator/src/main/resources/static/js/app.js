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
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.walls.length === 0) {
            ctx.fillStyle = '#95a5a6';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No walls to display. Add a wall to begin.', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Draw grid background
        this.drawGrid();

        // Calculate total layout
        let currentX = 50; // Start position with margin
        const startY = 100;

        this.walls.forEach((wall, index) => {
            this.drawWall(wall, currentX, startY);
            currentX += wall.length * this.scale + 30; // Add spacing between walls
        });
    }

    drawGrid() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += this.scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = 0; y < canvas.height; y += this.scale) {
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

        // Draw wall background
        ctx.fillStyle = '#34495e';
        ctx.fillRect(startX, startY, wallWidth, wallHeight);

        // Draw wall outline
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, startY, wallWidth, wallHeight);

        // Draw wall label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Wall ${wall.label}`, startX + wallWidth / 2, startY - 10);

        // Draw dimensions
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText(`${wall.length}' × ${wall.height}'`, startX + wallWidth / 2, startY - 30);

        // Draw doors
        wall.doors.forEach(door => {
            this.drawDoor(door, startX, startY, wallHeight);
        });

        // Draw windows
        wall.windows.forEach(window => {
            this.drawWindow(window, startX, startY);
        });

        // Draw dimension lines
        this.drawDimensions(startX, startY, wallWidth, wallHeight);
    }

    drawDoor(door, wallStartX, wallStartY, wallHeight) {
        const ctx = this.ctx;
        const doorX = wallStartX + door.distanceFromLeft * this.scale;
        const doorWidth = door.width * this.scale;
        const doorHeight = door.height * this.scale;
        const doorY = wallStartY + wallHeight - doorHeight;

        // Draw door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

        // Draw door label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DOOR', doorX + doorWidth / 2, doorY + doorHeight / 2);
        ctx.fillText(`${door.width}' × ${door.height}'`, doorX + doorWidth / 2, doorY + doorHeight / 2 + 12);

        // Draw distance label
        ctx.fillStyle = '#e74c3c';
        ctx.font = '11px Arial';
        ctx.fillText(`${door.distanceFromLeft}'`, doorX + doorWidth / 2, doorY - 5);
    }

    drawWindow(window, wallStartX, wallStartY) {
        const ctx = this.ctx;
        const windowX = wallStartX + window.distanceFromLeft * this.scale;
        const windowWidth = window.width * this.scale;
        const windowHeight = window.height * this.scale;
        const windowY = wallStartY + window.distanceFromFloor * this.scale;

        // Draw window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
        
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);

        // Draw window cross
        ctx.beginPath();
        ctx.moveTo(windowX, windowY);
        ctx.lineTo(windowX + windowWidth, windowY + windowHeight);
        ctx.moveTo(windowX + windowWidth, windowY);
        ctx.lineTo(windowX, windowY + windowHeight);
        ctx.stroke();

        // Draw window label
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WINDOW', windowX + windowWidth / 2, windowY + windowHeight / 2);
        ctx.fillText(`${window.width}' × ${window.height}'`, windowX + windowWidth / 2, windowY + windowHeight / 2 + 12);
    }

    drawDimensions(x, y, width, height) {
        const ctx = this.ctx;
        const arrowSize = 5;

        ctx.strokeStyle = '#e74c3c';
        ctx.fillStyle = '#e74c3c';
        ctx.lineWidth = 1;

        // Horizontal dimension line (bottom)
        const dimY = y + height + 20;
        ctx.beginPath();
        ctx.moveTo(x, dimY);
        ctx.lineTo(x + width, dimY);
        ctx.stroke();

        // Arrows
        ctx.beginPath();
        ctx.moveTo(x, dimY);
        ctx.lineTo(x + arrowSize, dimY - arrowSize);
        ctx.lineTo(x + arrowSize, dimY + arrowSize);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + width, dimY);
        ctx.lineTo(x + width - arrowSize, dimY - arrowSize);
        ctx.lineTo(x + width - arrowSize, dimY + arrowSize);
        ctx.fill();
    }
}

// Initialize the calculator when page loads
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new KitchenCalculator();
});