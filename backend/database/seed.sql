-- ============================================================
-- EasyBills — Seed Data
-- ============================================================

-- ------------------------------------------------------------
-- Network providers.
-- `id` doubles as the ePINs `network` param for /airtime/ (see
-- EpinsClient::AIRTIME_NETWORK_MAP for the 9mobile -> etisalat alias).
-- ------------------------------------------------------------
INSERT INTO network_providers (id, name, color, logo_initial, status) VALUES
    ('mtn', 'MTN', '#FFCC08', 'M', 'active'),
    ('airtel', 'Airtel', '#E5484D', 'A', 'active'),
    ('glo', 'Glo', '#22A559', 'G', 'active'),
    ('9mobile', '9mobile', '#0EA894', '9', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------
-- Electricity DisCos. `id` MUST match the ePINs `serviceId` exactly
-- (confirmed set from the ePINs docs: ikeja-electric, eko-electric,
-- portharcourt-electric, jos-electric, kano-electric, ibadan-electric,
-- enugu-electric, abuja-electric, benin-electric).
-- ------------------------------------------------------------
INSERT INTO electricity_providers (id, name, region, status) VALUES
    ('ikeja-electric', 'Ikeja Electric (IKEDC)', 'Lagos', 'active'),
    ('eko-electric', 'Eko Electricity (EKEDC)', 'Lagos', 'active'),
    ('abuja-electric', 'Abuja Electricity (AEDC)', 'Abuja/FCT', 'active'),
    ('kano-electric', 'Kano Electricity (KEDCO)', 'Kano', 'active'),
    ('portharcourt-electric', 'Port Harcourt Electric (PHED)', 'Rivers', 'active'),
    ('ibadan-electric', 'Ibadan Electricity (IBEDC)', 'Oyo', 'active'),
    ('enugu-electric', 'Enugu Electricity (EEDC)', 'Enugu', 'active'),
    ('jos-electric', 'Jos Electricity (JED)', 'Plateau', 'active'),
    ('benin-electric', 'Benin Electricity (BEDC)', 'Edo', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------
-- Data plans.
-- IMPORTANT: `epins_plan_code` values below are PLACEHOLDERS.
-- Before going live, call:
--     GET {baseurl}/v2/autho/variations/?service=data
-- (see EpinsClient::getVariations('data')) using your real ePINs API
-- key, and replace every REPLACE_ME_* code with the real variation
-- code + wholesale price ePINs returns for that plan. Prices below are
-- placeholders taken from the frontend mock data, not live ePINs rates.
-- ------------------------------------------------------------
INSERT INTO data_plans (id, provider_id, label, size, validity, price, cost_price, epins_plan_code, status) VALUES
    ('dp1', 'mtn', 'Daily 100MB', '100MB', '1 day', 100, 85, 'REPLACE_ME_MTN_100MB_1D', 'active'),
    ('dp2', 'mtn', 'Weekly 1.5GB', '1.5GB', '7 days', 500, 460, 'REPLACE_ME_MTN_1_5GB_7D', 'active'),
    ('dp3', 'mtn', 'Monthly 5GB', '5GB', '30 days', 1500, 1380, 'REPLACE_ME_MTN_5GB_30D', 'active'),
    ('dp4', 'mtn', 'Monthly 10GB', '10GB', '30 days', 2500, 2320, 'REPLACE_ME_MTN_10GB_30D', 'active'),
    ('dp5', 'airtel', 'Daily 200MB', '200MB', '1 day', 100, 88, 'REPLACE_ME_AIRTEL_200MB_1D', 'active'),
    ('dp6', 'airtel', 'Weekly 2GB', '2GB', '7 days', 600, 555, 'REPLACE_ME_AIRTEL_2GB_7D', 'active'),
    ('dp7', 'airtel', 'Monthly 6GB', '6GB', '30 days', 1800, 1670, 'REPLACE_ME_AIRTEL_6GB_30D', 'active'),
    ('dp8', 'glo', 'Weekly 2.5GB', '2.5GB', '7 days', 550, 505, 'REPLACE_ME_GLO_2_5GB_7D', 'active'),
    ('dp9', 'glo', 'Monthly 7.5GB', '7.5GB', '30 days', 2000, 1860, 'REPLACE_ME_GLO_7_5GB_30D', 'active'),
    ('dp10', '9mobile', 'Weekly 1GB', '1GB', '7 days', 450, 410, 'REPLACE_ME_9MOBILE_1GB_7D', 'active'),
    ('dp11', '9mobile', 'Monthly 4.5GB', '4.5GB', '30 days', 1600, 1475, 'REPLACE_ME_9MOBILE_4_5GB_30D', 'active')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- ------------------------------------------------------------
-- Pricing rules — the platform "Profit System": admin sets a margin
-- (fixed ₦ or %) on top of ePINs' wholesale cost. Airtime example from
-- the product spec: cost ₦980 + ₦30 fixed margin = customer pays ₦1,010.
-- ------------------------------------------------------------
INSERT INTO pricing_rules (service_category, margin_type, margin_value) VALUES
    ('airtime', 'fixed', 30),
    ('electricity', 'percentage', 1.0),
    ('cable', 'fixed', 50),
    ('exam-pin', 'percentage', 5.8)
ON DUPLICATE KEY UPDATE margin_type = VALUES(margin_type);

-- ------------------------------------------------------------
-- Default admin user.
-- Email: admin@easybills.example  Password: ChangeMe123!
-- CHANGE THIS PASSWORD IMMEDIATELY after your first login.
-- Hash below is a REAL, verified password_hash('ChangeMe123!', PASSWORD_BCRYPT)
-- output (generated with PHP 8.3 and confirmed with password_verify()).
-- ------------------------------------------------------------
INSERT INTO admin_users (name, email, password_hash, role, status) VALUES
    ('Super Admin', 'admin@easybills.example', '$2y$10$i8PYefNcKpSK4JKMwuhHcu97kCUCZmE5Qmqmx/B964IKZazDIrywe', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO roles (name, permissions) VALUES
    ('Super Admin', '["*"]'),
    ('Operations Manager', '["transactions","orders","wallets","reports"]'),
    ('Support Agent', '["support_tickets","customers:read"]'),
    ('Content Editor', '["blog","pages","announcements"]'),
    ('Finance', '["revenue","commissions","pricing","profit_settings"]')
ON DUPLICATE KEY UPDATE permissions = VALUES(permissions);
