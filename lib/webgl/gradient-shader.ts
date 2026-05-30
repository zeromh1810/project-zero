/**
 * WEBGL GRADIENT v5.0
 * Base: v4.1 (FBM domain warping + click/touch ripple pool)
 * v5.0 adds:
 *   [3] Aurora chromatic flow bands — teal + violet, slow drift
 *   [1] Velocity-responsive directional ripple deformation
 *   [4] Idle breathing pulse + Lissajous luminous nodes
 *   [5] Position-sampled ripple tint + variable amplitude
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
  uniform vec4  r0, r1, r2, r3;
  uniform vec2  rV0, rV1, rV2, rV3;
  uniform vec3  rTint0, rTint1, rTint2, rTint3;
  uniform float idleGlow;
  uniform vec2  node0, node1;

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

  // [3] Aurora chromatic bands
  float aurora(vec2 uv, float time) {
    float b1y = 0.33 + sin(uv.x * 2.8 + time * 0.07) * 0.09
                     + sin(uv.x * 1.3 + time * 0.04) * 0.04;
    float band1 = exp(-pow((uv.y - b1y) * 12.0, 2.0));
    float b2y = 0.67 - sin(uv.x * 2.1 + time * 0.055) * 0.08
                     - sin(uv.x * 1.0 - time * 0.030) * 0.04;
    float band2 = exp(-pow((uv.y - b2y) * 14.0, 2.0));
    float sh1 = sin(uv.x * 14.0 + time * 0.36) * 0.35 + 0.65;
    float sh2 = sin(uv.x *  9.0 - time * 0.24) * 0.30 + 0.70;
    return band1 * sh1 * 0.82 + band2 * sh2 * 0.60;
  }

  // Continuous mouse ripple (unchanged)
  float ripple(vec2 uv, vec2 center, float time, float speed, float frequency) {
    float dist = length(uv - center);
    float wave = sin(dist * frequency - time * speed) * 0.5 + 0.5;
    float fadeDistance = 1.0 - smoothstep(0.0, 0.6, dist);
    float fadeTime = exp(-time * 0.8);
    return wave * fadeDistance * fadeTime;
  }

  // [1] Ring ripple with velocity-driven elliptical stretch
  float ringRipple(vec2 uv, vec4 rp, vec2 stretch) {
    if (rp.z < 0.0) return 0.0;
    float aspect = res.x / res.y;
    vec2  diff   = (uv - rp.xy) * vec2(aspect, 1.0);

    // Stretch decays with age so ring becomes circular over ~1.5s
    float stretchFade = exp(-rp.z * 2.0);
    float strMag = length(stretch) * stretchFade;
    if (strMag > 0.01) {
      vec2  sDir    = stretch / length(stretch);
      float proj    = dot(diff, sDir);
      float compress = clamp(strMag * 0.55, 0.0, 0.45);
      diff -= sDir * proj * compress;
    }

    float dist = length(diff);
    float age  = rp.z;
    float fade = exp(-age * 1.5);
    if (fade < 0.005) return 0.0;
    float ringFront = age * 0.25;
    float ringWidth = max(20.0 - age * 1.8, 4.0);
    float ring = exp(-pow((dist - ringFront) * ringWidth, 2.0));
    float wave = sin(dist * 30.0 - age * 8.0);
    float inner     = sin(dist * 16.0 - age * 4.5) * 0.28;
    float innerMask = smoothstep(ringFront + 0.025, ringFront * 0.08, dist);
    return (ring * wave + inner * innerMask) * fade * rp.w;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / res;
    uv.y = 1. - uv.y;

    // Pool ripples
    float rv0 = ringRipple(uv, r0, rV0);
    float rv1 = ringRipple(uv, r1, rV1);
    float rv2 = ringRipple(uv, r2, rV2);
    float rv3 = ringRipple(uv, r3, rV3);
    float poolRipple = clamp(rv0 + rv1 + rv2 + rv3, -1.0, 1.0);

    vec2 dir0 = uv - r0.xy; vec2 dir1 = uv - r1.xy;
    vec2 dir2 = uv - r2.xy; vec2 dir3 = uv - r3.xy;
    vec2 poolDistort =
      (dir0 / max(length(dir0), 0.001)) * rv0 * step(0.0, r0.z) * 0.014 +
      (dir1 / max(length(dir1), 0.001)) * rv1 * step(0.0, r1.z) * 0.014 +
      (dir2 / max(length(dir2), 0.001)) * rv2 * step(0.0, r2.z) * 0.014 +
      (dir3 / max(length(dir3), 0.001)) * rv3 * step(0.0, r3.z) * 0.014;

    // Mouse ripple
    vec2  mouseUV     = mouse;
    float rippleEffect = ripple(uv, mouseUV, mouseTime, 3.0, 25.0) * mouseActive;
    vec2  toMouse     = uv - mouseUV;
    float distToMouse = length(toMouse);
    float influence   = smoothstep(0.5, 0.0, distToMouse) * mouseActive * 0.08;
    vec2  distortedUV = uv + normalize(toMouse + 0.001)
                          * sin(distToMouse * 20.0 - mouseTime * 4.0) * influence;

    // FBM
    float spd = dark > .5 ? 0.18 : 0.12;
    float s   = t * spd;
    vec2 sampleUV = mix(uv, distortedUV, mouseActive * 0.5) + poolDistort;

    vec3 q = vec3(
      fbm(vec3(sampleUV*1.4, s)),
      fbm(vec3(sampleUV*1.4 + vec2(5.2, 1.3), s*.9)),
      fbm(vec3(sampleUV*1.4 + vec2(1.7, 9.2), s*.7))
    );
    q += vec3(rippleEffect * 0.15);
    q += vec3(poolRipple   * 0.10);

    vec3 r = vec3(
      fbm(vec3(sampleUV + 3.8*q.xy + vec2(1.7, 9.2), s*.6)),
      fbm(vec3(sampleUV + 3.8*q.yz + vec2(8.3, 2.8), s*.5)),
      fbm(vec3(sampleUV + 3.8*q.zx + vec2(3.1, 6.4), s*.4))
    );
    float f = fbm(vec3(sampleUV + 4.2*r.xy, s));
    f = f*.5 + .5;
    f += rippleEffect * 0.1;

    // Base colour mix
    vec3 col = mix(ca, cb, clamp(f*1.3, 0., 1.));
    col = mix(col, cc, clamp(length(q)*.4, 0., 1.));
    col = mix(col, cd, clamp(r.x*.5+.5, 0., 1.)*.55);
    col = mix(col, ce, clamp(f*f*.8, 0., 1.)*.35);

    // [3] Aurora chromatic bands
    float aurVal   = aurora(uv, t);
    vec3  aurColorA = dark > .5 ? vec3(0.12, 0.92, 0.68) : vec3(0.22, 0.80, 0.92);
    vec3  aurColorB = dark > .5 ? vec3(0.58, 0.18, 0.96) : vec3(0.48, 0.20, 0.82);
    vec3  aurColor  = mix(aurColorA, aurColorB, smoothstep(0.35, 0.65, uv.y));
    col += aurColor * aurVal * (dark > .5 ? 0.13 : 0.055);

    // Mouse glow
    float mouseGlow = smoothstep(0.4, 0.0, distToMouse) * mouseActive * 0.15;
    vec3  glowColor = dark > .5 ? vec3(0.3, 0.5, 1.0) : vec3(0.4, 0.6, 1.0);
    col = mix(col, col + glowColor, mouseGlow);

    // [5] Ripple crests with positional color tint
    float rippleCrest  = clamp( poolRipple, 0.0, 1.0);
    float rippleTrough = clamp(-poolRipple, 0.0, 1.0);
    float totalW    = abs(rv0) + abs(rv1) + abs(rv2) + abs(rv3) + 0.001;
    vec3  tintBlend = (rTint0*abs(rv0) + rTint1*abs(rv1)
                     + rTint2*abs(rv2) + rTint3*abs(rv3)) / totalW;
    vec3  baseCrest = dark > .5 ? vec3(0.38, 0.62, 1.0) : vec3(0.08, 0.22, 0.68);
    col += mix(baseCrest, tintBlend, 0.45) * rippleCrest  * 0.26;
    col -= vec3(0.05, 0.07, 0.10)          * rippleTrough * 0.14;

    // [4] Idle breathing + luminous nodes
    col *= (1.0 + sin(t * 1.22) * 0.055 * idleGlow);
    float aspec = res.x / res.y;
    float dN0   = length((uv - node0) * vec2(aspec, 1.0));
    float dN1   = length((uv - node1) * vec2(aspec, 1.0));
    float ng0   = smoothstep(0.22, 0.0, dN0) * idleGlow * 0.22;
    float ng1   = smoothstep(0.18, 0.0, dN1) * idleGlow * 0.17;
    col += ce * ng0 + cc * ng1 * 0.70;

    // Vignette & alpha
    vec2  uvc = uv*2. - 1.;
    float vig = 1. - smoothstep(.4, 1.2, length(uvc));
    float base_alpha = dark > .5 ? 0.82 : 0.50;
    float alpha = base_alpha * (0.5 + 0.5*vig);
    alpha += mouseGlow    * 0.10;
    alpha += rippleCrest  * 0.07;
    alpha -= rippleTrough * 0.03;
    alpha += aurVal       * (dark > .5 ? 0.04 : 0.02);
    alpha += ng0 * 0.07   + ng1 * 0.05;

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

// [5] Map click UV position to one of the 5 palette colors
function sampleTint(x: number, y: number, isDark: boolean): [number, number, number] {
  const pal = PALETTES[isDark ? "dark" : "light"]
  const nx  = Math.min(Math.floor(x * 2.5), 2)
  const ny  = Math.min(Math.floor(y * 2),   1)
  return hexToVec3(pal[(nx + ny * 3) % 5])
}

const MAX_RIPPLES    = 4
const MAX_RIPPLE_AGE = 3.5

interface RippleSlot {
  x: number; y: number; startTime: number; amp: number; active: boolean
  vx: number; vy: number                      // velocity stretch for [1]
  tint: [number, number, number]              // color tint for [5]
}

export function buildGradientGL(
  canvas: HTMLCanvasElement,
  getIsDark: () => boolean
): (() => void) | null {
  const glNullable = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false })
  if (!glNullable) return null
  const gl = glNullable

  const prog = gl.createProgram()
  if (!prog) return null
  const vs = createShader(gl, gl.VERTEX_SHADER,   VERTEX_SHADER)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return null
  gl.attachShader(prog, vs); gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const vbuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
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
    r0: gl.getUniformLocation(prog, "r0"), r1: gl.getUniformLocation(prog, "r1"),
    r2: gl.getUniformLocation(prog, "r2"), r3: gl.getUniformLocation(prog, "r3"),
    rV0: gl.getUniformLocation(prog, "rV0"), rV1: gl.getUniformLocation(prog, "rV1"),
    rV2: gl.getUniformLocation(prog, "rV2"), rV3: gl.getUniformLocation(prog, "rV3"),
    rTint0: gl.getUniformLocation(prog, "rTint0"), rTint1: gl.getUniformLocation(prog, "rTint1"),
    rTint2: gl.getUniformLocation(prog, "rTint2"), rTint3: gl.getUniformLocation(prog, "rTint3"),
    idleGlow: gl.getUniformLocation(prog, "idleGlow"),
    node0:    gl.getUniformLocation(prog, "node0"),
    node1:    gl.getUniformLocation(prog, "node1"),
  }
  const rippleUniforms     = [U.r0,     U.r1,     U.r2,     U.r3    ]
  const rippleVelUniforms  = [U.rV0,    U.rV1,    U.rV2,    U.rV3   ]
  const rippleTintUniforms = [U.rTint0, U.rTint1, U.rTint2, U.rTint3]

  // Mouse state
  let mouseX = 0.5, mouseY = 0.5
  let prevMouseX = 0.5, prevMouseY = 0.5, prevMoveTime = 0
  let velX = 0, velY = 0
  let lastMoveTime = 0, mouseActive = 0
  let lastInteractionTime = 0
  const MOUSE_FADE = 3000

  // [4] Idle glow
  let idleGlowSmoothed = 0

  function handleMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top)  / rect.height
    const now = performance.now()
    const dt  = Math.max((now - prevMoveTime) * 0.001, 0.002)
    // [1] Smooth velocity — scale so a full-screen swipe in 0.3s ≈ velMag 0.4
    const rawVX = (nx - prevMouseX) / dt * 0.08
    const rawVY = (ny - prevMouseY) / dt * 0.08
    velX = velX * 0.6 + rawVX * 0.4
    velY = velY * 0.6 + rawVY * 0.4
    const spd = Math.hypot(velX, velY)
    if (spd > 0.6) { velX *= 0.6/spd; velY *= 0.6/spd }

    prevMouseX = mouseX; prevMouseY = mouseY; prevMoveTime = now
    mouseX = nx; mouseY = ny
    lastMoveTime = now
    lastInteractionTime = now
    mouseActive = 1
  }

  function handleMouseLeave() {
    lastMoveTime = performance.now() - MOUSE_FADE * 0.5
    velX = 0; velY = 0
  }

  // Ripple pool
  const ripples: RippleSlot[] = Array.from({ length: MAX_RIPPLES }, () => ({
    x: 0.5, y: 0.5, startTime: 0, amp: 0, active: false,
    vx: 0, vy: 0, tint: [0.5, 0.5, 1.0] as [number, number, number],
  }))

  function findSlot(): number {
    const free = ripples.findIndex(r => !r.active)
    if (free !== -1) return free
    let oldest = Infinity, slot = 0
    ripples.forEach((r, i) => { if (r.startTime < oldest) { oldest = r.startTime; slot = i } })
    return slot
  }

  function addRipple(x: number, y: number, amp: number) {
    const isDark = getIsDark()
    const slot = findSlot()
    ripples[slot] = {
      x, y, startTime: performance.now(), amp, active: true,
      vx: velX, vy: velY,
      tint: sampleTint(x, y, isDark),
    }
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
    if (!uv) return
    // [5] Variable amplitude based on velocity + randomness
    const speed = Math.hypot(velX, velY)
    addRipple(uv.x, uv.y, Math.min(0.65 + speed * 1.2 + Math.random() * 0.35, 1.8))
    lastInteractionTime = performance.now()
  }

  function handleTouchStart(e: TouchEvent) {
    for (let i = 0; i < Math.min(e.changedTouches.length, 2); i++) {
      const touch = e.changedTouches[i]
      const uv = getCanvasUV(touch.clientX, touch.clientY)
      if (uv) addRipple(uv.x, uv.y, 0.75 + Math.random() * 0.55)
    }
    lastInteractionTime = performance.now()
  }

  canvas.addEventListener("mousemove",  handleMouseMove)
  canvas.addEventListener("mouseleave", handleMouseLeave)
  const parent = canvas.parentElement
  if (parent) parent.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("click",      handleClick)
  document.addEventListener("touchstart", handleTouchStart, { passive: true })

  let raf: number

  function render(ts: number) {
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H }
    gl.viewport(0, 0, W, H)

    const isDark = getIsDark()
    const pal = PALETTES[isDark ? "dark" : "light"]
    const bg  = isDark ? [0, 0, 0] : [0.973, 0.973, 0.973]
    gl.clearColor(bg[0], bg[1], bg[2], 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const timeSinceMove = ts - lastMoveTime
    mouseActive = Math.max(0, 1 - timeSinceMove / MOUSE_FADE)
    const mouseTime = Math.min(timeSinceMove * 0.001, 5.0)

    // [4] Idle glow — ramp up 3s after last interaction, ramp down on interaction
    const IDLE_DELAY = 3000
    const IDLE_RAMP  = 2000
    const timeSinceInteraction = ts - lastInteractionTime
    const idleTarget = timeSinceInteraction > IDLE_DELAY
      ? Math.min((timeSinceInteraction - IDLE_DELAY) / IDLE_RAMP, 1.0)
      : 0.0
    idleGlowSmoothed += (idleTarget - idleGlowSmoothed) * 0.025

    // [4] Lissajous node positions
    const lt = ts * 0.001
    const n0x = 0.5 + Math.sin(lt * 0.29) * 0.24
    const n0y = 0.40 + Math.sin(lt * 0.17) * 0.20
    const n1x = 0.5 + Math.sin(lt * 0.23 + 1.5) * 0.28
    const n1y = 0.60 + Math.sin(lt * 0.13 + 0.8) * 0.15

    // Upload ripple uniforms
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const rp  = ripples[i]
      let   age = -1.0
      if (rp.active) {
        age = (ts - rp.startTime) * 0.001
        if (age > MAX_RIPPLE_AGE) { rp.active = false; age = -1.0 }
      }
      gl.uniform4f(rippleUniforms[i],    rp.x, rp.y, age, rp.active ? rp.amp : 0.0)
      gl.uniform2f(rippleVelUniforms[i], rp.active ? rp.vx : 0, rp.active ? rp.vy : 0)
      gl.uniform3fv(rippleTintUniforms[i], rp.active ? rp.tint : [0.38, 0.62, 1.0])
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
    gl.uniform1f(U.idleGlow, idleGlowSmoothed)
    gl.uniform2f(U.node0,    n0x, n0y)
    gl.uniform2f(U.node1,    n1x, n1y)

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
