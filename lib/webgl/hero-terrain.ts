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
  float yaw  = uPX * uYawAmt;
  float cosY = cos(yaw);
  float sinY = sin(yaw);
  float x1 =  wx * cosY + wz * sinY;
  float z1 = -wx * sinY + wz * cosY;

  // 45° base isometric tilt (not a flat 90° top-down map), plus a modest
  // mouse-driven swing on top of it. uYawAmt/uPitchAmt are lower for the
  // background layer, so it swings less than the foreground when the mouse
  // moves — that differential is what reads as depth/parallax.
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

void main() {
  float h     = vHeight;
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
// Each theme draws two layers of the same shader: `primary` (foreground,
// current opacity) and `depth` (background, lighter/fainter, a different
// patch of the noise field). Both use the same yawAmt/pitchAmt — one
// camera rotating a single scene — so the mouse-driven motion is coherent
// between them. The depth cue instead comes from `depth` being drawn at a
// smaller planeScale and shifted toward the horizon (planeShiftY), which
// also means it naturally moves fewer screen pixels than the foreground for
// the same rotation, like a plane genuinely sitting further away.
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
}

interface Palette {
  primary: LayerStyle
  depth:   LayerStyle
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
      alphaMin:    0.20,
      alphaMax:    0.58,
      zoom:        1.7,
      noiseOffset: [0, 0],
      yawAmt:      0.30,
      pitchAmt:    0.16,
      planeScale:  1.0,
      planeShiftY: 0.0,
    },
    depth: {
      lineMinor:   hex3('#8e8e93'),   // --txt3 (dark), much fainter here
      lineMajor:   hex3('#8e8e93'),   // no bright index contour on this layer
      spacing:     0.170,
      lineWidth:   1.0,
      fogStart:    0.30,
      fogStrength: 0.90,
      alphaMin:    0.07,
      alphaMax:    0.20,
      zoom:        1.05,
      noiseOffset: [0.6, 0.4],
      yawAmt:      0.30,
      pitchAmt:    0.16,
      planeScale:  0.80,
      planeShiftY: 0.34,
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
      alphaMin:    0.12,
      alphaMax:    0.38,
      zoom:        1.7,
      noiseOffset: [0, 0],
      yawAmt:      0.30,
      pitchAmt:    0.16,
      planeScale:  1.0,
      planeShiftY: 0.0,
    },
    depth: {
      lineMinor:   hex3('#5e5e64'),   // --txt3 (light), much fainter here
      lineMajor:   hex3('#5e5e64'),   // no dark ink contour on this layer
      spacing:     0.170,
      lineWidth:   1.0,
      fogStart:    0.30,
      fogStrength: 0.78,
      alphaMin:    0.06,
      alphaMax:    0.17,
      zoom:        1.05,
      noiseOffset: [0.6, 0.4],
      yawAmt:      0.30,
      pitchAmt:    0.16,
      planeScale:  0.80,
      planeShiftY: 0.34,
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

  // Blend
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
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
  }

  function applyLayer(s: LayerStyle) {
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
    m.x += (m.tx - m.x) * 0.04
    m.y += (m.ty - m.y) * 0.04

    gl.uniform1f(U.uTime, elapsed * 0.10)
    gl.uniform1f(U.uPX,   m.x)
    gl.uniform1f(U.uPY,   m.y)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Depth layer first (fainter, dampened parallax), primary on top —
    // the differential response to uPX/uPY is what reads as depth.
    gl.bindVertexArray(vao)
    applyLayer(palette.depth)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0)
    applyLayer(palette.primary)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0)
    gl.bindVertexArray(null)
  }

  tick()

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener("mousemove", onMouse)
    window.removeEventListener("touchmove", onTouch)
    ro.disconnect()
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
    gl.deleteBuffer(ibo)
    gl.deleteProgram(prog)
    if (container.contains(canvas)) container.removeChild(canvas)
  }
}
