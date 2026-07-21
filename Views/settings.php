<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_fragment();

$stmt = $db->prepare('SELECT username FROM users WHERE id = ?');
$stmt->execute([current_user_id()]);
$username = $stmt->fetchColumn() ?: '';
?>
<h1>
  Settings
</h1>
<div id="settings-message" class="hidden" style="margin: 0 4px 12px;"></div>
<div class="flex-v h-16 px-1">
  <h4 class="bold">
    Account
  </h4>
  <div class="flex-v h-16">
    <div class="flex h-32">
      <p class="p1">1. Username: <span id="username"><?= htmlspecialchars($username) ?></span></p>
      <button class="text-btn" id="change-username">
        <img src="img/Edit Group.svg" alt="" id="edit-icon">
        <p class="p1">Edit</p>
      </button>
    </div>
    <div class="flex-v h-16" id="form-edit-username" style="display: none;">
      <form id="username-form">
        <div class="flex-v h-4">
          <p class="p1 bold" style="color: var(--dark-green);">
            <span style="color: var(--error-text);">*</span>New Username
          </p>
          <input type="text" class="input-name" id="new-username-input" value="<?= htmlspecialchars($username) ?>" required>
        </div>
        <div class="flex-v h-4">
          <p class="p1 bold" style="color: var(--dark-green);">
            <span style="color: var(--error-text);">*</span>Current Password
          </p>
          <input type="password" class="input-name" id="username-confirm-password" required>
        </div>
        <div id="username-form-error" class="hidden" style="color: var(--error-text, red);"></div>
        <div class="flex-between">
          <button type="submit" class="btn-primary">
            Save
          </button>
          <button type="button" class="btn-cancel" id="btn-cancel--username">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>

</div>
<div class="flex h-32 px-1">
  <p class="p1">2. Password</p>
  <button class="text-btn" id="change-password">
    <img src="img/Edit Group.svg" alt="">
    <p class="p1">Edit</p>
  </button>
</div>
<div class="flex-v h-32" id="form-edit-password" style="display: none;">
  <form id="password-form">
    <div class="flex-v h-16">
      <input type="password" class="input-name" id="current-password-input" placeholder="Current password" required>
      <input type="password" class="input-name" id="new-password-input" placeholder="Enter new password" required>
      <input type="password" class="input-name" id="confirm-new-password-input" placeholder="Confirm password" required>
    </div>
    <div id="password-form-error" class="hidden" style="color: var(--error-text, red);"></div>
    <div class="flex-between">
      <button type="submit" class="btn-primary">
        Save
      </button>
      <button type="button" class="btn-cancel" id="btn-cancel--password">
        Cancel
      </button>
    </div>
  </form>
</div>
