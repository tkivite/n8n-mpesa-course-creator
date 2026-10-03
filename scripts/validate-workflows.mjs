#!/usr/bin/env node
/**
 * Validate every workflow JSON in workflows/ and workflows/use-cases/.
 *
 * Checks:
 *   • Parses as JSON
 *   • Has required top-level keys: name, nodes, connections
 *   • Every node has id, name, type, position, typeVersion
 *   • Node names referenced in `connections` all exist
 *   • Exactly one trigger node per workflow (warn only; sub-workflows OK)
 *   • No duplicate node names (connections key by name)
 *
 * Exit code: 0 if clean, 1 if any workflow fails.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIRS = [
  path.join(ROOT, 'workflows'),
  path.join(ROOT, 'workflows', 'use-cases'),
  path.join(ROOT, 'workflows', 'access'),
];

const TRIGGER_TYPES = new Set([
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.executeWorkflowTrigger',
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.cron',
]);

const REQUIRED_NODE_KEYS = ['id', 'name', 'type', 'position', 'typeVersion'];
const REQUIRED_TOP_KEYS = ['name', 'nodes', 'connections'];

async function validateFile(file) {
  const errs = [];
  const warns = [];

  let raw;
  try { raw = await readFile(file, 'utf8'); }
  catch (e) { return { errs: [`cannot read: ${e.message}`], warns }; }

  let wf;
  try { wf = JSON.parse(raw); }
  catch (e) { return { errs: [`invalid JSON: ${e.message}`], warns }; }

  for (const k of REQUIRED_TOP_KEYS) {
    if (!(k in wf)) errs.push(`missing top-level key: ${k}`);
  }
  if (!Array.isArray(wf.nodes)) {
    errs.push('nodes must be an array');
    return { errs, warns };
  }

  // Node checks
  const names = new Set();
  const triggers = [];
  for (const [i, node] of wf.nodes.entries()) {
    for (const k of REQUIRED_NODE_KEYS) {
      if (!(k in node)) errs.push(`node[${i}] (${node.name ?? '?'}): missing ${k}`);
    }
    if (!Array.isArray(node.position) || node.position.length !== 2) {
      errs.push(`node[${i}] (${node.name}): position must be [x, y]`);
    }
    if (node.name) {
      if (names.has(node.name)) errs.push(`duplicate node name: "${node.name}"`);
      names.add(node.name);
    }
    if (TRIGGER_TYPES.has(node.type)) triggers.push(node.name);
  }

  // Connections keyed by node NAME; all referenced nodes must exist
  if (wf.connections && typeof wf.connections === 'object') {
    for (const [src, outputs] of Object.entries(wf.connections)) {
      if (!names.has(src)) errs.push(`connection source "${src}" does not match any node`);
      if (outputs?.main && Array.isArray(outputs.main)) {
        for (const branch of outputs.main) {
          if (!Array.isArray(branch)) continue;
          for (const link of branch) {
            if (!link?.node) continue;
            if (!names.has(link.node)) errs.push(`connection target "${link.node}" (from "${src}") does not match any node`);
          }
        }
      }
    }
  }

  if (triggers.length === 0) warns.push('no trigger node found (OK for sub-workflows only)');
  if (triggers.length > 1) warns.push(`multiple triggers: ${triggers.join(', ')}`);

  return { errs, warns };
}

async function main() {
  let totalFiles = 0, failed = 0, warned = 0;

  for (const dir of DIRS) {
    let entries;
    try { entries = await readdir(dir); } catch { continue; }
    const files = entries.filter(f => f.endsWith('.json')).map(f => path.join(dir, f));
    for (const file of files) {
      totalFiles++;
      const rel = path.relative(ROOT, file);
      const { errs, warns } = await validateFile(file);
      if (errs.length === 0 && warns.length === 0) {
        console.log(`  ✓ ${rel}`);
      } else {
        if (errs.length) {
          failed++;
          console.log(`  ✗ ${rel}`);
          errs.forEach(e => console.log(`      ERROR: ${e}`));
        } else {
          console.log(`  ✓ ${rel}`);
        }
        if (warns.length) {
          warned++;
          warns.forEach(w => console.log(`      warn:  ${w}`));
        }
      }
    }
  }

  console.log(`\n${totalFiles} workflows checked. ${failed} failed, ${warned} with warnings.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });

