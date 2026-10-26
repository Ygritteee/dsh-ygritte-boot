/**
 * Verification for @local/ygritte-boot.
 *
 * No browser and no DSH process are needed: the two halves are exercised the
 * way the Host loads them.
 *
 *   show.js     parses and exposes the expected engine surface
 *   client.js   registers exactly one ModuleLoader factory under the package id
 *   index.js    compose-time rows, the /ygritte route table, and every handler
 *               (health, preview, report, 404) against fake req/res objects
 *   preview     the standalone page carries the engine and its controls
 *
 * Run: node scripts/check.mjs   (after `node scripts/build.mjs`)
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

let failures = 0
function check(name, fn) {
  try {
    fn()
    console.log('  PASS  ' + name)
  } catch (error) {
    failures += 1
    console.log('  FAIL  ' + name + '\n        ' + (error instanceof Error ? error.message : String(error)))
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}
function equal(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual))
}

console.log(PKG.name + ' check\n')

/* ── manifest ────────────────────────────────────────────────────────────── */

check('package.json declares both halves', () => {
  assert(/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(PKG.name), 'name is not a valid npm package name: ' + PKG.name)
  equal(PKG.type, 'module', 'type')
  equal(PKG.dsh.bundle.patch, './cordis.patch.yml', 'dsh.bundle.patch')
  equal(PKG.dsh.client.platform, 'web', 'dsh.client.platform')
  equal(PKG.exports['./client'], './client.js', 'exports ./client')
  assert(PKG.exports['./locale/*.json'], 'locale export missing')
  assert(/^>=0\.2\.0/.test(PKG.dsh.engines.dsh), 'engines.dsh must accept the current 0.2.x runtime')
})

/* ── show engine ─────────────────────────────────────────────────────────── */

const showSource = readFileSync(join(ROOT, 'src', 'show.js'), 'utf8')
check('src/show.js parses as a classic script', () => {
  new vm.Script(showSource, { filename: 'show.js' })
})

check('src/show.js exports SHOW_CSS + createShow', () => {
  const sandbox = { window: {}, globalThis: {}, console }
  sandbox.globalThis = sandbox
  vm.runInNewContext(showSource, sandbox, { filename: 'show.js' })
  const engine = sandbox.YgritteShow
  assert(engine && typeof engine === 'object', 'YgritteShow is not an object')
  assert(typeof engine.SHOW_CSS === 'string' && engine.SHOW_CSS.length > 2000, 'SHOW_CSS missing or too small')
  equal(typeof engine.createShow, 'function', 'createShow type')
})

/* ── client bundle ───────────────────────────────────────────────────────── */

const clientPath = join(ROOT, 'client.js')
const clientSource = readFileSync(clientPath, 'utf8')
check('client.js loads through window.__ModuleLoader__', () => {
  let loaded = null
  const sandbox = {
    window: { __ModuleLoader__: { load: (options) => (loaded = options) } },
    console,
  }
  vm.runInNewContext(clientSource, sandbox, { filename: 'client.js' })
  assert(loaded !== null, 'ModuleLoader.load was not called')
  equal(loaded.id, PKG.name, 'module id')
  equal(typeof loaded.factory, 'function', 'factory type')
})

check('client.js carries the built engine, settings and version', () => {
  assert(clientSource.includes('var YgritteShow ='), 'engine not inlined')
  assert(clientSource.includes('settings.general.item'), 'General settings row missing')
  assert(clientSource.includes("'settings.section'"), 'settings section missing')
  assert(clientSource.includes('__VERSION__') === false, 'unreplaced __VERSION__ placeholder')
  assert(clientSource.includes("'" + PKG.version + "'"), 'version literal missing')
  assert(clientSource.includes('Ygritte 启动界面'), 'Chinese settings copy missing')
  assert(clientSource.includes('YGRT-0117'), 'operator id missing from settings copy')
})

/* ── host half ───────────────────────────────────────────────────────────── */

const hostModule = await import(pathToFileURL(join(ROOT, 'index.js')).href)
const rows = []
const routes = []
const disposers = []
const fakeCtx = {
  on(event, handler) {
    if (event === 'webserver/index-inject') rows.push(handler)
  },
  inject(services, callback) {
    if (!services.includes('webServer')) return
    callback({
      effect(factory) {
        disposers.push(factory())
      },
      webServer: {
        register(route) {
          routes.push(route)
          return () => {}
        },
      },
    })
  },
}
hostModule.apply(fakeCtx)

function fakeRes() {
  const state = { status: 0, headers: null, body: '' }
  return {
    state,
    writeHead(status, headers) {
      state.status = status
      state.headers = headers ?? null
    },
    end(chunk) {
      if (chunk !== undefined) state.body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)
    },
  }
}

function getRequest(pathname) {
  return { method: 'GET', url: pathname }
}

function postRequest(pathname, body) {
  return {
    method: 'POST',
    url: pathname,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(body, 'utf8')
    },
  }
}

const route = routes[0]
check('host registers exactly one /ygritte prefix route', () => {
  equal(hostModule.name, 'ygritte-boot', 'plugin name')
  equal(routes.length, 1, 'route count')
  equal(route.kind, 'prefix', 'route kind')
  equal(route.path, '/ygritte', 'route path')
  equal(typeof route.handler, 'function', 'route handler')
  equal(disposers.length, 1, 'route effect disposer')
})

check('index-inject contributes style + head script + version global', () => {
  equal(rows.length, 1, 'index-inject subscriber count')
  const table = []
  rows[0](table)
  const kinds = table.map((row) => row.kind).sort()
  equal(kinds.join(','), 'global,script,style', 'row kinds')
  const style = table.find((row) => row.kind === 'style')
  assert(style.text.includes('ygrt-first'), 'cover class missing from style')
  assert(style.text.includes('#04070d'), 'cover background missing')
  const script = table.find((row) => row.kind === 'script')
  equal(script.placement, 'head', 'script placement')
  assert(script.text.includes('ygritte-boot:mode'), 'script must read the shared mode key')
  assert(script.text.includes('__ygritteBoot'), 'script must publish the first-frame global')
  assert(script.text.includes('data-dsh-boot'), 'script must watch the boot card')
  assert(script.text.includes('setTimeout(end,12000)'), 'script must cap the cover')
  const global = table.find((row) => row.kind === 'global')
  equal(global.value, PKG.version, 'version global')
})

const healthRes = fakeRes()
await route.handler(getRequest('/ygritte/health'), healthRes)
check('GET /ygritte/health answers JSON', () => {
  equal(healthRes.state.status, 200, 'status')
  assert(/application\/json/.test(healthRes.state.headers['content-type']), 'content type')
  const payload = JSON.parse(healthRes.state.body)
  equal(payload.ok, true, 'ok')
  equal(payload.plugin, PKG.name, 'plugin')
  equal(payload.version, PKG.version, 'version')
  assert(payload.firstFrame && payload.firstFrame.modeKey === 'ygritte-boot:mode', 'first-frame contract')
  assert(Array.isArray(payload.reports), 'reports array')
})

const reportRes = fakeRes()
await route.handler(postRequest('/ygritte/report', JSON.stringify({ kind: 'mounted', detail: 'full', at: Date.now() })), reportRes)
const healthAgain = fakeRes()
await route.handler(getRequest('/ygritte/health'), healthAgain)
check('POST /ygritte/report is recorded for /health', () => {
  equal(reportRes.state.status, 200, 'report status')
  const payload = JSON.parse(healthAgain.state.body)
  const kinds = payload.reports.map((item) => item.kind)
  assert(kinds.includes('mounted'), 'reported checkpoint missing: ' + kinds.join(','))
})

const previewRes = fakeRes()
await route.handler(getRequest('/ygritte/preview'), previewRes)
check('GET /ygritte/preview serves the built preview page', () => {
  equal(previewRes.state.status, 200, 'status')
  assert(/text\/html/.test(previewRes.state.headers['content-type']), 'content type')
  assert(previewRes.state.body.includes('Ygritte Boot · Preview'), 'preview title missing')
  assert(previewRes.state.body.includes('YgritteShow.createShow'), 'preview must boot the engine')
})

const missingRes = fakeRes()
await route.handler(getRequest('/ygritte/nope'), missingRes)
check('unknown /ygritte path answers 404', () => {
  equal(missingRes.state.status, 404, 'status')
})

const methodRes = fakeRes()
await route.handler(postRequest('/ygritte/preview', ''), methodRes)
check('non-GET preview answers 405', () => {
  equal(methodRes.state.status, 405, 'status')
})

/* ── preview page ────────────────────────────────────────────────────────── */

const previewHtml = readFileSync(join(ROOT, 'preview', 'index.html'), 'utf8')
check('preview page is self-contained and replayable', () => {
  assert(previewHtml.includes('var YgritteShow ='), 'engine not inlined')
  assert(previewHtml.includes('id="ygrt-replay"'), 'replay control missing')
  assert(previewHtml.includes('id="ygrt-switch"'), 'mode switch missing')
  assert(!/https?:\/\/[^"']+\.(?:js|css|woff2?)/.test(previewHtml), 'preview must not fetch external assets')
})

/* ── summary ─────────────────────────────────────────────────────────────── */

if (failures > 0) {
  console.log('\n' + failures + ' check(s) failed')
  process.exitCode = 1
} else {
  console.log('\nall checks passed')
}
