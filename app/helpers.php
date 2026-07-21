<?php

const VALID_PERIODS = ['today', 'week', 'month', 'year'];

// Whitelisted period -> SQL boolean expression testing $column against "now".
// $period is always validated against VALID_PERIODS before this is called, so it's
// safe to inline directly into the query string (no user input reaches this string).
function period_condition(string $period, string $column = 'created_at'): string {
    if (!in_array($period, VALID_PERIODS, true)) {
        $period = 'today';
    }
    switch ($period) {
        case 'week':
            return "YEARWEEK($column, 1) = YEARWEEK(CURDATE(), 1)";
        case 'month':
            return "YEAR($column) = YEAR(CURDATE()) AND MONTH($column) = MONTH(CURDATE())";
        case 'year':
            return "YEAR($column) = YEAR(CURDATE())";
        case 'today':
        default:
            return "DATE($column) = CURDATE()";
    }
}

function totalOrders(PDO $db, string $period = 'today'): int {
    $cond = period_condition($period, 'created_at');
    $stmt = $db->query("SELECT COUNT(*) FROM orders WHERE $cond");
    return (int) $stmt->fetchColumn();
}

function totalIncome(PDO $db, string $period = 'today'): float {
    $cond = period_condition($period, 'created_at');
    $stmt = $db->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE $cond");
    return (float) $stmt->fetchColumn();
}

// Expenses = cost of goods sold: qty * cost_price (snapshotted per order line at sale time).
function totalExpenses(PDO $db, string $period = 'today'): float {
    $cond = period_condition($period, 'o.created_at');
    $stmt = $db->query("
        SELECT COALESCE(SUM(ol.qty * ol.cost_price), 0)
        FROM order_lines ol
        JOIN orders o ON o.id = ol.order_id
        WHERE $cond
    ");
    return (float) $stmt->fetchColumn();
}

function lowStockItems(PDO $db, int $limit = 5): array {
    $limit = max(1, $limit);
    $stmt = $db->query("SELECT * FROM items ORDER BY in_stock ASC LIMIT $limit");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function recentItems(PDO $db, int $limit = 5): array {
    $limit = max(1, $limit);
    $stmt = $db->query("SELECT * FROM items ORDER BY created_at DESC LIMIT $limit");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function recentOrders(PDO $db, int $limit = 15): array {
    $limit = max(1, $limit);
    $stmt = $db->query("
        SELECT o.id, o.customer_name, o.total_amount, o.created_at,
               GROUP_CONCAT(ol.item_name ORDER BY ol.id SEPARATOR ', ') AS item_summary
        FROM orders o
        LEFT JOIN order_lines ol ON ol.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $limit
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function allItems(PDO $db): array {
    $stmt = $db->query('SELECT * FROM items ORDER BY name ASC');
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function time_ago(string $datetime): string {
    $diff = time() - strtotime($datetime);
    if ($diff < 60) return 'Just now';
    if ($diff < 3600) return floor($diff / 60) . ' min ago';
    if ($diff < 86400) return floor($diff / 3600) . ' hour(s) ago';
    if ($diff < 172800) return 'Yesterday';
    return floor($diff / 86400) . ' days ago';
}
