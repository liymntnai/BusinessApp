'use strict';


async function loadDashboard() {
    try {
        const response = await fetch(`Views/dashboard.php`);
        if (!response.ok) throw new Error('Page not found');

        const html = await response.text();
        document.querySelector('.board').innerHTML = html;
    } catch (error) {
        document.querySelector('.board').innerHTML = `<h2>Error loading page</h2>`;
    }
}

async function loadTabContent(tabName, element) {
    // 1. Handle active states for sidebar navigation links
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // 2. Fetch the server-rendered fragment for this tab
    try {
        const response = await fetch(`Views/${tabName}.php`);
        if (!response.ok) throw new Error('Page not found');

        const html = await response.text();

        // 3. Inject it straight into the content window container
        document.querySelector('.board').innerHTML = html;

        // Deciding which script to run based on the tabName
        switch (tabName) {
            case 'settings':
                loadSettings();
                break;
            case 'receipt':
                loadReceipt();
                break;
            case 'stock':
                loadStock();
                break;
            case 'products':
                loadItems();
                break;
            case 'dashboard':
            case 'orders':
                // fully server-rendered, no further JS wiring needed
                break;
            default:
                alert(`No script found for tab: ${tabName}`);
        }

    } catch (error) {
        console.log(error)
        document.querySelector('.board').innerHTML = `<h2>Error loading page</h2>`;
    }
}

async function logout() {
    try {
        await fetch('api/logout.php', { method: 'POST' });
    } catch (error) {
        // ignore network errors — still send the user back to the login page
    }
    window.location.href = 'Views/login.php';
}

loadDashboard()

// Item catalog for the receipt PID dropdown, populated from the DB by loadReceipt().
let productDatabase = {};

async function loadReceipt() {
    document.getElementById('slip-date').textContent = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch('api/items_catalog.php');
        const result = await response.json();
        productDatabase = result.items || {};
    } catch (error) {
        productDatabase = {};
    }

    addRow(); // Row initializes cleanly once the catalog is loaded
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

// Receipt lines + customer name staged between print time and the save-confirmation modal.
let pendingOrderPayload = null;

function printReceipt() {
    const dataLog = buildReceiptPrintTemplate();

    // If validation fails (returns null), intercept execution
    if (!dataLog) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    pendingOrderPayload = {
        customer_name: document.getElementById('customer-name').value.trim(),
        lines: dataLog,
    };

    // Small delay to ensure DOM is updated before printing
    setTimeout(() => {
        window.print();
        showSaveOrderModal();
    }, 100);
}

function showSaveOrderModal() {
    const modal = document.getElementById('saveOrderModal');
    if (modal) modal.classList.add('show');
}

function dismissSaveOrderModal() {
    const modal = document.getElementById('saveOrderModal');
    if (modal) modal.classList.remove('show');
    pendingOrderPayload = null;
}

async function confirmSaveOrder() {
    if (!pendingOrderPayload) return;
    const btn = document.getElementById('confirmSaveOrderBtn');
    if (btn) btn.disabled = true;

    try {
        const response = await fetch('api/save_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingOrderPayload)
        });
        const result = await response.json();

        if (result.success) {
            pendingOrderPayload = null;
            dismissSaveOrderModal();
            resetForm();
        } else {
            alert(result.error || 'Could not save order.');
        }
    } catch (error) {
        alert('Unable to reach the server.');
    } finally {
        if (btn) btn.disabled = false;
    }
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
async function syncDashboard(timeframe) {
    // Re-sync all individual selects to show matching time selections
    const pickers = document.querySelectorAll('.time-select');
    pickers.forEach(picker => picker.value = timeframe);

    try {
        const response = await fetch(`api/dashboard_stats.php?period=${encodeURIComponent(timeframe)}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to load dashboard stats');

        document.getElementById('val-orders').innerText = data.orders.toLocaleString('en-US');
        document.getElementById('val-gross').innerText = parseBusinessAbbreviation(data.gross);
        document.getElementById('val-expenses').innerText = parseBusinessAbbreviation(data.expenses);
        document.getElementById('val-net').innerText = parseBusinessAbbreviation(data.net);
    } catch (error) {
        console.log(error);
    }
}

/***Settings page */
function loadSettings() {
    const editUsername = document.getElementById("change-username")
    const btnCancelUsername = document.getElementById('btn-cancel--username')
    const usernameFormWrapper = document.getElementById("form-edit-username")
    const usernameForm = document.getElementById("username-form")
    const usernameFormError = document.getElementById("username-form-error")

    const editPassword = document.getElementById("change-password")
    const passwordFormWrapper = document.getElementById("form-edit-password")
    const passwordForm = document.getElementById("password-form")
    const btnCancelPassword = document.getElementById('btn-cancel--password')
    const passwordFormError = document.getElementById("password-form-error")

    editUsername.addEventListener('click', function () {
        usernameFormWrapper.style.display = 'flex'
        editUsername.style.display = 'none'
    })
    btnCancelUsername.addEventListener('click', function () {
        usernameFormWrapper.style.display = 'none'
        editUsername.style.display = 'flex'
    })
    editPassword.addEventListener('click', function () {
        passwordFormWrapper.style.display = 'flex'
        editPassword.style.display = 'none'
    })
    btnCancelPassword.addEventListener('click', function () {
        passwordFormWrapper.style.display = 'none'
        editPassword.style.display = 'flex'
    })

    usernameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        usernameFormError.classList.add('hidden');

        const payload = {
            action: 'username',
            new_username: document.getElementById('new-username-input').value.trim(),
            current_password: document.getElementById('username-confirm-password').value,
        };

        try {
            const response = await fetch('api/account_update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.success) {
                loadTabContent('settings', document.getElementById('settings'));
            } else {
                usernameFormError.textContent = result.error || 'Could not update username.';
                usernameFormError.classList.remove('hidden');
            }
        } catch (error) {
            usernameFormError.textContent = 'Unable to reach the server.';
            usernameFormError.classList.remove('hidden');
        }
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        passwordFormError.classList.add('hidden');

        const payload = {
            action: 'password',
            current_password: document.getElementById('current-password-input').value,
            new_password: document.getElementById('new-password-input').value,
            confirm_password: document.getElementById('confirm-new-password-input').value,
        };

        try {
            const response = await fetch('api/account_update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.success) {
                loadTabContent('settings', document.getElementById('settings'));
            } else {
                passwordFormError.textContent = result.error || 'Could not update password.';
                passwordFormError.classList.remove('hidden');
            }
        } catch (error) {
            passwordFormError.textContent = 'Unable to reach the server.';
            passwordFormError.classList.remove('hidden');
        }
    });
}

/****Stock page view */
function loadStock() {

    const btnRecordStock = document.querySelector('#btn-record-stock');
    const btnCancel = document.getElementById('btn-cancel');
    const stockListView = document.getElementById('stock-list-view');
    const recordStockView = document.getElementById('record-stock-view');
    const pageTitle = document.getElementById('page-title');
    const stockForm = document.getElementById('stock-entry-form');
    const stockFormError = document.getElementById('stock-form-error');

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

    stockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        stockFormError.classList.add('hidden');

        const payload = {
            pid: document.getElementById('stock-item-select').value,
            qty: parseFloat(document.getElementById('record-stock-input').value) || 0,
            supplier: document.getElementById('record-stock-supplier').value.trim(),
            description: document.getElementById('record-stock-description').value.trim(),
        };

        try {
            const response = await fetch('api/stock_record.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.success) {
                loadTabContent('stock', document.getElementById('stock'));
            } else {
                stockFormError.textContent = result.error || 'Could not record stock.';
                stockFormError.classList.remove('hidden');
            }
        } catch (error) {
            stockFormError.textContent = 'Unable to reach the server.';
            stockFormError.classList.remove('hidden');
        }
    });
}

//*****Products page */
function loadItems() {

    // Current Active Row tracking DOM element
    let activeRow = null;
    // File picked in the edit modal, staged until the form is actually submitted
    let pendingImageFile = null;

    // Modals
    const editModal = document.getElementById("editModal");
    const deleteModal = document.getElementById("deleteModal");
    const detailsModal = document.getElementById("detailsModal");
    const editModalTitle = document.getElementById("editModalTitle");

    // Form inputs
    const editForm = document.getElementById("editForm");
    const editItemRowId = document.getElementById("editItemRowId");
    const editExistingImage = document.getElementById("editExistingImage");
    const editName = document.getElementById("editName");
    const editCode = document.getElementById("editCode");
    const editDescription = document.getElementById("editDescription");
    const editCP = document.getElementById("editCP");
    const editRetail = document.getElementById("editRetail");
    const editWholesale1 = document.getElementById("editWholesale1");
    const editWholesale2 = document.getElementById("editWholesale2");
    const editStock = document.getElementById("editStock");
    const editFormError = document.getElementById("editFormError");
    const deleteFormError = document.getElementById("deleteFormError");
    const itemImageInput = document.getElementById("itemImageInput");
    const editImgPreview = document.getElementById("editImgPreview");

    function setImagePreview(imagePath) {
        if (imagePath) {
            editImgPreview.style.backgroundImage = `url('${imagePath}')`;
            editImgPreview.style.backgroundSize = "cover";
            editImgPreview.style.backgroundPosition = "center";
            editImgPreview.classList.remove("default-avatar");
            editImgPreview.innerHTML = "";
        } else {
            editImgPreview.style.backgroundImage = "";
            editImgPreview.classList.add("default-avatar");
            editImgPreview.innerHTML = '<i class="fa-solid fa-image"></i>';
        }
    }

    itemImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        pendingImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    });

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

    // Add Product
    document.getElementById('add-product-btn').addEventListener('click', () => {
        activeRow = null;
        editModalTitle.textContent = "Add Product";
        editForm.reset();
        editItemRowId.value = '';
        editExistingImage.value = '';
        pendingImageFile = null;
        setImagePreview(null);
        editFormError.classList.add('hidden');
        editModal.classList.add("show");
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

        // 1. Edit Action triggered
        if (target.closest(".edit-btn")) {
            editModalTitle.textContent = "Edit Product";
            editItemRowId.value = rowId;
            editName.value = itemName;
            editCode.value = itemCode;
            editDescription.value = row.dataset.description || '';
            editCP.value = itemCP;
            editWholesale1.value = itemW1;
            editWholesale2.value = itemW2;
            editRetail.value = itemRetail;
            editStock.value = itemStock;
            editExistingImage.value = row.dataset.image || '';
            pendingImageFile = null;
            setImagePreview(row.dataset.image || null);
            editFormError.classList.add('hidden');

            editModal.classList.add("show");
        }

        // 2. Delete Action triggered
        if (target.closest(".delete-btn")) {
            document.getElementById("deleteItemName").innerText = itemName;
            deleteFormError.classList.add('hidden');
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

            const detAvatar = document.querySelector("#detailsModal .large-avatar");
            if (row.dataset.image) {
                detAvatar.style.backgroundImage = `url('${row.dataset.image}')`;
                detAvatar.style.backgroundSize = "cover";
                detAvatar.style.backgroundPosition = "center";
            } else {
                detAvatar.style.backgroundImage = "";
            }

            detailsModal.classList.add("show");
            target.closest(".dropdown-menu").classList.remove("show");
        }
    });

    // Save Add/Edit form to the backend
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        editFormError.classList.add('hidden');

        const formData = new FormData();
        formData.append('original_pid', editItemRowId.value);
        formData.append('pid', editCode.value.trim());
        formData.append('name', editName.value.trim());
        formData.append('description', editDescription.value.trim());
        formData.append('cp', parseFloat(editCP.value) || 0);
        formData.append('wholesale1', parseFloat(editWholesale1.value) || 0);
        formData.append('wholesale2', parseFloat(editWholesale2.value) || 0);
        formData.append('retail', parseFloat(editRetail.value) || 0);
        formData.append('in_stock', parseFloat(editStock.value) || 0);
        if (pendingImageFile) {
            formData.append('image', pendingImageFile);
        }

        try {
            const response = await fetch('api/item_save.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                pendingImageFile = null;
                editModal.classList.remove("show");
                loadTabContent('products', document.getElementById('items'));
            } else {
                editFormError.textContent = result.error || 'Could not save product.';
                editFormError.classList.remove('hidden');
            }
        } catch (error) {
            editFormError.textContent = 'Unable to reach the server.';
            editFormError.classList.remove('hidden');
        }
    });

    // Execute deletion against the backend
    document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
        if (!activeRow) return;
        const pid = activeRow.getAttribute('data-id');
        deleteFormError.classList.add('hidden');

        try {
            const response = await fetch('api/item_delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid })
            });
            const result = await response.json();
            if (result.success) {
                activeRow.remove();
                activeRow = null;
                deleteModal.classList.remove("show");
            } else {
                deleteFormError.textContent = result.error || 'Could not delete product.';
                deleteFormError.classList.remove('hidden');
            }
        } catch (error) {
            deleteFormError.textContent = 'Unable to reach the server.';
            deleteFormError.classList.remove('hidden');
        }
    });

}
