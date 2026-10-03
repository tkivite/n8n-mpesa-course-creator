-- =============================================================
-- Course Access Control Schema
-- Tables for tracking purchases, access grants, and revocations.
-- Load alongside db/schema.sql on the same Postgres instance.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- purchases
-- One row per completed sale. Immutable except for `refunded_at`.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider           VARCHAR(32) NOT NULL,          -- 'gumroad', 'lemonsqueezy', 'paystack', 'mpesa'
    provider_sale_id   TEXT UNIQUE NOT NULL,          -- their TX id (also the "receipt" buyer enters)
    product_tier       VARCHAR(32) NOT NULL,          -- 'starter', 'pro', 'agency'
    buyer_email        VARCHAR(255) NOT NULL,
    buyer_name         TEXT,
    amount_usd         NUMERIC(10, 2),
    purchased_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    refunded_at        TIMESTAMPTZ,
    metadata           JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_purchases_email   ON purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_tier    ON purchases(product_tier);
CREATE INDEX IF NOT EXISTS idx_purchases_refund  ON purchases(refunded_at) WHERE refunded_at IS NULL;

-- -------------------------------------------------------------
-- access_grants
-- One row per GitHub-user granted to one purchase.
-- A purchase can grant access to multiple seats (Agency tier).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_grants (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id        UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    github_username    VARCHAR(100) NOT NULL,
    github_invite_id   BIGINT,                        -- returned by GitHub API; needed to revoke
    granted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at         TIMESTAMPTZ,
    revoke_reason      TEXT,
    UNIQUE (purchase_id, github_username)
);

CREATE INDEX IF NOT EXISTS idx_grants_username ON access_grants(github_username);
CREATE INDEX IF NOT EXISTS idx_grants_active   ON access_grants(revoked_at) WHERE revoked_at IS NULL;

-- -------------------------------------------------------------
-- access_attempts
-- Audit log: every claim attempt (success or failure).
-- Lets you detect brute-force receipt guessing.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_attempts (
    id                 BIGSERIAL PRIMARY KEY,
    submitted_receipt  TEXT,
    submitted_github   TEXT,
    source_ip          INET,
    user_agent         TEXT,
    outcome            VARCHAR(32) NOT NULL,          -- 'granted', 'invalid_receipt', 'already_used', 'refunded', 'invalid_github'
    reason             TEXT,
    attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_ip       ON access_attempts(source_ip, attempted_at);
CREATE INDEX IF NOT EXISTS idx_attempts_outcome  ON access_attempts(outcome, attempted_at);

-- -------------------------------------------------------------
-- Seat quotas per tier
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW tier_seat_quota AS
SELECT 'starter'::text  AS tier, 1 AS seats
UNION ALL SELECT 'pro',    1
UNION ALL SELECT 'agency', 5;

-- -------------------------------------------------------------
-- Convenience: how many seats has a purchase used?
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW purchase_seat_usage AS
SELECT
    p.id                    AS purchase_id,
    p.product_tier,
    q.seats                 AS seats_total,
    COUNT(g.id) FILTER (WHERE g.revoked_at IS NULL) AS seats_used,
    q.seats - COUNT(g.id) FILTER (WHERE g.revoked_at IS NULL) AS seats_remaining
FROM purchases p
JOIN tier_seat_quota q ON q.tier = p.product_tier
LEFT JOIN access_grants g ON g.purchase_id = p.id
GROUP BY p.id, p.product_tier, q.seats;

