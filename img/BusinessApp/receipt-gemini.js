
// Mock database
        const mockDatabase = {
            "g63": { name: "Mercedes-AMG G63 Brake Pads", up: 4000 },
            "g64": { name: "Synthetic Engine Oil 5W-40", up: 2000 },
            "g65": { name: "High Performance Air Filter", up: 8000 }
        };

        // Master Application Data Array Storage
        let receiptData = [];

        const container = document.getElementById('receipt-rows-container');
        const debugOutput = document.getElementById('array-debug');
        const grandTotalDisplay = document.getElementById('grand-total');

        // Fire single baseline entry row automatically on window initialization
        // window.addEventListener('DOMContentLoaded', () => {
        //     addNewRow();
// });
        addNewRow()

        // Dynamic element appending
        function addNewRow() {
            
            const rowId = 'row_' + Date.now() + Math.floor(Math.random() * 1000);
            const rowElement = document.createElement('div');
            rowElement.id = rowId;
            rowElement.className = "grid grid-cols-12 gap-4 items-center py-1 px-2 transition-all";

            rowElement.innerHTML = `
                <div class="col-span-2 flex items-center gap-2">
                    <button type="button" onclick="addNewRow()" class="btn-add w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                        <i class="fa-solid fa-plus text-sm"></i>
                    </button>
                    <button type="button" onclick="deleteRow('${rowId}')" class="btn-delete w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </div>
                <div class="col-span-2 flex justify-center">
                    <select onchange="updateRowData('${rowId}')" class="pid-select form-input-element rounded-md px-3 py-1.5 text-sm w-24 font-medium shadow-sm">
                        <option value="">Select</option>
                        <option value="g63">g63</option>
                        <option value="g64">g64</option>
                        <option value="g65">g65</option>
                    </select>
                </div>
                <div class="item-name col-span-3 text-left pl-4 text-sm font-semibold" style="color: var(--light-gray);">-</div>
                <div class="col-span-2 flex justify-center">
                    <input type="number" min="1" value="1" oninput="updateRowData('${rowId}')" class="qty-input form-input-element w-20 text-center rounded-md py-1 px-2 text-sm font-semibold shadow-sm" />
                </div>
                <div class="unit-price col-span-1 text-center text-sm font-semibold" style="color: var(--dark-gray);">-</div>
                <div class="total-price col-span-2 text-right pr-4 text-sm font-bold" style="color: var(--dark-green);">-</div>
            `;

            container.appendChild(rowElement);
            updateStateArray();
        }

        // Element subtraction 
        function deleteRow(rowId) {
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
            grandTotalDisplay.textContent = totalAccumulator.toLocaleString();
            debugOutput.textContent = JSON.stringify(receiptData, null, 4);
        }