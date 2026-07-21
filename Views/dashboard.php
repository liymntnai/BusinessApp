<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require __DIR__ . '/../app/helpers.php';
require_login_fragment();

$period = 'today';
$orders = totalOrders($db, $period);
$income = totalIncome($db, $period);
$expenses = totalExpenses($db, $period);
$net = $income - $expenses;

$latestOrders = recentOrders($db, 11);
$lowStock = lowStockItems($db, 5);
$recentlyAdded = recentItems($db, 5);
?>
<!-- Dashboard Tab View -->
<h1>Welcome<?= isset($_SESSION['username']) ? ', ' . htmlspecialchars($_SESSION['username']) : '' ?></h1>
<div class="row">
  <div class="card-8 card-summary h-32">
    <div class="flex-between align-center">
      <div class="flex h-2">
        <div><img src="img/add-task.svg" alt="" /></div>
        <h4 class="bold color-primary">Total Orders</h4>
      </div>
      <div class="length">
        <select onchange="syncDashboard(this.value)" class="time-select">
          <option value="today" selected>Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
    <h2 id="val-orders" class="stat-value"><?= number_format($orders) ?></h2>
  </div>
  <div class="card-8 card-summary h-32">
    <div class="flex-between align-center">
      <div class="flex h-4">
        <div><img src="img/add-task.svg" alt="" /></div>
        <h4 class="bold color-primary">Income</h4>
      </div>

      <div class="length">
        <select onchange="syncDashboard(this.value)" class="time-select">
          <option value="today" selected>Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>


    </div>
    <div class="stat-value flex">
      <h2 id="val-gross"><?= number_format($income) ?></h2><p class="currency p1">XAF</p>
    </div>
  </div>
  <div class="card-8 card-summary h-32">
    <div class="flex-between align-center">
      <div class="flex h-4">
        <div><img src="img/add-task.svg" alt="" /></div>
        <h4 class="bold color-primary">Expenses</h4>
      </div>
      <div class="flex length">
        <select onchange="syncDashboard(this.value)" class="time-select">
          <option value="today" selected>Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
    <div class="stat-value flex color-error-text">
      <h2 id="val-expenses"><?= number_format($expenses) ?></h2><p class="currency p1">XAF</p>
    </div>
  </div>
  <div class="card-8 card-summary h-32">
    <div class="flex-between align-center">
      <div class="flex h-4">
        <div><img src="img/add-task.svg" alt="" /></div>
        <h4 class="bold color-primary">Net Profit</h4>
      </div>
      <div class="length">
        <select onchange="syncDashboard(this.value)" class="time-select">
          <option value="today" selected>Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
    <div class="stat-value flex bold">
      <h2 id="val-net"><?= number_format($net) ?></h2><p class="currency p1">XAF</p>
    </div>
  </div>
</div>

<div class="row">
  <div class="card-16" style="width: 70%;">
    <div class="flex-v h-16">
      <h4 class="bold color-primary">Latest Orders</h4>

      <div class="flex-v h-16">
        <table class="orders-table">
          <tr class="table-head">
            <td><p class="p1 bold">No</p></td>
            <td><p class="p1 bold">Customer Name</p></td>
            <td><p class="p1 bold">Items</p></td>
            <td><p class="p1 bold">Amount</p></td>
            <td><p class="p1 bold">Date</p></td>
          </tr>
          <?php if (empty($latestOrders)): ?>
          <tr>
            <td colspan="5"><p class="p1">No orders yet.</p></td>
          </tr>
          <?php else: foreach ($latestOrders as $i => $o): ?>
          <tr>
            <td><p class="p1"><?= $i + 1 ?></p></td>
            <td><p class="p1"><?= htmlspecialchars($o['customer_name']) ?></p></td>
            <td><p class="p1"><?= htmlspecialchars($o['item_summary'] ?? '') ?></p></td>
            <td><p class="p1"><?= number_format($o['total_amount']) ?></p></td>
            <td><p class="p1"><?= time_ago($o['created_at']) ?></p></td>
          </tr>
          <?php endforeach; endif; ?>
        </table>
      </div>
    </div>
  </div>
  <div class="flex-v h-32" style="width: 30%;">
    <div class="card-16">
      <div class="flex-v h-16">
        <h4 class="color-error-container bold">Low In Stock</h4>

        <div class="flex-v h-16">
          <?php if (empty($lowStock)): ?>
          <p class="p1">No items recorded yet.</p>
          <?php else: foreach ($lowStock as $it): ?>
          <div class="flex-between">
            <p class="p1"><?= htmlspecialchars($it['name']) ?></p>
            <p class="p1 bold"><?= number_format($it['in_stock']) ?></p>
          </div>
          <?php endforeach; endif; ?>
        </div>
      </div>
    </div>
    <div class="card-16">
      <div class="flex-v h-16">
        <h4 class="color-primary bold">Recently Added</h4>

        <div class="flex-v h-16">
          <div class="flex-between h-16">
            <p class="p1 col-span-2">Item</p>
            <p class="p1 bold text-right col-span-1 ">Added</p>
            <p class="p1 bold text-right col-span-1">In Stock</p>
          </div>
          <?php foreach ($recentlyAdded as $it): ?>
          <div class="flex-between h-16">
            <p class="p1 col-span-2"><?= htmlspecialchars($it['name']) ?></p>
            <p class="p1 bold text-right col-span-1"><?= time_ago($it['created_at']) ?></p>
            <p class="p1 bold text-right col-span-1"><?= number_format($it['in_stock']) ?></p>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</div>
