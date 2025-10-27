/**
 * Box Builder - Converts cabinet specifications into detailed panel and hardware lists
 * Ported from CBX_Shotgun V2.rb
 */

class BoxBuilder {
    constructor() {
        // Material thickness standards (mm)
        this.materialThickness = {
            carcass: 18,      // Standard cabinet box material
            back: 6,          // Back panel (thinner)
            shelf: 18,        // Shelves
            drawer: 18,       // Drawer boxes
            front: 18         // Door/drawer fronts
        };

        // Hardware standards
        this.hardwareRules = {
            hinges: {
                perDoor: 2,           // Standard 2 hinges per door
                tallDoorExtra: 3,     // 3 hinges if door > 1200mm
                tallThreshold: 1200   // mm
            },
            slides: {
                undermount: true,
                ratings: {
                    light: 20,    // kg
                    medium: 30,   // kg
                    heavy: 40     // kg
                }
            },
            connectors: {
                perCorner: 4,         // 4 screws per corner
                shelfSupports: 4      // 4 pins per shelf
            }
        };

        // Edge banding rules
        this.edgeBandingRules = {
            carcass: ['front', 'top', 'bottom'],  // Edges to band on carcass
            shelf: ['front'],                      // Only front edge on shelves
            back: []                               // No edging on back panel
        };
    }

    /**
     * Main method: Build complete box from cabinet specification
     */
    buildBox(cabinet) {
        const type = this.getCabinetType(cabinet.id);
        
        switch(type) {
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
     * Build Base Cabinet (sits on floor)
     */
    buildBaseBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || 720;  // Standard 720mm
        const d = cabinet.depth || 580;   // Standard 580mm
        const t = this.materialThickness.carcass;

        const panels = [];
        const hardware = [];
        const edgeBanding = [];

        // 1. SIDES (2x) - Full height x depth
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

        // Calculate edge banding for sides
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

        // 2. BOTTOM SHELF - Sits between sides
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

        // 3. TOP PANEL - Can be shelf or stretcher depending on type
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

        // 4. BACK PANEL - Thinner material
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

        // 5. TOE KICK (Base cabinets only)
        const toeKickHeight = 100; // Standard 100mm toe kick
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

        // 6. CALCULATE HARDWARE
        hardware.push(...this.calculateHardware(cabinet, panels));

        // 7. CALCULATE SCREWS & CONNECTORS
        const connectors = this.calculateConnectors(panels);
        hardware.push(...connectors);

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
     * Build Wall Cabinet (hangs on wall)
     */
    buildWallBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || 360;  // Standard 360mm or 720mm
        const d = cabinet.depth || 320;   // Shallower than base
        const t = this.materialThickness.carcass;

        const panels = [];
        const hardware = [];
        const edgeBanding = [];

        // Similar structure to base, but no toe kick
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
        hardware.push(...this.calculateConnectors(panels));

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
     * Build Tall Cabinet (floor to ceiling)
     */
    buildTallBox(cabinet) {
        const w = cabinet.width;
        const h = cabinet.height || 2100;  // Standard 2100mm
        const d = cabinet.depth || 580;
        const t = this.materialThickness.carcass;

        // Similar to base but taller, possibly with multiple shelves
        const box = this.buildBaseBox(cabinet);
        box.type = 'tall';
        
        // Add additional shelves for tall cabinets
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

        // Add shelf supports
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
     * Calculate hardware based on cabinet type and specifications
     */
    calculateHardware(cabinet, panels) {
        const hardware = [];
        const type = this.getCabinetType(cabinet.id);

        // HINGES - Based on door configuration
        if (cabinet.id.includes('door') || type === 'base' || type === 'wall') {
            const doorCount = cabinet.id.includes('2door') ? 2 : 1;
            const doorHeight = cabinet.height || (type === 'base' ? 720 : 360);
            
            let hingesPerDoor = this.hardwareRules.hinges.perDoor;
            if (doorHeight > this.hardwareRules.hinges.tallThreshold) {
                hingesPerDoor = this.hardwareRules.hinges.tallDoorExtra;
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

        // DRAWER SLIDES - Based on drawer configuration
        if (cabinet.id.includes('drawer')) {
            const drawerCount = parseInt(cabinet.id.match(/(\d+)drawer/)?.[1] || 1);
            const slideLength = Math.floor((cabinet.depth || 580) * 0.9); // 90% of depth

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
     * Calculate connectors (screws, confirmat, etc.)
     */
    calculateConnectors(panels) {
        const connectors = [];
        
        // Corner connectors (4 per corner)
        const cornerCount = 4; // Base box has 4 corners
        connectors.push({
            type: 'confirmat_screw',
            name: 'Confirmat Screw (5×50mm)',
            quantity: cornerCount * this.hardwareRules.connectors.perCorner * panels.length,
            unit: 'pieces',
            unitCost: 0.08
        });

        // Back panel screws (every 150mm around perimeter)
        const backPanel = panels.find(p => p.id === 'back');
        if (backPanel) {
            const perimeterMm = 2 * (backPanel.width + backPanel.height);
            const screwCount = Math.ceil(perimeterMm / 150);
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
     * Calculate number of handles needed
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
     * Helper: Get cabinet type from ID
     */
    getCabinetType(cabinetId) {
        if (cabinetId.startsWith('base-')) return 'base';
        if (cabinetId.startsWith('wall-')) return 'wall';
        if (cabinetId.startsWith('tall-')) return 'tall';
        return 'specialty';
    }

    /**
     * Build generic box (fallback)
     */
    buildGenericBox(cabinet) {
        return this.buildBaseBox(cabinet);
    }
}

// Make available globally
window.BoxBuilder = BoxBuilder;
