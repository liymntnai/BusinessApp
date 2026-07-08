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
    }
}

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

loadDashboard()

// Mock Database Object
const productDatabase = {
    "RdCn": { name: "Red Corn", desc: "bag", up: 4000 },
    "WhCn": { name: "White Corn", desc: "bag", up: 4200 },
    "YlCn": { name: "Yellow Corn", desc: "bag", up: 3800 },
    "SgBr": { name: "Sugar Brown", desc: "kg", up: 800 }
};

function loadReceipt() {


    // Set static date dynamic fallback matching 2026 timeline
    document.getElementById('slip-date').textContent = new Date().toISOString().split('T')[0];
    addRow(); // Row initializes cleanly completely unselected

}
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Add row directly to table management
function addRow() {
    const tbody = document.getElementById('receipt-rows-container');
    const rowId = 'row_' + Math.random().toString(36).substr(2, 9);
    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.className = "flex align-center";

    let pidOptions = `<option value="" selected disabled>-- Select --</option>`;
    for (let key in productDatabase) {
        pidOptions += `<option value="${key}">${key}</option>`;
    }

    tr.innerHTML = `
                <td class="flex h-8 col-span-2">
                    <button onclick="addRow()" class="btn-add el">
                     <img src="img/Add-green.svg" alt="add-green">
                     </button>
                    <button onclick="deleteRow('${rowId}')" class="btn-delete el">
                     <img src="img/trash-red.svg" alt="trash-red">
                     </button>
                </td>
                <td class="col-span-2 text-left pid-select">
                    <select onchange="handlePidChange('${rowId}', this.value)" class="pid-select">
                        ${pidOptions}
                    </select>
                </td>
                <td class="item-name col-span-2 text-left px-1 bold" style="color: var(--dark-gray);">—</td>
                <td class="item-desc col-span-2 text-left px-1 bold" style="color: var(--dark-gray);">—</td>
                <td class="col-span-2 flex-center text-center">
                    <input type="number" min="1" value="1" oninput="calculateRowTotal('${rowId}')" class="qty-input">
                </td>
                <td class="item-up col-span-1 text-center" style="color: var(--dark-gray);">0</td>
                <td class="item-total col-span-2 text-right px-1" style="color: var(--dark-green);">0</td>
            `;

    tbody.appendChild(tr);
}

function deleteRow(rowId) {
    const tbody = document.getElementById('receipt-rows-container');
    if (tbody.children.length > 1) {
        document.getElementById(rowId).remove();
        calculateGrandTotal();
    }
}

// Database autocomplete assignment logic
function handlePidChange(rowId, pid) {
    const row = document.getElementById(rowId);
    const nameEl = row.querySelector('.item-name');
    const descEl = row.querySelector('.item-desc');
    const upEl = row.querySelector('.item-up');

    if (pid && productDatabase[pid]) {
        const item = productDatabase[pid];
        nameEl.textContent = item.name;
        nameEl.classList.remove('text-gray-400');
        descEl.textContent = item.desc;
        descEl.classList.remove('text-gray-400');
        upEl.textContent = formatNumber(item.up);
        upEl.classList.remove('text-gray-400');

        row.dataset.up = item.up;
        row.dataset.name = item.name;
        row.dataset.desc = item.desc;
    } else {
        nameEl.textContent = "—";
        nameEl.classList.add('text-gray-400');
        descEl.textContent = "—";
        descEl.classList.add('text-gray-400');
        upEl.textContent = "0";
        upEl.classList.add('text-gray-400');

        row.dataset.up = 0;
        row.removeAttribute('data-name');
    }
    calculateRowTotal(rowId);
}

function calculateRowTotal(rowId) {
    const row = document.getElementById(rowId);
    const qty = parseInt(row.querySelector('input[type="number"]').value) || 0;
    const up = parseFloat(row.dataset.up) || 0;

    const total = qty * up;
    row.querySelector('.item-total').textContent = formatNumber(total);
    row.dataset.total = total;

    calculateGrandTotal();
}

function calculateGrandTotal() {
    const grandTotalEl = document.getElementById('grand-total');
    let grandTotal = 0;
    document.getElementById('receipt-rows-container').querySelectorAll('tr').forEach(row => {
        grandTotal += parseFloat(row.dataset.total) || 0;
    });
    grandTotalEl.textContent = formatNumber(grandTotal);
}

// Validates constraints and maps items to the hidden layout
function buildReceiptPrintTemplate() {
    const tbody = document.getElementById('receipt-rows-container');
    const errorBanner = document.getElementById('validation-error');
    errorBanner.classList.add('hidden'); // Clear error state

    const customerName = document.getElementById('customer-name').value.trim();

    // Validation 1: Check Customer Name
    if (!customerName) {
        errorBanner.textContent = "Verification Failed: Customer Name is required.";
        errorBanner.classList.remove('hidden');
        return null;
    }

    const slipItemsContainer = document.getElementById('slip-items');
    slipItemsContainer.innerHTML = '';

    let grandTotal = 0;
    let validProductCount = 0;
    const structuredArray = [];

    tbody.querySelectorAll('tr').forEach(row => {
        const pid = row.querySelector('select').value;
        if (!pid || !row.dataset.name) return;

        validProductCount++;
        const qty = parseInt(row.querySelector('input[type="number"]').value) || 0;
        const up = parseFloat(row.dataset.up) || 0;
        const total = qty * up;
        grandTotal += total;

        structuredArray.push({ pid, qty, up, total });

        const itemLine = document.createElement('div');
        itemLine.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>${row.dataset.name.toUpperCase()}</span>
                        <span>${formatNumber(total)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #444; padding-left: 8px;">
                        <span>${qty} ${row.dataset.desc} x XAF ${formatNumber(up)}</span>
                    </div>
                `;
        slipItemsContainer.appendChild(itemLine);
    });

    // Validation 2: Ensure at least one actual product selection was matched
    if (validProductCount === 0) {
        errorBanner.textContent = "Verification Failed: You must select at least one valid product.";
        errorBanner.classList.remove('hidden');
        return null;
    }

    document.getElementById('slip-customer').textContent = customerName;
    document.getElementById('slip-grand-total').textContent = formatNumber(grandTotal);
    return structuredArray;
}

function printReceipt() {
    const dataLog = buildReceiptPrintTemplate();

    // If validation fails (returns null), intercept execution
    if (!dataLog) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    console.log("Captured Dynamic Array Structured Log: ", dataLog);
    
    // Small delay to ensure DOM is updated before printing
    setTimeout(() => {
        window.print();
    }, 100);
}

function resetForm() {
    const tbody = document.getElementById('receipt-rows-container');
    const errorBanner = document.getElementById('validation-error');
    errorBanner.classList.add('hidden');
    tbody.innerHTML = '';
    document.getElementById('customer-name').value = "";
    addRow();
    calculateGrandTotal();
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
function loadSettings() {
    const editUsername = document.getElementById("change-username")
    const btnCancelUsername = document.getElementById('btn-cancel--username')
    const usernameForm = document.getElementById("form-edit-username")

    const editPassword = document.getElementById("change-password")
    const passwordForm = document.getElementById("form-edit-password")
    const btnCancelPassword = document.getElementById('btn-cancel--password')

    editUsername.addEventListener('click', function () {
        usernameForm.style.display = 'flex'
        editUsername.style.display = 'none'
    })
    btnCancelUsername.addEventListener('click', function () {
        usernameForm.style.display = 'none'
        editUsername.style.display = 'flex'
    })
    editPassword.addEventListener('click', function () {
        passwordForm.style.display = 'flex'
        editPassword.style.display = 'none'
    })
    btnCancelPassword.addEventListener('click', function () {
        passwordForm.style.display = 'none'
        editPassword.style.display = 'flex'
    })

}
function openform() {

}
/** */

/****Stock page view */
function loadStock() {

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
function loadItems() {

    // Current Active Row tracking DOM element 
    let activeRow = null;

    let tempImageDataUrl = null; // Temp holder for uploaded image data

    // Modals
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const detailsModal = document.getElementById("detailsModal");

    // Form inputs
    const editForm = document.getElementById("editForm");
    const editItemRowId = document.getElementById("editItemRowId");
    const editName = document.getElementById("editName");
    const editCP = document.getElementById("editCP");
    const editCode = document.getElementById("editCode");
    const editRetail = document.getElementById("editRetail");
    const editWholesale1 = document.getElementById("editWholesale1");
    const editWholesale2 = document.getElementById("editWholesale2");
    const editStock = document.getElementById("editStock");
    const itemImageInput = document.getElementById("itemImageInput");
    const editImgPreview = document.getElementById("editImgPreview");

    // Close buttons handlers
    document.querySelectorAll(".close-modal, .close-btn, .btn-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
            tempImageDataUrl = null; // Clear chosen image state
        });
    });

    // Close modal if user clicks outside content panel
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.classList.remove("show");
            tempImageDataUrl = null;
        }
        // Dismiss dropdown menus when clicking elsewhere
        if (!e.target.closest(".dropdown-container")) {
            document.querySelectorAll(".dropdown-menu").forEach(d => d.classList.remove("show"));
        }
    });
    // File input change detection logic
    itemImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                tempImageDataUrl = e.target.result;
                // Render preview inside modal
                editImgPreview.style.backgroundImage = `url('${tempImageDataUrl}')`;
                editImgPreview.classList.remove("default-avatar");
                editImgPreview.innerHTML = ""; // Strip inner icon
            }
            reader.readAsDataURL(file);
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
        const itemCode = row.querySelector(".item-code").innerText;
        const cells = row.querySelectorAll(".numeric-val");

        // Extract plain numeric metrics

        const itemCP = cells[0].innerText;
        const itemW1 = cells[1].innerText;
        const itemW2 = cells[2].innerText;
        const itemRetail = cells[3].innerText;
        const itemStock = cells[4].innerText;

        // Get row image if custom image exists
        const rowAvatar = row.querySelector(".item-avatar");
        const existingAvatarImage = rowAvatar.querySelector("img");
        let currentImg = rowAvatar.style.backgroundImage;

        if (!currentImg && existingAvatarImage) {
            currentImg = `url('${existingAvatarImage.src}')`;
        }
        // 1. Edit Action triggered
        if (target.closest(".edit-btn")) {
            editItemRowId.value = rowId;
            editName.value = itemName;
            editCode.value = itemCode;
            editCP.value = itemCP;
            editWholesale1.value = itemW1;
            editWholesale2.value = itemW2;
            editRetail.value = itemRetail;
            editStock.value = itemStock;


            if (currentImg) {
                editImgPreview.style.backgroundImage = currentImg;
                editImgPreview.classList.remove("default-avatar");
                editImgPreview.innerHTML = "";
                tempImageDataUrl = currentImg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            } else {
                editImgPreview.style.backgroundImage = "";
                editImgPreview.classList.add("default-avatar");
                editImgPreview.innerHTML = '<i class="fa-solid fa-image"></i>';
                tempImageDataUrl = null;
            }

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
                if (d !== row.querySelector(".dropdown-menu")) d.classList.remove("show");
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

            const detImgWrapper = document.getElementById("detImgWrapper");
            if (currentImg) {
                detImgWrapper.innerHTML = `<div class="large-avatar" style="background-image: ${currentImg}"></div>`;
            } else {
                detImgWrapper.innerHTML = `<div class="large-avatar default-avatar"><i class="fa-solid fa-image"></i></div>`;
            }
            detailsModal.classList.add("show");
            target.closest(".dropdown-menu").classList.remove("show");
        }
    });

    // Save Edit Form alterations back to local DOM row values
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (activeRow) {
            activeRow.querySelector(".item-name").innerText = editName.value;
            activeRow.querySelector(".item-code").innerText = editCode.value;
            const cells = activeRow.querySelectorAll(".numeric-val");
            cells[0].innerText = editCP.value;
            cells[1].innerText = editWholesale1.value;
            cells[2].innerText = editWholesale2.value;
            cells[3].innerText = editRetail.value;
            cells[4].innerText = editStock.value;

            // Apply new image data value back to targeted row avatar block
            const rowAvatar = activeRow.querySelector(".item-avatar");
            if (tempImageDataUrl) {
                rowAvatar.style.backgroundImage = `url('${tempImageDataUrl}')`;
                rowAvatar.style.backgroundSize = "cover";
                rowAvatar.style.backgroundPosition = "center";
                rowAvatar.style.backgroundRepeat = "no-repeat";
                rowAvatar.classList.remove("default-avatar");
                rowAvatar.innerHTML = "";
            }
        }
        editModal.classList.remove("show");
        tempImageDataUrl = null;
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