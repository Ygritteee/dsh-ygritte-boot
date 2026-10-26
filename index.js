/**
 * Host half of ygritte-boot.
 *
 * The animation itself is browser-side (`client.js`). Its FIRST FRAME cannot be:
 * DSH's boot card ("HARNESS / Loading plugins…") is painted by the shell before
 * any client plugin is materialised, so a plugin that only paints from its own
 * JS leaves that card on screen for a few hundred milliseconds. The served
 * document is the only surface that exists earlier, and DSH exposes it:
 * `webserver/index-inject` collects a table of index rows which the Web carrier
 * renders into index.html while the document is still parsing. A `style` row
 * plus one synchronous `script` row therefore cover the page with the splash's
 * own background before the first paint; the client splash then retires that
 * cover through `window.__ygritteBoot.end()` on the same task its shadow root is
 * on screen.
 *
 * Two contracts with `client.js` (generated from `src/`):
 *
 *   MODE_KEY   the same localStorage key and the same default. The index script
 *              bows out for 'off' so that setting boots straight through to DSH
 *              with no black frame.
 *   FIRST_FRAME_GLOBAL
 *              `window.__ygritteBoot.end()` retires the cover. The boot-card
 *              watch and the timeout below are fallbacks so a client bundle that
 *              fails to load can never leave a dark window behind.
 *
 * The host also serves the plugin's own diagnostics under `/ygritte`:
 *   GET  /ygritte/preview   the self-contained animation preview page
 *   GET  /ygritte/health    liveness + the last client reports (development aid)
 *   POST /ygritte/report    best-effort timeline reports from the browser half
 *
 * @module @local/ygritte-boot
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'ygritte-boot'

/** src/client-entry.js MODE_KEY — keep in sync. */
const MODE_KEY = 'ygritte-boot:mode'
/** src/client-entry.js FIRST_FRAME_GLOBAL — keep in sync. */
const FIRST_FRAME_GLOBAL = '__ygritteBoot'
/** Painted under the splash's own background, so the handoff is invisible. */
const FIRST_FRAME_BG = '#04070d'
/** Absolute ceiling (ms): past this the cover yields whatever is on the page. */
const FIRST_FRAME_MAX_MS = 12000
/** The splash's own :host z-index (client-entry.js HOST_Z_INDEX) minus one. */
const FIRST_FRAME_Z = 2147482000
/** Route prefix owned by this plugin. */
const PREFIX = '/ygritte'
/** The preview page published with the package. */
const PREVIEW_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'preview', 'index.html')
/** Report ring: enough for one page load's checkpoints, bounded on purpose. */
const MAX_REPORTS = 120
const MAX_REPORT_BYTES = 8192

/** The manifest that is actually installed: name and version, read at load. */
function packageManifest() {
  try {
    const url = new URL('./package.json', import.meta.url)
    return JSON.parse(readFileSync(url, 'utf8'))
  } catch {
    return {}
  }
}

const MANIFEST = packageManifest()
/** Uses the installed package name, so a rename before publishing stays typed. */
const PACKAGE_NAME = typeof MANIFEST.name === 'string' ? MANIFEST.name : '@local/ygritte-boot'
const VERSION = typeof MANIFEST.version === 'string' ? MANIFEST.version : null
const STARTED_AT = Date.now()

/** Last reports pushed by the browser half; a dev aid, never a product fact. */
const reports = []

/**
 * The cover itself: the splash's own background colour, above anything the page
 * paints and below the splash that replaces it. `pointer-events` stays off — the
 * boot card it covers is not interactive either.
 *
 * The two alias tokens are the ones the Desktop preload measures into its
 * `setTitleBarOverlay` call, so the OS caption strip matches the ice-void splash
 * instead of leaving a grey Windows bar above it.
 */
const FIRST_FRAME_CSS =
  'html.ygrt-first::before{content:"";position:fixed;inset:0;background:' +
  FIRST_FRAME_BG +
  ';z-index:' +
  String(FIRST_FRAME_Z) +
  ';pointer-events:none}\n' +
  'html.ygrt-first{background:' +
  FIRST_FRAME_BG +
  ';--dsw-specific-sidebar-fill:#04070d;--dsw-alias-label-primary:#9fdcff}'

/**
 * The class marker plus the handshake, the boot-card watch and the timeout.
 *
 * Tiny and synchronous on purpose: it runs while `<head>` is still being parsed,
 * so the cover is applied before the first paint. `?ygritte=0` is the developer
 * escape hatch for a page opened directly; the splash's Esc key and the client
 * teardown are the in-product ones.
 *
 * The cover must not outlive the reason for it, so a 250 ms watch ends it as
 * soon as the boot card is gone (the kernel removes the card exactly when the
 * application mounts) — or as soon as the card drops its spinner, which is how
 * the card renders its own failure state: a broken page must stay readable.
 */
const FIRST_FRAME_SCRIPT =
  '(function(){' +
  'var covered=false;' +
  'try{' +
  'var mode=window.localStorage.getItem(' +
  JSON.stringify(MODE_KEY) +
  ');' +
  'var params=new URLSearchParams(window.location.search||"");' +
  'covered=mode!=="off"&&params.get("ygritte")!=="0"' +
  '}catch(error){covered=true}' +
  'if(!covered)return;' +
  'var root=document.documentElement;' +
  'var watch=null;' +
  'var end=function(){' +
  'if(watch!==null){window.clearInterval(watch);watch=null}' +
  'root.classList.remove("ygrt-first")' +
  '};' +
  'window.' +
  FIRST_FRAME_GLOBAL +
  '={end:end,version:' +
  JSON.stringify(VERSION) +
  '};' +
  'root.classList.add("ygrt-first");' +
  'var seen=false;' +
  'watch=window.setInterval(function(){' +
  'var card=document.querySelector("[data-dsh-boot]");' +
  'if(card===null){if(seen)end();return}' +
  'seen=true;' +
  'if(card.querySelector("[data-dsh-boot-spinner]")===null)end()' +
  '},250);' +
  'window.setTimeout(end,' +
  String(FIRST_FRAME_MAX_MS) +
  ');' +
  '})()'

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_REPORT_BYTES) break
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8').slice(0, MAX_REPORT_BYTES)
}

/** Record one browser-half report, keeping the ring bounded. */
function recordReport(kind, detail, at, version) {
  reports.push({
    kind: typeof kind === 'string' ? kind.slice(0, 64) : 'unknown',
    detail: typeof detail === 'string' ? detail.slice(0, 256) : detail ?? null,
    at: Number.isFinite(at) ? at : Date.now(),
    // The browser half's own version: proves which built client bundle is
    // actually running in the page, independently of the host module's version.
    version: typeof version === 'string' ? version.slice(0, 32) : null,
    receivedAt: Date.now(),
  })
  while (reports.length > MAX_REPORTS) reports.shift()
}

function healthPayload() {
  return {
    ok: true,
    plugin: PACKAGE_NAME,
    version: VERSION,
    uptimeMs: Date.now() - STARTED_AT,
    firstFrame: { global: FIRST_FRAME_GLOBAL, modeKey: MODE_KEY, maxMs: FIRST_FRAME_MAX_MS },
    preview: PREFIX + '/preview',
    reports: reports.slice(),
  }
}

/**
 * Serve the plugin's own URLs. The route table is fixed — no user-supplied path
 * reaches the filesystem, so this handler needs no traversal guard.
 */
async function handler(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const path = url.pathname.replace(/\/+$/, '') || PREFIX
  const method = req.method ?? 'GET'

  if (path === PREFIX + '/health') {
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' })
      res.end()
      return
    }
    if (method === 'HEAD') {
      sendJson(res, 200, healthPayload())
      return
    }
    sendJson(res, 200, healthPayload())
    return
  }

  if (path === PREFIX + '/preview') {
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' })
      res.end()
      return
    }
    let body
    try {
      body = readFileSync(PREVIEW_FILE)
    } catch {
      res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
      res.end('preview not built — run `node scripts/build.mjs` in the plugin directory')
      return
    }
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    })
    res.end(method === 'HEAD' ? undefined : body)
    return
  }

  if (path === PREFIX + '/report') {
    if (method !== 'POST') {
      res.writeHead(405, { allow: 'POST' })
      res.end()
      return
    }
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw)
      recordReport(payload.kind, payload.detail, payload.at, payload.version)
    } catch {
      /* a malformed beacon is dropped: diagnostics must never break the page */
    }
    sendJson(res, 200, { ok: true })
    return
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
  res.end('not found')
}

/**
 * Contribute the first frame to every index response and mount the plugin's
 * diagnostic routes.
 *
 * No service is injected for the index rows: `webserver/index-inject` is a
 * plain composition event that the carrier emits per response, so this costs
 * one row and nothing when nobody asks. The routes go through the optional
 * `webServer` injection, so a profile without an HTTP carrier still gets the
 * splash; only the preview/health routes are lost.
 *
 * @param ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
    if (VERSION !== null) table.push({ kind: 'global', name: FIRST_FRAME_GLOBAL + 'Version', value: VERSION })
  })

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () =>
        webCtx.webServer.register({
          kind: 'prefix',
          path: PREFIX,
          handler,
        }),
      `ygritte-boot: routes under ${PREFIX}`,
    )
  })
}
