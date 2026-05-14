#!/usr/bin/env node
/**
 * Prints a single-line JSON object suitable for user-supabase MCP
 * `deploy_edge_function` `arguments` field.
 *
 * Usage: node scripts/emit-deploy-arg.js <function-slug> [verify_jwt true|false]
 */
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
const verifyJwt = process.argv[3] !== 'false';
if (!slug) {
  console.error('Usage: node scripts/emit-deploy-arg.js <function-slug> [verify_jwt true|false]');
  process.exit(1);
}

const root = path.join(__dirname, '..', 'supabase', 'functions', slug, 'index.ts');
const content = fs.readFileSync(root, 'utf8');

const args = {
  project_id: 'tklkexenzewscgdszlrq',
  name: slug,
  entrypoint_path: 'index.ts',
  verify_jwt: verifyJwt,
  files: [{ name: 'index.ts', content }],
};

process.stdout.write(JSON.stringify(args));
