CREATE DATABASE IF NOT EXISTS bitacora_inspeccion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bitacora_inspeccion;

CREATE TABLE IF NOT EXISTS inspectors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inspector_id INT NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  location_name VARCHAR(150) NOT NULL,
  address VARCHAR(255),
  status ENUM('in_progress','completed','cancelled') DEFAULT 'in_progress',
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  steps_detected INT DEFAULT 0,
  distance_m DECIMAL(8,2) DEFAULT 0,
  motion_summary VARCHAR(50),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inspector_id) REFERENCES inspectors(id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT NOT NULL,
  type ENUM('image','video','document') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);
