<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require __DIR__ . '/../app/helpers.php';
require_login_fragment();

$items = allItems($db);
const LOW_STOCK_THRESHOLD = 20;
?>

<main class="main-content">
    <header class="content-header">
        <h1 id="page-title">Stock</h1>
        <button id="btn-record-stock" class="btn-primary">
         <div><img src="img/Add-dark-green.svg" alt="New Stock" /></div>Record Stock
        </button>
    </header>

    <div id="stock-list-view" class="view-container">
        <div class="table-container">
            <table class="stock-table p1">
                <tbody>
                    <tr>
                        <td class="p1 bold">PID</td>
                        <td class="p1 bold">Item Name</td>
                        <td class="p1 bold">Description</td>
                        <td class="p1 bold">In Stock</td>
                    </tr>
                    <?php if (empty($items)): ?>
                    <tr><td colspan="4">No products yet.</td></tr>
                    <?php else: foreach ($items as $it): ?>
                    <tr>
                        <td><?= htmlspecialchars($it['pid']) ?></td>
                        <td><?= htmlspecialchars($it['name']) ?></td>
                        <td><?= htmlspecialchars($it['description']) ?></td>
                        <td class="<?= $it['in_stock'] <= LOW_STOCK_THRESHOLD ? 'alert-text bold' : '' ?>"><?= number_format($it['in_stock']) ?></td>
                    </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div id="record-stock-view" class="view-container hidden">
        <div class="card-24">
            <h4 class="flex h-16 bold align-center">
                <div class="icon">
      <img src="img/donut-small.svg" alt="Stock-photo" />
    </div>
                Product Information
            </h4>

            <hr class="form-divider">

            <form id="stock-entry-form">
                <div class="form-row-inline">
                    <div class="form-group size-id">
                        <label class="p2 bold">ITEM ID</label>
                        <div class="select-wrapper">
                            <select class="form-control p1" id="stock-item-select" required>
                                <option value="" selected disabled>Select ID</option>
                                <?php foreach ($items as $it): ?>
                                <option value="<?= htmlspecialchars($it['pid']) ?>"><?= htmlspecialchars($it['pid']) ?> &mdash; <?= htmlspecialchars($it['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="form-group size-qty">
                        <label class="p2 bold">QTY</label>
                        <input type="number" min="1" id="record-stock-input" class="form-control p1 bold text-center" value="1">
                    </div>
                </div>

                <div class="form-group">
                    <label class="p2 bold">SUPPLIER</label>
                    <input type="text" id="record-stock-supplier" class="form-control p1" placeholder="Provide Supplier">
                </div>

                <div class="form-group">
                    <label class="p2 bold">DESCRIPTION</label>
                    <textarea id="record-stock-description" class="form-control p1" rows="5" placeholder="Description"></textarea>
                </div>

                <div id="stock-form-error" class="hidden" style="color: var(--error-text, red); margin-bottom: 8px;"></div>

                <div class="flex-between form-actions">
                    <button type="submit" class="btn-primary">
                        Save
                    </button>
                    <button type="button" id="btn-cancel" class="btn-cancel">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</main>
