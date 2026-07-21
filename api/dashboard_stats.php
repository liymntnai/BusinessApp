<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require __DIR__ . '/../app/helpers.php';
require_login_api();

header('Content-Type: application/json');

$period = $_GET['period'] ?? 'today';
if (!in_array($period, VALID_PERIODS, true)) {
    $period = 'today';
}

$income = totalIncome($db, $period);
$expenses = totalExpenses($db, $period);

echo json_encode([
    'success' => true,
    'orders' => totalOrders($db, $period),
    'gross' => $income,
    'expenses' => $expenses,
    'net' => $income - $expenses,
]);
