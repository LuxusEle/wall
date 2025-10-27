/**/**

 * BoxBuilder.js - Cabinet Carcass Construction * Box Builder - Converts cabinet specifications into detailed panel and hardware lists

 * Ported from CBX_Shotgun V2.rb - PRODUCTION ACCURATE * Ported from CBX_Shotgun V2.rb

 *  */

 * Builds complete cabinet carcasses with:

 * - Structural stretchers (front, back, bottom-back, top-back)class BoxBuilder {

 * - Grooved back panel system    constructor() {

 * - Gola handleless system (L and C-shaped cuts)        // Material thickness standards (mm)

 * - Proper drawer face calculations        this.materialThickness = {

 * - Complete hardware lists            carcass: 18,      // Standard cabinet box material

 */            back: 6,          // Back panel (thinner)

            shelf: 18,        // Shelves

class BoxBuilder {            drawer: 18,       // Drawer boxes

    constructor() {            front: 18         // Door/drawer fronts

        // === MATERIAL STANDARDS (exact Ruby values) ===        };

        this.MAT_THICKNESS = 18;        // Carcass panels

        this.BACK_THICKNESS = 6;        // Back panel (thin)        // Hardware standards

        this.DOOR_MAT_THICKNESS = 18;   // Door material        this.hardwareRules = {

        this.FACE_MAT_THICKNESS = 3;    // Drawer face overlay            hinges: {

        this.EDGE_BAND_THICKNESS = 2;   // Edge banding                perDoor: 2,           // Standard 2 hinges per door

        this.GROOVE_DEPTH = 10;         // Back panel groove depth                tallDoorExtra: 3,     // 3 hinges if door > 1200mm

        this.PLINTH = 100;              // Toe kick height                tallThreshold: 1200   // mm

        this.BOTTOM_Z_OFFSET = 100;     // Base cabinets sit 100mm above floor            },

                    slides: {

        // === STRETCHER DIMENSIONS ===                undermount: true,

        this.STRETCHER_HEIGHT = 100;    // Stretchers are 100mm tall (Z-axis)                ratings: {

        this.STRETCHER_DEPTH_FRONT = 100; // Front stretcher: 100mm deep (Y-axis)                    light: 20,    // kg

                            medium: 30,   // kg

        // === GAP STANDARDS ===                    heavy: 40     // kg

        this.DOOR_OUTER_GAP = 3;        // Outer gap for doors                }

        this.DOOR_INNER_GAP = 3;        // Gap between double doors            },

        this.DOOR_SIDE_CLEARANCE = 3;   // Side clearance            connectors: {

        this.HANDLED_TOP_GAP = 10;      // Top gap for handled doors (base)                perCorner: 4,         // 4 screws per corner

                        shelfSupports: 4      // 4 pins per shelf

        // === GOLA SYSTEM (Handleless) ===            }

        this.GOLA_L_HEIGHT = 59;        // L-shaped cut height (bottom edge)        };

        this.GOLA_L_DEPTH = 26;         // L-shaped cut depth into panel

        this.GOLA_C_HEIGHT = 73.5;      // C-shaped cut height (center, for drawers)        // Edge banding rules

        this.GOLA_C_DEPTH = 26;         // C-shaped cut depth into panel        this.edgeBandingRules = {

        this.GOLA_TOP_GAP = 30;         // Top gap for gola doors (vs 10mm handled)            carcass: ['front', 'top', 'bottom'],  // Edges to band on carcass

        this.GOLA_DOOR_OVERRIDE = 20;   // Cabinet recessed 20mm from door            shelf: ['front'],                      // Only front edge on shelves

        this.GOLA_DRAWER_VERT_GAP = 13; // Vertical gap between drawers            back: []                               // No edging on back panel

        this.GOLA_DRAWER_HORIZ_GAP = 3; // Horizontal gap (3-drawer top split)        };

            }

        // === HARDWARE RULES ===

        this.HINGE_RULES = {    /**

            default: 2,      // 2 hinges for doors < 1200mm     * Main method: Build complete box from cabinet specification

            tall: 3,         // 3 hinges for 1200-1800mm     */

            veryTall: 4,     // 4 hinges for > 1800mm    buildBox(cabinet) {

            threshold1: 1200,        const type = this.getCabinetType(cabinet.id);

            threshold2: 1800        

        };        switch(type) {

    }            case 'base':

                return this.buildBaseBox(cabinet);

    /**            case 'wall':

     * Main entry point - builds complete cabinet box                return this.buildWallBox(cabinet);

     */            case 'tall':

    buildBox(cabinet, options = {}) {                return this.buildTallBox(cabinet);

        const doorSystem = options.doorSystem || 'handled'; // 'handled' or 'gola'            default:

        const drawerCount = options.drawerCount || 0; // 0 = door, 2 or 3 = drawers                return this.buildGenericBox(cabinet);

        const shelfCount = options.shelfCount || 1;        }

        const openRack = options.openRack || false;    }

        

        // Determine cabinet type from ID    /**

        const type = this.getCabinetType(cabinet);     * Build Base Cabinet (sits on floor)

             */

        let box = null;    buildBaseBox(cabinet) {

                const w = cabinet.width;

        if (type === 'base' || type === 'drawer') {        const h = cabinet.height || 720;  // Standard 720mm

            box = this.buildBottomBox(cabinet, {        const d = cabinet.depth || 580;   // Standard 580mm

                doorSystem,        const t = this.materialThickness.carcass;

                drawerCount: drawerCount || (type === 'drawer' ? 3 : 0),

                shelfCount        const panels = [];

            });        const hardware = [];

        } else if (type === 'wall') {        const edgeBanding = [];

            box = this.buildTopBox(cabinet, {

                doorSystem,        // 1. SIDES (2x) - Full height x depth

                openRack,        panels.push({

                shelfCount: openRack ? 2 : 1 // Force 2 shelves for open rack            id: 'side_left',

            });            name: 'Left Side Panel',

        } else if (type === 'tall') {            width: d,

            box = this.buildTallBox(cabinet, {            height: h,

                doorSystem,            thickness: t,

                shelfCount: shelfCount || 3            quantity: 1,

            });            material: 'carcass',

        }            grainDirection: 'vertical',

                    edges: ['front', 'top', 'bottom']

        return box;        });

    }        panels.push({

            id: 'side_right',

    /**            name: 'Right Side Panel',

     * Determine cabinet type from ID or properties            width: d,

     */            height: h,

    getCabinetType(cabinet) {            thickness: t,

        const id = cabinet.id.toLowerCase();            quantity: 1,

        if (id.includes('base') || id.includes('drawer') || id.includes('sink')) {            material: 'carcass',

            return id.includes('drawer') ? 'drawer' : 'base';            grainDirection: 'vertical',

        }            edges: ['front', 'top', 'bottom']

        if (id.includes('wall')) return 'wall';        });

        if (id.includes('tall')) return 'tall';

        return 'base'; // Default        // Calculate edge banding for sides

    }        const sideEdgeLength = (d + h + h) / 1000; // Convert to meters

        edgeBanding.push({

    /**            panel: 'side_left',

     * BUILD BOTTOM BOX (Base Cabinets)            edges: ['front', 'top', 'bottom'],

     * Matches Ruby: create_bottom_cabinets            totalLength: sideEdgeLength,

     */            unit: 'meters'

    buildBottomBox(cabinet, options) {        });

        const w = cabinet.width;        edgeBanding.push({

        const h = cabinet.height || 720;            panel: 'side_right',

        const d = cabinet.depth || 580;            edges: ['front', 'top', 'bottom'],

        const t = this.MAT_THICKNESS;            totalLength: sideEdgeLength,

        const backT = this.BACK_THICKNESS;            unit: 'meters'

        const grooveD = this.GROOVE_DEPTH;        });

        const plinth = this.PLINTH;

        const doorSystem = options.doorSystem;        // 2. BOTTOM SHELF - Sits between sides

        const drawerCount = options.drawerCount || 0;        const bottomWidth = w - (2 * t);

        const shelfCount = options.shelfCount || 1;        panels.push({

                    id: 'bottom',

        const panels = [];            name: 'Bottom Shelf',

        const hardware = [];            width: bottomWidth,

        const gola_cuts = [];            height: d,

                    thickness: t,

        // === 1. BOTTOM PANEL (full width × full depth) ===            quantity: 1,

        panels.push({            material: 'carcass',

            id: 'bottom',            grainDirection: 'horizontal',

            name: 'Bottom Panel',            edges: ['front']

            width: w,        });

            depth: d,        edgeBanding.push({

            thickness: t,            panel: 'bottom',

            quantity: 1,            edges: ['front'],

            position: { x: 0, y: 0, z: 0 },            totalLength: bottomWidth / 1000,

            notes: 'Full base panel'            unit: 'meters'

        });        });

        

        // === 2. LEFT SIDE PANEL ===        // 3. TOP PANEL - Can be shelf or stretcher depending on type

        panels.push({        if (cabinet.id.includes('sink')) {

            id: 'left_side',            // Sink base: No top shelf, just stretchers

            name: 'Left Side Panel',            panels.push({

            width: d,                id: 'stretcher_front',

            height: h - plinth - t,                name: 'Front Stretcher',

            thickness: t,                width: bottomWidth,

            quantity: 1,                height: 100, // Standard 100mm stretcher

            position: { x: 0, y: 0, z: t },                thickness: t,

            notes: 'Left side, sits on bottom panel'                quantity: 1,

        });                material: 'carcass',

                        grainDirection: 'horizontal',

        // === 3. RIGHT SIDE PANEL ===                edges: ['top', 'bottom']

        panels.push({            });

            id: 'right_side',            panels.push({

            name: 'Right Side Panel',                id: 'stretcher_back',

            width: d,                name: 'Back Stretcher',

            height: h - plinth - t,                width: bottomWidth,

            thickness: t,                height: 100,

            quantity: 1,                thickness: t,

            position: { x: w - t, y: 0, z: t },                quantity: 1,

            notes: 'Right side, sits on bottom panel'                material: 'carcass',

        });                grainDirection: 'horizontal',

                        edges: ['top', 'bottom']

        // === 4. FRONT STRETCHER (100mm deep × 18mm tall, at TOP) ===            });

        const stretcherWidth = w - 2 * t;        } else {

        const stretcherZ = h - plinth;            // Standard: Full top shelf

        panels.push({            panels.push({

            id: 'front_stretcher',                id: 'top',

            name: 'Front Stretcher',                name: 'Top Shelf',

            width: stretcherWidth,                width: bottomWidth,

            depth: this.STRETCHER_DEPTH_FRONT,                height: d,

            thickness: t,                thickness: t,

            quantity: 1,                quantity: 1,

            position: { x: t, y: 26, z: stretcherZ },                material: 'carcass',

            notes: '100mm deep, at top front edge, 26mm from front'                grainDirection: 'horizontal',

        });                edges: ['front']

                    });

        // === 5. BACK STRETCHER (100mm deep × 18mm tall, at TOP) ===            edgeBanding.push({

        panels.push({                panel: 'top',

            id: 'back_stretcher',                edges: ['front'],

            name: 'Back Stretcher',                totalLength: bottomWidth / 1000,

            width: stretcherWidth,                unit: 'meters'

            depth: this.STRETCHER_DEPTH_FRONT,            });

            thickness: t,        }

            quantity: 1,

            position: { x: t, y: d - this.STRETCHER_DEPTH_FRONT, z: stretcherZ },        // 4. BACK PANEL - Thinner material

            notes: '100mm deep, at top back edge'        const backWidth = w - (2 * t);

        });        const backHeight = h - t; // Sits on bottom shelf

                panels.push({

        // === 6. BACK PANEL (grooved) ===            id: 'back',

        const backWidth = w - 2 * t + 2 * grooveD;            name: 'Back Panel',

        const backHeight = h - plinth - 2 * t + 2 * grooveD;            width: backWidth,

        const backX = t - grooveD;            height: backHeight,

        const backY = d - backT - t;            thickness: this.materialThickness.back,

        const backZ = t - grooveD;            quantity: 1,

        panels.push({            material: 'back',

            id: 'back_panel',            grainDirection: 'vertical',

            name: 'Back Panel (grooved)',            edges: [] // No edge banding on back

            width: backWidth,        });

            height: backHeight,

            thickness: backT,        // 5. TOE KICK (Base cabinets only)

            quantity: 1,        const toeKickHeight = 100; // Standard 100mm toe kick

            position: { x: backX, y: backY, z: backZ },        panels.push({

            notes: `Grooved: extends ${grooveD}mm into side panels`            id: 'toe_kick',

        });            name: 'Toe Kick',

                    width: w,

        // === 7. BOTTOM BACK STRETCHER (100mm tall × 18mm deep, at BOTTOM) ===            height: toeKickHeight,

        panels.push({            thickness: t,

            id: 'bottom_back_stretcher',            quantity: 1,

            name: 'Bottom Back Stretcher',            material: 'carcass',

            width: stretcherWidth,            grainDirection: 'horizontal',

            height: this.STRETCHER_HEIGHT,            edges: ['top']

            thickness: t,        });

            quantity: 1,        edgeBanding.push({

            position: { x: t, y: d, z: t },            panel: 'toe_kick',

            pushpull: 'forward',            edges: ['top'],

            notes: '100mm tall, at wall, pushpull forward by 18mm'            totalLength: w / 1000,

        });            unit: 'meters'

                });

        // === 8. TOP BACK STRETCHER (100mm tall × 18mm deep, at TOP) ===

        const topStretcherZ = h - plinth - t - this.STRETCHER_HEIGHT;        // 6. CALCULATE HARDWARE

        panels.push({        hardware.push(...this.calculateHardware(cabinet, panels));

            id: 'top_back_stretcher',

            name: 'Top Back Stretcher',        // 7. CALCULATE SCREWS & CONNECTORS

            width: stretcherWidth,        const connectors = this.calculateConnectors(panels);

            height: this.STRETCHER_HEIGHT,        hardware.push(...connectors);

            thickness: t,

            quantity: 1,        return {

            position: { x: t, y: d, z: topStretcherZ },            cabinetId: cabinet.id,

            pushpull: 'forward',            cabinetName: cabinet.name,

            notes: '100mm tall, under top panel, pushpull forward by 18mm'            type: 'base',

        });            dimensions: { width: w, height: h, depth: d },

                    panels: panels,

        // === 9. DOORS OR DRAWERS ===            hardware: hardware,

        const doorHeight = h - plinth;            edgeBanding: edgeBanding,

        const topGap = (doorSystem === 'gola') ? this.GOLA_TOP_GAP : this.HANDLED_TOP_GAP;            summary: this.generateSummary(panels, hardware, edgeBanding)

        const adjustedDoorHeight = doorHeight - topGap;        };

            }

        if (drawerCount === 0) {

            // DOOR CABINET    /**

            this.addDoors(panels, hardware, gola_cuts, w, doorHeight, doorSystem, options);     * Build Wall Cabinet (hangs on wall)

                 */

            // Add shelves    buildWallBox(cabinet) {

            if (shelfCount > 0) {        const w = cabinet.width;

                const internalHeight = h - plinth - t;        const h = cabinet.height || 360;  // Standard 360mm or 720mm

                const shelfDepth = d - backT - t;        const d = cabinet.depth || 320;   // Shallower than base

                for (let i = 1; i <= shelfCount; i++) {        const t = this.materialThickness.carcass;

                    const shelfZ = t + (internalHeight * i / (shelfCount + 1));

                    panels.push({        const panels = [];

                        id: `shelf_${i}`,        const hardware = [];

                        name: `Shelf ${i}`,        const edgeBanding = [];

                        width: stretcherWidth,

                        depth: shelfDepth,        // Similar structure to base, but no toe kick

                        thickness: t,        // Sides

                        quantity: 1,        panels.push({

                        position: { x: t, y: 0, z: shelfZ },            id: 'side_left',

                        notes: 'Adjustable shelf'            name: 'Left Side Panel',

                    });            width: d,

                }            height: h,

            }            thickness: t,

        } else {            quantity: 1,

            // DRAWER CABINET (2 or 3 drawers)            material: 'carcass',

            this.addDrawers(panels, hardware, gola_cuts, w, doorHeight, drawerCount, doorSystem, options);            grainDirection: 'vertical',

        }            edges: ['front', 'top', 'bottom']

                });

        // === CALCULATE HARDWARE ===        panels.push({

        const hinges = this.calculateHinges(panels, doorSystem);            id: 'side_right',

        const slides = this.calculateSlides(drawerCount);            name: 'Right Side Panel',

        const screws = this.calculateScrews(panels);            width: d,

        const edgeBanding = this.calculateEdgeBanding(panels);            height: h,

                    thickness: t,

        return {            quantity: 1,

            cabinet: {            material: 'carcass',

                id: cabinet.id,            grainDirection: 'vertical',

                name: cabinet.name,            edges: ['front', 'top', 'bottom']

                width: w,        });

                height: h,

                depth: d,        const sideEdgeLength = (d + h + h) / 1000;

                type: 'base'        edgeBanding.push({

            },            panel: 'side_left',

            panels,            edges: ['front', 'top', 'bottom'],

            hardware: {            totalLength: sideEdgeLength,

                hinges,            unit: 'meters'

                slides,        });

                screws,        edgeBanding.push({

                edgeBanding            panel: 'side_right',

            },            edges: ['front', 'top', 'bottom'],

            gola_cuts,            totalLength: sideEdgeLength,

            options: {            unit: 'meters'

                doorSystem,        });

                drawerCount,

                shelfCount        // Top and Bottom shelves

            }        const shelfWidth = w - (2 * t);

        };        panels.push({

    }            id: 'top',

            name: 'Top Shelf',

    /**            width: shelfWidth,

     * ADD DOORS (single or double)            height: d,

     */            thickness: t,

    addDoors(panels, hardware, gola_cuts, cabWidth, doorHeight, doorSystem, options) {            quantity: 1,

        const topGap = (doorSystem === 'gola') ? this.GOLA_TOP_GAP : this.HANDLED_TOP_GAP;            material: 'carcass',

        const adjustedHeight = doorHeight - topGap;            grainDirection: 'horizontal',

        const edgeBand = this.EDGE_BAND_THICKNESS;            edges: ['front']

        const sideClear = this.DOOR_SIDE_CLEARANCE;        });

        const t = this.FACE_MAT_THICKNESS;        panels.push({

                    id: 'bottom',

        // Add Gola L-cuts if gola system            name: 'Bottom Shelf',

        if (doorSystem === 'gola') {            width: shelfWidth,

            const lBottom = doorHeight - this.GOLA_L_HEIGHT;            height: d,

            const lTop = doorHeight;            thickness: t,

            gola_cuts.push({            quantity: 1,

                type: 'L_gola',            material: 'carcass',

                side: 'left',            grainDirection: 'horizontal',

                position: { x: 0, y: 0, z: lBottom },            edges: ['front']

                width: this.MAT_THICKNESS,        });

                depth: this.GOLA_L_DEPTH,

                height: this.GOLA_L_HEIGHT,        edgeBanding.push({

                notes: 'L-shaped finger pull at bottom left'            panel: 'top',

            });            edges: ['front'],

            gola_cuts.push({            totalLength: shelfWidth / 1000,

                type: 'L_gola',            unit: 'meters'

                side: 'right',        });

                position: { x: cabWidth - this.MAT_THICKNESS, y: 0, z: lBottom },        edgeBanding.push({

                width: this.MAT_THICKNESS,            panel: 'bottom',

                depth: this.GOLA_L_DEPTH,            edges: ['front'],

                height: this.GOLA_L_HEIGHT,            totalLength: shelfWidth / 1000,

                notes: 'L-shaped finger pull at bottom right'            unit: 'meters'

            });        });

        }

                // Back panel

        if (cabWidth < 600) {        const backWidth = w - (2 * t);

            // SINGLE DOOR        const backHeight = h - (2 * t);

            const doorWidth = cabWidth - 2 * sideClear;        panels.push({

            panels.push({            id: 'back',

                id: 'door_single',            name: 'Back Panel',

                name: 'Single Door',            width: backWidth,

                width: doorWidth,            height: backHeight,

                height: adjustedHeight - 2 * edgeBand,            thickness: this.materialThickness.back,

                thickness: t,            quantity: 1,

                quantity: 1,            material: 'back',

                position: { x: sideClear, y: 0, z: edgeBand },            grainDirection: 'vertical',

                notes: 'Single door, full width'            edges: []

            });        });

        } else {

            // DOUBLE DOORS        // Hardware

            const availWidth = cabWidth - 2 * sideClear;        hardware.push(...this.calculateHardware(cabinet, panels));

            const totalDoorWidth = availWidth - this.DOOR_INNER_GAP;        hardware.push(...this.calculateConnectors(panels));

            const halfDoor = totalDoorWidth / 2;

                    return {

            panels.push({            cabinetId: cabinet.id,

                id: 'door_left',            cabinetName: cabinet.name,

                name: 'Left Door',            type: 'wall',

                width: halfDoor,            dimensions: { width: w, height: h, depth: d },

                height: adjustedHeight - 2 * edgeBand,            panels: panels,

                thickness: t,            hardware: hardware,

                quantity: 1,            edgeBanding: edgeBanding,

                position: { x: sideClear, y: 0, z: edgeBand },            summary: this.generateSummary(panels, hardware, edgeBanding)

                notes: 'Left door of pair'        };

            });    }

            

            panels.push({    /**

                id: 'door_right',     * Build Tall Cabinet (floor to ceiling)

                name: 'Right Door',     */

                width: halfDoor,    buildTallBox(cabinet) {

                height: adjustedHeight - 2 * edgeBand,        const w = cabinet.width;

                thickness: t,        const h = cabinet.height || 2100;  // Standard 2100mm

                quantity: 1,        const d = cabinet.depth || 580;

                position: { x: sideClear + halfDoor + this.DOOR_INNER_GAP, y: 0, z: edgeBand },        const t = this.materialThickness.carcass;

                notes: 'Right door of pair'

            });        // Similar to base but taller, possibly with multiple shelves

        }        const box = this.buildBaseBox(cabinet);

    }        box.type = 'tall';

        

    /**        // Add additional shelves for tall cabinets

     * ADD DRAWERS (2 or 3 drawer configuration)        const shelfWidth = w - (2 * t);

     */        const shelfCount = Math.floor(h / 400); // One shelf every ~400mm

    addDrawers(panels, hardware, gola_cuts, cabWidth, doorHeight, drawerCount, doorSystem, options) {        

        const topGap = (doorSystem === 'gola') ? this.GOLA_TOP_GAP : this.HANDLED_TOP_GAP;        for (let i = 1; i < shelfCount; i++) {

        const edgeBand = this.EDGE_BAND_THICKNESS;            box.panels.push({

        const sideClear = this.DOOR_SIDE_CLEARANCE;                id: `shelf_${i}`,

        const t = this.FACE_MAT_THICKNESS;                name: `Adjustable Shelf ${i}`,

                        width: shelfWidth,

        const midZ = (doorHeight + edgeBand) / 2.0;                height: d,

                        thickness: t,

        const drawerVertGap = (doorSystem === 'gola') ?                 quantity: 1,

            this.GOLA_DRAWER_VERT_GAP : (this.DOOR_INNER_GAP / 2.0);                material: 'carcass',

        const drawerHorizGap = (doorSystem === 'gola') ?                 grainDirection: 'horizontal',

            this.GOLA_DRAWER_HORIZ_GAP : this.DOOR_INNER_GAP;                edges: ['front']

                    });

        // Add Gola cuts if gola system            box.edgeBanding.push({

        if (doorSystem === 'gola') {                panel: `shelf_${i}`,

            // L-cuts at bottom                edges: ['front'],

            const lBottom = doorHeight - this.GOLA_L_HEIGHT;                totalLength: shelfWidth / 1000,

            gola_cuts.push({                unit: 'meters'

                type: 'L_gola',            });

                side: 'left',        }

                position: { x: 0, y: 0, z: lBottom },

                width: this.MAT_THICKNESS,        // Add shelf supports

                depth: this.GOLA_L_DEPTH,        box.hardware.push({

                height: this.GOLA_L_HEIGHT,            type: 'shelf_support',

                notes: 'L-shaped finger pull at bottom left'            name: 'Shelf Support Pins',

            });            quantity: shelfCount * 4, // 4 pins per shelf

            gola_cuts.push({            unit: 'pieces',

                type: 'L_gola',            unitCost: 0.25

                side: 'right',        });

                position: { x: cabWidth - this.MAT_THICKNESS, y: 0, z: lBottom },

                width: this.MAT_THICKNESS,        return box;

                depth: this.GOLA_L_DEPTH,    }

                height: this.GOLA_L_HEIGHT,

                notes: 'L-shaped finger pull at bottom right'    /**

            });     * Calculate hardware based on cabinet type and specifications

                 */

            // C-cuts at center (for drawer separation)    calculateHardware(cabinet, panels) {

            const cHalf = this.GOLA_C_HEIGHT / 2.0;        const hardware = [];

            const cBottom = midZ - cHalf;        const type = this.getCabinetType(cabinet.id);

            const cTop = midZ + cHalf;

            gola_cuts.push({        // HINGES - Based on door configuration

                type: 'C_gola',        if (cabinet.id.includes('door') || type === 'base' || type === 'wall') {

                side: 'left',            const doorCount = cabinet.id.includes('2door') ? 2 : 1;

                position: { x: 0, y: 0, z: cBottom },            const doorHeight = cabinet.height || (type === 'base' ? 720 : 360);

                width: this.MAT_THICKNESS,            

                depth: this.GOLA_C_DEPTH,            let hingesPerDoor = this.hardwareRules.hinges.perDoor;

                height: this.GOLA_C_HEIGHT,            if (doorHeight > this.hardwareRules.hinges.tallThreshold) {

                notes: 'C-shaped center cut on left'                hingesPerDoor = this.hardwareRules.hinges.tallDoorExtra;

            });            }

            gola_cuts.push({

                type: 'C_gola',            hardware.push({

                side: 'right',                type: 'hinge',

                position: { x: cabWidth - this.MAT_THICKNESS, y: 0, z: cBottom },                name: 'Cabinet Hinge (Soft-Close)',

                width: this.MAT_THICKNESS,                quantity: doorCount * hingesPerDoor,

                depth: this.GOLA_C_DEPTH,                unit: 'pieces',

                height: this.GOLA_C_HEIGHT,                unitCost: 2.50,

                notes: 'C-shaped center cut on right'                notes: `${hingesPerDoor} per door × ${doorCount} doors`

            });            });

        }        }

        

        if (drawerCount === 2) {        // DRAWER SLIDES - Based on drawer configuration

            // TWO DRAWER SYSTEM        if (cabinet.id.includes('drawer')) {

            // Bottom drawer: from edgeBand to (midZ - gap)            const drawerCount = parseInt(cabinet.id.match(/(\d+)drawer/)?.[1] || 1);

            const bottomHeight = (midZ - drawerVertGap) - edgeBand;            const slideLength = Math.floor((cabinet.depth || 580) * 0.9); // 90% of depth

            panels.push({

                id: 'drawer_bottom',            hardware.push({

                name: 'Bottom Drawer Face',                type: 'drawer_slide',

                width: cabWidth - 2 * sideClear,                name: `Undermount Drawer Slide (${slideLength}mm)`,

                height: bottomHeight,                quantity: drawerCount * 2, // 2 slides per drawer

                thickness: t,                unit: 'pairs',

                quantity: 1,                unitCost: 8.00,

                position: { x: sideClear, y: 0, z: edgeBand },                notes: `${drawerCount} drawers × 2 slides`

                notes: 'Bottom drawer face (2-drawer system)'            });

            });        }

            

            // Top drawer: from (midZ + gap) to (doorHeight - topGap)        // HANDLES/KNOBS

            const topFaceZ = midZ + drawerVertGap;        const handleCount = this.calculateHandleCount(cabinet);

            const topHeight = (doorHeight - topGap) - topFaceZ;        if (handleCount > 0) {

            panels.push({            hardware.push({

                id: 'drawer_top',                type: 'handle',

                name: 'Top Drawer Face',                name: 'Cabinet Handle',

                width: cabWidth - 2 * sideClear,                quantity: handleCount,

                height: topHeight,                unit: 'pieces',

                thickness: t,                unitCost: 3.50

                quantity: 1,            });

                position: { x: sideClear, y: 0, z: topFaceZ },        }

                notes: 'Top drawer face (2-drawer system)'

            });        return hardware;

        } else if (drawerCount === 3) {    }

            // THREE DRAWER SYSTEM

            // Bottom drawer (same as 2-drawer)    /**

            const bottomHeight = (midZ - drawerVertGap) - edgeBand;     * Calculate connectors (screws, confirmat, etc.)

            panels.push({     */

                id: 'drawer_bottom',    calculateConnectors(panels) {

                name: 'Bottom Drawer Face',        const connectors = [];

                width: cabWidth - 2 * sideClear,        

                height: bottomHeight,        // Corner connectors (4 per corner)

                thickness: t,        const cornerCount = 4; // Base box has 4 corners

                quantity: 1,        connectors.push({

                position: { x: sideClear, y: 0, z: edgeBand },            type: 'confirmat_screw',

                notes: 'Bottom drawer face (3-drawer system)'            name: 'Confirmat Screw (5×50mm)',

            });            quantity: cornerCount * this.hardwareRules.connectors.perCorner * panels.length,

                        unit: 'pieces',

            // Top region split into 2 equal drawers            unitCost: 0.08

            const topFaceZ = midZ + drawerVertGap;        });

            const topRegionHeight = (doorHeight - topGap) - topFaceZ;

            const halfHeight = (topRegionHeight - drawerHorizGap) / 2.0;        // Back panel screws (every 150mm around perimeter)

                    const backPanel = panels.find(p => p.id === 'back');

            panels.push({        if (backPanel) {

                id: 'drawer_middle',            const perimeterMm = 2 * (backPanel.width + backPanel.height);

                name: 'Middle Drawer Face',            const screwCount = Math.ceil(perimeterMm / 150);

                width: cabWidth - 2 * sideClear,            connectors.push({

                height: halfHeight,                type: 'back_screw',

                thickness: t,                name: 'Back Panel Screw (3×15mm)',

                quantity: 1,                quantity: screwCount,

                position: { x: sideClear, y: 0, z: topFaceZ },                unit: 'pieces',

                notes: 'Middle drawer face (3-drawer system)'                unitCost: 0.02

            });            });

                    }

            const topDrawerZ = topFaceZ + halfHeight + drawerHorizGap;

            panels.push({        return connectors;

                id: 'drawer_top',    }

                name: 'Top Drawer Face',

                width: cabWidth - 2 * sideClear,    /**

                height: halfHeight,     * Calculate number of handles needed

                thickness: t,     */

                quantity: 1,    calculateHandleCount(cabinet) {

                position: { x: sideClear, y: 0, z: topDrawerZ },        let count = 0;

                notes: 'Top drawer face (3-drawer system)'        

            });        // Doors

        }        if (cabinet.id.includes('1door')) count += 1;

    }        if (cabinet.id.includes('2door')) count += 2;

        

    /**        // Drawers

     * BUILD TOP BOX (Wall Cabinets)        const drawerMatch = cabinet.id.match(/(\d+)drawer/);

     * Matches Ruby: create_top_cabinet_at_offset        if (drawerMatch) {

     */            count += parseInt(drawerMatch[1]);

    buildTopBox(cabinet, options) {        }

        const w = cabinet.width;        

        const h = cabinet.height || 720;        return count;

        const d = cabinet.depth || 320;    }

        const t = this.MAT_THICKNESS;

        const backT = this.BACK_THICKNESS;    /**

        const grooveD = this.GROOVE_DEPTH;     * Generate summary statistics

        const doorSystem = options.doorSystem;     */

        const openRack = options.openRack || false;    generateSummary(panels, hardware, edgeBanding) {

        const shelfCount = openRack ? 2 : 1; // Force 2 shelves for open rack        const totalPanelArea = panels.reduce((sum, panel) => {

                    return sum + ((panel.width * panel.height) / 1000000) * panel.quantity;

        const panels = [];        }, 0);

        const hardware = [];

        const gola_cuts = [];        const totalEdgeBanding = edgeBanding.reduce((sum, edge) => {

                    return sum + edge.totalLength;

        const carcassOffset = (doorSystem === 'gola' && !openRack) ? this.GOLA_DOOR_OVERRIDE : 0;        }, 0);

        const effectiveHeight = openRack ? h : (h - carcassOffset);

        const finalDepth = openRack ? (d + 22) : d;        const hardwareCost = hardware.reduce((sum, item) => {

                    return sum + (item.quantity * item.unitCost);

        // === 1. LEFT SIDE PANEL ===        }, 0);

        panels.push({

            id: 'left_side',        return {

            name: 'Left Side Panel',            panelCount: panels.length,

            width: finalDepth,            totalPanelArea: totalPanelArea.toFixed(2) + ' m²',

            height: effectiveHeight,            totalEdgeBanding: totalEdgeBanding.toFixed(2) + ' m',

            thickness: t,            hardwareItems: hardware.length,

            quantity: 1,            hardwareCost: '$' + hardwareCost.toFixed(2)

            position: { x: 0, y: 0, z: carcassOffset },        };

            notes: openRack ? 'Open rack - full thickness' : 'Standard wall cabinet'    }

        });

            /**

        // === 2. RIGHT SIDE PANEL ===     * Helper: Get cabinet type from ID

        panels.push({     */

            id: 'right_side',    getCabinetType(cabinetId) {

            name: 'Right Side Panel',        if (cabinetId.startsWith('base-')) return 'base';

            width: finalDepth,        if (cabinetId.startsWith('wall-')) return 'wall';

            height: effectiveHeight,        if (cabinetId.startsWith('tall-')) return 'tall';

            thickness: t,        return 'specialty';

            quantity: 1,    }

            position: { x: w - t, y: 0, z: carcassOffset },

            notes: openRack ? 'Open rack - full thickness' : 'Standard wall cabinet'    /**

        });     * Build generic box (fallback)

             */

        // === 3. TOP PANEL ===    buildGenericBox(cabinet) {

        panels.push({        return this.buildBaseBox(cabinet);

            id: 'top',    }

            name: 'Top Panel',}

            width: w - 2 * t,

            depth: finalDepth,// Make available globally

            thickness: t,window.BoxBuilder = BoxBuilder;

            quantity: 1,
            position: { x: t, y: 0, z: carcassOffset + effectiveHeight - t },
            notes: 'Top panel sits between sides'
        });
        
        // === 4. BOTTOM PANEL ===
        panels.push({
            id: 'bottom',
            name: 'Bottom Panel',
            width: w - 2 * t,
            depth: finalDepth,
            thickness: t,
            quantity: 1,
            position: { x: t, y: 0, z: carcassOffset + t },
            notes: 'Bottom panel sits between sides'
        });
        
        // === 5. BACK PANEL ===
        if (openRack) {
            // Open rack: back is flush with full thickness
            panels.push({
                id: 'back_panel',
                name: 'Back Panel (open rack)',
                width: w - 2 * t,
                height: effectiveHeight - 2 * t,
                thickness: t,
                quantity: 1,
                position: { x: t, y: finalDepth - t, z: carcassOffset + t },
                notes: 'Open rack back - flush mounted, full thickness'
            });
        } else {
            // Standard grooved back
            const backWidth = w - 2 * t + 2 * grooveD;
            const backHeight = effectiveHeight - 2 * t + 2 * grooveD;
            const backX = t - grooveD;
            const backZ = t - grooveD + carcassOffset;
            const backY = finalDepth - (t + backT);
            panels.push({
                id: 'back_panel',
                name: 'Back Panel (grooved)',
                width: backWidth,
                height: backHeight,
                thickness: backT,
                quantity: 1,
                position: { x: backX, y: backY, z: backZ },
                notes: `Grooved: extends ${grooveD}mm into panels`
            });
            
            // Add back stretchers for regular cabinets
            const stretcherWidth = w - 2 * t;
            
            // Bottom back stretcher
            panels.push({
                id: 'bottom_back_stretcher',
                name: 'Bottom Back Stretcher',
                width: stretcherWidth,
                height: this.STRETCHER_HEIGHT,
                thickness: t,
                quantity: 1,
                position: { x: t, y: finalDepth, z: carcassOffset + t },
                pushpull: 'forward',
                notes: '100mm tall, at wall, pushpull forward'
            });
            
            // Top back stretcher
            const topStretcherZ = carcassOffset + effectiveHeight - t - this.STRETCHER_HEIGHT;
            panels.push({
                id: 'top_back_stretcher',
                name: 'Top Back Stretcher',
                width: stretcherWidth,
                height: this.STRETCHER_HEIGHT,
                thickness: t,
                quantity: 1,
                position: { x: t, y: finalDepth, z: topStretcherZ },
                pushpull: 'forward',
                notes: '100mm tall, under top panel, pushpull forward'
            });
        }
        
        // === 6. SHELVES ===
        if (openRack && shelfCount > 0) {
            // Open rack shelves
            const availHeight = effectiveHeight - 2 * t;
            const step = availHeight / (shelfCount + 1);
            const shelfDepth = finalDepth - 2 * t;
            for (let i = 1; i <= shelfCount; i++) {
                const shelfZ = carcassOffset + t + (step * i);
                panels.push({
                    id: `shelf_${i}`,
                    name: `Open Rack Shelf ${i}`,
                    width: w - 2 * t,
                    depth: shelfDepth,
                    thickness: t,
                    quantity: 1,
                    position: { x: t, y: 0, z: shelfZ },
                    notes: `Open rack shelf ${i} of ${shelfCount}`
                });
            }
        } else if (!openRack) {
            // Standard mid-shelf
            const midZ = carcassOffset + t + ((effectiveHeight - 2 * t) / 2.0);
            const shelfDepth = finalDepth - backT - t;
            panels.push({
                id: 'shelf_mid',
                name: 'Mid Shelf',
                width: w - 2 * t,
                depth: shelfDepth,
                thickness: t,
                quantity: 1,
                position: { x: t, y: 0, z: midZ },
                notes: 'Fixed mid-shelf'
            });
        }
        
        // === 7. DOORS (if not open rack) ===
        if (!openRack) {
            const doorTop = h;
            if (w < 600) {
                // Single door
                const doorWidth = w - 2 * this.DOOR_OUTER_GAP;
                panels.push({
                    id: 'door_single',
                    name: 'Single Door',
                    width: doorWidth,
                    height: doorTop,
                    thickness: this.DOOR_MAT_THICKNESS,
                    quantity: 1,
                    position: { x: this.DOOR_OUTER_GAP, y: 0, z: 0 },
                    notes: 'Single door, full height'
                });
            } else {
                // Double doors
                const doorOpening = w - 2 * this.DOOR_OUTER_GAP - this.DOOR_INNER_GAP;
                const halfDoor = doorOpening / 2.0;
                
                panels.push({
                    id: 'door_left',
                    name: 'Left Door',
                    width: halfDoor,
                    height: doorTop,
                    thickness: this.DOOR_MAT_THICKNESS,
                    quantity: 1,
                    position: { x: this.DOOR_OUTER_GAP, y: 0, z: 0 },
                    notes: 'Left door of pair'
                });
                
                panels.push({
                    id: 'door_right',
                    name: 'Right Door',
                    width: halfDoor,
                    height: doorTop,
                    thickness: this.DOOR_MAT_THICKNESS,
                    quantity: 1,
                    position: { x: this.DOOR_OUTER_GAP + halfDoor + this.DOOR_INNER_GAP, y: 0, z: 0 },
                    notes: 'Right door of pair'
                });
            }
        }
        
        // === CALCULATE HARDWARE ===
        const hinges = this.calculateHinges(panels, doorSystem);
        const slides = { quantity: 0, type: 'none' };
        const screws = this.calculateScrews(panels);
        const edgeBanding = this.calculateEdgeBanding(panels);
        
        return {
            cabinet: {
                id: cabinet.id,
                name: cabinet.name,
                width: w,
                height: h,
                depth: d,
                type: 'wall'
            },
            panels,
            hardware: {
                hinges,
                slides,
                screws,
                edgeBanding
            },
            gola_cuts,
            options: {
                doorSystem,
                openRack,
                shelfCount
            }
        };
    }

    /**
     * BUILD TALL BOX (Pantry/Utility Cabinets)
     */
    buildTallBox(cabinet, options) {
        // Tall cabinets are similar to base cabinets but taller and no plinth offset
        const modifiedCabinet = { ...cabinet, height: cabinet.height || 2000 };
        const box = this.buildBottomBox(modifiedCabinet, options);
        box.cabinet.type = 'tall';
        return box;
    }

    /**
     * CALCULATE HINGES
     */
    calculateHinges(panels, doorSystem) {
        const doors = panels.filter(p => p.id.includes('door'));
        if (doors.length === 0) return { quantity: 0, type: 'none' };
        
        let totalHinges = 0;
        doors.forEach(door => {
            const h = door.height;
            if (h < this.HINGE_RULES.threshold1) {
                totalHinges += this.HINGE_RULES.default;
            } else if (h < this.HINGE_RULES.threshold2) {
                totalHinges += this.HINGE_RULES.tall;
            } else {
                totalHinges += this.HINGE_RULES.veryTall;
            }
        });
        
        return {
            quantity: totalHinges,
            type: '110° Soft-Close Hinge',
            notes: `${this.HINGE_RULES.default} per door < ${this.HINGE_RULES.threshold1}mm, ${this.HINGE_RULES.tall} per door < ${this.HINGE_RULES.threshold2}mm`
        };
    }

    /**
     * CALCULATE SLIDES (for drawers)
     */
    calculateSlides(drawerCount) {
        if (drawerCount === 0) return { quantity: 0, type: 'none' };
        
        return {
            quantity: drawerCount,
            type: 'Full Extension Undermount Soft-Close',
            notes: 'One pair per drawer'
        };
    }

    /**
     * CALCULATE SCREWS (Confirmat/connector screws)
     */
    calculateScrews(panels) {
        // Rough calculation: 4 screws per major panel connection
        const majorPanels = panels.filter(p => 
            p.id.includes('side') || p.id.includes('bottom') || p.id.includes('top')
        );
        const screwCount = majorPanels.length * 4;
        
        return {
            quantity: screwCount,
            type: 'Confirmat 5x70mm',
            notes: '4 screws per panel connection'
        };
    }

    /**
     * CALCULATE EDGE BANDING (linear meters)
     */
    calculateEdgeBanding(panels) {
        let totalLength = 0;
        
        panels.forEach(panel => {
            if (panel.id.includes('back')) return; // No banding on back
            if (panel.id.includes('stretcher')) return; // No banding on stretchers
            
            // Front edges need banding
            if (panel.width) totalLength += panel.width;
            if (panel.height && !panel.id.includes('shelf')) totalLength += panel.height * 2; // Both sides
        });
        
        return {
            length: Math.ceil(totalLength / 1000 * 10) / 10, // Convert to meters, round up
            type: '22mm PVC Edge Band',
            notes: 'All visible edges'
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BoxBuilder = BoxBuilder;
}
