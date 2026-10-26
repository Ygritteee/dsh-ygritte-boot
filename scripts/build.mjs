/**
 * Build script for @local/ygritte-boot.
 *
 * The browser half ships as ONE prebuilt `client.js` (the DSH client module
 * system serves built artifacts and never compiles source in the profile), so
 * this script assembles it from two sources:
 *
 *   src/show.js        the dependency-free animation engine (classic script)
 *   src/client-entry.js the DSH integration glue (factory body, uses `require`)
 *
 * It also emits `preview/index.html`: the same engine, standalone, so the
 * animation can be reviewed at `/ygritte/preview` (served by the Host half) or
 * opened directly from disk with no DSH involved.
 *
 * Run: node scripts/build.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const show = readFileSync(join(ROOT, 'src', 'show.js'), 'utf8')
const entry = readFileSync(join(ROOT, 'src', 'client-entry.js'), 'utf8')

if (!/var\s+YgritteShow\s*=/.test(show)) {
  throw new Error('src/show.js must define `var YgritteShow = ...`')
}
if (!/createShow/.test(show)) {
  throw new Error('src/show.js must export createShow')
}
if (show.includes('</script')) {
  throw new Error('src/show.js must not contain a literal closing script tag')
}
if (show.includes('__VERSION__')) {
  throw new Error('src/show.js must not contain the __VERSION__ placeholder')
}
if (!entry.includes('__VERSION__')) {
  throw new Error('src/client-entry.js lost its __VERSION__ placeholder')
}
if (!entry.includes('__PACKAGE_NAME__')) {
  throw new Error('src/client-entry.js lost its __PACKAGE_NAME__ placeholder')
}

function indent(text, prefix) {
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? prefix + line : line))
    .join('\n')
}

/* ── client.js ───────────────────────────────────────────────────────────── */

const versionedEntry = entry.split('__VERSION__').join(pkg.version).split('__PACKAGE_NAME__').join(pkg.name)

const client = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(pkg.name)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
${indent(show, '\t\t')}

${indent(versionedEntry, '\t\t')}

\t\treturn module.exports;
\t},
});
`

writeFileSync(join(ROOT, 'client.js'), client, 'utf8')

/* ── preview/index.html ──────────────────────────────────────────────────── */

const preview = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>Ygritte Boot · Preview</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; background: #04070d; overflow: hidden; }
  body {
    font-family: "Cascadia Code", "SF Mono", Consolas, "Courier New", monospace;
    color: #9fdcff;
    -webkit-font-smoothing: antialiased;
  }
  #ygrt-stage { position: fixed; inset: 0; }
  #ygrt-panel {
    position: fixed;
    left: 50%;
    bottom: 46px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    border: 1px solid rgba(159, 220, 255, 0.24);
    border-radius: 14px;
    background: rgba(4, 10, 17, 0.82);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 122, 46, 0.08);
    backdrop-filter: blur(10px);
    opacity: 0;
    pointer-events: none;
    transform: translateX(-50%) translateY(10px);
    transition: opacity 420ms ease, transform 420ms ease;
    z-index: 5;
  }
  #ygrt-panel.is-on { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
  #ygrt-panel .brand { display: flex; flex-direction: column; gap: 2px; margin-right: 6px; }
  #ygrt-panel .brand b { font-size: 12px; letter-spacing: 0.22em; color: #dff3ff; font-weight: 600; }
  #ygrt-panel .brand span { font-size: 10px; letter-spacing: 0.18em; color: #5f7c92; text-transform: uppercase; }
  #ygrt-panel .mode { font-size: 10.5px; letter-spacing: 0.16em; color: #ffb454; padding: 3px 8px; border: 1px solid rgba(255, 180, 84, 0.35); border-radius: 999px; }
  #ygrt-panel button {
    appearance: none;
    font: inherit;
    font-size: 12px;
    letter-spacing: 0.08em;
    color: #cfeaff;
    background: rgba(159, 220, 255, 0.06);
    border: 1px solid rgba(159, 220, 255, 0.26);
    border-radius: 9px;
    padding: 7px 15px;
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  }
  #ygrt-panel button:hover { background: rgba(159, 220, 255, 0.12); border-color: rgba(159, 220, 255, 0.5); }
  #ygrt-panel button.primary { color: #1a0c04; font-weight: 600; background: linear-gradient(180deg, #ffb454, #ff8a3d); border-color: transparent; }
  #ygrt-panel button.primary:hover { box-shadow: 0 0 0 3px rgba(255, 138, 61, 0.25); }
  #ygrt-hint {
    position: fixed;
    top: 18px;
    right: 20px;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(127, 160, 184, 0.62);
    text-transform: none;
    z-index: 5;
    pointer-events: none;
  }
  #ygrt-noscript { position: fixed; inset: 0; display: grid; place-items: center; color: #8b96a8; }
</style>
</head>
<body>
<div id="ygrt-hint">Ygritte // BOOT PREVIEW</div>
<div id="ygrt-stage"></div>
<div id="ygrt-panel">
  <div class="brand"><b>Ygritte</b><span>boot preview</span></div>
  <span class="mode" id="ygrt-mode-label">FULL · 完整档</span>
  <button type="button" class="primary" id="ygrt-replay">重播</button>
  <button type="button" id="ygrt-switch">切换档位</button>
  <button type="button" id="ygrt-close">关闭预览</button>
</div>
<noscript><div id="ygrt-noscript">预览需要 JavaScript。</div></noscript>
<script>
/* ---- src/show.js (verbatim) ---- */
${show}
</script>
<script>
(function () {
  var params = new URLSearchParams(window.location.search || '')
  var stage = document.getElementById('ygrt-stage')
  var panel = document.getElementById('ygrt-panel')
  var label = document.getElementById('ygrt-mode-label')
  var auto = params.get('auto') !== '0'
  var current = params.get('mode') === 'quick' ? 'quick' : 'full'
  var session = null

  function stop() {
    if (session !== null) {
      try { session.dispose() } catch (error) { /* already gone */ }
      session = null
    }
    stage.textContent = ''
  }

  function play(mode) {
    stop()
    current = mode === 'quick' ? 'quick' : 'full'
    label.textContent = current === 'quick' ? 'QUICK · 简易档' : 'FULL · 完整档'
    panel.classList.remove('is-on')
    var host = document.createElement('div')
    host.style.cssText = 'position:absolute;inset:0'
    stage.appendChild(host)
    var root = host
    try { root = host.attachShadow({ mode: 'open' }) } catch (error) { /* element fallback */ }
    session = YgritteShow.createShow(root, {
      mode: current,
      autoAuthorize: auto,
      onEvent: function (name) {
        if (name === 'done' || name === 'skipped') {
          window.setTimeout(function () { panel.classList.add('is-on') }, 520)
        }
      },
    })
    session.play().then(function () {
      session = null
    }, function () {
      session = null
    })
  }

  document.getElementById('ygrt-replay').addEventListener('click', function () { play(current) })
  document.getElementById('ygrt-switch').addEventListener('click', function () {
    play(current === 'quick' ? 'full' : 'quick')
  })
  document.getElementById('ygrt-close').addEventListener('click', function () {
    stop()
    panel.classList.add('is-on')
    stage.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;color:#7f8ea3;font-size:12px;letter-spacing:.22em;text-transform:uppercase">preview closed</div>'
  })

  play(current)
})()
</script>
</body>
</html>
`

mkdirSync(join(ROOT, 'preview'), { recursive: true })
writeFileSync(join(ROOT, 'preview', 'index.html'), preview, 'utf8')

const kb = (n) => (n / 1024).toFixed(1) + ' KB'
console.log('built client.js       ', kb(Buffer.byteLength(client)))
console.log('built preview/index.html', kb(Buffer.byteLength(preview)))
