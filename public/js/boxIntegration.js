// Box Builder Integration Methods
// These methods extend the KitchenCalculator class

KitchenCalculator.prototype.initializeBoxBuilder = function() {
    console.log('=== initializeBoxBuilder called ===');
    
    // Initialize BoxBuilder and BoxViewer
    if (typeof BoxBuilder !== 'undefined') {
        this.boxBuilder = new BoxBuilder();
        console.log('✅ BoxBuilder initialized');
    } else {
        console.error('❌ BoxBuilder class not found');
    }

    const boxCanvas = document.getElementById('box-canvas');
    if (boxCanvas && typeof BoxViewer !== 'undefined') {
        this.boxViewer = new BoxViewer('box-canvas');
        console.log('✅ BoxViewer initialized');
    } else {
        console.error('❌ BoxViewer not found or canvas missing');
    }

    // Check if CABINET_SYSTEMS is loaded
    console.log('CABINET_SYSTEMS loaded:', typeof window.CABINET_SYSTEMS !== 'undefined');
    if (typeof window.CABINET_SYSTEMS !== 'undefined') {
        console.log('CABINET_SYSTEMS keys:', Object.keys(window.CABINET_SYSTEMS));
    }

    // Populate cabinet dropdown
    console.log('Calling populateBoxCabinetSelector...');
    this.populateBoxCabinetSelector();
};

KitchenCalculator.prototype.populateBoxCabinetSelector = function() {
    console.log('=== populateBoxCabinetSelector called ===');
    
    const select = document.getElementById('box-cabinet-select');
    if (!select) {
        console.error('❌ Box cabinet select element not found');
        return;
    } else {
        console.log('✅ Dropdown element found:', select);
    }
    
    if (typeof window.CABINET_SYSTEMS === 'undefined') {
        console.error('❌ CABINET_SYSTEMS not loaded');
        return;
    } else {
        console.log('✅ CABINET_SYSTEMS found');
    }

    console.log('Starting to populate dropdown...');
    
    // Clear existing options except first
    select.innerHTML = '<option value="">-- Choose a Cabinet --</option>';
    
    let totalCount = 0;

    // Get all cabinets from all categories
    Object.entries(window.CABINET_SYSTEMS).forEach(([systemKey, system]) => {
        console.log(`Processing system: ${systemKey}`, system);
        
        Object.entries(system).forEach(([category, cabinets]) => {
            // Skip non-array entries (like 'name', 'standard', 'unit')
            if (!Array.isArray(cabinets)) {
                console.log(`  Skipping ${category} (not an array)`);
                return;
            }
            
            console.log(`  Processing ${category} with ${cabinets.length} cabinets`);
            
            cabinets.forEach(cabinet => {
                const option = document.createElement('option');
                option.value = cabinet.id;
                option.textContent = `${cabinet.name} (${cabinet.width}×${cabinet.height}×${cabinet.depth}mm)`;
                select.appendChild(option);
                totalCount++;
            });
        });
    });
    
    console.log(`✅ Cabinet selector populated with ${totalCount} cabinets`);
    console.log('Dropdown now has', select.options.length, 'total options');
};

KitchenCalculator.prototype.selectBoxCabinet = function(cabinetId) {
    console.log('selectBoxCabinet called with:', cabinetId);
    
    if (!cabinetId) {
        // Hide all panels
        document.getElementById('box-parameters').style.display = 'none';
        document.getElementById('box-summary').style.display = 'none';
        document.getElementById('box-panels').style.display = 'none';
        document.getElementById('box-hardware').style.display = 'none';
        document.getElementById('box-edging').style.display = 'none';
        return;
    }

    // Find cabinet in data
    let cabinet = null;
    Object.values(window.CABINET_SYSTEMS).forEach(system => {
        Object.entries(system).forEach(([key, value]) => {
            // Skip non-array entries
            if (!Array.isArray(value)) return;
            
            const found = value.find(c => c.id === cabinetId);
            if (found) {
                cabinet = found;
                console.log('Cabinet found:', cabinet);
            }
        });
    });

    if (!cabinet) {
        console.error('Cabinet not found:', cabinetId);
        return;
    }

    // Show parameters panel
    document.getElementById('box-parameters').style.display = 'block';

    // Set default dimensions
    document.getElementById('box-width').value = cabinet.width;
    document.getElementById('box-height').value = cabinet.height;
    document.getElementById('box-depth').value = cabinet.depth;

    // Store current cabinet
    this.selectedBoxCabinet = cabinet;
    
    console.log('Cabinet selected, parameters displayed');
};

KitchenCalculator.prototype.updateBoxParameters = function() {
    // Just update the stored values - actual build happens on button click
    if (this.selectedBoxCabinet) {
        const width = parseInt(document.getElementById('box-width').value);
        const height = parseInt(document.getElementById('box-height').value);
        const depth = parseInt(document.getElementById('box-depth').value);

        // Validation
        if (width < 100 || width > 1200) {
            document.getElementById('box-width').setCustomValidity('Width must be between 100-1200mm');
        } else {
            document.getElementById('box-width').setCustomValidity('');
        }

        if (height < 100 || height > 2400) {
            document.getElementById('box-height').setCustomValidity('Height must be between 100-2400mm');
        } else {
            document.getElementById('box-height').setCustomValidity('');
        }

        if (depth < 100 || depth > 800) {
            document.getElementById('box-depth').setCustomValidity('Depth must be between 100-800mm');
        } else {
            document.getElementById('box-depth').setCustomValidity('');
        }
    }
};

KitchenCalculator.prototype.buildAndDisplayBox = function() {
    if (!this.selectedBoxCabinet || !this.boxBuilder || !this.boxViewer) {
        alert('Please select a cabinet first!');
        return;
    }

    // Get current dimensions
    const width = parseInt(document.getElementById('box-width').value);
    const height = parseInt(document.getElementById('box-height').value);
    const depth = parseInt(document.getElementById('box-depth').value);

    // Create cabinet object with current dimensions
    const cabinetSpec = {
        ...this.selectedBoxCabinet,
        width: width,
        height: height,
        depth: depth
    };

    console.log('Building box for:', cabinetSpec);

    // Build the box
    try {
        this.currentBox = this.boxBuilder.buildBox(cabinetSpec);
        console.log('Box built:', this.currentBox);

        // Display the box
        this.displayBoxDetails(this.currentBox);
        this.boxViewer.displayBox(this.currentBox);

        // Hide canvas message
        const canvasMessage = document.getElementById('box-canvas-message');
        if (canvasMessage) {
            canvasMessage.classList.add('hidden');
        }

    } catch (error) {
        console.error('Error building box:', error);
        alert('Error building box. Please check console for details.');
    }
};

KitchenCalculator.prototype.displayBoxDetails = function(box) {
    // Show all detail sections
    document.getElementById('box-summary').style.display = 'block';
    document.getElementById('box-panels').style.display = 'block';
    document.getElementById('box-hardware').style.display = 'block';
    document.getElementById('box-edging').style.display = 'block';

    // Update summary stats
    document.getElementById('stat-panel-count').textContent = box.summary.panelCount;
    document.getElementById('stat-panel-area').textContent = box.summary.totalPanelArea;
    document.getElementById('stat-edge-banding').textContent = box.summary.totalEdgeBanding;
    document.getElementById('stat-hardware-items').textContent = box.summary.hardwareItems;
    document.getElementById('stat-hardware-cost').textContent = box.summary.hardwareCost;

    // Display panels
    this.displayPanelList(box.panels);

    // Display hardware
    this.displayHardwareList(box.hardware);

    // Display edge banding
    this.displayEdgeBandingList(box.edgeBanding);
};

KitchenCalculator.prototype.displayPanelList = function(panels) {
    const container = document.getElementById('panel-list');
    container.innerHTML = '';

    panels.forEach(panel => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-item-header">${panel.name}</div>
            <div class="detail-item-specs">
                <div class="detail-item-spec">
                    <span>Size:</span>
                    <span>${panel.width} × ${panel.height} × ${panel.thickness}mm</span>
                </div>
                <div class="detail-item-spec">
                    <span>Material:</span>
                    <span>${panel.material}</span>
                </div>
                <div class="detail-item-spec">
                    <span>Grain:</span>
                    <span>${panel.grainDirection}</span>
                </div>
                <div class="detail-item-spec">
                    <span>Qty:</span>
                    <span>${panel.quantity}</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
};

KitchenCalculator.prototype.displayHardwareList = function(hardware) {
    const container = document.getElementById('hardware-list');
    container.innerHTML = '';

    hardware.forEach(item => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-item-header">${item.name}</div>
            <div class="detail-item-specs">
                <div class="detail-item-spec">
                    <span>Quantity:</span>
                    <span>${item.quantity} ${item.unit}</span>
                </div>
                <div class="detail-item-spec">
                    <span>Unit Cost:</span>
                    <span>$${item.unitCost.toFixed(2)}</span>
                </div>
                <div class="detail-item-spec">
                    <span>Total:</span>
                    <span><strong>$${(item.quantity * item.unitCost).toFixed(2)}</strong></span>
                </div>
                ${item.notes ? `
                <div class="detail-item-spec" style="grid-column: 1 / -1;">
                    <span>Notes:</span>
                    <span style="font-style: italic;">${item.notes}</span>
                </div>
                ` : ''}
            </div>
        `;
        container.appendChild(div);
    });
};

KitchenCalculator.prototype.displayEdgeBandingList = function(edgeBanding) {
    const container = document.getElementById('edging-list');
    container.innerHTML = '';

    edgeBanding.forEach(edge => {
        const div = document.createElement('div');
        div.className = 'detail-item';
        div.innerHTML = `
            <div class="detail-item-header">${edge.panel}</div>
            <div class="detail-item-specs">
                <div class="detail-item-spec">
                    <span>Edges:</span>
                    <span>${edge.edges.join(', ')}</span>
                </div>
                <div class="detail-item-spec">
                    <span>Length:</span>
                    <span>${edge.totalLength.toFixed(2)} ${edge.unit}</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
};
