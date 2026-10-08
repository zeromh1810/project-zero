# Progreso — Admin + Design System

Plan: `docs/plan-implementacion-admin-ds.md` · Auditoría: `docs/auditoria-ui-admin.md` · Baseline: `scripts/qa/baseline-admin-2026-10-07.md`

Validación de cada paso: `ui-audit.js` en vivo con la sesión del usuario (y `fetch` interceptado: **ninguna escritura real** durante las pruebas), Lighthouse y capturas con Chrome headless sobre `/dev/ui`, `tsc`, lint, guardia del fondo 3D.

## ✅ Fase 0 — Preparación
- `AdminDashboard` extraído de `app/admin/page.tsx`; ruta solo-dev `/dev/ui` (`view=admin|ds|components|frame`, 404 en producción).
- Baseline en vivo: 9 tabs y 18 páginas del DS × 2 temas.
- Email de ejemplo del DS → c.hickmann86@gmail.com (y LinkedIn real).
- Hallazgo de método: Chrome headless de escritorio tiene **ancho mínimo de 500px** — las capturas mobile se hacen con `view=frame` (iframe del ancho exacto, sin indicador de dev).

## ✅ Fase 1 — Fundación del DS
- CSS del viewer (`.ds-*`, 224 reglas) a `styles/design-system.css`, importado solo por el viewer: **`portfolio.css` −21% (154.6 → 124.2 KB)** para todos los visitantes. Error propio detectado en el loop y corregido antes de validar: la primera pasada movía también `.brands-section` ("bran**ds-**").
- `components/design-system/lib/`: versión y changelog leídos de `design-tokens.json`, valores computados en vivo, contraste WCAG calculado.

## ✅ Fase 2 — Componentes base del admin (`app/admin/_components/ui/`)
`Field` (label asociado, hint, error, aria) · `ConfirmAction` · `Dropzone` (button + drop real, acciones siempre visibles) · `Sheet` (Radix) · `ConfirmDialog` · `TagInput` · `ListItem`/`StatusBadge`/`EmptyState`/`ListSkeleton`/`SectionHeader`/`Card` · `useDirty`/`UnsavedBar` · `useResource`. CSS en `app/admin/admin-ui.css` (100% tokens, ≥12px, foco, hover solo con puntero, reduced-motion). `admin.css` legado: piso 12px, rojo AA, anillos con el acento, hovers bajo `@media (hover:hover)`.

## ✅ Fase 3 — Riesgo de datos y formularios
- **Login:** `<form>`, label, `autocomplete="current-password"`, mostrar/ocultar, error anunciado, logo real, toggle visible → Lighthouse a11y **100**.
- **Borrado con confirmación** en Blog y Marcas (antes inmediato y commiteado a GitHub) y Proyectos (mismo componente).
- **Todos los tabs** reescritos con Field/Dropzone/useResource: labels asociados (verificado: 100% de los campos), validación al guardar, aviso de cambios sin guardar, vista previa en contexto (hero, modal de perfil, navbar del logo).
- Proyectos: panel → `Sheet`; campos nuevos **Rol** y **URL publicada** (el detalle público ya los usa).

**Bugs previos encontrados y corregidos en el loop:**
1. Editar un proyecto existente: **los 3 editores del caso de estudio eran invisibles** (`useEditorState` sin transacción inicial → el componente devolvía null). Estaba en `main`.
2. Proyectos no comprobaba `res.ok`: un 401/500 mostraba "Proyecto actualizado" y cerraba el panel sin guardar.
3. Quitar el thumbnail de un proyecto y guardar **no lo quitaba** (`undefined` omitido + merge en la API).
4. El toggle de tema del admin era **invisible** desde el commit `c528f2f` (su CSS se borró).
5. El tab **CV editaba `data/cv.json`, que el sitio ya no lee**: se quitó de la navegación (el link al CV vive en Sobre mí). Datos y API intactos.

## ✅ Fase 4 — Navegación y feedback
- Navegación lateral agrupada (Contenido · Perfil · Marca · Sistema), `role="tablist"` vertical con flechas/Inicio/Fin y roving tabindex, deep link `?tab=`, selector nativo en mobile.
- Cambiar de tab con cambios sin guardar → diálogo (Seguir editando / Descartar / Guardar y continuar; si el guardado falla, no cambia de tab).
- Toast: la pausa (hover/foco) detiene el temporizador real; `role="status"`/`alert` según tipo; errores 6s.
- Inline styles del admin: **219 → 11** (solo valores dinámicos).
- **Validación:** contraste 0 fallas y 0 textos < 12px en todos los tabs × 2 temas; lint 28 problemas (2 errores previos del editor, 26 warnings — antes 37); mobile 390px real sin desborde.

## ✅ Fase 5 — Rediseño del viewer del DS
Documentación para diseñadores al estilo de Material / Carbon. Reemplaza a `design-system-section.tsx` (4.428 líneas, 18 páginas, valores escritos a mano); la exportación `DesignSystemSection` se mantiene para el admin.

- **Estructura** (`components/design-system/`): `ds-shell.tsx` (navegación agrupada con `aria-current`, búsqueda con Ctrl/⌘+K, deep link `?page=`, selector nativo en móvil), `registry.ts`, `ui/doc.tsx` (primitivas), `pages/` (32 páginas), CSS en `styles/ds-docs.css` (prefijo `doc-`, 100% tokens).
- **Páginas:** Fundamentos (inicio y principios, color, tipografía, espaciado y layout, forma y elevación, movimiento, iconografía, accesibilidad) · Componentes del sitio (botón, tarjeta de proyecto, formulario, navegación, selector de tema, etiquetas, CTA de cierre, contador, skeleton) · Componentes del admin (campo, dropzone, confirmación, panel lateral, lista y estado, cambios sin guardar, toast, navegación del panel) · Patrones (hero, galería, detalle, blog, panel admin, micro-interacciones) · Changelog.
- **Cada componente** en pestañas Uso · Estilo · Contenido · Accesibilidad · Código: cuándo usarlo / cuándo no, variantes, anatomía numerada, medidas leídas del componente real (redlines), matriz de estados, tokens con su valor en el tema activo, contraste WCAG medido en vivo.
- **Cada regla de uso trae su imagen de referencia ✓/✗**, renderizada con el componente real y el CSS de producción (una regla sin ejemplo se marca en rojo). Los ejemplos incorrectos son `inert` y `aria-hidden`.
- **Estados forzados** (hover/foco/presionado) sin duplicar CSS: `lib/pseudo-states.ts` clona las reglas reales reemplazando el pseudo por `[data-pseudo]` (técnica del addon de Storybook), incluidas las que viven en `@layer`.
- **Capturas del sitio real** para patrones y navegación: `node scripts/qa/capture-ds.mjs` → `public/ds/captures/<id>-{light,dark}.png` (Chrome por CDP, sin dependencias; viewport de 390px reales).
- Contenido real: proyectos de `data/projects.json`, email c.hickmann86@gmail.com. Las acciones de ejemplo (borrar, subir, guardar) no escriben nada.
- Tokens → **v2.1.0** (solo versión y changelog; ningún valor cambió).
- `/dev/ui` acepta `?theme=light|dark` para las capturas.

## ✅ Fase 6 — QA final
- **ui-audit** en las 32 páginas del DS, en todas sus pestañas y en ambos temas: 0 fallas de contraste y 0 textos < 12px. La única excepción es el ejemplo ✗ intencional de «12px es el mínimo», que es `aria-hidden`. Ninguna regla quedó sin imagen ✓/✗.
- **Teclado:** Ctrl/⌘+K enfoca la búsqueda, Enter abre el primer resultado y las flechas cambian de pestaña. Las 16 capturas cargan.
- **Lighthouse a11y = 100** en el DS (botón, campo, color), admin `/dev/ui`, login, `/`, `/projects/1` y `/blog`. Best practices = 96: el favicon de marca sigue pendiente y faltan los source maps de dev.
- **Bug propio corregido en el loop:** `<main role="tabpanel">` no es ARIA válido (Fase 4). El `tabpanel` pasó a un div interno.
- **Bug propio corregido en el loop:** al subir los tokens a v2.1.0, la primera escritura reformateó `design-tokens.json` y reordenó sus claves. Se reconstruyó el formato original y se verificó que los valores son idénticos; el diff queda en solo versión y changelog.
- `tsc` OK · lint 28 (los mismos 2 errores previos del editor y 26 warnings, igual que antes de la Fase 5) · guardia del fondo 3D OK.
- `styles/design-system.css` eliminado (sin uso; no estaba en git, respaldado fuera del repo). El viewer anterior sigue en `HEAD`.
- Mobile 390px real: sin desborde; el DS usa un selector nativo en lugar de la barra lateral.

**Pendiente del usuario:** favicon de marca.

## ✅ Después del QA — pedidos del usuario
- **Favicon editable** en Admin → Logo → Favicon (SVG, o PNG/ICO cuadrado ≥ 48px, máx. 100 KB). Se valida al subirlo y se previsualiza en una pestaña del navegador en claro y oscuro. Se sirve en `/brand-icon` con ETag. Sin archivo subido, se usa el isotipo (hexágono) recortado del logo, nunca los íconos de v0 de `public/`. Best practices de la home: 96 → **100**.
- **Zero design system público** en `/design-system`, con el navbar del sitio y enlazado desde el navbar («Zero design system», «Zero DS» ≤ 1180px) y desde la barra inferior móvil (5 destinos). En el admin, la sección pasó a llamarse igual.
- **Navbar en tablet:** con el sexto destino, a 760px «Perfil» quedaba fuera de pantalla. Ahora se compacta por breakpoint (padding, «Home» oculto ≤ 820px, «← Portafolio» solo flecha ≤ 700px). Medido entre 641 y 1920px en `/`, `/blog` y `/design-system`: nada se corta ni desborda. Documentado en DS → Navegación → Estilo.
- `styles/design-system.css`: confirmado sin uso y eliminado.
- Vistas previas del logo: los hex sueltos pasaron a tokens primitivos.
- Lighthouse `/design-system` y `/`: a11y 100 · best practices 100 (solo quedan los source maps de dev). Un error de hidratación del DS público (`?page=` leído en el cliente) se corrigió cargando el viewer solo en el cliente, como en el admin.
- tsc OK · lint 28 (los mismos 2 errores previos del editor y 26 warnings, igual que antes) · fondo 3D intacto.

## ✅ Motion — entradas y salidas del admin y del DS (ui-ux-pro-max)
Criterios de la skill: stagger de 30–50ms, salidas al ~65% de la entrada, interrumpibles (el estado nunca depende de `animationend`), solo transform/opacity y movimiento reducido. Siguiendo la regla del DS, primero se agregó al sistema y después se aplicó.
- **Sistema:** `styles/motion.css` (vocabulario `m-*`, solo `opacity` + `translate`/`scale`, que componen con transforms existentes) y `lib/motion.ts` (`usePresence`, `useLatest`, `Switch`, `leaveThen`, `motionMs`). Tokens nuevos: `--stagger-step-sm` 40ms, `--stagger-max-sm` 240ms, `--shift-sm` 4px. Toast pasado a tokens de motion (antes 300/200ms fijos).
- **Admin:**
  - El shell entra una vez: barra, navegación y contenido.
  - Al cambiar de sección, la anterior sale y la nueva entra en cascada.
  - Listas, marcas y galería entran escalonadas, y cada ítem sale antes de eliminarse (vuelve si la acción falla).
  - Panel lateral con su contenido en cascada; diálogo que crece y se encoge.
  - Barra de cambios y punto de "sin guardar" con entrada y salida; errores de campo y del dropzone que entran y salen.
  - Etiquetas, confirmación en línea, vista previa del dropzone y salida al cerrar sesión.
- **DS:**
  - Navegación que entra una vez.
  - Cambio de página y de pestaña con salida y entrada; encabezado en cascada.
  - Resultados de búsqueda en cascada.
  - Secciones y reglas que se revelan con el scroll (CSS ligado al scroll, sin JS); feedback de "Copiado" y capturas con fundido.
- **Documentado** en DS → Movimiento → **Coreografía**: tabla de entradas y salidas por elemento, demos en vivo (presencia y lista), 3 reglas ✓/✗ y código.
- **Bugs encontrados en el loop y corregidos:**
  1. Cerrar el panel lateral o el diálogo dejaba el foco en `<body>`. Radix lo devuelve a su `Dialog.Trigger` y estos se abren por estado. Ahora `useReturnFocus` lo devuelve al botón que los abrió (era previo, de la Fase 2).
  2. El panel lateral seguía animando con movimiento reducido.
  3. Dos borrados seguidos de etiquetas revivían la primera.
  4. Con movimiento reducido, el foco no llegaba al título de la página nueva del DS.
- **Validación:** 22 pruebas de comportamiento por CDP (fases de salida y entrada, cambios rápidos interrumpibles, retiro final, foco, ARIA de pestañas, movimiento reducido): 22/22 · Lighthouse a11y 100 / best practices 100 en admin y DS · CLS 0 · tsc OK · lint 28 (sin cambios) · fondo 3D intacto.

## ✅ Motion del Zero design system — rehecho con ui-ux-pro-max
A pedido: cada decisión sale de la skill. Trazabilidad completa en `docs/motion-ds-ui-ux-pro-max.md` (fuentes, qué cambió y por qué, qué NO se aplicó y por qué).
- Crossfade direccional que no bloquea (páginas y pestañas), historial real con scroll restaurado, indicadores deslizantes, revelado al entrar en pantalla (con fallback sin JS), hover < 2px y presionar 0.98, copia con respaldo y aviso de error, esqueleto de capturas, sugerencias en "sin resultados", `touch-action`.
- Eliminado por `excessive-motion` / `motion-meaning`: cascada del encabezado, barra lateral al cargar, pop de insignias, revelado ligado al scroll.
- Tokens nuevos: `--dur-exit-lg` 320ms, `--dur-reveal-sm` 360ms.
- 41/41 pruebas etiquetadas por regla · checklist de la skill a 375/768/1024/1440 · Lighthouse a11y 100 / bp 100 / CLS 0 · tsc OK · lint 28 (sin cambios) · fondo 3D intacto.
- Pendiente de decisión: llevar el crossfade al cambio de sección del admin (hoy secuencial).
