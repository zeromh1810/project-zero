/**
 * HERO TERRAIN — topographic contour map
 * Style reference: Adobe Stock #290385877 (black-on-white / white-on-black
 * contour map, isometric close-up, thin technical grid). Raw WebGL2, no
 * Three.js — this is a single displaced plane read as elevation isolines,
 * so a hand-rolled shader is lighter than pulling in a full 3D engine for
 * one background.
 */

// 400×400 grid — dense enough for smooth nested contour rings
const GRID = 400

// Must match the vertex shader's BASE_PITCH/BASE_YAW constants below — used
// to invert the camera transform when mapping a click from screen space to
// plane UV. BASE_YAW gives the rest state (no mouse movement) a fixed
// diagonal/corner view instead of a symmetric front-on tilt — that's what
// reads as "isometric" rather than just "tilted down".
const BASE_PITCH = 0.7853982 // 45°
const BASE_YAW   = 0.6108652 // 35°

// ─────────────────────────────────────────────────────────────────────────────
// screenToLayerUV
// Approximate inverse of the vertex shader's camera transform, so a click
// in screen space can be converted to that layer's plane UV (for the click
// ripple). Ignores the tiny height contribution to the Y projection (wy is
// scaled by 0.09 and further reduced by the pitch rotation) — imperceptible
// for a decorative ripple, and it keeps the inverse a plain closed-form
// rotation instead of an iterative solve.
// ─────────────────────────────────────────────────────────────────────────────
function screenToLayerUV(
  ndcX: number,
  ndcY: number,
  mx: number,
  my: number,
  s: { yawAmt: number; pitchAmt: number; planeScale: number; planeShiftY: number }
): [number, number] {
  const yaw = BASE_YAW + mx * s.yawAmt
  const cosYaw = Math.cos(yaw)
  const sinYaw = Math.sin(yaw)
  const pitch = BASE_PITCH + my * s.pitchAmt
  const cosPitch = Math.cos(pitch)
  const sinPitch = Math.sin(pitch)
  const k = cosPitch * 3.60 + sinPitch * 0.9

  const x1 = ndcX / (2.28 * s.planeScale)
  const z1 = (s.planeShiftY - ndcY) / (k * s.planeScale)

  const wx = cosYaw * x1 - sinYaw * z1
  const wz = sinYaw * x1 + cosYaw * z1

  return [wx + 0.5, wz + 0.5]
}

// ─────────────────────────────────────────────────────────────────────────────
// VERTEX SHADER
// The plane is sized to fill NDC ±1 on both axes (with a small overscan
// margin) regardless of the mouse-driven tilt, so the mesh always covers
// the full width and height of its container — no unfilled corners.
// Height comes from layered sine waves — a cheap stand-in for Perlin noise
// that still produces organic, nested contour shapes once sliced into
// isolines in the fragment shader.
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`#version 300 es
precision highp float;

in vec2  a_uv;
out float vHeight;
out vec2  vUV;
out float vDepth;

uniform float uTime;
uniform float uPX;
uniform float uPY;
uniform float uZoom;
uniform vec2  uNoiseOffset;
uniform float uYawAmt;
uniform float uPitchAmt;
uniform float uPlaneScale;
uniform float uPlaneShiftY;

float terrain(float u, float v, float t) {
  float h = 0.0;
  h += 1.00 * sin(u * 3.1  + v * 2.3  + t * 0.35);
  h += 0.55 * sin(v * 4.8  - u * 2.1  + 1.7 + t * 0.25);
  h += 0.35 * sin((u * 1.6 + v * 3.4) * 1.4 + 3.1 + t * 0.18);
  h += 0.22 * sin(u * 6.4  - v * 1.2  + t * 0.30);
  h += 0.15 * sin(u * 9.0  + v * 7.0  - t * 0.20);
  return h;
}

void main() {
  float u = a_uv.x - 0.5;
  float v = a_uv.y;

  // Sample the wave field over a wider span than the mesh footprint —
  // like pulling the camera back/up — so more hills/valleys (and their
  // contour rings) fit inside the same full-bleed frame. uNoiseOffset lets
  // a second draw sample a different patch of the same field, so the two
  // layers show genuinely different contour shapes, not just a recolor.
  float h = terrain(u * uZoom + uNoiseOffset.x, v * uZoom + uNoiseOffset.y, uTime);

  vHeight = h;
  vUV     = a_uv;
  vDepth  = v;

  float wx = u;                 // -0.5 .. 0.5
  float wy = h * 0.09;
  float wz = v - 0.5;           // -0.5 .. 0.5

  // Real two-axis orbit camera, driven by mouse X (yaw) and mouse Y (pitch).
  // Rotating in 3D (rather than just skewing the projection) keeps genuine
  // X/Y camera movement while the extra overscan margin below absorbs the
  // small bounding-box growth from the tilt, so no edge is ever revealed.
  // BASE_YAW gives the rest state a fixed diagonal/corner view (not a
  // symmetric front-on tilt) — that reads as genuinely isometric even
  // before the mouse moves.
  const float BASE_YAW = 0.6108652; // 35°
  float yaw  = BASE_YAW + uPX * uYawAmt;
  float cosY = cos(yaw);
  float sinY = sin(yaw);
  float x1 =  wx * cosY + wz * sinY;
  float z1 = -wx * sinY + wz * cosY;

  // 45° base isometric tilt (not a flat 90° top-down map), plus a modest
  // mouse-driven swing on top of it. uYawAmt/uPitchAmt differ per layer
  // (set in JS, see PALETTES) — the foreground swings noticeably more than
  // the background with the same mouse input, which on top of the
  // planeScale-based dampening (scale applies AFTER rotation, so it also
  // shrinks the rotation's screen-space swing) makes the depth separation
  // read much more clearly than a single shared swing amount would.
  const float BASE_PITCH = 0.7853982; // 45°
  float pitch = BASE_PITCH + uPY * uPitchAmt;
  float cosX  = cos(pitch);
  float sinX  = sin(pitch);
  float y2 = wy * cosX - z1 * sinX;
  float z2 = wy * sinX + z1 * cosX;

  // Full-bleed rectangle. The Y scale is larger than X to compensate for
  // the 45° tilt foreshortening the depth axis (cos 45° ≈ 0.71), so the
  // mesh still covers the full height with no exposed edge.
  float ndcX =  x1 * 2.28;
  float ndcY = -z2 * 3.60 + y2 * 0.9;

  // uPlaneScale/uPlaneShiftY push the background layer's plane smaller and
  // toward the horizon (top of frame), like a real receded surface behind
  // the foreground — a static depth cue, on top of the differential mouse
  // parallax above, so the effect reads even in a still frame.
  ndcX *= uPlaneScale;
  ndcY  = ndcY * uPlaneScale + uPlaneShiftY;

  gl_Position = vec4(ndcX, ndcY, 0.5, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// FRAGMENT SHADER
// Isolines only (minor/major contour bands) — no grid. Kept deliberately
// low-alpha: this sits behind the hero copy and CTAs, so it should read as
// an ambient texture, not a graphic competing for attention.
// ─────────────────────────────────────────────────────────────────────────────
const FRAG = /* glsl */`#version 300 es
precision highp float;

uniform float uSpacing;
uniform float uLineWidth;
uniform vec3  uLineMinor;
uniform vec3  uLineMajor;
uniform float uFogStart;
uniform float uFogStrength;
uniform float uAlphaMin;
uniform float uAlphaMax;

// Click ripple — a radial shockwave injected into the height field so the
// contour isolines visibly wobble/shift outward from the click point, like
// a stone dropped on the contour map. uRippleAge < 0.0 means "no active
// ripple" (cheap early-out). uRippleAmp lets each depth layer react with a
// different strength (closer layers ripple more, matching the parallax
// philosophy already used for mouse motion).
uniform vec2  uRippleUV;
uniform float uRippleAge;
uniform float uRippleAmp;

in  float vHeight;
in  vec2  vUV;
in  float vDepth;
out vec4  fragColor;

float iso(float h, float sp) {
  float s  = h / sp;
  float f  = fract(s);
  float fw = fwidth(s) * uLineWidth;
  return 1.0 - smoothstep(fw * 0.3, fw * 2.0, min(f, 1.0 - f));
}

// A single expanding ring (like one water-drop pulse), not a sustained
// oscillating wave: ringRadius grows linearly with age so the disturbance
// travels outward once, and timeFalloff kills it quickly — the lines get a
// brief nudge and then settle back to their normal speed/order, instead of
// visibly "keeping the wave going" for the whole ripple lifetime.
float ripple(vec2 uv, vec2 center, float age) {
  if (age < 0.0 || age > 0.9) return 0.0;
  float d          = length(uv - center);
  float ringRadius = age * 0.9;
  float ringWidth  = 0.10;
  float pulse      = exp(-pow((d - ringRadius) / ringWidth, 2.0));
  float timeFalloff = exp(-age * 3.0);
  return pulse * timeFalloff;
}

void main() {
  float h     = vHeight + ripple(vUV, uRippleUV, uRippleAge) * uRippleAmp;
  float minor = iso(h, uSpacing);
  float major = iso(h, uSpacing * 4.0);
  float presence = clamp(max(minor * 0.65, major), 0.0, 1.0);
  if (presence < 0.006) discard;

  float fog = 1.0 - smoothstep(uFogStart, 1.0, vDepth) * uFogStrength;

  vec3  col   = mix(uLineMinor, uLineMajor, major);
  float alpha = mix(uAlphaMin, uAlphaMax, major) * fog;

  fragColor = vec4(col, clamp(alpha * presence, 0.0, 1.0));
}
`

// ─────────────────────────────────────────────────────────────────────────────
// Palettes — colors pulled straight from the site's own design tokens
// (styles/portfolio.css): --txt is the page's own text color (major/index
// contours), --txt3 is its tertiary/secondary text color (minor contours).
// Reusing the text hierarchy keeps the map's contrast consistent with the
// rest of the page in both themes instead of inventing new grays.
//
// Each theme draws a single layer of the shader: `primary`. A second
// (`far`) layer was tried for parallax depth, but since it sampled a
// different patch of the same noise field, its contour lines ran at
// unrelated angles to primary's — once both were similarly visible (after
// switching to MAX blending, see below) it read as a crosshatched mesh
// instead of one coherent terrain, so it was removed.
// ─────────────────────────────────────────────────────────────────────────────
interface LayerStyle {
  lineMinor:    [number, number, number]
  lineMajor:    [number, number, number]
  spacing:      number
  lineWidth:    number
  fogStart:     number
  fogStrength:  number
  alphaMin:     number
  alphaMax:     number
  zoom:         number
  noiseOffset:  [number, number]
  yawAmt:       number
  pitchAmt:     number
  planeScale:   number
  planeShiftY:  number
  rippleAmp:    number
}

interface Palette {
  primary: LayerStyle
}

function hex3(h: string): [number, number, number] {
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ]
}

const PALETTES: { dark: Palette; light: Palette } = {
  dark: {
    primary: {
      lineMinor:   hex3('#8e8e93'),   // --txt3 (dark) — secondary contours
      lineMajor:   hex3('#f5f5f7'),   // --txt (dark) — bright index contours
      spacing:     0.140,
      lineWidth:   1.0,
      fogStart:    0.55,
      fogStrength: 0.85,
      alphaMin:    0.13,
      alphaMax:    0.36,
      zoom:        2.6,
      noiseOffset: [0, 0],
      yawAmt:      0.44,
      pitchAmt:    0.24,
      planeScale:  1.0,
      planeShiftY: 0.0,
      rippleAmp:   0.14,
    },
  },
  light: {
    primary: {
      lineMinor:   hex3('#5e5e64'),   // --txt3 (light) — secondary contours
      lineMajor:   hex3('#1d1d1f'),   // --txt (light) — ink on paper
      spacing:     0.140,
      lineWidth:   1.0,
      fogStart:    0.55,
      fogStrength: 0.72,
      alphaMin:    0.07,
      alphaMax:    0.22,
      zoom:        2.6,
      noiseOffset: [0, 0],
      yawAmt:      0.44,
      pitchAmt:    0.24,
      planeScale:  1.0,
      planeShiftY: 0.0,
      rippleAmp:   0.14,
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("[HeroTerrain] Shader compile error:", gl.getShaderInfoLog(s))
    return null
  }
  return s
}

function buildGeometry(gl: WebGL2RenderingContext, n: number) {
  // UV grid: (n+1)×(n+1) vertices, n×n quads → 6 indices per quad
  const verts = new Float32Array((n + 1) * (n + 1) * 2)
  let vi = 0
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      verts[vi++] = i / n
      verts[vi++] = j / n
    }
  }

  // Uint32Array required: (n+1)² > 65535 for n=400
  const idxs = new Uint32Array(n * n * 6)
  const row = n + 1
  let ii = 0
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const v0 = j * row + i
      const v1 = v0 + 1
      const v2 = v0 + row
      const v3 = v2 + 1
      idxs[ii++] = v0; idxs[ii++] = v1; idxs[ii++] = v2
      idxs[ii++] = v1; idxs[ii++] = v3; idxs[ii++] = v2
    }
  }

  const vbo = gl.createBuffer()!
  const ibo = gl.createBuffer()!
  const vao = gl.createVertexArray()!

  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxs, gl.STATIC_DRAW)

  return { vbo, ibo, vao, count: idxs.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildHeroTerrain
// Creates a WebGL2 canvas inside `container` and starts the render loop.
// Returns a cleanup function.
// ─────────────────────────────────────────────────────────────────────────────
export function buildHeroTerrain(
  container: HTMLElement,
  getIsDark: () => boolean
): () => void {
  const canvas = document.createElement("canvas")
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;"
  container.appendChild(canvas)

  const glOrNull = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
  })

  if (!glOrNull) {
    console.warn("[HeroTerrain] WebGL2 not available")
    container.removeChild(canvas)
    return () => {}
  }

  // Narrowed to non-null so closures below see WebGL2RenderingContext
  const gl: WebGL2RenderingContext = glOrNull

  // Compile shaders
  const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) {
    container.removeChild(canvas)
    return () => {}
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("[HeroTerrain] Link error:", gl.getProgramInfoLog(prog))
    container.removeChild(canvas)
    return () => {}
  }
  gl.useProgram(prog)

  // Geometry
  const { vbo, ibo, vao, count } = buildGeometry(gl, GRID)

  // Bind vertex attribute
  const aUV = gl.getAttribLocation(prog, "a_uv")
  gl.enableVertexAttribArray(aUV)
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0)

  gl.bindVertexArray(null)

  // Blend — MAX instead of standard alpha-over: where the primary and far
  // layers' independent contour lines cross, the result is capped to the
  // stronger of the two instead of compounding into a darker/thicker blob.
  gl.enable(gl.BLEND)
  gl.blendEquation(gl.MAX)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.disable(gl.DEPTH_TEST)

  // Uniform locations
  const U = {
    uTime:        gl.getUniformLocation(prog, "uTime"),
    uPX:          gl.getUniformLocation(prog, "uPX"),
    uPY:          gl.getUniformLocation(prog, "uPY"),
    uZoom:        gl.getUniformLocation(prog, "uZoom"),
    uNoiseOffset: gl.getUniformLocation(prog, "uNoiseOffset"),
    uYawAmt:      gl.getUniformLocation(prog, "uYawAmt"),
    uPitchAmt:    gl.getUniformLocation(prog, "uPitchAmt"),
    uSpacing:     gl.getUniformLocation(prog, "uSpacing"),
    uLineWidth:   gl.getUniformLocation(prog, "uLineWidth"),
    uLineMinor:   gl.getUniformLocation(prog, "uLineMinor"),
    uLineMajor:   gl.getUniformLocation(prog, "uLineMajor"),
    uFogStart:    gl.getUniformLocation(prog, "uFogStart"),
    uFogStrength: gl.getUniformLocation(prog, "uFogStrength"),
    uAlphaMin:    gl.getUniformLocation(prog, "uAlphaMin"),
    uAlphaMax:    gl.getUniformLocation(prog, "uAlphaMax"),
    uPlaneScale:  gl.getUniformLocation(prog, "uPlaneScale"),
    uPlaneShiftY: gl.getUniformLocation(prog, "uPlaneShiftY"),
    uRippleUV:    gl.getUniformLocation(prog, "uRippleUV"),
    uRippleAge:   gl.getUniformLocation(prog, "uRippleAge"),
    uRippleAmp:   gl.getUniformLocation(prog, "uRippleAmp"),
  }

  function applyLayer(s: LayerStyle, rippleUV: [number, number], rippleAge: number) {
    gl.uniform3fv(U.uLineMinor,   s.lineMinor)
    gl.uniform3fv(U.uLineMajor,   s.lineMajor)
    gl.uniform1f (U.uSpacing,     s.spacing)
    gl.uniform1f (U.uLineWidth,   s.lineWidth)
    gl.uniform1f (U.uFogStart,    s.fogStart)
    gl.uniform1f (U.uFogStrength, s.fogStrength)
    gl.uniform1f (U.uAlphaMin,    s.alphaMin)
    gl.uniform1f (U.uAlphaMax,    s.alphaMax)
    gl.uniform1f (U.uZoom,        s.zoom)
    gl.uniform2fv(U.uNoiseOffset, s.noiseOffset)
    gl.uniform1f (U.uYawAmt,      s.yawAmt)
    gl.uniform1f (U.uPitchAmt,    s.pitchAmt)
    gl.uniform1f (U.uPlaneScale,  s.planeScale)
    gl.uniform1f (U.uPlaneShiftY, s.planeShiftY)
    gl.uniform2fv(U.uRippleUV,    rippleUV)
    gl.uniform1f (U.uRippleAge,   rippleAge)
    gl.uniform1f (U.uRippleAmp,   s.rippleAmp)
  }

  let lastIsDark = getIsDark()
  let palette = lastIsDark ? PALETTES.dark : PALETTES.light

  // Mouse / touch parallax
  const m = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMouse = (e: MouseEvent) => {
    m.tx =  (e.clientX / window.innerWidth  - 0.5) * 2
    m.ty = -(e.clientY / window.innerHeight - 0.5) * 2
  }
  const onTouch = (e: TouchEvent) => {
    const tc = e.touches[0]
    m.tx =  (tc.clientX / window.innerWidth  - 0.5) * 2
    m.ty = -(tc.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener("mousemove", onMouse, { passive: true })
  window.addEventListener("touchmove", onTouch, { passive: true })

  // Click ripple — one active ripple at a time (a new click replaces the
  // previous one, which has already mostly faded within its ~0.9s window).
  // rippleT0 < 0 means no active ripple. UV is precomputed per layer at
  // click time from the current (smoothed) mouse rotation, since each
  // layer's planeScale/planeShiftY maps the same screen point differently.
  let rippleT0 = -1
  let rippleUVPrimary: [number, number] = [0, 0]

  const onClick = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) return

    const ndcX =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const ndcY = -((e.clientY - rect.top)  / rect.height - 0.5) * 2

    rippleUVPrimary = screenToLayerUV(ndcX, ndcY, m.x, m.y, palette.primary)
    rippleT0 = (performance.now() - t0) / 1000
  }
  window.addEventListener("click", onClick, { passive: true })

  // Resize
  function resize() {
    const w = container.clientWidth  || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    if (canvas.width === w && canvas.height === h) return
    canvas.width  = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // Render loop
  const t0 = performance.now()
  let raf: number

  function tick() {
    raf = requestAnimationFrame(tick)

    const isDark = getIsDark()
    if (isDark !== lastIsDark) {
      palette = isDark ? PALETTES.dark : PALETTES.light
      lastIsDark = isDark
    }

    const elapsed = (performance.now() - t0) / 1000
    m.x += (m.tx - m.x) * 0.07
    m.y += (m.ty - m.y) * 0.07

    gl.uniform1f(U.uTime, elapsed * 0.10)
    gl.uniform1f(U.uPX,   m.x)
    gl.uniform1f(U.uPY,   m.y)

    // Ripple age since last click, in real seconds — independent of the
    // slow *0.10 terrain time scale so the ripple always plays at the same
    // speed. -1 (sentinel) once it's fully faded, so the shader can early-out.
    const rippleAge = rippleT0 < 0 ? -1 : elapsed - rippleT0
    if (rippleAge > 0.9) rippleT0 = -1

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindVertexArray(vao)
    applyLayer(palette.primary, rippleUVPrimary, rippleAge)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0)
    gl.bindVertexArray(null)
  }

  tick()

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener("mousemove", onMouse)
    window.removeEventListener("touchmove", onTouch)
    window.removeEventListener("click", onClick)
    ro.disconnect()
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
    gl.deleteBuffer(ibo)
    gl.deleteProgram(prog)
    if (container.contains(canvas)) container.removeChild(canvas)
  }
}
