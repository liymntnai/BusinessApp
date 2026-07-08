'use strict';    
async function loadDashboard() {
        
    try {
        const response = await fetch(`dashboard.html`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        
        // 3. Inject it straight into your content window container
        document.querySelector('.board').innerHTML = html;
        syncDashboard('today');
    } catch (error) {
        document.querySelector('.board').innerHTML = `<h2>Error loading page</h2>`;
}} 

async function loadTabContent(tabName, element) {
    // 1. Handle active states for sidebar navigation links
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // 2. Fetch the large piece of code/markup from an external file
    try {
        const response = await fetch(`${tabName}.html`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        
        // 3. Inject it straight into your content window container
        document.querySelector('.board').innerHTML = html;
          // Deciding which script tab to load based on the tabName
    switch (tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        // Add more cases for other tabs if needed
        case 'settings':
            loadSettings();
            break;
        case 'receipt':
            loadReceipt();
            break;
        case 'orders':
            // loadOrders();
            break;
        case 'stock':
            loadStock();
            break;  
        case 'items':
            loadItems();
            break;                 
        default:
            alert(`No script found for tab: ${tabName}`);
    }


    } catch (error) {
        console.log(error)
        document.querySelector('.board').innerHTML = `<h2>Error loading page</h2>`;
    }

  
}

// Mock database for receipt items
const mockDatabase = {
    "RdCn": { name: "Red Corn", up: 4000 },
    "G12": { name: "Groundnut", up: 2000 },
    "WtCn": { name: "White Corn", up: 8000 }
};

// Master Application Data Array Storage
let receiptData = [];

// Global receipt UI state
let container, debugOutput, grandTotalDisplay;

// Initialize receipt container references
function initializeReceiptUI() {
    container = document.getElementById('receipt-rows-container');
    debugOutput = document.getElementById('array-debug');
    grandTotalDisplay = document.getElementById('grand-total');
    
    if (container) {
        addNewRow();
    }
}

// Dynamic element appending
function addNewRow() {
    if (!container) return;
    
    const rowId = 'row_' + Date.now() + Math.floor(Math.random() * 1000);
    const rowElement = document.createElement('div');
    rowElement.id = rowId;
    rowElement.className = "flex center px-1 py-1 transition-all p1-bold";
    rowElement.innerHTML = `
        <div class="col-span-2 flex">
            <button type="button" onclick="addNewRow()" class="btn-add el">
               <img src="img/Add-green.svg" alt="add-green">
            </button>
            <button type="button" onclick="deleteRow('${rowId}')" class="btn-delete el">
                <img src="img/trash-red.svg" alt="add-green">
            </button>
        </div>
        <div class="col-span-2 flex-center text-left">
            <select onchange="updateRowData('${rowId}')" class="pid-select">
                <option value="">Select</option>
                <option value="RdCn">RdCn</option>
                <option value="G12">G12</option>
                <option value="WtCn">WtCn</option>
            </select>
        </div>
        <div class="item-name col-span-2 text-left px-1 bold" style="color: var(--light-gray);">-</div>
        <div class="col-span-2 flex-center text-center">
            <input type="number" min="1" value="1" oninput="updateRowData('${rowId}')" class="qty-input " />
        </div>
        <div class="unit-price col-span-1 text-center" style="color: var(--dark-gray);">-</div>
        <div class="total-price col-span-2 text-right px-1" style="color: var(--dark-green);">-</div>
    `;

    container.appendChild(rowElement);
    updateStateArray();
}

// Element subtraction 
function deleteRow(rowId) {
    if (!container) return;
    
    const rows = container.querySelectorAll(':scope > div');
    if (rows.length > 1) {
        document.getElementById(rowId).remove();
        updateStateArray();
    } else {
        alert("The system requires at least one active item entry line.");
    }
}

// Processing auto-complete states and structural mutations
function updateRowData(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const pidValue = row.querySelector('.pid-select').value;
    const qtyValue = parseInt(row.querySelector('.qty-input').value) || 1;
    
    const nameTarget = row.querySelector('.item-name');
    const upTarget = row.querySelector('.unit-price');
    const totalTarget = row.querySelector('.total-price');

    if (pidValue && mockDatabase[pidValue]) {
        const product = mockDatabase[pidValue];
        
        nameTarget.textContent = product.name;
        nameTarget.style.color = "var(--dark-gray)";

        upTarget.textContent = product.up.toLocaleString();
        totalTarget.textContent = (product.up * qtyValue).toLocaleString();
    } else {
        nameTarget.textContent = "-";
        nameTarget.style.color = "var(--light-gray)";
        upTarget.textContent = "-";
        totalTarget.textContent = "-";
    }
     updateStateArray();
}

// Collecting visual data directly back to clean Array layout layouts & computing totals
function updateStateArray() {
    if (!container) return;
    
    const rows = container.querySelectorAll(':scope > div');
    receiptData = [];
    let totalAccumulator = 0;

    rows.forEach(row => {
        const pid = row.querySelector('.pid-select').value;
        const qty = parseInt(row.querySelector('.qty-input').value) || 1;
        const name = row.querySelector('.item-name').textContent;
        const up = row.querySelector('.unit-price').textContent;
        const total = row.querySelector('.total-price').textContent;

        const numericTotal = total !== '-' ? parseInt(total.replace(/,/g, '')) : 0;
        totalAccumulator += numericTotal;

        receiptData.push([
            pid || null, 
            qty, 
            name !== '-' ? name : null, 
            up !== '-' ? parseInt(up.replace(/,/g, '')) : 0, 
            numericTotal
        ]);
    });

    // Re-render calculated summary balances straight to screen
    if (grandTotalDisplay) {
        grandTotalDisplay.textContent = totalAccumulator.toLocaleString();
    }
    if (debugOutput) {
        debugOutput.textContent = JSON.stringify(receiptData, null, 4);
    }
}

loadDashboard()

const loadReceipt = function(){
    initializeReceiptUI();
}

 // Mock dataset mapped across timeframes (with clear test figures for 'today')
const dataset = {
    today: { orders: 18, gross: 256000, expenses: 100000 },
    week: { orders: 112, gross: 1450000, expenses: 420000 },
    month: { orders: 401, gross: 8900000, expenses: 2300000 },
    year: { orders: 5120, gross: 3105000000, expenses: 950000000 }
};

/**
 * Formats numeric metrics safely into clean target strings.
 * Scales seamlessly across thousands, millions, and billions thresholds.
 */
function parseBusinessAbbreviation(value) {
    if (value >= 1e9) {
        return (value / 1e9).toFixed(3).replace(/\.?0+$/, '') + 'B';
    }
    if (value >= 1e6) {
        return (value / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
    }
    // Fallback default formatting layout
    return value.toLocaleString('en-US');
}

/**
 * Main UI synchronization method execution routine
 */
function syncDashboard(timeframe) {
    // Re-sync all individual selects to show matching time selections
    const pickers = document.querySelectorAll('.time-select');
    pickers.forEach(picker => picker.value = timeframe);

    const activeData = dataset[timeframe];
    const computationalNetProfit = activeData.gross - activeData.expenses;

    // Direct DOM Updates
    document.getElementById('val-orders').innerText = activeData.orders.toLocaleString('en-US');
    document.getElementById('val-gross').innerText = parseBusinessAbbreviation(activeData.gross);
    document.getElementById('val-expenses').innerText = parseBusinessAbbreviation(activeData.expenses);
    document.getElementById('val-net').innerText = parseBusinessAbbreviation(computationalNetProfit);
}

// Initialize directly into 'today' dataset view layout
/***Settings page */
function loadSettings(){
    const editUsername = document.getElementById("change-username")
    const btnCancelUsername = document.getElementById('btn-cancel--username')
    const usernameForm = document.getElementById("form-edit-username")
    
    const editPassword = document.getElementById("change-password")
    const passwordForm = document.getElementById("form-edit-password")
    const btnCancelPassword = document.getElementById('btn-cancel--password')

    editUsername.addEventListener('click', function(){
        usernameForm.style.display = 'flex'
        editUsername.style.display = 'none'
    })
    btnCancelUsername.addEventListener('click', function(){
        usernameForm.style.display = 'none'
        editUsername.style.display = 'flex'
    })
    editPassword.addEventListener('click', function(){
        passwordForm.style.display = 'flex'
        editPassword.style.display = 'none'
    })
    btnCancelPassword.addEventListener('click', function(){
        passwordForm.style.display = 'none'
        editPassword.style.display = 'flex'
    })

}
function openform(){

}
/** */

/****Stock page view */
function loadStock(){

    const btnRecordStock = document.querySelector('#btn-record-stock');
    const btnCancel = document.getElementById('btn-cancel');
    const stockListView = document.getElementById('stock-list-view');
    const recordStockView = document.getElementById('record-stock-view');
    const pageTitle = document.getElementById('page-title');

        btnRecordStock.addEventListener('click', () => {
            stockListView.classList.add('hidden');
            recordStockView.classList.remove('hidden');
            pageTitle.textContent = 'Record Stock';
            btnRecordStock.disabled = true;
        });

        btnCancel.addEventListener('click', () => {
            recordStockView.classList.add('hidden');
            stockListView.classList.remove('hidden');
            pageTitle.textContent = 'Stock';
            btnRecordStock.disabled = false;
        });
}

//*****ITEMS page */
function loadItems(){

    // Current Active Row tracking DOM element 
    let activeRow = null;
    
    // Modals
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const detailsModal = document.getElementById("detailsModal");

    // Form inputs
    const editForm = document.getElementById("editForm");
    const editItemRowId = document.getElementById("editItemRowId");
    const editName = document.getElementById("editName");
    const editCP = document.getElementById("editCP");
    const editRetail = document.getElementById("editRetail");
    const editWholesale1 = document.getElementById("editWholesale1");
    const editWholesale2 = document.getElementById("editWholesale2");
    const editStock = document.getElementById("editStock");

    // Close buttons handlers
    document.querySelectorAll(".close-modal, .close-btn, .btn-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
        });
    });

    // Close modal if user clicks outside content panel
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.classList.remove("show");
        }
        // Dismiss dropdown menus when clicking elsewhere
        if (!e.target.closest(".dropdown-container")) {
            document.querySelectorAll(".dropdown-menu").forEach(d => d.classList.remove("show"));
        }
    });

    // Handle Actions inside Items table body directly via event delegation
    const itemsBody = document.getElementById("items-body");
    
    itemsBody.addEventListener("click", (e) => {
        const target = e.target;
        const row = target.closest("tr");
        if (!row) return;

        activeRow = row;
        const rowId = row.getAttribute("data-id");
        const itemName = row.querySelector(".item-name").innerText;
        const cells = row.querySelectorAll(".numeric-val");
        
        // Extract plain numeric metrics
        const itemCP = cells[0].innerText;
        const itemW1 = cells[1].innerText;
        const itemW2 = cells[2].innerText;
        const itemRetail = cells[3].innerText;
        const itemStock = cells[4].innerText;

        // 1. Edit Action triggered
        if (target.closest(".edit-btn")) {
            editItemRowId.value = rowId;
            editName.value = itemName;
            editCP.value = itemCP;
            editWholesale1.value = itemW1;
            editWholesale2.value = itemW2;
            editRetail.value = itemRetail;
            editStock.value = itemStock;
            
            editModal.classList.add("show");
        }

        // 2. Delete Action triggered
        if (target.closest(".delete-btn")) {
            document.getElementById("deleteItemName").innerText = itemName;
            deleteModal.classList.add("show");
        }

        // 3. Ellipsis More Dropdown Menu toggle
        if (target.closest(".more-btn")) {
            // Close other open ones first
            document.querySelectorAll(".dropdown-menu").forEach(d => {
                if(d !== row.querySelector(".dropdown-menu")) d.classList.remove("show");
            });
            row.querySelector(".dropdown-menu").classList.toggle("show");
        }

        // 4. Embedded Details context select options
        if (target.closest(".details-option")) {
            document.getElementById("detName").innerText = itemName;
            document.getElementById("detCode").innerText = `Code: ${rowId}`;
            document.getElementById("detCP").innerText = itemCP;
            document.getElementById("detW1").innerText = itemW1;
            document.getElementById("detW2").innerText = itemW2;
            document.getElementById("detRetail").innerText = itemRetail;
            document.getElementById("detStock").innerText = itemStock;
            
            detailsModal.classList.add("show");
            target.closest(".dropdown-menu").classList.remove("show");
        }
    });

    // Save Edit Form alterations back to local DOM row values
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (activeRow) {
            activeRow.querySelector(".item-name").innerText = editName.value;
            const cells = activeRow.querySelectorAll(".numeric-val");
            cells[0].innerText = editCP.value;
            cells[1].innerText = editWholesale1.value;
            cells[2].innerText = editWholesale2.value;
            cells[3].innerText = editRetail.value;
            cells[4].innerText = editStock.value;
        }
        editModal.classList.remove("show");
    });

    // Execute absolute deletion of row reference item
    document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
        if (activeRow) {
            activeRow.remove();
            activeRow = null;
        }
        deleteModal.classList.remove("show");
    });
    
}