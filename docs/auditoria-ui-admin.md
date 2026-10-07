# Auditoría de diseño — panel admin y Design System

Rama: `refinamiento-ui` · Fecha: 2026-10-07 · Alcance: `/admin` (login + 10 tabs) y el viewer del Design System (`components/portfolio/sections/design-system-section.tsx`, 18 páginas).

**Método.** Lectura completa de `app/admin/` (4.948 líneas, 15 archivos) y del viewer del DS (4.427 líneas), más métricas por grep. El login se midió en vivo con `scripts/qa/ui-audit.js` en claro y oscuro. Todo se cruzó con la skill **ui-ux-pro-max**: `--design-system` y los dominios `ux`, `style` y `typography`.

**Medición en vivo:** con la sesión iniciada por el usuario, se midieron los 9 tabs y las 18 páginas del DS en ambos temas (`scripts/qa/baseline-admin-2026-10-07.md`). Resultado: botones destructivos e inline entre 3.02 y 3.76:1, microcopia de 10–11px en todos los tabs, y en el DS entre 2 y 8 fallas de contraste y entre 4 y 11 textos < 12px **por página**.

**Sobre la recomendación de la skill.** `--design-system` (densidad 7, motion 3, variance 3) propuso el estilo **Minimalism & Swiss** ("Best for: dashboards, professional tools"), que **adopto** para el admin: es una herramienta de trabajo y la claridad le gana a la expresión. **Descarto** su paleta ("dark tech + status green") y su pareja Fira Code / Fira Sans, porque el admin debe compartir la identidad del sitio (DS v2.0.0) y no ser un producto aparte. También descarto el patrón "Real-Time / Operations Landing", que no aplica: es un CMS, no una landing.

---

## Resumen ejecutivo

El admin funciona y tiene buenas piezas: el toast tokenizado, el editor Tiptap, la confirmación en línea al borrar proyectos y las subidas con estado. Pero se construyó tab por tab sin una base común:

1. **Existe una librería de componentes (`admin.css`), pero los tabs la saltan.** Hay 219 estilos inline en el TSX y cada tab reinventa botones, listas, dropzones y badges.
2. **Accesibilidad de formularios rota de raíz:** 40 `<label>` y **0 `htmlFor`**. Ningún campo del admin tiene nombre accesible, empezando por la contraseña del login.
3. **Riesgos de pérdida de datos:** borrar una entrada del blog no pide confirmación y hace commit a GitHub. Ningún tab avisa de cambios sin guardar al cambiar de tab.
4. **Sin sistema de motion ni foco:** 0 reglas de `prefers-reduced-motion`, 2 de `:focus-visible`, 0 de `@media (hover:hover)`, y un tercer diseño de toggle de tema.
5. **El Design System no cumple su función de referencia:** las reglas de uso son 91 chips de texto ✓/✗ **sin imagen de referencia**, las especificaciones están escritas a mano y ya quedaron desfasadas con v2.0.0, no documenta ni un componente del propio admin salvo el toast, y su CSS (~35KB) se descarga en el sitio público.

| Severidad | Admin | DS |
|---|---|---|
| Alta | 9 | 5 |
| Media | 11 | 6 |
| Baja | 5 | 3 |

---

## A. Panel admin

### A.1 Diseño UI

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| AU-1 | **219 estilos inline** en el TSX del admin (logo-tab 46, brands-tab 35, blog-tab 30, project-form 30…). Hay componentes que existen en `admin.css` (`admin-btn-sm`, `admin-project-item`, `admin-empty`) y se reescriben inline con otros valores. | grep `style={{` | Alta |
| AU-2 | **Mismo componente, cinco versiones.** La fila de una lista es `.admin-project-item` en Proyectos y un grid inline en Blog. Los botones de acción son `.admin-btn-sm` en Proyectos y `<button style>` en Blog. El dropzone es distinto en Blog, Logo y Marcas. | projects-tab vs blog-tab | Alta |
| AU-3 | **Tab bar de 10 ítems sin agrupación**, en un orden que no sigue el del sitio (Perfil entre Hero y Sobre mí; Design System al mismo nivel que el contenido). "Footer" abre el tab de redes sociales (`SocialTab`): la etiqueta no dice lo que hay. | `TABS` en page.tsx | Media |
| AU-4 | **Sin deep link:** el tab activo es estado local. Recargar o compartir la URL siempre vuelve a Proyectos. | `useState<Tab>("proyectos")` | Media |
| AU-5 | **Login sin marca:** muestra "Project Zero" en texto con un punto, mientras el panel usa el logo real. | page.tsx | Baja |
| AU-6 | **Íconos emoji** (📂 en vacíos, ✦ como emoji por defecto de los proyectos) y glifos (✕, ↗, ←, ×) mezclados con SVG. | grep | Media |
| AU-7 | **Edición del blog en la misma pantalla que la lista.** El formulario va arriba y la lista abajo; al editar una entrada, el formulario cambia de contexto sin un panel propio, a diferencia de Proyectos, que usa un panel lateral. Son dos modelos de edición distintos. | blog-tab vs projects-tab | Media |
| AU-8 | **El toggle de tema del admin es invisible (bug previo, confirmado en vivo):** el CSS de `.theme-btn` se eliminó en el commit `c528f2f` y el botón quedó vacío y sin estilos. Desde entonces el admin no tiene un cambio de tema visible. Además es un **tercer toggle de tema** (`.theme-btn` con perilla), distinto del segmentado del sitio. `page.tsx` además aplica la clase `dark` por su cuenta, duplicando lo que ya hace el `ThemeProvider`. | page.tsx | Baja |

### A.2 Tipografía

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| AT-1 | **Microcopia bajo 12px:** el label del login a 11px (medido) y, en `admin.css`, 6 reglas a 11px, 2 a 10px y 1 a 9px. El badge "BORRADOR" va inline a 10px. | ui-audit + grep | Alta |
| AT-2 | **Sin escala:** `admin.css` usa 10 tamaños literales (9, 10, 11, 12, 12.5, 13, 14, 15, 26, 40px) y ninguno de los tokens `--fs-*` de v2.0.0. | grep | Media |
| AT-3 | **Jerarquía plana:** los títulos de sección (`admin-section-title`) y de card (`admin-card-title`) son `div`, no headings. Para un lector de pantalla, el panel no tiene estructura. | TSX | Media |

### A.3 Animaciones

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| AA-1 | **0 reglas de `prefers-reduced-motion`** en `admin.css`: el panel lateral, el toast, los spinners y los hovers animan siempre. | grep | Alta |
| AA-2 | **El toast no pausa de verdad:** el hover congela la barra de progreso, pero los timers de 3.8s y 4s siguen y el toast se cierra igual. La barra "miente". | admin-toast.tsx + page.tsx | Media |
| AA-3 | **Sin tokens de motion** en `admin.css`: duraciones y curvas literales; no usa `--dur-*` ni `--ease-*`. | grep | Media |
| AA-4 | **Cargas con spinner + texto** ("Cargando proyectos…") en todos los tabs, en vez de skeletons con la forma del contenido, que ya existen en el sitio público. | tabs | Baja |

### A.4 Micro-interacciones y feedback

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| AM-1 | **Labels sin asociar:** 40 `<label>` y 0 `htmlFor`. Ningún input tiene nombre accesible. En vivo: la contraseña del login no tiene label (`labels.length = 0`). | grep + ui-audit | Alta |
| AM-2 | **Borrar una entrada del blog no pide confirmación** y hace commit a GitHub (la entrada desaparece del sitio publicado). Proyectos sí confirma: el patrón destructivo es inconsistente. | blog-tab `handleDelete` | Alta |
| AM-3 | **Sin aviso de cambios sin guardar:** 0 tabs detectan cambios pendientes. Editar el Hero y pasar a otro tab descarta los cambios en silencio. *(Sin coincidencia en la base de la skill: es una recomendación propia.)* | grep dirty/beforeunload: 0 | Alta |
| AM-4 | **El panel de proyecto no es un diálogo:** no tiene `role="dialog"`, ESC, trap de foco ni retorno del foco (0 `role="dialog"` en todo el admin). El fondo se puede tabular con el panel abierto. | project-form | Alta |
| AM-5 | **Acciones solo con hover:** "Cambiar/Quitar" del thumbnail aparecen con `onMouseEnter` (6 hacks inline). Con teclado se enfocan botones invisibles; en touch no aparecen nunca. | project-form | Alta |
| AM-6 | **Promesa falsa de arrastrar:** el blog dice "Haz click o arrastra una imagen", pero no tiene handler de drop (solo Logo y Marcas lo tienen). El dropzone es un `<div onClick>` que no se puede usar con teclado. | blog-tab | Alta |
| AM-7 | **Login:** sin `<form>` (Enter manual), sin `autocomplete="current-password"`, de modo que los gestores de contraseñas no autocompletan. El error no se anuncia (`role="alert"`). | ui-audit en vivo | Media |
| AM-8 | **Guardar sin título no da feedback:** `handleSubmit` hace `return` si falta el título. Es el mismo bug que tenía el formulario de Contacto. | project-form | Media |
| AM-9 | **Foco:** solo 2 reglas `:focus-visible` en `admin.css`. Los botones y tabs inline caen al outline gris de Tailwind (que no se ve), salvo donde los cubre el anillo global v2.0.0. | grep | Media |
| AM-10 | **Contraste de estados inline (confirmado en vivo: "Eliminar" 3.3–3.76, botones inline 3.02):** "Eliminar" usa `#ef4444` sobre un tinte rojo (≈3.5:1) y "BORRADOR" `--warning` sobre un tinte ámbar a 10px. Ambos están escritos a mano y no usan los tokens AA de v2.0.0. | blog-tab | Media |
| AM-11 | **Tabs sin semántica:** no hay `role="tablist"`/`tab`/`aria-selected` ni navegación con flechas; son botones sueltos. | page.tsx | Media |
| AM-12 | **Sin `@media (hover:hover)`** en `admin.css`: los hovers quedan pegados en tablet. | grep | Baja |

---

## B. Design System (viewer + tokens)

| # | Hallazgo | Evidencia | Sev. |
|---|---|---|---|
| DS-1 | **Las reglas de uso no tienen imagen de referencia.** Son 91 `RuleChip` de texto (✓/✗), y una regla como "Dos botones primarios en la misma fila ✗" no muestra cómo se ve, ni bien ni mal. Es el requisito explícito del usuario. | `RuleChip` | Alta |
| DS-2 | **Especificaciones escritas a mano, ya desfasadas.** La tabla de Botones dice `btn-p` → fondo `var(--accent)` y 15px, cuando v2.0.0 usa `--color-btn-primary-bg`. Tipografía y Animaciones describen la escala vieja y el SplitText por carácter. No se generan desde `design-tokens.json`, así que cada cambio de token deja el DS mintiendo. | PageButtons, PageTypography, PageAnimaciones | Alta |
| DS-3 | **No documenta el admin:** de los ~70 componentes `admin-*`, solo el toast está en el DS. El panel, los inputs, los chips, el dropzone, la tab bar y el toggle no tienen especificación, y por eso cada tab los reinventa (AU-2). | grep `admin-` en el DS | Alta |
| DS-4 | **Faltan los componentes y patrones de v2.0.0:** escala tipográfica fluida, tokens de motion semánticos, CTA de cierre, contador ascendente, skeleton, validación por campo, magnético, cambio de tema y modal de perfil con Radix. | — | Alta |
| DS-5 | **El CSS del viewer (~35KB, 22% de `portfolio.css`) se descarga en el sitio público**, donde nunca se usa. | líneas 4759–6210 | Alta |
| DS-6 | **Contenido de ejemplo desactualizado o de otra marca:** `alejandro@astudio.cl` y `linkedin.com/in/alejandro` (A·Studio), y una navegación de ejemplo con "CV" (la sección ya no existe). | PageCards, PageNavigation | Media |
| DS-7 | **662 estilos inline** en el viewer, incluido texto de 9px (`fontSize: 9`). El propio documento del sistema rompe el principio *token o nada*. | grep | Media |
| DS-8 | **El Overview reporta métricas que no se verifican** ("120+ tokens", "18 páginas", "WCAG AA") escritas a mano. | PageOverview | Media |
| DS-9 | **Sin anatomía ni estados por componente:** la mayoría de las páginas muestran la variante en reposo; hover, foco, presionado, deshabilitado, cargando y error no aparecen lado a lado. | páginas de componentes | Media |
| DS-10 | **Sin buscador ni deep link por página:** el viewer guarda la página actual en estado, así que no se puede compartir el link a "Botones". | DS_GROUPS + estado | Media |
| DS-11 | **`design-tokens.css` ya no es reproducible:** regenerarlo desde el JSON borra las capas que se agregaron a mano (z-index, sombras dark y el bloque v2.0.0). Hay dos fuentes de verdad. | prueba de regeneración en la Fase 1 | Media |
| DS-12 | **Íconos de las reglas como glifos** (✓ ✗) y "✓ Copiado" en el botón de copiar código. | RuleChip, CodeBlock | Baja |
| DS-13 | **La navegación del DS no es accesible como lista de secciones** (no hay `aria-current` en la página activa, a confirmar en vivo). | — | Baja |
| DS-14 | **Sin changelog visible:** el historial de versiones vive en un string de 4.000 caracteres dentro de `$meta.changelog` del JSON. | design-tokens.json | Baja |

---

## C. Mejoras propuestas

### Admin — P0 (riesgo de datos y accesibilidad base)

- **MA-1 · Confirmación destructiva única** (AM-2). Un componente `ConfirmAction` en línea, el mismo patrón que ya usa Proyectos: botón "Eliminar" → "¿Eliminar? [Confirmar] [Cancelar]", con foco en Cancelar y ESC para cancelar. Se aplica a Proyectos, Blog, Marcas y Galería. Al eliminar, un toast con **"Deshacer"** durante 5s (el borrado real se hace al vencer el plazo).
- **MA-2 · Cambios sin guardar** (AM-3). Un hook `useDirty(form, saved)` por tab: marca el tab con un punto, muestra un aviso al intentar cambiar de tab ("Tienes cambios sin guardar · Guardar / Descartar / Seguir editando") y engancha `beforeunload`. Barra inferior fija con "Guardar" solo cuando hay cambios. *(Propuesta propia, sin coincidencia en la base de la skill.)*
- **MA-3 · Campos accesibles** (AM-1, AM-7, AM-8). Un componente `<Field label hint error>` que genera `id` + `htmlFor` + `aria-describedby`, valida al salir del campo y al guardar (el mismo modelo que Contacto) y muestra el error bajo el campo. Login dentro de `<form>`, con `autocomplete="current-password"` y error con `role="alert"`.
- **MA-4 · Panel lateral como diálogo** (AM-4). `@radix-ui/react-dialog` (ya en deps) con variante *sheet*: ESC, trap, retorno del foco, título accesible, salida más rápida que la entrada y reduced-motion.
- **MA-5 · Acciones visibles** (AM-5, AM-6). Controles de imagen siempre visibles bajo el preview (Cambiar · Quitar) y un `Dropzone` único que sea un `<button>`, acepte drag & drop de verdad, muestre estado de arrastre, progreso y error, y se use en Blog, Logo, Marcas, Proyectos y Perfil.

### Admin — P1 (sistema)

- **MA-6 · Admin sobre DS v2.0.0** (AU-1, AU-2, AT-1, AT-2, AA-3). Pasar `admin.css` a los tokens `--fs-*`, `--dur-*`, `--ease-*` y `--color-*` (piso de 12px) y migrar los 219 estilos inline a clases. Los componentes del admin quedan como componentes React reales, no como CSS suelto: `AdminCard`, `AdminListItem`, `IconButton`, `StatusBadge`, `Dropzone`, `Field`, `ConfirmAction`, `Sheet` y `EmptyState`.
- **MA-7 · Navegación del panel** (AU-3, AU-4, AM-11). La tab bar se convierte en una barra lateral con grupos: **Contenido** (Hero, Proyectos, Blog), **Perfil** (Perfil, Sobre mí, CV), **Marca** (Logo, Marcas, Redes y footer) y **Sistema** (Design System). En mobile pasa a selector superior. Deep link `/admin?tab=blog`, `role="tablist"` con flechas, y "Footer" se renombra "Redes y footer".
- **MA-8 · Un solo modelo de edición** (AU-7). Lista + panel lateral en todos los tabs que son colecciones (Proyectos, Blog, Marcas); formulario de página única en los singletons (Hero, Perfil, Sobre mí, CV, Logo, Redes).
- **MA-9 · Toast honesto** (AA-2). La pausa por hover y por foco detiene el timer real, no solo la barra. `role="status"` para éxito/info y `role="alert"` para errores. Acción opcional ("Deshacer", "Ver en el sitio").
- **MA-10 · Motion y foco del admin** (AA-1, AM-9, AM-12). Reduced-motion global, anillo de foco v2.0.0 en todos los controles, hovers bajo `@media (hover:hover)` y skeletons en las listas (AA-4).

### Admin — P2 (pulido)

- **MA-11 ·** Íconos SVG del set en vez de emoji y glifos (AU-6). Login con el logo real (AU-5). El mismo `ThemeToggle` del sitio, eliminando el aplicado duplicado de la clase (AU-8).
- **MA-12 ·** Headings reales (`h1` por tab, `h2` por card) (AT-3) y vista previa en vivo de lo editado ("Ver en el sitio" abre la sección exacta).
- **MA-13 ·** Estados vacíos con acción ("Aún no hay entradas · Crear la primera"), en vez de emoji + texto.

### Design System — refactor y rediseño

- **MD-1 · Cada regla con imagen de referencia** (DS-1). Reemplazar `RuleChip` por `UsageRule`, una tarjeta par **✓ Correcto / ✗ Incorrecto** donde cada lado muestra el componente real renderizado en esa situación, con el borde verde o rojo y una explicación de una línea. Se suman **capturas en contexto** del sitio real para los patrones (hero, bento, detalle), generadas por un script de `scripts/qa/` que se puede volver a correr. Las reglas sin imagen no se aceptan.
- **MD-2 · Especificaciones generadas desde los tokens** (DS-2, DS-8, DS-11). El viewer importa `design-tokens.json` y renderiza tablas de tokens, escalas, motion y contraste calculado (con su ratio WCAG) **desde el dato**. Al cambiar un token, el DS se actualiza solo. `design-tokens.css` vuelve a generarse 100% desde el JSON (las capas manuales se mueven al JSON) y `validate-tokens.cjs` pasa a ser un check.
- **MD-3 · Anatomía y estados por componente** (DS-9). Cada página trae anatomía con partes numeradas, una matriz de estados lado a lado (reposo, hover, foco, presionado, deshabilitado, cargando, error), tokens usados, accesibilidad y código.
- **MD-4 · Cobertura completa** (DS-3, DS-4). Nuevas páginas para **Admin** (Field, Dropzone, Sheet, ConfirmAction, ListItem, StatusBadge, EmptyState, navegación del panel, Toast) y **v2.0.0** (escala tipográfica, motion semántico, catálogo de micro-interacciones con demo en vivo, CTA de cierre, CountUp, Skeleton, validación de formularios, ThemeToggle, modal de perfil).
- **MD-5 · Rediseño del viewer** (DS-7, DS-10, DS-13). Layout de documentación con sidebar agrupada, buscador (Ctrl+K), deep link `/admin?tab=ds&page=buttons`, `aria-current`, tabla de contenidos por página, alternador claro/oscuro local para cada ejemplo y cero estilos inline.
- **MD-6 · CSS del DS fuera del sitio público** (DS-5). Mover los ~35KB de `ds-*` a `styles/design-system.css`, importado solo por el viewer. Ahorra el 22% de `portfolio.css` en cada visita.
- **MD-7 · Contenido real y changelog** (DS-6, DS-14). Datos de ejemplo de Project Zero (nada de A·Studio ni "CV") y una página de Changelog renderizada desde `$meta`, con una entrada por versión.

---

## D. Orden sugerido

1. **MA-1 a MA-5** (riesgo de datos y accesibilidad), con su validación en vivo.
2. **MD-2 y MD-6** (fundación del DS: tokens como fuente y CSS separado). Habilita todo lo demás del DS.
3. **MA-6** (componentes del admin sobre v2.0.0) en paralelo con **MD-3/MD-4**: cada componente que se crea para el admin entra al DS con sus reglas e imágenes.
4. **MA-7 a MA-10** y **MD-1/MD-5**.
5. P2 y QA final (Lighthouse en `/admin`).

**Decisiones que necesitan input:** el formato de las imágenes de referencia (ver MD-1: específicos en vivo + capturas en contexto, o solo una de las dos), el reagrupamiento de la navegación del panel (MA-7) y si el borrado con "Deshacer" reemplaza o complementa la confirmación (MA-1).
