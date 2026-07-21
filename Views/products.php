<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require __DIR__ . '/../app/helpers.php';
require_login_fragment();

$items = allItems($db);
?>
<div class="flex-between mb-2">
    <h1>Products</h1>
    <button id="add-product-btn" class="btn-primary" type="button">
        <div><img src="img/Add-dark-green.svg" alt="" /></div>
        <h4>Add Product</h4>
    </button>
</div>

<div class="table-container">
    <table class="items-table p1">
        <thead>
            <tr>
                <th>Product</th>
                <th>CP</th>
                <th>Wholesale 1 (&gt;200)</th>
                <th>Wholesale 2 (&gt;100)</th>
                <th>Retail</th>
                <th>In Stock</th>

            <th class="text-center">Actions</th>
            </tr>
        </thead>
        <tbody id="items-body">
            <?php if (empty($items)): ?>
            <tr><td colspan="7">No products yet. Click "Add Product" to create one.</td></tr>
            <?php else: foreach ($items as $it): ?>
            <tr data-id="<?= htmlspecialchars($it['pid']) ?>" data-description="<?= htmlspecialchars($it['description']) ?>" data-image="<?= htmlspecialchars($it['image_path'] ?? '') ?>">
                <td>
                    <div class="flex h-16 item-cell">
                          <div class="item-avatar-wrapper">
                            <?php if (!empty($it['image_path'])): ?>
                            <div class="item-avatar" style="background-image: url('<?= htmlspecialchars($it['image_path']) ?>'); background-size: cover; background-position: center;"></div>
                            <?php else: ?>
                            <div class="item-avatar default-avatar"><i class="fa-solid fa-image"></i></div>
                            <?php endif; ?>
                        </div>
                        <div class="flex-v">
                            <p class="p1 bold item-name"><?= htmlspecialchars($it['name']) ?></p>
                            <p class="p1 item-code"><?= htmlspecialchars($it['pid']) ?></p>
                   </div>
                   </div>
                </td>
                <td class="p1 numeric-val"><?= number_format($it['cp'], 2) ?></td>
                <td class="p1 numeric-val"><?= number_format($it['wholesale1'], 2) ?></td>
                <td class="p1 numeric-val"><?= number_format($it['wholesale2'], 2) ?></td>
                <td class="p1 numeric-val"><?= number_format($it['retail'], 2) ?></td>
                <td class="p1 numeric-val"><?= number_format($it['in_stock'], 2) ?></td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" title="Edit"><img src="img/Edit Group.svg" alt=""></button>
                        <button class="action-btn delete-btn" title="Delete"><img src="img/trash-red.svg" alt=""></button>
                        <div class="dropdown-container">
                            <button class="action-btn more-btn"><img src="img/dots.svg" alt=""></button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item details-option"><img src="img/eye.svg" alt=""> Details</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
            <?php endforeach; endif; ?>
        </tbody>
    </table>
</div>


<div id="editModal" class="modal">
    <div class="modal-content">
        <div class="flex-between mb-2">
            <h2 id="editModalTitle">Edit Product</h2>
            <span class="close-modal">&times;</span>
        </div>
        <form id="editForm" enctype="multipart/form-data">
            <input type="hidden" id="editItemRowId">
            <input type="hidden" id="editExistingImage">
            <div class="form-group">
                <label class="field-label" for="itemImageInput">Product Image</label>
                <div class="image-preview-container">
                    <div id="editImgPreview" class="item-avatar default-avatar"><i class="fa-solid fa-image"></i></div>
                    <div class="upload-btn-wrapper">
                        <button type="button" class="btn btn-secondary btn-sm-upload">Choose Image</button>
                        <input type="file" id="itemImageInput" accept="image/png,image/jpeg,image/gif,image/webp">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="editName">Product Name</label>
                <input class="input-form" type="text" id="editName" required>
            </div>
            <div class="form-group">
                <label for="editCode">Product Code</label>
                <input class="input-form" type="text" id="editCode" required>
            </div>
            <div class="form-group">
                <label for="editDescription">Unit / Description</label>
                <input class="input-form" type="text" id="editDescription" placeholder="e.g. bag, kg">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editCP">Cost Price (CP)</label>
                    <input class="input-form" type="number" step="0.01" id="editCP" required>
                </div>
                <div class="form-group">
                    <label for="editRetail">Retail Price</label>
                    <input class="input-form" type="number" step="0.01" id="editRetail" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editWholesale1">Wholesale 1 (&gt;200)</label>
                    <input class="input-form" type="number" step="0.01" id="editWholesale1" required>
                </div>
                <div class="form-group">
                    <label for="editWholesale2">Wholesale 2 (&gt;100)</label>
                    <input class="input-form" type="number" step="0.01" id="editWholesale2" required>
                </div>
            </div>
            <div class="form-group">
                <label for="editStock">In Stock</label>
                <input class="input-form" type="number" step="0.01" id="editStock" required>
            </div>
            <div id="editFormError" class="hidden" style="color: var(--error-text, red); margin-bottom: 8px;"></div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary close-btn btn-cancel">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<div id="deleteModal" class="modal">
    <div class="modal-content modal-sm">
        <div class="flex-between">
            <h2>Delete Product</h2>
            <span class="close-modal">&times;</span>
        </div>
        <p>Are you sure you want to delete <strong id="deleteItemName">this product</strong>? This action cannot be undone.</p>
        <div id="deleteFormError" class="hidden" style="color: var(--error-text, red); margin-bottom: 8px;"></div>
        <div class="modal-actions">
            <button type="button" id="confirmDeleteBtn" class="text-btn"><h4 class="color-error-text">Delete</h4></button>
            <button type="button" class="btn-primary close-btn btn-cancel">Cancel</button>
        </div>
    </div>
</div>

<div id="detailsModal" class="modal">
    <div class="modal-content">
        <div class="flex-between mb-2">
            <h2>Product Details</h2>
            <span class="close-modal">&times;</span>
        </div>
        <div class="details-body">
            <div class="details-profile">
                <div class="large-avatar"></div>
                <div>
                    <h3 id="detName">Groundnut</h3>
                    <p id="detCode">Code: GD12</p>
                </div>
            </div>
            <hr class="divider">
            <div class="details-grid">
                <div class="detail-block"><span>Cost Price:</span> <strong id="detCP">1000</strong></div>
                <div class="detail-block"><span>Retail Price:</span> <strong id="detRetail">1300</strong></div>
                <div class="detail-block"><span>Wholesale 1 (&gt;200):</span> <strong id="detW1">1100</strong></div>
                <div class="detail-block"><span>Wholesale 2 (&gt;100):</span> <strong id="detW2">1200</strong></div>
                <div class="detail-block"><span>Current Stock:</span> <strong id="detStock" class="stock-badge">100</strong></div>
            </div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary close-btn btn-cancel">Close</button>
        </div>
    </div>
</div>
