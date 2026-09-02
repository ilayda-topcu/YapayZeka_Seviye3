-- AgroPlus yönetim paneli - MariaDB veritabanı şeması
-- MariaDB 10.6+ / InnoDB / utf8mb4
-- Docker çalıştırıldığında otomatik olarak agroplus veritabanını oluşturur ve içeriyi yükler

CREATE DATABASE IF NOT EXISTS agroplus;
USE agroplus;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS branches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  district VARCHAR(80) NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(160) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_branches_code (code),
  KEY idx_branches_city_active (city, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT UNSIGNED NULL,
  role_id SMALLINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_branch_role (branch_id, role_id),
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS brands (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(80) NULL,
  website VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_brands_name (name),
  KEY idx_brands_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_categories_parent_name (parent_id, name),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS equipment_models (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  model_name VARCHAR(120) NOT NULL,
  model_year SMALLINT UNSIGNED NULL,
  engine_power_hp SMALLINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_equipment_models_brand_model (brand_id, model_name),
  KEY idx_models_category_active (category_id, is_active),
  CONSTRAINT fk_models_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_models_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS spare_parts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand_id BIGINT UNSIGNED NULL,
  category_id BIGINT UNSIGNED NULL,
  part_code VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'adet',
  purchase_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  minimum_stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_spare_parts_code (part_code),
  KEY idx_parts_brand_category (brand_id, category_id),
  KEY idx_parts_name (name),
  CONSTRAINT fk_parts_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_parts_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS model_parts (
  equipment_model_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  is_oem TINYINT(1) NOT NULL DEFAULT 1,
  notes VARCHAR(255) NULL,
  PRIMARY KEY (equipment_model_id, spare_part_id),
  KEY idx_model_parts_part (spare_part_id),
  CONSTRAINT fk_model_parts_model FOREIGN KEY (equipment_model_id) REFERENCES equipment_models(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_model_parts_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NULL,
  capacity_m3 DECIMAL(12,2) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_warehouses_code (code),
  KEY idx_warehouses_branch (branch_id),
  CONSTRAINT fk_warehouses_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS warehouse_stock (
  warehouse_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  reserved_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (warehouse_id, spare_part_id),
  KEY idx_stock_part_quantity (spare_part_id, quantity),
  CONSTRAINT fk_stock_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_stock_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  movement_type ENUM('IN','OUT','TRANSFER_IN','TRANSFER_OUT','ADJUSTMENT') NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(14,2) NULL,
  reference_type VARCHAR(40) NULL,
  reference_id BIGINT UNSIGNED NULL,
  note VARCHAR(255) NULL,
  moved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_movements_warehouse_date (warehouse_id, moved_at),
  KEY idx_movements_part_date (spare_part_id, moved_at),
  KEY idx_movements_reference (reference_type, reference_id),
  CONSTRAINT fk_movements_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_movements_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_movements_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT UNSIGNED NULL,
  customer_type ENUM('INDIVIDUAL','COMPANY') NOT NULL DEFAULT 'INDIVIDUAL',
  name VARCHAR(180) NOT NULL,
  tax_number VARCHAR(30) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(160) NULL,
  city VARCHAR(80) NULL,
  district VARCHAR(80) NULL,
  address VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_customers_name (name),
  KEY idx_customers_branch_city (branch_id, city),
  KEY idx_customers_phone (phone),
  CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS customer_machines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  equipment_model_id BIGINT UNSIGNED NOT NULL,
  serial_number VARCHAR(100) NULL,
  manufacture_year SMALLINT UNSIGNED NULL,
  operating_hours DECIMAL(12,1) NULL,
  warranty_ends_at DATE NULL,
  notes VARCHAR(255) NULL,
  UNIQUE KEY uq_customer_machines_serial (serial_number),
  KEY idx_machines_customer (customer_id),
  KEY idx_machines_model (equipment_model_id),
  CONSTRAINT fk_customer_machines_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_customer_machines_model FOREIGN KEY (equipment_model_id) REFERENCES equipment_models(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(40) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  status ENUM('DRAFT','PENDING','PREPARING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATETIME NULL,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  note VARCHAR(255) NULL,
  UNIQUE KEY uq_orders_order_no (order_no),
  KEY idx_orders_customer_date (customer_id, order_date),
  KEY idx_orders_branch_status_date (branch_id, status, order_date),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  discount_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(14,2) NOT NULL,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_part (spare_part_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS service_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_no VARCHAR(40) NOT NULL,
  customer_machine_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NULL,
  status ENUM('PLANNED','IN_PROGRESS','WAITING_PART','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PLANNED',
  priority ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
  complaint TEXT NOT NULL,
  diagnosis TEXT NULL,
  resolution TEXT NULL,
  scheduled_at DATETIME NULL,
  completed_at DATETIME NULL,
  labor_cost DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  parts_cost DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_service_records_no (service_no),
  KEY idx_service_status_schedule (status, scheduled_at),
  KEY idx_service_technician_status (technician_id, status),
  CONSTRAINT fk_service_machine FOREIGN KEY (customer_machine_id) REFERENCES customer_machines(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_service_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_service_technician FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS service_parts (
  service_record_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  PRIMARY KEY (service_record_id, spare_part_id),
  KEY idx_service_parts_part (spare_part_id),
  CONSTRAINT fk_service_parts_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_service_parts_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS requests_complaints (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_no VARCHAR(40) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  ticket_type ENUM('REQUEST','COMPLAINT') NOT NULL,
  subject VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_REVIEW','WAITING_CUSTOMER','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  resolved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_requests_ticket_no (ticket_no),
  KEY idx_requests_status_priority (status, priority),
  KEY idx_requests_customer (customer_id),
  CONSTRAINT fk_requests_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_requests_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS field_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_no VARCHAR(40) NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  region VARCHAR(160) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('PLANNED','ON_ROUTE','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PLANNED',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_field_tasks_no (task_no),
  KEY idx_field_tasks_branch_schedule (branch_id, scheduled_at),
  KEY idx_field_tasks_user_status (assigned_user_id, status),
  KEY idx_field_tasks_customer (customer_id),
  CONSTRAINT fk_field_tasks_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_field_tasks_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_field_tasks_assigned FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_field_tasks_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS field_task_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  field_task_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_field_images_task_sort (field_task_id, sort_order),
  CONSTRAINT fk_field_images_task FOREIGN KEY (field_task_id) REFERENCES field_tasks(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_field_images_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS quotes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_no VARCHAR(40) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  approved_by BIGINT UNSIGNED NULL,
  status ENUM('DRAFT','PENDING','APPROVED','REJECTED','EXPIRED','CONVERTED') NOT NULL DEFAULT 'DRAFT',
  validity_days SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  quote_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until DATETIME NOT NULL,
  approved_at DATETIME NULL,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_quotes_quote_no (quote_no),
  KEY idx_quotes_customer_date (customer_id, quote_date),
  KEY idx_quotes_status_validity (status, valid_until),
  KEY idx_quotes_branch_status (branch_id, status),
  CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_quotes_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_quotes_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_quotes_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS quote_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id BIGINT UNSIGNED NOT NULL,
  spare_part_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  discount_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(14,2) NOT NULL,
  KEY idx_quote_items_quote (quote_id),
  KEY idx_quote_items_part (spare_part_id),
  CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quote_items_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS quote_approvals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id BIGINT UNSIGNED NOT NULL,
  agent_id BIGINT UNSIGNED NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  decision_notes VARCHAR(500) NULL,
  approval_reason ENUM('PRICE','TERMS','AVAILABILITY','CUSTOMER','OTHER') NULL,
  rejection_reason ENUM('PRICE_MISMATCH','STOCK_UNAVAILABLE','CUSTOMER_CANCEL','AGENT_DECISION','OTHER') NULL,
  decided_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_approvals_quote_status (quote_id, status),
  KEY idx_approvals_agent_status (agent_id, status),
  CONSTRAINT fk_approvals_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_approvals_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS ai_agents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_name VARCHAR(120) NOT NULL,
  agent_type ENUM('QUOTE_APPROVAL','ORDER_FULFILLMENT','INVENTORY_MANAGEMENT','COMPLAINT_HANDLER','FIELD_SCHEDULER') NOT NULL,
  description TEXT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'GPT-4',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_email_enabled TINYINT(1) NOT NULL DEFAULT 0,
  approval_threshold DECIMAL(14,2) NULL,
  auto_approve_enabled TINYINT(1) NOT NULL DEFAULT 0,
  config JSON NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_agents_type_active (agent_type, is_active),
  CONSTRAINT fk_agents_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS email_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_email VARCHAR(160) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type ENUM('QUOTE_APPROVAL','QUOTE_REJECTION','ORDER_CONFIRMATION','SERVICE_UPDATE','COMPLAINT_RESPONSE','SYSTEM_NOTIFICATION') NOT NULL,
  reference_id BIGINT UNSIGNED NULL,
  reference_type VARCHAR(40) NULL,
  body_preview VARCHAR(500) NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('SENT','FAILED','BOUNCED') NOT NULL DEFAULT 'SENT',
  error_message VARCHAR(500) NULL,
  KEY idx_email_logs_recipient_date (recipient_email, sent_at),
  KEY idx_email_logs_type_reference (email_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE OR REPLACE VIEW v_sales_by_branch AS
SELECT
  b.name AS branch_name,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.grand_total), 0) AS total_revenue,
  COALESCE(AVG(o.grand_total), 0) AS avg_order
FROM branches b
LEFT JOIN orders o ON o.branch_id = b.id
GROUP BY b.id, b.name;

CREATE OR REPLACE VIEW v_stock_alerts AS
SELECT
  sp.name AS product_name,
  w.name AS warehouse_name,
  ws.quantity,
  sp.minimum_stock,
  (sp.minimum_stock - ws.quantity) AS shortage
FROM warehouse_stock ws
JOIN spare_parts sp ON sp.id = ws.spare_part_id
JOIN warehouses w ON w.id = ws.warehouse_id
WHERE ws.quantity < sp.minimum_stock
ORDER BY shortage DESC;

CREATE OR REPLACE VIEW v_service_summary AS
SELECT
  status AS service_status,
  COUNT(*) AS service_count,
  COALESCE(SUM(labor_cost + parts_cost), 0) AS total_cost
FROM service_records
GROUP BY status;

CREATE OR REPLACE VIEW v_customer_activity AS
SELECT
  c.name AS customer_name,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.grand_total), 0) AS total_spend,
  MAX(o.order_date) AS last_order
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY total_spend DESC;

CREATE OR REPLACE VIEW v_field_task_summary AS
SELECT
  ft.region,
  COUNT(ft.id) AS task_count,
  SUM(CASE WHEN ft.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count
FROM field_tasks ft
GROUP BY ft.region;

CREATE OR REPLACE VIEW v_report_sales_summary AS
SELECT
  DATE_FORMAT(o.order_date, '%Y-%m') AS month_key,
  COUNT(o.id) AS order_count,
  SUM(o.grand_total) AS total_sales,
  AVG(o.grand_total) AS avg_order_value
FROM orders o
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY month_key ASC;

CREATE OR REPLACE VIEW v_report_branch_revenue AS
SELECT
  b.name AS branch_name,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.grand_total), 0) AS total_revenue,
  COALESCE(AVG(o.grand_total), 0) AS avg_order_value,
  COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN 1 ELSE 0 END), 0) AS delivered_orders
FROM branches b
LEFT JOIN orders o ON o.branch_id = b.id
GROUP BY b.id, b.name
ORDER BY total_revenue DESC;

CREATE OR REPLACE VIEW v_report_stock_health AS
SELECT
  sp.name AS product_name,
  w.name AS warehouse_name,
  COALESCE(SUM(ws.quantity), 0) AS current_stock,
  sp.minimum_stock,
  (sp.minimum_stock - COALESCE(SUM(ws.quantity), 0)) AS stock_gap,
  CASE
    WHEN COALESCE(SUM(ws.quantity), 0) < sp.minimum_stock THEN 'Düşük'
    ELSE 'Yeterli'
  END AS stock_status
FROM spare_parts sp
LEFT JOIN warehouse_stock ws ON ws.spare_part_id = sp.id
LEFT JOIN warehouses w ON w.id = ws.warehouse_id
GROUP BY sp.id, sp.name, w.id, w.name, sp.minimum_stock
ORDER BY stock_gap DESC;

CREATE OR REPLACE VIEW v_report_low_stock_parts AS
SELECT
  sp.name AS part_name,
  sp.part_code,
  COALESCE(SUM(ws.quantity), 0) AS current_quantity,
  sp.minimum_stock,
  (sp.minimum_stock - COALESCE(SUM(ws.quantity), 0)) AS shortage_amount
FROM spare_parts sp
LEFT JOIN warehouse_stock ws ON ws.spare_part_id = sp.id
GROUP BY sp.id, sp.name, sp.part_code, sp.minimum_stock
HAVING COALESCE(SUM(ws.quantity), 0) < sp.minimum_stock
ORDER BY shortage_amount DESC;

CREATE OR REPLACE VIEW v_report_service_performance AS
SELECT
  sr.status AS service_status,
  COUNT(sr.id) AS service_count,
  COALESCE(SUM(sr.labor_cost + sr.parts_cost), 0) AS total_cost,
  COALESCE(AVG(sr.labor_cost + sr.parts_cost), 0) AS avg_service_cost
FROM service_records sr
GROUP BY sr.status
ORDER BY service_count DESC;

CREATE OR REPLACE VIEW v_report_service_by_technician AS
SELECT
  u.full_name AS technician_name,
  COUNT(sr.id) AS assigned_service_count,
  COALESCE(SUM(sr.labor_cost + sr.parts_cost), 0) AS total_service_cost,
  COALESCE(AVG(sr.labor_cost + sr.parts_cost), 0) AS avg_service_cost
FROM users u
LEFT JOIN service_records sr ON sr.technician_id = u.id
WHERE u.role_id IN (2, 1)
GROUP BY u.id, u.full_name
ORDER BY assigned_service_count DESC;

CREATE OR REPLACE VIEW v_report_customer_value AS
SELECT
  c.name AS customer_name,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.grand_total), 0) AS total_spend,
  COALESCE(AVG(o.grand_total), 0) AS avg_order_value,
  MAX(o.order_date) AS last_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY total_spend DESC;

CREATE OR REPLACE VIEW v_report_order_status_mix AS
SELECT
  o.status AS order_status,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.grand_total), 0) AS total_value
FROM orders o
GROUP BY o.status
ORDER BY total_value DESC;

CREATE OR REPLACE VIEW v_report_field_region_performance AS
SELECT
  ft.region,
  COUNT(ft.id) AS task_count,
  SUM(CASE WHEN ft.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN ft.status = 'ON_ROUTE' THEN 1 ELSE 0 END) AS on_route_tasks
FROM field_tasks ft
GROUP BY ft.region
ORDER BY task_count DESC;

CREATE OR REPLACE VIEW v_report_complaint_resolution AS
SELECT
  rc.status AS complaint_status,
  COUNT(rc.id) AS complaint_count,
  SUM(CASE WHEN rc.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_count,
  SUM(CASE WHEN rc.status = 'OPEN' THEN 1 ELSE 0 END) AS open_count
FROM requests_complaints rc
GROUP BY rc.status
ORDER BY complaint_count DESC;

CREATE OR REPLACE VIEW v_report_warehouse_utilization AS
SELECT
  w.name AS warehouse_name,
  b.name AS branch_name,
  COALESCE(SUM(ws.quantity), 0) AS total_items,
  w.capacity_m3,
  ROUND(COALESCE((SUM(ws.quantity) / NULLIF(w.capacity_m3, 0)) * 100, 0), 2) AS utilization_rate
FROM warehouses w
LEFT JOIN warehouse_stock ws ON ws.warehouse_id = w.id
LEFT JOIN branches b ON b.id = w.branch_id
GROUP BY w.id, w.name, b.name, w.capacity_m3
ORDER BY utilization_rate DESC;

SET FOREIGN_KEY_CHECKS = 1;

-- Örnek kayıtlar (INSERT IGNORE komutları şemayı tekrar çalıştırılabilir tutar)
INSERT IGNORE INTO branches (id, code, name, city, district, phone, email) VALUES
(1, 'KON-MER', 'Merkez Şube', 'Konya', 'Selçuklu', '0332 555 10 10', 'konya@agroplus.com'),
(2, 'ANK-POL', 'Ankara Şube', 'Ankara', 'Polatlı', '0312 555 20 20', 'ankara@agroplus.com'),
(3, 'IZM-TOR', 'İzmir Şube', 'İzmir', 'Torbalı', '0232 555 30 30', 'izmir@agroplus.com'),
(4, 'AKS-MER', 'Aksaray Şube', 'Aksaray', 'Merkez', '0382 555 40 40', 'aksaray@agroplus.com');

INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'Yönetici', 'Tüm modüllere erişim'), (2, 'Servis Teknisyeni', 'Servis ve saha görevleri'),
(3, 'Depo Sorumlusu', 'Depo ve stok yönetimi'), (4, 'Satış Temsilcisi', 'Müşteri ve sipariş yönetimi');

INSERT IGNORE INTO users (id, branch_id, role_id, full_name, email, phone, password_hash) VALUES
(1, 1, 1, 'Selin Aksoy', 'selin.aksoy@agroplus.com', '0532 555 24 11', '$2y$10$demo_hash_admin'),
(2, 1, 2, 'Okan Demir', 'okan.demir@agroplus.com', '0534 265 44 10', '$2y$10$demo_hash_okan'),
(3, 2, 2, 'Suat Aslan', 'suat.aslan@agroplus.com', '0531 188 72 30', '$2y$10$demo_hash_suat'),
(4, 3, 3, 'İpek Uslu', 'ipek.uslu@agroplus.com', '0542 310 14 98', '$2y$10$demo_hash_ipek'),
(5, 1, 4, 'Murat Kılıç', 'murat.kilic@agroplus.com', '0536 291 66 02', '$2y$10$demo_hash_murat');

INSERT IGNORE INTO brands (id, name, country) VALUES
(1, 'Massey Ferguson', 'Birleşik Krallık'), (2, 'New Holland', 'Hollanda'),
(3, 'John Deere', 'ABD'), (4, 'Türk Traktör', 'Türkiye');

INSERT IGNORE INTO product_categories (id, parent_id, name, description) VALUES
(1, NULL, 'Traktör', 'Tarım traktörleri'), (2, NULL, 'Yedek Parça', 'Makine yedek parçaları'),
(3, 2, 'Motor Parçaları', 'Motor ve yakıt sistemi'), (4, 2, 'Hidrolik Parçalar', 'Hidrolik sistem parçaları'),
(5, 2, 'Filtreler', 'Hava, yağ ve yakıt filtreleri');

INSERT IGNORE INTO equipment_models (id, brand_id, category_id, model_name, model_year, engine_power_hp) VALUES
(1, 1, 1, '265', 2021, 75), (2, 2, 1, 'TD75', 2022, 75),
(3, 3, 1, '5075E', 2023, 75), (4, 4, 1, '480', 2020, 50);

INSERT IGNORE INTO spare_parts (id, brand_id, category_id, part_code, name, unit, purchase_price, sale_price, minimum_stock) VALUES
(1, 1, 4, 'MF-HP-265', 'Hidrolik Pompa', 'adet', 5200, 6900, 10),
(2, 2, 5, 'NH-HF-75', 'Hava Filtresi', 'adet', 340, 480, 30),
(3, 3, 3, 'JD-DS-5075', 'Debriyaj Seti', 'adet', 7600, 9800, 8),
(4, 4, 3, 'TT-YE-480', 'Yakıt Enjektörü', 'adet', 2100, 2850, 15),
(5, NULL, 4, 'GEN-RUL-001', 'Rulman Seti', 'adet', 450, 670, 12),
(6, NULL, 5, 'GEN-YAG-20L', 'Şanzıman Yağı 20L', 'adet', 1100, 1480, 20);

INSERT IGNORE INTO model_parts (equipment_model_id, spare_part_id, is_oem) VALUES
(1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (1, 5, 0), (2, 6, 0);

INSERT IGNORE INTO warehouses (id, branch_id, code, name, capacity_m3) VALUES
(1, 1, 'DEP-KON-01', 'Merkez Depo', 1200), (2, 2, 'DEP-ANK-01', 'Ankara Şube Deposu', 700),
(3, 3, 'DEP-IZM-01', 'İzmir Şube Deposu', 550), (4, 1, 'DEP-MOB-01', 'Mobil Servis Deposu', 120);

INSERT IGNORE INTO warehouse_stock (warehouse_id, spare_part_id, quantity, reserved_quantity) VALUES
(1, 1, 24, 2), (1, 2, 86, 5), (1, 3, 12, 1), (2, 4, 7, 2),
(1, 5, 9, 0), (3, 6, 45, 4), (4, 2, 8, 0), (2, 6, 18, 1);

INSERT IGNORE INTO customers (id, branch_id, customer_type, name, phone, email, city, district) VALUES
(1, 1, 'INDIVIDUAL', 'Ahmet Yılmaz', '0532 555 24 11', 'ahmet@example.com', 'Konya', 'Çumra'),
(2, 1, 'COMPANY', 'Bereket Tarım Ltd.', '0541 378 60 12', 'iletisim@berekettarim.com', 'Konya', 'Selçuklu'),
(3, 2, 'INDIVIDUAL', 'Mehmet Kaya', '0553 291 80 04', 'mehmet@example.com', 'Aksaray', 'Merkez'),
(4, 3, 'COMPANY', 'Güven Çiftliği', '0530 675 13 88', 'info@guvenciftligi.com', 'Karaman', 'Ayrancı');

INSERT IGNORE INTO customer_machines (id, customer_id, equipment_model_id, serial_number, manufacture_year, operating_hours) VALUES
(1, 1, 1, 'MF265-2021-1001', 2021, 1240), (2, 2, 2, 'NHTD75-2022-2024', 2022, 830),
(3, 3, 3, 'JD5075E-2023-188', 2023, 560), (4, 4, 4, 'TT480-2020-415', 2020, 2100);

INSERT IGNORE INTO orders (id, order_no, customer_id, branch_id, created_by, status, order_date, subtotal, grand_total) VALUES
(1, 'SIP-1048', 2, 1, 5, 'PREPARING', '2026-09-01 09:15:00', 48750, 48750),
(2, 'SIP-1047', 1, 1, 5, 'SHIPPED', '2026-08-31 15:45:00', 12400, 12400),
(3, 'SIP-1046', 4, 3, 5, 'DELIVERED', '2026-08-30 13:00:00', 96320, 96320),
(4, 'SIP-1045', 3, 2, 5, 'PENDING', '2026-08-29 10:20:00', 7850, 7850);

INSERT IGNORE INTO order_items (order_id, spare_part_id, quantity, unit_price, line_total) VALUES
(1, 1, 5, 6900, 34500), (1, 2, 30, 475, 14250), (2, 3, 1, 9800, 9800),
(2, 5, 4, 650, 2600), (3, 4, 12, 2850, 34200), (3, 6, 42, 1480, 62120), (4, 2, 10, 480, 4800), (4, 5, 4, 762.50, 3050);

INSERT IGNORE INTO service_records (id, service_no, customer_machine_id, branch_id, technician_id, status, priority, complaint, scheduled_at, labor_cost, parts_cost) VALUES
(1, 'SRV-238', 1, 1, 2, 'IN_PROGRESS', 'HIGH', 'Motor bakım ihtiyacı ve yağ kaçağı', '2026-09-01 09:30:00', 2500, 6900),
(2, 'SRV-237', 2, 1, 2, 'PLANNED', 'NORMAL', 'Periyodik bakım', '2026-09-01 11:00:00', 1800, 1480),
(3, 'SRV-236', 3, 2, 3, 'WAITING_PART', 'HIGH', 'Hidrolik basınç kaybı', '2026-09-01 14:30:00', 2200, 0),
(4, 'SRV-235', 4, 1, 2, 'COMPLETED', 'NORMAL', 'Debriyaj performans düşüşü', '2026-08-30 10:00:00', 3100, 9800);

INSERT IGNORE INTO requests_complaints (id, ticket_no, customer_id, assigned_user_id, ticket_type, subject, description, priority, status) VALUES
(1, 'TLP-092', 2, 5, 'COMPLAINT', 'Geç teslimat bildirimi', 'Sipariş teslimatı planlanan tarihten geç gerçekleşti.', 'HIGH', 'IN_REVIEW'),
(2, 'TLP-091', 1, 5, 'REQUEST', 'Yedek parça talebi', 'Hidrolik pompa için fiyat teklifi talebi.', 'MEDIUM', 'OPEN'),
(3, 'TLP-090', 4, 2, 'REQUEST', 'Servis randevusu', 'Sezon öncesi bakım randevusu isteniyor.', 'LOW', 'RESOLVED'),
(4, 'TLP-089', 3, 3, 'REQUEST', 'Garanti kapsamı sorusu', 'Hidrolik sistemin garanti durumu soruldu.', 'MEDIUM', 'WAITING_CUSTOMER');

INSERT IGNORE INTO field_tasks (id, task_no, branch_id, customer_id, assigned_user_id, title, description, region, scheduled_at, status, created_by) VALUES
(1, 'SAHA-001', 1, 2, 2, 'Hasat öncesi kontrol', 'Traktör ve hidrolik hatların hasat öncesi genel kontrolü yapılacak.', 'Konya / Çumra', '2026-09-01 09:30:00', 'PLANNED', 1),
(2, 'SAHA-002', 2, 3, 3, 'Yerinde arıza tespiti', 'Hidrolik basınç kaybı için yerinde arıza tespiti yapılacak.', 'Aksaray / Merkez', '2026-09-01 11:00:00', 'ON_ROUTE', 1),
(3, 'SAHA-003', 3, 4, 5, 'Teslimat ve kurulum', 'Mibzer ekipmanı teslim edilecek, kurulumu ve kullanıcı eğitimi yapılacak.', 'Karaman / Ayrancı', '2026-09-01 13:45:00', 'PLANNED', 1),
(4, 'SAHA-004', 1, 1, 2, 'Periyodik bakım', 'Massey Ferguson 265 için 500 saatlik periyodik bakım yapılacak.', 'Konya / Ereğli', '2026-09-01 15:30:00', 'PLANNED', 1);

INSERT IGNORE INTO field_task_images (field_task_id, image_url, caption, sort_order, uploaded_by) VALUES
(1, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30', 'Hasat alanı öncesi kontrol', 1, 2),
(2, 'https://images.unsplash.com/photo-1500076656116-558758c991c1', 'Yerinde arıza tespiti', 1, 3),
(3, 'https://images.unsplash.com/photo-1530267981375-f0d2f9e7f3b1', 'Teslimat ve kurulum alanı', 1, 5),
(4, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6', 'Periyodik bakım sahası', 1, 2);

-- Örnek stok hareketleri
INSERT IGNORE INTO inventory_movements (id, warehouse_id, spare_part_id, created_by, movement_type, quantity, unit_cost, reference_type, reference_id, note, moved_at) VALUES
(1, 1, 1, 4, 'IN', 26, 5200, 'PURCHASE', 1001, 'Tedarikçi mal kabulü', '2026-08-28 09:00:00'),
(2, 1, 1, 4, 'OUT', 2, 5200, 'ORDER', 1, 'SIP-1048 için rezerve edildi', '2026-09-01 09:25:00'),
(3, 2, 4, 4, 'IN', 9, 2100, 'PURCHASE', 1002, 'Şube stok girişi', '2026-08-30 14:20:00'),
(4, 3, 6, 4, 'OUT', 4, 1100, 'ORDER', 3, 'SIP-1046 sevkiyatı', '2026-08-30 15:10:00');

-- Örnek Teklifler ve Onay Süreci
INSERT IGNORE INTO quotes (id, quote_no, customer_id, branch_id, created_by, status, validity_days, quote_date, valid_until, subtotal, grand_total) VALUES
(1, 'TKL-1001', 2, 1, 5, 'PENDING', 30, '2026-09-01 10:00:00', '2026-10-01 10:00:00', 48750, 48750),
(2, 'TKL-1000', 1, 1, 5, 'APPROVED', 30, '2026-08-31 09:30:00', '2026-09-30 09:30:00', 12400, 12400);

INSERT IGNORE INTO quote_items (quote_id, spare_part_id, quantity, unit_price, discount_rate, line_total) VALUES
(1, 1, 5, 6900, 0, 34500), (1, 2, 30, 480, 5, 13680),
(2, 3, 1, 9800, 0, 9800), (2, 5, 4, 650, 0, 2600);

INSERT IGNORE INTO quote_approvals (id, quote_id, agent_id, status, approval_reason, decided_at) VALUES
(1, 2, 1, 'APPROVED', 'PRICE', '2026-08-31 14:30:00');

-- Yapay Zeka Ajanları
INSERT IGNORE INTO ai_agents (id, agent_name, agent_type, description, model, is_active, is_email_enabled, approval_threshold, auto_approve_enabled, created_by) VALUES
(1, 'Teklif Onay Ajanı', 'QUOTE_APPROVAL', 'Teklifler için otomatik onay ve düşük fiyat uyarısı yapan ajan', 'GPT-4', 1, 1, 50000, 1, 1),
(2, 'Sipariş Yönetim Ajanı', 'ORDER_FULFILLMENT', 'Sipariş hazırlama ve teslimat sürecini izleyen ajan', 'GPT-4', 1, 1, NULL, 0, 1),
(3, 'Envanter Yönetim Ajanı', 'INVENTORY_MANAGEMENT', 'Stok seviyeleri ve sipariş tahmini yapan ajan', 'GPT-4', 1, 0, NULL, 0, 1),
(4, 'Şikayet Yönetim Ajanı', 'COMPLAINT_HANDLER', 'Şikayet ve talepleri sınıflandırarak öncelik belirleyen ajan', 'GPT-4', 1, 1, NULL, 0, 1),
(5, 'Saha Planlama Ajanı', 'FIELD_SCHEDULER', 'Saha görevlerini optimize ederek rota planlayan ajan', 'GPT-4', 1, 0, NULL, 0, 1);

-- ==================== STORED PROCEDURES ====================

-- Prosedür: Teklif onaylandığında sipariş oluştur
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_approve_quote_create_order(
  IN p_quote_id BIGINT UNSIGNED,
  IN p_agent_id BIGINT UNSIGNED
)
BEGIN
  DECLARE v_customer_id BIGINT UNSIGNED;
  DECLARE v_branch_id BIGINT UNSIGNED;
  DECLARE v_subtotal DECIMAL(14,2);
  DECLARE v_discount_total DECIMAL(14,2);
  DECLARE v_grand_total DECIMAL(14,2);
  DECLARE v_order_id BIGINT UNSIGNED;
  DECLARE v_order_no VARCHAR(40);
  DECLARE v_quote_no VARCHAR(40);
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_quote_item_id BIGINT UNSIGNED;
  DECLARE v_spare_part_id BIGINT UNSIGNED;
  DECLARE v_quantity DECIMAL(12,2);
  DECLARE v_unit_price DECIMAL(14,2);
  DECLARE v_discount_rate DECIMAL(5,2);
  DECLARE v_line_total DECIMAL(14,2);
  
  DECLARE quote_items_cursor CURSOR FOR 
    SELECT id, spare_part_id, quantity, unit_price, discount_rate, line_total 
    FROM quote_items 
    WHERE quote_id = p_quote_id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- Teklif bilgilerini al
  SELECT customer_id, branch_id, subtotal, discount_total, grand_total, quote_no
  INTO v_customer_id, v_branch_id, v_subtotal, v_discount_total, v_grand_total, v_quote_no
  FROM quotes
  WHERE id = p_quote_id;

  IF v_quote_no IS NOT NULL THEN
    -- Sipariş numarası oluştur
    SET v_order_no = CONCAT('SIP-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(p_quote_id, 4, '0'));

    -- Sipariş henüz oluşturulmadıysa oluştur
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_no = v_order_no) THEN
      INSERT INTO orders (order_no, customer_id, branch_id, created_by, status, order_date, subtotal, discount_total, grand_total, note)
      VALUES (v_order_no, v_customer_id, v_branch_id, p_agent_id, 'PENDING', NOW(), v_subtotal, v_discount_total, v_grand_total, 
              CONCAT('Teklif ', v_quote_no, ' onaylanarak AI Ajanı tarafından otomatik oluşturulan sipariş'));

      SET v_order_id = LAST_INSERT_ID();

      -- Teklif kalemlerini sipariş kalemlerine kopyala
      OPEN quote_items_cursor;
      read_loop: LOOP
        FETCH quote_items_cursor INTO v_quote_item_id, v_spare_part_id, v_quantity, v_unit_price, v_discount_rate, v_line_total;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        INSERT INTO order_items (order_id, spare_part_id, quantity, unit_price, discount_rate, line_total)
        VALUES (v_order_id, v_spare_part_id, v_quantity, v_unit_price, v_discount_rate, v_line_total);
      END LOOP;
      CLOSE quote_items_cursor;
    END IF;

    -- Teklif durumunu güncelle
    UPDATE quotes SET status = 'CONVERTED', approved_by = p_agent_id, approved_at = NOW() WHERE id = p_quote_id;
  END IF;
END //
DELIMITER ;

-- Prosedür: Teklif reddedildiğinde şikayet-talep kaydı oluştur
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_reject_quote_create_complaint(
  IN p_quote_id BIGINT UNSIGNED,
  IN p_agent_id BIGINT UNSIGNED,
  IN p_rejection_reason VARCHAR(255)
)
BEGIN
  DECLARE v_customer_id BIGINT UNSIGNED;
  DECLARE v_quote_no VARCHAR(40);
  DECLARE v_ticket_no VARCHAR(40);

  -- Teklif bilgilerini al
  SELECT customer_id, quote_no
  INTO v_customer_id, v_quote_no
  FROM quotes
  WHERE id = p_quote_id;

  IF v_quote_no IS NOT NULL THEN
    -- Şikayet numarası oluştur
    SET v_ticket_no = CONCAT('TLP-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(p_quote_id, 4, '0'));

    -- Şikayet-talep tablosuna 'Teklif Talebi' / 'Reddedilen Teklif' konulu kayıt aç
    IF NOT EXISTS (SELECT 1 FROM requests_complaints WHERE ticket_no = v_ticket_no) THEN
      INSERT INTO requests_complaints (ticket_no, customer_id, assigned_user_id, ticket_type, subject, description, priority, status)
      VALUES (v_ticket_no, v_customer_id, p_agent_id, 'COMPLAINT', 
              CONCAT('Teklif Talebi - Reddedilen Teklif (', v_quote_no, ')'),
              CONCAT('Teklif No: ', v_quote_no, ' AI Teklif Kontrol Ajanı tarafından reddedilmiştir. Neden: ', COALESCE(p_rejection_reason, 'Fiyat/stok uygunsuzluğu')),
              'HIGH', 'OPEN');
    END IF;

    -- Teklif durumunu güncelle
    UPDATE quotes SET status = 'REJECTED' WHERE id = p_quote_id;
  END IF;
END //
DELIMITER ;

-- Prosedür: Yapay Zeka Ajanı Teklif Karar Orkestrasyonu
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_process_quote_ai_decision(
  IN p_quote_id BIGINT UNSIGNED,
  IN p_agent_id BIGINT UNSIGNED,
  IN p_decision VARCHAR(20),
  IN p_reason VARCHAR(255),
  IN p_notes VARCHAR(500)
)
BEGIN
  IF p_decision = 'APPROVED' OR p_decision = 'ONAYLANDI' THEN
    -- Onay kaydı oluştur
    INSERT INTO quote_approvals (quote_id, agent_id, status, approval_reason, decision_notes, decided_at)
    VALUES (p_quote_id, p_agent_id, 'APPROVED', COALESCE(p_reason, 'PRICE'), COALESCE(p_notes, 'AI Ajan Onayı'), NOW());
    
    -- Sipariş aç
    CALL sp_approve_quote_create_order(p_quote_id, p_agent_id);
  ELSEIF p_decision = 'REJECTED' OR p_decision = 'REDDEDILDI' THEN
    -- Red kaydı oluştur
    INSERT INTO quote_approvals (quote_id, agent_id, status, rejection_reason, decision_notes, decided_at)
    VALUES (p_quote_id, p_agent_id, 'REJECTED', COALESCE(p_reason, 'PRICE_MISMATCH'), COALESCE(p_notes, 'AI Ajan Reddi'), NOW());
    
    -- Şikayet/talep aç
    CALL sp_reject_quote_create_complaint(p_quote_id, p_agent_id, p_reason);
  END IF;
END //
DELIMITER ;

-- ==================== TRIGGERS ====================

-- Trigger: Teklif onaylanırsa otomatik sipariş aç, reddedilirse şikayet-talep kaydı oluştur (quote_approvals tablosuna INSERT olduğunda)
DELIMITER //
CREATE TRIGGER IF NOT EXISTS tr_quote_approval_ai_decision
AFTER INSERT ON quote_approvals
FOR EACH ROW
BEGIN
  IF NEW.status = 'APPROVED' THEN
    CALL sp_approve_quote_create_order(NEW.quote_id, NEW.agent_id);
  ELSEIF NEW.status = 'REJECTED' THEN
    CALL sp_reject_quote_create_complaint(NEW.quote_id, NEW.agent_id, NEW.rejection_reason);
  END IF;
END //
DELIMITER ;

-- Trigger: 'Teklif Talebi' veya 'Teklif Alebi' konulu şikayet/talep oluşturulduğunda sistem bildirim ve log trigger'ı
DELIMITER //
CREATE TRIGGER IF NOT EXISTS tr_complaint_quote_request_notify
AFTER INSERT ON requests_complaints
FOR EACH ROW
BEGIN
  IF NEW.subject LIKE '%Teklif Talebi%' OR NEW.subject LIKE '%Teklif Alebi%' OR NEW.subject LIKE '%Reddedilen Teklif%' THEN
    -- Otomatik email / sistem bildirimi kaydı düş
    INSERT INTO email_logs (recipient_email, subject, email_type, reference_id, reference_type, body_preview, status)
    VALUES ('yonetim@agroplus.com',
            CONCAT('Müşteri Şikayet/Talebi Oluşturuldu: ', NEW.subject),
            'COMPLAINT_RESPONSE',
            NEW.id,
            'COMPLAINT',
            CONCAT('Teklif sürecine bağlı şikayet kaydı açıldı. Talep No: ', NEW.ticket_no),
            'SENT');
  END IF;
END //
DELIMITER ;

