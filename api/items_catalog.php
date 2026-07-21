<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

$stmt = $db->query('SELECT pid, name, description, retail FROM items ORDER BY name ASC');
$catalog = [];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $catalog[$row['pid']] = [
        'name' => $row['name'],
        'desc' => $row['description'],
        'up' => (float) $row['retail'],
    ];
}

echo json_encode(['success' => true, 'items' => $catalog]);
