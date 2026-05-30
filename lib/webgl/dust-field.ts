/**
 * DUST FIELD v2.0 — Multi-depth particle layers
 * [2] 3 depth layers: far / mid / near
 *     - Far  (800):  small, slow, faint, cool blue
 *     - Mid  (1200): current behavior (medium)
 *     - Near (800):  large, fast, bright, warm cyan + mouse parallax
 * Near-layer parallax makes close particles drift toward cursor,
 * creating genuine 3D depth perception.
 */

const VERTEX_SHADER = `
  precision mediump float;
  attribute vec2  a_pos;
  attribute float a_size;
  attribute float a_alpha;
  varying float   v_alpha;
  uniform vec2    u_res;
  void main() {
    vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
    clip.y = -clip.y;
    gl_Position  = vec4(clip, 0.0, 1.0);
    gl_PointSize = a_size;
    v_alpha      = a_alpha;
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float v_alpha;
  uniform vec3  u_color;
  void main() {
    vec2  cxy  = 2.0 * gl_PointCoord - 1.0;
    float r    = dot(cxy, cxy);
    float fade = 1.0 - smoothstep(0.5, 1.0, r);
    if (fade < 0.01) discard;
    gl_FragColor = vec4(u_color, v_alpha * fade);
  }
`

// [2] Three depth layers — ordered far→mid→near for correct alpha blending
const LAYERS = [
  // far:  small, slow, faint, slightly cooler blue
  { count: 800,  szMin: 0.7, szMax: 1.1, spdMult: 0.38,
    darkColor:  [0.28, 0.50, 0.95] as [number,number,number],
    lightColor: [0.10, 0.38, 0.82] as [number,number,number],
    alphaDark: 0.08, alphaLight: 0.11 },
  // mid:  original behavior
  { count: 1200, szMin: 1.2, szMax: 2.0, spdMult: 1.00,
    darkColor:  [0.42, 0.68, 1.00] as [number,number,number],
    lightColor: [0.16, 0.50, 0.90] as [number,number,number],
    alphaDark: 0.22, alphaLight: 0.30 },
  // near: large, fast, bright, warm cyan — parallax with mouse
  { count: 800,  szMin: 2.6, szMax: 4.2, spdMult: 1.45,
    darkColor:  [0.55, 0.82, 1.00] as [number,number,number],
    lightColor: [0.24, 0.64, 0.98] as [number,number,number],
    alphaDark: 0.24, alphaLight: 0.32 },
]

const PARTICLE_COUNT  = LAYERS.reduce((s, l) => s + l.count, 0) // 2800
const LAYER_OFFSETS   = [0, LAYERS[0].count, LAYERS[0].count + LAYERS[1].count]
const INTRO_DURATION  = 2000
const STRIDE          = 16 // 4 floats × 4 bytes

// Near-layer parallax strength in pixels at max mouse displacement
const PARALLAX_X = 6.0
const PARALLAX_Y = 4.0

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader
}

export function buildDustField(
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
  gl.useProgram(prog)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const N = PARTICLE_COUNT
  const px   = new Float32Array(N)
  const py   = new Float32Array(N)
  const tx   = new Float32Array(N)
  const ty   = new Float32Array(N)
  const sz   = new Float32Array(N)
  const ph   = new Float32Array(N)
  const spd  = new Float32Array(N)
  const buf4 = new Float32Array(N * 4)

  const vbo    = gl.createBuffer()
  const uRes   = gl.getUniformLocation(prog, "u_res")
  const uColor = gl.getUniformLocation(prog, "u_color")
  const aPos   = gl.getAttribLocation(prog, "a_pos")
  const aSize  = gl.getAttribLocation(prog, "a_size")
  const aAlpha = gl.getAttribLocation(prog, "a_alpha")

  // Fast PRNG
  let seed = 42
  function rng(): number {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  // Perlin-style 2D noise (unchanged)
  const PERM = new Uint8Array(512)
  for (let i = 0; i < 256; i++) PERM[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [PERM[i], PERM[j]] = [PERM[j], PERM[i]]
  }
  for (let i = 0; i < 256; i++) PERM[i + 256] = PERM[i]

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10) }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a) }
  function grad2(h: number, x: number, y: number) {
    const g = h & 3
    return (g < 2 ? (g === 0 ? x : -x) : 0) + (g < 2 ? 0 : g === 2 ? y : -y)
  }
  function noise2(x: number, y: number): number {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255
    const xf = x - Math.floor(x),   yf = y - Math.floor(y)
    const u = fade(xf), v = fade(yf)
    const aa = PERM[PERM[xi] + yi],     ab = PERM[PERM[xi] + yi + 1]
    const ba = PERM[PERM[xi+1] + yi],   bb = PERM[PERM[xi+1] + yi + 1]
    return lerp(
      lerp(grad2(aa, xf, yf),   grad2(ba, xf-1, yf),   u),
      lerp(grad2(ab, xf, yf-1), grad2(bb, xf-1, yf-1), u), v)
  }

  let W = 0, H = 0
  let globalAlpha = 0
  let introStart: number | null = null

  function initParticles(w: number, h: number) {
    W = w; H = h
    let pi = 0
    // Initialize particles in layer order: far (0-799), mid (800-1999), near (2000-2799)
    for (let li = 0; li < LAYERS.length; li++) {
      const L = LAYERS[li]
      for (let k = 0; k < L.count; k++, pi++) {
        const angle  = rng() * Math.PI * 2
        const radius = w * 0.6 + rng() * w * 0.5
        px[pi] = w * 0.5 + Math.cos(angle) * radius
        py[pi] = h * 0.5 + Math.sin(angle) * radius
        tx[pi] = rng() * w
        ty[pi] = rng() * h
        sz[pi] = L.szMin + rng() * (L.szMax - L.szMin)
        ph[pi] = rng() * 1000
        spd[pi] = (0.3 + rng() * 0.7) * L.spdMult
      }
    }
  }

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w; canvas.height = h
    gl.viewport(0, 0, w, h)
    initParticles(w, h)
    introStart = null
  }

  // [2] Mouse tracking for near-layer parallax
  let mouseNX = 0.5, mouseNY = 0.5
  let smoothMouseNX = 0.5, smoothMouseNY = 0.5

  function handleMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    mouseNX = (e.clientX - rect.left) / rect.width
    mouseNY = (e.clientY - rect.top)  / rect.height
  }
  document.addEventListener("mousemove", handleMouseMove)

  let raf: number

  function render(ts: number) {
    resize()
    if (!introStart) introStart = ts

    const elapsed = ts - introStart
    const introT  = Math.min(elapsed / INTRO_DURATION, 1.0)
    globalAlpha   = introT * introT * (3 - 2 * introT)

    const isDark = getIsDark()
    const t = ts * 0.001

    // Smooth mouse position for parallax (laggy = more natural depth feel)
    smoothMouseNX += (mouseNX - smoothMouseNX) * 0.07
    smoothMouseNY += (mouseNY - smoothMouseNY) * 0.07

    for (let i = 0; i < N; i++) {
      // Determine layer
      const li = i < LAYER_OFFSETS[1] ? 0 : i < LAYER_OFFSETS[2] ? 1 : 2
      const L  = LAYERS[li]

      if (introT < 1.0) {
        const ease = introT * introT * (3 - 2 * introT)
        px[i] = lerp(px[i] + (tx[i] - px[i]) * 0.04, tx[i], ease * 0.015)
        py[i] = lerp(py[i] + (ty[i] - py[i]) * 0.04, ty[i], ease * 0.015)
      }

      // Noise-driven drift
      const nt    = t * 0.18 * spd[i] + ph[i]
      const nx    = px[i] * 0.0035 + nt
      const ny    = py[i] * 0.0035 + nt * 0.7
      const angle = noise2(nx, ny) * Math.PI * 4
      tx[i] += Math.cos(angle) * 0.28 * spd[i]
      ty[i] += Math.sin(angle) * 0.28 * spd[i]

      // Soft boundary wrap
      if (tx[i] < -20) tx[i] += W + 40
      if (tx[i] > W+20) tx[i] -= W + 40
      if (ty[i] < -20) ty[i] += H + 40
      if (ty[i] > H+20) ty[i] -= H + 40

      if (introT >= 1.0) { px[i] = tx[i]; py[i] = ty[i] }

      const breathe = 0.7 + 0.3 * Math.sin(t * 0.8 * spd[i] + ph[i] * 0.1)
      const maxAlpha = isDark ? L.alphaDark : L.alphaLight
      const alpha = maxAlpha * globalAlpha * breathe

      // [2] Near-layer parallax offset
      const base = i * 4
      buf4[base]   = li === 2 ? px[i] + (smoothMouseNX - 0.5) * PARALLAX_X : px[i]
      buf4[base+1] = li === 2 ? py[i] + (smoothMouseNY - 0.5) * PARALLAX_Y : py[i]
      buf4[base+2] = sz[i]
      buf4[base+3] = alpha
    }

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, buf4, gl.DYNAMIC_DRAW)
    gl.uniform2f(uRes, W, H)

    gl.vertexAttribPointer(aPos,   2, gl.FLOAT, false, STRIDE, 0)
    gl.vertexAttribPointer(aSize,  1, gl.FLOAT, false, STRIDE, 8)
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, STRIDE, 12)
    gl.enableVertexAttribArray(aPos)
    gl.enableVertexAttribArray(aSize)
    gl.enableVertexAttribArray(aAlpha)

    // [2] One draw call per layer with its own color
    for (let li = 0; li < LAYERS.length; li++) {
      const c = isDark ? LAYERS[li].darkColor : LAYERS[li].lightColor
      gl.uniform3f(uColor, c[0], c[1], c[2])
      gl.drawArrays(gl.POINTS, LAYER_OFFSETS[li], LAYERS[li].count)
    }

    raf = requestAnimationFrame(render)
  }

  resize()
  raf = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(raf)
    document.removeEventListener("mousemove", handleMouseMove)
  }
}
