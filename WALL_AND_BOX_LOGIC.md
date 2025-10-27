# Kitchen Cabinet Calculator - Complete Logic Documentation

## 📐 Overview
This document explains the complete wall layout and box construction logic for the Kitchen Cabinet Cost Calculator system.

---

## 1️⃣ WALL CONFIGURATION LOGIC

### Concept
A wall is a vertical surface where cabinets are placed. It has:
- **Dimensions**: Length (width) × Height
- **Openings**: Doors and Windows that create "no-cabinet zones"
- **Available Segments**: Spaces where cabinets can be placed

### Data Structure
```javascript
Wall = {
    label: 'A',              // Wall identifier (A, B, C, D)
    length: 3000,            // Wall length in mm
    height: 2400,            // Wall height in mm
    doors: [                 // Array of door openings
        {
            width: 900,      // Door width
            height: 2100,    // Door height
            distanceFromLeft: 500  // Position from left edge
        }
    ],
    windows: [               // Array of window openings
        {
            width: 1200,     // Window width
            height: 1000,    // Window height
            distanceFromLeft: 1500,    // Horizontal position
            distanceFromFloor: 1000    // Vertical position
        }
    ]
}
```

### Pseudo Code: Wall Validation
```
FUNCTION validateWall(wall):
    // Check minimum dimensions
    IF wall.length < 500mm OR wall.height < 500mm:
        RETURN error "Wall too small"
    
    // Check each door
    FOR EACH door IN wall.doors:
        // Door must fit within wall
        IF door.distanceFromLeft + door.width > wall.length:
            RETURN error "Door extends beyond wall"
        
        IF door.height > wall.height:
            RETURN error "Door taller than wall"
        
        // Check door doesn't overlap with other doors
        FOR EACH otherDoor IN wall.doors:
            IF doorsOverlap(door, otherDoor):
                RETURN error "Doors overlap"
    
    // Check each window
    FOR EACH window IN wall.windows:
        IF window.distanceFromLeft + window.width > wall.length:
            RETURN error "Window extends beyond wall"
        
        IF window.distanceFromFloor + window.height > wall.height:
            RETURN error "Window too tall"
    
    RETURN valid
```

### Pseudo Code: Calculate Available Segments
```
FUNCTION calculateAvailableSegments(wall):
    // Start with entire wall as one segment
    segments = [{start: 0, end: wall.length, type: 'available'}]
    
    // Mark door zones as unavailable
    FOR EACH door IN wall.doors:
        doorStart = door.distanceFromLeft
        doorEnd = doorStart + door.width
        
        segments = splitSegmentsByOpening(segments, doorStart, doorEnd, 'door')
    
    // Mark window zones (base cabinets can't go under windows)
    FOR EACH window IN wall.windows:
        windowStart = window.distanceFromLeft
        windowEnd = windowStart + window.width
        
        IF window.distanceFromFloor < BASE_CABINET_HEIGHT:
            segments = splitSegmentsByOpening(segments, windowStart, windowEnd, 'window')
    
    RETURN segments.filter(s => s.type == 'available')

FUNCTION splitSegmentsByOpening(segments, openingStart, openingEnd, type):
    newSegments = []
    
    FOR EACH segment IN segments:
        IF segment.type != 'available':
            newSegments.add(segment)
            CONTINUE
        
        // Opening is completely outside this segment
        IF openingEnd <= segment.start OR openingStart >= segment.end:
            newSegments.add(segment)
            CONTINUE
        
        // Opening splits the segment
        IF openingStart > segment.start:
            // Add segment before opening
            newSegments.add({
                start: segment.start,
                end: openingStart,
                type: 'available'
            })
        
        // Add the blocked segment
        newSegments.add({
            start: max(segment.start, openingStart),
            end: min(segment.end, openingEnd),
            type: type
        })
        
        IF openingEnd < segment.end:
            // Add segment after opening
            newSegments.add({
                start: openingEnd,
                end: segment.end,
                type: 'available'
            })
    
    RETURN newSegments
```

### Example Scenario
```
Wall: 5000mm length
Door: 900mm width at 1000mm from left
Window: 1200mm width at 3000mm from left

Available segments:
1. [0mm - 1000mm]         = 1000mm (before door)
2. [1900mm - 3000mm]      = 1100mm (between door and window)
3. [4200mm - 5000mm]      = 800mm  (after window)
```

---

## 2️⃣ CABINET BOX CONSTRUCTION LOGIC

### Concept
A cabinet box is built from:
- **Panels**: Sides, shelves, back, toe kick
- **Hardware**: Hinges, drawer slides, handles, screws
- **Edge Banding**: Exposed edges need finishing

### Cabinet Types
1. **Base Cabinet**: Sits on floor, 720mm height, 580mm depth
2. **Wall Cabinet**: Hangs on wall, 360-720mm height, 320mm depth
3. **Tall Cabinet**: Floor to ceiling, 2100mm height, 580mm depth

### Material Standards
```
Carcass Panel Thickness: 18mm
Back Panel Thickness: 6mm
Toe Kick Height: 100mm
Standard Hinge Count: 2 per door (3 if door > 1200mm)
```

### Pseudo Code: Build Base Cabinet Box
```
FUNCTION buildBaseBox(width, height, depth):
    thickness = 18mm
    backThickness = 6mm
    panels = []
    hardware = []
    edgeBanding = []
    
    // === SIDES (2 panels) ===
    panels.add({
        name: "Left Side",
        width: depth,
        height: height,
        thickness: thickness,
        quantity: 1,
        grainDirection: "vertical",
        edgesToBand: ["front", "top", "bottom"]
    })
    panels.add({
        name: "Right Side",
        width: depth,
        height: height,
        thickness: thickness,
        quantity: 1,
        grainDirection: "vertical",
        edgesToBand: ["front", "top", "bottom"]
    })
    
    // Edge banding calculation
    sideEdgeLength = (depth + height + height) / 1000  // Convert to meters
    edgeBanding.add({
        panel: "Left Side",
        length: sideEdgeLength,
        edges: 3
    })
    edgeBanding.add({
        panel: "Right Side",
        length: sideEdgeLength,
        edges: 3
    })
    
    // === BOTTOM SHELF ===
    // Shelf sits BETWEEN the sides, so reduce width by 2×thickness
    bottomWidth = width - (2 × thickness)
    panels.add({
        name: "Bottom Shelf",
        width: bottomWidth,
        height: depth,
        thickness: thickness,
        quantity: 1,
        grainDirection: "horizontal",
        edgesToBand: ["front"]  // Only front edge visible
    })
    edgeBanding.add({
        panel: "Bottom Shelf",
        length: bottomWidth / 1000,
        edges: 1
    })
    
    // === TOP SHELF or STRETCHERS ===
    IF cabinetType == "sink_base":
        // Sink bases have no top shelf, just front/back stretchers
        stretcherWidth = bottomWidth
        stretcherHeight = 100mm  // Standard stretcher height
        
        panels.add({
            name: "Front Stretcher",
            width: stretcherWidth,
            height: stretcherHeight,
            thickness: thickness,
            edgesToBand: ["top", "bottom"]
        })
        panels.add({
            name: "Back Stretcher",
            width: stretcherWidth,
            height: stretcherHeight,
            thickness: thickness,
            edgesToBand: ["top", "bottom"]
        })
    ELSE:
        // Standard cabinet: full top shelf
        panels.add({
            name: "Top Shelf",
            width: bottomWidth,
            height: depth,
            thickness: thickness,
            edgesToBand: ["front"]
        })
        edgeBanding.add({
            panel: "Top Shelf",
            length: bottomWidth / 1000,
            edges: 1
        })
    
    // === BACK PANEL ===
    // Back is thinner material, sits on bottom shelf
    backWidth = width - (2 × thickness)
    backHeight = height - thickness
    panels.add({
        name: "Back Panel",
        width: backWidth,
        height: backHeight,
        thickness: backThickness,
        material: "plywood" or "hardboard",
        edgesToBand: []  // No edging on back
    })
    
    // === TOE KICK (Base cabinets only) ===
    toeKickHeight = 100mm
    panels.add({
        name: "Toe Kick",
        width: width,  // Full width
        height: toeKickHeight,
        thickness: thickness,
        edgesToBand: ["top"]
    })
    edgeBanding.add({
        panel: "Toe Kick",
        length: width / 1000,
        edges: 1
    })
    
    // === HARDWARE ===
    hardware = calculateHardware(cabinetConfig)
    
    RETURN {
        panels: panels,
        hardware: hardware,
        edgeBanding: edgeBanding
    }
```

### Pseudo Code: Calculate Hardware
```
FUNCTION calculateHardware(cabinet):
    hardware = []
    
    // === HINGES ===
    IF cabinet.hasDoors:
        doorCount = cabinet.doorCount  // 1 or 2
        doorHeight = cabinet.doorHeight
        
        // Tall doors need 3 hinges instead of 2
        IF doorHeight > 1200mm:
            hingesPerDoor = 3
        ELSE:
            hingesPerDoor = 2
        
        totalHinges = doorCount × hingesPerDoor
        hardware.add({
            type: "hinge",
            name: "Soft-Close Cabinet Hinge",
            quantity: totalHinges,
            unitCost: $2.50,
            notes: hingesPerDoor + " per door × " + doorCount + " doors"
        })
    
    // === DRAWER SLIDES ===
    IF cabinet.hasDrawers:
        drawerCount = getDrawerCount(cabinet.id)  // e.g., "3drawer" = 3
        slideLength = floor(cabinet.depth × 0.9)  // 90% of depth
        
        hardware.add({
            type: "drawer_slide",
            name: "Undermount Slide (" + slideLength + "mm)",
            quantity: drawerCount × 2,  // 2 slides per drawer
            unitCost: $8.00,
            notes: drawerCount + " drawers × 2 slides"
        })
    
    // === HANDLES ===
    handleCount = cabinet.doorCount + cabinet.drawerCount
    IF handleCount > 0:
        hardware.add({
            type: "handle",
            name: "Cabinet Handle",
            quantity: handleCount,
            unitCost: $3.50
        })
    
    // === SCREWS & CONNECTORS ===
    
    // Corner connectors (Confirmat screws)
    // 4 screws per corner × 4 corners × number of joints
    panelCount = countPanels(cabinet)
    confirmatCount = panelCount × 16  // Approximate
    hardware.add({
        type: "confirmat_screw",
        name: "Confirmat Screw (5×50mm)",
        quantity: confirmatCount,
        unitCost: $0.08
    })
    
    // Back panel screws (every 150mm around perimeter)
    backPerimeter = 2 × (cabinet.width + cabinet.height)
    backScrewCount = ceil(backPerimeter / 150)
    hardware.add({
        type: "back_screw",
        name: "Back Panel Screw (3×15mm)",
        quantity: backScrewCount,
        unitCost: $0.02
    })
    
    // Shelf support pins (for adjustable shelves)
    IF cabinet.hasAdjustableShelves:
        shelfCount = getAdjustableShelfCount(cabinet)
        hardware.add({
            type: "shelf_support",
            name: "Shelf Support Pin",
            quantity: shelfCount × 4,  // 4 pins per shelf
            unitCost: $0.25
        })
    
    RETURN hardware
```

### Box Assembly Sequence
```
1. CUT all panels to size
2. DRILL holes for:
   - Confirmat screws (sides to shelves)
   - Hinge mounting plates
   - Shelf support pins
3. APPLY edge banding to visible edges
4. ASSEMBLE carcass:
   a. Join left side to bottom shelf
   b. Join right side to bottom shelf
   c. Join top shelf (or stretchers)
   d. Square the box, measure diagonals
5. ATTACH back panel (helps square the box)
6. INSTALL hardware:
   - Mount hinges to doors
   - Install drawer slides
   - Attach handles
7. HANG doors and adjust
8. TEST all moving parts
```

---

## 3️⃣ CABINET PLACEMENT ON WALL LOGIC

### Concept
Place selected cabinets along available wall segments, respecting:
- Doors and windows
- Cabinet adjacency (no gaps)
- Left-to-right flow
- Snapping behavior

### Pseudo Code: Place Cabinets
```
FUNCTION placeSelectedCabinets(wall, selectedCabinets):
    availableSegments = calculateAvailableSegments(wall)
    placedCabinets = []
    currentPosition = 0
    
    FOR EACH segment IN availableSegments:
        segmentStart = segment.start
        segmentEnd = segment.end
        segmentLength = segmentEnd - segmentStart
        
        currentX = segmentStart
        
        FOR EACH cabinet IN selectedCabinets:
            IF currentX + cabinet.width <= segmentEnd:
                // Cabinet fits in this segment
                placedCabinets.add({
                    cabinet: cabinet,
                    x: currentX,
                    y: 0,  // Base cabinets on floor
                    segment: segment
                })
                
                currentX += cabinet.width
            ELSE:
                // Cabinet doesn't fit, move to next segment
                BREAK
        
        // Check if segment is filled
        IF currentX >= segmentEnd:
            CONTINUE to next segment
    
    RETURN placedCabinets
```

### Pseudo Code: Auto-Fill Empty Spaces
```
FUNCTION autoFillSpaces(wall, placedCabinets):
    availableSegments = calculateAvailableSegments(wall)
    standardModules = [600, 500, 450, 400, 300]  // Standard cabinet widths
    
    FOR EACH segment IN availableSegments:
        occupiedSpace = calculateOccupiedSpace(segment, placedCabinets)
        remainingSpace = segment.length - occupiedSpace
        
        WHILE remainingSpace > 300mm:  // Minimum useful cabinet
            // Try to fit largest standard module
            FOR EACH width IN standardModules:
                IF width <= remainingSpace:
                    newCabinet = createStandardCabinet(width)
                    placedCabinets.add({
                        cabinet: newCabinet,
                        x: segment.start + occupiedSpace,
                        y: 0,
                        autoFilled: true
                    })
                    
                    occupiedSpace += width
                    remainingSpace -= width
                    BREAK
            
            // If no standard module fits, use filler
            IF remainingSpace < 300mm AND remainingSpace > 0:
                filler = createFiller(remainingSpace)
                placedCabinets.add(filler)
                BREAK
    
    RETURN placedCabinets
```

### Drag-and-Drop Logic
```
FUNCTION handleCabinetDrag(cabinet, newX):
    wall = getCurrentWall()
    availableSegments = calculateAvailableSegments(wall)
    
    // Find which segment the new position is in
    targetSegment = findSegmentAtPosition(availableSegments, newX)
    
    IF targetSegment == null:
        // Dragged to blocked area (door/window)
        RETURN snapToNearestValidPosition(cabinet, newX)
    
    // Snap to edges
    IF newX < targetSegment.start + SNAP_THRESHOLD:
        newX = targetSegment.start  // Snap to segment start
    
    IF newX + cabinet.width > targetSegment.end - SNAP_THRESHOLD:
        newX = targetSegment.end - cabinet.width  // Snap to segment end
    
    // Snap to adjacent cabinets
    FOR EACH otherCabinet IN placedCabinets:
        IF abs((otherCabinet.x + otherCabinet.width) - newX) < SNAP_THRESHOLD:
            newX = otherCabinet.x + otherCabinet.width  // Snap to right edge
        
        IF abs(otherCabinet.x - (newX + cabinet.width)) < SNAP_THRESHOLD:
            newX = otherCabinet.x - cabinet.width  // Snap to left edge
    
    cabinet.x = newX
    RETURN cabinet
```

---

## 4️⃣ BILL OF MATERIALS (BOM) GENERATION

### Concept
Aggregate all materials from all placed cabinets:
- Group panels by size and material
- Sum all hardware quantities
- Calculate total edge banding
- Optimize sheet cutting

### Pseudo Code: Generate BOM
```
FUNCTION generateBOM(placedCabinets):
    bom = {
        panels: {},
        hardware: {},
        edgeBanding: 0,
        sheets: []
    }
    
    // === AGGREGATE PANELS ===
    FOR EACH cabinet IN placedCabinets:
        box = buildBox(cabinet)
        
        FOR EACH panel IN box.panels:
            // Create unique key for panel size/material
            key = panel.width + "×" + panel.height + "×" + panel.thickness + "-" + panel.material
            
            IF bom.panels[key] exists:
                bom.panels[key].quantity += panel.quantity
            ELSE:
                bom.panels[key] = panel
    
    // === AGGREGATE HARDWARE ===
    FOR EACH cabinet IN placedCabinets:
        box = buildBox(cabinet)
        
        FOR EACH item IN box.hardware:
            IF bom.hardware[item.name] exists:
                bom.hardware[item.name].quantity += item.quantity
            ELSE:
                bom.hardware[item.name] = item
    
    // === TOTAL EDGE BANDING ===
    FOR EACH cabinet IN placedCabinets:
        box = buildBox(cabinet)
        bom.edgeBanding += sum(box.edgeBanding.lengths)
    
    // === CALCULATE SHEETS NEEDED ===
    bom.sheets = calculateSheetNesting(bom.panels)
    
    RETURN bom

FUNCTION calculateSheetNesting(panels):
    SHEET_WIDTH = 2440mm
    SHEET_HEIGHT = 1220mm
    KERF = 3mm  // Saw blade width
    
    sheets = []
    remainingPanels = panels.copy()
    
    WHILE remainingPanels.notEmpty():
        sheet = createNewSheet(SHEET_WIDTH, SHEET_HEIGHT)
        
        // Try to fit panels on this sheet (2D bin packing)
        FOR EACH panel IN remainingPanels:
            positions = findPossiblePositions(sheet, panel, KERF)
            
            IF positions.notEmpty():
                bestPosition = chooseBestPosition(positions, panel)
                sheet.placePanelAt(panel, bestPosition)
                remainingPanels.remove(panel)
        
        sheets.add(sheet)
    
    RETURN sheets
```

---

## 5️⃣ COST CALCULATION

### Pseudo Code: Calculate Total Cost
```
FUNCTION calculateTotalCost(bom):
    costs = {
        materials: 0,
        hardware: 0,
        edgeBanding: 0,
        labor: 0,
        total: 0
    }
    
    // === MATERIAL COST ===
    FOR EACH sheet IN bom.sheets:
        IF sheet.thickness == 18mm:
            costs.materials += SHEET_PRICE_18MM  // e.g., $45
        ELSE IF sheet.thickness == 6mm:
            costs.materials += SHEET_PRICE_6MM   // e.g., $15
    
    // === HARDWARE COST ===
    FOR EACH item IN bom.hardware:
        costs.hardware += item.quantity × item.unitCost
    
    // === EDGE BANDING COST ===
    edgeBandingMeters = bom.edgeBanding
    costs.edgeBanding = edgeBandingMeters × PRICE_PER_METER  // e.g., $2/m
    
    // === LABOR COST ===
    // Estimate: 2 hours per cabinet
    cabinetCount = placedCabinets.length
    laborHours = cabinetCount × 2
    costs.labor = laborHours × HOURLY_RATE  // e.g., $50/hour
    
    // === TOTAL ===
    subtotal = costs.materials + costs.hardware + costs.edgeBanding + costs.labor
    costs.total = subtotal × (1 + MARKUP_PERCENTAGE)  // e.g., 20% markup
    
    RETURN costs
```

---

## 6️⃣ KEY ALGORITHMS

### A. 2D Bin Packing (Sheet Nesting)
```
ALGORITHM: Guillotine Cut with Best-Fit
INPUT: List of rectangles (panels), Container size (sheet)
OUTPUT: Placement of panels on minimum sheets

1. Sort panels by area (largest first)
2. For each panel:
   a. Find all free rectangles that can fit the panel
   b. Choose rectangle with smallest remaining area (best-fit)
   c. Place panel in chosen rectangle
   d. Split remaining space into new free rectangles
3. When no panels fit current sheet, start new sheet
4. Repeat until all panels placed

OPTIMIZATION:
- Try both orientations (rotate 90°) if grain allows
- Account for saw kerf (blade width) between cuts
- Prefer cuts that create usable offcuts
```

### B. Snapping Detection
```
ALGORITHM: Multi-Point Snapping
INPUT: Dragged cabinet position, Other cabinets, Wall segments
OUTPUT: Snapped position

SNAP_THRESHOLD = 10mm

1. Check segment boundaries:
   IF abs(newX - segment.start) < SNAP_THRESHOLD:
       SNAP to segment.start
   IF abs((newX + width) - segment.end) < SNAP_THRESHOLD:
       SNAP to (segment.end - width)

2. Check adjacent cabinets:
   FOR each adjacent cabinet:
       IF abs(newX - cabinet.right) < SNAP_THRESHOLD:
           SNAP to cabinet.right
       IF abs((newX + width) - cabinet.left) < SNAP_THRESHOLD:
           SNAP to (cabinet.left - width)

3. Return snapped position or original if no snap
```

---

## 7️⃣ EDGE CASES & VALIDATION

### Critical Checks
```
1. Wall Validation:
   - Minimum wall size: 500mm × 500mm
   - Openings must fit within wall bounds
   - Openings cannot overlap
   - Total opening width < wall width

2. Cabinet Validation:
   - Minimum cabinet size: 200mm width
   - Maximum cabinet size: 1200mm width
   - Height appropriate for type (base/wall/tall)
   - Depth doesn't exceed wall depth

3. Placement Validation:
   - Cabinet must fit in available segment
   - No overlap with doors/windows
   - No overlap with other cabinets
   - Minimum 2mm gap between cabinets (for assembly)

4. BOM Validation:
   - All panels must fit on standard sheets
   - Hardware quantities are positive integers
   - Edge banding total is reasonable
   - Cost calculations don't overflow

5. Sheet Nesting Validation:
   - Panel dimensions + kerf fit in sheet
   - Grain direction respected
   - Waste percentage < 30% per sheet
   - Offcuts tracked for reuse
```

---

## 8️⃣ PERFORMANCE OPTIMIZATIONS

### Implemented Optimizations
```
1. Canvas Rendering:
   - Only redraw on state change
   - Use requestAnimationFrame for smooth drag
   - Cache calculated segment positions
   - Limit redraws during continuous drag

2. Data Structures:
   - Use Set for unique panel tracking
   - Index cabinets by position for fast lookup
   - Pre-calculate segment boundaries

3. Algorithm Efficiency:
   - Segment calculation: O(n log n) with sweep line
   - Cabinet placement: O(n×m) where n=cabinets, m=segments
   - BOM aggregation: O(n) with hash map
   - Sheet nesting: Heuristic approach, not optimal but fast

4. Memory Management:
   - Reuse canvas context
   - Clear arrays when rebuilding
   - Avoid deep copying large objects
```

---

## 9️⃣ FUTURE ENHANCEMENTS

### Planned Features
```
1. Advanced Nesting:
   - OR-Tools integration for optimal sheet nesting
   - Grain direction optimization
   - Kerf compensation
   - Offcut tracking and reuse

2. 3D Visualization:
   - Three.js integration
   - Interactive camera controls
   - Texture mapping
   - Lighting and shadows

3. Export Features:
   - PDF generation with jsPDF
   - DXF export for CNC
   - CSV cutlist
   - JSON for SketchUp import

4. Collaboration:
   - Save/load projects
   - User accounts
   - Share project links
   - Version history

5. Advanced Pricing:
   - Multi-material support
   - Vendor price lists
   - Discount rules
   - Tax calculations
   - Currency conversion
```

---

## 🔟 MATHEMATICS REFERENCE

### Key Formulas

**Panel Area (m²):**
```
Area = (Width_mm × Height_mm) / 1,000,000
```

**Edge Banding Length (m):**
```
For rectangular panel with edges to band:
Length = (Sum of edge lengths in mm) / 1000

Example: Panel 600×400mm, band 3 edges (front, top, bottom):
Length = (600 + 400 + 400) / 1000 = 1.4m
```

**Sheets Required:**
```
Sheet_Area = 2440mm × 1220mm = 2,976,800mm²

Total_Panel_Area = Sum(Panel_Width × Panel_Height × Quantity)

Minimum_Sheets = ceil(Total_Panel_Area / Sheet_Area / Efficiency)
where Efficiency = 0.75 (assumes 25% waste)
```

**Hardware Quantities:**
```
Hinges = Doors × (2 if Height ≤ 1200mm else 3)
Drawer_Slides = Drawers × 2
Handles = Doors + Drawers
Confirmat_Screws = Panels × 16 (average)
Back_Screws = ceil(Perimeter / 150mm)
```

---

## END OF DOCUMENTATION

This document provides the complete logical foundation for the Kitchen Cabinet Calculator system. All algorithms are implemented in JavaScript in the `public/js/` directory.

**Files:**
- `app.js` - Main application and wall logic
- `boxBuilder.js` - Box construction logic
- `boxViewer.js` - 4-elevation rendering
- `cabinetData.js` - Cabinet definitions
- `boxIntegration.js` - Integration methods

**Last Updated:** October 27, 2025
