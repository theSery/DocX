#!/usr/bin/env node
/**
 * Fails early when .env is missing or incomplete so Metro / Xcode
 * do not die mid-bundle with an opaque PhaseScriptExecution error.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const EXAMPLE_PATH = path.join(ROOT, '.env.example');

function fail(message) {
  console.error(`\n[env] ${message}\n`);
  process.exit(1);
}

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

if (!fs.existsSync(ENV_PATH)) {
  fail(
    'Missing .env file.\n' +
      '  Copy .env.example to .env, fill in the values, then retry:\n' +
      '  cp .env.example .env',
  );
}

if (!fs.existsSync(EXAMPLE_PATH)) {
  fail('Missing .env.example — cannot validate required keys.');
}

const requiredKeys = Object.keys(parseEnvFile(EXAMPLE_PATH));
const envValues = parseEnvFile(ENV_PATH);
const missing = requiredKeys.filter(
  key => envValues[key] === undefined || envValues[key] === '',
);

if (missing.length > 0) {
  fail(
    `Missing required environment variable(s) in .env:\n` +
      missing.map(key => `  - ${key}`).join('\n') +
      '\n  See .env.example for the expected keys.',
  );
}

console.log('[env] .env OK');
