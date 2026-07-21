<?php

function start_session_safe(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function current_user_id(): ?int {
    start_session_safe();
    return $_SESSION['user_id'] ?? null;
}

function current_username(): ?string {
    start_session_safe();
    return $_SESSION['username'] ?? null;
}

// Full page (index.php) — redirect the browser to the login page.
function require_login_page(): void {
    if (current_user_id() === null) {
        header('Location: Views/login.php');
        exit;
    }
}

// AJAX HTML fragment (Views/*.php loaded into #board) — session expired mid-session,
// so a plain redirect header is useless; bounce the whole window via injected JS instead.
function require_login_fragment(): void {
    if (current_user_id() === null) {
        echo '<script>window.top.location.href = "login.php";</script>';
        exit;
    }
}

// JSON API endpoint — respond 401 so the caller's fetch() can react (redirect, show error, etc).
function require_login_api(): void {
    if (current_user_id() === null) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }
}

function attempt_login(PDO $db, string $username, string $password): bool {
    $stmt = $db->prepare('SELECT id, username, password_hash FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        return false;
    }

    start_session_safe();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    return true;
}

function do_logout(): void {
    start_session_safe();
    $_SESSION = [];
    session_unset();
    session_destroy();
}
