/**
 * COMPLETE WALL AND BOX LOGIC - CONSOLIDATED
 * Kitchen Cabinet Calculator System
 * 
 * This file combines all wall configuration and box construction logic
 * Ported from Ruby (CBX_Shotgun V2.rb) to JavaScript
 */

// ==================== CONSTANTS ====================

const MATERIAL_THICKNESS = {
    carcass: 18,        // Standard cabinet box material (mm)
    back: 6,            // Back panel thickness (mm)
    shelf: 18,          // Shelf thickness (mm)
    drawer: 18,         // Drawer box thickness (mm)
    front: 18           // Door/drawer front thickness (mm)
};

const CABINET_STANDARDS = {
    base: {
        height: 720,    // Standard base cabinet height (mm)
        depth: 580,     // Standard base cabinet depth (mm)
        toeKick: 100    // Toe kick height (mm)
    },
    wall: {
        height: 360,    // Standard wall cabinet height (mm) - can be 720mm
        depth: 320,     // Standard wall cabinet depth (mm)
        hangHeight: 1500 // Height from floor to bottom of wall cabinet (mm)
    },
    tall: {
        height: 2100,   // Standard tall cabinet height (mm)
        depth: 580      // Standard tall cabinet depth (mm)
    }
};

const HARDWARE_RULES = {
    hinges: {
        standard: 2,        // Hinges per door for normal doors
        tall: 3,            // Hinges per door for tall doors
        tallThreshold: 1200 // Height threshold for extra hinge (mm)
    },
    slides: {
        depthRatio: 0.9,    // Slide length = 90% of cabinet depth
        minLength: 250,      // Minimum slide length (mm)
        maxLength: 600       // Maximum slide length (mm)
    },
    connectors: {
        screwsPerCorner: 4,  // Confirmat screws per corner
        shelfSupports: 4,    // Support pins per shelf
        backScrewSpacing: 150 // Back panel screw spacing (mm)
    }
};

const SHEET_SIZES = {
    standard: {
        width: 2440,    // Standard sheet width (mm)
        height: 1220    // Standard sheet height (mm)
    },
    kerf: 3            // Saw blade width (mm)
};

const SNAP_THRESHOLD = 10; // Snapping distance for drag-and-drop (mm)

// ==================== WALL LOGIC ====================

/**
 * Wall Class - Represents a physical wall with openings
 */
class Wall {
    constructor(label, length, height, doors = [], windows = []) {
        this.label = label;           // 'A', 'B', 'C', or 'D'
        this.length = length;         // mm
        this.height = height;         // mm
        this.doors = doors;           // Array of door objects
        this.windows = windows;       // Array of window objects
        this.segments = [];           // Calculated available segments
    }

    /**
     * Validate wall configuration
     */
    validate() {
        const errors = [];

        // Check minimum dimensions
        if (this.length < 500) {
            errors.push('Wall length must be at least 500mm');
        }
        if (this.height < 500) {
            errors.push('Wall height must be at least 500mm');
        }

        // Validate each door
        this.doors.forEach((door, index) => {
            if (door.distanceFromLeft + door.width > this.length) {
                errors.push(`Door ${index + 1} extends beyond wall edge`);
            }
            if (door.height > this.height) {
                errors.push(`Door ${index + 1} is taller than wall`);
            }

            // Check for door overlaps
            this.doors.forEach((otherDoor, otherIndex) => {
                if (index !== otherIndex) {
                    if (this.doOpeningsOverlap(
                        door.distanceFromLeft,
                        door.distanceFromLeft + door.width,
                        otherDoor.distanceFromLeft,
                        otherDoor.distanceFromLeft + otherDoor.width
                    )) {
                        errors.push(`Door ${index + 1} overlaps with Door ${otherIndex + 1}`);
                    }
                }
            });
        });

        // Validate each window
        this.windows.forEach((window, index) => {
            if (window.distanceFromLeft + window.width > this.length) {
                errors.push(`Window ${index + 1} extends beyond wall edge`);
            }
            if (window.distanceFromFloor + window.height > this.height) {
                errors.push(`Window ${index + 1} extends above wall`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Check if two openings overlap
     */
    doOpeningsOverlap(start1, end1, start2, end2) {
        return !(end1 <= start2 || start1 >= end2);
    }

    /**
     * Calculate available segments for cabinet placement
     */
    calculateAvailableSegments() {
        // Start with entire wall as one available segment
        let segments = [{
            start: 0,
            end: this.length,
            type: 'available'
        }];

        // Mark door zones as unavailable
        this.doors.forEach(door => {
            const doorStart = door.distanceFromLeft;
            const doorEnd = doorStart + door.width;
            segments = this.splitSegmentsByOpening(segments, doorStart, doorEnd, 'door');
        });

        // Mark window zones (base cabinets can't go under low windows)
        this.windows.forEach(window => {
            const windowStart = window.distanceFromLeft;
            const windowEnd = windowStart + window.width;

            // Only block if window is low enough to interfere with base cabinets
            if (window.distanceFromFloor < CABINET_STANDARDS.base.height) {
                segments = this.splitSegmentsByOpening(segments, windowStart, windowEnd, 'window');
            }
        });

        // Filter to only available segments
        this.segments = segments.filter(s => s.type === 'available');
        return this.segments;
    }

    /**
     * Split segments by an opening (door or window)
     */
    splitSegmentsByOpening(segments, openingStart, openingEnd, type) {
        const newSegments = [];

        segments.forEach(segment => {
            // If segment is already blocked, keep it
            if (segment.type !== 'available') {
                newSegments.push(segment);
                return;
            }

            // Opening is completely outside this segment
            if (openingEnd <= segment.start || openingStart >= segment.end) {
                newSegments.push(segment);
                return;
            }

            // Opening splits the segment
            // Add segment before opening (if exists)
            if (openingStart > segment.start) {
                newSegments.push({
                    start: segment.start,
                    end: openingStart,
                    type: 'available'
                });
            }

            // Add the blocked segment
            newSegments.push({
                start: Math.max(segment.start, openingStart),
                end: Math.min(segment.end, openingEnd),
                type: type
            });

            // Add segment after opening (if exists)
            if (openingEnd < segment.end) {
                newSegments.push({
                    start: openingEnd,
                    end: segment.end,
                    type: 'available'
                });
            }
        });

        return newSegments;
    }

    /**
     * Get total available length for cabinets
     */
    getTotalAvailableLength() {
        this.calculateAvailableSegments();
        return this.segments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
    }
}

// ==================== BOX CONSTRUCTION LOGIC ====================

/**
 * Cabinet Box Builder - Converts cabinet specs into panels and hardware
 */
class CabinetBoxBuilder {
    constructor() {
        this.materialThickness = MATERIAL_THICKNESS;
        this.hardwareRules = HARDWARE_RULES;
    }

    /**
     * Build complete box from cabinet specification
     */
    buildBox(cabinet) {
        const type = this.getCabinetType(cabinet.id);

        switch (type) {
            case 'base':
                return this.buildBaseBox(cabinet);
            case 'wall':
                return this.buildWallBox(cabinet);
            case 'tall':
                return this.buildTallBox(cabinet);
            default:
                return this.buildGenericBox(cabinet);
        }
    }

    /**
     * Determine cabinet type from ID
     */
    getCabinetType(cabinetId) {
        if (cabinetId.startsWith('base-')) return 'base';
        if (cabinetId.startsWith('wall-')) return 'wall';
        if (cabinetId.startsWith('tall-')) return 'tall';
        return 'specialty';
    }

    /**
     * Build Base Cabinet Box
     */
    buildBaseBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || CABINET_STANDARDS.base.height;
        const d = cabinet.depth || CABINET_STANDARDS.base.depth;
        const t = this.materialThickness.carcass;

        const panels = [];
        const hardware = [];
        const edgeBanding = [];

        // === SIDES (2 panels) ===
        // Left side
        panels.push({
            id: 'side_left',
            name: 'Left Side Panel',
            width: d,
            height: h,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'vertical',
            edges: ['front', 'top', 'bottom']
        });

        // Right side
        panels.push({
            id: 'side_right',
            name: 'Right Side Panel',
            width: d,
            height: h,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'vertical',
            edges: ['front', 'top', 'bottom']
        });

        // Edge banding for sides
        const sideEdgeLength = (d + h + h) / 1000; // Convert to meters
        edgeBanding.push({
            panel: 'side_left',
            edges: ['front', 'top', 'bottom'],
            totalLength: sideEdgeLength,
            unit: 'meters'
        });
        edgeBanding.push({
            panel: 'side_right',
            edges: ['front', 'top', 'bottom'],
            totalLength: sideEdgeLength,
            unit: 'meters'
        });

        // === BOTTOM SHELF ===
        // Sits between sides, so reduce width by 2×thickness
        const bottomWidth = w - (2 * t);
        panels.push({
            id: 'bottom',
            name: 'Bottom Shelf',
            width: bottomWidth,
            height: d,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'horizontal',
            edges: ['front']
        });
        edgeBanding.push({
            panel: 'bottom',
            edges: ['front'],
            totalLength: bottomWidth / 1000,
            unit: 'meters'
        });

        // === TOP PANEL ===
        if (cabinet.id.includes('sink')) {
            // Sink base: No top shelf, just stretchers
            panels.push({
                id: 'stretcher_front',
                name: 'Front Stretcher',
                width: bottomWidth,
                height: 100, // Standard 100mm stretcher
                thickness: t,
                quantity: 1,
                material: 'carcass',
                grainDirection: 'horizontal',
                edges: ['top', 'bottom']
            });
            panels.push({
                id: 'stretcher_back',
                name: 'Back Stretcher',
                width: bottomWidth,
                height: 100,
                thickness: t,
                quantity: 1,
                material: 'carcass',
                grainDirection: 'horizontal',
                edges: ['top', 'bottom']
            });
        } else {
            // Standard: Full top shelf
            panels.push({
                id: 'top',
                name: 'Top Shelf',
                width: bottomWidth,
                height: d,
                thickness: t,
                quantity: 1,
                material: 'carcass',
                grainDirection: 'horizontal',
                edges: ['front']
            });
            edgeBanding.push({
                panel: 'top',
                edges: ['front'],
                totalLength: bottomWidth / 1000,
                unit: 'meters'
            });
        }

        // === BACK PANEL ===
        const backWidth = w - (2 * t);
        const backHeight = h - t; // Sits on bottom shelf
        panels.push({
            id: 'back',
            name: 'Back Panel',
            width: backWidth,
            height: backHeight,
            thickness: this.materialThickness.back,
            quantity: 1,
            material: 'back',
            grainDirection: 'vertical',
            edges: [] // No edge banding on back
        });

        // === TOE KICK (Base cabinets only) ===
        const toeKickHeight = CABINET_STANDARDS.base.toeKick;
        panels.push({
            id: 'toe_kick',
            name: 'Toe Kick',
            width: w,
            height: toeKickHeight,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'horizontal',
            edges: ['top']
        });
        edgeBanding.push({
            panel: 'toe_kick',
            edges: ['top'],
            totalLength: w / 1000,
            unit: 'meters'
        });

        // === HARDWARE ===
        hardware.push(...this.calculateHardware(cabinet, panels));
        hardware.push(...this.calculateConnectors(panels, w, h));

        return {
            cabinetId: cabinet.id,
            cabinetName: cabinet.name,
            type: 'base',
            dimensions: { width: w, height: h, depth: d },
            panels: panels,
            hardware: hardware,
            edgeBanding: edgeBanding,
            summary: this.generateSummary(panels, hardware, edgeBanding)
        };
    }

    /**
     * Build Wall Cabinet Box
     */
    buildWallBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || CABINET_STANDARDS.wall.height;
        const d = cabinet.depth || CABINET_STANDARDS.wall.depth;
        const t = this.materialThickness.carcass;

        const panels = [];
        const hardware = [];
        const edgeBanding = [];

        // Sides
        panels.push({
            id: 'side_left',
            name: 'Left Side Panel',
            width: d,
            height: h,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'vertical',
            edges: ['front', 'top', 'bottom']
        });
        panels.push({
            id: 'side_right',
            name: 'Right Side Panel',
            width: d,
            height: h,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'vertical',
            edges: ['front', 'top', 'bottom']
        });

        const sideEdgeLength = (d + h + h) / 1000;
        edgeBanding.push({
            panel: 'side_left',
            edges: ['front', 'top', 'bottom'],
            totalLength: sideEdgeLength,
            unit: 'meters'
        });
        edgeBanding.push({
            panel: 'side_right',
            edges: ['front', 'top', 'bottom'],
            totalLength: sideEdgeLength,
            unit: 'meters'
        });

        // Top and Bottom shelves
        const shelfWidth = w - (2 * t);
        panels.push({
            id: 'top',
            name: 'Top Shelf',
            width: shelfWidth,
            height: d,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'horizontal',
            edges: ['front']
        });
        panels.push({
            id: 'bottom',
            name: 'Bottom Shelf',
            width: shelfWidth,
            height: d,
            thickness: t,
            quantity: 1,
            material: 'carcass',
            grainDirection: 'horizontal',
            edges: ['front']
        });

        edgeBanding.push({
            panel: 'top',
            edges: ['front'],
            totalLength: shelfWidth / 1000,
            unit: 'meters'
        });
        edgeBanding.push({
            panel: 'bottom',
            edges: ['front'],
            totalLength: shelfWidth / 1000,
            unit: 'meters'
        });

        // Back panel
        const backWidth = w - (2 * t);
        const backHeight = h - (2 * t);
        panels.push({
            id: 'back',
            name: 'Back Panel',
            width: backWidth,
            height: backHeight,
            thickness: this.materialThickness.back,
            quantity: 1,
            material: 'back',
            grainDirection: 'vertical',
            edges: []
        });

        // Hardware
        hardware.push(...this.calculateHardware(cabinet, panels));
        hardware.push(...this.calculateConnectors(panels, w, h));

        return {
            cabinetId: cabinet.id,
            cabinetName: cabinet.name,
            type: 'wall',
            dimensions: { width: w, height: h, depth: d },
            panels: panels,
            hardware: hardware,
            edgeBanding: edgeBanding,
            summary: this.generateSummary(panels, hardware, edgeBanding)
        };
    }

    /**
     * Build Tall Cabinet Box
     */
    buildTallBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || CABINET_STANDARDS.tall.height;
        const d = cabinet.depth || CABINET_STANDARDS.tall.depth;
        const t = this.materialThickness.carcass;

        // Start with base cabinet structure
        const box = this.buildBaseBox({ ...cabinet, height: h, depth: d });
        box.type = 'tall';

        // Add additional adjustable shelves
        const shelfWidth = w - (2 * t);
        const shelfCount = Math.floor(h / 400); // One shelf every ~400mm

        for (let i = 1; i < shelfCount; i++) {
            box.panels.push({
                id: `shelf_${i}`,
                name: `Adjustable Shelf ${i}`,
                width: shelfWidth,
                height: d,
                thickness: t,
                quantity: 1,
                material: 'carcass',
                grainDirection: 'horizontal',
                edges: ['front']
            });
            box.edgeBanding.push({
                panel: `shelf_${i}`,
                edges: ['front'],
                totalLength: shelfWidth / 1000,
                unit: 'meters'
            });
        }

        // Add shelf support pins
        box.hardware.push({
            type: 'shelf_support',
            name: 'Shelf Support Pins',
            quantity: shelfCount * 4, // 4 pins per shelf
            unit: 'pieces',
            unitCost: 0.25
        });

        return box;
    }

    /**
     * Calculate hardware based on cabinet configuration
     */
    calculateHardware(cabinet, panels) {
        const hardware = [];
        const type = this.getCabinetType(cabinet.id);

        // HINGES
        if (cabinet.id.includes('door') || type === 'base' || type === 'wall') {
            const doorCount = cabinet.id.includes('2door') ? 2 : 1;
            const doorHeight = cabinet.height || (type === 'base' ? 720 : 360);

            let hingesPerDoor = this.hardwareRules.hinges.standard;
            if (doorHeight > this.hardwareRules.hinges.tallThreshold) {
                hingesPerDoor = this.hardwareRules.hinges.tall;
            }

            hardware.push({
                type: 'hinge',
                name: 'Cabinet Hinge (Soft-Close)',
                quantity: doorCount * hingesPerDoor,
                unit: 'pieces',
                unitCost: 2.50,
                notes: `${hingesPerDoor} per door × ${doorCount} doors`
            });
        }

        // DRAWER SLIDES
        if (cabinet.id.includes('drawer')) {
            const drawerCount = parseInt(cabinet.id.match(/(\d+)drawer/)?.[1] || 1);
            const slideLength = Math.floor((cabinet.depth || 580) * this.hardwareRules.slides.depthRatio);

            hardware.push({
                type: 'drawer_slide',
                name: `Undermount Drawer Slide (${slideLength}mm)`,
                quantity: drawerCount * 2, // 2 slides per drawer
                unit: 'pairs',
                unitCost: 8.00,
                notes: `${drawerCount} drawers × 2 slides`
            });
        }

        // HANDLES/KNOBS
        const handleCount = this.calculateHandleCount(cabinet);
        if (handleCount > 0) {
            hardware.push({
                type: 'handle',
                name: 'Cabinet Handle',
                quantity: handleCount,
                unit: 'pieces',
                unitCost: 3.50
            });
        }

        return hardware;
    }

    /**
     * Calculate connectors and screws
     */
    calculateConnectors(panels, width, height) {
        const connectors = [];

        // Confirmat screws (corner connectors)
        const cornerCount = 4;
        const confirmatCount = cornerCount * this.hardwareRules.connectors.screwsPerCorner * panels.length;
        connectors.push({
            type: 'confirmat_screw',
            name: 'Confirmat Screw (5×50mm)',
            quantity: confirmatCount,
            unit: 'pieces',
            unitCost: 0.08
        });

        // Back panel screws
        const backPanel = panels.find(p => p.id === 'back');
        if (backPanel) {
            const perimeterMm = 2 * (backPanel.width + backPanel.height);
            const screwCount = Math.ceil(perimeterMm / this.hardwareRules.connectors.backScrewSpacing);
            connectors.push({
                type: 'back_screw',
                name: 'Back Panel Screw (3×15mm)',
                quantity: screwCount,
                unit: 'pieces',
                unitCost: 0.02
            });
        }

        return connectors;
    }

    /**
     * Calculate handle count
     */
    calculateHandleCount(cabinet) {
        let count = 0;

        // Doors
        if (cabinet.id.includes('1door')) count += 1;
        if (cabinet.id.includes('2door')) count += 2;

        // Drawers
        const drawerMatch = cabinet.id.match(/(\d+)drawer/);
        if (drawerMatch) {
            count += parseInt(drawerMatch[1]);
        }

        return count;
    }

    /**
     * Generate summary statistics
     */
    generateSummary(panels, hardware, edgeBanding) {
        const totalPanelArea = panels.reduce((sum, panel) => {
            return sum + ((panel.width * panel.height) / 1000000) * panel.quantity;
        }, 0);

        const totalEdgeBanding = edgeBanding.reduce((sum, edge) => {
            return sum + edge.totalLength;
        }, 0);

        const hardwareCost = hardware.reduce((sum, item) => {
            return sum + (item.quantity * item.unitCost);
        }, 0);

        return {
            panelCount: panels.length,
            totalPanelArea: totalPanelArea.toFixed(2) + ' m²',
            totalEdgeBanding: totalEdgeBanding.toFixed(2) + ' m',
            hardwareItems: hardware.length,
            hardwareCost: '$' + hardwareCost.toFixed(2)
        };
    }

    /**
     * Generic fallback
     */
    buildGenericBox(cabinet) {
        return this.buildBaseBox(cabinet);
    }
}

// ==================== PLACEMENT LOGIC ====================

/**
 * Cabinet Placement Manager
 */
class CabinetPlacementManager {
    constructor() {
        this.placedCabinets = [];
        this.snapThreshold = SNAP_THRESHOLD;
    }

    /**
     * Place selected cabinets on wall
     */
    placeSelectedCabinets(wall, selectedCabinets) {
        const availableSegments = wall.calculateAvailableSegments();
        this.placedCabinets = [];

        availableSegments.forEach(segment => {
            let currentX = segment.start;

            for (const cabinet of selectedCabinets) {
                if (currentX + cabinet.width <= segment.end) {
                    this.placedCabinets.push({
                        cabinet: cabinet,
                        x: currentX,
                        y: 0, // Base cabinets on floor
                        wallLabel: wall.label,
                        segment: segment
                    });

                    currentX += cabinet.width;
                } else {
                    // Cabinet doesn't fit, move to next segment
                    break;
                }
            }
        });

        return this.placedCabinets;
    }

    /**
     * Auto-fill empty spaces with standard modules
     */
    autoFillSpaces(wall, existingCabinets, standardModules = [600, 500, 450, 400, 300]) {
        const availableSegments = wall.calculateAvailableSegments();
        const newCabinets = [];

        availableSegments.forEach(segment => {
            let occupiedSpace = this.calculateOccupiedSpace(segment, existingCabinets);
            let remainingSpace = (segment.end - segment.start) - occupiedSpace;
            let currentX = segment.start + occupiedSpace;

            while (remainingSpace >= 300) { // Minimum useful cabinet
                let fitted = false;

                // Try to fit largest standard module
                for (const width of standardModules) {
                    if (width <= remainingSpace) {
                        const newCabinet = {
                            cabinet: this.createStandardCabinet(width),
                            x: currentX,
                            y: 0,
                            wallLabel: wall.label,
                            autoFilled: true
                        };

                        newCabinets.push(newCabinet);
                        currentX += width;
                        remainingSpace -= width;
                        fitted = true;
                        break;
                    }
                }

                // If no standard module fits, add filler
                if (!fitted) {
                    if (remainingSpace > 0 && remainingSpace < 300) {
                        const filler = {
                            cabinet: this.createFiller(remainingSpace),
                            x: currentX,
                            y: 0,
                            wallLabel: wall.label,
                            autoFilled: true,
                            isFiller: true
                        };
                        newCabinets.push(filler);
                    }
                    break;
                }
            }
        });

        return newCabinets;
    }

    /**
     * Calculate occupied space in a segment
     */
    calculateOccupiedSpace(segment, cabinets) {
        let occupied = 0;

        cabinets.forEach(placed => {
            if (placed.x >= segment.start && placed.x < segment.end) {
                occupied += placed.cabinet.width;
            }
        });

        return occupied;
    }

    /**
     * Create standard cabinet
     */
    createStandardCabinet(width) {
        return {
            id: `base-1door-${width}`,
            name: `Auto-Fill 1-Door Base ${width}mm`,
            width: width,
            height: 720,
            depth: 580,
            price: Math.round(width * 0.4)
        };
    }

    /**
     * Create filler strip
     */
    createFiller(width) {
        return {
            id: `filler-${width}`,
            name: `Filler Strip ${width}mm`,
            width: width,
            height: 720,
            depth: 0,
            price: Math.round(width * 0.05),
            isFiller: true
        };
    }

    /**
     * Handle cabinet drag with snapping
     */
    snapCabinetPosition(cabinet, newX, wall, otherCabinets) {
        const availableSegments = wall.calculateAvailableSegments();

        // Find target segment
        const targetSegment = availableSegments.find(seg =>
            newX >= seg.start && newX + cabinet.width <= seg.end
        );

        if (!targetSegment) {
            // Position invalid, snap to nearest valid
            return this.findNearestValidPosition(cabinet, newX, availableSegments);
        }

        // Snap to segment boundaries
        if (Math.abs(newX - targetSegment.start) < this.snapThreshold) {
            return targetSegment.start;
        }
        if (Math.abs((newX + cabinet.width) - targetSegment.end) < this.snapThreshold) {
            return targetSegment.end - cabinet.width;
        }

        // Snap to adjacent cabinets
        for (const other of otherCabinets) {
            const otherRight = other.x + other.cabinet.width;
            const cabinetRight = newX + cabinet.width;

            if (Math.abs(otherRight - newX) < this.snapThreshold) {
                return otherRight; // Snap to right edge of other
            }
            if (Math.abs(other.x - cabinetRight) < this.snapThreshold) {
                return other.x - cabinet.width; // Snap to left edge of other
            }
        }

        return newX; // No snapping needed
    }

    /**
     * Find nearest valid position
     */
    findNearestValidPosition(cabinet, desiredX, segments) {
        let nearestX = null;
        let minDistance = Infinity;

        segments.forEach(seg => {
            if (seg.end - seg.start >= cabinet.width) {
                // Try start of segment
                const distance1 = Math.abs(desiredX - seg.start);
                if (distance1 < minDistance) {
                    minDistance = distance1;
                    nearestX = seg.start;
                }

                // Try end of segment
                const possibleX = seg.end - cabinet.width;
                const distance2 = Math.abs(desiredX - possibleX);
                if (distance2 < minDistance) {
                    minDistance = distance2;
                    nearestX = possibleX;
                }
            }
        });

        return nearestX || segments[0]?.start || 0;
    }
}

// ==================== BOM GENERATION ====================

/**
 * Bill of Materials Generator
 */
class BOMGenerator {
    constructor() {
        this.boxBuilder = new CabinetBoxBuilder();
    }

    /**
     * Generate complete BOM from placed cabinets
     */
    generateBOM(placedCabinets) {
        const bom = {
            panels: new Map(),
            hardware: new Map(),
            edgeBanding: 0,
            cabinetCount: placedCabinets.length
        };

        // Aggregate from all cabinets
        placedCabinets.forEach(placed => {
            const box = this.boxBuilder.buildBox(placed.cabinet);

            // Aggregate panels
            box.panels.forEach(panel => {
                const key = `${panel.width}×${panel.height}×${panel.thickness}-${panel.material}`;
                if (bom.panels.has(key)) {
                    bom.panels.get(key).quantity += panel.quantity;
                } else {
                    bom.panels.set(key, { ...panel });
                }
            });

            // Aggregate hardware
            box.hardware.forEach(item => {
                if (bom.hardware.has(item.name)) {
                    bom.hardware.get(item.name).quantity += item.quantity;
                } else {
                    bom.hardware.set(item.name, { ...item });
                }
            });

            // Sum edge banding
            box.edgeBanding.forEach(edge => {
                bom.edgeBanding += edge.totalLength;
            });
        });

        // Calculate sheets needed
        bom.sheets = this.calculateSheetNesting(Array.from(bom.panels.values()));

        // Calculate costs
        bom.costs = this.calculateCosts(bom);

        return bom;
    }

    /**
     * Simple sheet nesting calculation
     */
    calculateSheetNesting(panels) {
        const sheetArea = SHEET_SIZES.standard.width * SHEET_SIZES.standard.height;
        const totalPanelArea = panels.reduce((sum, panel) => {
            return sum + (panel.width * panel.height * panel.quantity);
        }, 0);

        // Assume 75% efficiency (25% waste)
        const efficiency = 0.75;
        const sheetsNeeded = Math.ceil(totalPanelArea / (sheetArea * efficiency));

        return {
            count: sheetsNeeded,
            sheetSize: `${SHEET_SIZES.standard.width}×${SHEET_SIZES.standard.height}mm`,
            totalArea: (sheetsNeeded * sheetArea / 1000000).toFixed(2) + ' m²',
            panelArea: (totalPanelArea / 1000000).toFixed(2) + ' m²',
            wastePercent: ((1 - (totalPanelArea / (sheetsNeeded * sheetArea))) * 100).toFixed(1) + '%'
        };
    }

    /**
     * Calculate total costs
     */
    calculateCosts(bom) {
        const costs = {
            materials: 0,
            hardware: 0,
            edgeBanding: 0,
            labor: 0,
            subtotal: 0,
            markup: 0.20, // 20%
            total: 0
        };

        // Material cost (assume $45 per 18mm sheet, $15 per 6mm sheet)
        costs.materials = bom.sheets.count * 45;

        // Hardware cost
        bom.hardware.forEach(item => {
            costs.hardware += item.quantity * item.unitCost;
        });

        // Edge banding cost ($2 per meter)
        costs.edgeBanding = bom.edgeBanding * 2;

        // Labor cost (2 hours per cabinet at $50/hour)
        costs.labor = bom.cabinetCount * 2 * 50;

        // Calculate total
        costs.subtotal = costs.materials + costs.hardware + costs.edgeBanding + costs.labor;
        costs.total = costs.subtotal * (1 + costs.markup);

        return costs;
    }
}

// ==================== EXPORT ====================

// Make classes available globally if in browser
if (typeof window !== 'undefined') {
    window.Wall = Wall;
    window.CabinetBoxBuilder = CabinetBoxBuilder;
    window.CabinetPlacementManager = CabinetPlacementManager;
    window.BOMGenerator = BOMGenerator;
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Wall,
        CabinetBoxBuilder,
        CabinetPlacementManager,
        BOMGenerator,
        MATERIAL_THICKNESS,
        CABINET_STANDARDS,
        HARDWARE_RULES,
        SHEET_SIZES
    };
}
