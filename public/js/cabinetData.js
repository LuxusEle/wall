// Cabinet Systems Database - European Frameless Systems

const CABINET_SYSTEMS = {
    'european-metric': {
        name: 'European Frameless (Metric)',
        standard: '600mm module',
        unit: 'mm',
        baseCabinets: [
            { id: 'base-1door-300', name: '1-Door Base', width: 300, height: 720, depth: 580, price: 150, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-400', name: '1-Door Base', width: 400, height: 720, depth: 580, price: 180, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-450', name: '1-Door Base', width: 450, height: 720, depth: 580, price: 200, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-500', name: '1-Door Base', width: 500, height: 720, depth: 580, price: 220, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-600', name: '1-Door Base', width: 600, height: 720, depth: 580, price: 250, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-3drawer-400', name: '3-Drawer Base', width: 400, height: 720, depth: 580, price: 280, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-3drawer-500', name: '3-Drawer Base', width: 500, height: 720, depth: 580, price: 320, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-3drawer-600', name: '3-Drawer Base', width: 600, height: 720, depth: 580, price: 350, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-sink-800', name: 'Sink Base', width: 800, height: 720, depth: 580, price: 280, icon: '🚰', description: 'Sink base without drawers' },
            { id: 'base-sink-1000', name: 'Sink Base', width: 1000, height: 720, depth: 580, price: 320, icon: '🚰', description: 'Sink base without drawers' },
            { id: 'base-cooktop-600', name: 'Cooktop Base', width: 600, height: 720, depth: 580, price: 250, icon: '🔥', description: 'Base for built-in cooktop' },
            { id: 'base-corner-900', name: 'Corner Base (L)', width: 900, height: 720, depth: 580, price: 450, icon: '📐', description: 'L-shaped corner base' }
        ],
        wallCabinets: [
            { id: 'wall-1door-300-360', name: 'Wall 1-Door', width: 300, height: 360, depth: 320, price: 120, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-400-360', name: 'Wall 1-Door', width: 400, height: 360, depth: 320, price: 140, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-500-360', name: 'Wall 1-Door', width: 500, height: 360, depth: 320, price: 160, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-600-360', name: 'Wall 1-Door', width: 600, height: 360, depth: 320, price: 180, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-300-720', name: 'Wall 1-Door Tall', width: 300, height: 720, depth: 320, price: 180, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-400-720', name: 'Wall 1-Door Tall', width: 400, height: 720, depth: 320, price: 220, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-500-720', name: 'Wall 1-Door Tall', width: 500, height: 720, depth: 320, price: 250, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-600-720', name: 'Wall 1-Door Tall', width: 600, height: 720, depth: 320, price: 280, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-open-300', name: 'Open Shelf', width: 300, height: 360, depth: 320, price: 80, icon: '📚', description: 'Open wall shelf' },
            { id: 'wall-open-600', name: 'Open Shelf', width: 600, height: 360, depth: 320, price: 120, icon: '📚', description: 'Open wall shelf' }
        ],
        tallCabinets: [
            { id: 'tall-pantry-600', name: 'Pantry Cabinet', width: 600, height: 2100, depth: 580, price: 650, icon: '🏢', description: 'Full height pantry' },
            { id: 'tall-oven-600', name: 'Oven Cabinet', width: 600, height: 2100, depth: 580, price: 580, icon: '🍳', description: 'Built-in oven housing' },
            { id: 'tall-fridge-600', name: 'Fridge Housing', width: 600, height: 2100, depth: 580, price: 520, icon: '❄️', description: 'Integrated fridge cabinet' },
            { id: 'tall-utility-400', name: 'Utility/Broom', width: 400, height: 2100, depth: 580, price: 480, icon: '🧹', description: 'Tall utility cabinet' }
        ],
        specialtyCabinets: [
            { id: 'hood-600', name: 'Range Hood', width: 600, height: 450, depth: 320, price: 350, icon: '💨', description: 'Range hood cabinet' },
            { id: 'hood-900', name: 'Range Hood Wide', width: 900, height: 450, depth: 320, price: 420, icon: '💨', description: 'Wide range hood cabinet' },
            { id: 'filler-variable', name: 'Filler Strip', width: 0, height: 720, depth: 0, price: 25, icon: '📏', description: 'Adjustable filler (per 10mm)' }
        ]
    },
    
    'european-imperial': {
        name: 'European Frameless (Imperial)',
        standard: '24" module',
        unit: 'inches',
        baseCabinets: [
            { id: 'base-1door-12', name: '1-Door Base', width: 12, height: 28.5, depth: 23, price: 150, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-15', name: '1-Door Base', width: 15, height: 28.5, depth: 23, price: 180, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-18', name: '1-Door Base', width: 18, height: 28.5, depth: 23, price: 200, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-21', name: '1-Door Base', width: 21, height: 28.5, depth: 23, price: 220, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-1door-24', name: '1-Door Base', width: 24, height: 28.5, depth: 23, price: 250, icon: '🚪', description: 'Single door base cabinet' },
            { id: 'base-3drawer-15', name: '3-Drawer Base', width: 15, height: 28.5, depth: 23, price: 280, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-3drawer-18', name: '3-Drawer Base', width: 18, height: 28.5, depth: 23, price: 320, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-3drawer-24', name: '3-Drawer Base', width: 24, height: 28.5, depth: 23, price: 350, icon: '📦', description: 'Three drawer base unit' },
            { id: 'base-sink-30', name: 'Sink Base', width: 30, height: 28.5, depth: 23, price: 280, icon: '🚰', description: 'Sink base without drawers' },
            { id: 'base-sink-36', name: 'Sink Base', width: 36, height: 28.5, depth: 23, price: 320, icon: '🚰', description: 'Sink base without drawers' },
            { id: 'base-cooktop-24', name: 'Cooktop Base', width: 24, height: 28.5, depth: 23, price: 250, icon: '🔥', description: 'Base for built-in cooktop' },
            { id: 'base-corner-36', name: 'Corner Base (L)', width: 36, height: 28.5, depth: 23, price: 450, icon: '📐', description: 'L-shaped corner base' }
        ],
        wallCabinets: [
            { id: 'wall-1door-12-14', name: 'Wall 1-Door', width: 12, height: 14, depth: 12, price: 120, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-15-14', name: 'Wall 1-Door', width: 15, height: 14, depth: 12, price: 140, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-18-14', name: 'Wall 1-Door', width: 18, height: 14, depth: 12, price: 160, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-24-14', name: 'Wall 1-Door', width: 24, height: 14, depth: 12, price: 180, icon: '🚪', description: 'Single door wall cabinet' },
            { id: 'wall-1door-12-28', name: 'Wall 1-Door Tall', width: 12, height: 28, depth: 12, price: 180, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-15-28', name: 'Wall 1-Door Tall', width: 15, height: 28, depth: 12, price: 220, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-18-28', name: 'Wall 1-Door Tall', width: 18, height: 28, depth: 12, price: 250, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-1door-24-28', name: 'Wall 1-Door Tall', width: 24, height: 28, depth: 12, price: 280, icon: '🚪', description: 'Tall single door wall cabinet' },
            { id: 'wall-open-12', name: 'Open Shelf', width: 12, height: 14, depth: 12, price: 80, icon: '📚', description: 'Open wall shelf' },
            { id: 'wall-open-24', name: 'Open Shelf', width: 24, height: 14, depth: 12, price: 120, icon: '📚', description: 'Open wall shelf' }
        ],
        tallCabinets: [
            { id: 'tall-pantry-24', name: 'Pantry Cabinet', width: 24, height: 84, depth: 23, price: 650, icon: '🏢', description: 'Full height pantry' },
            { id: 'tall-oven-24', name: 'Oven Cabinet', width: 24, height: 84, depth: 23, price: 580, icon: '🍳', description: 'Built-in oven housing' },
            { id: 'tall-fridge-24', name: 'Fridge Housing', width: 24, height: 84, depth: 23, price: 520, icon: '❄️', description: 'Integrated fridge cabinet' },
            { id: 'tall-utility-18', name: 'Utility/Broom', width: 18, height: 84, depth: 23, price: 480, icon: '🧹', description: 'Tall utility cabinet' }
        ],
        specialtyCabinets: [
            { id: 'hood-24', name: 'Range Hood', width: 24, height: 18, depth: 12, price: 350, icon: '💨', description: 'Range hood cabinet' },
            { id: 'hood-36', name: 'Range Hood Wide', width: 36, height: 18, depth: 12, price: 420, icon: '💨', description: 'Wide range hood cabinet' },
            { id: 'filler-variable', name: 'Filler Strip', width: 0, height: 28.5, depth: 0, price: 25, icon: '📏', description: 'Adjustable filler (per 1")' }
        ]
    }
};

// Cabinet placement data structure
class Cabinet {
    constructor(type, data, system) {
        this.id = generateUniqueId();
        this.typeId = type;
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.depth = data.depth;
        this.price = data.price;
        this.icon = data.icon;
        this.description = data.description;
        this.system = system;
        this.category = this.getCategoryFromType(type);
    }
    
    getCategoryFromType(type) {
        if (type.startsWith('base-')) return 'base';
        if (type.startsWith('wall-')) return 'wall';
        if (type.startsWith('tall-')) return 'tall';
        return 'specialty';
    }
}

class PlacedCabinet {
    constructor(cabinet, wallId, x) {
        this.cabinet = cabinet;
        this.wallId = wallId;
        this.x = x; // Distance from left edge in system units
        this.selected = false;
        this.id = generateUniqueId();
    }
    
    get y() {
        // Auto-calculate Y position based on cabinet category
        if (this.cabinet.category === 'base') return 0; // On floor
        if (this.cabinet.category === 'wall') return 1350; // 1350mm or 54" from floor
        if (this.cabinet.category === 'tall') return 0; // On floor
        if (this.cabinet.category === 'specialty') return 1800; // Above wall cabinets
        return 0;
    }
}

// Utility function to generate unique IDs
function generateUniqueId() {
    return 'cab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
