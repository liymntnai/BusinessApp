<?php
require __DIR__ . '/../app/auth.php';
// Already logged in? skip straight to the app.
if (current_user_id() !== null) {
    header('Location: ../index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>

    <link rel="stylesheet" href="../style.css">
</head>
<body>

<div class="login-container">

    <section class="left-panel">

        <div class="logo-container">
            <img src="../img/Layer_1 (1).jpg" alt="Logo">
        </div>

    </section>

    <section class="right-panel">

        <form class="login-form" id="login-form">

            <h1>Login</h1>

            <p class="error-message p2" id="login-error" style="display: none;">
                Incorrect username or password
            </p>

            <input
                type="text"
                name="username"
                id="login-username"
                placeholder="username"
                autocomplete="username"
                required
            >

            <input
                type="password"
                name="password"
                id="login-password"
                placeholder="password"
                autocomplete="current-password"
                required
            >

            <button type="submit">
                Submit
            </button>

        </form>

    </section>

</div>

<script>
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('../api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            window.location.href = '../index.php';
        } else {
            errorEl.textContent = result.error || 'Incorrect username or password';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Unable to reach the server. Please try again.';
        errorEl.style.display = 'block';
    }
});
</script>

</body>
</html>
