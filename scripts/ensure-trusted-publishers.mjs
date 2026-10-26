#!/usr/bin/env node

/**
 * Give every publishable package in this repository the npm trusted publisher the release
 * workflow needs.
 *
 * `.github/workflows/release.yaml` publishes through npm's OIDC trusted publishing, with no npm
 * token. npm accepts a package from CI only when it has this trusted publisher:
 *
 *   type: github, repository: lowdefy/community-plugins, file: release.yaml,
 *   environment: publish
 *
 * A package without it fails the release with `E404 Not Found - PUT`, after the other packages
 * are already live. Re-run the failed release job once this script has set it.
 *
 * - Checks every non-private workspace package (minus the `ignore` list in
 *   .changeset/config.json) with `npm trust list`, and sets the trusted publisher with
 *   `npm trust github` on each one that has none.
 * - Leaves a package that has a different trusted publisher alone and reports it: revoke it
 *   with `npm trust revoke <package> --id <id>` and run the script again.
 * - `--check` only reports, and changes nothing.
 * - A second run changes nothing.
 *
 * Adapted from `scripts/ensure-trusted-publishers.mjs` in lowdefy/lowdefy.
 *
 * Needs npm 11.15 or later and a person logged in to npm with 2FA. Tick "skip 2FA for
 * 5 minutes" on the first prompt to cover the rest of the batch.
 *
 * Usage, from the repository root:
 *   npm login
 *   node scripts/ensure-trusted-publishers.mjs --check
 *   node scripts/ensure-trusted-publishers.mjs
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const MIN_NPM_VERSION = [11, 15, 0];
// npm's advice for configuring trust in bulk, to avoid rate limiting.
const PAUSE_BETWEEN_CALLS_MS = 2000;
const RELEASE_TRUST = {
  repository: 'lowdefy/community-plugins',
  file: 'release.yaml',
  environment: 'publish',
};
const TRUST_GITHUB_ARGS = [
  '--repo',
  RELEASE_TRUST.repository,
  '--file',
  RELEASE_TRUST.file,
  '--env',
  RELEASE_TRUST.environment,
  '--allow-publish',
  '--allow-stage-publish',
  '--yes',
];

const checkOnly = process.argv.includes('--check');
let lastTrustCallAt = 0;

function fail({ message }) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function wait({ ms }) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function npm({ args, stdio }) {
  return spawnSync('npm', args, { encoding: 'utf8', stdio });
}

// Mirrors what `changeset publish` targets: every non-private workspace package, minus the
// `ignore` list in .changeset/config.json.
function getPublishablePackages() {
  const { ignore = [] } = readJson('.changeset/config.json');
  const ignored = new Set(ignore);
  const workspaces = JSON.parse(
    execFileSync('pnpm', ['ls', '-r', '--depth', '-1', '--json'], { encoding: 'utf8' })
  );
  return workspaces
    .map((workspace) => ({
      path: relative(process.cwd(), workspace.path),
      pkg: readJson(join(workspace.path, 'package.json')),
    }))
    .filter(({ pkg }) => pkg.name && pkg.version && pkg.private !== true && !ignored.has(pkg.name))
    .map(({ path, pkg }) => ({ name: pkg.name, version: pkg.version, path }));
}

function isOlderThan({ version, minimum }) {
  // A prerelease such as 11.15.0-pre.1 is compared as 11.15.0.
  const parts = version.split('-')[0].split('.').map(Number);
  for (let i = 0; i < minimum.length; i += 1) {
    if (parts[i] !== minimum[i]) return parts[i] < minimum[i];
  }
  return false;
}

function checkNpm() {
  const result = npm({ args: ['--version'], stdio: ['ignore', 'pipe', 'inherit'] });
  if (result.error) {
    fail({ message: `Could not run npm: ${result.error.message}` });
  }
  if (result.status !== 0) {
    fail({ message: `\`npm --version\` exited with code ${result.status}.` });
  }
  const version = result.stdout.trim();
  if (isOlderThan({ version, minimum: MIN_NPM_VERSION })) {
    fail({
      message: `npm ${version} has no \`npm trust\`. Upgrade to npm ${MIN_NPM_VERSION.join(
        '.'
      )} or later with \`npm install -g npm@latest\`.`,
    });
  }
  if (npm({ args: ['whoami'], stdio: ['ignore', 'ignore', 'ignore'] }).status !== 0) {
    fail({ message: 'Not logged in to npm. Log in with `npm login`, then run this script again.' });
  }
}

async function npmTrust({ args, stdio }) {
  const sinceLastCall = Date.now() - lastTrustCallAt;
  if (sinceLastCall < PAUSE_BETWEEN_CALLS_MS) {
    await wait({ ms: PAUSE_BETWEEN_CALLS_MS - sinceLastCall });
  }
  const result = npm({ args: ['trust', ...args], stdio });
  lastTrustCallAt = Date.now();
  return result;
}

function readNpmErrorCode({ stdout }) {
  try {
    return JSON.parse(stdout).error?.code ?? null;
  } catch {
    return null;
  }
}

function parseTrustConfigs({ stdout }) {
  // With --json npm prints nothing for a package with no trust configurations, and one
  // JSON object per configuration otherwise, not an array.
  const text = stdout.trim();
  if (text === '') return [];
  return JSON.parse(`[${text.replace(/\}\s*\{/g, '},{')}]`);
}

function isReleaseTrust({ config }) {
  return (
    config.type === 'github' &&
    config.repository === RELEASE_TRUST.repository &&
    config.file === RELEASE_TRUST.file &&
    config.environment === RELEASE_TRUST.environment &&
    (config.permissions ?? []).includes('createPackage')
  );
}

async function runTrustList({ name }) {
  const list = () =>
    npmTrust({ args: ['list', name, '--json'], stdio: ['inherit', 'pipe', 'inherit'] });
  const result = await list();
  if (result.status === 0 || readNpmErrorCode(result) !== 'EOTP') {
    return result;
  }
  // npm only prompts for 2FA when stdout is a terminal, so authenticate once with the
  // output shown, then read the list again as JSON.
  console.log(
    'npm needs 2FA to read trusted publishers. Authenticate, and tick "skip 2FA for 5 minutes".'
  );
  await npmTrust({ args: ['list', name], stdio: 'inherit' });
  const retried = await list();
  if (readNpmErrorCode(retried) === 'EOTP') {
    throw new Error(
      'npm still needs 2FA for every call. Run the script again and tick "skip 2FA for 5 minutes" when npm asks.'
    );
  }
  return retried;
}

// Returns null when the package is not on npm.
async function listTrustConfigs({ name }) {
  const result = await runTrustList({ name });
  if (result.status === 0) {
    return parseTrustConfigs(result);
  }
  if (readNpmErrorCode(result) === 'E404') {
    return null;
  }
  throw new Error(`\`npm trust list ${name}\` failed:\n${result.stdout}`);
}

async function setTrustedPublisher({ name }) {
  const result = await npmTrust({ args: ['github', name, ...TRUST_GITHUB_ARGS], stdio: 'inherit' });
  return result.status === 0;
}

const packages = getPublishablePackages();
console.log(`Checking ${packages.length} publishable package(s): ${packages.map((pkg) => pkg.name).join(', ')}`);

checkNpm();

const alreadySet = [];
const set = [];
const missing = [];
const otherTrust = [];
const notOnNpm = [];
const failed = [];

async function ensureTrustedPublisher({ pkg }) {
  const configs = await listTrustConfigs(pkg);
  if (configs === null) {
    notOnNpm.push(pkg);
    return;
  }
  if (configs.some((config) => isReleaseTrust({ config }))) {
    alreadySet.push(pkg);
    return;
  }
  if (configs.length > 0) {
    // Revoking someone else's configuration is a call for a person to make.
    otherTrust.push({ pkg, configs });
    return;
  }
  if (checkOnly) {
    missing.push(pkg);
    return;
  }
  console.log(`\nSetting trusted publisher on ${pkg.name}...`);
  if (await setTrustedPublisher(pkg)) {
    set.push(pkg);
  } else {
    failed.push(pkg);
  }
}

for (const pkg of packages) {
  // A registry or npm failure on one package should not hide what the rest of the batch did.
  try {
    await ensureTrustedPublisher({ pkg });
  } catch (error) {
    console.error(`\n${pkg.name}: ${error.message}`);
    failed.push(pkg);
  }
}

console.log('');
if (alreadySet.length > 0) {
  console.log('Already had the trusted publisher:');
  alreadySet.forEach((pkg) => console.log(`  ${pkg.name}`));
}
if (set.length > 0) {
  console.log('Trusted publisher set:');
  set.forEach((pkg) => console.log(`  ${pkg.name}`));
}
if (missing.length > 0) {
  console.log('No trusted publisher yet (run without --check to set it):');
  missing.forEach((pkg) => console.log(`  ${pkg.name}`));
}
if (otherTrust.length > 0) {
  console.error(
    `Have a trusted publisher that is not ${RELEASE_TRUST.file} in ${RELEASE_TRUST.repository} with environment ${RELEASE_TRUST.environment}, so CI cannot publish them. Revoke it with \`npm trust revoke <package> --id <id>\` and run this script again:`
  );
  otherTrust.forEach(({ pkg, configs }) =>
    console.error(`  ${pkg.name}: ${JSON.stringify(configs)}`)
  );
}
if (notOnNpm.length > 0) {
  console.error('Not on npm yet, so no trusted publisher can be set (publish it once by hand first):');
  notOnNpm.forEach((pkg) => console.error(`  ${pkg.name}`));
}
if (failed.length > 0) {
  console.error('Failed (see the output above):');
  failed.forEach((pkg) => console.error(`  ${pkg.name}`));
}
if (otherTrust.length > 0 || notOnNpm.length > 0 || failed.length > 0) {
  fail({ message: 'Run `node scripts/ensure-trusted-publishers.mjs` again once fixed.' });
}
