# Auditoría de diseño — sitio público

Rama: `refinamiento-ui` · Fecha: 2026-10-06 · Alcance: `/`, secciones Trabajos / Sobre mí / Contacto, `/projects/[id]`, `/blog`, `/blog/[slug]`. Se excluye `/admin`.

**Método.** Lectura completa de los componentes públicos y de `styles/portfolio.css`. Medición en vivo en Chrome (viewport 2320×1309 y 390×780, modo claro y oscuro): fuentes cargadas, tamaños computados, contraste WCAG por elemento, foco con teclado y dimensiones de los targets. Contraste con la base de la skill **ui-ux-pro-max**: `--design-system` y los dominios `ux`, `style`, `typography`, `landing` y `gsap`.

**Limitaciones.** El servidor dev en :3000 quedó con su worker caído a mitad de la sesión ("Jest worker encountered 2 child process exceptions"). Por eso `/projects/[id]` y `/blog` se auditaron desde el código y no en vivo. Las imágenes de las cards de proyectos son contenido de prueba y no se evalúan como diseño.

**Sobre la recomendación de la skill.** `--design-system` sugirió *Brutalism* y la pareja *Archivo + Space Grotesk*. **La descarto.** Brutalism exige transiciones instantáneas, esquinas de 0px y "fuentes por defecto": contradice toda la identidad actual (WebGL, glass, motion cuidado), y cambiar de estilo no resuelve ninguno de los problemas medidos. Plus Jakarta Sans + DM Sans es una pareja sólida y bien cargada. El problema no es *qué* fuentes se usan, sino que no hay una *escala*. Sí adopto de la skill el patrón *Scroll-Triggered Storytelling* (cerrar con un CTA final) y sus reglas de UX y motion.

---

## Resumen ejecutivo

El sitio tiene una base visual con carácter: hero con terreno WebGL, retrato 3D, el título de proyectos con `animation-timeline: view()`, el morph de card a detalle y una escala dark con tinte navy. Lo que le impide verse "premium" no es la falta de ideas, sino la **falta de sistema** debajo de ellas:

1. **No existe una escala tipográfica.** Hay más de 40 tamaños distintos y 18 variantes de `clamp()`. Gran parte de la microcopia está en 10–11px.
2. **El "token-first" del DS no se cumple en `portfolio.css`.** Hay 144 hex y 271 `rgba()` literales, 83 radios en px contra 4 usos de `--r-*`, y `--space-*` se usa solo 2 veces.
3. **No hay tokens de motion.** Hay unas 30 duraciones distintas y 114 `ease` genéricos.
4. **Las micro-interacciones son desiguales.** Los componentes principales están pulidos, pero los secundarios no tienen foco visible, ni estados de error, ni semántica de link.
5. **El mobile pierde el ancla visual del hero.** El retrato se oculta y queda un bloque de texto de 6 líneas.

| Severidad | Cant. |
|---|---|
| Alta | 11 |
| Media | 16 |
| Baja | 8 |

---

## 1. Diseño UI

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| UI-1 | **El hero mobile pierde el retrato.** `.hero-portrait` queda en `display:none` a 390px. El hero se reduce a título + párrafo de 6 líneas + 2 botones, y el elemento más reconocible de la marca desaparece justo en el dispositivo más usado. | Medido en el iframe de 390px: `portraitDisplay: none` | Alta |
| UI-2 | **El subtítulo del hero es una bio, no un tagline.** Son unas 45 palabras ("Mi nombre es… tengo 39 años…") que compiten con el título. El hero lee como un párrafo de "Sobre mí". | `hero.json` → `.hero-sub` 19px, 6 líneas en desktop | Alta |
| UI-3 | **Anchos de contenedor incoherentes entre secciones.** El hero llega a `max-width:1944px` en ultra-wide, pero el bento y el blog quedan en 1240px (a 2320px de viewport sobran 540px por lado). El ojo nota el "salto de columna" al pasar del hero a Proyectos. | `bentoW:1240`, `.hero-wrap--portrait{max-width:1944px}` | Media |
| UI-4 | **El navbar no refleja dónde estás.** Con la grilla de proyectos en pantalla, la píldora sigue en "Home". No hay scroll-spy entre Home y Trabajos. | Captura en scrollY=1309 | Media |
| UI-5 | **La página no tiene cierre.** El recorrido termina en Blog y luego un footer informativo, sin un CTA final de "Trabajemos juntos". El patrón de storytelling que recomienda la skill pide un *climax CTA*. | `portfolio.tsx` → footer | Media |
| UI-6 | **El detalle de proyecto tiene datos y CTAs falsos.** "Rol: Lead Designer" está hardcodeado, la duración cae en "4 meses" por defecto y "Ver proyecto live" apunta a `href="#"`. En un portafolio, un CTA muerto resta credibilidad. | `project-detail-view.tsx` | Alta |
| UI-7 | **Hay dos toggles de tema distintos.** El navbar principal usa un segmentado sol/luna y el detalle de proyecto un switch (`toggle-track`). Son dos componentes para la misma función. | `app-navbar.tsx` vs `project-detail-view.tsx` | Media |
| UI-8 | **Quedan restos de la marca anterior.** El fallback de la foto en "Sobre mí" dibuja una "A" (A·Studio) y el footer usa el glifo `✦` como isotipo, mientras el logo real es el hexágono Z. | `about-section.tsx` | Baja |
| UI-9 | **El modal de perfil muestra "Acceso a administrador" al público.** Un botón del mismo peso visual que "Contactar" distrae del objetivo del modal (contacto). | `profile-modal.tsx` | Media |
| UI-10 | **La card 4 del bento no tiene thumbnail.** Queda un gradiente durazno plano que rompe el ritmo visual de la grilla. Falta un estado vacío diseñado (patrón, isotipo, mockup). | Captura de la grilla | Baja |
| UI-11 | **El DS y el sitio están desconectados.** `assets/design-tokens.css` (generado desde el JSON en 3 capas, con tokens de componente como `--btn-primary-radius` y `--form-input-radius`) se importa en `page.tsx`, pero `portfolio.css` no usa ni un `--primitive-*` ni un token semántico o de componente. En su lugar mantiene su propio `:root` paralelo (`--bg`, `--txt`, `--r-*`, `--space-*`) y además 144 hex y 271 `rgba()` literales, con `border-radius:980px` 15 veces. El viewer del DS documenta un sistema que el sitio no consume. | grep sobre ambos archivos | Alta |
| UI-12 | **`--shadow-accent` y `--shadow-focus` usan el azul del modo oscuro** (`rgba(41,151,255)`) también en claro, donde `--accent` es `#0062cc`. El halo del botón queda de otro tono que el botón. | `:root` de `portfolio.css` | Baja |
| UI-13 | **`globals.css` declara `--font-sans: 'Geist'` y la paleta shadcn OKLCH**, pero no se cargan ni se usan en el sitio público. Son dos sistemas de color conviviendo. | `app/globals.css` | Baja |

## 2. Tipografía

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| T-1 | **No hay escala modular.** Hay más de 40 `font-size` distintos, incluidos fraccionales (10.5, 11.5, 12.5, 13.5px), y 18 `clamp()` diferentes. Solo `.hero-title` tiene 6 clamps distintos según el breakpoint. Es el síntoma clásico de ajustar a ojo pantalla por pantalla. | grep de `font-size` | Alta |
| T-2 | **La microcopia está bajo el umbral de legibilidad.** En la home hay 21 elementos a 11px, 3 a 10px (`.blog-card-cat`) y 1 regla a 9px. Labels en uppercase a 10–11px con tracking 0.12em se leen como ruido. | Conteo en vivo de la home | Alta |
| T-3 | **Demasiados pesos cercanos.** Se usan 500, 600, 700 y 800 (35 reglas en 700 y 28 en 600). La diferencia 600/700 en DM Sans casi no se percibe y diluye la jerarquía. | grep de `font-weight` | Media |
| T-4 | **El tracking del hero no escala.** `-0.045em` funciona a 90px, pero se aplica igual a 35px en mobile, donde "Productos digitales" en 800 se ve apretado. | Mobile: `titleFs 35.1px` | Media |
| T-5 | **La pila de fuentes se salta el fallback ajustado de next/font.** `--portfolio-font: "DM Sans", "Helvetica Neue"` no usa `var(--font-dm-sans)`, que incluye "DM Sans Fallback" con métricas corregidas. Resultado: salto de layout (CLS) al hacer el swap. Las fuentes sí cargan; verificado con `document.fonts`. | `document.fonts`: "DM Sans Fallback … unloaded" | Media |
| T-6 | **La mono no se carga.** `"SF Mono", "Consolas"` depende de la plataforma: en Android/Linux cae en la mono del sistema. | 11 reglas | Baja |
| T-7 | **La medida del párrafo es correcta (~55 caracteres) pero no está tokenizada.** `.hero-sub` mide 520px. Conviene un `--measure: 62ch` reutilizable en el detalle de proyecto y en el blog. | `subWidth: 520` | Baja |
| T-8 | **El gradiente animado del título es perpetuo.** `hero-gradient-shift 12s infinite` sobre "Productos digitales". La skill lo clasifica como *continuous decorative animation*. | `portfolio.css:589` | Baja |

**Pareja de fuentes: se mantiene.** Plus Jakarta Sans (display, 800) + DM Sans (texto) tienen buen contraste de personalidad. No hay razón objetiva para cambiarlas. Lo que falta es la escala (ver mejora M-2).

## 3. Animaciones

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| A-1 | **La entrada del título del hero es demasiado larga.** SplitText va carácter por carácter: 1250ms por carácter con 50ms de stagger, así que "Productos digitales" tarda ~2.2s en resolverse. La skill recomienda 400–700ms por carácter y usar split solo en titulares cortos. El usuario espera más de 2s para leer la promesa principal. | `split-text.tsx` (defaults) | Alta |
| A-2 | **El stagger del reveal depende del índice global del DOM.** La fórmula es `delay = i·0.075 + i²·0.012`, con `i` = posición en *toda* la página, no en el lote que entra al viewport. Un elemento que aparece solo al fondo hereda el delay de su índice: el nodo 10 espera 1.95s y el 15 espera 3.8s. En "Sobre mí" y el blog se nota como contenido que "llega tarde". | `hooks/use-intersection.ts` | Alta |
| A-3 | **El scroll del hero anima `filter: blur()` en capas grandes.** Hasta 18px de blur sobre `.hero-left` y el contenedor WebGL, y 14px sobre el retrato, en cada frame. Desenfocar un canvas a pantalla completa es de lo más caro que hay en paint. Son además 5 curvas distintas (texto, sub, cta, retrato, terreno). | `hero-section.tsx` → `apply()` | Media |
| A-4 | **Hay demasiado movimiento perpetuo en el hero.** Gradiente del título (12s), float del retrato (6s), dot del scroll-hint y terreno WebGL, todo a la vez. La skill recomienda 1–2 elementos animados por vista. | CSS | Media |
| A-5 | **Los tokens de motion existen pero no se usan.** `design-tokens.json` define `duration.*` y `easing.*`, y el CSS generado expone `--primitive-duration-*`, `--primitive-easing-*` y `--anim-enter-*`, pero `portfolio.css` no referencia ni uno: tiene unas 30 duraciones literales (80, 100, 120… 260ms) y 114 `ease` genéricos. *(Corrección: la primera versión de este informe decía que no existían.)* | grep sobre ambos archivos | Alta |
| A-6 | **El morph card→detalle anima `width`/`height`** (propiedades de layout) en lugar de `transform: scale`, y usa `targetTop = 460` hardcodeado. La skill marca *animating width/height* como antipatrón. | `project-card.tsx` | Media |
| A-7 | **La píldora del nav anima `left`/`width`**, también layout. Debería usar `transform: translateX() scaleX()`. | `app-navbar.tsx` → `usePill` | Baja |
| A-8 | **El tilt 3D de las cards ignora `prefers-reduced-motion`** y se dispara con cualquier puntero. Además apila efectos: tilt 6–8°, scale 1.015, zoom 1.05 del thumbnail y doble `drop-shadow`. | `project-card.tsx` | Media |
| A-9 | **Lo bien resuelto, para conservar:** reveal del título "Proyectos que me definen" con `animation-timeline: view()` y fallback; crossfade de secciones (exit 160ms < enter 260ms); `anim-up` con 16px y expo-out; la mayoría de las animaciones respeta reduced-motion (7 bloques más chequeos en JS). | — | ✓ |

## 4. Micro-interacciones

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| MI-1 | **El pull magnético está muerto.** Los botones del hero tienen `.btn-magnetic`, pero ningún JS escribe `--mx`/`--my` y el CSS tampoco las usa. La interacción documentada en el DS viewer ya no existe (se perdió en una iteración del hero). | grep `--mx`: 0 resultados | Media |
| MI-2 | **Los controles secundarios no tienen foco visible.** Theme toggle, "Perfil", links sociales (footer y about), `.contact-link-item`, `.bottom-tab`, `.m-link` y la galería caen al `outline-ring/50` de Tailwind: gris al 50%, ~1.3:1, prácticamente invisible. | Estilos computados con Tab real | Alta |
| MI-3 | **Las cards del blog en la home no son operables con teclado.** Son `<div onClick role="article">` sin `tabIndex` y sin link: no se pueden enfocar, no se abren con middle-click y no muestran URL al hover. | `blog-preview-section.tsx` | Alta |
| MI-4 | **El logo del navbar es un `<div onClick>`.** No es enfocable, aunque el CSS le define `:focus-visible`. | `app-navbar.tsx` | Media |
| MI-5 | **Enviar el formulario vacío no da feedback.** Con `noValidate` y `if (!name…) return`, el botón no hace nada y no aparece ningún mensaje por campo. | `contact-section.tsx` | Alta |
| MI-6 | **Los labels del formulario no tienen contraste.** `rgba(0,0,0,.38)` da 2.68:1 en claro (mínimo 4.5:1). Son labels, no decoración. | Medido | Alta |
| MI-7 | **El badge "Disponible para proyectos"** usa texto `--success #30d158` sobre fondo verde claro: 1.77:1. | Medido | Media |
| MI-8 | **El botón primario en dark** tiene texto blanco sobre `#2997ff`: 3.02:1 a 15px (mínimo 4.5:1). Afecta a "Trabajemos juntos" y "Contáctame". | Medido | Alta |
| MI-9 | **El copyright del footer en dark** usa `rgba(255,255,255,.22)`: 1.92:1. | Medido | Baja |
| MI-10 | **Las cards de proyecto (`role="button"`) responden a Enter pero no a Espacio.** | `project-card.tsx` | Baja |
| MI-11 | **El modal de perfil** no tiene `aria-labelledby`, foco inicial, focus trap ni retorno de foco. ESC se escucha en dos lugares (`portfolio.tsx` y el modal). | `profile-modal.tsx` | Media |
| MI-12 | **Los hovers no se protegen en touch.** Solo hay 1 regla `@media (hover:hover)` en 5.777 líneas, así que en mobile los hovers quedan pegados tras el tap y el tilt se dispara con eventos emulados. | grep | Media |
| MI-13 | **Íconos mezclados.** `→`, `✕`, `✓` y `✦` son glifos de texto, mientras en otros lugares hay chevrons SVG. Su grosor y alineación dependen de la fuente. | Varios | Baja |
| MI-14 | **El retrato del hero (probable LCP) tiene `loading="lazy"`** y no tiene `fetchpriority`. Contradice la auditoría de julio, que lo quería eager. | `hero-section.tsx` | Media |
| MI-15 | **El éxito del formulario no se anuncia** (no hay `aria-live` para el estado success), y el estado de error se borra solo a los 3s junto con el mensaje. | `contact-section.tsx` | Baja |

---

## 5. Mejoras propuestas

Ordenadas por impacto en la calidad percibida contra el esfuerzo. Cada una referencia los hallazgos que resuelve.

### P0 — Fundaciones (sin esto, cualquier refinamiento visual se vuelve a desordenar)

**M-1 · Tokens de motion** (A-5, A-3, A-6, A-7)
```css
--dur-instant: 100ms;   /* press, toggles */
--dur-fast:    160ms;   /* hover, exits */
--dur-base:    240ms;   /* enters de UI, crossfade */
--dur-slow:    480ms;   /* reveals, morph */
--dur-hero:    700ms;   /* entrada única del hero */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* la que ya domina el sitio */
--ease-in:     cubic-bezier(0.7, 0, 0.84, 0);   /* salidas */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```
Reemplazar los 114 `ease` y las ~30 duraciones. Regla: las salidas usan `--dur-fast` y `--ease-in`; las entradas usan `--ease-out`.

**M-2 · Escala tipográfica fluida** (T-1, T-2, T-3, T-4)

Escala de 8 pasos con ratio ~1.25 y `clamp()` único por paso:

| Token | Rango | Uso |
|---|---|---|
| `--fs-micro` | 12px fijo | piso absoluto: labels, meta, fechas |
| `--fs-sm` | 13–14px | botones secundarios, chips |
| `--fs-base` | 16px | texto |
| `--fs-lg` | 18–20px | lead, subtítulos |
| `--fs-h3` | 22–28px | |
| `--fs-h2` | 32–52px | `.s-title` |
| `--fs-h1` | 40–64px | detalle y blog |
| `--fs-display` | 40–96px | hero |

- **Pesos:** 400 / 500 / 700 para texto y 800 solo para display. Se elimina el 600.
- **Tracking por paso:** display −0.04em; h2 −0.03em; texto 0; labels uppercase +0.08em a 12px (no 0.12em a 11px).
- **Resultado esperado:** se eliminan los 6 overrides de `.hero-title` por breakpoint.

**M-3 · Migrar `portfolio.css` a tokens** (UI-11, UI-12, UI-13)

Radios → `--r-*` (980px → `--r-full`). Colores literales → semánticos (`--txt-*`, `--surface-*`, `--accent-*`, `--on-accent`). Espaciado → `--space-*`. `--shadow-accent` y `--shadow-focus` se derivan de `--accent` con `color-mix()`, para que coincidan en ambos modos. Limpiar Geist y la paleta shadcn de `globals.css` si el admin no la usa.

**M-4 · Focus ring único y contraste AA** (MI-2, MI-6, MI-7, MI-8, MI-9)
- Un solo `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }` global, que reemplaza el `outline-ring/50` heredado.
- **Dark:** el fondo del botón primario pasa de `#2997ff` a `#0071e3` con texto blanco (≥4.5:1), o se deja `#2997ff` con texto `#0a0b12`. El `--accent` de links y títulos puede seguir siendo `#2997ff`.
- **Labels del form:** `var(--txt3)`.
- **Badge disponible:** texto verde oscuro (`#1a7f37` en claro) con el punto en `--success`.

### P1 — Refinamiento visual de alto impacto

**M-5 · Hero: tagline + bio separados, y retrato en mobile** (UI-1, UI-2, A-1, A-4)
- **Subtítulo:** una línea de valor de 12–18 palabras (ej. *"Diseño y construyo productos digitales donde la experiencia y el negocio empujan en la misma dirección."*). La bio de "39 años…" pasa a "Sobre mí".
- **Mobile:** retrato debajo del CTA, a ~55vh, con el `mask-image` de fundido ya existente y sin parallax.
- **Entrada del título:** reveal por **línea** o **palabra** (no por carácter), con `--dur-hero` (700ms) y 80ms entre líneas. Total < 1s.
- **Movimiento perpetuo:** se conserva solo el terreno WebGL y el float del retrato. El gradiente del título se anima una sola vez o se queda estático.

**M-6 · Stagger por lote, no por índice global** (A-2)

En `use-intersection`, agrupar las entradas de cada callback del observer y aplicar el delay según la posición *dentro de ese lote*: `delay = min(n·60ms, 360ms)`. El orden visual se mantiene y nada espera más de 0.4s.

**M-7 · Scroll del hero más barato** (A-3)

Reemplazar el blur por `opacity` + `translateY` + `scale`, que corren en el compositor. Si se quiere conservar el desenfoque, aplicarlo una sola vez con una capa pre-blureada que hace crossfade. Unificar las 5 curvas en 2: contenido y retrato.

**M-8 · Contenedor único** (UI-3)

`--container: min(100% - 2·gutter, 1320px)` para todas las secciones, con una variante `--container-wide: 1600px` para hero y bento en ≥1920px. Hero y grilla deben compartir los bordes.

**M-9 · CTA de cierre antes del footer** (UI-5)

Una banda "¿Tienes un proyecto en mente?" con título display, el botón primario magnético y el email copiable, reutilizando el copy ya existente de Contacto. Es el *climax CTA* del patrón storytelling.

**M-10 · Detalle de proyecto honesto** (UI-6, UI-7)

Rol y duración deben salir de los datos del proyecto (agregar los campos en el admin). "Ver proyecto live" se oculta si no hay URL. Usar el mismo `ThemeToggle` del navbar.

### P2 — Micro-interacciones y pulido

**M-11 · Restaurar el pull magnético con el patrón ya documentado** (MI-1). JS escribe `--mx`/`--my` vía `style.setProperty` en `pointermove`, con fuerza ×0.3 y clamp, y `.btn-magnetic` compone `translate(var(--mx), var(--my))` con los `scale` de :hover/:active. Solo en los 2 CTA del hero y el CTA de cierre, solo bajo `@media (hover:hover) and (pointer:fine)` y desactivado con reduced-motion. Si no se restaura, quitar la clase y su documentación en el DS.

**M-12 · Tilt de cards más sobrio** (A-8, MI-12). Activarlo solo con `(hover:hover) and (pointer:fine)` y sin reduced-motion. Bajar a 4° y quitar el `scale(1.015)` (el zoom del thumbnail ya comunica el hover). Una sola sombra tokenizada (`--shadow-xl`) en vez de doble `drop-shadow`.

**M-13 · Semántica de navegación** (MI-3, MI-4, MI-10). Cards del blog con `<Link>` real y foco visible, logo con `<Link>`/`<button>`, y cards de proyecto que respondan a Enter y a Espacio (o mejor, que sean `<a href>` que conserve el morph vía `onClick` + `preventDefault`).

**M-14 · Formulario con feedback por campo** (MI-5, MI-15). Validación al perder el foco y al enviar, con mensaje bajo cada campo (`aria-describedby`), foco al primer campo inválido, `aria-live="polite"` para el éxito y un error que se mantenga hasta el próximo intento.

**M-15 · Modal de perfil** (UI-9, MI-11). Migrar a `@radix-ui/react-dialog`, que ya está en deps y usa la galería: trae foco, trap, retorno y labelledby. "Acceso a administrador" se convierte en un link de texto discreto, o se saca del sitio público.

**M-16 · Íconos SVG consistentes** (MI-13, UI-8). Reemplazar `→ ✕ ✓ ✦` por SVG de un mismo set, con stroke 1.5 y `currentColor`. El fallback de la foto y la marca del footer pasan a usar el isotipo Z real.

**M-17 · Morph y píldora con transform** (A-6, A-7). Morph: el clon parte a tamaño final con `transform: translate() scale()` invertido (técnica FLIP) y anima solo `transform` + `border-radius`. Píldora: `translateX` + `scaleX` con el ancho base fijo.

**M-18 · Carga** (MI-14, T-5, T-6). En el retrato del hero, quitar `lazy` y agregar `fetchPriority="high"`. Las pilas de fuentes pasan a `var(--font-dm-sans)` y `var(--font-plus-jakarta)`. Cargar una mono vía next/font (JetBrains Mono o Geist Mono) o quitar los usos de mono del sitio público.

**M-19 · Scroll-spy del navbar** (UI-4). Un IntersectionObserver sobre `.projects-sheet` que mueva la píldora entre Home y Trabajos.

**M-20 · Estado vacío de thumbnail** (UI-10). Gradiente del proyecto con el isotipo en marca de agua y la categoría en grande, en vez de un gradiente plano.

---

## 6. Orden de ejecución sugerido

1. **M-1 + M-2 + M-3** (tokens): un solo PR de fundaciones, sin cambio visual intencional salvo el piso de 12px.
2. **M-4** (foco y contraste): rápido, de alto impacto y verificable con el script de contraste usado en esta auditoría.
3. **M-5 + M-6 + M-7** (hero y motion): es el cambio que más se nota. Requiere validar el copy del tagline con Carlos.
4. **M-8 + M-9 + M-10** (layout y cierre).
5. P2 en lotes pequeños.

**Decisiones que necesitan input del dueño:** el copy del tagline (M-5), si "Acceso a administrador" se queda en el público (M-15), restaurar o eliminar el pull magnético (M-11) y el color del botón primario en dark (M-4).
