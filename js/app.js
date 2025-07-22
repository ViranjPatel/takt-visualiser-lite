// Main application logic

let scheduler;
let selectedZone = null;
let editingTask = null;

// Initialize app
async function init() {
    await db.init();
    
    // Initialize scheduler
    scheduler = new DayPilot.Scheduler("scheduler");
    configureScheduler();
    scheduler.init();
    
    // Load data
    await loadZones();
    await loadTrades();
    await loadTasks();
    
    // Setup event listeners
    setupEventListeners();
}

function configureScheduler() {
    scheduler.viewType = "Days";
    scheduler.days = 90;
    scheduler.cellWidth = 40;
    scheduler.rowHeaderWidth = 200;
    scheduler.eventHeight = 25;
    scheduler.headerHeight = 25;
    scheduler.startDate = new DayPilot.Date().firstDayOfMonth();
    scheduler.treeEnabled = true;
    scheduler.treePreventParentUsage = true;
    
    // Event handlers
    scheduler.onEventMoved = async (args) => {
        const task = {
            id: args.e.data.id,
            zone_id: parseInt(args.newResource),
            start_date: args.newStart.toString("yyyy-MM-dd")
        };
        await db.update('tasks', task);
    };
    
    scheduler.onEventResized = async (args) => {
        const duration = Math.ceil((args.newEnd - args.newStart) / (1000 * 60 * 60 * 24));
        const task = {
            id: args.e.data.id,
            start_date: args.newStart.toString("yyyy-MM-dd"),
            duration: duration
        };
        await db.update('tasks', task);
    };
    
    scheduler.onEventClick = (args) => {
        openTaskModal(args.e.data.id);
    };
}

// Load zones and build tree
async function loadZones() {
    const zones = await db.getAll('zones');
    const resources = buildZoneTree(zones);
    scheduler.update({resources});
    renderZoneTree(zones);
}

function buildZoneTree(zones) {
    const map = {};
    const roots = [];
    
    // Create map
    zones.forEach(zone => {
        map[zone.id] = {
            id: zone.id,
            name: zone.name,
            expanded: true,
            children: []
        };
    });
    
    // Build tree
    zones.forEach(zone => {
        if (zone.parent_id === null) {
            roots.push(map[zone.id]);
        } else if (map[zone.parent_id]) {
            map[zone.parent_id].children.push(map[zone.id]);
        }
    });
    
    return roots;
}

function renderZoneTree(zones) {
    const container = document.getElementById('zone-tree');
    container.innerHTML = '';
    
    const tree = buildZoneTree(zones);
    tree.forEach(node => renderZoneNode(node, container, 0));
}

function renderZoneNode(node, container, level) {
    const div = document.createElement('div');
    div.className = 'zone-item';
    div.style.paddingLeft = `${level * 20 + 8}px`;
    div.textContent = node.name;
    div.dataset.zoneId = node.id;
    
    if (selectedZone === node.id) {
        div.classList.add('selected');
    }
    
    div.addEventListener('click', () => {
        document.querySelectorAll('.zone-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        selectedZone = node.id;
    });
    
    container.appendChild(div);
    
    if (node.children) {
        node.children.forEach(child => renderZoneNode(child, container, level + 1));
    }
}

// Load trades
async function loadTrades() {
    const trades = await db.getAll('trades');
    const container = document.getElementById('trade-list');
    container.innerHTML = '';
    
    trades.forEach(trade => {
        const div = document.createElement('div');
        div.className = 'trade-item';
        div.innerHTML = `
            <div class="trade-color" style="background-color: ${trade.color}"></div>
            <span>${trade.name}</span>
        `;
        container.appendChild(div);
    });
}

// Load tasks
async function loadTasks() {
    const tasks = await db.getAll('tasks');
    const events = tasks.map(task => {
        const start = new DayPilot.Date(task.start_date);
        const end = start.addDays(task.duration || 1);
        
        return {
            id: task.id,
            text: task.name,
            start: start,
            end: end,
            resource: task.zone_id,
            cssClass: `trade-${task.trade_id || 1} status-${task.status || 'planned'}`
        };
    });
    
    scheduler.update({events});
}

// Modal functions
function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const title = document.getElementById('modal-title');
    
    editingTask = taskId;
    
    if (taskId) {
        title.textContent = 'Edit Task';
        // Load task data
        db.getAll('tasks').then(tasks => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById('task-name').value = task.name;
                document.getElementById('task-zone').value = task.zone_id;
                document.getElementById('task-trade').value = task.trade_id || '';
                document.getElementById('task-start').value = task.start_date;
                document.getElementById('task-duration').value = task.duration || 1;
                document.getElementById('task-status').value = task.status || 'planned';
            }
        });
    } else {
        title.textContent = 'New Task';
        form.reset();
        document.getElementById('task-start').value = new Date().toISOString().split('T')[0];
        if (selectedZone) {
            document.getElementById('task-zone').value = selectedZone;
        }
    }
    
    // Populate dropdowns
    populateZoneDropdown();
    populateTradeDropdown();
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
    editingTask = null;
}

async function populateZoneDropdown() {
    const zones = await db.getAll('zones');
    const select = document.getElementById('task-zone');
    select.innerHTML = '<option value="">Select Zone</option>';
    
    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.id;
        option.textContent = zone.name;
        select.appendChild(option);
    });
}

async function populateTradeDropdown() {
    const trades = await db.getAll('trades');
    const select = document.getElementById('task-trade');
    select.innerHTML = '<option value="">No Trade</option>';
    
    trades.forEach(trade => {
        const option = document.createElement('option');
        option.value = trade.id;
        option.textContent = trade.name;
        select.appendChild(option);
    });
}

// Event listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('btn-new-task').addEventListener('click', () => openTaskModal());
    document.getElementById('btn-import').addEventListener('click', importData);
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-clear').addEventListener('click', clearAllData);
    
    // Toolbar
    document.getElementById('view-type').addEventListener('change', (e) => {
        scheduler.viewType = e.target.value;
        scheduler.update();
    });
    
    document.getElementById('days-count').addEventListener('change', (e) => {
        scheduler.days = parseInt(e.target.value);
        scheduler.update();
    });
    
    document.getElementById('zoom-level').addEventListener('input', (e) => {
        scheduler.cellWidth = parseInt(e.target.value);
        scheduler.update();
    });
    
    // Task form
    document.getElementById('task-form').addEventListener('submit', saveTask);
    
    // Modal close on background click
    document.getElementById('task-modal').addEventListener('click', (e) => {
        if (e.target.id === 'task-modal') {
            closeModal();
        }
    });
    
    // File input
    document.getElementById('file-input').addEventListener('change', handleFileImport);
}

// Save task
async function saveTask(e) {
    e.preventDefault();
    
    const task = {
        name: document.getElementById('task-name').value,
        zone_id: parseInt(document.getElementById('task-zone').value),
        trade_id: parseInt(document.getElementById('task-trade').value) || null,
        start_date: document.getElementById('task-start').value,
        duration: parseInt(document.getElementById('task-duration').value),
        status: document.getElementById('task-status').value
    };
    
    if (editingTask) {
        task.id = editingTask;
        await db.update('tasks', task);
    } else {
        await db.add('tasks', task);
    }
    
    await loadTasks();
    closeModal();
}

// Import/Export functions
async function exportData() {
    const data = await db.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `takt-visualiser-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('file-input').click();
}

async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            await db.importData(data);
            await loadZones();
            await loadTrades();
            await loadTasks();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        await db.clearAll();
        await loadZones();
        await loadTrades();
        await loadTasks();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
