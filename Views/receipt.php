<?php
require __DIR__ . '/../app/auth.php';
require_login_fragment();
?>
<!-- Receipt Tab View -->
<h1 class="">New Receipt</h1>

<!-- Validation Alert Banner -->
<div id="validation-error" style="background:var(--error-container);"
    class="hidden error-text">
    Please fill out all required fields.
</div>
<div class="flex-v flex-between" style="height: 100%;">
    <div class="max-w-5xl">
        <div class="flex-v h-8">
            <div class="flex p1 bold">
                <div class="col-span-2">Actions</div>
                <div class="col-span-2 text-left">PID</div>
                <div class="col-span-2 text-left pl-4">Item Name</div>
                <div class="col-span-2 text-left pl-4">Description</div>
                <div class="col-span-2 text-center">Qty</div>
                <div class="col-span-1 text-center">UP</div>
                <div class="col-span-2 text-right pr-4">Total(XAF)</div>
            </div>
            <hr>
        </div>
        <div id="receipt-rows-container" class="space-y-4 mb-8">
        </div>
        <div class="flex-v h-8">
            <hr>
            <div class="flex-between px-1">
                <h4 class="bold">Total</h4>
                <h4 class="bold" id="grand-total">0</h4>

            </div>
            <div class="mb-8 max-w-sm">
                <p class="p1 bold" style="color: var(--dark-green); margin-bottom: 8px;">
                    <span style="color: var(--error-text);">*</span>Customer Name
                </p>
                <input type="text" placeholder="Mengue Frederick" class="input-name" id="customer-name" />
            </div>
        </div>
    </div>
    <div>

        <div class="flex-between" style="margin-top: 12px;">
            <button type="button" class="button-secondary" onclick="printReceipt()">
                <img src="img/printer.svg" alt="" style="width: 20px;">
                Print receipt
            </button>
            <button type="button" class="btn-cancel" onclick="resetForm()">
                Cancel
            </button>
        </div>
    </div>
</div>

<!-- Save-after-print confirmation modal -->
<div id="saveOrderModal" class="modal">
    <div class="modal-content modal-sm">
        <div class="flex-between mb-2">
            <h2>Save Order</h2>
            <span class="close-modal" onclick="dismissSaveOrderModal()">&times;</span>
        </div>
        <p>Save this receipt as an order? This will record the sale and update stock levels.</p>
        <div class="modal-actions">
            <button type="button" class="btn btn-cancel" onclick="dismissSaveOrderModal()">Discard</button>
            <button type="button" id="confirmSaveOrderBtn" class="btn-primary" onclick="confirmSaveOrder()">Save</button>
        </div>
    </div>
</div>
