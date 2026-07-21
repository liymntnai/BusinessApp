<?php

try {
    $db = new PDO('mysql:host=localhost;dbname=business_app;charset=utf8mb4', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int) $e->getCode());
}
