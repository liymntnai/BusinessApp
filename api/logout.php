<?php
require __DIR__ . '/../app/auth.php';

header('Content-Type: application/json');
do_logout();
echo json_encode(['success' => true]);
