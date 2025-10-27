# Kitchen Cabinet Cost Calculator

A professional-grade web application for kitchen planning with European Frameless cabinet systems. Features engineering-style elevation views, comprehensive measurement tools, and intelligent cabinet placement.

## 🎯 Features

### 1. **Wall Configuration System**
- Add up to 4 walls (labeled A-D)
- Configure wall dimensions (length & height)
- Add multiple doors with precise measurements:
  - Door width and height
  - Distance from left edge
  - Distance from floor
- Add multiple windows with complete specifications:
  - Window width and height
  - Lift distance (from floor to bottom of window)
  - Distance from left edge
  - Distance from floor to top of window
- Edit and delete wall configurations
- Real-time validation

### 2. **Professional 2D Elevation View**
- Engineering-style technical drawings
- Comprehensive dimension lines:
  - Top horizontal dimensions (total wall length)
  - Bottom segment dimensions (all spaces between obstacles)
  - Vertical dimensions (wall height, door/window measurements)
  - Obstacle-specific dimensions
- Visual space analysis:
  - **Blue areas**: Available upper cabinet space (above doors & windows)
  - **Green areas**: Available lower cabinet space (below windows only)
- Professional annotation system:
  - White backgrounds behind dimension text
  - Clear arrow indicators
  - Precise measurement labels

### 3. **Multi-Unit Support**
- **Feet (ft)**: Imperial system with decimal precision
- **Meters (m)**: Metric system with 2 decimal places
- **Millimeters (mm)**: Precision metric measurements
- Real-time conversion across all measurements
- Unit selection persists across all views

### 4. **European Frameless Cabinet Systems**

#### Metric System (600mm Module)
- **Base Cabinets**: 300mm, 400mm, 450mm, 500mm, 600mm, 800mm, 1000mm
  - Height: 720mm | Depth: 580mm
  - Prices: $150 - $500
- **Wall Cabinets**: 300mm, 400mm, 500mm, 600mm, 800mm
  - Height: 720mm | Depth: 350mm
  - Prices: $120 - $350
- **Tall Cabinets**: 600mm, 800mm
  - Height: 2100mm | Depth: 580mm
  - Prices: $600 - $800
- **Specialty Cabinets**: Corner (900mm), Sink Base (800mm), Range Hood (900mm)
  - Prices: $400 - $650

#### Imperial System (24" Module)
- **Base Cabinets**: 12", 15", 18", 21", 24", 30", 36"
  - Height: 34.5" | Depth: 24"
  - Prices: $150 - $500
- **Wall Cabinets**: 12", 15", 18", 24", 30"
  - Height: 30" | Depth: 12"
  - Prices: $120 - $350
- **Tall Cabinets**: 24", 30"
  - Height: 84" | Depth: 24"
  - Prices: $600 - $800
- **Specialty Cabinets**: Corner (36"), Sink Base (33"), Range Hood (36")
  - Prices: $400 - $650

### 5. **Cabinet Library**
- Visual cabinet cards with:
  - Cabinet name and code
  - Complete dimensions (W × H × D)
  - Price information
  - Category badges (Base, Wall, Tall, Specialty)
- Organized by category for easy browsing
- Hover effects for better UX
- Selection highlighting (green border)
- Click to select for placement

### 6. **Cabinet Placement System** _(In Development)_
- Interactive placement canvas
- Click-to-place cabinet functionality
- Visual feedback for valid/invalid positions
- Collision detection with:
  - Doors and windows
  - Other placed cabinets
  - Wall boundaries
- Auto-fill algorithm (coming soon):
  - Analyzes available spaces
  - Suggests optimal cabinet combinations
  - Considers standard module sizes
  - Calculates total cost

### 7. **Zoom & View Controls**
- Zoom in/out buttons for detailed inspection
- Reset view to default scale
- Responsive canvas sizing
- Maintains aspect ratios

## 🏗️ Project Structure

```
kitchen-cabinet-calculator/
├── src/main/resources/static/
│   ├── index.html           # Main HTML with 3 tabs
│   ├── css/
│   │   └── styles.css       # Complete styling
│   └── js/
│       ├── app.js           # Main application logic
│       └── cabinetData.js   # Cabinet database
├── pom.xml                  # Maven configuration
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## 🚀 Getting Started

### Option 1: Simple HTTP Server (Python)
```bash
cd kitchen-cabinet-calculator
python -m http.server 8080
```
Then open: `http://localhost:8080/src/main/resources/static/index.html`

### Option 2: Spring Boot
```bash
mvn spring-boot:run
```
Then open: `http://localhost:8080`

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📖 Usage Guide

### Step 1: Configure Walls
1. Click the **"📐 Walls"** tab
2. Click **"Add New Wall"** button
3. Enter wall dimensions
4. Add doors (if any):
   - Click **"Add Door"**
   - Enter door dimensions and position
5. Add windows (if any):
   - Click **"Add Window"**
   - Enter window dimensions, lift, and position
6. Click **"Save Wall"**
7. View the professional elevation drawing

### Step 2: Browse Cabinet Library
1. Select your preferred system:
   - **European Frameless (Metric)** - for 600mm module
   - **European Frameless (Imperial)** - for 24" module
2. Click the **"🗄️ Cabinet Library"** tab
3. Browse categories:
   - Base Cabinets
   - Wall Cabinets
   - Tall Cabinets
   - Specialty Cabinets
4. Click on any cabinet to select it

### Step 3: Place Cabinets _(Coming Soon)_
1. Click the **"🎯 Place Cabinets"** tab
2. Select a cabinet from the library
3. Click on the wall where you want to place it
4. Use **"Auto-Fill"** to automatically suggest combinations
5. View total cost and cutting plans

## 🎨 Design Philosophy

### Engineering-Grade Documentation
- Professional dimension lines with arrow indicators
- Clear visual hierarchy
- Accurate measurements
- Industry-standard annotation style

### Obstacle Logic
- **Upper Cabinets**: Cannot be placed above doors OR windows
- **Lower Cabinets**: Cannot be placed where doors exist, BUT can be placed below windows
- Visual color coding for quick understanding

### European Frameless Standards
- Based on 600mm (metric) or 24" (imperial) modules
- Standard height conventions:
  - Base: 720mm / 34.5"
  - Wall: 720mm / 30"
  - Tall: 2100mm / 84"
- Professional depth standards

## 🔧 Technical Details

### Technologies
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Canvas API**: 2D rendering engine
- **Backend Ready**: Spring Boot 1.8 structure
- **Build Tool**: Maven
- **Deployment**: Vercel-ready

### Key Classes
- **KitchenCalculator**: Main application controller
- **Cabinet**: Cabinet definition class
- **PlacedCabinet**: Placed cabinet with position data

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📋 Upcoming Features

### Phase 1: Placement System ✅ In Progress
- [x] Cabinet library UI
- [x] Tab navigation
- [x] Cabinet selection
- [ ] Click-to-place functionality
- [ ] Collision detection
- [ ] Visual placement feedback

### Phase 2: Auto-Fill Algorithm
- [ ] Space analysis algorithm
- [ ] Best-fit cabinet combinations
- [ ] Standard module optimization
- [ ] Cost calculation
- [ ] Multiple solution proposals

### Phase 3: Advanced Features
- [ ] Cutting plans generation
- [ ] Material list export
- [ ] 3D visualization
- [ ] PDF export of plans
- [ ] Save/Load projects
- [ ] Cost comparison tools

### Phase 4: Professional Tools
- [ ] Multiple cabinet systems (US, UK, Asian)
- [ ] Custom cabinet designer
- [ ] Hardware specifications
- [ ] Installation instructions
- [ ] Customer quotation generator

## 🤝 Contributing

This is a professional tool for kitchen planning. Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Implement your enhancement
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available for professional use.

## 🔗 Repository

GitHub: [LuxusEle/wall](https://github.com/LuxusEle/wall)

---

**Built with precision for professional kitchen planning** 🏗️✨