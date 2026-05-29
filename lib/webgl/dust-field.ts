/**
 * DUST FIELD — WebGL particle system for hero section
 * Inspirado en la técnica de stippling: partículas como campo
 * de puntos que orbitan usando Simplex noise como campo de fuerzas.
 *
 * Diseño:
 * - 2800 partículas de 1.5–2.5px
 * - Al entrar: convergen desde posiciones dispersas al campo final
 *   con easing exponencial (duración ~1.8s)
 * - Movimiento: cada partícula deriva por un campo de velocidad
 *   derivado de ruido 2D — movimiento orgánico, no caótico
 * - Opacidad: 0.22 dark / 0.30 light — visibles pero NO compiten
 *   con el texto (z-index menor que el contenido)
 * - Colores: mezcla dinámica accent blue + blanco, varía por partícula
 */

const VERTEX_SHADER = `
  precision mediump float;
  attribute vec2  a_pos;
  attribute float a_size;
  attribute float a_alpha;
  varying float   v_alpha;
  uniform vec2    u_res;
  void main() {
    // Convert from pixel space to clip space
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
    // Soft circular point
    vec2  cxy  = 2.0 * gl_PointCoord - 1.0;
    float r    = dot(cxy, cxy);
    float fade = 1.0 - smoothstep(0.5, 1.0, r);
    if (fade < 0.01) discard;
    gl_FragColor = vec4(u_color, v_alpha * fade);
  }
`

const PARTICLE_COUNT = 2800
const INTRO_DURATION = 2000 // ms
const STRIDE = 16 // 4 floats × 4 bytes

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
  const gl: WebGLRenderingContext = glNullable

  const prog = gl.createProgram()
  if (!prog) return null

  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return null

  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.useProgram(prog)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const N = PARTICLE_COUNT

  // Per-particle state (CPU)
  const px = new Float32Array(N) // current x
  const py = new Float32Array(N) // current y
  const tx = new Float32Array(N) // target x (drift position)
  const ty = new Float32Array(N) // target y (drift position)
  const sz = new Float32Array(N) // size
  const ph = new Float32Array(N) // noise phase offset
  const spd = new Float32Array(N) // individual speed multiplier

  // Interleaved buffer: [x, y, size, alpha] per particle
  const buf4 = new Float32Array(N * 4)

  // GPU buffer
  const vbo = gl.createBuffer()

  const uRes = gl.getUniformLocation(prog, "u_res")
  const uColor = gl.getUniformLocation(prog, "u_color")
  const aPos = gl.getAttribLocation(prog, "a_pos")
  const aSize = gl.getAttribLocation(prog, "a_size")
  const aAlpha = gl.getAttribLocation(prog, "a_alpha")

  // Fast pseudo-random
  let seed = 42
  function rng(): number {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  // 2D smooth noise (value noise, fast)
  const PERM = new Uint8Array(512)
  for (let i = 0; i < 256; i++) PERM[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[PERM[i], PERM[j]] = [PERM[j], PERM[i]]
  }
  for (let i = 0; i < 256; i++) PERM[i + 256] = PERM[i]

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  function grad2(h: number, x: number, y: number): number {
    const g = h & 3
    return (g < 2 ? (g === 0 ? x : -x) : 0) + (g < 2 ? 0 : g === 2 ? y : -y)
  }

  function noise2(x: number, y: number): number {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = fade(xf)
    const v = fade(yf)
    const aa = PERM[PERM[xi] + yi]
    const ab = PERM[PERM[xi] + yi + 1]
    const ba = PERM[PERM[xi + 1] + yi]
    const bb = PERM[PERM[xi + 1] + yi + 1]
    return lerp(
      lerp(grad2(aa, xf, yf), grad2(ba, xf - 1, yf), u),
      lerp(grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1), u),
      v
    )
  }

  let W = 0
  let H = 0
  let globalAlpha = 0 // 0 → 1 during intro convergence
  let introStart: number | null = null

  function initParticles(w: number, h: number) {
    W = w
    H = h
    for (let i = 0; i < N; i++) {
      // Scattered start positions (convergence source)
      const angle = rng() * Math.PI * 2
      const radius = w * 0.6 + rng() * w * 0.5
      px[i] = w * 0.5 + Math.cos(angle) * radius
      py[i] = h * 0.5 + Math.sin(angle) * radius

      // Target positions: distributed across viewport
      tx[i] = rng() * w
      ty[i] = rng() * h

      sz[i] = 1.2 + rng() * 1.4 // 1.2–2.6px
      ph[i] = rng() * 1000
      spd[i] = 0.3 + rng() * 0.7
    }
  }

  function resize() {
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
    initParticles(w, h)
    introStart = null // reset intro
  }

  let raf: number

  function render(ts: number) {
    resize()
    if (!introStart) introStart = ts

    const elapsed = ts - introStart
    // Smooth ease-out for alpha during intro
    const introT = Math.min(elapsed / INTRO_DURATION, 1.0)
    globalAlpha = introT * introT * (3 - 2 * introT) // smoothstep

    const isDark = getIsDark()
    const maxAlpha = isDark ? 0.22 : 0.3
    const t = ts * 0.001

    // Update particles
    for (let i = 0; i < N; i++) {
      if (introT < 1.0) {
        // CONVERGENCE PHASE: lerp from scattered to target position
        const ease = introT * introT * (3 - 2 * introT)
        px[i] = lerp(px[i] + (tx[i] - px[i]) * 0.04, tx[i], ease * 0.015)
        py[i] = lerp(py[i] + (ty[i] - py[i]) * 0.04, ty[i], ease * 0.015)
      }

      // DRIFT PHASE: noise-driven organic movement (always active)
      const nt = t * 0.18 * spd[i] + ph[i]
      const nx = px[i] * 0.0035 + nt
      const ny = py[i] * 0.0035 + nt * 0.7
      const angle = noise2(nx, ny) * Math.PI * 4
      const speed = 0.28 * spd[i]

      tx[i] += Math.cos(angle) * speed
      ty[i] += Math.sin(angle) * speed

      // Soft boundary wrap
      if (tx[i] < -20) tx[i] += W + 40
      if (tx[i] > W + 20) tx[i] -= W + 40
      if (ty[i] < -20) ty[i] += H + 40
      if (ty[i] > H + 20) ty[i] -= H + 40

      if (introT >= 1.0) {
        // Direct tracking once converged
        px[i] = tx[i]
        py[i] = ty[i]
      }

      // Subtle alpha variation per particle (breathing)
      const breathe = 0.7 + 0.3 * Math.sin(t * 0.8 * spd[i] + ph[i] * 0.1)
      const alpha = maxAlpha * globalAlpha * breathe

      const base = i * 4
      buf4[base] = px[i]
      buf4[base + 1] = py[i]
      buf4[base + 2] = sz[i]
      buf4[base + 3] = alpha
    }

    // Upload & draw
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, buf4, gl.DYNAMIC_DRAW)

    // Color: accent blue tinted toward white
    if (isDark) {
      gl.uniform3f(uColor, 0.42, 0.68, 1.0) // soft blue-white
    } else {
      gl.uniform3f(uColor, 0.16, 0.5, 0.9) // stronger blue for light bg
    }
    gl.uniform2f(uRes, W, H)

    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0)
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, STRIDE, 8)
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, STRIDE, 12)
    gl.enableVertexAttribArray(aPos)
    gl.enableVertexAttribArray(aSize)
    gl.enableVertexAttribArray(aAlpha)

    gl.drawArrays(gl.POINTS, 0, N)

    raf = requestAnimationFrame(render)
  }

  resize()
  raf = requestAnimationFrame(render)
  return () => cancelAnimationFrame(raf)
}
