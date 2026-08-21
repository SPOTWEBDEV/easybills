-- ============================================================
-- EasyBills PHP Backend — Database Schema
-- MySQL 8.0+ / MariaDB 10.4+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Users & Auth
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_initials VARCHAR(4) DEFAULT 'U',
    kyc_status ENUM('unverified','pending','verified') NOT NULL DEFAULT 'unverified',
    tier ENUM('Tier 1','Tier 2','Tier 3') NOT NULL DEFAULT 'Tier 1',
    status ENUM('pending_verification','active','suspended') NOT NULL DEFAULT 'pending_verification',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS otp_codes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose ENUM('register','login','reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    consumed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_otp_user_purpose (user_id, purpose),
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Wallet & Money movement
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wallets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    balance DECIMAL(14,2) NOT NULL DEFAULT 0,
    cashback DECIMAL(14,2) NOT NULL DEFAULT 0,
    account_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL DEFAULT 'EasyBills Microfinance Bank',
    account_name VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wallets_user (user_id),
    UNIQUE KEY uq_wallets_account_number (account_number),
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    reference VARCHAR(40) NOT NULL,
    category ENUM('airtime','data','electricity','cable','water','exam-pin','wallet-funding','betting') NOT NULL,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(150) DEFAULT NULL,
    amount DECIMAL(14,2) NOT NULL,
    fee DECIMAL(14,2) NOT NULL DEFAULT 0,
    status ENUM('success','pending','failed') NOT NULL DEFAULT 'pending',
    provider VARCHAR(100) DEFAULT NULL,
    recipient VARCHAR(100) DEFAULT NULL,
    balance_after DECIMAL(14,2) DEFAULT NULL,
    provider_ref VARCHAR(100) DEFAULT NULL,
    provider_payload JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_transactions_reference (reference),
    KEY idx_transactions_user (user_id, created_at),
    KEY idx_transactions_status (status),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------------
-- Catalog: networks, data plans, electricity DisCos, pricing
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS network_providers (
    id VARCHAR(30) PRIMARY KEY,           -- e.g. 'mtn' — also the ePINs `network` param
    name VARCHAR(60) NOT NULL,
    color VARCHAR(10) NOT NULL DEFAULT '#0EA894',
    logo_initial VARCHAR(4) NOT NULL,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS data_plans (
    id VARCHAR(30) PRIMARY KEY,
    provider_id VARCHAR(30) NOT NULL,
    label VARCHAR(60) NOT NULL,
    size VARCHAR(30) NOT NULL,
    validity VARCHAR(30) NOT NULL,
    price DECIMAL(12,2) NOT NULL,          -- what the customer pays (already includes margin)
    cost_price DECIMAL(12,2) NOT NULL,     -- wholesale cost from ePINs
    epins_plan_code VARCHAR(30) NOT NULL,  -- the `DataPlan` value ePINs expects
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    KEY idx_data_plans_provider (provider_id),
    CONSTRAINT fk_data_plans_provider FOREIGN KEY (provider_id) REFERENCES network_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS electricity_providers (
    id VARCHAR(40) PRIMARY KEY,           -- must match ePINs `serviceId`, e.g. 'ikeja-electric'
    name VARCHAR(80) NOT NULL,
    region VARCHAR(60) NOT NULL,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pricing_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_category VARCHAR(40) NOT NULL,  -- 'airtime' | 'electricity' | 'cable' | 'exam-pin' ...
    margin_type ENUM('fixed','percentage') NOT NULL DEFAULT 'fixed',
    margin_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pricing_category (service_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Agents, commissions, referrals
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS agents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    tier ENUM('Bronze','Silver','Gold') NOT NULL DEFAULT 'Bronze',
    total_sales DECIMAL(14,2) NOT NULL DEFAULT 0,
    commission_earned DECIMAL(14,2) NOT NULL DEFAULT 0,
    status ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_agents_user (user_id),
    CONSTRAINT fk_agents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    agent_id INT UNSIGNED NOT NULL,
    transaction_id INT UNSIGNED DEFAULT NULL,
    service VARCHAR(60) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    rate VARCHAR(10) NOT NULL,
    status ENUM('paid','pending') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commissions_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    CONSTRAINT fk_commissions_txn FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS referrals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT UNSIGNED NOT NULL,
    referred_id INT UNSIGNED NOT NULL,
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 500,
    status ENUM('pending','earned') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_referrals_referred (referred_id),
    CONSTRAINT fk_referrals_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_referrals_referred FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Coupons, announcements, notifications
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    discount_type ENUM('percentage','fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    usage_limit INT UNSIGNED NOT NULL DEFAULT 0,
    used INT UNSIGNED NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    status ENUM('active','expired','scheduled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    audience ENUM('All users','Agents','New users') NOT NULL DEFAULT 'All users',
    status ENUM('published','scheduled','draft') NOT NULL DEFAULT 'draft',
    published_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    type VARCHAR(40) NOT NULL DEFAULT 'general',
    read_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notifications_user (user_id, created_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Support
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    subject VARCHAR(200) NOT NULL,
    priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    status ENUM('open','in_progress','resolved') NOT NULL DEFAULT 'open',
    assigned_to VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT UNSIGNED NOT NULL,
    sender_type ENUM('user','admin') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- CMS: blog, pages
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS blog_posts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    author VARCHAR(100) NOT NULL,
    content MEDIUMTEXT,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    views INT UNSIGNED NOT NULL DEFAULT 0,
    published_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_blog_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    content MEDIUMTEXT,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Admin, roles, logs, API keys
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    permissions JSON DEFAULT NULL,
    UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(60) NOT NULL DEFAULT 'admin',
    status ENUM('active','disabled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor VARCHAR(190) NOT NULL,
    action VARCHAR(200) NOT NULL,
    target VARCHAR(255) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    action VARCHAR(200) NOT NULL,
    device VARCHAR(150) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_activity_user (user_id, created_at),
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_keys (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(150) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_preview VARCHAR(40) NOT NULL,
    status ENUM('active','revoked') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
