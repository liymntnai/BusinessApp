-- ============================================================
-- business_app database schema
-- Import with: mysql -u root business_app < app/schema.sql
-- (or run this file from phpMyAdmin's SQL tab)
-- ============================================================

CREATE DATABASE IF NOT EXISTS business_app;
USE business_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pid VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  image_path VARCHAR(255) DEFAULT NULL,
  cp DECIMAL(12,2) NOT NULL DEFAULT 0,
  wholesale1 DECIMAL(12,2) NOT NULL DEFAULT 0,
  wholesale2 DECIMAL(12,2) NOT NULL DEFAULT 0,
  retail DECIMAL(12,2) NOT NULL DEFAULT 0,
  in_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  supplier VARCHAR(120) NOT NULL DEFAULT '',
  description VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);
