# Progreso — refinamiento-ui

Cada paso se cierra solo cuando pasa su loop de validación: `scripts/qa/ui-audit.js` (contraste, < 12px, foco), `scripts/qa/var-snapshot.js` (regresión de variables), `sh scripts/qa/check-terrain.sh` (fondo 3D intacto), `tsc`, `pnpm lint` (sin errores nuevos: los 2 de `app/admin/_components/rich-text-area.tsx` son previos) y revisión visual.

## ✅ Fase 0 — Preparación
- Dev server reiniciado (el anterior tenía el worker caído: `/projects/1` daba 500).
- Herramientas QA en `scripts/qa/` + baseline en `scripts/qa/baseline-2026-10-06.md`.
- El auditor compensa la ventana de Chrome oculta (rAF, scroll, IntersectionObserver y animaciones CSS no corren con la ventana oculta).

## ✅ Fase 1 — Tokens DS v2.0.0
- `design-tokens.json` v2.0.0: `fontScale`, `fontWeight`, `easing.in`, `semantic.layout` (container, gutter, measure), `semantic.type`, `semantic.motion`, colores `on-accent`, `txt-muted`, `success-text`, `btn-primary-bg(-h)`.
- `design-tokens.css`: bloque v2.0.0 aditivo (no se regenera el archivo completo: tiene capas mantenidas a mano que usa el admin).
- `portfolio.css`: el `:root` pasa a alias de los tokens (`--bg: var(--color-bg)`…), importa `design-tokens.css` él mismo, y las fuentes usan `var(--font-*)` de next/font (fallback con métricas ajustadas).
- Piso de 12px en las 20 reglas públicas que estaban bajo 12px + label de galería sin estilos inline.
- **Validación:** 65/65 variables idénticas en claro y oscuro (solo cambian las pilas de fuentes, a propósito) · 0 textos < 12px en las 6 vistas · ningún label partido (desktop y 375px) · admin sin cambios.
- **Regresión encontrada y corregida en el loop:** `/projects/[id]` no importaba `design-tokens.css` → con el puente perdía colores y fuentes al cargar directo.

## ✅ Fase 2 — Foco, contraste y semántica
- Botones primarios (btn-p, fsub, detail-btn-primary, blog-pill activo, tag del detalle) con `--color-btn-primary-bg(-h)`: dark 3.02 → 4.75:1; hover claro 4.2 → 6.8:1; hover dark ~1.8 → 5.8:1.
- Labels del form 2.68 → `txt-muted`; badge disponible 1.77 → `success-text #146c2e` (5.5:1 sobre su tinte); `--highlight` claro #3b82f6 (3.5:1) → #0062cc; footer copy y eyebrow de marcas sin opacidad que bajaba el contraste.
- Anillo de foco global (`:where(...)`, especificidad 0). Card de proyecto: anillo en `::after` (el `clip-path` recortaba el outline: el foco nunca se había visto).
- Semántica: card de proyecto = `<a href>` con morph solo en click primario; cards del blog y "Ver todas" = `<Link>`; logo del navbar = `<button>`.
- 41 reglas `:hover` públicas dentro de `@media (hover: hover)` (sin hovers pegados en touch).
- **Validación:** 0 fallas de contraste, 0 controles sin foco y 0 textos < 12px en Home, Sobre mí, Contacto, Detalle, Blog y Post, en claro y oscuro · Tab → card muestra el anillo · Enter y click abren el caso con morph y sin restos · "Volver" deja la grilla en el tope · logo y links OK.

## ✅ Fase 3 — Motion y micro-interacciones
- **Stagger por lote** (`hooks/use-intersection.ts`): retraso = posición dentro del lote que entra junto al viewport (`--stagger-step` 60ms, tope `--stagger-max` 360ms). Antes: índice global con curva cuadrática (hasta ~4s). El delay inline se limpia al terminar (ya no retrasa hovers).
- **Reveal** `.anim-up` con tokens: 480ms, 12px, ease-out.
- **Título del hero por línea** (`split-text.tsx`, modo `line`): 700ms + 90ms entre líneas → legible en < 1s (antes ~2.2s, por carácter). Subtítulo 600ms y CTA 720ms en cascada. Gradiente: un barrido de 1.8s (antes loop infinito de 12s).
- **Scroll del hero**: el texto se funde con opacity (sin blur por frame); el retrato sin blur, con `filter:none` explícito. **El terreno 3D conserva su blur + fade originales** (verificado contra la fórmula en 5 posiciones).
- **Tilt de cards**: solo puntero fino y sin reduced-motion, 4°, sin scale extra, una sola drop-shadow. Pasa a variables `--rx/--ry` compuestas en CSS → **bug corregido: el inline pisaba `:active` y las cards nunca mostraban feedback de presión**.
- **Pull magnético restaurado** (`hooks/use-magnetic.ts`): ×0.3, tope ±8px, retorno 400ms, compuesto con hover/press.
- **Nuevas:** flecha que avanza al hover (N-3), brillo del primario (N-4), cuenta ascendente en stats de cards y "Sobre mí" sin salto de ancho (N-7/N-8, `count-up.tsx`), subrayado que crece en links de texto (N-9), cambio de tema con revelado circular por View Transition + ícono que gira (N-10, `lib/theme-transition.ts`), pop del ícono en bottom nav tras un toque (N-18). Todas con reduced-motion.
- **Decisiones con criterio (no se aplicó lo del plan):** morph card→detalle y píldora del nav siguen animando width/height/left — con `scale` no uniforme la imagen se deformaría (proporciones distintas) y los extremos redondeados de la píldora también; ambos son un solo elemento fuera del flujo, costo de layout mínimo.
- **Validación:** 0 fallas de contraste / foco / < 12px en las 6 vistas × 2 temas · fondo 3D intacto · tsc OK · lint sin problemas nuevos · tiempos medidos vía Web Animations API · tema persistido y clase temporal limpia.
- **Pendiente de validar con la ventana visible:** la *sensación* de fluidez (Chrome no anima con la ventana oculta; se verificó lógica y estados, no frames).

## ✅ Fase 4 — Rediseño por sección (implementada; validación visual parcial)
- **Hero:** título intacto; subtítulo → tagline (pedido del usuario): *"Diseño y construyo productos digitales donde la experiencia del usuario y los objetivos del negocio empujan en la misma dirección."* (`data/hero.json` + DEFAULT; editable en el admin). Retrato visible en mobile llenando el alto libre entre CTA y bottom nav (200–380px); oculto en teléfonos bajos (≤700px de alto). Imagen con `fetchpriority="high"`, sin lazy, con width/height. Verificado en 430×932, 390×844, 360×740, 375×667 y 768×1024 sin cortes ni scroll horizontal.
- **Navbar:** scroll-spy Home ↔ Trabajos (verificado).
- **Cards:** escala tipográfica (h3/h4/small), estado sin thumbnail con número en trazo (UI-10) y overlay siempre presente (antes el texto blanco quedaba sobre el gradiente claro).
- **Blog preview:** extracto a 3 líneas.
- **CTA de cierre** (`sections/closing-cta.tsx`): copy real de Contacto, glow que sigue al puntero (N-16), botón magnético, copiar email con check dibujado + `aria-live` (N-12). No aparece en Contacto. Verificado (copia, reset 1.8s, 44px, contraste/foco OK).
- **Footer:** el `✦` queda como decorativo (`aria-hidden`); no se redibujó el isotipo a mano (solo existe como imagen dentro del logo — dibujarlo sería inventar la marca).
- **Sobre mí:** fallback de foto con "C" (antes "A" de A·Studio), alt real, botones con clase y flecha.
- **Contacto:** validación por campo (blur + submit), mensajes bajo el campo con `aria-describedby`/`aria-invalid`, foco al primer inválido, shake corto (N-13), check dibujado al enviar, spinner, error persistente hasta el próximo intento. Estados que fallaban AA y no se veían en el baseline: botón en éxito (2.0:1), en error (3.8:1) y mensaje de error (3.8:1) → tokens `success-bg`, `error-bg`, `error-text`. Bug encontrado en el loop y corregido: el label flotante se descentraba cuando aparecía un error.
- **Detalle:** rol desde el dato (`role`, default "Lead Designer"), duración solo si existe (los 4 proyectos la tienen), "Ver proyecto live" solo con `liveUrl` (antes `href="#"`), mismo ThemeToggle que el navbar.
- **Modal de perfil:** Radix Dialog (foco inicial, trap, retorno, ESC, título/descripción), entrada .96→1 y salida 160ms (N-15), "Acceso administrador" como link discreto (pedido del usuario). Se eliminó el ESC duplicado de `portfolio.tsx`.
- **Títulos de sección:** `.s-title` → `--fs-h2`; título de Proyectos → `--fs-h1`.
- **Ultra-wide (≥1921px):** secciones y bento a `--container-wide` (1600px). El hero no se tocó (su composición con el retrato ya estaba afinada).

## ✅ Fase 5 — Estados, íconos y carga (implementada)
- Flechas SVG del set (`ArrowRightIcon`/`ArrowLeftIcon`) en todos los botones y links públicos; 0 glifos `→`/`←` restantes. Las de "volver" retroceden 3px al hover.
- Skeletons con shimmer (N-17) en el preview del blog (antes aparecía de golpe empujando el layout) y en `/blog` (antes spinner).
- Estado `:disabled` común para `.btn-p`/`.btn-g`; página activa del paginador con fondo AA (era 3.02:1 en dark).

## ✅ Fase 6 — QA final y docs
**Navegador (Chrome reconectado):**
- Auditoría completa en Home, Sobre mí, Contacto, Detalle (1 y 4), Blog y Post × claro/oscuro: 0 fallas de contraste, 0 textos < 12px, 0 controles sin foco visible, 0 hovers sin guardia.
- Consola: sin errores del sitio (solo los de la extensión Excalidraw de Chrome).
- Modal Radix: título/descripción, foco inicial adentro, ESC y click afuera cierran con animación. **Bug encontrado y corregido:** el foco no volvía a "Perfil" al cerrar (el modal se desmonta aún abierto para animar la salida) → retorno manual al desmontar.
- Skeletons: aparecen y se van al llegar los datos. **Ajustado en el loop:** medían 72px (preview) y 215px (/blog) menos que las cards reales → ahora 1–3px de diferencia.
- Formulario en 390px: errores, labels centrados, foco al primero inválido. **Agregado:** `scroll-margin` en campos para que el foco no quede bajo el navbar fijo (WCAG 2.4.11).
- Ultra-wide 2302px: secciones a 1600px; brecha con el borde del hero de ~304 → 124px.
- Mobile 390px: CTA de cierre en 2 líneas sin scroll horizontal; pop del ícono de bottom nav.

**Lighthouse** (Chrome headless propio, modo dev — el rendimiento no se mide en dev):
| Ruta | Accesibilidad | Buenas prácticas |
|---|---|---|
| `/` | 96 → **100** | 96 |
| `/projects/1` | 97 → **100** | 96 |
| `/blog` | 96 → **100** | 96 |
| `/blog/[slug]` | **100** | 96 |

Lo que corrigió Lighthouse y no veía el auditor propio:
- **Bug previo serio:** con el sistema en modo oscuro, la hoja de Proyectos se pintaba blanca con texto claro ("Proyectos que me definen" a 1.37:1) hasta el primer scroll — el color lo ponía JS leyendo el tema al momento del scroll. Ahora el color es CSS por tema y JS solo anima la opacidad (`--sheet-alpha`).
- Tags del blog en dark 4.3:1 → `--txt2`.
- Orden de headings del detalle (h1→h3) → secciones y sidebar a `h2`.
- Alt redundante en la galería (el botón ya dice "Ver Imagen N") → `alt=""`.

Buenas prácticas 96 restante: `favicon.ico` 404 (preexistente — en `public/` solo hay los íconos de v0 de la plantilla; **falta un favicon de Project Zero**) y source maps (artefacto de modo dev).

**Checks finales:** fondo 3D intacto (`check-terrain.sh`), tsc OK, lint 38 (2 errores preexistentes del admin, 0 nuevos; 1 warning menos que el baseline), 6 rutas 200.

**Docs:** `docs/brand-guidelines.md` → sección v2.0.0 (principios, escala, motion, color, catálogo de micro-interacciones).

## ✅ Ajuste post-revisión (pedido del usuario)
- Grilla de proyectos **10% más chica** en todos los breakpoints con ancho acotado: desktop/tablet `width: min(990px, 90%)` (antes `max-width: 1100px`), ultra-wide `min(1440px, 90%)` (antes 1600px), card compacta `min-height` 280 → 252px. Mobile (≤640px) sin cambio: las cards ya ocupan el ancho útil. La altura sigue al ancho (aspect-ratio 16/10), así que escala parejo.
- Medido: 2560 → 1440px · 1920/1440 → 958px (antes 1064) · 1024 → 835px (antes 928) · 768 → 634px (antes 704) · 390 → 350px (igual). Sin scroll horizontal, contraste OK, fondo 3D intacto.

## Pendiente (fuera de esta rama o requiere input)
- **Favicon de marca** (asset de Project Zero) para cerrar el 404.
- **Admin:** campos `role` y `liveUrl` del proyecto (el sitio ya los lee) y actualizar el DS viewer (`design-system-section.tsx`: páginas Tipografía/Animaciones aún describen el SplitText por carácter).
- **Revisión visual humana** de la fluidez de las animaciones con la ventana visible.
- Commit y PR a `main` cuando lo apruebes.
