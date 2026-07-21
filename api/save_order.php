<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$customerName = trim($input['customer_name'] ?? '');
$lines = $input['lines'] ?? [];

if ($customerName === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Customer name is required.']);
    exit;
}
if (!is_array($lines) || count($lines) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'At least one item is required.']);
    exit;
}

try {
    $db->beginTransaction();

    $itemStmt = $db->prepare('SELECT * FROM items WHERE pid = ? FOR UPDATE');
    $resolvedLines = [];
    $grandTotal = 0;

    foreach ($lines as $line) {
        $pid = trim((string) ($line['pid'] ?? ''));
        $qty = (float) ($line['qty'] ?? 0);

        if ($pid === '' || $qty <= 0) {
            throw new RuntimeException('Invalid line item.');
        }

        $itemStmt->execute([$pid]);
        $item = $itemStmt->fetch(PDO::FETCH_ASSOC);
        if (!$item) {
            throw new RuntimeException("Unknown item: $pid");
        }
        if ($item['in_stock'] < $qty) {
            throw new RuntimeException("Not enough stock for {$item['name']} (have {$item['in_stock']}, need $qty).");
        }

        $unitPrice = (float) $item['retail'];
        $lineTotal = $unitPrice * $qty;
        $grandTotal += $lineTotal;

        $resolvedLines[] = [
            'item_id' => $item['id'],
            'item_name' => $item['name'],
            'qty' => $qty,
            'unit_price' => $unitPrice,
            'cost_price' => (float) $item['cp'],
        ];
    }

    $orderStmt = $db->prepare('INSERT INTO orders (customer_name, total_amount) VALUES (?, ?)');
    $orderStmt->execute([$customerName, $grandTotal]);
    $orderId = (int) $db->lastInsertId();

    $lineStmt = $db->prepare(
        'INSERT INTO order_lines (order_id, item_id, item_name, qty, unit_price, cost_price) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stockStmt = $db->prepare('UPDATE items SET in_stock = in_stock - ? WHERE id = ?');

    foreach ($resolvedLines as $rl) {
        $lineStmt->execute([$orderId, $rl['item_id'], $rl['item_name'], $rl['qty'], $rl['unit_price'], $rl['cost_price']]);
        $stockStmt->execute([$rl['qty'], $rl['item_id']]);
    }

    $db->commit();
    echo json_encode(['success' => true, 'order_id' => $orderId, 'total' => $grandTotal]);
} catch (Throwable $e) {
    $db->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
