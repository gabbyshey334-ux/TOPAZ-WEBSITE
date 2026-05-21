#!/usr/bin/env node
/**
 * Build the JSON args object for the Supabase MCP `deploy_edge_function`
 * tool from the current contents of a function directory.
 *
 * Usage:
 *   node scripts/build_deploy_args.mjs <function-name> <verify_jwt> [out-file]
 *
 * Example:
 *   node scripts/build_deploy_args.mjs send-contact-notification true \
 *     _mcp_deploy_send_contact_notification.args.min.json
 *
 * Reads every regular file inside `supabase/functions/<function-name>/`
 * (recursively), wraps them into the `files` array, and writes a
 * minified single-line JSON object suitable for piping into the MCP
 * deploy tool's `arguments` parameter.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const PROJECT_ID = 'tklkexenzewscgdszlrq';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const fnName = process.argv[2];
const verifyJwt = (process.argv[3] ?? 'true') === 'true';
const outFile = process.argv[4];

if (!fnName) {
  console.error('Usage: build_deploy_args.mjs <function-name> <verify_jwt> [out-file]');
  process.exit(1);
}

const root = join('supabase', 'functions', fnName);
const sharedRoot = join('supabase', 'functions', '_shared');
const filePaths = [
  ...walk(root),
  ...(fnName.startsWith('sync-to-scoring') ||
  fnName.startsWith('delete-from-scoring') ||
  fnName.startsWith('cleanup-scoring')
    ? walk(sharedRoot)
    : []),
];
const files = filePaths
  .filter((p) => /\.(ts|js|json|jsonc)$/.test(p))
  .map((p) => ({
    name: p.startsWith(sharedRoot)
      ? `../_shared/${relative(sharedRoot, p)}`
      : relative(root, p),
    content: readFileSync(p, 'utf8'),
  }));

const args = {
  project_id: PROJECT_ID,
  name: fnName,
  entrypoint_path: 'index.ts',
  verify_jwt: verifyJwt,
  files,
};

const json = JSON.stringify(args);
if (outFile) {
  writeFileSync(outFile, json);
  process.stderr.write(`wrote ${outFile} (${json.length} bytes, ${files.length} files)\n`);
} else {
  process.stdout.write(json);
}
