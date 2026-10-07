# Plan de implementación — Admin + Design System

Rama: `refinamiento-ui` (sin commits hasta la aprobación del usuario) · Insumo: `docs/auditoria-ui-admin.md` · Base: DS v2.0.0 → objetivo **v2.1.0**

## 1. Dirección

**Admin: "Herramienta silenciosa".** Estilo **Minimalism & Swiss**, recomendado por la skill para paneles y herramientas profesionales. Usa la misma identidad del sitio (DS v2.0.0), con menos expresión y más claridad: densidad media, motion sutil (dial 3) y jerarquía tipográfica estricta. Cada acción debe ser predecible, reversible o confirmada, y operable con teclado.

**Design System: "Referencia viva".** El viewer pasa de ser un documento escrito a mano a una referencia que **se alimenta del código**:
- Los valores se leen de los tokens reales.
- Los ejemplos son los componentes reales.
- **Cada regla de uso trae su imagen de referencia ✓/✗**, generada por nosotros (ver §3).

Base de la skill: `--design-system` (Minimalism & Swiss, densidad 7, motion 3) y `--domain ux`, con severidad alta en *Confirmation Dialogs*, *Form Labels*, *Keyboard Navigation* y *Dragging Movements* (alternativa al arrastre). "Cambios sin guardar" no tiene coincidencia en la base: es criterio propio.

**Principios que mantienen la validación de cada paso** (los mismos P1–P5 del sitio público):
- **P1.** Token o nada.
- **P2.** Piso de 12px y contraste AA en ambos temas.
- **P3.** Motion con significado y reduced-motion.
- **P4.** Estados completos.
- **P5.** Solo compositor.

A eso se suma:
- **P6.** **Nada destructivo sin confirmación; nada editado se pierde en silencio.**

## 2. Entorno de validación sin contraseña

`app/dev/ui/` es una ruta **solo de desarrollo** (`notFound()` si `NODE_ENV === "production"`). Renderiza:
- el **panel del admin** (el mismo componente `AdminDashboard` que usa `/admin`, extraído de `page.tsx`);
- el **viewer del DS**.

Las lecturas usan las APIs públicas de siempre. Las escrituras siguen exigiendo la cookie de sesión, así que desde esta ruta **no se puede guardar nada** (responden 401). Permite correr `ui-audit.js`, Lighthouse y las capturas sobre el admin sin ingresar credenciales.

## 3. Imágenes de referencia (generadas por nosotros)

- **Ejemplos en vivo por regla (`UsageRule`).** Cada regla es una tarjeta par: **✓ Correcto / ✗ Incorrecto**. Cada lado renderiza el componente real en esa situación, con un marco verde o rojo y un ícono SVG, más una explicación de una línea. Siempre reflejan los tokens actuales y responden al tema claro/oscuro.
- **Capturas PNG en contexto.** `scripts/qa/capture-ds.mjs` usa Chrome headless (`--screenshot --virtual-time-budget`, sin dependencias nuevas) para fotografiar el sitio real y cada `UsageRule` aislado (`/dev/ui?specimen=<id>`). Las guarda en `public/ds/captures/<id>-{light,dark}.png` y el viewer las muestra en las páginas de patrones (hero, bento, detalle, CTA de cierre, admin). Se regeneran con `node scripts/qa/capture-ds.mjs`.
- **Criterio de aceptación:** ninguna regla de uso sin imagen. El viewer muestra un aviso rojo si una regla no trae `do` y `dont`, y el check lo cuenta.

## 4. Fases

### Fase 0 — Preparación · 0,5 sesión
- [ ] `AdminDashboard` extraído de `app/admin/page.tsx` (login y auth quedan en la página).
- [ ] Ruta dev `app/dev/ui/` (`?view=admin&tab=…`, `?view=ds&page=…`, `?specimen=…`) con 404 en producción.
- [ ] Baseline del admin y del DS con `ui-audit.js`: 10 tabs y 18 páginas × 2 temas.
- [ ] `scripts/qa/capture-ds.mjs` probado.
- [ ] Contenido: el email de ejemplo del DS pasa a **c.hickmann86@gmail.com** (y el LinkedIn real de `social.json`).

### Fase 1 — Fundación del DS · 1 sesión (MD-6, MD-2)
- [ ] El CSS del viewer (`ds-*`, ~35KB) sale de `portfolio.css` y va a `styles/design-system.css`, importado solo por el viewer. El sitio público baja un 22% de CSS. **Validación:** las vistas públicas quedan idénticas, sin regresión de contraste.
- [ ] `TokenTable`/`TokenSwatch` leen el valor **computado** de cada variable (`getComputedStyle`) y su descripción desde `design-tokens.json`, en vez de tablas escritas a mano. El contraste se calcula en vivo y muestra el ratio WCAG.
- [ ] Specs de componentes generadas desde los tokens de componente.
- **Fuera de alcance, documentado:** unificar `design-tokens.css` como 100% generado exige reescribir el generador de la skill de design-system. Se registra como deuda en el changelog.

### Fase 2 — Componentes base del admin · 1,5 sesiones (MA-6, MA-10)
React + CSS tokenizado en `app/admin/_components/ui/`:

| Componente | Resuelve |
|---|---|
| `Field` (input, textarea, select; label con `htmlFor`, hint, error bajo el campo, `aria-describedby`/`aria-invalid`) | AM-1, AM-8 |
| `Dropzone` (`<button>`, drag & drop real, estados arrastre/subiendo/error, preview con acciones **siempre visibles**) | AM-5, AM-6 |
| `ConfirmAction` (confirmación en línea, foco en Cancelar, ESC cancela) | AM-2 |
| `Sheet` (Radix Dialog lateral: ESC, trap, retorno, título; salida más rápida que la entrada) | AM-4 |
| `IconButton`, `StatusBadge` (tokens AA), `EmptyState` con acción, `ListItem`, `ListSkeleton` | AU-2, AU-6, AA-4, MA-13 |
| `useDirty` + `UnsavedBar` (barra fija "Cambios sin guardar · Descartar · Guardar") + guard de cambio de tab + `beforeunload` | AM-3 |

- [ ] `admin.css`: tokens v2.0.0 (`--fs-*` con piso de 12px, `--dur-*`/`--ease-*`, `--color-*`), anillo de foco, `@media (hover:hover)`, reduced-motion.

### Fase 3 — Riesgo de datos y formularios · 1 sesión (P0: MA-1 a MA-5)
- [ ] Login: `<form>`, label asociado, `autocomplete="current-password"`, error con `role="alert"`, logo real, mismo ThemeToggle.
- [ ] Blog: borrar con `ConfirmAction` (antes inmediato). Proyectos y Marcas usan el mismo componente.
- [ ] Todos los tabs con `Field`, validación al guardar (título obligatorio con mensaje) y `useDirty`.
- [ ] Panel de proyecto → `Sheet`. Dropzones unificados (Blog, Logo, Marcas, Proyectos, Perfil).

### Fase 4 — Navegación, feedback y migración de inline · 1,5 sesiones (MA-7 a MA-12)
- [ ] Navegación agrupada: **Contenido** (Hero, Proyectos, Blog) · **Perfil** (Perfil, Sobre mí, CV) · **Marca** (Logo, Marcas, Redes y footer) · **Sistema** (Design System). Sidebar en desktop y selector en mobile. `role="tablist"` con flechas, deep link `/admin?tab=…`, punto de "cambios sin guardar" en el ítem.
- [ ] Toast honesto: la pausa detiene el timer real, `role="status"`/`alert` según el tipo.
- [ ] Headings reales, íconos SVG (fuera emoji y glifos), estados vacíos con acción, skeletons.
- [ ] **219 estilos inline → 0** (salvo valores dinámicos reales, como el color de un swatch elegido).

### Fase 5 — Rediseño del viewer del DS · 2 sesiones (MD-1, MD-3, MD-4, MD-5, MD-7)
- [ ] Shell nuevo: sidebar agrupada con `aria-current`, buscador (Ctrl+K), deep link `?page=`, tabla de contenidos y toggle de tema por ejemplo.
- [ ] `UsageRule` ✓/✗ con ejemplo en vivo **para cada regla**. Las 91 `RuleChip` actuales se convierten y amplían, y no queda ninguna regla sin imagen.
- [ ] **Documentación orientada a diseñadores** (pedido del usuario, al estilo de Material Design y Carbon). Cada componente tiene pestañas, y la de código va al final, no al principio:
  - **Uso:** qué es, cuándo usarlo, **cuándo no** (con la alternativa), variantes y cuál elegir, comportamiento e interacciones, y reglas **✓ Correcto / ✗ Incorrecto con imagen** para cada caso.
  - **Estilo:** anatomía con partes numeradas y leyenda, **especificaciones con medidas** (redlines: alto, padding, radio, gap e ícono dibujados sobre el componente), estados lado a lado (reposo, hover, foco, presionado, deshabilitado, cargando, error), tokens usados con su valor en vivo, y claro/oscuro.
  - **Contenido:** guías de redacción del texto del componente (largo de etiquetas, verbos en botones, tono de errores), con ejemplos ✓/✗.
  - **Accesibilidad:** qué cubre el componente y qué tiene que hacer el diseñador (contraste medido, tamaño de target, foco y lectura en lector de pantalla).
  - **Código:** clases, props y snippet para desarrollo.
- [ ] Las páginas de Fundamentos (color, tipografía, espacio, motion, elevación) siguen el mismo enfoque: principios primero, después la escala, y al final "cómo aplicarlo" con ejemplos ✓/✗.
- [ ] La portada del DS pasa a ser una entrada para diseñadores: principios del sistema, cómo usar la documentación, novedades y estado de cada componente (estable o en revisión).
- [ ] Páginas nuevas:
  - **v2.0.0:** Escala tipográfica, Motion, Micro-interacciones (demo de cada una), CTA de cierre, CountUp, Skeleton, Formularios con validación, ThemeToggle, Modal Radix.
  - **Admin:** Field, Dropzone, Sheet, ConfirmAction, ListItem, StatusBadge, EmptyState, UnsavedBar, Navegación del panel, Toast.
- [ ] Patrones con capturas PNG en contexto (hero, bento, detalle, cierre, panel admin).
- [ ] Contenido real (Project Zero, c.hickmann86@gmail.com) y página **Changelog** desde `$meta`. 662 estilos inline → clases.

### Fase 6 — QA y entrega · 1 sesión
- [ ] `ui-audit.js` en los 10 tabs y en todas las páginas del DS × 2 temas: 0 fallas.
- [ ] Teclado completo del admin: tabs con flechas, Sheet, confirmaciones y foco visible.
- [ ] Lighthouse a11y en `/dev/ui` (admin y DS) y regresión del sitio público (a11y 100 se mantiene).
- [ ] Capturas regeneradas. `tsc`, lint sin errores nuevos, guardia del fondo 3D.
- [ ] DS v2.1.0 (JSON + changelog), `docs/progreso-admin-ds.md`.

## 5. Decisiones tomadas con criterio (reversibles)
- **Confirmación sin "Deshacer".** La skill pide confirmar antes de lo irreversible. Un "Deshacer" real implicaría retrasar el commit a GitHub, una complejidad de backend fuera del alcance de diseño.
- **Agrupación de la navegación** según §4 (Fase 4). "Footer" pasa a llamarse "Redes y footer".
- **La ruta dev `/dev/ui`** no existe en producción.

## 6. Riesgos
| Riesgo | Mitigación |
|---|---|
| Mover el CSS del DS rompe estilos públicos que comparten prefijo | Solo se mueven selectores `.ds-*`; se valida la regresión de las 6 vistas públicas antes de seguir |
| Romper guardados del admin | Las APIs no cambian; los formularios conservan el mismo payload; se valida el JSON enviado en el harness (interceptando `fetch`, sin enviar) |
| Fondo 3D | `check-terrain.sh` en cada paso |
