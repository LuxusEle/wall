/**
 * Box Viewer - Visualizes box construction with 4 elevations
 * Shows Front, Left, Back, and Top views with panels, hardware, and dimensions
 */

class BoxViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentBox = null;
        this.scale = 1;
        this.selectedPanel = null;
        
        this.setupCanvas();
    }

    setupCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth || 1200;
        this.canvas.height = parent.offsetHeight || 800;
    }

    /**
     * Display a box with 4 elevations (Front, Left, Back, Top)
     */
    displayBox(box) {
        this.currentBox = box;
        this.draw();
    }

    draw() {
        if (!this.currentBox) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Divide canvas into 4 quadrants
        const quadWidth = w / 2;
        const quadHeight = h / 2;

        // Top-left: Front Elevation
        this.drawElevation('front', 10, 10, quadWidth - 20, quadHeight - 20);
        
        // Top-right: Left Elevation
        this.drawElevation('left', quadWidth + 10, 10, quadWidth - 20, quadHeight - 20);
        
        // Bottom-left: Back Elevation
        this.drawElevation('back', 10, quadHeight + 10, quadWidth - 20, quadHeight - 20);
        
        // Bottom-right: Top View
        this.drawElevation('top', quadWidth + 10, quadHeight + 10, quadWidth - 20, quadHeight - 20);

        // Draw title
        this.drawTitle();
    }

    drawElevation(view, x, y, width, height) {
        const box = this.currentBox;
        const dims = box.dimensions;
        
        // Calculate scale to fit in quadrant
        let viewWidth, viewHeight;
        
        switch(view) {
            case 'front':
                viewWidth = dims.width;
                viewHeight = dims.height;
                break;
            case 'left':
                viewWidth = dims.depth;
                viewHeight = dims.height;
                break;
            case 'back':
                viewWidth = dims.width;
                viewHeight = dims.height;
                break;
            case 'top':
                viewWidth = dims.width;
                viewHeight = dims.depth;
                break;
        }

        const scale = Math.min(width / viewWidth, height / viewHeight) * 0.7;
        const offsetX = x + (width - viewWidth * scale) / 2;
        const offsetY = y + (height - viewHeight * scale) / 2;

        // Draw quadrant background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Draw view label
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(view.toUpperCase() + ' VIEW', x + 15, y + 30);

        // Draw panels for this view
        this.drawPanelsForView(view, offsetX, offsetY, scale);

        // Draw hardware for this view
        this.drawHardwareForView(view, offsetX, offsetY, scale);

        // Draw dimensions
        this.drawDimensionsForView(view, offsetX, offsetY, viewWidth, viewHeight, scale);
    }

    drawPanelsForView(view, x, y, scale) {
        const box = this.currentBox;
        const dims = box.dimensions;
        const t = 18; // Material thickness

        this.ctx.save();

        switch(view) {
            case 'front':
                // Draw front view: sides, top, bottom, doors
                // Left side
                this.drawPanel(x, y, t * scale, dims.height * scale, '#D2B48C', 'L');
                // Right side
                this.drawPanel(x + (dims.width - t) * scale, y, t * scale, dims.height * scale, '#D2B48C', 'R');
                // Top
                this.drawPanel(x + t * scale, y, (dims.width - 2 * t) * scale, t * scale, '#C19A6B', 'TOP');
                // Bottom
                this.drawPanel(x + t * scale, y + (dims.height - t) * scale, (dims.width - 2 * t) * scale, t * scale, '#C19A6B', 'BTM');
                // Door(s)
                this.drawDoor(x + t * scale + 5, y + t * scale + 5, (dims.width - 2 * t - 10) * scale, (dims.height - 2 * t - 10) * scale);
                break;

            case 'left':
                // Draw left side view: depth × height
                this.drawPanel(x, y, dims.depth * scale, t * scale, '#C19A6B', 'TOP');
                this.drawPanel(x, y + (dims.height - t) * scale, dims.depth * scale, t * scale, '#C19A6B', 'BOTTOM');
                this.drawPanel(x, y, t * scale, dims.height * scale, '#D2B48C', 'SIDE');
                this.drawPanel(x + (dims.depth - t) * scale, y, t * scale, dims.height * scale, '#8B4513', 'BACK');
                break;

            case 'back':
                // Draw back view: same as front but show back panel
                this.drawPanel(x, y, t * scale, dims.height * scale, '#D2B48C', 'L');
                this.drawPanel(x + (dims.width - t) * scale, y, t * scale, dims.height * scale, '#D2B48C', 'R');
                this.drawPanel(x + t * scale, y + t * scale, (dims.width - 2 * t) * scale, (dims.height - 2 * t) * scale, '#A0826D', 'BACK');
                break;

            case 'top':
                // Draw top view: width × depth
                this.drawPanel(x, y, t * scale, dims.depth * scale, '#D2B48C', 'L');
                this.drawPanel(x + (dims.width - t) * scale, y, t * scale, dims.depth * scale, '#D2B48C', 'R');
                this.drawPanel(x + t * scale, y, (dims.width - 2 * t) * scale, dims.depth * scale, '#C19A6B', 'SHELF');
                // Front edge (darker)
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + dims.width * scale, y);
                this.ctx.stroke();
                break;
        }

        this.ctx.restore();
    }

    drawPanel(x, y, width, height, color, label) {
        // Draw panel
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        // Draw border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Draw grain lines
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < width; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i, y);
            this.ctx.lineTo(x + i, y + height);
            this.ctx.stroke();
        }

        // Draw label if panel is large enough
        if (width > 30 && height > 15) {
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label, x + width / 2, y + height / 2);
        }
    }

    drawDoor(x, y, width, height) {
        // Draw door panel
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(x, y, width, height);
        
        // Draw door frame
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw inner panel
        const inset = Math.min(width, height) * 0.1;
        this.ctx.strokeRect(x + inset, y + inset, width - 2 * inset, height - 2 * inset);

        // Draw handle
        const handleX = x + width - 30;
        const handleY = y + height / 2;
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.beginPath();
        this.ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawHardwareForView(view, x, y, scale) {
        const box = this.currentBox;
        const dims = box.dimensions;
        const t = 18;

        // Draw hinges on front view
        if (view === 'front') {
            const hinges = box.hardware.filter(h => h.type === 'hinge');
            if (hinges.length > 0) {
                const hingeCount = hinges[0].quantity;
                const spacing = dims.height / (hingeCount + 1);
                
                for (let i = 1; i <= hingeCount; i++) {
                    const hingeY = y + i * spacing * scale;
                    const hingeX = x + (t + 5) * scale;
                    
                    // Draw hinge symbol
                    this.ctx.fillStyle = '#C0C0C0';
                    this.ctx.fillRect(hingeX, hingeY - 8, 15, 16);
                    this.ctx.strokeStyle = '#808080';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(hingeX, hingeY - 8, 15, 16);
                    
                    // Hinge screw holes
                    this.ctx.fillStyle = '#404040';
                    this.ctx.beginPath();
                    this.ctx.arc(hingeX + 5, hingeY - 4, 2, 0, 2 * Math.PI);
                    this.ctx.arc(hingeX + 5, hingeY + 4, 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }

        // Draw screws on back view
        if (view === 'back') {
            const screws = box.hardware.filter(h => h.type === 'back_screw');
            if (screws.length > 0) {
                const screwCount = Math.min(screws[0].quantity, 24);
                const spacing = (2 * (dims.width + dims.height)) / screwCount;
                
                // Draw screws around perimeter
                let distance = 0;
                for (let i = 0; i < screwCount; i++) {
                    let screwX, screwY;
                    
                    if (distance < dims.width) {
                        // Top edge
                        screwX = x + t * scale + distance * scale;
                        screwY = y + t * scale + 10;
                    } else if (distance < dims.width + dims.height) {
                        // Right edge
                        screwX = x + (dims.width - t - 10) * scale;
                        screwY = y + t * scale + (distance - dims.width) * scale;
                    } else if (distance < 2 * dims.width + dims.height) {
                        // Bottom edge
                        screwX = x + (dims.width - t) * scale - (distance - dims.width - dims.height) * scale;
                        screwY = y + (dims.height - t - 10) * scale;
                    } else {
                        // Left edge
                        screwX = x + t * scale + 10;
                        screwY = y + (dims.height - t) * scale - (distance - 2 * dims.width - dims.height) * scale;
                    }
                    
                    this.ctx.fillStyle = '#A9A9A9';
                    this.ctx.beginPath();
                    this.ctx.arc(screwX, screwY, 3, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    distance += spacing;
                }
            }
        }
    }

    drawDimensionsForView(view, x, y, viewWidth, viewHeight, scale) {
        this.ctx.save();
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw dimension lines
        const dims = this.currentBox.dimensions;
        
        switch(view) {
            case 'front':
            case 'back':
                // Width dimension
                this.drawDimensionLine(
                    x, y + viewHeight * scale + 30,
                    x + viewWidth * scale, y + viewHeight * scale + 30,
                    `W: ${dims.width}mm`
                );
                // Height dimension
                this.drawDimensionLine(
                    x + viewWidth * scale + 30, y,
                    x + viewWidth * scale + 30, y + viewHeight * scale,
                    `H: ${dims.height}mm`,
                    true
                );
                break;
            
            case 'left':
                this.drawDimensionLine(
                    x, y + viewHeight * scale + 30,
                    x + viewWidth * scale, y + viewHeight * scale + 30,
                    `D: ${dims.depth}mm`
                );
                this.drawDimensionLine(
                    x + viewWidth * scale + 30, y,
                    x + viewWidth * scale + 30, y + viewHeight * scale,
                    `H: ${dims.height}mm`,
                    true
                );
                break;
            
            case 'top':
                this.drawDimensionLine(
                    x, y + viewHeight * scale + 30,
                    x + viewWidth * scale, y + viewHeight * scale + 30,
                    `W: ${dims.width}mm`
                );
                this.drawDimensionLine(
                    x + viewWidth * scale + 30, y,
                    x + viewWidth * scale + 30, y + viewHeight * scale,
                    `D: ${dims.depth}mm`,
                    true
                );
                break;
        }

        this.ctx.restore();
    }

    drawDimensionLine(x1, y1, x2, y2, label, vertical = false) {
        // Draw line
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Draw arrows
        const arrowSize = 10;
        this.ctx.fillStyle = '#e74c3c';
        
        if (!vertical) {
            // Horizontal arrows
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1 + arrowSize, y1 - arrowSize / 2);
            this.ctx.lineTo(x1 + arrowSize, y1 + arrowSize / 2);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - arrowSize, y2 - arrowSize / 2);
            this.ctx.lineTo(x2 - arrowSize, y2 + arrowSize / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Label
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillText(label, (x1 + x2) / 2, y1 - 10);
        } else {
            // Vertical arrows
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1 - arrowSize / 2, y1 + arrowSize);
            this.ctx.lineTo(x1 + arrowSize / 2, y1 + arrowSize);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - arrowSize / 2, y2 - arrowSize);
            this.ctx.lineTo(x2 + arrowSize / 2, y2 - arrowSize);
            this.ctx.closePath();
            this.ctx.fill();

            // Label
            this.ctx.save();
            this.ctx.translate(x1 + 20, (y1 + y2) / 2);
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.fillText(label, 0, 0);
            this.ctx.restore();
        }
    }

    drawTitle() {
        // Draw main title
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(
            `${this.currentBox.cabinetName} - Box Construction Details`,
            this.canvas.width / 2,
            5
        );
    }

    resize() {
        this.setupCanvas();
        if (this.currentBox) {
            this.draw();
        }
    }
}

// Make available globally
window.BoxViewer = BoxViewer;
