#!/usr/bin/env node
/**
 * Manually revoke course repo access for one or more GitHub users.
 *
 * Use when:
 *   - Chargeback / dispute outside Gumroad's automated flow
 *   - User violated terms (sharing credentials, etc.)
 *   - Agency tier seat transfer
 *
 * Usage:
 *   node scripts/revoke-access.mjs --user <github-username> [--reason "chargeback"]
 *   node scripts/revoke-access.mjs --purchase <uuid> [--reason "..."]  # revoke ALL grants for a purchase
 *
 * Required env:
 *   GH_REPO_OWNER       e.g. "tkivite"
 *   GH_REPO_NAME        e.g. "n8n-mpesa-course-consumer"
 *   GH_ADMIN_TOKEN      fine-grained PAT with "Administration: Read & Write" on the repo
 *   DATABASE_URL        postgres://user:pass@host:5432/db
 */
import pg from 'pg';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    user:     { type: 'string' },
    purchase: { type: 'string' },
    reason:   { type: 'string', default: 'manual revoke' },
    'dry-run': { type: 'boolean', default: false }
  }
});

if (!values.user && !values.purchase) {
  console.error('Usage: revoke-access.mjs --user <github> OR --purchase <uuid> [--reason "..."] [--dry-run]');
  process.exit(1);
}

const owner = process.env.GH_REPO_OWNER;
const repo  = process.env.GH_REPO_NAME;
const token = process.env.GH_ADMIN_TOKEN;
const dbUrl = process.env.DATABASE_URL;

for (const [k, v] of Object.entries({ GH_REPO_OWNER: owner, GH_REPO_NAME: repo, GH_ADMIN_TOKEN: token, DATABASE_URL: dbUrl })) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
}

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

// 1. Find active grants to revoke
const sql = values.user
  ? `SELECT id, github_username FROM access_grants
     WHERE github_username = $1 AND revoked_at IS NULL`
  : `SELECT id, github_username FROM access_grants
     WHERE purchase_id = $1 AND revoked_at IS NULL`;
const { rows } = await client.query(sql, [values.user || values.purchase]);

if (!rows.length) {
  console.log('No active grants found. Nothing to do.');
  await client.end();
  process.exit(0);
}

console.log(`Found ${rows.length} active grant(s). Revoking…`);

for (const row of rows) {
  const url = `https://api.github.com/repos/${owner}/${repo}/collaborators/${row.github_username}`;
  console.log(`  → ${row.github_username}`);

  if (values['dry-run']) {
    console.log(`    (dry-run) would DELETE ${url}`);
    continue;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'n8n-mpesa-course-revoke-cli'
    }
  });

  if (res.status === 204 || res.status === 404) {
    // 204 = removed; 404 = already gone (idempotent, fine)
    await client.query(
      `UPDATE access_grants SET revoked_at = NOW(), revoke_reason = $1 WHERE id = $2`,
      [values.reason, row.id]
    );
    console.log(`    ✓ removed from GitHub (${res.status})`);
  } else {
    const body = await res.text();
    console.log(`    ✗ GitHub ${res.status}: ${body}`);
  }
}

await client.end();
console.log('Done.');

