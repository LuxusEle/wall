# 📦 Ruby Box Construction - Key Learnings from CBX_Shotgun V2.rb

## 🎯 CRITICAL INSIGHT: The "Box" is NOT just panels - it's a COMPLETE CABINET CARCASS

### What I Misunderstood Before:
- ❌ I thought "box" = simple rectangular container with 6 panels
- ❌ I created basic geometric boxes without proper joinery
- ❌ I missed the critical STRETCHER system for structural integrity

### What Ruby Code Actually Does:

## 📐 CABINET CARCASS CONSTRUCTION (The Real "Box")

### 1. **BASE CABINET STRUCTURE** (Bottom Boxes)
```
COMPONENTS (in order of creation):
├── Bottom Panel (full width × full depth × panel_thk)
├── Left Side Panel (panel_thk wide × depth deep × height tall)
├── Right Side Panel (panel_thk wide × depth deep × height tall)
├── Front Stretcher (100mm deep × panel_thk tall, at TOP of cabinet)
├── Back Stretcher (100mm deep × panel_thk tall, at TOP of cabinet)
├── Back Panel (grooved, 6mm typically, fits into groove in side panels)
├── Bottom Back Stretcher (100mm tall × panel_thk deep, at BOTTOM, pushpull forward from wall)
├── Top Back Stretcher (100mm tall × panel_thk deep, at TOP, pushpull forward from wall)
├── [IF DOOR] → Shelves (adjustable, based on shelf_count)
├── [IF DOOR] → Door(s) with Gola cuts (optional L-shaped finger pulls)
└── [IF DRAWER] → Drawer Faces (2 or 3 drawer configuration with central Gola cuts)

Z-OFFSET: All bottom cabinets sit at bottom_z_offset = 100mm (plinth space below)
```

### 2. **TOP/WALL CABINET STRUCTURE** (Top Cabinets)
```
COMPONENTS:
├── Left Side Panel
├── Right Side Panel  
├── Top Panel (horizontal, sits between side panels)
├── Bottom Panel (horizontal, sits between side panels)
├── Back Panel (grooved, fits into groove OR full-thickness for open rack)
├── Bottom Back Stretcher (100mm tall × carcass_thk deep)
├── Top Back Stretcher (100mm tall × carcass_thk deep)
├── Mid Shelf (fixed, centered vertically)
├── [IF CLOSED] → Door(s)
└── [IF OPEN RACK] → Multiple shelves (forced to 2 shelves, 22mm deeper cabinet)

DOOR LOGIC: <600mm = single door, ≥600mm = double doors
```

### 3. **TALL CABINETS** (Full Height)
```
Similar to base cabinets but:
- No plinth offset (starts at Z=0)
- Taller height (1800-2400mm typical)
- Same stretcher system
- Can have multiple shelves
```

## 🔩 CRITICAL STRUCTURAL ELEMENTS (What I Missed!)

### **STRETCHERS** (The Hidden Structural System)
```ruby
# Front Stretcher (at TOP of cabinet)
- Width: cab_width - 2×panel_thk (fits between side panels)
- Height: 100mm (Z-axis)
- Depth: panel_thk (Y-axis, typically 18mm)
- Position: At top edge, 26mm from front edge
- Purpose: Structural support for front edge

# Back Stretcher (at TOP of cabinet) 
- Same dimensions as front stretcher
- Position: At wall side, top edge
- Purpose: Structural support for back edge

# Bottom Back Stretcher (at BOTTOM rear)
- Height: 100mm (Z-axis)
- Width: cab_width - 2×panel_thk
- Depth: panel_thk (Y-axis)
- Position: At wall (Y = depth), sits on bottom panel
- Pushpull: FORWARD (+Y direction) toward front by panel_thk
- Purpose: Back panel support at bottom

# Top Back Stretcher (at TOP rear, UNDER top panel)
- Height: 100mm (Z-axis)
- Width: cab_width - 2×panel_thk  
- Depth: panel_thk (Y-axis)
- Position: At wall (Y = depth), UNDER top panel by (panel_thk + 100mm)
- Pushpull: FORWARD (+Y direction) toward front by panel_thk
- Purpose: Back panel support at top
```

### **BACK PANEL GROOVE SYSTEM**
```ruby
# Back panel is NOT flush - it fits into GROOVES in side panels
groove_depth = 10mm (typical)
back_thickness = 6mm (typical)

# Back panel dimensions:
inner_w = cab_width - 2×mat_thickness
inner_h = effective_cab_height - 2×mat_thickness
bx = mat_thickness - groove_depth  # Extends INTO side panel groove
bz = mat_thickness - groove_depth  # Extends INTO bottom panel groove
bw = inner_w + 2×groove_depth      # Width includes groove extension
bh = inner_h + 2×groove_depth      # Height includes groove extension

# Position: depth - (mat_thickness + back_thickness) from front
```

## 🚪 DOOR SYSTEMS (Two Types)

### 1. **HANDLED DOORS** (Traditional)
```javascript
door_outer_gap = 3mm (each side)
door_inner_gap = 3mm (between double doors)
door_material_thickness = 18mm
door_height = cabinet_height (for top) OR cabinet_height - 10mm (for base)

Single Door: width < 600mm
Double Doors: width ≥ 600mm
```

### 2. **GOLA SYSTEM** (Handleless/Finger Pull)
```javascript
door_override = 20mm (cabinet sits back from door)
top_gap = 30mm (vs 10mm for handled)

// L-SHAPED GOLA CUTS (bottom edge, both sides)
Position: height - plinth - 59mm to height - plinth
Width: 26mm deep into side panel
Height: 59mm tall

// C-SHAPED GOLA CUTS (central, for drawers)
Position: Centered vertically at mid_height ± 36.75mm
Width: 26mm deep into side panel  
Height: 73.5mm tall
```

## 📦 DRAWER CONFIGURATIONS

### **2-DRAWER SYSTEM**
```javascript
// Split cabinet height in HALF
mid_z = (door_height + edge_band_thk) / 2.0
drawer_vertical_gap = (gola ? 13mm : door_gap/2.0)

// Bottom Drawer Face:
- Height: from edge_band_thk to (mid_z - drawer_vertical_gap)

// Top Drawer Face:
- Height: from (mid_z + drawer_vertical_gap) to (door_height - top_gap)
```

### **3-DRAWER SYSTEM**
```javascript
// BOTTOM stays same as 2-drawer
// TOP region is SPLIT into 2 equal drawers

drawer_horizontal_gap_3 = (gola ? 3mm : door_gap)
top_region_height = (door_height - top_gap) - top_face_z
half_h = (top_region_height - drawer_horizontal_gap_3) / 2.0

// Top Drawer 1: top_face_z to (top_face_z + half_h)
// Top Drawer 2: (top_face_z + half_h + gap) to door_height
```

## 🎨 MATERIALS & THICKNESSES

```javascript
// Standard Material Specifications
mat_thickness = 18mm       // Carcass panels (sides, top, bottom)
back_thickness = 6mm       // Back panel (thin)
door_mat_thk = 18mm        // Door material thickness
face_mat_thk = 3mm         // Drawer face overlay thickness
edge_band_thk = 2mm        // Edge banding on panels
groove_depth = 10mm        // Groove for back panel
plinth = 100mm             // Toe kick space (base cabinets)
bottom_z_offset = 100mm    // Base cabinets sit 100mm above floor
```

## 📏 DIMENSIONAL LOGIC

### **Cabinet Sizing**
```javascript
// Interior dimensions (between side panels):
interior_width = cabinet_width - 2×panel_thk
interior_depth = cabinet_depth - panel_thk - back_thickness
interior_height = cabinet_height - 2×panel_thk (- plinth for base)

// Door sizing:
available_door_width = cabinet_width - 2×door_side_clearance
door_height = cabinet_height (top) OR cabinet_height - 10mm (base) - plinth

// Shelf sizing:
shelf_width = cabinet_width - 2×panel_thk
shelf_depth = cabinet_depth - back_thickness - panel_thk
```

### **Elevation/Positioning**
```javascript
// Base Cabinets:
Z = bottom_z_offset = 100mm (plinth space below)
Y = -depth (extends backward from front edge)

// Wall Cabinets:
Z = elevation = 1500mm (typical, above countertop)
Y = -depth (extends backward from wall)

// Cooker Hood (Special Case):
hood_height = base_height - hood_space_reduction
hood_elevation = elevation + (base_height - hood_height)  
// ↑ Raised so TOP aligns with other top cabinets
```

## 🔄 MY CORRECTION PLAN

### What I Need to Fix in JavaScript:

1. ✅ **Add Stretcher System**
   - Front stretcher (100mm tall, at top)
   - Back stretcher (100mm tall, at top)
   - Bottom back stretcher (100mm tall, at wall)
   - Top back stretcher (100mm tall, under top panel)

2. ✅ **Fix Back Panel**
   - Use groove system, not flush mounting
   - Correct dimensions: inner + 2×groove_depth
   - Correct position: extends into grooves

3. ✅ **Implement Gola System**
   - L-shaped cuts at bottom (59mm tall × 26mm deep)
   - C-shaped cuts at center for drawers (73.5mm tall × 26mm deep)
   - 20mm door_override for handleless cabinets
   - 30mm top_gap instead of 10mm

4. ✅ **Fix Drawer Logic**
   - Proper mid-split calculation
   - Vertical gaps: 13mm for gola, door_gap/2 for handled
   - 3-drawer: split top region into 2 equal parts

5. ✅ **Add Elevation Views**
   - **FRONT**: Show door/drawer faces, dimensions, Gola cuts, hinges
   - **LEFT SIDE**: Show side panel, depth, stretchers, hardware
   - **BACK**: Show back panel, back stretchers, screw positions
   - **TOP**: Show interior layout, shelves, stretchers from above

6. ✅ **Hardware Calculation**
   - Hinges: Based on door height (110° soft-close, count by height)
   - Drawer slides: Full extension undermount, one pair per drawer
   - Screws: Confirmat screws for panel joints (calculate per joint)
   - Edge banding: Calculate linear meters for all exposed edges

## 🖼️ VISUAL COMPARISON

### What I Was Making (WRONG):
```
     [Door]
   +---------+
   |         | ← Just 6 flat panels
   |   Box   | ← No structure
   |         | ← No joinery details
   +---------+
```

### What Ruby Makes (CORRECT):
```
[Door with Gola]
   +=========+  ← Top Stretcher (100mm)
   |╔═══════╗|  ← Back Stretchers (structural)
   |║ Shelf ║|  ← Mid shelf or drawer dividers
   |║       ║|  ← Grooved back panel
   |╚═══════╝|  ← Bottom Stretcher (100mm)
   +=========+  ← Side panels with grooves
   [Plinth 100mm]
```

## 🎯 KEY TAKEAWAY

**The "box" in CBX is NOT a simple rectangular container!**

It's a **fully engineered cabinet carcass** with:
- ✅ Structural stretchers for rigidity
- ✅ Grooved joinery for back panel
- ✅ Proper hardware mounting points
- ✅ Gola finger pull system (optional)
- ✅ Precise drawer face calculations
- ✅ Elevation-specific positioning logic

---

**Next Steps:**
1. Re-architect JavaScript `BoxBuilder` class to match Ruby structure
2. Add stretcher creation methods
3. Implement groove calculations for back panel
4. Add Gola cut geometry to elevations
5. Fix drawer height calculations with proper gaps
6. Update elevation renderer to show structural details
