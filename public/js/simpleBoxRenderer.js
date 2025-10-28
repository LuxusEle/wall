/**
 * Simple Box Renderer - Phase 1
 * Shows 2D line drawings of boxes with correct dimensions
 * Focus: Visual planning and layout, NOT complex calculations
 */

class SimpleBoxRenderer {
    constructor() {
        this.scale = 0.5; // 0.5 pixels per mm for display
        this.margin = 50;
        this.lineColor = '#2c3e50';
        this.dimensionColor = '#e74c3c';
        this.textColor = '#34495e';
    }

    /**
     * Render a simple cabinet box as 2D line drawing
     */
    renderBox(cabinet, canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Get dimensions in mm
        const width = cabinet.width || 600;
        const height = cabinet.height || 720;
        const depth = cabinet.depth || 320;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate drawing dimensions
        const drawWidth = width * this.scale;
        const drawHeight = height * this.scale;
        const drawDepth = depth * this.scale;
        
        // Center the drawing
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw front view (main rectangle)
        const frontX = centerX - drawWidth / 2;
        const frontY = centerY - drawHeight / 2;
        
        this.drawRectangleWithDimensions(ctx, frontX, frontY, drawWidth, drawHeight, width, height, 'FRONT VIEW');
        
        // Show basic info
        this.drawCabinetInfo(ctx, cabinet, 10, 30);
    }

    /**
     * Draw rectangle with dimension lines
     */
    drawRectangleWithDimensions(ctx, x, y, w, h, realW, realH, label) {
        // Set line style
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2;
        
        // Draw main rectangle
        ctx.strokeRect(x, y, w, h);
        
        // Draw dimension lines
        this.drawDimension(ctx, x, y + h + 20, x + w, y + h + 20, `${realW}mm`, 'horizontal');
        this.drawDimension(ctx, x - 30, y, x - 30, y + h, `${realH}mm`, 'vertical');
        
        // Draw label
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + w/2, y - 10);
    }

    /**
     * Draw dimension line with text
     */
    drawDimension(ctx, x1, y1, x2, y2, text, orientation) {
        ctx.strokeStyle = this.dimensionColor;
        ctx.lineWidth = 1;
        
        // Draw dimension line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw arrows/caps
        if (orientation === 'horizontal') {
            // Left cap
            ctx.beginPath();
            ctx.moveTo(x1, y1 - 5);
            ctx.lineTo(x1, y1 + 5);
            ctx.stroke();
            
            // Right cap
            ctx.beginPath();
            ctx.moveTo(x2, y2 - 5);
            ctx.lineTo(x2, y2 + 5);
            ctx.stroke();
        } else {
            // Top cap
            ctx.beginPath();
            ctx.moveTo(x1 - 5, y1);
            ctx.lineTo(x1 + 5, y1);
            ctx.stroke();
            
            // Bottom cap
            ctx.beginPath();
            ctx.moveTo(x2 - 5, y2);
            ctx.lineTo(x2 + 5, y2);
            ctx.stroke();
        }
        
        // Draw text
        ctx.fillStyle = this.dimensionColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        if (orientation === 'horizontal') {
            ctx.fillText(text, (x1 + x2) / 2, y1 - 5);
        } else {
            ctx.save();
            ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(text, 0, -5);
            ctx.restore();
        }
    }

    /**
     * Draw cabinet information
     */
    drawCabinetInfo(ctx, cabinet, x, y) {
        ctx.fillStyle = this.textColor;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        const info = [
            `Cabinet: ${cabinet.name}`,
            `Type: ${this.getCabinetType(cabinet)}`,
            `Dimensions: ${cabinet.width} × ${cabinet.height} × ${cabinet.depth} mm`,
            `ID: ${cabinet.id}`
        ];
        
        info.forEach((line, index) => {
            ctx.fillText(line, x, y + (index * 20));
        });
    }

    /**
     * Simple cabinet type detection
     */
    getCabinetType(cabinet) {
        const id = cabinet.id.toLowerCase();
        if (id.includes('base')) return 'Base Cabinet';
        if (id.includes('wall')) return 'Wall Cabinet';
        if (id.includes('tall')) return 'Tall Cabinet';
        if (id.includes('drawer')) return 'Drawer Cabinet';
        return 'Cabinet';
    }

    /**
     * Update canvas when cabinet parameters change
     */
    updateBox(cabinet) {
        if (this.currentCabinet) {
            this.renderBox(cabinet, 'box-canvas');
        }
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.SimpleBoxRenderer = SimpleBoxRenderer;
}