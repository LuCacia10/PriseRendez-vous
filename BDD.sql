-- ============================================================================
-- SCHÉMA DE BASE DE DONNÉES MYSQL 8.0+ (OFFICIEL & PRODUCTION)
-- APPLICATION DE RENDEZ-VOUS ADMINISTRATIFS
-- Backend : Node.js (Express & TypeScript)
-- Frontend : Mobile Flutter (Dart)
-- Fichier : BDD.sql
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Création de la Base de Données
-- ----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `rendezvous_admin_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `rendezvous_admin_db`;

-- ----------------------------------------------------------------------------
-- 2. Table des Agences / Guichets Physiques (Mairies, Préfectures, etc.)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `agencies`;
CREATE TABLE `agencies` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `opening_hours` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_agencies_city` (`city`),
  INDEX `idx_agencies_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table des Utilisateurs (Citoyens, Agents Guichet, Administrateurs)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `identity_card_num` VARCHAR(50) DEFAULT NULL,
  `role` ENUM('citizen', 'agent', 'admin') NOT NULL DEFAULT 'citizen',
  `fcm_token` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table des Démarches Administratives (CNI, Passeport, État Civil...)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `required_documents` JSON NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 15,
  `max_slots_per_time` INT NOT NULL DEFAULT 3,
  `icon_name` VARCHAR(50) DEFAULT 'FileText',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_services_category` (`category`),
  INDEX `idx_services_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table d'Association Agences <-> Démarches Disponibles
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `agency_services`;
CREATE TABLE `agency_services` (
  `agency_id` VARCHAR(36) NOT NULL,
  `service_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`agency_id`, `service_id`),
  CONSTRAINT `fk_as_agency` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_as_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table des Créneaux Horaires (Capacité & Disponibilité en temps réel)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE `time_slots` (
  `id` VARCHAR(64) NOT NULL,
  `service_id` VARCHAR(36) NOT NULL,
  `agency_id` VARCHAR(36) NOT NULL,
  `slot_date` DATE NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 3,
  `booked_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slot_lock` (`service_id`, `agency_id`, `slot_date`, `start_time`),
  INDEX `idx_slots_date_agency` (`slot_date`, `agency_id`),
  CONSTRAINT `fk_slot_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_slot_agency` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table Principale des Rendez-vous & Pass QR Codes
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` VARCHAR(36) NOT NULL,
  `appointment_number` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `service_id` VARCHAR(36) NOT NULL,
  `agency_id` VARCHAR(36) NOT NULL,
  `slot_date` DATE NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `status` ENUM('en_attente', 'confirme', 'honore', 'annule', 'absent') NOT NULL DEFAULT 'confirme',
  `qr_code_payload` TEXT NOT NULL,
  `qr_code_data_url` LONGTEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `validated_at` DATETIME DEFAULT NULL,
  `validated_by` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_appointment_number` (`appointment_number`),
  INDEX `idx_appts_user` (`user_id`),
  INDEX `idx_appts_date` (`slot_date`, `start_time`),
  INDEX `idx_appts_status` (`status`),
  INDEX `idx_appts_agency` (`agency_id`),
  CONSTRAINT `fk_appt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appt_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appt_agency` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appt_validator` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table des Notifications Push Firebase Cloud Messaging (FCM)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `appointment_id` VARCHAR(36) DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('confirmation', 'rappel_24h', 'rappel_1h', 'annulation', 'modification', 'validation') NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifs_user_read` (`user_id`, `is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Données Initiales de Démonstration (Seeds MySQL)
-- ----------------------------------------------------------------------------

-- Agences Physiques
INSERT INTO `agencies` (`id`, `name`, `address`, `city`, `postal_code`, `phone`, `opening_hours`) VALUES
('ag-1', 'Hôtel de Ville Principal', '1 Place de la République', 'Paris', '75011', '01 44 55 66 77', 'Lun - Ven : 08h30 - 17h30'),
('ag-2', 'Maison des Services Publics & Citoyenneté', '14 Avenue Jean Jaurès', 'Lyon', '69007', '04 78 99 00 11', 'Lun - Ven : 09h00 - 18h00'),
('ag-3', 'Antenne Préfectorale & Guichet Titres', '8 Boulevard de la Liberté', 'Marseille', '13001', '04 91 22 33 44', 'Lun - Sam : 08h00 - 16h30');

-- Utilisateurs (Mot de passe pour tous les comptes de test = 'password123')
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `first_name`, `phone`, `role`) VALUES
('usr-citizen-1', 'citoyen@demo.fr', '$2a$10$w8TKnk9655E9uA2n476hM.w3Bf0mGqEsh5F02hRz90c1GvT.1yQye', 'Dupont', 'Thomas', '06 12 34 56 78', 'citizen'),
('usr-agent-1', 'agent@guichet.fr', '$2a$10$w8TKnk9655E9uA2n476hM.w3Bf0mGqEsh5F02hRz90c1GvT.1yQye', 'Martin', 'Claire (Guichet 4)', '01 44 55 00 04', 'agent'),
('usr-admin-1', 'admin@admin.fr', '$2a$10$w8TKnk9655E9uA2n476hM.w3Bf0mGqEsh5F02hRz90c1GvT.1yQye', 'Directrice', 'Valérie (Responsable Admin)', '01 42 68 00 99', 'admin');

-- Démarches Administratives & Justificatifs
INSERT INTO `services` (`id`, `name`, `category`, `description`, `required_documents`, `duration_minutes`, `max_slots_per_time`, `icon_name`) VALUES
('srv-cni', 'Carte Nationale d\'Identité (CNI)', 'Titres d\'identité', 'Dépôt du dossier de première demande ou renouvellement de CNI.', '["Pré-demande ANTS", "Photo d\'identité < 6 mois", "Justificatif de domicile < 1 an", "Ancienne CNI"]', 15, 3, 'CreditCard'),
('srv-passeport', 'Passeport Biométrique', 'Titres d\'identité', 'Délivrance ou renouvellement du passeport biométrique et prise d\'empreintes.', '["Pré-demande ANTS", "Timbre fiscal électronique", "Photo d\'identité conforme", "Justificatif de domicile"]', 20, 2, 'FileText'),
('srv-etatcivil', 'Actes d\'État Civil & Naissance', 'Citoyenneté', 'Déclaration de naissance, reconnaissance, délivrance de copie intégrale ou extrait.', '["Pièce d\'identité", "Livret de famille", "Justificatif d\'adresse"]', 15, 4, 'Users'),
('srv-mariage', 'Dossier de Mariage / PACS', 'Vie Citoyenne', 'Dépôt et instruction des pièces pour célébration de mariage ou conclusion de PACS.', '["Copies intégrales d\'acte de naissance", "Pièces d\'identité des partenaires", "Attestation sur l\'honneur", "Justificatif de domicile séparé"]', 30, 2, 'HeartHandshake'),
('srv-permis', 'Permis de Conduire & Certificat d\'Immatriculation', 'Mobilité', 'Point d\'accueil numérique et vérification des démarches dématérialisées de transport.', '["Pièce d\'identité valide", "Code e-photo numérique", "Justificatif de domicile", "Ancien permis / Certificat"]', 15, 3, 'Car');

-- Association Démarches <-> Agences
INSERT INTO `agency_services` (`agency_id`, `service_id`) VALUES
('ag-1', 'srv-cni'),
('ag-1', 'srv-passeport'),
('ag-1', 'srv-etatcivil'),
('ag-1', 'srv-mariage'),
('ag-1', 'srv-permis'),
('ag-2', 'srv-cni'),
('ag-2', 'srv-passeport'),
('ag-2', 'srv-etatcivil'),
('ag-3', 'srv-cni'),
('ag-3', 'srv-passeport'),
('ag-3', 'srv-permis');

SET FOREIGN_KEY_CHECKS = 1;
