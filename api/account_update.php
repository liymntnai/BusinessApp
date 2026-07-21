<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? '';
$userId = current_user_id();

$stmt = $db->prepare('SELECT id, username, password_hash FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit;
}

if ($action === 'username') {
    $newUsername = trim((string) ($input['new_username'] ?? ''));
    $currentPassword = (string) ($input['current_password'] ?? '');

    if ($newUsername === '' || $currentPassword === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New username and current password are required.']);
        exit;
    }
    if (!password_verify($currentPassword, $user['password_hash'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect.']);
        exit;
    }

    try {
        $update = $db->prepare('UPDATE users SET username = ? WHERE id = ?');
        $update->execute([$newUsername, $userId]);
        $_SESSION['username'] = $newUsername;
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(400);
        $msg = $e->getCode() === '23000' ? 'That username is already taken.' : 'Could not update username.';
        echo json_encode(['success' => false, 'error' => $msg]);
    }
    exit;
}

if ($action === 'password') {
    $currentPassword = (string) ($input['current_password'] ?? '');
    $newPassword = (string) ($input['new_password'] ?? '');
    $confirmPassword = (string) ($input['confirm_password'] ?? '');

    if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'All password fields are required.']);
        exit;
    }
    if (!password_verify($currentPassword, $user['password_hash'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect.']);
        exit;
    }
    if ($newPassword !== $confirmPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New password and confirmation do not match.']);
        exit;
    }
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'New password must be at least 6 characters.']);
        exit;
    }

    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $update = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $update->execute([$hash, $userId]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action.']);
