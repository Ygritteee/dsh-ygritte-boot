#!/usr/bin/env node
/**
 * Profile installer / rollback for @local/ygritte-boot.
 *
 * This is the same order the in-app Plugin Manager uses for a local link
 * bundle, done from the agent side:
 *
 *   1. `pnpm add link:<plugin dir>` in the profile — dependency + node_modules
 *      link only. DSH's profile manifest watcher ignores dependency-only
 *      changes, so this step never restarts the running composition.
 *   2. Append the package to `dsh.profile.bundles` — the ordered bundle list is
 *      what the HMR profile watcher watches, so this step recomposes the
 *      profile live and activates the plugin without a restart.
 *
 * `--rollback` reverses it: deselect the bundle first (live unload), then
 * remove the dependency.
 *
 * Usage (from the plugin directory):
 *   node scripts/activate-profile.mjs            # install + select the bundle
 *   node scripts/activate-profile.mjs --reload   # rebuild? no: just ask HMR to
 *                                                # recompose (picks up changed
 *                                                # files of the linked package)
 *   node scripts/activate-profile.mjs --rollback # deselect + uninstall
 *
 * The profile must be the one the running DSH process owns; it is located from
 * DSH_PROFILE_DIR (set for agent subprocesses) and falls back to
 * $DSH_HOME/profiles/desktop.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8')).name
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const PROFILE_DIR = process.env.DSH_PROFILE_DIR || join(DSH_HOME, 'profiles', 'desktop')
const PKG_PATH = join(PROFILE_DIR, 'package.json')
const PATCH_PATH = join(PROFILE_DIR, 'cordis.patch.yml')
const ROLLBACK = process.argv.includes('--rollback')
const RELOAD = process.argv.includes('--reload')
const RELOAD_MARKER = '# ygritte-boot: reload marker'

/**
 * Ask the profile HMR watcher for one recomposition after rebuilding this
 * linked package. The marker line is replaced in place, so the patch file keeps
 * exactly one line of dev noise and the change is a real file event.
 */
function requestReload() {
  if (!existsSync(PATCH_PATH)) fail('profile cordis.patch.yml not found: ' + PATCH_PATH)
  const lines = readFileSync(PATCH_PATH, 'utf8').split(/\r?\n/)
  const kept = lines.filter((line) => !line.startsWith(RELOAD_MARKER))
  while (kept.length > 0 && kept[kept.length - 1].trim() === '') kept.pop()
  kept.push(RELOAD_MARKER + ' ' + new Date().toISOString())
  writeFileSync(PATCH_PATH, kept.join('\n') + '\n', 'utf8')
  console.log('[ygritte] reload marker written — HMR recomposes within ~2-5s')
}

function fail(message) {
  console.error('\n[ygritte] ' + message)
  process.exit(1)
}

if (!existsSync(PKG_PATH)) fail('profile package.json not found: ' + PKG_PATH)

function readProfile() {
  return JSON.parse(readFileSync(PKG_PATH, 'utf8'))
}

function writeProfile(profile) {
  writeFileSync(PKG_PATH, JSON.stringify(profile, null, 2) + '\n', 'utf8')
}

function backup() {
  const directory = join(PROFILE_DIR, '.plugin-manager', 'backups', 'ygritte-' + Date.now())
  mkdirSync(directory, { recursive: true })
  copyFileSync(PKG_PATH, join(directory, 'package.json'))
  const lock = join(PROFILE_DIR, 'pnpm-lock.yaml')
  if (existsSync(lock)) copyFileSync(lock, join(directory, 'pnpm-lock.yaml'))
  console.log('[ygritte] backup -> ' + directory)
}

function pnpm() {
  const explicit = process.env.DSH_PNPM
  const candidate =
    explicit && existsSync(explicit)
      ? explicit
      : join(DSH_HOME, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies', 'pnpm', 'bin', 'pnpm.mjs')
  if (!existsSync(candidate)) fail('pnpm entry not found: ' + candidate + ' (set DSH_PNPM)')
  return candidate
}

function runPnpm(args) {
  console.log('[ygritte] pnpm ' + args.join(' '))
  const result = spawnSync(process.execPath, [pnpm(), ...args], {
    cwd: PROFILE_DIR,
    env: process.env,
    stdio: 'inherit',
  })
  if (result.error) fail('pnpm spawn failed: ' + result.error.message)
  if (result.status !== 0) fail('pnpm exited ' + result.status)
}

function linkSpec() {
  return 'link:' + PLUGIN_ROOT.replace(/\\/g, '/')
}

/* ── reload ──────────────────────────────────────────────────────────────── */

if (RELOAD) {
  requestReload()
  process.exit(0)
}

/* ── rollback ────────────────────────────────────────────────────────────── */

if (ROLLBACK) {
  const profile = readProfile()
  backup()
  const bundles = profile.dsh?.profile?.bundles
  if (Array.isArray(bundles)) {
    profile.dsh.profile.bundles = bundles.filter((entry) => entry !== PACKAGE)
    writeProfile(profile)
    console.log('[ygritte] deselected bundle ' + PACKAGE + ' (live unload by HMR)')
  }
  if (profile.dependencies && profile.dependencies[PACKAGE]) {
    delete profile.dependencies[PACKAGE]
    writeProfile(profile)
    runPnpm(['install', '--prefer-offline'])
  }
  console.log('[ygritte] rollback complete')
  process.exit(0)
}

/* ── activation ──────────────────────────────────────────────────────────── */

const required = ['client.js', 'preview/index.html', 'index.js', 'cordis.patch.yml']
for (const file of required) {
  if (!existsSync(join(PLUGIN_ROOT, file))) fail('missing build artifact: ' + file + ' — run `node scripts/build.mjs` first')
}

const before = readProfile()
if (before.dsh?.profile?.bundles?.includes(PACKAGE)) {
  console.log('[ygritte] bundle ' + PACKAGE + ' is already selected; leaving the composition unchanged')
  process.exit(0)
}

backup()

// Step 1: dependency + link. pnpm owns the manifest/lockfile edit.
runPnpm(['add', linkSpec(), '--prefer-offline'])

// Step 2: verify the link, then select the bundle (this is what HMR watches).
const linkPath = join(PROFILE_DIR, 'node_modules', ...PACKAGE.split('/'))
if (!existsSync(linkPath)) fail('pnpm did not create the link at ' + linkPath)

const profile = readProfile()
profile.dsh = profile.dsh || {}
profile.dsh.profile = profile.dsh.profile || {}
const bundles = Array.isArray(profile.dsh.profile.bundles) ? profile.dsh.profile.bundles : []
if (!bundles.includes(PACKAGE)) {
  bundles.push(PACKAGE)
  profile.dsh.profile.bundles = bundles
  writeProfile(profile)
  console.log('[ygritte] selected bundle ' + PACKAGE + ' — HMR recomposes the profile live')
}

console.log('\n[ygritte] activated. Verify:  curl http://127.0.0.1:52497/ygritte/health')
console.log('[ygritte] preview page:       http://127.0.0.1:52497/ygritte/preview')
console.log('[ygritte] rollback:           node scripts/activate-profile.mjs --rollback')
