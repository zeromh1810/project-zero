/**
 * WEBGL GRADIENT v4.1 — FBM domain warping + click/touch water ripple pool
 * Base: FBM 6 octavas + domain warping + mouse interaction (v4)
 * Added: 4-slot ripple pool triggered by click/touch anywhere on the page.
 *        Aspect-ratio corrected expanding rings, Gaussian bell front,
 *        secondary trailing waves, radial UV distortion, crest highlight.
 */

const VERTEX_SHADER = `precision mediump float;
  attribute vec2 pos;
  void main(){ gl_Position = vec4(pos, 0., 1.); }`

const FRAGMENT_SHADER = `precision mediump float;
  uniform float t;
  uniform vec2  res;
  uniform vec3  ca, cb, cc, cd, ce;
  uniform float dark;
  uniform vec2  mouse;
  uniform float mouseTime;
  uniform float mouseActive;
  uniform vec4  r0, r1, r2, r3; // xy=uv pos, z=age secs (-1=inactive), w=amplitude

  vec3 m289(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec4 m289(vec4 x){ return x - floor(x*(1./289.))*289.; }
  vec4 perm(vec4 x){ return m289(((x*34.)+1.)*x); }
  vec4 tis(vec4 r){ return 1.7928429 - 0.8537347*r; }

  float sn(vec3 v){
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0., .5, 1., 2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = m289(i);
    vec4 p = perm(perm(perm(
      i.z + vec4(0., i1.z, i2.z, 1.)) +
      i.y + vec4(0., i1.y, i2.y, 1.)) +
      i.x + vec4(0., i1.x, i2.x, 1.));
    float n_ = .142857;
    vec3 ns = n_*D.wyz - D.xzx;
    vec4 j  = p - 49.*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.*x_);
    vec4 xx = x_*ns.x + ns.yyyy;
    vec4 yy = y_*ns.x + ns.yyyy;
    vec4 h  = 1. - abs(xx) - abs(yy);
    vec4 b0 = vec4(xx.xy, yy.xy);
    vec4 b1 = vec4(xx.zw, yy.zw);
    vec4 s0 = floor(b0)*2. + 1.;
    vec4 s1 = floor(b1)*2. + 1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
    m = m*m;
    return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  float fbm(vec3 p){
    float v = 0., a = .5;
    mat3 rot = mat3(.8,.6,0., -.6,.8,0., 0.,0.,1.);
    for(int i = 0; i < 6; i++){
      v += a * sn(p);
      p  = rot * p * 2.02 + vec3(1.9, 9.2, 3.4);
      a *= .48;
    }
    return v;
  }

  // Continuous mouse ripple (original v4 behaviour — unchanged)
  float ripple(vec2 uv, vec2 center, float time, float speed, float frequency) {
    float dist = length(uv - center);
    float wave = sin(dist * frequency - time * speed) * 0.5 + 0.5;
    float fadeDistance = 1.0 - smoothstep(0.0, 0.6, dist);
    float fadeTime = exp(-time * 0.8);
    return wave * fadeDistance * fadeTime;
  }

  // Expanding ring ripple — aspect-ratio corrected (circles, not ellipses)
  // No out-params: safe on all GLSL ES 1.00 drivers
  float ringRipple(vec2 uv, vec4 rp) {
    if (rp.z < 0.0) return 0.0;

    float aspect = res.x / res.y;
    // Scale X by aspect so distance is measured in screen-space, giving true circles
    vec2  diff = (uv - rp.xy) * vec2(aspect, 1.0);
    float dist = length(diff);

    float age  = rp.z;
    float fade = exp(-age * 1.5);
    if (fade < 0.005) return 0.0;

    // Ring front expands at 0.25 UV/s — natural water speed
    float ringFront = age * 0.25;

    // Gaussian bell at ring front; narrows over time (ring sharpens as it expands)
    float ringWidth = max(20.0 - age * 1.8, 4.0);
    float ring = exp(-pow((dist - ringFront) * ringWidth, 2.0));

    // Primary oscillation on the ring surface
    float wave = sin(dist * 30.0 - age * 8.0);

    // Secondary trailing ripples inside the ring
    float inner     = sin(dist * 16.0 - age * 4.5) * 0.28;
    float innerMask = smoothstep(ringFront + 0.025, ringFront * 0.08, dist);

    return (ring * wave + inner * innerMask) * fade * rp.w;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / res;
    uv.y = 1. - uv.y;

    // ── POOL RIPPLES ──────────────────────────────────────────────────────────
    // Compute each slot's scalar value once; reuse for colour AND distortion
    float rv0 = ringRipple(uv, r0);
    float rv1 = ringRipple(uv, r1);
    float rv2 = ringRipple(uv, r2);
    float rv3 = ringRipple(uv, r3);

    float poolRipple = clamp(rv0 + rv1 + rv2 + rv3, -1.0, 1.0);

    // Radial distortion per slot — step(0, z) zeroes out inactive slots safely
    // (no branching, no out-params, GLSL ES 1.00 compatible)
    vec2 dir0 = uv - r0.xy;  vec2 dir1 = uv - r1.xy;
    vec2 dir2 = uv - r2.xy;  vec2 dir3 = uv - r3.xy;
    vec2 poolDistort =
      (dir0 / max(length(dir0), 0.001)) * rv0 * step(0.0, r0.z) * 0.014 +
      (dir1 / max(length(dir1), 0.001)) * rv1 * step(0.0, r1.z) * 0.014 +
      (dir2 / max(length(dir2), 0.001)) * rv2 * step(0.0, r2.z) * 0.014 +
      (dir3 / max(length(dir3), 0.001)) * rv3 * step(0.0, r3.z) * 0.014;

    // ── MOUSE RIPPLE (continuous, original) ───────────────────────────────────
    vec2  mouseUV    = mouse;
    float rippleEffect = ripple(uv, mouseUV, mouseTime, 3.0, 25.0) * mouseActive;

    vec2  toMouse    = uv - mouseUV;
    float distToMouse = length(toMouse);
    float influence  = smoothstep(0.5, 0.0, distToMouse) * mouseActive * 0.08;
    vec2  distortedUV = uv + normalize(toMouse + 0.001)
                          * sin(distToMouse * 20.0 - mouseTime * 4.0) * influence;

    // ── FBM ───────────────────────────────────────────────────────────────────
    float spd = dark > .5 ? 0.18 : 0.12;
    float s   = t * spd;

    // Mouse distortion + pool ripple radial distortion applied to sample UV
    vec2 sampleUV = mix(uv, distortedUV, mouseActive * 0.5) + poolDistort;

    vec3 q = vec3(
      fbm(vec3(sampleUV*1.4, s)),
      fbm(vec3(sampleUV*1.4 + vec2(5.2, 1.3), s*.9)),
      fbm(vec3(sampleUV*1.4 + vec2(1.7, 9.2), s*.7))
    );
    q += vec3(rippleEffect * 0.15);
    q += vec3(poolRipple   * 0.10);  // pool ripples modulate fluid surface

    vec3 r = vec3(
      fbm(vec3(sampleUV + 3.8*q.xy + vec2(1.7, 9.2), s*.6)),
      fbm(vec3(sampleUV + 3.8*q.yz + vec2(8.3, 2.8), s*.5)),
      fbm(vec3(sampleUV + 3.8*q.zx + vec2(3.1, 6.4), s*.4))
    );
    float f = fbm(vec3(sampleUV + 4.2*r.xy, s));
    f = f*.5 + .5;
    f += rippleEffect * 0.1;

    // ── COLOUR ────────────────────────────────────────────────────────────────
    vec3 col = mix(ca, cb, clamp(f*1.3, 0., 1.));
    col = mix(col, cc, clamp(length(q)*.4, 0., 1.));
    col = mix(col, cd, clamp(r.x*.5+.5, 0., 1.)*.55);
    col = mix(col, ce, clamp(f*f*.8, 0., 1.)*.35);

    // Mouse glow (original)
    float mouseGlow = smoothstep(0.4, 0.0, distToMouse) * mouseActive * 0.15;
    vec3  glowColor = dark > .5 ? vec3(0.3, 0.5, 1.0) : vec3(0.4, 0.6, 1.0);
    col = mix(col, col + glowColor, mouseGlow);

    // Water surface: crests brighten (light focusing), troughs darken (shadow)
    float rippleCrest  = clamp( poolRipple, 0.0, 1.0);
    float rippleTrough = clamp(-poolRipple, 0.0, 1.0);
    vec3  crestColor   = dark > .5 ? vec3(0.38, 0.62, 1.0) : vec3(0.08, 0.22, 0.68);
    col += crestColor         * rippleCrest  * 0.24;
    col -= vec3(0.05, 0.07, 0.10) * rippleTrough * 0.14;

    // ── VIGNETTE & ALPHA ─────────────────────────────────────────────────────
    vec2  uvc = uv*2. - 1.;
    float vig = 1. - smoothstep(.4, 1.2, length(uvc));

    float base_alpha = dark > .5 ? 0.82 : 0.50;
    float alpha = base_alpha * (0.5 + 0.5*vig);
    alpha += mouseGlow    * 0.10;
    alpha += rippleCrest  * 0.07;
    alpha -= rippleTrough * 0.03;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }`

const PALETTES = {
  dark:  ["#1244a8", "#0a2e6e", "#0e8a6a", "#5b21c8", "#1e6aac"],
  light: ["#4a90e2", "#7ab8f5", "#3dd9a8", "#9b7be8", "#5ba8d9"],
}

function hexToVec3(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ]
}

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

const MAX_RIPPLES    = 4
const MAX_RIPPLE_AGE = 3.5

interface RippleSlot {
  x: number; y: number; startTime: number; amp: number; active: boolean
}

export function buildGradientGL(
  canvas: HTMLCanvasElement,
  getIsDark: () => boolean
): (() => void) | null {
  const glNullable = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false })
  if (!glNullable) return null
  const gl: WebGLRenderingContext = glNullable

  const prog = gl.createProgram()
  if (!prog) return null

  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return null

  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const vbuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, "pos")
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const U = {
    t:           gl.getUniformLocation(prog, "t"),
    res:         gl.getUniformLocation(prog, "res"),
    dark:        gl.getUniformLocation(prog, "dark"),
    ca:          gl.getUniformLocation(prog, "ca"),
    cb:          gl.getUniformLocation(prog, "cb"),
    cc:          gl.getUniformLocation(prog, "cc"),
    cd:          gl.getUniformLocation(prog, "cd"),
    ce:          gl.getUniformLocation(prog, "ce"),
    mouse:       gl.getUniformLocation(prog, "mouse"),
    mouseTime:   gl.getUniformLocation(prog, "mouseTime"),
    mouseActive: gl.getUniformLocation(prog, "mouseActive"),
    r0:          gl.getUniformLocation(prog, "r0"),
    r1:          gl.getUniformLocation(prog, "r1"),
    r2:          gl.getUniformLocation(prog, "r2"),
    r3:          gl.getUniformLocation(prog, "r3"),
  }
  const rippleUniforms = [U.r0, U.r1, U.r2, U.r3]

  // ── Mouse state ────────────────────────────────────────────────────────────
  let mouseX = 0.5, mouseY = 0.5, lastMoveTime = 0, mouseActive = 0
  const MOUSE_FADE = 3000

  function handleMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) / rect.width
    mouseY = (e.clientY - rect.top)  / rect.height
    lastMoveTime = performance.now()
    mouseActive  = 1
  }
  function handleMouseLeave() {
    lastMoveTime = performance.now() - MOUSE_FADE * 0.5
  }

  // ── Ripple pool ────────────────────────────────────────────────────────────
  const ripples: RippleSlot[] = Array.from({ length: MAX_RIPPLES }, () => ({
    x: 0.5, y: 0.5, startTime: 0, amp: 0, active: false,
  }))

  function addRipple(x: number, y: number, amp: number) {
    let slot = ripples.findIndex(r => !r.active)
    if (slot === -1) {
      let oldest = Infinity
      ripples.forEach((r, i) => { if (r.startTime < oldest) { oldest = r.startTime; slot = i } })
    }
    ripples[slot] = { x, y, startTime: performance.now(), amp, active: true }
  }

  function getCanvasUV(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top)  / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return null
    return { x, y }
  }

  function handleClick(e: MouseEvent) {
    const uv = getCanvasUV(e.clientX, e.clientY)
    if (uv) addRipple(uv.x, uv.y, 1.0)
  }

  function handleTouchStart(e: TouchEvent) {
    for (let i = 0; i < Math.min(e.changedTouches.length, 2); i++) {
      const touch = e.changedTouches[i]
      const uv = getCanvasUV(touch.clientX, touch.clientY)
      if (uv) addRipple(uv.x, uv.y, 1.0)
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────────
  canvas.addEventListener("mousemove", handleMouseMove)
  canvas.addEventListener("mouseleave", handleMouseLeave)
  const parent = canvas.parentElement
  if (parent) parent.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("click",      handleClick)
  document.addEventListener("touchstart", handleTouchStart, { passive: true })

  // ── Render loop ────────────────────────────────────────────────────────────
  let raf: number

  function render(ts: number) {
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W; canvas.height = H
    }
    gl.viewport(0, 0, W, H)

    const isDark = getIsDark()
    const pal = PALETTES[isDark ? "dark" : "light"]
    const bg  = isDark ? [0, 0, 0] : [0.973, 0.973, 0.973]
    gl.clearColor(bg[0], bg[1], bg[2], 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const timeSinceMove = ts - lastMoveTime
    mouseActive = Math.max(0, 1 - timeSinceMove / MOUSE_FADE)
    const mouseTime = Math.min(timeSinceMove * 0.001, 5.0)

    // Age ripples and upload uniforms
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const rp  = ripples[i]
      let   age = -1.0
      if (rp.active) {
        age = (ts - rp.startTime) * 0.001
        if (age > MAX_RIPPLE_AGE) { rp.active = false; age = -1.0 }
      }
      gl.uniform4f(rippleUniforms[i], rp.x, rp.y, age, rp.active ? rp.amp : 0.0)
    }

    gl.uniform1f(U.t,           ts * 0.001)
    gl.uniform2f(U.res,         W, H)
    gl.uniform1f(U.dark,        isDark ? 1.0 : 0.0)
    gl.uniform2f(U.mouse,       mouseX, mouseY)
    gl.uniform1f(U.mouseTime,   mouseTime)
    gl.uniform1f(U.mouseActive, mouseActive)
    gl.uniform3fv(U.ca, hexToVec3(pal[0]))
    gl.uniform3fv(U.cb, hexToVec3(pal[1]))
    gl.uniform3fv(U.cc, hexToVec3(pal[2]))
    gl.uniform3fv(U.cd, hexToVec3(pal[3]))
    gl.uniform3fv(U.ce, hexToVec3(pal[4]))
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(raf)
    canvas.removeEventListener("mousemove",  handleMouseMove)
    canvas.removeEventListener("mouseleave", handleMouseLeave)
    if (parent) parent.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("click",      handleClick)
    document.removeEventListener("touchstart", handleTouchStart)
  }
}
