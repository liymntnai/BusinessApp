<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$pid = trim((string) ($input['pid'] ?? ''));

if ($pid === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing product code.']);
    exit;
}

try {
    $imageStmt = $db->prepare('SELECT image_path FROM items WHERE pid = ?');
    $imageStmt->execute([$pid]);
    $imagePath = $imageStmt->fetchColumn();

    $stmt = $db->prepare('DELETE FROM items WHERE pid = ?');
    $stmt->execute([$pid]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Product not found.']);
        exit;
    }

    if ($imagePath) {
        $file = __DIR__ . '/../' . $imagePath;
        if (is_file($file)) {
            @unlink($file);
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(400);
    if ($e->getCode() === '23000') {
        echo json_encode(['success' => false, 'error' => 'This product has existing orders or stock records and cannot be deleted.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Could not delete product.']);
    }
}
