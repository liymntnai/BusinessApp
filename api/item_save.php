<?php
require __DIR__ . '/../config/mydb.php';
require __DIR__ . '/../app/auth.php';
require_login_api();

header('Content-Type: application/json');

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
];

// Validates and stores an uploaded image under storage/items, replacing any previous
// file for this product. Returns [imagePath, error] — imagePath falls back to the
// item's existing image when no new file was submitted.
function save_uploaded_image(?array $file, string $pid, ?string $existingPath): array {
    if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return [$existingPath, null];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return [$existingPath, 'Image upload failed.'];
    }
    if ($file['size'] > MAX_IMAGE_BYTES) {
        return [$existingPath, 'Image must be smaller than 2MB.'];
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset(ALLOWED_IMAGE_MIME_TYPES[$mime])) {
        return [$existingPath, 'Only JPG, PNG, GIF, or WEBP images are allowed.'];
    }

    $storageDir = __DIR__ . '/../storage/items';
    if (!is_dir($storageDir) && !mkdir($storageDir, 0755, true) && !is_dir($storageDir)) {
        return [$existingPath, 'Could not create image storage folder.'];
    }

    $safePid = preg_replace('/[^a-zA-Z0-9_-]/', '', $pid) ?: 'item';
    $filename = $safePid . '_' . bin2hex(random_bytes(6)) . '.' . ALLOWED_IMAGE_MIME_TYPES[$mime];
    $destination = $storageDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return [$existingPath, 'Could not save the uploaded image.'];
    }

    if ($existingPath) {
        $oldFile = __DIR__ . '/../' . $existingPath;
        if (is_file($oldFile)) {
            @unlink($oldFile);
        }
    }

    return ['storage/items/' . $filename, null];
}

$originalPid = trim((string) ($_POST['original_pid'] ?? ''));
$pid = trim((string) ($_POST['pid'] ?? ''));
$name = trim((string) ($_POST['name'] ?? ''));
$description = trim((string) ($_POST['description'] ?? ''));
$cp = (float) ($_POST['cp'] ?? 0);
$wholesale1 = (float) ($_POST['wholesale1'] ?? 0);
$wholesale2 = (float) ($_POST['wholesale2'] ?? 0);
$retail = (float) ($_POST['retail'] ?? 0);
$inStock = (float) ($_POST['in_stock'] ?? 0);

if ($pid === '' || $name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Product code and name are required.']);
    exit;
}

$existingImagePath = null;
if ($originalPid !== '') {
    $stmt = $db->prepare('SELECT image_path FROM items WHERE pid = ?');
    $stmt->execute([$originalPid]);
    $existingImagePath = $stmt->fetchColumn() ?: null;
}

[$imagePath, $imageError] = save_uploaded_image($_FILES['image'] ?? null, $pid, $existingImagePath);
if ($imageError) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $imageError]);
    exit;
}

try {
    if ($originalPid === '') {
        $stmt = $db->prepare(
            'INSERT INTO items (pid, name, description, image_path, cp, wholesale1, wholesale2, retail, in_stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$pid, $name, $description, $imagePath, $cp, $wholesale1, $wholesale2, $retail, $inStock]);
    } else {
        $stmt = $db->prepare(
            'UPDATE items SET pid = ?, name = ?, description = ?, image_path = ?, cp = ?, wholesale1 = ?, wholesale2 = ?, retail = ?, in_stock = ?
             WHERE pid = ?'
        );
        $stmt->execute([$pid, $name, $description, $imagePath, $cp, $wholesale1, $wholesale2, $retail, $inStock, $originalPid]);
    }
    echo json_encode(['success' => true, 'image_path' => $imagePath]);
} catch (PDOException $e) {
    http_response_code(400);
    if ($e->getCode() === '23000') {
        echo json_encode(['success' => false, 'error' => "Product code '$pid' is already in use."]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Could not save product.']);
    }
}
