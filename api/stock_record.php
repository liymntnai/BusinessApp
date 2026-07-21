<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$pid = trim((string) ($input['pid'] ?? ''));
$qty = (float) ($input['qty'] ?? 0);
$supplier = trim((string) ($input['supplier'] ?? ''));
$description = trim((string) ($input['description'] ?? ''));

if ($pid === '' || $qty <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Select an item and enter a quantity greater than 0.']);
    exit;
}

try {
    $db->beginTransaction();

    $itemStmt = $db->prepare('SELECT id FROM items WHERE pid = ? FOR UPDATE');
    $itemStmt->execute([$pid]);
    $item = $itemStmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        throw new RuntimeException('Item not found.');
    }

    $logStmt = $db->prepare(
        'INSERT INTO stock_log (item_id, qty, supplier, description) VALUES (?, ?, ?, ?)'
    );
    $logStmt->execute([$item['id'], $qty, $supplier, $description]);

    $updateStmt = $db->prepare('UPDATE items SET in_stock = in_stock + ? WHERE id = ?');
    $updateStmt->execute([$qty, $item['id']]);

    $db->commit();
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    $db->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
