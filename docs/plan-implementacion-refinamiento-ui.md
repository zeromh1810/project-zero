# Plan de implementación — Refinamiento UI del sitio público

Rama base: `refinamiento-ui` · Insumo: `docs/auditoria-ui-sitio-publico.md` · DS actual: v1.9.0 → objetivo **v2.0.0**
Alcance: sitio público (`/`, `/projects/[id]`, `/blog`, `/blog/[slug]`). `/admin` queda fuera, pero **no se puede romper** porque consume los mismos tokens.

---

## 1. Dirección de rediseño

**Concepto: "Precisión en movimiento".** Se mantiene la identidad que ya funciona: terreno WebGL como hilo conductor, escala dark con tinte navy, display Plus Jakarta Sans 800 y el retrato 3D. El salto de calidad viene de tres cosas:

1. **Un solo sistema.** Todo lo que se ve sale de `design-tokens.json`: tipografía, color, espacio, radio y motion.
2. **Motion con jerarquía.** Un momento protagonista por vista y el resto es feedback breve. Se acaban las animaciones perpetuas apiladas.
3. **Narrativa de portafolio con cierre.** La secuencia es Hero → Trabajo → Prueba social → Pensamiento (blog) → CTA final, en lugar de terminar en un footer.

**Base de la skill ui-ux-pro-max:**

| Decisión | Fuente de la skill | Cómo se adapta |
|---|---|---|
| Estilo **Motion-Driven** (controlado) | `--domain style`: *motion-driven*, "Best for: Portfolio sites"; a11y *risk:conditional* → exige reduced-motion, foco y 4.5:1 | Se adopta, pero con el límite de *Excessive Motion* (1–2 animaciones clave por vista) de `--domain ux` |
| Patrón **Portfolio Grid + Storytelling** | `--domain landing`: *portfolio-grid*; `--design-system`: *Scroll-Triggered Storytelling* con *Climax CTA* | Bento como grilla de trabajo y una banda CTA final |
| Motion: **Scroll Reveal sutil** (300–400ms, y 8–16px) y **Stagger** | `--domain gsap`: *Scroll Reveal / Subtle*, *Stagger List* | Se implementa en CSS e IntersectionObserver, sin GSAP (el sitio ya lo quitó por peso) |
| **Magnético** solo en 1–2 focos por pantalla, con fuerza ×0.3 | `--domain gsap`: *Hover Micro-interaction / Complex* | Con el patrón `--mx`/`--my` ya documentado en el proyecto |
| Imagen LCP con prioridad y fuentes vía next/font | `--stack nextjs` | `fetchPriority="high"` y pilas de fuentes con `var(--font-*)` |
| ~~Brutalism, Archivo + Space Grotesk~~ | `--design-system` | **Descartado:** contradice la identidad y no resuelve ningún hallazgo medido |

**Principios de diseño (sirven de criterio de aceptación en cada PR):**
- **P1 · Token o nada.** Ningún valor literal nuevo en CSS de componentes: color, tamaño, radio, duración y curva salen de un token.
- **P2 · Piso legible.** Ningún texto bajo 12px y todo texto ≥ 4.5:1 (≥ 3:1 si es grande), en claro y en oscuro.
- **P3 · Un protagonista.** Máximo una animación de entrada protagonista y una perpetua por viewport.
- **P4 · Feedback inmediato.** Todo control tiene estados hover / focus-visible / active / disabled (y loading si aplica) definidos con tokens.
- **P5 · Solo compositor.** Solo se animan `transform` y `opacity`. Nada de `width`, `height`, `left` o `filter` por frame.

---

## 2. Estrategia técnica: conectar el DS al sitio sin romper el admin

Problema raíz (UI-11): `assets/design-tokens.css` existe con 3 capas, pero `portfolio.css` mantiene su propio `:root` paralelo y no consume ningún token generado.

**Estrategia de puente (sin big-bang):**

1. **Tokens nuevos solo aditivos** en `design-tokens.json`. No se renombra ni se borra nada que use `admin.css`.
2. **El `:root` de `portfolio.css` pasa a ser una capa de alias:** `--bg: var(--semantic-color-bg)`, `--txt: var(--semantic-color-txt)`, etc. Los 380 `var(--bg|--txt|…)` existentes siguen funcionando sin tocarlos, y el valor real pasa a venir del JSON.
3. **Migración de literales por sección**, un PR por bloque. Cada uno se valida comparando capturas antes y después.
4. **Regeneración:** `node .claude/skills/design-system/scripts/generate-tokens.cjs --config assets/design-tokens.json -o assets/design-tokens.css`, y luego `validate-tokens.cjs --dir components` como check de cada PR.
5. **Al final:** se borra el `:root` duplicado de `portfolio.css` y quedan solo los alias necesarios.

**Herramientas de verificación** (se crean en la Fase 0, en `scripts/qa/`):
- `contrast-audit.js`: el script de contraste usado en la auditoría, pegable en consola o vía Chrome MCP. Reporta todo texto < 4.5:1 o < 12px.
- `fit-check.js`: mide `getBoundingClientRect` del hero, el CTA y el scroll-hint contra `innerHeight`, siguiendo la lección registrada en memoria (no confiar en el screenshot escalado).
- Capturas baseline por viewport (375, 768, 1024, 1440, 1920, 2560) × tema (claro/oscuro) × página.

---

## 3. Fases

Estimación en sesiones de trabajo (~2–3 h efectivas). Cada fase termina en un commit o PR sobre `refinamiento-ui` con criterios de aceptación verificables.

### Fase 0 — Preparación y decisiones · 0,5 sesión
- [ ] Commit de la auditoría y de este plan.
- [ ] Reiniciar el dev server (el actual tiene el worker caído) y capturar el baseline de §2.
- [ ] Crear `scripts/qa/contrast-audit.js` y `scripts/qa/fit-check.js`.
- [ ] **Gate de decisiones** (ver §5). Sin ellas no se puede cerrar la Fase 5.

**Criterio de aceptación:** existen las capturas baseline y el reporte de contraste del estado actual guardado como referencia.

---

### Fase 1 — Fundaciones de tokens (DS v2.0.0) · 2 sesiones
Resuelve: A-5, T-1, T-3, T-4, UI-11, UI-12, UI-13, M-1, M-2, M-3

**1.1 Tipografía, nueva escala fluida en `primitive.fontSize`** (los nombres viejos `xs…3xl` se conservan para el admin):

| Token | Valor | Uso |
|---|---|---|
| `fs-micro` | `12px` | eyebrow, meta, fechas, stat-label |
| `fs-small` | `clamp(13px, 0.2vw + 12.5px, 14px)` | chips, botones sm, nav |
| `fs-body` | `16px` | texto, inputs, botones |
| `fs-lead` | `clamp(17px, 0.4vw + 15.5px, 20px)` | subtítulos, hero-sub, bio |
| `fs-h4` | `clamp(18px, 0.5vw + 16px, 22px)` | card title compact |
| `fs-h3` | `clamp(22px, 1vw + 18px, 28px)` | card title featured, tagline de contacto |
| `fs-h2` | `clamp(32px, 2.6vw + 20px, 56px)` | `.s-title` |
| `fs-h1` | `clamp(36px, 3vw + 24px, 64px)` | título de detalle y de post |
| `fs-display` | `clamp(40px, 5.2vw + 16px, 96px)` | hero |

- **Pesos semánticos:** `fw-regular 400`, `fw-medium 500`, `fw-bold 700`, `fw-display 800`. El 600 se elimina del sitio público.
- **Tracking por rol:** `ls-display: -0.04em` (con `-0.025em` bajo 600px mediante un token de componente), `ls-heading: -0.025em`, `ls-eyebrow: 0.08em`.
- **Medida:** `measure-prose: 62ch`, `measure-lead: 46ch`.
- **Fuentes:** `font-sans: var(--font-dm-sans), system-ui, sans-serif` y `font-display: var(--font-plus-jakarta), system-ui, sans-serif` (T-5). La mono se carga con `next/font` (Geist Mono) o se quita del público (T-6).

**1.2 Motion, nueva capa semántica** (reutiliza los primitivos `duration`/`easing` existentes y agrega los que faltan):

| Token semántico | Valor | Rol |
|---|---|---|
| `motion-press` | 100ms · `ease-out` | `:active`, toggles |
| `motion-hover` | 160ms · `ease-out` | hover, color, borde |
| `motion-exit` | 160ms · `ease-in` (nuevo, `cubic-bezier(.7,0,.84,0)`) | salidas, cierre de modal |
| `motion-enter` | 240ms · `ease-spring` | crossfade de sección, modal |
| `motion-reveal` | 480ms · `ease-spring`, distancia `12px` | anim-up, cards |
| `motion-hero` | 700ms · `ease-spring` | entrada única del hero |
| `motion-stagger-step` / `-max` | 60ms / 360ms | stagger por lote |
| `motion-spring` | `cubic-bezier(.34,1.56,.64,1)` | solo píldora y badges |

**1.3 Color y estados:**
- `semantic.color.on-accent`: en dark se resuelve con la decisión D4 (ver §5).
- `semantic.color.txt-muted` para labels de formulario, reemplazando `rgba(0,0,0,.38)`.
- `semantic.color.success-text`: `#1a7f37` en claro y `#30d158` en oscuro. El punto sigue usando `--success`.
- `focus.ring`: `2px solid var(--accent)`, `focus.offset`: `3px`.
- `shadow-accent` y `shadow-focus` derivados con `color-mix(in oklab, var(--accent) 35%, transparent)` (UI-12).

**1.4 Layout:**
- `container: 1320px`, `container-wide: 1600px` (≥1920px), `gutter: clamp(16px, 4vw, 48px)`.
- `section-gap: clamp(80px, 10vw, 160px)`.

**1.5 Puente y limpieza:**
- [ ] El `:root` y el `.dark` de `portfolio.css` pasan a alias de los tokens semánticos (§2.2).
- [ ] `globals.css`: quitar Geist y revisar si la paleta shadcn la usa el admin. Si no la usa, se elimina; si sí, se aísla.
- [ ] Changelog v2.0.0 en el JSON.

**Criterios de aceptación:** se regenera sin errores; el diff visual contra el baseline es 0 salvo el piso de 12px; el admin abre sin regresión visual (capturas de sus 5 tabs).

---

### Fase 2 — Foco, contraste y semántica · 1 sesión
Resuelve: MI-2, MI-3, MI-4, MI-6, MI-7, MI-8, MI-9, MI-10, M-4, M-13

- [ ] `:focus-visible` global con `focus.ring`. Se elimina el `outline-ring/50` heredado de Tailwind en el ámbito público.
- [ ] `blog-preview-card` pasa a `<Link>` con card enfocable y conserva el hover actual.
- [ ] `nav-logo` en el navbar del portafolio pasa a `<button>` con label.
- [ ] `ProjectCard` pasa a `<a href="/projects/[id]">` que intercepta el click para el morph (se conservan middle-click y "abrir en pestaña nueva").
- [ ] Labels del form → `txt-muted`; badge "Disponible" → `success-text`; copyright del footer en dark ≥ 4.5:1; botón primario en dark según D4.
- [ ] **Hovers en touch:** envolver todos los `:hover` de componentes interactivos en `@media (hover: hover)`. Hoy hay 1 regla; se agrupan por sección.

**Criterio de aceptación:** `contrast-audit.js` devuelve 0 fallas en las 6 vistas × 2 temas, y recorrer con Tab cada vista muestra foco visible en cada parada.

---

### Fase 3 — Sistema de motion · 1,5 sesiones
Resuelve: A-1, A-2, A-3, A-4, A-6, A-7, A-8, MI-1, M-6, M-7, M-11, M-12, M-17

| Tarea | Archivo | Detalle |
|---|---|---|
| Stagger por lote | `hooks/use-intersection.ts` | Acumular las entradas de cada callback del observer y aplicar `delay = min(n·step, max)` con n = posición dentro del lote. Se elimina la fórmula cuadrática por índice global. |
| Reveal del título por línea | `split-text.tsx` | Nuevo modo `split="line"` (default en el hero): cada línea con máscara `overflow:hidden` + `translateY(100%)→0`, `motion-hero`, 90ms entre líneas. Total ≈ 880ms. El modo char se mantiene solo para textos de ≤ 8 caracteres. |
| Scroll del hero | `hero-section.tsx` | Se elimina el `filter: blur()` por frame en `.hero-left` y el retrato. Queda `opacity` + `translateY` + `scale` con **2 curvas** (contenido y retrato). **El terreno 3D no se toca:** su blur y fade al hacer scroll quedan exactamente como están. Se mantienen `releaseEntranceAnimation` y el timer de activación (están documentados por bugs reales). |
| Animaciones perpetuas | CSS | Gradiente del título: un solo barrido al terminar la entrada (`animation-iteration-count: 1`). Float del retrato: se conserva y queda como única animación perpetua junto al WebGL. |
| Morph FLIP | `project-card.tsx` | El clon arranca con el tamaño final previsto y aplica la transformación inversa; se anima solo `transform` + `border-radius`, con `motion-reveal`. `targetTop` se calcula en vez de usar 460 fijo. |
| Píldora del nav | `app-navbar.tsx` | `translateX` + `scaleX` sobre un ancho base, con `motion-spring`. |
| Tilt de cards | `project-card.tsx` | Solo con `matchMedia('(hover:hover) and (pointer:fine)')` y sin reduced-motion. Intensidad de 4°, sin `scale(1.015)`, y una sola sombra `--shadow-xl` en vez de doble `drop-shadow`. |
| Magnético | `hero-section.tsx` + CSS | Restaurar (si D3 = sí): `pointermove` → `style.setProperty('--mx'/'--my')` con fuerza ×0.3 y clamp ±8px; `.btn-magnetic` compone `translate(var(--mx),var(--my)) scale(...)`. Solo en los CTA del hero y del cierre. |
| Reduced motion | global | Una sola sección `@media (prefers-reduced-motion: reduce)` al final del CSS que consolida los 7 bloques actuales, más chequeos en JS para tilt, magnético y morph. |

#### 3.B Animaciones y micro-interacciones nuevas

Todas siguen P3 (un protagonista por vista) y P5 (solo `transform`/`opacity`), tienen versión reduced-motion y solo se activan con hover bajo `(hover:hover) and (pointer:fine)`.

| # | Elemento | Animación / micro-interacción | Tokens |
|---|---|---|---|
| N-1 | Título del hero | Reveal por línea con máscara: cada línea sube desde `translateY(100%)` dentro de su propia caja `overflow:hidden`. La línea de acento termina con **un** barrido del gradiente. | `motion-hero`, 90ms entre líneas |
| N-2 | Tagline + CTAs del hero | Entran en cascada tras el título (fade + 12px), sin esperar al fin de cada letra. | `motion-reveal`, step 60ms |
| N-3 | Botones con flecha (`→`) | La flecha SVG se desplaza 3px a la derecha al hover y vuelve con spring; al presionar, el botón baja a `scale(.96)`. | `motion-hover`, `motion-press` |
| N-4 | Botón primario | Barrido de brillo (`btn-shine`): un highlight diagonal cruza el botón una sola vez por hover. | `motion-reveal` |
| N-5 | CTAs del hero y del cierre | Pull magnético (D3) con retorno elástico. | `motion-reveal`, `ease-spring` |
| N-6 | Cards de proyecto | Hover en capas: zoom del thumbnail 1.04, el overlay se oscurece 8%, "Ver caso →" sube 6px y aparece, la flecha se desplaza. El tilt queda en 4°. | `motion-hover` / `motion-reveal` |
| N-7 | Stat badge de las cards | Cuenta ascendente del número (ej. 0→20 mil) al entrar al viewport, una sola vez, con números tabulares para que no salte el ancho. | 700ms, `ease-out` |
| N-8 | Stats de "Sobre mí" | Misma cuenta ascendente (5+, 40+, 18). | 700ms |
| N-9 | Links de texto (footer, blog, contacto) | Subrayado que crece desde la izquierda (`scaleX 0→1`, `transform-origin:left`) y sale hacia la derecha. | `motion-hover` / `motion-exit` |
| N-10 | Theme toggle | El ícono sol/luna rota 90° y hace crossfade. El cambio de tema usa **View Transition** con revelado circular desde el botón (fallback: cambio directo). El canvas 3D no se modifica: la transición solo captura la pantalla. | `motion-enter` |
| N-11 | Píldora del navbar | Desliza con spring (`translateX`/`scaleX`) y se mueve sola con el scroll-spy. | `motion-spring` |
| N-12 | Copiar email (contacto y CTA de cierre) | El ícono copiar se transforma en check con trazo dibujado (`stroke-dashoffset`), más tooltip "Copiado" con `aria-live`. | 400ms |
| N-13 | Formulario | El label flotante sube con tracking; el campo enfocado muestra un anillo suave de acento; un error hace un shake corto (2 ciclos de 4px, desactivado con reduced-motion) y el mensaje aparece deslizándose; en el envío exitoso el ícono check se dibuja dentro del botón. | `motion-hover`, 320ms |
| N-14 | Cards del blog | Elevación de 4px + zoom de imagen 1.04 + flecha de "Leer entrada" que se desplaza. | `motion-hover` |
| N-15 | Modal de perfil | Entrada con scale .96→1 + fade, salida más rápida; el overlay hace fade aparte. | `motion-enter` / `motion-exit` |
| N-16 | CTA de cierre | Glow radial de acento que sigue al puntero dentro de la banda (vía `--gx`/`--gy`, sin re-render). | rAF |
| N-17 | Carga de datos | Skeleton con shimmer para las cards de proyecto y blog mientras resuelve el fetch. | 1.4s, `linear` |
| N-18 | Bottom nav (mobile) | El ícono activo hace un pop `scale(1.12→1)` al seleccionarse e indicador superior que se desliza. | `motion-spring` |

**Criterios de aceptación:** el título del hero queda legible antes de 1s; ningún elemento con reveal espera más de 400ms desde que entra al viewport; Performance panel sin "Paint" > 4ms por frame durante el scroll del hero (2560px); con reduced-motion activo todo aparece en su estado final sin movimiento.

---

### Fase 4 — Rediseño por sección · 3 sesiones
Resuelve: UI-1…UI-10, T-2, T-7, M-5, M-8, M-9, M-10, M-15, M-16, M-19, M-20

**4.1 Hero**
- **Copy:** título (sin cambios, editable en el admin) + **tagline** de 12–18 palabras en `fs-lead` y `measure-lead` (D1). La bio actual pasa a "Sobre mí".
- **Desktop:** se mantiene la composición actual. Hero y bento comparten el borde izquierdo con `container-wide`.
- **Mobile (< 900px):** el orden pasa a título → tagline → CTAs → retrato a ~52vh con el `mask-image` de fundido, sin parallax ni float. El retrato **vuelve a verse**.
- **CTAs:** primario "Ver proyectos" (scroll a la grilla) + secundario "Trabajemos juntos". La memoria del proyecto registra que esta jerarquía ya se validó en v3: la acción principal de un portafolio es ver el trabajo.
- **Imagen:** `fetchPriority="high"`, sin `lazy`, con `width` y `height` explícitos para evitar CLS.
- Verificar con `fit-check.js` en 1440×900, 1920×1080 y 2560×1440.

**4.2 Navbar**
- Scroll-spy: un IntersectionObserver sobre `.projects-sheet` mueve la píldora entre Home y Trabajos (UI-4).
- Labels a `fs-small` y `fw-medium`. "Perfil" con estados completos.

**4.3 Proyectos (bento)**
- Header de sección con eyebrow `fs-micro` + título `fs-h2` (el `view()` actual se mantiene).
- **Card:** categoría `fs-micro` (12px), título `fs-h3`/`fs-h4`, descripción `fs-small` limitada a 2 líneas. El número `01–04` pasa a ser un marcador editorial en `fs-micro` tabular. El stat badge se separa del número para evitar el choque visual que se ve en mobile.
- **Estado sin thumbnail** (UI-10): gradiente del proyecto + isotipo Z en marca de agua + categoría en `fs-h2`.
- **Hover:** zoom del thumbnail a 1.04 + tilt sutil + revelado de "Ver caso →" (en touch se muestra siempre).

**4.4 Marcas**
- Se mantiene. Eyebrow a 12px y logos con `opacity .55 → 1` y escala de grises al hover, solo bajo `(hover:hover)`.

**4.5 Blog preview**
- Cards como `<Link>`, categoría y fecha a 12px y título `fs-h4`. El extracto pasa de truncado manual a `line-clamp: 3`.

**4.6 CTA de cierre (nuevo, `components/portfolio/sections/closing-cta.tsx`)**
- Banda de ancho completo antes del footer: eyebrow "Hablemos", título display "¿Tienes un proyecto en mente?", botón primario magnético hacia Contacto, email con botón "Copiar" (feedback de check durante 1.6s con `aria-live`) y "Respondo en menos de 24 h".
- Fondo: el mismo terreno como textura estática (un frame exportado) o un glow radial `--accent` al 12%. **No** se usa un segundo canvas WebGL.

**4.7 Footer**
- El glifo `✦` se reemplaza por el isotipo SVG (M-16). Se agregan links de navegación secundarios y el copyright queda ≥ 4.5:1.

**4.8 Sobre mí**
- Recibe la bio que sale del hero. Stats con número en `fs-h2` tabular y label en `fs-micro`.
- Fallback de foto con el isotipo Z en vez de la "A" (UI-8).
- Botones con `gap` en token (hoy usan `style={{gap:12}}` inline).

**4.9 Contacto**
- Validación por campo al perder el foco y al enviar, con mensaje bajo el campo (`aria-describedby`) y foco al primer inválido (MI-5).
- El éxito se anuncia con `aria-live="polite"` y el error persiste hasta el próximo intento (MI-15).
- Labels `txt-muted` y badge con `success-text`.
- Se elimina el `.anim-up` duplicado (sección y hijos).

**4.10 Detalle de proyecto**
- **Datos:** campos nuevos opcionales en `Project` (`role`, `duration`, `liveUrl`). La edición en el admin queda para la fase de admin; mientras tanto se leen del JSON si existen.
- "Ver proyecto live" se renderiza solo si existe `liveUrl` (UI-6). Se usa el mismo `ThemeToggle` del navbar (UI-7).
- Texto de las secciones con `measure-prose` y `fs-lead` para el párrafo de entrada. Labels de sección ("EL DESAFÍO") a `fs-micro` con `ls-eyebrow`.
- Galería: los estilos inline del label se mueven a clases tokenizadas.

**4.11 Modal de perfil**
- Migra a `@radix-ui/react-dialog` (ya está en deps), que trae foco inicial, trap, retorno y `aria-labelledby` (MI-11).
- "Acceso a administrador" según D2 (recomendación: link de texto `fs-micro` al pie).
- La `✕` se reemplaza por un ícono SVG.

**4.12 Blog y post**
- Mismos tokens tipográficos. Cuerpo del post con `measure-prose`, `fs-lead` e interlineado 1.7. Pills y tags con estados completos.

**Criterio de aceptación por sección:** cumple P1–P5, pasa el contraste, tiene foco visible, no hay scroll horizontal a 375px, y la captura en los 6 viewports × 2 temas fue revisada.

---

### Fase 5 — Matriz de estados y micro-interacciones · 1 sesión
Resuelve: los MI restantes. Usa el checklist de `references/pro-rules.md` de la skill.

Estados mínimos por componente, todos con tokens:

| Componente | hover | focus-visible | active | disabled | loading | éxito/error |
|---|---|---|---|---|---|---|
| `btn-p` / `btn-g` | ✓ | ✓ | scale .96 | opacity .5 + `cursor:not-allowed` | spinner + texto | — |
| `fsub` (submit) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ con ícono SVG |
| Theme toggle | ✓ | ✓ | ✓ | — | — | — |
| Cards (proyecto/blog) | ✓ | ✓ (ring en el borde de la card) | press .98 | — | skeleton | — |
| Nav item / bottom tab | ✓ | ✓ | ✓ | — | — | — |
| Links sociales / contacto | ✓ | ✓ | ✓ | — | — | copiar ✓ |
| Blog pills / tags / paginador | ✓ | ✓ | ✓ | ✓ | — | — |

- [ ] **Íconos:** set SVG único (stroke 1.5, `currentColor`, 16/20px) en `icons.tsx` para flecha, chevron, cerrar, check, copiar y externo. Se eliminan los glifos `→ ✕ ✓ ✦` del público.
- [ ] **Skeletons** para las cards de proyecto y blog mientras resuelve el fetch, en lugar de aparecer de golpe.

---

### Fase 6 — QA, documentación y entrega · 1 sesión
- [ ] Pre-delivery checklist de la skill: sin emojis como íconos, cursor-pointer, hovers de 150–300ms, contraste 4.5:1, foco visible, reduced-motion, y responsive en 375 / 768 / 1024 / 1440 (más 1920 y 2560, propios del proyecto).
- [ ] Lighthouse móvil y desktop en `/` y `/projects/1`. Objetivo: Accesibilidad ≥ 95, CLS < 0.1, LCP < 2.5s (simulado).
- [ ] `pnpm lint` y `pnpm build` limpios.
- [ ] **DS viewer** (`design-system-section.tsx`, se ve en el admin): actualizar las páginas Tipografía, Animaciones, Colores y Botones a v2.0.0. Solo contenido de documentación, sin rediseñar el admin.
- [ ] `docs/brand-guidelines.md`: escala tipográfica y principios P1–P5.
- [ ] Capturas antes y después para el PR a `main`.

---

## 4. Cronograma

| Fase | Sesiones | Depende de | Entregable |
|---|---|---|---|
| 0 Preparación | 0,5 | — | baseline + scripts QA + decisiones |
| 1 Tokens v2.0.0 | 2 | 0 | JSON + CSS regenerado + puente |
| 2 Foco y contraste | 1 | 1 | 0 fallas de contraste |
| 3 Motion | 1,5 | 1 | hook, split, hero, morph, tilt, magnético |
| 4 Secciones | 3 | 1, 2, 3 y D1/D2 | rediseño completo |
| 5 Estados | 1 | 4 | matriz completa |
| 6 QA y docs | 1 | 5 | PR a `main` |
| **Total** | **~10** | | |

Las fases 2 y 3 son independientes entre sí y pueden ir en paralelo después de la 1.

---

## 5. Decisiones pendientes (con mi recomendación)

| # | Decisión | Recomendación | Bloquea |
|---|---|---|---|
| D1 | Copy del tagline del hero | *"Diseño y construyo productos digitales donde la experiencia del usuario y los objetivos del negocio empujan en la misma dirección."* (17 palabras, sale de tu propia bio) | 4.1 |
| D2 | "Acceso a administrador" en el modal público | Bajarlo a link de texto discreto al pie del modal. Sacarlo por completo obliga a recordar `/admin`. | 4.11 |
| D3 | Pull magnético | **Restaurar**, solo en los 2–3 CTA principales. Es la micro-interacción que da carácter al hero y ya está documentada en el DS. | 3 |
| D4 | Botón primario en dark | Fondo `#0071e3` con texto blanco (≈4.7:1, calculado), conservando `#2997ff` para links y títulos. Mantiene el "azul Apple" del sitio sin texto oscuro sobre azul. | 1.3 |
| D5 | Paleta shadcn en `globals.css` | Eliminarla del público si el admin no la usa. Lo verifico en la Fase 1 antes de tocarla. | 1.5 |

---

## 6. Riesgos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| Romper el admin al tocar tokens | Cambios solo aditivos en el JSON; capturas de las 5 tabs del admin en cada PR de la Fase 1 |
| Regresiones del hero ya resueltas antes (opacity:0 tras `animation:none`, blur "fantasma" al limpiar inline, choque del scroll-hint con el CTA) | No tocar `releaseEntranceAnimation` ni la lógica de "valor explícito en vez de string vacío"; usar `fit-check.js` tras cada cambio de tamaño |
| `backdrop-filter` contra el hero sticky en Chrome | Ya registrado en memoria: si un panel nuevo necesita glass sobre el hero, usar `filter: blur()` en el contenido vía JS, no `backdrop-filter` |
| Cambiar `ProjectCard` a `<a>` rompe el morph | Interceptar con `preventDefault` solo en click primario sin modificadores; el resto se comporta como link nativo |
| Una escala fluida cambia tamaños en breakpoints ya afinados (1440–1599, ≥1921) | Comparar capturas en esos breakpoints exactos; ajustar solo los `clamp()` de los tokens, nunca overrides por media query |
| Alcance creciente | Lo que no está en este plan va a un backlog en `docs/`; ninguna fase agrega features nuevas salvo el CTA de cierre |

---

## 7. Fuera de alcance
Rediseño del admin · **fondo 3D intocable** (`lib/webgl/hero-terrain.ts`, `.hero-terrain-container` y su comportamiento al hacer scroll, ni en código ni en CSS) · migración a `next/image` (sigue bloqueada por `images.unoptimized: true`, ver la auditoría de julio) · contenido de los proyectos y del blog (las imágenes placeholder de las cards se reemplazan desde el admin).
