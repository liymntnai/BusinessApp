<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($input['username'] ?? '');
$password = (string) ($input['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username and password are required.']);
    exit;
}

if (attempt_login($db, $username, $password)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Incorrect username or password.']);
}
