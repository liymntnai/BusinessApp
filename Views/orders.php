<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require __DIR__ . '/../app/helpers.php';
require_login_fragment();

$orders = recentOrders($db, 50);
?>
<!-- Orders Tab View -->

  <div class="flex-between">
    <h1>Orders</h1>
  </div>
  <div class="card-24">
    <div class="flex-between align-center mb-2">
      <h3 class="color-primary">Recent</h3>
    </div>
    <table class="orders-table">
      <tr class="table-head">
        <td><p class=" p1 bold">No</p></td>
        <td><p class="p1 bold">Customer Name</p></td>
        <td><p class="p1 bold">Items</p></td>
        <td><p class="p1 bold">Amount</p></td>
        <td><p class="p1 bold">Date</p></td>
      </tr>
      <?php if (empty($orders)): ?>
      <tr class="list">
        <td colspan="5"><p class="p1">No orders yet — orders will appear here once a receipt is saved.</p></td>
      </tr>
      <?php else: foreach ($orders as $i => $o): ?>
      <tr class="list">
        <td><p class="p1"><?= $i + 1 ?></p></td>
        <td><p class="p1"><?= htmlspecialchars($o['customer_name']) ?></p></td>
        <td><p class="p1"><?= htmlspecialchars($o['item_summary'] ?? '') ?></p></td>
        <td><p class="p1"><?= number_format($o['total_amount']) ?></p></td>
        <td><p class="p1"><?= time_ago($o['created_at']) ?></p></td>
      </tr>
      <?php endforeach; endif; ?>
    </table>
  </div>
