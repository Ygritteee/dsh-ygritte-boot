window.__ModuleLoader__.load({
	id: "dsh-ygritte-boot",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		/**
		 * Ygritte // ICE & FIRE
		 * ---------------------------------------------------------------------------
		 * Cinematic boot + identity-authorization engine for the ygritte-boot DSH
		 * plugin splash. Classic script, zero dependencies, Shadow-DOM native.
		 *
		 *   var YgritteShow = (function () {
		 *     var SHOW_CSS = '...'
		 *     function createShow(container, options) { ... }
		 *     return { SHOW_CSS: SHOW_CSS, createShow: createShow }
		 *   })()
		 *
		 * createShow(container, { mode: 'full' | 'quick', autoAuthorize: boolean,
		 *                         reducedMotion?: boolean, onEvent?: fn })
		 *   -> { play(): Promise<'done'|'skipped'>, advance(), skip(), dispose() }
		 *
		 * Art direction: ICE & FIRE. A cold frost field breathes down from the top of
		 * the frame, an ember field glows up from below; drifting snow and rising
		 * sparks never stop crossing in between. The Ygritte wordmark grades from
		 * frost-white into ember, the rune ring carries both ice and fire glyphs, the
		 * VERIFIED seal is a frost ring around a warm ember core, and the transition
		 * is a single cold-cored / fire-rimmed luminance bloom. Composition stays ONE
		 * continuous central narrative: no panel boxes, no grids, no stripes, no
		 * scanlines, no barcode, no vertical rails. Information is held by whitespace,
		 * horizontal hairlines and soft light pools. All timers / intervals /
		 * animation frames / listeners / ResizeObservers are owned by the returned
		 * handle and released by dispose().
		 */
		var YgritteShow = (function () {
		  'use strict';

		  var SHOW_CSS = [

		    /* ── root ─────────────────────────────────────────────────────────── */
		    '.yg-root{--yg-void:#04070d;--yg-ice:#9fdcff;--yg-frost:#dff3ff;--yg-ember:#ff7a2e;--yg-amber:#ffb454;--yg-mono:"Cascadia Code",Consolas,"Courier New",ui-monospace,monospace;--yg-display:"Bahnschrift SemiCondensed","Bahnschrift","Arial Narrow",Impact,sans-serif;position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:var(--yg-void);color:var(--yg-frost);font-family:var(--yg-mono);font-size:13px;line-height:1.5;opacity:0;isolation:isolate;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;user-select:none;-webkit-user-select:none;cursor:default;transition:opacity .5s ease;}',
		    '.yg-root *,.yg-root *::before,.yg-root *::after{box-sizing:border-box;}',
		    '.yg-root p,.yg-root h1,.yg-root h2,.yg-root h3,.yg-root ol,.yg-root ul,.yg-root dl,.yg-root dd,.yg-root dt{margin:0;padding:0;}',
		    '.yg-root ol,.yg-root ul{list-style:none;}',
		    '.yg-root.yg-live{opacity:1;}',
		    '.yg-root.yg-outro{opacity:0;transform:scale(1.012);filter:blur(3px);pointer-events:none;transition:opacity .5s ease,transform .6s ease,filter .6s ease;}',

		    /* ── atmosphere: light pools, grain, vignette, faint brackets ─────── */
		    '.yg-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(120% 68% at 50% -8%,rgba(223,243,255,.22),rgba(159,220,255,.07) 36%,rgba(159,220,255,0) 64%),radial-gradient(118% 74% at 50% 110%,rgba(255,122,46,.24),rgba(255,122,46,.07) 40%,rgba(255,122,46,0) 68%),radial-gradient(92% 58% at 50% 58%,rgba(11,26,41,.9),rgba(4,7,13,0) 80%),linear-gradient(180deg,#02050a 0%,#04070d 44%,#070509 100%);}',
		    '.yg-bg::before{content:"";position:absolute;inset:-16%;background:radial-gradient(46% 32% at 50% 8%,rgba(223,243,255,.2),rgba(159,220,255,.05) 40%,rgba(159,220,255,0) 72%);filter:blur(30px);pointer-events:none;}',
		    '.yg-bg::after{content:"";position:absolute;inset:-18%;background:radial-gradient(46% 34% at 50% 92%,rgba(255,122,46,.22),rgba(255,122,46,.06) 42%,rgba(255,122,46,0) 72%);filter:blur(36px);pointer-events:none;}',
		    '.yg-root.yg-live .yg-bg::before{animation:yg-breathe 13s ease-in-out infinite;}',
		    '.yg-root.yg-live .yg-bg::after{animation:yg-breathe 17s ease-in-out 2.5s infinite reverse;}',
		    '.yg-embers{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:.85;mix-blend-mode:screen;}',
		    '.yg-grain{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:.045;mix-blend-mode:screen;}',
		    '.yg-vignette{position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(122% 94% at 50% 45%,transparent 40%,rgba(2,4,8,.5) 74%,rgba(1,3,6,.94) 100%);}',
		    '.yg-brackets{position:absolute;inset:18px;z-index:7;pointer-events:none;opacity:.45;}',
		    '.yg-brackets span{position:absolute;width:22px;height:22px;border:1px solid rgba(159,220,255,.26);}',
		    '.yg-brackets span:nth-child(1){left:0;top:0;border-right:0;border-bottom:0;}',
		    '.yg-brackets span:nth-child(2){right:0;top:0;border-left:0;border-bottom:0;}',
		    '.yg-brackets span:nth-child(3){left:0;bottom:0;border-right:0;border-top:0;}',
		    '.yg-brackets span:nth-child(4){right:0;bottom:0;border-left:0;border-top:0;border-color:rgba(255,122,46,.24);}',

		    /* ── HUD text lines (no bars, no bands) ───────────────────────────── */
		    '.yg-hud{position:absolute;left:0;right:0;z-index:6;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 36px;pointer-events:none;font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;color:rgba(127,142,163,.6);text-shadow:0 0 20px rgba(4,7,13,.95);}',
		    '.yg-hud-top{top:0;}',
		    '.yg-hud-bottom{bottom:0;padding-top:26px;align-items:flex-end;}',
		    '.yg-hud-left,.yg-hud-right{display:flex;align-items:center;gap:10px;white-space:nowrap;}',
		    '.yg-hud-mid{position:absolute;left:50%;top:22px;transform:translateX(-50%);font-size:8.5px;letter-spacing:.3em;color:rgba(223,243,255,.38);white-space:nowrap;text-transform:none;}',
		    '.yg-hud-mid b{color:rgba(159,220,255,.7);font-weight:400;}',
		    '.yg-dot{width:5px;height:5px;border-radius:50%;background:var(--yg-ice);box-shadow:0 0 9px rgba(223,243,255,.9),0 0 16px rgba(255,180,84,.65);}',
		    '.yg-root.yg-live .yg-dot{animation:yg-pulse-dot 3.2s ease-in-out infinite;}',
		    '.yg-hud-zh{font-size:8.5px;letter-spacing:.14em;text-transform:none;color:rgba(127,142,163,.5);}',
		    '.yg-clock{color:rgba(159,220,255,.72);letter-spacing:.14em;font-variant-numeric:tabular-nums;text-transform:none;}',
		    '.yg-telemetry{display:flex;gap:20px;white-space:nowrap;color:rgba(127,142,163,.5);}',
		    '.yg-telemetry b{color:rgba(223,243,255,.72);font-weight:400;}',
		    '.yg-statusline{display:flex;gap:18px;align-items:center;white-space:nowrap;color:rgba(127,142,163,.5);}',
		    '.yg-statusline b{color:rgba(255,180,84,.85);font-weight:400;}',
		    '.yg-ember-txt{color:rgba(255,180,84,.62);}',

		    /* ── stage / screen cross-dissolve ────────────────────────────────── */
		    '.yg-stage{position:absolute;inset:0;z-index:4;}',
		    '.yg-screen{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:64px 32px 76px;}',
		    '.yg-screen-boot{flex-direction:column;transition:opacity .55s ease,transform .95s cubic-bezier(.2,.7,.2,1),filter .95s ease;}',
		    '.yg-screen-login{opacity:0;visibility:hidden;pointer-events:none;transform:scale(.984);filter:blur(10px);transition:opacity .65s ease .05s,transform 1s cubic-bezier(.2,.7,.2,1),filter 1s ease,visibility 0s .7s;}',
		    '.yg-root.yg-login .yg-screen-boot{opacity:0;visibility:hidden;transform:scale(1.028);filter:blur(12px);transition:opacity .5s ease,transform .95s cubic-bezier(.2,.7,.2,1),filter .95s ease,visibility 0s .55s;}',
		    '.yg-root.yg-login .yg-screen-login{opacity:1;visibility:visible;pointer-events:auto;transform:none;filter:none;transition:opacity .75s ease .1s,transform 1.05s cubic-bezier(.2,.7,.2,1),filter 1.05s ease,visibility 0s;}',

		    /* ── CRT power-on (horizontal line + bloom only) ──────────────────── */
		    '.yg-power{position:absolute;left:0;right:0;top:50%;height:1px;z-index:9;background:linear-gradient(90deg,transparent,rgba(223,243,255,.95),transparent);transform:scaleX(0);transform-origin:50% 50%;box-shadow:0 0 20px rgba(159,220,255,.85);}',
		    '.yg-root.yg-live .yg-power{animation:yg-power-on .64s cubic-bezier(.7,0,.2,1) both;}',
		    '.yg-flash{position:absolute;inset:0;z-index:8;background:#eaf7ff;opacity:0;pointer-events:none;}',
		    '.yg-root.yg-live .yg-flash{animation:yg-flash .52s ease-out .16s both;}',

		    /* ── boot: brand / emblem / sigil ─────────────────────────────────── */
		    '.yg-boot-col{position:relative;display:flex;flex-direction:column;align-items:center;width:min(760px,90vw);}',
		    '.yg-brand{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(640px,90vw);min-height:clamp(178px,25vh,254px);}',
		    '.yg-emblem{position:absolute;left:50%;top:50%;width:clamp(184px,25vh,262px);height:clamp(184px,25vh,262px);transform:translate(-50%,-50%);pointer-events:none;opacity:0;}',
		    '.yg-root.yg-live .yg-emblem{animation:yg-fade-in .95s ease calc(var(--yg-sigil-at,360ms) - 130ms) both;}',
		    '.yg-emblem::before{content:"";position:absolute;inset:14%;border-radius:50%;background:radial-gradient(circle at 50% 58%,rgba(255,122,46,.22),rgba(159,220,255,.1) 52%,transparent 74%);filter:blur(8px);}',
		    '.yg-emblem .yg-ring{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}',
		    '.yg-emblem .yg-sigil{position:absolute;left:19%;top:19%;width:62%;height:62%;overflow:visible;}',
		    '.yg-ring circle,.yg-ring line,.yg-ring path,.yg-sigil path{fill:none;stroke-linecap:round;stroke-linejoin:round;}',
		    '.yg-ring-rot{transform-origin:200px 200px;transform-box:view-box;}',
		    '.yg-root.yg-live .yg-ring-rot{animation:yg-spin 58s linear infinite;}',
		    '.yg-root.yg-live .yg-ring-rot.yg-rev{animation:yg-spin-rev 42s linear infinite;}',
		    '.yg-ring .yg-c-out{stroke:rgba(159,220,255,.4);stroke-width:1.2;stroke-dasharray:.012 .008;}',
		    '.yg-ring .yg-c-mid{stroke:rgba(159,220,255,.14);stroke-width:.7;}',
		    '.yg-ring .yg-c-dash{stroke:rgba(159,220,255,.26);stroke-width:1;stroke-dasharray:.0035 .012;}',
		    '.yg-ring .yg-arc{stroke:rgba(255,122,46,.46);stroke-width:1.4;stroke-dasharray:.17 .52;}',
		    '.yg-ring .yg-arc-ice{stroke:rgba(223,243,255,.52);}',
		    '.yg-ring .yg-tick-cold{stroke:rgba(223,243,255,.5);stroke-width:1.8;}',
		    '.yg-rune.yg-rune-fire path{stroke:rgba(255,180,84,.72);}',
		    '.yg-sigil .yg-frost{stroke:rgba(223,243,255,.75);stroke-width:1.6;}',
		    '.yg-ring .yg-tick{stroke:rgba(159,220,255,.3);stroke-width:1.6;}',
		    '.yg-ring .yg-tick-hot{stroke:var(--yg-ember);stroke-width:2;opacity:.8;}',
		    '.yg-ring .yg-mark{fill:none;stroke:rgba(255,180,84,.75);stroke-width:1.5;}',
		    '.yg-rune path{stroke:rgba(159,220,255,.64);stroke-width:1.5;fill:none;stroke-dasharray:1;stroke-dashoffset:1;}',
		    '.yg-root.yg-live .yg-rune path{animation:yg-draw .8s ease forwards;animation-delay:calc(340ms + var(--yg-i,0) * 110ms);}',
		    '.yg-sigil path{stroke-dasharray:1;stroke-dashoffset:1;}',
		    '.yg-root.yg-live .yg-sigil path{animation:yg-draw 1.15s cubic-bezier(.4,0,.2,1) forwards;animation-delay:calc(420ms + var(--yg-i,0) * 105ms);}',
		    '.yg-sigil .yg-flame{stroke:var(--yg-ember);stroke-width:2.4;}',
		    '.yg-sigil .yg-spark{stroke:var(--yg-amber);stroke-width:1.8;}',
		    '.yg-sigil .yg-spear{stroke:rgba(159,220,255,.8);stroke-width:2;}',
		    '.yg-sigil .yg-base{stroke:rgba(127,142,163,.64);stroke-width:1.4;}',
		    '.yg-root.yg-live .yg-sigil{animation:yg-flicker 4.6s ease-in-out 2s infinite;}',

		    /* ── boot: wordmark + byline + single hairline ────────────────────── */
		    '.yg-word{position:relative;z-index:2;display:flex;align-items:baseline;justify-content:center;font-family:var(--yg-display);font-weight:600;font-size:clamp(54px,9.8vw,118px);line-height:.94;letter-spacing:.12em;padding-left:.12em;color:var(--yg-frost);filter:drop-shadow(0 0 26px rgba(159,220,255,.26)) drop-shadow(0 0 38px rgba(255,122,46,.18));}',
		    '.yg-word span{display:inline-block;opacity:0;background-image:linear-gradient(178deg,#f6fcff 0%,#cfeaff 30%,#9fdcff 52%,#ffb454 76%,#ff7a2e 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:yg-letter .8s cubic-bezier(.16,.84,.28,1) both;animation-delay:calc(var(--yg-word-at,880ms) + var(--yg-i,0) * 58ms);}',
		    '@supports not ((-webkit-background-clip:text) or (background-clip:text)){.yg-word span{background-image:none;-webkit-text-fill-color:var(--yg-frost);}}',
		    '.yg-word::before,.yg-word::after{content:attr(data-text);position:absolute;inset:0;display:flex;justify-content:center;padding-left:.12em;font:inherit;letter-spacing:inherit;opacity:0;pointer-events:none;mix-blend-mode:screen;}',
		    '.yg-word::before{color:var(--yg-ember);-webkit-text-fill-color:var(--yg-ember);animation:yg-glitch-a 2.6s steps(1,end) calc(var(--yg-word-at,880ms) + 900ms) 2;}',
		    '.yg-word::after{color:var(--yg-ice);-webkit-text-fill-color:var(--yg-ice);animation:yg-glitch-b 2.6s steps(1,end) calc(var(--yg-word-at,880ms) + 1700ms) 2;}',
		    '.yg-byline{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:clamp(6px,1.2vh,14px);text-align:center;}',
		    '.yg-byline-en{font-size:clamp(9.5px,1vw,11.5px);letter-spacing:.5em;text-transform:uppercase;color:rgba(159,220,255,.86);padding-left:.5em;opacity:0;animation:yg-fade-in .95s ease both;animation-delay:calc(var(--yg-sub-at,1460ms) + 0ms);}',
		    '.yg-byline-zh{font-size:clamp(9.5px,.95vw,11.5px);letter-spacing:.32em;color:rgba(127,142,163,.84);opacity:0;animation:yg-fade-in .95s ease both;animation-delay:calc(var(--yg-sub-at,1460ms) + 180ms);}',
		    '.yg-rule{display:flex;align-items:center;justify-content:center;gap:12px;width:min(300px,52vw);margin-top:10px;opacity:0;animation:yg-fade-in .9s ease both;animation-delay:calc(var(--yg-sub-at,1460ms) + 340ms);}',
		    '.yg-rule::before{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(159,220,255,.46));}',
		    '.yg-rule::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,rgba(255,180,84,.42),transparent);}',
		    '.yg-rule b{width:4px;height:4px;transform:rotate(45deg);background:var(--yg-ember);box-shadow:0 0 10px rgba(255,122,46,.85),0 0 18px rgba(159,220,255,.5);}',

		    /* ── boot: free-floating airy log column (~620px) ─────────────────── */
		    '.yg-logstream{position:relative;width:min(620px,86vw);margin-top:clamp(20px,3.2vh,32px);opacity:0;animation:yg-fade-in .85s ease both;animation-delay:calc(var(--yg-log-at,1980ms) - 320ms);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);}',
		    '.yg-loghead{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:0 2px 9px;font-size:8.5px;letter-spacing:.26em;text-transform:uppercase;color:rgba(127,142,163,.58);}',
		    '.yg-loghead b{color:rgba(159,220,255,.72);font-weight:400;}',
		    '.yg-loghead span:last-child{color:rgba(255,180,84,.52);letter-spacing:.18em;white-space:nowrap;}',
		    '.yg-log{display:flex;flex-direction:column;gap:7px;padding:0 2px;font-size:11.5px;line-height:1.4;}',
		    '.yg-log li{display:flex;align-items:baseline;gap:12px;opacity:0;transform:translateY(4px);}',
		    '.yg-log li.yg-in{opacity:1;transform:none;transition:opacity .36s ease,transform .36s ease;}',
		    '.yg-log time{flex:0 0 54px;color:rgba(127,142,163,.5);font-size:9.5px;font-variant-numeric:tabular-nums;letter-spacing:.06em;}',
		    '.yg-log-c{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
		    '.yg-log .yg-en{color:rgba(223,243,255,.88);letter-spacing:.05em;}',
		    '.yg-log .yg-zh{color:rgba(127,142,163,.88);letter-spacing:.04em;}',
		    '.yg-log .yg-zh::before{content:" · ";color:rgba(159,220,255,.28);}',
		    '.yg-badge{flex:0 0 42px;text-align:right;font-size:8.5px;font-weight:400;letter-spacing:.22em;color:rgba(223,243,255,.78);opacity:0;}',
		    '.yg-badge.yg-warn{color:rgba(255,180,84,.88);}',
		    '.yg-log li.yg-done .yg-badge{opacity:1;animation:yg-pop .35s ease both;}',
		    '.yg-log li.yg-warn .yg-en{color:rgba(255,180,84,.9);}',
		    '.yg-log li.yg-in:not(.yg-done) .yg-zh::after{content:"▌";margin-left:1px;color:rgba(159,220,255,.9);animation:yg-blink steps(1,end) .9s infinite;}',

		    /* ── boot: continuous hairline progress + flowing light ───────────── */
		    '.yg-prog{position:relative;width:min(620px,86vw);margin-top:clamp(16px,2.4vh,24px);opacity:0;animation:yg-fade-in .8s ease both;animation-delay:calc(var(--yg-prog-at,2320ms) - 300ms);}',
		    '.yg-prog-meta{display:flex;align-items:baseline;justify-content:space-between;gap:16px;font-size:8.5px;letter-spacing:.24em;text-transform:uppercase;color:rgba(127,142,163,.64);}',
		    '.yg-prog-stage{display:flex;align-items:baseline;gap:9px;color:rgba(159,220,255,.86);white-space:nowrap;overflow:hidden;}',
		    '.yg-prog-stage em{font-style:normal;color:rgba(127,142,163,.78);letter-spacing:.1em;text-transform:none;}',
		    '.yg-prog-pct{color:rgba(255,180,84,.88);font-size:11px;letter-spacing:.14em;font-variant-numeric:tabular-nums;}',
		    '.yg-track{position:relative;height:3px;margin-top:10px;overflow:hidden;}',
		    '.yg-track::before{content:"";position:absolute;left:0;right:0;top:1px;height:1px;background:rgba(159,220,255,.14);}',
		    '.yg-fill{position:absolute;left:0;top:1px;height:1px;width:0;background:linear-gradient(90deg,rgba(28,104,148,.15),rgba(159,220,255,.85) 70%,rgba(223,243,255,1));box-shadow:0 0 10px rgba(159,220,255,.55);}',
		    '.yg-fill::after{content:"";position:absolute;right:-2px;top:-2px;width:5px;height:5px;border-radius:50%;background:rgba(223,243,255,.95);box-shadow:0 0 10px rgba(159,220,255,.9),0 0 22px rgba(159,220,255,.45);}',
		    '.yg-flow{position:absolute;left:0;top:0;height:3px;width:16%;background:linear-gradient(90deg,transparent,rgba(223,243,255,.5),transparent);opacity:0;}',
		    '.yg-root.yg-live .yg-flow{opacity:1;animation:yg-flow 2.8s ease-in-out infinite;}',
		    '.yg-prog.yg-done .yg-fill{background:linear-gradient(90deg,rgba(28,104,148,.15),rgba(159,220,255,.85) 42%,rgba(255,180,84,.95) 76%,var(--yg-ember));box-shadow:0 0 14px rgba(255,122,46,.4),0 0 8px rgba(159,220,255,.35);}',
		    '.yg-prog.yg-done .yg-prog-pct{color:rgba(255,180,84,.95);}',
		    '.yg-stages{margin-top:9px;font-size:8px;letter-spacing:.2em;text-transform:uppercase;text-align:center;color:rgba(127,142,163,.4);white-space:nowrap;overflow:hidden;}',
		    '.yg-stages span{transition:color .5s ease,text-shadow .5s ease;}',
		    '.yg-stages span + span::before{content:" · ";color:rgba(127,142,163,.26);}',
		    '.yg-stages span.yg-on{color:rgba(255,180,84,.88);text-shadow:0 0 14px rgba(255,122,46,.45);}',
		    '.yg-stages span.yg-past{color:rgba(159,220,255,.5);}',

		    /* ── login: one continuous centred column ─────────────────────────── */
		    '.yg-login-inner{display:flex;flex-direction:column;align-items:center;text-align:center;width:min(760px,92vw);}',
		    '.yg-login-eyebrow{font-size:8.5px;letter-spacing:.34em;text-transform:uppercase;color:rgba(255,180,84,.72);opacity:0;}',
		    '.yg-root.yg-login .yg-login-eyebrow{animation:yg-fade-up .9s ease .06s both;}',
		    '.yg-bust{position:relative;width:clamp(82px,10.6vh,94px);height:clamp(82px,10.6vh,94px);margin-top:10px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 36%,rgba(255,122,46,.28),rgba(159,220,255,.13) 54%,rgba(4,7,13,0) 76%);box-shadow:0 0 46px rgba(255,180,84,.18),0 0 76px rgba(159,220,255,.1),inset 0 0 32px rgba(255,122,46,.14);opacity:0;}',
		    '.yg-root.yg-login .yg-bust{animation:yg-fade-scale 1s cubic-bezier(.2,.8,.2,1) .12s both;}',
		    '.yg-bust svg{position:absolute;inset:0;width:100%;height:100%;}',
		    '.yg-bust .yg-pt-ice{stroke:rgba(159,220,255,.76);stroke-width:1.6;fill:none;}',
		    '.yg-bust .yg-pt-ember{stroke:var(--yg-ember);stroke-width:1.8;fill:none;}',
		    '.yg-bust .yg-pt-ash{stroke:rgba(127,142,163,.62);stroke-width:1.2;fill:none;}',
		    '.yg-bust .yg-pt-dash{stroke-dasharray:3 4;}',
		    '.yg-bust .yg-pt-dot{stroke:none;}',
		    '.yg-bust .yg-pt-o{transform-origin:60px 60px;transform-box:view-box;}',
		    '.yg-root.yg-login .yg-bust .yg-pt-o{animation:yg-spin 30s linear infinite;}',
		    '.yg-name{font-family:var(--yg-display);font-weight:600;font-size:clamp(42px,6vw,74px);line-height:1;letter-spacing:.14em;padding-left:.14em;color:var(--yg-frost);text-shadow:0 0 26px rgba(255,180,84,.32),0 0 46px rgba(159,220,255,.24);margin-top:8px;opacity:0;}',
		    '.yg-root.yg-login .yg-name{animation:yg-fade-up .95s ease .2s both;}',
		    '.yg-name-zh{font-size:10.5px;letter-spacing:.44em;color:rgba(127,142,163,.8);margin-top:4px;padding-left:.44em;opacity:0;}',
		    '.yg-root.yg-login .yg-name-zh{animation:yg-fade-up .8s ease .33s both;}',
		    '.yg-role{margin-top:9px;font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;color:rgba(159,220,255,.86);opacity:0;}',
		    '.yg-role span{display:inline-block;margin-left:13px;font-size:9px;letter-spacing:.16em;text-transform:none;color:rgba(127,142,163,.78);}',
		    '.yg-root.yg-login .yg-role{animation:yg-fade-up .8s ease .4s both;}',
		    '.yg-dossier{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 54px;margin-top:16px;width:min(500px,90%);text-align:left;opacity:0;}',
		    '.yg-root.yg-login .yg-dossier{animation:yg-fade-in .95s ease .5s both;}',
		    '.yg-field{display:flex;flex-direction:column;gap:2px;}',
		    '.yg-field dt{font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:rgba(127,142,163,.56);}',
		    '.yg-field dd{font-size:10.5px;letter-spacing:.1em;color:rgba(223,243,255,.86);}',
		    '.yg-serial{margin-top:10px;font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:rgba(127,142,163,.42);opacity:0;}',
		    '.yg-root.yg-login .yg-serial{animation:yg-fade-in .9s ease .56s both;}',
		    '.yg-hair{width:min(500px,82%);height:1px;margin:16px 0 13px;background:linear-gradient(90deg,transparent,rgba(159,220,255,.34) 34%,rgba(255,180,84,.3) 66%,transparent);opacity:0;}',
		    '.yg-root.yg-login .yg-hair{animation:yg-fade-in .9s ease .6s both;}',
		    '.yg-verify-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;width:min(600px,100%);font-size:8.5px;letter-spacing:.26em;text-transform:uppercase;color:rgba(127,142,163,.58);opacity:0;}',
		    '.yg-verify-head span:first-child{color:rgba(223,243,255,.7);}',
		    '.yg-verify-tag{font-size:8px;letter-spacing:.2em;color:rgba(255,180,84,.72);white-space:nowrap;}',
		    '.yg-root.yg-login .yg-verify-head{animation:yg-fade-in .9s ease .64s both;}',
		    '.yg-verify{margin-top:5px;width:min(600px,100%);display:flex;flex-direction:column;}',
		    '.yg-vrow{position:relative;display:flex;align-items:baseline;gap:14px;padding:7px 0;font-size:10.5px;opacity:0;}',
		    '.yg-root.yg-login .yg-vrow{animation:yg-row-in .5s ease both;animation-delay:calc(.72s + var(--yg-i,0) * 70ms);}',
		    '.yg-vidx{flex:0 0 22px;color:rgba(127,142,163,.5);font-size:8.5px;letter-spacing:.1em;}',
		    '.yg-vname{flex:1;min-width:0;display:flex;align-items:baseline;gap:12px;text-align:left;}',
		    '.yg-ven{color:rgba(223,243,255,.9);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;}',
		    '.yg-vzh{color:rgba(127,142,163,.78);font-size:9px;letter-spacing:.08em;white-space:nowrap;}',
		    '.yg-vstate{margin-left:auto;flex:0 0 auto;font-size:8.5px;letter-spacing:.2em;color:rgba(127,142,163,.5);}',
		    '.yg-vrow.yg-ok .yg-vstate{color:rgba(223,243,255,.95);text-shadow:0 0 10px rgba(255,180,84,.55);animation:yg-pop .35s ease both;}',
		    '.yg-vrow::after{content:"";position:absolute;left:0;right:0;bottom:3px;height:1px;background:linear-gradient(90deg,transparent,rgba(159,220,255,.5) 34%,rgba(255,180,84,.5) 66%,transparent);transform:scaleX(0);transform-origin:left center;opacity:0;}',
		    '.yg-vrow.yg-ok::after{animation:yg-sweep .9s ease both;}',
		    '.yg-outcome{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:12px;}',
		    '.yg-seal{position:relative;display:flex;align-items:center;justify-content:center;width:90px;height:90px;border-radius:50%;color:var(--yg-frost);opacity:0;transform:rotate(-120deg) scale(1.6);}',
		    '.yg-root.yg-verified .yg-seal{animation:yg-stamp .78s cubic-bezier(.2,1.5,.35,1) both;}',
		    '.yg-seal::before{content:"";position:absolute;inset:0;border-radius:50%;border:1px dashed rgba(223,243,255,.55);}',
		    '.yg-root.yg-verified .yg-seal::before{animation:yg-spin 9s linear infinite;}',
		    '.yg-seal::after{content:"";position:absolute;inset:7px;border-radius:50%;border:1px solid rgba(255,180,84,.32);background:radial-gradient(circle at 50% 58%,rgba(255,180,84,.18),rgba(159,220,255,.06) 56%,transparent 74%);box-shadow:0 0 30px rgba(255,122,46,.22),inset 0 0 22px rgba(159,220,255,.14);}',
		    '.yg-seal-c{position:relative;z-index:2;text-align:center;}',
		    '.yg-seal-c b{display:block;font-family:var(--yg-display);font-size:12.5px;font-weight:500;letter-spacing:.22em;padding-left:.22em;color:var(--yg-frost);text-shadow:0 0 14px rgba(255,180,84,.55),0 0 26px rgba(159,220,255,.4);}',
		    '.yg-seal-c span{display:block;font-size:8px;letter-spacing:.3em;color:rgba(255,180,84,.85);margin-top:2px;}',
		    '.yg-prompt{display:flex;flex-direction:column;align-items:center;gap:5px;margin-top:2px;opacity:0;transform:translateY(6px);}',
		    '.yg-root.yg-ready .yg-prompt{opacity:1;transform:none;transition:opacity .6s ease,transform .6s ease;animation:yg-prompt-pulse 2.6s ease-in-out 1s infinite;}',
		    '.yg-prompt-main{font-size:10.5px;letter-spacing:.12em;color:rgba(223,243,255,.9);}',
		    '.yg-prompt-en{font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:rgba(127,142,163,.66);}',
		    '.yg-prompt kbd{font-family:inherit;font-size:9px;letter-spacing:.06em;color:var(--yg-amber);background:none;border:0;padding:0 2px;}',

		    /* ── continuous luminance-bloom transition (no stripes) ───────────── */
		    '.yg-bloom{position:absolute;inset:0;z-index:30;pointer-events:none;opacity:0;transform:scale(.6);background:radial-gradient(ellipse 54% 42% at 50% 52%,rgba(240,250,255,.97),rgba(159,220,255,.45) 32%,rgba(255,150,60,.24) 52%,rgba(4,7,13,0) 76%);}',
		    '.yg-root.yg-wiping .yg-bloom{animation:yg-bloom 1s cubic-bezier(.4,0,.2,1) both;}',

		    /* ── utilities ────────────────────────────────────────────────────── */
		    '.yg-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}',

		    /* ── keyframes ────────────────────────────────────────────────────── */
		    '@keyframes yg-fade-in{from{opacity:0}to{opacity:1}}',
		    '@keyframes yg-fade-up{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}',
		    '@keyframes yg-fade-scale{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
		    '@keyframes yg-letter{0%{opacity:0;transform:translateY(.46em) scaleY(1.22);filter:blur(7px)}60%{opacity:1;filter:blur(0)}100%{opacity:1;transform:none;filter:none}}',
		    '@keyframes yg-glitch-a{0%,86%,100%{opacity:0;transform:none;clip-path:none}87%{opacity:.75;transform:translate(-3px,1px);clip-path:inset(12% 0 58% 0)}89%{opacity:.6;transform:translate(4px,-2px);clip-path:inset(62% 0 8% 0)}91%{opacity:.8;transform:translate(-2px,0);clip-path:inset(38% 0 34% 0)}93%{opacity:0}}',
		    '@keyframes yg-glitch-b{0%,90%,100%{opacity:0;transform:none;clip-path:none}91%{opacity:.5;transform:translate(3px,1px);clip-path:inset(24% 0 46% 0)}94%{opacity:.4;transform:translate(-3px,2px);clip-path:inset(54% 0 18% 0)}96%{opacity:0}}',
		    '@keyframes yg-draw{to{stroke-dashoffset:0}}',
		    '@keyframes yg-spin{to{transform:rotate(360deg)}}',
		    '@keyframes yg-spin-rev{to{transform:rotate(-360deg)}}',
		    '@keyframes yg-flicker{0%,100%{filter:drop-shadow(0 0 8px rgba(255,122,46,.28)) drop-shadow(0 0 22px rgba(159,220,255,.12))}42%{filter:drop-shadow(0 0 13px rgba(255,122,46,.48)) drop-shadow(0 0 30px rgba(159,220,255,.2))}70%{filter:drop-shadow(0 0 6px rgba(255,122,46,.24)) drop-shadow(0 0 20px rgba(159,220,255,.14))}}',
		    '@keyframes yg-power-on{0%{transform:scaleX(0);opacity:0}18%{opacity:1}45%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}',
		    '@keyframes yg-flash{0%{opacity:0}20%{opacity:.85}55%{opacity:.16}100%{opacity:0}}',
		    '@keyframes yg-blink{0%,49%{opacity:1}50%,100%{opacity:0}}',
		    '@keyframes yg-pulse-dot{0%,100%{opacity:1}50%{opacity:.35}}',
		    '@keyframes yg-pop{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:none}}',
		    '@keyframes yg-row-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}',
		    '@keyframes yg-stamp{0%{opacity:0;transform:rotate(-120deg) scale(1.9)}55%{opacity:1;transform:rotate(-8deg) scale(.92)}78%{transform:rotate(2deg) scale(1.04)}100%{opacity:1;transform:rotate(0deg) scale(1)}}',
		    '@keyframes yg-prompt-pulse{0%,100%{opacity:1}50%{opacity:.62}}',
		    '@keyframes yg-flow{0%{transform:translateX(-120%);opacity:0}12%{opacity:.9}88%{opacity:.9}100%{transform:translateX(650%);opacity:0}}',
		    '@keyframes yg-bloom{0%{opacity:0;transform:scale(.6)}36%{opacity:.95;transform:scale(1.02)}60%{opacity:.88;transform:scale(1.14)}100%{opacity:0;transform:scale(1.55)}}',
		    '@keyframes yg-sweep{0%{transform:scaleX(0);opacity:0}28%{opacity:.75}100%{transform:scaleX(1);opacity:0}}',
		    '@keyframes yg-breathe{0%,100%{opacity:.55;transform:translate3d(0,0,0) scale(1)}50%{opacity:.95;transform:translate3d(1.5%,-1%,0) scale(1.06)}}',

		    /* ── reduced motion: fades only, no canvas/glitch/spin/flow/bloom ─── */
		    '.yg-reduced.yg-live .yg-bg::before,.yg-reduced.yg-live .yg-bg::after{animation:none;opacity:.8;}',
		    '.yg-reduced .yg-ring-rot,.yg-reduced.yg-live .yg-ring-rot{animation:none;}',
		    '.yg-reduced .yg-sigil,.yg-reduced.yg-live .yg-sigil{animation:none;filter:drop-shadow(0 0 10px rgba(255,122,46,.24));}',
		    '.yg-reduced .yg-sigil path,.yg-reduced.yg-live .yg-sigil path{animation:none;stroke-dashoffset:0;}',
		    '.yg-reduced .yg-rune path,.yg-reduced.yg-live .yg-rune path{animation:none;stroke-dashoffset:0;opacity:.75;}',
		    '.yg-reduced .yg-word span{animation-name:yg-fade-in;animation-duration:.45s;animation-timing-function:ease;}',
		    '.yg-reduced .yg-word::before,.yg-reduced .yg-word::after{animation:none;opacity:0;}',
		    '.yg-reduced.yg-live .yg-power{transform:scaleX(1);opacity:.5;animation:yg-fade-in .3s both;}',
		    '.yg-reduced.yg-live .yg-flash{animation:none;opacity:0;}',
		    '.yg-reduced.yg-live .yg-flow{animation:none;opacity:0;}',
		    '.yg-reduced .yg-bloom{display:none;}',
		    '.yg-reduced.yg-ready .yg-prompt{animation:none;}',
		    '.yg-reduced.yg-verified .yg-seal::before{animation:none;}',
		    '.yg-reduced.yg-verified .yg-seal{animation:yg-fade-in .4s both;transform:none;}',
		    '.yg-reduced .yg-bust .yg-pt-o,.yg-reduced.yg-login .yg-bust .yg-pt-o{animation:none;}',
		    '.yg-reduced.yg-login .yg-login-eyebrow,.yg-reduced.yg-login .yg-bust,.yg-reduced.yg-login .yg-name,.yg-reduced.yg-login .yg-name-zh,.yg-reduced.yg-login .yg-role,.yg-reduced.yg-login .yg-vrow{animation-name:yg-fade-in;animation-duration:.45s;}',
		    '.yg-reduced .yg-vrow.yg-ok::after{animation:none;opacity:0;}',
		    '.yg-reduced .yg-screen{transition-duration:.2s;}',
		    '.yg-reduced .yg-screen-login,.yg-reduced.yg-login .yg-screen-login,.yg-reduced.yg-login .yg-screen-boot{transform:none;filter:none;}',
		    '.yg-reduced.yg-outro{transform:none;filter:none;}',
		    '.yg-reduced.yg-live .yg-dot{animation:none;}',
		    '.yg-reduced .yg-outro,.yg-reduced.yg-outro{transition-duration:.18s;}',

		    /* ── responsive ───────────────────────────────────────────────────── */
		    '@media (max-width:1080px){.yg-hud-mid{display:none;}.yg-login-inner{width:min(700px,92vw);}.yg-dossier{gap:12px 40px;}.yg-screen{padding:70px 24px 84px;}}',
		    '@media (max-height:840px){.yg-screen{padding:58px 24px 66px;}.yg-brand{min-height:clamp(140px,20vh,196px);}.yg-emblem{width:clamp(146px,19vh,204px);height:clamp(146px,19vh,204px);}.yg-word{font-size:clamp(44px,7.6vw,92px);}.yg-logstream{margin-top:16px;}.yg-log{gap:5px;font-size:10.5px;}.yg-prog{margin-top:12px;}.yg-bust{width:clamp(74px,9.4vh,84px);height:clamp(74px,9.4vh,84px);margin-top:10px;}.yg-name{font-size:clamp(38px,5.2vw,62px);}.yg-dossier{margin-top:15px;gap:10px 44px;}.yg-hair{margin:14px 0 12px;}.yg-vrow{padding:6px 0;}.yg-seal{width:84px;height:84px;}.yg-outcome{margin-top:10px;gap:9px;}}',
		    '@media (max-height:700px){.yg-logstream{display:none;}.yg-screen{padding:44px 20px;}.yg-brand{min-height:126px;}.yg-emblem{width:clamp(124px,17vh,176px);height:clamp(124px,17vh,176px);}.yg-login-eyebrow,.yg-serial{display:none;}.yg-bust{width:66px;height:66px;margin-top:4px;}.yg-name{font-size:clamp(34px,4.6vw,52px);margin-top:7px;}.yg-dossier{margin-top:11px;gap:8px 34px;}.yg-role{margin-top:7px;}.yg-hair{margin:10px 0 9px;}.yg-vrow{padding:5px 0;}.yg-seal{width:72px;height:72px;}.yg-seal-c b{font-size:10.5px;}}',
		    '@media (max-width:640px){.yg-brackets{display:none;}.yg-hud{padding:14px 16px;font-size:8.5px;letter-spacing:.16em;}.yg-hud-zh{display:none;}.yg-telemetry{display:none;}.yg-statusline{gap:10px;font-size:8px;}.yg-login-inner{width:92vw;}.yg-dossier{grid-template-columns:1fr;gap:7px;margin-top:12px;}.yg-serial{display:none;}.yg-name{font-size:clamp(36px,10.5vw,48px);}.yg-bust{width:70px;height:70px;}.yg-seal{width:72px;height:72px;}.yg-vzh{display:none;}.yg-vname{gap:0;}.yg-outcome{gap:8px;}.yg-screen{padding:64px 18px 78px;}}',

		    /* ── quick mode: no log column, tighter brand ─────────────────────── */
		    '.yg-root[data-mode="quick"] .yg-logstream{display:none;}',
		    '.yg-root[data-mode="quick"] .yg-brand{min-height:clamp(142px,20vh,198px);}',
		    '.yg-root[data-mode="quick"] .yg-emblem{width:clamp(148px,20vh,204px);height:clamp(148px,20vh,204px);}',
		    '.yg-root[data-mode="quick"] .yg-word{font-size:clamp(46px,8vw,96px);}',
		    '.yg-root[data-mode="quick"] .yg-prog{margin-top:clamp(18px,2.8vh,26px);}',
		    '.yg-root[data-mode="quick"] .yg-login-inner{width:min(720px,92vw);}'

		  ].join('\n');

		  /* ── constants ─────────────────────────────────────────────────────── */

		  var instanceSeq = 0;
		  var AUTO_FINISH_DELAY = 1800;
		  var WAIT_CAP = 12000;

		  var TIMING = {
		    full: {
		      sigil: 360, word: 880, sub: 1460, log: 1980, logGap: 380, typeSpeed: 14,
		      prog: 2320, progEnd: 5420, wipe: 5480, login: 5900,
		      verifyLead: 240, verifyStep: 250, sealGap: 260, readyGap: 220, outro: 460
		    },
		    quick: {
		      sigil: 200, word: 440, sub: 780, log: -1, logGap: 0, typeSpeed: 10,
		      prog: 920, progEnd: 2580, wipe: 2620, login: 2960,
		      verifyLead: 220, verifyStep: 150, sealGap: 180, readyGap: 200, outro: 320
		    }
		  };

		  var LOG_LINES = [
		    { en: 'CRYSTAL OSCILLATOR · 32.768 kHz', zh: '晶振校准 · 频率锁定', status: 'OK' },
		    { en: 'FROST-LINK HANDSHAKE · ICE-9', zh: '霜链握手 · 密钥协商', status: 'OK' },
		    { en: 'FIRE-KISSED SIGNATURE', zh: '火印签名 · 纹章校验', status: 'OK' },
		    { en: 'RELAY · NORTH OF THE WALL', zh: '长城以北中继 · 信号衰减 −12 dB', status: 'WARN' },
		    { en: 'IDENTITY VAULT', zh: '身份密库 · 封印完好', status: 'OK' },
		    { en: 'OPERATOR PROFILE', zh: '载入操作员档案 · Ygritte', status: 'OK' }
		  ];

		  var VERIFY_ROWS = [
		    { en: 'FROST-LINK HANDSHAKE', zh: '霜链握手 · ICE-9' },
		    { en: 'BLOODLINE SCAN', zh: '自由民血统扫描' },
		    { en: 'FIRE-KISSED SIGIL', zh: '火印纹章比对' },
		    { en: 'IDENTITY VAULT', zh: '身份密库解锁' },
		    { en: 'OPERATOR RECORD', zh: '操作员档案载入' }
		  ];

		  var STAGES = [
		    { en: 'CRYSTAL OSCILLATOR', zh: '晶振校准', step: '01 晶振' },
		    { en: 'FROST-LINK', zh: '霜链握手', step: '02 霜链' },
		    { en: 'FIRE SIGNATURE', zh: '火印签名', step: '03 火印' },
		    { en: 'IDENTITY VAULT', zh: '身份密库', step: '04 密库' },
		    { en: 'OPERATOR PROFILE', zh: '操作员档案', step: '05 档案' }
		  ];

		  /* ── tiny utilities ────────────────────────────────────────────────── */

		  function pad2(value) { return value < 10 ? '0' + value : '' + value; }

		  function nowMs() {
		    try {
		      if (typeof window !== 'undefined' && window && window.performance && typeof window.performance.now === 'function') {
		        return window.performance.now();
		      }
		    } catch (error) { /* performance is optional */ }
		    return Date.now();
		  }

		  function makeRng(seed) {
		    var value = (seed >>> 0) || 1;
		    return function () {
		      value = (value * 1664525 + 1013904223) >>> 0;
		      return value / 4294967296;
		    };
		  }

		  function formatStamp(ms) {
		    var safe = Math.max(0, ms || 0);
		    var whole = Math.floor(safe / 1000);
		    var frac = Math.round(safe - whole * 1000);
		    if (frac === 1000) { whole += 1; frac = 0; }
		    var fracText = frac < 100 ? (frac < 10 ? '00' : '0') + frac : '' + frac;
		    return '[' + pad2(whole) + '.' + fracText + ']';
		  }

		  function toArray(list) {
		    var out = [];
		    if (!list) return out;
		    for (var i = 0; i < list.length; i += 1) out.push(list[i]);
		    return out;
		  }

		  /* ── generated artwork (inline SVG strings, no external assets) ────── */

		  var RUNE_PATTERNS = [
		    'M-5 -7 L-5 7 M-5 0 L5 -7 M5 -7 L5 7',
		    'M-4 7 L0 -7 L4 7 M-2 1 L2 1',
		    'M-5 -7 L5 0 L-5 7',
		    'M0 -7 L0 7 M-5 -3 L5 -3 M-3 3 L3 7',
		    'M-5 7 L-5 -7 L5 -7 M-5 0 L3 0',
		    'M-5 -6 L5 0 L-5 6 L-5 -6',
		    'M0 -7 L0 7 M-4 -4 L4 4',
		    'M-5 -7 L-5 3 L5 3 M-5 -2 L5 -2',
		    'M-5 -7 L5 7 M5 -7 L-5 7',
		    'M-5 0 L0 -7 L5 0 L0 7 Z',
		    'M-4 -7 L4 -7 L4 7 M-4 7 L-4 -2',
		    'M-5 -7 L0 0 L-5 7 M5 -7 L0 0 L5 7',
		    'M-5 7 L0 -7 M0 -7 L5 7 M-2 0 L2 0',
		    'M-5 -4 L5 -4 L-5 4 L5 4'
		  ];

		  function ringMarkup() {
		    var out = '<svg class="yg-ring" viewBox="0 0 400 400" aria-hidden="true">';
		    out += '<g class="yg-ring-rot">';
		    out += '<circle class="yg-c-out" cx="200" cy="200" r="192" pathLength="1"></circle>';
		    out += '<circle class="yg-c-mid" cx="200" cy="200" r="179"></circle>';
		    var i;
		    var angle;
		    var length;
		    for (i = 0; i < 72; i += 1) {
		      angle = (i * 5) * Math.PI / 180;
		      length = i % 9 === 0 ? 15 : (i % 3 === 0 ? 9 : 4);
		      out += '<line class="yg-tick' + (i % 9 === 0 ? ' yg-tick-hot' : (i % 9 === 4 ? ' yg-tick-cold' : '')) + '"'
		        + ' x1="' + (200 + Math.cos(angle) * 161).toFixed(2) + '"'
		        + ' y1="' + (200 + Math.sin(angle) * 161).toFixed(2) + '"'
		        + ' x2="' + (200 + Math.cos(angle) * (161 + length)).toFixed(2) + '"'
		        + ' y2="' + (200 + Math.sin(angle) * (161 + length)).toFixed(2) + '"></line>';
		    }
		    for (i = 0; i < 14; i += 1) {
		      angle = i * (360 / 14) + 8;
		      out += '<g class="yg-rune' + (i % 5 === 0 ? ' yg-rune-fire' : '') + '" transform="rotate(' + angle.toFixed(2) + ' 200 200) translate(200 30)"'
		        + ' style="--yg-i:' + i + '">'
		        + '<path pathLength="1" d="' + RUNE_PATTERNS[i % RUNE_PATTERNS.length] + '"></path>'
		        + '</g>';
		    }
		    for (i = 0; i < 4; i += 1) {
		      out += '<path class="yg-mark" transform="rotate(' + (i * 90 + 45) + ' 200 200) translate(200 30)"'
		        + ' d="M0 -6 L5 0 L0 6 L-5 0 Z"></path>';
		    }
		    out += '</g>';
		    out += '<g class="yg-ring-rot yg-rev">';
		    out += '<circle class="yg-c-dash" cx="200" cy="200" r="149" pathLength="1"></circle>';
		    for (i = 0; i < 3; i += 1) {
		      out += '<circle class="yg-arc' + (i === 1 ? ' yg-arc-ice' : '') + '" cx="200" cy="200" r="138" pathLength="1"'
		        + ' transform="rotate(' + (i * 120 + 18) + ' 200 200)"></circle>';
		    }
		    out += '</g></svg>';
		    return out;
		  }

		  function sigilMarkup() {
		    return '<svg class="yg-sigil" viewBox="0 0 400 400" aria-hidden="true">'
		      + '<path class="yg-flame" pathLength="1" style="--yg-i:0" d="M200 74 C238 124 286 152 272 214 C262 258 234 280 200 300 C166 280 138 258 128 214 C114 152 162 124 200 74 Z"></path>'
		      + '<path class="yg-flame" pathLength="1" style="--yg-i:2" d="M200 152 C224 184 240 200 232 230 C226 254 214 264 200 276 C186 264 174 254 168 230 C160 200 176 184 200 152 Z"></path>'
		      + '<path class="yg-frost" pathLength="1" style="--yg-i:3" d="M76 252 L108 252 M92 236 L92 268 M81 241 L103 263 M103 241 L81 263"></path>'
		      + '<path class="yg-frost" pathLength="1" style="--yg-i:1" d="M96 116 L118 116 M107 105 L107 127 M99 108 L115 124 M115 108 L99 124"></path>'
		      + '<path class="yg-spark" pathLength="1" style="--yg-i:4" d="M200 196 L200 262"></path>'
		      + '<path class="yg-spark" pathLength="1" style="--yg-i:5" d="M118 168 C150 158 172 138 184 104"></path>'
		      + '<path class="yg-spark" pathLength="1" style="--yg-i:6" d="M282 168 C250 158 228 138 216 104"></path>'
		      + '<path class="yg-spear" pathLength="1" style="--yg-i:7" d="M318 330 L318 96"></path>'
		      + '<path class="yg-spear" pathLength="1" style="--yg-i:8" d="M318 96 L298 130 M318 96 L338 130"></path>'
		      + '<path class="yg-spear" pathLength="1" style="--yg-i:9" d="M318 330 L302 302 M318 330 L334 302"></path>'
		      + '<path class="yg-base" pathLength="1" style="--yg-i:10" d="M132 344 L268 344 M156 352 L244 352"></path>'
		      + '<circle class="yg-spark-dot" cx="128" cy="196" r="2.4" fill="rgba(255,180,84,.7)"></circle>'
		      + '<circle class="yg-spark-dot" cx="272" cy="196" r="2.4" fill="rgba(255,122,46,.65)"></circle>'
		      + '<circle class="yg-spark-dot" cx="200" cy="318" r="2" fill="rgba(159,220,255,.65)"></circle>'
		      + '</svg>';
		  }

		  function bustMarkup() {
		    return '<svg viewBox="0 0 120 120" aria-hidden="true">'
		      + '<g class="yg-pt-o"><ellipse class="yg-pt-ash yg-pt-dash" cx="60" cy="60" rx="46" ry="46"></ellipse></g>'
		      + '<circle class="yg-pt-ice yg-pt-dash" cx="60" cy="51" r="20"></circle>'
		      + '<path class="yg-pt-ember" pathLength="1" d="M42 41 C46 26 52 37 60 21 C68 37 74 26 78 41"></path>'
		      + '<path class="yg-pt-ice" pathLength="1" d="M26 124 C32 95 45 84 60 84 C75 84 88 95 94 124"></path>'
		      + '<path class="yg-pt-ice" opacity=".55" pathLength="1" d="M60 84 L60 118"></path>'
		      + '<circle class="yg-pt-ember" cx="60" cy="58" r="4"></circle>'
		      + '<path class="yg-pt-ash" d="M41 61 L79 61"></path>'
		      + '<circle class="yg-pt-dot" cx="24" cy="28" r="1.4" fill="rgba(255,180,84,.78)"></circle>'
		      + '<circle class="yg-pt-dot" cx="96" cy="26" r="1.3" fill="rgba(159,220,255,.68)"></circle>'
		      + '</svg>';
		  }

		  function wordMarkup() {
		    var letters = 'Ygritte';
		    var out = '<div class="yg-word" data-text="' + letters + '" role="img" aria-label="Ygritte">';
		    for (var i = 0; i < letters.length; i += 1) {
		      out += '<span aria-hidden="true" style="--yg-i:' + i + '">' + letters.charAt(i) + '</span>';
		    }
		    return out + '</div>';
		  }

		  function logRowsMarkup() {
		    var out = '';
		    for (var i = 0; i < LOG_LINES.length; i += 1) {
		      var line = LOG_LINES[i];
		      out += '<li><time></time>'
		        + '<span class="yg-log-c"><span class="yg-en"></span><span class="yg-zh"></span></span>'
		        + '<b class="yg-badge' + (line.status === 'WARN' ? ' yg-warn' : '') + '">' + line.status + '</b>'
		        + '</li>';
		    }
		    return out;
		  }

		  function verifyRowsMarkup() {
		    var out = '';
		    for (var i = 0; i < VERIFY_ROWS.length; i += 1) {
		      var row = VERIFY_ROWS[i];
		      out += '<li class="yg-vrow" style="--yg-i:' + i + '">'
		        + '<span class="yg-vidx">0' + (i + 1) + '</span>'
		        + '<span class="yg-vname"><span class="yg-ven">' + row.en + '</span>'
		        + '<span class="yg-vzh">' + row.zh + '</span></span>'
		        + '<span class="yg-vstate">PENDING</span>'
		        + '</li>';
		    }
		    return out;
		  }

		  function stagesMarkup() {
		    var out = '';
		    for (var i = 0; i < STAGES.length; i += 1) {
		      out += '<span class="yg-step' + (i === 0 ? ' yg-on' : '') + '">' + STAGES[i].step + '</span>';
		    }
		    return out;
		  }

		  function hudTopMarkup() {
		    return '<header class="yg-hud yg-hud-top">'
		      + '<div class="yg-hud-left"><span class="yg-dot" aria-hidden="true"></span>'
		      + '<span>NORTH OF THE WALL</span><span class="yg-hud-zh">长城以北</span></div>'
		      + '<div class="yg-hud-mid"><span>Ygritte</span> <b>//</b> ICE &amp; FIRE</div>'
		      + '<div class="yg-hud-right"><span class="yg-clock" data-yg="clock">--:--:--</span></div>'
		      + '</header>';
		  }

		  function hudBottomMarkup() {
		    return '<footer class="yg-hud yg-hud-bottom">'
		      + '<div class="yg-telemetry"><span>FROST <b data-yg="vIce">78%</b></span>'
		      + '<span>FIRE <b data-yg="vEmber">46%</b></span>'
		      + '<span>LINK 32.768 kHz</span></div>'
		      + '<div class="yg-statusline"><span>FEED <b>LIVE</b></span>'
		      + '<span class="yg-ember-txt">冰与火 · ICE &amp; FIRE</span>'
		      + '<span data-yg="tele">T+ 00:00</span></div>'
		      + '</footer>';
		  }

		  function bootMarkup() {
		    return '<section class="yg-screen yg-screen-boot" data-yg="bootScreen" aria-label="启动序列 · BOOT SEQUENCE">'
		      + '<div class="yg-power" aria-hidden="true"></div>'
		      + '<div class="yg-flash" aria-hidden="true"></div>'
		      + '<div class="yg-boot-col">'
		      + '<div class="yg-brand">'
		      + '<div class="yg-emblem" aria-hidden="true">' + ringMarkup() + sigilMarkup() + '</div>'
		      + wordMarkup()
		      + '</div>'
		      + '<div class="yg-byline">'
		      + '<p class="yg-byline-en">ICE &amp; FIRE · WILDLING ACCESS TERMINAL</p>'
		      + '<p class="yg-byline-zh">冰与火 · 长城以北 · 身份认证终端</p>'
		      + '<div class="yg-rule" aria-hidden="true"><b></b></div>'
		      + '</div>'
		      + '<div class="yg-logstream">'
		      + '<div class="yg-loghead"><span>BOOT SEQUENCE <b>// 开机序列</b></span><span>TTY0 · 冰霜链路</span></div>'
		      + '<ol class="yg-log" data-yg="log">' + logRowsMarkup() + '</ol>'
		      + '</div>'
		      + '<div class="yg-prog" data-yg="prog">'
		      + '<div class="yg-prog-meta"><span class="yg-prog-stage">'
		      + '<span data-yg="stageEn">CRYSTAL OSCILLATOR</span><em data-yg="stageZh">晶振校准</em></span>'
		      + '<span class="yg-prog-pct" data-yg="pct">000%</span></div>'
		      + '<div class="yg-track"><i class="yg-fill" data-yg="fill"></i>'
		      + '<span class="yg-flow" aria-hidden="true"></span></div>'
		      + '<p class="yg-stages" data-yg="steps">' + stagesMarkup() + '</p>'
		      + '</div>'
		      + '</div>'
		      + '</section>';
		  }

		  function loginMarkup() {
		    return '<section class="yg-screen yg-screen-login" data-yg="loginScreen" aria-hidden="true" aria-label="身份核验 · IDENTITY CHECK">'
		      + '<div class="yg-login-inner">'
		      + '<p class="yg-login-eyebrow">ICE &amp; FIRE PROTOCOL · 冰与火授权协议 YGRT-0117</p>'
		      + '<div class="yg-bust" aria-hidden="true">' + bustMarkup() + '</div>'
		      + '<h2 class="yg-name">Ygritte</h2>'
		      + '<p class="yg-name-zh">耶哥蕊特</p>'
		      + '<p class="yg-role">FREE FOLK · RANGER<span>自由民 · 游骑兵 · 冰与火之女</span></p>'
		      + '<dl class="yg-dossier">'
		      + '<div class="yg-field"><dt>ID</dt><dd>YGRT-0117</dd></div>'
		      + '<div class="yg-field"><dt>CLEARANCE</dt><dd>EMBER-VII</dd></div>'
		      + '<div class="yg-field"><dt>UNIT</dt><dd>FREE FOLK / RANGER</dd></div>'
		      + '<div class="yg-field"><dt>ORIGIN</dt><dd>NORTH OF THE WALL</dd></div>'
		      + '</dl>'
		      + '<p class="yg-serial">YGRT-0117 · 0117-590 · KISSED BY FIRE · 冰与火</p>'
		      + '<div class="yg-hair" aria-hidden="true"></div>'
		      + '<div class="yg-verify-head"><span>IDENTITY VERIFICATION · 身份核验</span>'
		      + '<span class="yg-verify-tag">ICE &amp; FIRE · SECURE</span></div>'
		      + '<ol class="yg-verify" data-yg="verify">' + verifyRowsMarkup() + '</ol>'
		      + '<div class="yg-outcome">'
		      + '<div class="yg-seal" data-yg="seal" role="img" aria-label="VERIFIED 已核验 · ICE &amp; FIRE">'
		      + '<div class="yg-seal-c"><b>VERIFIED</b><span>已核验</span></div></div>'
		      + '<div class="yg-prompt" data-yg="prompt">'
		      + '<p class="yg-prompt-main">点击任意处 / 按 <kbd>Enter</kbd> 进入 · <kbd>Esc</kbd> 跳过</p>'
		      + '<p class="yg-prompt-en">CLICK ANYWHERE · ENTER TO PROCEED · ESC TO ABORT</p>'
		      + '</div>'
		      + '</div>'
		      + '</div>'
		      + '</section>';
		  }

		  function grainMarkup(uid) {
		    var id = 'yg-grain-' + uid;
		    return '<svg class="yg-grain" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
		      + '<filter id="' + id + '" x="0" y="0" width="100%" height="100%">'
		      + '<feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="2" stitchTiles="stitch"></feTurbulence>'
		      + '<feColorMatrix type="saturate" values="0"></feColorMatrix>'
		      + '</filter>'
		      + '<rect width="100%" height="100%" filter="url(#' + id + ')"></rect>'
		      + '</svg>';
		  }

		  function buildMarkup(uid) {
		    var html = '';
		    html += '<div class="yg-bg" aria-hidden="true"></div>';
		    html += grainMarkup(uid);
		    html += '<div class="yg-vignette" aria-hidden="true"></div>';
		    html += '<div class="yg-brackets" aria-hidden="true"><span></span><span></span><span></span><span></span></div>';
		    html += hudTopMarkup();
		    html += '<main class="yg-stage">' + bootMarkup() + loginMarkup() + '</main>';
		    html += hudBottomMarkup();
		    html += '<div class="yg-bloom" aria-hidden="true"></div>';
		    html += '<p class="yg-sr" aria-live="polite" data-yg="sr"></p>';
		    return html;
		  }

		  /* ── engine ────────────────────────────────────────────────────────── */

		  function createShow(container, options) {
		    var opts = options || {};
		    var mode = opts.mode === 'quick' ? 'quick' : 'full';
		    var timing = TIMING[mode];
		    var autoAuthorize = opts.autoAuthorize === true;
		    var onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : null;
		    var win = (typeof window !== 'undefined' && window) || null;
		    var doc = (container && container.ownerDocument) || (typeof document !== 'undefined' ? document : null);

		    var reduced = false;
		    if (typeof opts.reducedMotion === 'boolean') {
		      reduced = opts.reducedMotion;
		    } else if (win && typeof win.matchMedia === 'function') {
		      try {
		        reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
		      } catch (error) {
		        reduced = false;
		      }
		    }

		    function deadHandle() {
		      return {
		        play: function () { return Promise.resolve('skipped'); },
		        advance: function () {},
		        skip: function () {},
		        dispose: function () {}
		      };
		    }

		    if (!container || typeof container.appendChild !== 'function' || !doc) return deadHandle();

		    var uid = ++instanceSeq;
		    var styleEl = null;
		    var root = null;
		    try {
		      styleEl = doc.createElement('style');
		      styleEl.className = 'yg-style';
		      styleEl.textContent = SHOW_CSS;
		      root = doc.createElement('div');
		      root.className = 'yg-root' + (reduced ? ' yg-reduced' : '');
		      root.setAttribute('data-mode', mode);
		      root.setAttribute('role', 'dialog');
		      root.setAttribute('aria-modal', 'true');
		      root.setAttribute('aria-label', 'Ygritte // ICE & FIRE · 冰与火身份终端');
		      root.innerHTML = buildMarkup(uid);
		      if (root.style && typeof root.style.setProperty === 'function') {
		        root.style.setProperty('--yg-sigil-at', timing.sigil + 'ms');
		        root.style.setProperty('--yg-word-at', timing.word + 'ms');
		        root.style.setProperty('--yg-sub-at', timing.sub + 'ms');
		        root.style.setProperty('--yg-log-at', Math.max(0, timing.log) + 'ms');
		        root.style.setProperty('--yg-prog-at', timing.prog + 'ms');
		      }
		      container.appendChild(styleEl);
		      container.appendChild(root);
		    } catch (setupError) {
		      try { if (root && root.parentNode) root.parentNode.removeChild(root); } catch (ignored) { /* detached */ }
		      try { if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl); } catch (ignored) { /* detached */ }
		      return deadHandle();
		    }

		    function q(selector) {
		      try { return root ? root.querySelector(selector) : null; } catch (error) { return null; }
		    }
		    function qa(selector) {
		      try { return root ? toArray(root.querySelectorAll(selector)) : []; } catch (error) { return []; }
		    }

		    var refs = {
		      bootScreen: q('[data-yg="bootScreen"]'),
		      loginScreen: q('[data-yg="loginScreen"]'),
		      clock: q('[data-yg="clock"]'),
		      tele: q('[data-yg="tele"]'),
		      log: q('[data-yg="log"]'),
		      logLines: qa('[data-yg="log"] li'),
		      prog: q('[data-yg="prog"]'),
		      fill: q('[data-yg="fill"]'),
		      pct: q('[data-yg="pct"]'),
		      stageEn: q('[data-yg="stageEn"]'),
		      stageZh: q('[data-yg="stageZh"]'),
		      steps: qa('[data-yg="steps"] span'),
		      verifyRows: qa('[data-yg="verify"] li'),
		      seal: q('[data-yg="seal"]'),
		      prompt: q('[data-yg="prompt"]'),
		      sr: q('[data-yg="sr"]'),
		      vIce: q('[data-yg="vIce"]'),
		      vEmber: q('[data-yg="vEmber"]')
		    };

		    var state = {
		      started: false,
		      finished: false,
		      finishing: false,
		      disposed: false,
		      phase: 'idle',
		      login: false,
		      verified: false,
		      t0: 0,
		      playPromise: null,
		      resolvePlay: null,
		      outroTimer: 0,
		      inputBound: false,
		      stageIdx: -1,
		      progFrame: null,
		      emberFrame: null,
		      cw: 0,
		      ch: 0,
		      dpr: 1,
		      canvas: null,
		      ctx: null,
		      particles: [],
		      ro: null
		    };

		    var timeouts = [];
		    var intervals = [];
		    var frames = [];
		    var inputListeners = [];
		    var globalListeners = [];
		    var emberLast = 0;

		    /* ── error / event plumbing ─────────────────────────────────────── */

		    function report(error) {
		      try {
		        if (win && win.console && typeof win.console.warn === 'function') {
		          win.console.warn('[ygritte] internal animation error', error);
		        }
		      } catch (ignored) { /* console unavailable */ }
		    }

		    function emit(name, detail) {
		      if (!onEvent) return;
		      try {
		        onEvent(name, detail);
		      } catch (error) {
		        report(error);
		      }
		    }

		    function setSR(text) {
		      if (refs.sr) refs.sr.textContent = text;
		    }

		    /* ── timer / frame / interval ownership ─────────────────────────── */

		    function schedule(fn, ms) {
		      var id = setTimeout(function () {
		        if (state.disposed || state.finished) return;
		        try { fn(); } catch (error) { report(error); }
		      }, Math.max(0, ms || 0));
		      timeouts.push(id);
		      return id;
		    }

		    function clearTimers() {
		      for (var i = 0; i < timeouts.length; i += 1) {
		        try { clearTimeout(timeouts[i]); } catch (error) { /* already gone */ }
		      }
		      timeouts.length = 0;
		      state.outroTimer = 0;
		    }

		    function removeFrame(record) {
		      var index = frames.indexOf(record);
		      if (index >= 0) frames.splice(index, 1);
		    }

		    function requestFrame(fn) {
		      var record = { kind: '', id: 0 };
		      function run(stamp) {
		        removeFrame(record);
		        if (state.disposed || state.finished) return;
		        try { fn(stamp); } catch (error) { report(error); }
		      }
		      if (win && typeof win.requestAnimationFrame === 'function') {
		        record.kind = 'raf';
		        record.id = win.requestAnimationFrame(run);
		      } else {
		        record.kind = 'timeout';
		        record.id = setTimeout(run, 16);
		      }
		      frames.push(record);
		      return record;
		    }

		    function cancelFrame(record) {
		      if (!record) return;
		      removeFrame(record);
		      try {
		        if (record.kind === 'raf') {
		          if (win && typeof win.cancelAnimationFrame === 'function') win.cancelAnimationFrame(record.id);
		        } else {
		          clearTimeout(record.id);
		        }
		      } catch (error) { /* already gone */ }
		    }

		    function cancelFrames() {
		      while (frames.length > 0) cancelFrame(frames[frames.length - 1]);
		    }

		    function clearIntervals() {
		      for (var i = 0; i < intervals.length; i += 1) {
		        try { clearInterval(intervals[i]); } catch (error) { /* already gone */ }
		      }
		      intervals.length = 0;
		    }

		    /* ── listener ownership ─────────────────────────────────────────── */

		    function listen(bucket, target, type, handler, capture) {
		      if (!target || typeof target.addEventListener !== 'function') return;
		      try {
		        target.addEventListener(type, handler, capture === true);
		        bucket.push([target, type, handler, capture === true]);
		      } catch (error) {
		        report(error);
		      }
		    }

		    function unlisten(bucket) {
		      for (var i = 0; i < bucket.length; i += 1) {
		        var item = bucket[i];
		        try { item[0].removeEventListener(item[1], item[2], item[3]); } catch (error) { /* already gone */ }
		      }
		      bucket.length = 0;
		    }

		    /* ── HUD clock + soft telemetry text ────────────────────────────── */

		    function updateClock() {
		      var date = new Date();
		      var hours = pad2(date.getHours());
		      var minutes = pad2(date.getMinutes());
		      var seconds = pad2(date.getSeconds());
		      if (refs.clock) refs.clock.textContent = 'LOCAL ' + hours + ':' + minutes + ':' + seconds;
		      if (refs.tele) {
		        var elapsed = state.t0 > 0 ? Math.max(0, Math.floor((nowMs() - state.t0) / 1000)) : 0;
		        var offset = -date.getTimezoneOffset();
		        var sign = offset >= 0 ? '+' : '-';
		        refs.tele.textContent = 'T+ ' + pad2(Math.floor(elapsed / 60)) + ':' + pad2(elapsed % 60)
		          + ' · UTC' + sign + pad2(Math.floor(Math.abs(offset) / 60)) + ':' + pad2(Math.abs(offset) % 60);
		      }
		    }

		    function updateTelemetry() {
		      var seconds = Date.now() / 1000;
		      var ice = 74 + Math.sin(seconds / 5.3) * 7;
		      var ember = 46 + Math.sin(seconds / 3.1 + 1.7) * 13;
		      if (refs.vIce) refs.vIce.textContent = Math.round(ice) + '%';
		      if (refs.vEmber) refs.vEmber.textContent = Math.round(ember) + '%';
		    }

		    function startClock() {
		      updateClock();
		      updateTelemetry();
		      intervals.push(setInterval(function () {
		        if (state.disposed || state.finished) return;
		        updateClock();
		        updateTelemetry();
		      }, 1000));
		    }

		    /* ── ember canvas ───────────────────────────────────────────────── */

		    function sizeCanvas() {
		      if (!state.canvas || !state.ctx) return;
		      var width = 0;
		      var height = 0;
		      try {
		        width = root && root.clientWidth ? root.clientWidth : 0;
		        height = root && root.clientHeight ? root.clientHeight : 0;
		      } catch (error) { /* layout unavailable */ }
		      if (!width && win) width = win.innerWidth || 0;
		      if (!height && win) height = win.innerHeight || 0;
		      if (!width) width = 1;
		      if (!height) height = 1;
		      var dpr = Math.min((win && win.devicePixelRatio) || 1, 2);
		      state.cw = width;
		      state.ch = height;
		      state.dpr = dpr;
		      state.canvas.width = Math.round(width * dpr);
		      state.canvas.height = Math.round(height * dpr);
		      try {
		        state.canvas.style.width = width + 'px';
		        state.canvas.style.height = height + 'px';
		        state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		      } catch (error) { /* ctx is best-effort */ }
		    }

		    function seedParticles() {
		      var area = state.cw * state.ch;
		      var total = Math.round(Math.min(104, Math.max(38, area / 22000)));
		      var emberCount = Math.round(total * 0.6);
		      var next = [];
		      for (var i = 0; i < total; i += 1) {
		        var isEmber = i < emberCount;
		        next.push({
		          ember: isEmber,
		          x: Math.random() * state.cw,
		          y: isEmber
		            ? state.ch * (0.55 + Math.random() * 0.5)
		            : state.ch * Math.random() * 0.45,
		          r: isEmber ? 0.8 + Math.random() * 1.9 : 0.6 + Math.random() * 1.2,
		          vx: isEmber ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 5,
		          vy: isEmber ? 10 + Math.random() * 26 : 6 + Math.random() * 14,
		          a: isEmber ? 0.28 + Math.random() * 0.5 : 0.16 + Math.random() * 0.34,
		          phase: Math.random() * Math.PI * 2,
		          hue: isEmber
		            ? (Math.random() < 0.3 ? '255,180,84' : '255,122,46')
		            : (Math.random() < 0.5 ? '223,243,255' : '159,220,255')
		        });
		      }
		      state.particles = next;
		    }

		    function renderEmbers(delta, seconds) {
		      var context = state.ctx;
		      if (!context) return;
		      var width = state.cw;
		      var height = state.ch;
		      context.clearRect(0, 0, width, height);
		      context.globalCompositeOperation = 'lighter';
		      var particles = state.particles;
		      for (var i = 0; i < particles.length; i += 1) {
		        var particle = particles[i];
		        if (particle.ember) {
		          particle.y -= particle.vy * delta;
		          particle.x += (particle.vx + Math.sin(seconds * 1.4 + particle.phase) * 7) * delta;
		          if (particle.y < -12) {
		            particle.y = height + 10;
		            particle.x = Math.random() * width;
		          }
		        } else {
		          particle.y += particle.vy * delta;
		          particle.x += (particle.vx + Math.sin(seconds * 0.7 + particle.phase) * 6) * delta;
		          if (particle.y > height + 12) {
		            particle.y = -10;
		            particle.x = Math.random() * width;
		          }
		        }
		        if (particle.x < -16) particle.x = width + 12;
		        else if (particle.x > width + 16) particle.x = -12;
		        var flicker = particle.ember
		          ? 0.6 + 0.4 * Math.sin(seconds * 3.1 + particle.phase)
		          : 0.7 + 0.3 * Math.sin(seconds * 1.6 + particle.phase);
		        var alpha = particle.a * flicker;
		        if (alpha <= 0.01) continue;
		        context.fillStyle = 'rgba(' + particle.hue + ',' + alpha.toFixed(3) + ')';
		        context.beginPath();
		        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
		        context.fill();
		        if (particle.ember) {
		          context.fillStyle = 'rgba(' + particle.hue + ',' + (alpha * 0.22).toFixed(3) + ')';
		          context.beginPath();
		          context.arc(particle.x, particle.y, particle.r * 2.6, 0, Math.PI * 2);
		          context.fill();
		        }
		      }
		      context.globalCompositeOperation = 'source-over';
		    }

		    function emberTick(stamp) {
		      if (state.disposed || state.finished || !state.ctx) return;
		      var current = typeof stamp === 'number' ? stamp : nowMs();
		      var delta = emberLast > 0 ? Math.min(0.05, (current - emberLast) / 1000) : 0.016;
		      emberLast = current;
		      renderEmbers(delta, current / 1000);
		      state.emberFrame = requestFrame(emberTick);
		    }

		    function onResize() {
		      if (state.disposed || state.finished) return;
		      var oldWidth = state.cw;
		      var oldHeight = state.ch;
		      sizeCanvas();
		      if (Math.abs(oldWidth - state.cw) < 2 && Math.abs(oldHeight - state.ch) < 2) return;
		      seedParticles();
		    }

		    function startEmbers() {
		      if (reduced || state.disposed) return;
		      var canvas = doc.createElement('canvas');
		      canvas.className = 'yg-embers';
		      canvas.setAttribute('aria-hidden', 'true');
		      try {
		        root.insertBefore(canvas, root.firstChild);
		      } catch (error) {
		        return;
		      }
		      if (typeof canvas.getContext !== 'function') {
		        try { root.removeChild(canvas); } catch (ignored) { /* detached */ }
		        return;
		      }
		      var context = null;
		      try { context = canvas.getContext('2d'); } catch (error) { context = null; }
		      if (!context) {
		        try { root.removeChild(canvas); } catch (ignored) { /* detached */ }
		        return;
		      }
		      state.canvas = canvas;
		      state.ctx = context;
		      emberLast = 0;
		      sizeCanvas();
		      seedParticles();
		      state.emberFrame = requestFrame(emberTick);
		      listen(globalListeners, win, 'resize', onResize, false);
		      if (win && typeof win.ResizeObserver === 'function') {
		        try {
		          state.ro = new win.ResizeObserver(onResize);
		          state.ro.observe(root);
		        } catch (error) {
		          state.ro = null;
		        }
		      }
		    }

		    function stopMotion() {
		      cancelFrames();
		      state.emberFrame = null;
		      state.progFrame = null;
		      clearIntervals();
		      unlisten(globalListeners);
		      if (state.ro) {
		        try { state.ro.disconnect(); } catch (error) { /* already gone */ }
		        state.ro = null;
		      }
		    }

		    /* ── boot progress (one continuous hairline) ────────────────────── */

		    function setStage(index, complete) {
		      var safeIndex = Math.max(0, Math.min(STAGES.length - 1, index));
		      var stage = STAGES[safeIndex];
		      if (refs.stageEn) refs.stageEn.textContent = complete ? 'OPERATOR PROFILE' : stage.en;
		      if (refs.stageZh) refs.stageZh.textContent = complete ? '操作员档案 · 就绪' : stage.zh;
		      for (var i = 0; i < refs.steps.length; i += 1) {
		        var el = refs.steps[i];
		        var className = 'yg-step';
		        if (complete) className += i <= safeIndex ? ' yg-past' : '';
		        else if (i < safeIndex) className += ' yg-past';
		        else if (i === safeIndex) className += ' yg-on';
		        el.className = className;
		      }
		    }

		    function setProgress(value) {
		      var ratio = Math.max(0, Math.min(1, value));
		      if (refs.fill) refs.fill.style.width = (ratio * 100).toFixed(2) + '%';
		      var percent = Math.round(ratio * 100);
		      if (refs.pct) refs.pct.textContent = (percent < 10 ? '00' : (percent < 100 ? '0' : '')) + percent + '%';
		      var index = Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length));
		      if (index !== state.stageIdx) {
		        state.stageIdx = index;
		        setStage(index, false);
		      }
		    }

		    function startProgress() {
		      var startedAt = nowMs();
		      var duration = Math.max(400, timing.progEnd - timing.prog);
		      function tick() {
		        if (state.disposed || state.finished) return;
		        var raw = Math.min(1, (nowMs() - startedAt) / duration);
		        var eased = raw * raw * (3 - 2 * raw);
		        setProgress(eased);
		        if (raw < 1) state.progFrame = requestFrame(tick);
		      }
		      state.progFrame = requestFrame(tick);
		    }

		    function completeProgress() {
		      setProgress(1);
		      setStage(STAGES.length - 1, true);
		      if (refs.prog) refs.prog.classList.add('yg-done');
		      if (refs.pct) refs.pct.textContent = '100%';
		    }

		    function stopProgress() {
		      cancelFrame(state.progFrame);
		      state.progFrame = null;
		    }

		    /* ── typed boot log ─────────────────────────────────────────────── */

		    function typeSequence(items, speed, done) {
		      var itemIndex = 0;
		      var charIndex = 0;
		      function step() {
		        if (state.disposed || state.finished) return;
		        var item = items[itemIndex];
		        if (!item) {
		          if (done) done();
		          return;
		        }
		        charIndex += 1;
		        item.el.textContent = item.text.slice(0, charIndex);
		        if (charIndex >= item.text.length) {
		          itemIndex += 1;
		          charIndex = 0;
		          if (itemIndex >= items.length) {
		            if (done) done();
		            return;
		          }
		        }
		        schedule(step, speed);
		      }
		      schedule(step, 0);
		    }

		    function typeLine(index) {
		      var line = refs.logLines[index];
		      var data = LOG_LINES[index];
		      if (!line || !data) return;
		      var time = line.querySelector('time');
		      var en = line.querySelector('.yg-en');
		      var zh = line.querySelector('.yg-zh');
		      if (time) time.textContent = formatStamp(timing.log + index * timing.logGap);
		      line.classList.add('yg-in');
		      if (data.status === 'WARN') line.classList.add('yg-warn');
		      var items = [];
		      if (en) items.push({ el: en, text: data.en });
		      if (zh) items.push({ el: zh, text: data.zh });
		      typeSequence(items, timing.typeSpeed || 14, function () {
		        line.classList.add('yg-done');
		      });
		    }

		    function startLog() {
		      for (var i = 0; i < refs.logLines.length; i += 1) {
		        (function (index) {
		          schedule(function () { typeLine(index); }, index * timing.logGap);
		        })(i);
		      }
		    }

		    /* ── login / verification ───────────────────────────────────────── */

		    function verifyRow(index) {
		      var row = refs.verifyRows[index];
		      if (!row) return;
		      row.classList.add('yg-ok');
		      var value = row.querySelector('.yg-vstate');
		      if (value) value.textContent = 'OK';
		      setSR('核验 ' + (index + 1) + ' / ' + refs.verifyRows.length + ' · ' + (VERIFY_ROWS[index] ? VERIFY_ROWS[index].en : ''));
		    }

		    function sealVerified() {
		      if (state.verified || state.finished || state.disposed) return;
		      state.verified = true;
		      root.classList.add('yg-verified');
		      emit('verified', 'YGRT-0117');
		      emit('phase', 'verified');
		      setSR('VERIFIED · 已核验 · 冰与火之印 · 点击任意处进入');
		    }

		    function showPrompt() {
		      if (state.finished || state.disposed) return;
		      root.classList.add('yg-ready');
		      emit('phase', 'prompt');
		    }

		    function enterLogin(jump) {
		      if (state.login || state.finished || state.disposed) return;
		      state.login = true;
		      state.phase = 'login';
		      root.classList.add('yg-login');
		      if (refs.bootScreen) refs.bootScreen.setAttribute('aria-hidden', 'true');
		      if (refs.loginScreen) refs.loginScreen.setAttribute('aria-hidden', 'false');
		      setSR('身份核验 // IDENTITY CHECK · 冰与火 · YGRT-0117');
		      emit('login', mode);
		      emit('phase', 'login');
		      var lead = jump ? 140 : timing.verifyLead;
		      var index;
		      for (index = 0; index < refs.verifyRows.length; index += 1) {
		        (function (rowIndex) {
		          schedule(function () { verifyRow(rowIndex); }, lead + rowIndex * timing.verifyStep);
		        })(index);
		      }
		      var sealAt = lead + refs.verifyRows.length * timing.verifyStep + timing.sealGap;
		      schedule(function () { sealVerified(); }, sealAt);
		      schedule(function () { showPrompt(); }, sealAt + timing.readyGap);
		      if (autoAuthorize) {
		        schedule(function () { beginFinish('done', 'auto'); }, sealAt + AUTO_FINISH_DELAY);
		      } else {
		        var waited = Math.max(0, nowMs() - state.t0);
		        var remaining = Math.max(1200, WAIT_CAP - waited);
		        schedule(function () { beginFinish('done', 'timeout'); }, remaining);
		      }
		    }

		    function jumpToLogin() {
		      if (state.disposed || state.finished || state.finishing || state.login) return;
		      clearTimers();
		      stopProgress();
		      completeProgress();
		      root.classList.remove('yg-wiping');
		      enterLogin(true);
		    }

		    /* ── input ──────────────────────────────────────────────────────── */

		    function onKeyDown(event) {
		      if (state.disposed || state.finished) return;
		      var key = event.key || '';
		      var code = event.code || '';
		      if (key === 'Enter' || key === ' ' || key === 'Spacebar' || code === 'Space' || code === 'Enter') {
		        if (event.repeat) return;
		        if (event.preventDefault) event.preventDefault();
		        advance();
		      } else if (key === 'Escape' || key === 'Esc' || code === 'Escape') {
		        if (event.repeat) return;
		        if (event.preventDefault) event.preventDefault();
		        skip();
		      }
		    }

		    function onClick(event) {
		      if (state.disposed || state.finished) return;
		      if (event && event.stopPropagation) event.stopPropagation();
		      advance();
		    }

		    function bindInput() {
		      if (state.inputBound) return;
		      state.inputBound = true;
		      listen(inputListeners, doc, 'keydown', onKeyDown, true);
		      listen(inputListeners, root, 'click', onClick, false);
		    }

		    function unbindInput() {
		      unlisten(inputListeners);
		      state.inputBound = false;
		    }

		    /* ── lifecycle ──────────────────────────────────────────────────── */

		    function settle(kind) {
		      var resolve = state.resolvePlay;
		      state.resolvePlay = null;
		      if (!resolve) return;
		      try { resolve(kind); } catch (error) { report(error); }
		    }

		    function completeFinish(kind, reason) {
		      if (state.disposed || state.finished) return;
		      state.finished = true;
		      state.phase = kind;
		      stopMotion();
		      unbindInput();
		      emit(kind === 'skipped' ? 'skipped' : 'done', reason || kind);
		      settle(kind);
		    }

		    function beginFinish(kind, reason) {
		      if (state.disposed || state.finished || state.finishing) return;
		      state.finishing = true;
		      emit('phase', 'outro');
		      clearTimers();
		      stopProgress();
		      clearIntervals();
		      unbindInput();
		      if (root) root.classList.add('yg-outro');
		      if (kind === 'skipped') {
		        completeFinish(kind, reason || 'skip');
		        return;
		      }
		      var delay = reduced ? 120 : (timing.outro || 420);
		      state.outroTimer = setTimeout(function () {
		        if (state.disposed) return;
		        try { completeFinish(kind, reason); } catch (error) { report(error); }
		      }, delay);
		      timeouts.push(state.outroTimer);
		    }

		    function skip() {
		      if (state.disposed || state.finished || !state.started) return;
		      if (state.finishing) {
		        if (state.outroTimer) {
		          try { clearTimeout(state.outroTimer); } catch (error) { /* already gone */ }
		          state.outroTimer = 0;
		        }
		        completeFinish('skipped', 'skip');
		        return;
		      }
		      beginFinish('skipped', 'skip');
		    }

		    function advance() {
		      if (state.disposed || state.finished || state.finishing || !state.started) return;
		      if (!state.login) {
		        jumpToLogin();
		        return;
		      }
		      if (!state.verified) sealVerified();
		      beginFinish('done', 'input');
		    }

		    function dispose() {
		      if (state.disposed) return;
		      state.disposed = true;
		      clearTimers();
		      clearIntervals();
		      cancelFrames();
		      stopProgress();
		      unbindInput();
		      unlisten(globalListeners);
		      if (state.ro) {
		        try { state.ro.disconnect(); } catch (error) { /* already gone */ }
		        state.ro = null;
		      }
		      state.particles.length = 0;
		      state.ctx = null;
		      state.canvas = null;
		      if (!state.finished) {
		        state.finished = true;
		        settle('skipped');
		      }
		      try { if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl); } catch (error) { /* detached */ }
		      try { if (root && root.parentNode) root.parentNode.removeChild(root); } catch (error) { /* detached */ }
		      styleEl = null;
		      root = null;
		      refs = {};
		    }

		    function play() {
		      if (state.disposed) return Promise.resolve('skipped');
		      if (state.finished) return Promise.resolve(state.phase === 'skipped' ? 'skipped' : 'done');
		      if (state.playPromise) return state.playPromise;
		      var resolver = null;
		      state.playPromise = new Promise(function (resolve) { resolver = resolve; });
		      state.resolvePlay = resolver;
		      state.started = true;
		      state.t0 = nowMs();
		      state.phase = 'boot';
		      root.classList.add('yg-live');
		      bindInput();
		      startClock();
		      if (!reduced) startEmbers();
		      emit('boot', mode);
		      emit('phase', 'power-on');
		      schedule(function () { emit('phase', 'sigil'); }, timing.sigil);
		      schedule(function () { emit('phase', 'wordmark'); }, timing.word);
		      if (timing.log >= 0) {
		        schedule(function () {
		          emit('phase', 'bootlog');
		          startLog();
		        }, timing.log);
		      }
		      schedule(function () {
		        emit('phase', 'progress');
		        startProgress();
		      }, timing.prog);
		      schedule(function () { completeProgress(); }, timing.progEnd);
		      schedule(function () {
		        emit('phase', 'wipe');
		        root.classList.add('yg-wiping');
		      }, timing.wipe);
		      schedule(function () { enterLogin(false); }, timing.login);
		      schedule(function () { root.classList.remove('yg-wiping'); }, timing.login + 760);
		      requestFrame(function () {
		        requestFrame(function () { emit('first-frame', mode); });
		      });
		      return state.playPromise;
		    }

		    setProgress(0);
		    updateClock();

		    return { play: play, advance: advance, skip: skip, dispose: dispose };
		  }

		  return { SHOW_CSS: SHOW_CSS, createShow: createShow };
		})();


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

		var PACKAGE = 'dsh-ygritte-boot'
		var VERSION = '1.3.1'
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


		return module.exports;
	},
});
