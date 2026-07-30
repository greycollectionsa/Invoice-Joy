/*!
 * easings.js — the 31 standard easing curves from easings.net
 * Source: https://github.com/ai/easings.net  (MIT, Andrey Sitnik & Ivan Solovev)
 * Math lineage: Robert Penner's easing equations. Functions are verbatim from the source.
 *
 * Drop-in (sandboxed webpage / classic <script>):
 *   <script src="easings.js"></script>
 *   Easings.ease('easeOutBack', 0.5)            -> eased value (progress clamped to [0,1])
 *   Easings.CSS.easeOutCubic                    -> "cubic-bezier(0.33, 1, 0.68, 1)"  (null for springs)
 *   Easings.animate(el, {ease:'easeOutBack', duration:420, apply:v=>el.style.transform='scale('+v+')'})
 *   Easings.keyframesCSS('easeOutBounce', {css:v=>'transform: translateY('+((1-v)*-40)+'px)'})
 *
 * Also works as a CommonJS module (const Easings = require('./easings.js')).
 */
(function (root) {
  var pow = Math.pow, sqrt = Math.sqrt, sin = Math.sin, cos = Math.cos, PI = Math.PI;
  var c1 = 1.70158, c2 = c1 * 1.525, c3 = c1 + 1, c4 = (2 * PI) / 3, c5 = (2 * PI) / 4.5;

  function bounceOut(x) {
    var n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    else return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }

  // ---- the 31 functions (progress x in [0,1] -> eased value) ----
  var EASINGS = {
    linear: function (x) { return x; },
    easeInSine: function (x) { return 1 - cos((x * PI) / 2); },
    easeOutSine: function (x) { return sin((x * PI) / 2); },
    easeInOutSine: function (x) { return -(cos(PI * x) - 1) / 2; },
    easeInQuad: function (x) { return x * x; },
    easeOutQuad: function (x) { return 1 - (1 - x) * (1 - x); },
    easeInOutQuad: function (x) { return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2; },
    easeInCubic: function (x) { return x * x * x; },
    easeOutCubic: function (x) { return 1 - pow(1 - x, 3); },
    easeInOutCubic: function (x) { return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2; },
    easeInQuart: function (x) { return x * x * x * x; },
    easeOutQuart: function (x) { return 1 - pow(1 - x, 4); },
    easeInOutQuart: function (x) { return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2; },
    easeInQuint: function (x) { return x * x * x * x * x; },
    easeOutQuint: function (x) { return 1 - pow(1 - x, 5); },
    easeInOutQuint: function (x) { return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2; },
    easeInExpo: function (x) { return x === 0 ? 0 : pow(2, 10 * x - 10); },
    easeOutExpo: function (x) { return x === 1 ? 1 : 1 - pow(2, -10 * x); },
    easeInOutExpo: function (x) { return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2; },
    easeInCirc: function (x) { return 1 - sqrt(1 - pow(x, 2)); },
    easeOutCirc: function (x) { return sqrt(1 - pow(x - 1, 2)); },
    easeInOutCirc: function (x) { return x < 0.5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2; },
    easeInBack: function (x) { return c3 * x * x * x - c1 * x * x; },
    easeOutBack: function (x) { return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2); },
    easeInOutBack: function (x) { return x < 0.5 ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2; },
    easeInElastic: function (x) { return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4); },
    easeOutElastic: function (x) { return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1; },
    easeInOutElastic: function (x) { return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1; },
    easeInBounce: function (x) { return 1 - bounceOut(1 - x); },
    easeOutBounce: bounceOut,
    easeInOutBounce: function (x) { return x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2; }
  };

  // ---- cubic-bezier() strings for CSS (null == spring, use keyframesCSS instead) ----
  var CSS = {
    linear: "linear",
    easeInSine: "cubic-bezier(0.12, 0, 0.39, 0)", easeOutSine: "cubic-bezier(0.61, 1, 0.88, 1)", easeInOutSine: "cubic-bezier(0.37, 0, 0.63, 1)",
    easeInQuad: "cubic-bezier(0.11, 0, 0.5, 0)", easeOutQuad: "cubic-bezier(0.5, 1, 0.89, 1)", easeInOutQuad: "cubic-bezier(0.45, 0, 0.55, 1)",
    easeInCubic: "cubic-bezier(0.32, 0, 0.67, 0)", easeOutCubic: "cubic-bezier(0.33, 1, 0.68, 1)", easeInOutCubic: "cubic-bezier(0.65, 0, 0.35, 1)",
    easeInQuart: "cubic-bezier(0.5, 0, 0.75, 0)", easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)", easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
    easeInQuint: "cubic-bezier(0.64, 0, 0.78, 0)", easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)", easeInOutQuint: "cubic-bezier(0.83, 0, 0.17, 1)",
    easeInExpo: "cubic-bezier(0.7, 0, 0.84, 0)", easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)", easeInOutExpo: "cubic-bezier(0.87, 0, 0.13, 1)",
    easeInCirc: "cubic-bezier(0.55, 0, 1, 0.45)", easeOutCirc: "cubic-bezier(0, 0.55, 0.45, 1)", easeInOutCirc: "cubic-bezier(0.85, 0, 0.15, 1)",
    easeInBack: "cubic-bezier(0.36, 0, 0.66, -0.56)", easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)", easeInOutBack: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    easeInElastic: null, easeOutElastic: null, easeInOutElastic: null,
    easeInBounce: null, easeOutBounce: null, easeInOutBounce: null
  };

  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  // Evaluate an easing at progress t. Progress is clamped to [0,1] — important:
  // easeOutCirc etc. return NaN for t<0 (sqrt of a negative), and clock jitter can push t slightly out of range.
  function ease(name, t) { return (EASINGS[name] || EASINGS.linear)(clamp01(t)); }

  // Build a @keyframes block by sampling the curve — the only way to use springs (elastic/bounce) in CSS.
  // `css(v)` returns the declaration body for a given eased value, e.g. v => 'transform: translateY('+((1-v)*-40)+'px)'.
  // Pair with `animation-timing-function: linear` so the sampled curve isn't double-eased.
  function keyframesCSS(name, opt) {
    opt = opt || {};
    var steps = opt.steps || 24, animName = opt.name || name, f = EASINGS[name] || EASINGS.linear;
    var css = opt.css || function (v) { return "transform: translateX(" + (v * 100).toFixed(2) + "%)"; };
    var out = "@keyframes " + animName + " {\n";
    for (var i = 0; i <= steps; i++) { var t = i / steps; out += "  " + (t * 100).toFixed(2) + "% { " + css(f(t)) + "; }\n"; }
    return out + "}";
  }

  // Minimal rAF tween. `apply(v, t)` receives the eased value (v) and raw progress (t).
  // Respects prefers-reduced-motion by jumping to the end. Returns a cancel() function.
  function animate(el, opt) {
    opt = opt || {};
    var f = EASINGS[opt.ease] || EASINGS.easeOutCubic, dur = opt.duration || 400, apply = opt.apply || function () {}, onDone = opt.onDone;
    var reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || dur <= 0) { apply(1, 1); if (onDone) onDone(); return function () {}; }
    var start = null, raf = 0, cancelled = false;
    function step(now) {
      if (cancelled) return;
      if (start == null) start = now;
      var t = clamp01((now - start) / dur);
      apply(f(t), t);
      if (t < 1) raf = requestAnimationFrame(step); else if (onDone) onDone();
    }
    raf = requestAnimationFrame(step);
    return function cancel() { cancelled = true; if (raf) cancelAnimationFrame(raf); };
  }

  var API = { EASINGS: EASINGS, CSS: CSS, ease: ease, clamp01: clamp01, keyframesCSS: keyframesCSS, animate: animate, names: Object.keys(EASINGS) };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.Easings = API;
})(typeof self !== "undefined" ? self : this);
