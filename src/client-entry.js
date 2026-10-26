/* ============================================================================
 * Browser half of @local/ygritte-boot — integration glue.
 *
 * The animation engine itself lives in src/show.js (inlined above this file by
 * scripts/build.mjs). This file owns everything that must know about DSH:
 *
 *   1. Mount the splash at MODULE EVALUATION time, before Cordis resolves the
 *      service graph and calls apply(). That is the earliest a client plugin can
 *      paint; the Host's first-frame cover is retired from the animation's
 *      first-paint callback.
 *   2. The plugin lifecycle: apply() registers the splash teardown effect and
 *      the settings rows/section through ctx.slots.
 *   3. Settings (localStorage, same keys the Host's index script reads).
 *   4. Best-effort diagnostics: over HTTP the page reports its checkpoints to
 *      the Host's own /ygritte/report route; over the desktop carrier it stays
 *      silent (no CORS guessing), because diagnostics must never break the page.
 * ========================================================================== */

var React = require('react')
var h = React.createElement

var PACKAGE = '__PACKAGE_NAME__'
var VERSION = '__VERSION__'
var MODE_KEY = 'ygritte-boot:mode'
var AUTO_KEY = 'ygritte-boot:auto'
var STYLE_ID = 'ygritte-boot-settings'
var HOST_Z_INDEX = 2147483000
var MODES = ['off', 'quick', 'full']
var MODE_LABELS = { off: '关闭', quick: '简易', full: '完整' }

var liveSplash = null
var bootState = { mounted: false, finished: false, lastEvent: null }

/* ── preferences ─────────────────────────────────────────────────────────── */

function readMode() {
  try {
    var value = window.localStorage.getItem(MODE_KEY)
    return MODES.indexOf(value) >= 0 ? value : 'full'
  } catch (error) {
    return 'full'
  }
}

function readAuto() {
  try {
    return window.localStorage.getItem(AUTO_KEY) !== '0'
  } catch (error) {
    return true
  }
}

function writePref(key, value) {
  try {
    window.localStorage.setItem(key, String(value))
  } catch (error) {
    /* private mode: the memory state still drives this page */
  }
}

/* ── host diagnostics ────────────────────────────────────────────────────── */

function report(kind, detail) {
  bootState.lastEvent = { kind: kind, detail: detail === undefined ? null : String(detail), at: Date.now() }
  try {
    var body = JSON.stringify({
      kind: kind,
      detail: detail === undefined ? null : String(detail),
      at: Date.now(),
      version: VERSION,
    })
    // Relative on purpose: over the Web carrier this is same-origin, and over
    // the Desktop carrier the dsh-app:// protocol handler forwards it to the
    // Host with the browser cookie. Diagnostics never break the page.
    if (typeof window.fetch === 'function') {
      window.fetch('/ygritte/report', { method: 'POST', body: body, keepalive: true }).catch(function () {})
      return
    }
    if (window.navigator && typeof window.navigator.sendBeacon === 'function') {
      window.navigator.sendBeacon('/ygritte/report', body)
    }
  } catch (error) {
    /* diagnostics never break the page */
  }
}

/** Retire the Host's first-frame cover; a missing global simply means no cover. */
function retireFirstFrame() {
  try {
    var api = window.__ygritteBoot
    if (api && typeof api.end === 'function') api.end()
  } catch (error) {
    /* the cover's own timeout is the fallback */
  }
}

/* ── splash mount ────────────────────────────────────────────────────────── */

function finishRecord(record, reason) {
  if (!record || record.finished) return
  record.finished = true
  bootState.finished = true
  if (record.guard) {
    window.clearTimeout(record.guard)
    record.guard = 0
  }
  try {
    if (record.show) record.show.dispose()
  } catch (error) {
    /* already disposed */
  }
  try {
    record.host.style.transition = 'opacity 300ms ease'
    record.host.style.opacity = '0'
  } catch (error) {
    /* detached host */
  }
  window.setTimeout(function () {
    try {
      record.host.remove()
    } catch (error) {
      /* already gone */
    }
  }, 320)
  if (liveSplash === record) liveSplash = null
  report('finished', reason)
}

function mountSplash(options) {
  if (liveSplash !== null) return liveSplash
  if (typeof YgritteShow === 'undefined' || typeof YgritteShow.createShow !== 'function') {
    retireFirstFrame()
    throw new Error('YgritteShow is unavailable — the built client.js is incomplete')
  }

  var doc = document
  var host = doc.createElement('div')
  host.className = 'ygrt-splash-host'
  host.setAttribute('data-ygritte', 'splash')
  host.setAttribute('role', 'dialog')
  host.setAttribute('aria-label', 'Ygritte 启动动画')
  host.style.cssText =
    'position:fixed;inset:0;z-index:' + HOST_Z_INDEX + ';background:#04070d;pointer-events:auto;overflow:hidden'

  var root = host
  try {
    root = host.attachShadow({ mode: 'open' })
  } catch (error) {
    /* older engines render into the host directly; the yg- prefix keeps it isolated */
  }

  var reduced = false
  try {
    reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  } catch (error) {
    reduced = false
  }

  var record = { host: host, show: null, finished: false, preview: options.preview === true }
  var show = YgritteShow.createShow(root, {
    mode: options.mode === 'quick' ? 'quick' : 'full',
    autoAuthorize: options.auto !== false,
    reducedMotion: reduced,
    onEvent: function (name, detail) {
      if (name === 'first-frame') {
        retireFirstFrame()
        report('first-frame', options.mode)
        return
      }
      if (name === 'done' || name === 'skipped') {
        report(name, options.preview ? 'preview' : 'boot')
        return
      }
      report('event', name + (detail === undefined || detail === null ? '' : ':' + String(detail)))
    },
  })
  record.show = show

  ;(doc.body || doc.documentElement).appendChild(host)
  bootState.mounted = true
  report('mounted', (options.mode === 'quick' ? 'quick' : 'full') + (options.preview ? ':preview' : ''))

  // Fallback in case the engine never emits its first-frame event: the app must
  // never stay covered by a working splash whose first paint we missed.
  window.setTimeout(retireFirstFrame, 1600)

  // Last-resort guard: a broken timeline must never trap the user behind the
  // overlay. The engine's own caps sit well inside this one.
  record.guard = window.setTimeout(function () {
    finishRecord(record, 'guard')
  }, 20000)

  show.play().then(
    function (reason) {
      finishRecord(record, reason)
    },
    function (error) {
      finishRecord(record, 'error')
      try {
        console.error('[ygritte-boot] show failed', error)
      } catch (ignored) {
        /* console unavailable */
      }
    },
  )

  liveSplash = record
  return record
}

function runPreview(mode) {
  try {
    if (liveSplash !== null) {
      var previous = liveSplash
      liveSplash = null
      finishRecord(previous, 'disposed')
    }
  } catch (error) {
    /* keep going: a stale splash must not block a fresh preview */
  }
  return mountSplash({ mode: mode === 'quick' ? 'quick' : 'full', auto: true, preview: true })
}

/* ── settings UI ─────────────────────────────────────────────────────────── */

function Sigil(props) {
  var size = props && typeof props.size === 'number' ? props.size : 26
  return h(
    'svg',
    {
      className: 'ygrt-set-sigil',
      width: size,
      height: size,
      viewBox: '0 0 64 64',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    h('path', {
      d: 'M32 5 55 18.5v27L32 59 9 45.5v-27L32 5Z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.8,
      strokeLinejoin: 'round',
      opacity: 0.85,
    }),
    h('path', {
      d: 'M32 31.5c4.8-1.5 7.9-4.6 9.4-8.9 3 5.7 6.2 8.9 6.2 13.9 0 6.1-4.9 10.9-11 10.9s-11.4-5.7-11.4-11.9c0-3.6 1.5-6.5 3.8-9.4-.3 2.6.4 4.3 2 5.3.2-3.3.5-6.4 1-9.9Z',
      fill: 'currentColor',
      opacity: 0.9,
    }),
    h('circle', { cx: 32, cy: 32, r: 1.8, fill: '#dff3ff' }),
  )
}

function ModePills(props) {
  return h(
    'div',
    { className: 'ygrt-set-pills', role: 'group', 'aria-label': '启动动画档位' },
    MODES.map(function (mode) {
      return h(
        'button',
        {
          key: mode,
          type: 'button',
          className: 'ygrt-set-pill' + (props.value === mode ? ' is-on' : ''),
          'aria-pressed': props.value === mode ? 'true' : 'false',
          onClick: function () {
            props.onChange(mode)
          },
        },
        MODE_LABELS[mode],
      )
    }),
  )
}

function Toggle(props) {
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-checked': props.value ? 'true' : 'false',
      className: 'ygrt-set-switch' + (props.value ? ' is-on' : ''),
      onClick: function () {
        props.onChange(!props.value)
      },
    },
    h('span', { className: 'ygrt-set-switch-knob' }),
  )
}

function GeneralRow() {
  var state = React.useState(readMode)
  var mode = state[0]
  var setMode = state[1]
  function choose(next) {
    writePref(MODE_KEY, next)
    setMode(next)
  }
  return h(
    'div',
    { className: 'ygrt-set-row', 'data-ygrt': 'general-row' },
    h(Sigil, { size: 28 }),
    h(
      'div',
      { className: 'ygrt-set-main' },
      h('div', { className: 'ygrt-set-title' }, 'Ygritte 启动界面'),
      h('div', { className: 'ygrt-set-sub' }, '冰原片头 · Ygritte 身份授权 · 当前：' + MODE_LABELS[mode]),
    ),
    h(ModePills, { value: mode, onChange: choose }),
    h(
      'button',
      {
        type: 'button',
        className: 'ygrt-set-btn',
        onClick: function () {
          runPreview(mode === 'quick' ? 'quick' : 'full')
        },
      },
      '预览',
    ),
  )
}

function SectionPage() {
  var modeState = React.useState(readMode)
  var mode = modeState[0]
  var setMode = modeState[1]
  var autoState = React.useState(readAuto)
  var auto = autoState[0]
  var setAuto = autoState[1]
  function choose(next) {
    writePref(MODE_KEY, next)
    setMode(next)
  }
  function toggleAuto(next) {
    writePref(AUTO_KEY, next ? '1' : '0')
    setAuto(next)
  }
  var previewHref = null
  try {
    if (/^https?:$/.test(window.location.protocol)) {
      previewHref = '/ygritte/preview'
    } else {
      var transport = window.__DSH_TRANSPORT__
      if (transport && typeof transport.streamBaseUrl === 'string' && transport.streamBaseUrl !== '') {
        previewHref = transport.streamBaseUrl.replace(/\/$/, '') + '/ygritte/preview'
      }
    }
  } catch (error) {
    previewHref = null
  }

  return h(
    'div',
    { className: 'ygrt-set-page', 'data-ygrt': 'section-page' },
    h(
      'header',
      { className: 'ygrt-set-hero' },
      h(Sigil, { size: 46 }),
      h(
        'div',
        null,
        h('h2', { className: 'ygrt-set-h2' }, 'Ygritte · 启动与访问授权'),
        h(
          'p',
          { className: 'ygrt-set-p' },
          '打开 DSH 时播放一段冰原终端片头，随后核验 Ygritte 的身份卡：自由民游骑兵，编号 YGRT-0117。',
        ),
      ),
    ),
    h(
      'section',
      { className: 'ygrt-set-card' },
      h(
        'div',
        { className: 'ygrt-set-card-head' },
        h('div', { className: 'ygrt-set-card-title' }, '开机片头与授权界面'),
        h(ModePills, { value: mode, onChange: choose }),
      ),
      h(
        'p',
        { className: 'ygrt-set-p' },
        '简易档约 4 秒，只放片头与身份卡；完整档约 8 秒，包含启动日志、进度条与五步核验。选「关闭」后启动直达 DSH。',
      ),
      h(
        'div',
        { className: 'ygrt-set-actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'ygrt-set-btn is-primary',
            onClick: function () {
              runPreview(mode === 'quick' ? 'quick' : 'full')
            },
          },
          '立即预览',
        ),
        h('span', { className: 'ygrt-set-hint' }, '预览会立刻在当前窗口完整播放一次'),
      ),
    ),
    h(
      'section',
      { className: 'ygrt-set-card' },
      h(
        'div',
        { className: 'ygrt-set-card-head' },
        h('div', { className: 'ygrt-set-card-title' }, '授权界面'),
        h(Toggle, { value: auto, onChange: toggleAuto }),
      ),
      h(
        'p',
        { className: 'ygrt-set-p' },
        '开启自动授权时，核验通过后约 1.8 秒自动进入 DSH；关闭后等你点击或按 Enter 再进入（12 秒后也会自动放行）。',
      ),
      h(
        'ul',
        { className: 'ygrt-set-keys' },
        h('li', null, h('kbd', null, 'Esc'), ' 跳过整段动画'),
        h('li', null, h('kbd', null, 'Enter'), ' / ', h('kbd', null, 'Space'), ' / 点击：快进到下一幕'),
      ),
    ),
    h(
      'section',
      { className: 'ygrt-set-card ygrt-set-about' },
      h('div', { className: 'ygrt-set-card-title' }, '关于'),
      h(
        'p',
        { className: 'ygrt-set-p' },
        PACKAGE + ' v' + VERSION + ' · 首帧盖板与 /ygritte/preview 预览页由插件宿主半边提供。',      ),
      previewHref === null
        ? null
        : h(
            'div',
            { className: 'ygrt-set-actions' },
            h(
              'a',
              { className: 'ygrt-set-link', href: previewHref, target: '_blank', rel: 'noreferrer' },
              '在新标签页打开独立预览页',
            ),
          ),
    ),
  )
}

/* ── settings styles (document scope; DSH alias tokens with fallbacks) ───── */

var SETTINGS_CSS =
  '.ygrt-set-row{display:flex;align-items:center;gap:12px;padding:14px 0;color:var(--dsw-alias-label-primary,#e7eef7)}' +
  '.ygrt-set-row .ygrt-set-sigil{flex:none;color:#ff8a3d;filter:drop-shadow(0 0 6px rgba(255,122,46,.35))}' +
  '.ygrt-set-main{min-width:0;flex:1}' +
  '.ygrt-set-title{font-size:13px;line-height:1.5;font-weight:500}' +
  '.ygrt-set-sub{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,#8b96a8)}' +
  '.ygrt-set-pills{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--dsw-alias-bg-layer-2,rgba(127,140,160,.14))}' +
  '.ygrt-set-pill{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#8b96a8);font:inherit;font-size:12px;line-height:1.2;padding:5px 11px;border-radius:7px;cursor:pointer;transition:background 140ms ease,color 140ms ease}' +
  '.ygrt-set-pill:hover{color:var(--dsw-alias-label-primary,#e7eef7)}' +
  '.ygrt-set-pill.is-on{background:var(--dsw-alias-bg-layer-1,#131a26);color:var(--dsw-alias-label-primary,#e7eef7);box-shadow:0 1px 2px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,138,61,.35)}' +
  '.ygrt-set-btn{appearance:none;font:inherit;font-size:12px;line-height:1.2;padding:6px 14px;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-primary,#e7eef7);background:var(--dsw-alias-bg-layer-1,#131a26);border:1px solid var(--dsw-alias-border-l1,rgba(140,160,190,.28));transition:border-color 140ms ease,box-shadow 140ms ease}' +
  '.ygrt-set-btn:hover{border-color:rgba(255,138,61,.6);box-shadow:0 0 0 3px rgba(255,122,46,.12)}' +
  '.ygrt-set-btn.is-primary{color:#1a0c04;background:linear-gradient(180deg,#ffb454,#ff8a3d);border-color:transparent;font-weight:600}' +
  '.ygrt-set-btn.is-primary:hover{box-shadow:0 0 0 3px rgba(255,138,61,.28)}' +
  '.ygrt-set-page{display:flex;flex-direction:column;gap:18px;padding:4px 2px 24px;color:var(--dsw-alias-label-primary,#e7eef7)}' +
  '.ygrt-set-hero{display:flex;align-items:flex-start;gap:16px;padding:4px 2px 10px}' +
  '.ygrt-set-hero .ygrt-set-sigil{flex:none;margin-top:4px;color:#ff8a3d;filter:drop-shadow(0 0 10px rgba(255,122,46,.35))}' +
  '.ygrt-set-h2{margin:0 0 6px;font-size:19px;line-height:1.35;letter-spacing:.02em}' +
  '.ygrt-set-p{margin:0;font-size:13px;line-height:1.75;color:var(--dsw-alias-label-secondary,#8b96a8)}' +
  '.ygrt-set-card{border:1px solid var(--dsw-alias-border-l1,rgba(140,160,190,.22));border-radius:14px;padding:16px 18px;background:var(--dsw-alias-bg-layer-1,rgba(19,26,38,.55))}' +
  '.ygrt-set-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px}' +
  '.ygrt-set-card-title{font-size:14px;font-weight:600;letter-spacing:.01em}' +
  '.ygrt-set-actions{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}' +
  '.ygrt-set-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#8b96a8)}' +
  '.ygrt-set-keys{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#8b96a8)}' +
  '.ygrt-set-keys kbd{display:inline-block;min-width:20px;padding:1px 7px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1,rgba(140,160,190,.3));border-bottom-width:2px;background:var(--dsw-alias-bg-layer-2,rgba(127,140,160,.14));color:var(--dsw-alias-label-primary,#e7eef7);font:inherit;font-size:11.5px;text-align:center}' +
  '.ygrt-set-switch{position:relative;flex:none;width:40px;height:23px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1,rgba(140,160,190,.3));background:var(--dsw-alias-bg-layer-2,rgba(127,140,160,.18));cursor:pointer;transition:background 160ms ease,border-color 160ms ease;padding:0}' +
  '.ygrt-set-switch.is-on{background:linear-gradient(180deg,#ffb454,#ff8a3d);border-color:transparent}' +
  '.ygrt-set-switch-knob{position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform 160ms cubic-bezier(.3,1.2,.5,1);box-shadow:0 1px 3px rgba(0,0,0,.3)}' +
  '.ygrt-set-switch.is-on .ygrt-set-switch-knob{transform:translateX(17px)}' +
  '.ygrt-set-link{font-size:12.5px;color:#ff9a52;text-decoration:none;border-bottom:1px solid rgba(255,138,61,.4);padding-bottom:1px}' +
  '.ygrt-set-link:hover{color:#ffb877}' +
  '.ygrt-set-about{background:transparent}' +
  '@media (max-width:640px){.ygrt-set-row{flex-wrap:wrap}.ygrt-set-row .ygrt-set-main{flex-basis:calc(100% - 42px)}.ygrt-set-card-head{flex-wrap:wrap}}'

function installSettingsCss() {
  try {
    if (document.getElementById(STYLE_ID) !== null) return function () {}
    var tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.dataset.plugin = PACKAGE
    tag.textContent = SETTINGS_CSS
    ;(document.head || document.documentElement).appendChild(tag)
    return function () {
      try {
        tag.remove()
      } catch (error) {
        /* already removed */
      }
    }
  } catch (error) {
    return function () {}
  }
}

/* ── plugin exports ──────────────────────────────────────────────────────── */

exports.name = 'ygritte-boot'
exports.inject = ['slots']

exports.apply = function apply(ctx) {
  ctx.effect(installSettingsCss, 'ygritte-boot: settings styles')

  ctx.slots.inject('settings.general.item', function () {
    try {
      var disposeGeneral = ctx.slots.register(
        { name: 'settings.general.item', id: 'ygritte-boot', order: 24 },
        GeneralRow,
      )
      report('applied', 'settings.general.item')
      return disposeGeneral
    } catch (error) {
      report('apply-error', 'settings.general.item:' + (error && error.message ? error.message : String(error)))
      throw error
    }
  })

  ctx.slots.inject('settings.section', function () {
    try {
      var disposeSection = ctx.slots.register(
        {
          name: 'settings.section',
          id: 'ygritte',
          order: 36,
          label: function () {
            return 'Ygritte'
          },
        },
        SectionPage,
      )
      report('applied', 'settings.section')
      return disposeSection
    } catch (error) {
      report('apply-error', 'settings.section:' + (error && error.message ? error.message : String(error)))
      throw error
    }
  })

  // The splash is deliberately not a slot contribution: it mounts at module
  // evaluation and is torn down with the plugin through this effect.
  ctx.effect(function () {
    return function () {
      if (liveSplash !== null) {
        var record = liveSplash
        liveSplash = null
        finishRecord(record, 'disposed')
      }
    }
  }, 'ygritte-boot: splash teardown')

  report('apply', 'done')
}

/* ── earliest possible mount, at module evaluation ───────────────────────── */

;(function autoMount() {
  try {
    window.__ygritteBootClient = {
      version: VERSION,
      state: function () {
        return {
          mode: readMode(),
          auto: readAuto(),
          mounted: bootState.mounted,
          finished: bootState.finished,
          playing: liveSplash !== null,
          lastEvent: bootState.lastEvent,
        }
      },
      preview: runPreview,
      mount: function (mode) {
        return mountSplash({ mode: mode === 'quick' ? 'quick' : 'full', auto: true })
      },
    }
  } catch (error) {
    /* debug handle is optional */
  }

  try {
    var params = new URLSearchParams(window.location.search || '')
    if (params.get('ygritte') === '0') {
      retireFirstFrame()
      return
    }
    var mode = readMode()
    if (mode === 'off') {
      retireFirstFrame()
      return
    }
    mountSplash({ mode: mode, auto: readAuto(), preview: false })
  } catch (error) {
    retireFirstFrame()
    try {
      console.error('[ygritte-boot] auto mount failed', error)
    } catch (ignored) {
      /* console unavailable */
    }
  }
})()
