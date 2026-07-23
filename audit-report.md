# Auditoría de código — project-zero-2026

Fecha: 2026-07-23
Alcance: código de aplicación (`app/`, `components/`, `hooks/`, `lib/`, `styles/`, `data/`). Se excluyen `.claude/skills/*` (assets del plugin de Claude Code, no son parte del producto) y `node_modules`.

---

## 0. Cambios aplicados (rama `audit-cleanup`)

Con luz verde para actuar con criterio propio, se aplicó todo lo que quedaba en la sección 7 como "seguro" o donde el análisis adicional bajó el riesgo lo suficiente:

- Borrados los 4 archivos huérfanos (`project-panel.tsx`, `sections/cv-section.tsx`, `sections/index.ts`, `styles/globals.css`).
- Quitada la dependencia `autoprefixer`.
- `next` → `16.2.11`, `postcss` → `8.5.22` (dentro del rango ya declarado). Vulnerabilidades: 28 → 3, y las 3 restantes son internas al propio bundle de Next (`next>postcss`), no controlables desde este repo.
- Instalado y configurado ESLint (`eslint.config.mjs` con `eslint-config-next`) — el script `lint` estaba roto (ni el paquete estaba instalado). Corriéndolo por primera vez salieron 25 errores reales y 38 warnings; quedó en **0 errores**:
  - 13 errores mecánicos (`react/no-unescaped-entities`, `react/jsx-no-comment-textnodes`) corregidos escapando comillas/envolviendo el comentario.
  - 10 errores de `react-hooks/set-state-in-effect` (la nueva regla de React 19 que marca `setState` síncrono dentro de un effect): 3 eran redundantes de verdad (`setLoading(true)` repitiendo lo que ya hacía `useState(true)`, en `logo-tab.tsx`/`social-tab.tsx` ×2) y se borraron sin más. Los otros 7 son patrones deliberados (init de tema desde localStorage antes del primer paint, lectura de sessionStorage sin flash, medición de DOM para la píldora del navbar, reset de paginación al cambiar filtros) — se dejaron el código intacto y se agregó `eslint-disable-next-line` puntual con el motivo en cada uno, en vez de refactorizarlos a ciegas sin tests que confirmen que no se rompió nada.
  - Quedan 37 warnings (`@next/next/no-img-element`, `react-hooks/exhaustive-deps`) sin tocar — no bloquean el build ni el lint.
- `loading="lazy"` agregado a los 15 `<img>` que están claramente fuera del primer viewport (grillas de proyectos/blog, galerías, previews del admin). Se dejaron eager a propósito: logos de navbar (×3 archivos), la imagen activa del lightbox, la foto del modal de perfil, la imagen hero de home y de detalle de proyecto, y la portada del post de blog — todas son contenido above-the-fold o el elemento central de un overlay ya abierto.
- Deduplicado `lib/github-data.ts` (`commitToGitHub`/`commitBinaryToGitHub` → helper interno `putToGitHub` compartido).
- Nuevo `lib/admin-json.ts` con `readJsonFile`/`writeJsonAndCommit`, y los 7 endpoints de un solo archivo JSON (`about`, `cv`, `hero`, `footer`, `social`, `logo`, `profile`) reescritos para usarlo. **Importante:** al leer los 7 con cuidado encontré que no son un único patrón sino tres (con/sin defaults, con/sin `_githubWarning` en la respuesta, whitelist de campos en `profile`) — así que no se armó un factory único que los generalizara a todos (hubiera sido más config que código, y con riesgo real de cambiar alguna respuesta sin querer). Se extrajo solo lo que era 100% idéntico en los siete: el `try/catch` de lectura y el `writeFileSync` + commit a GitHub con warning. La forma de la respuesta de cada endpoint quedó exactamente igual que antes.
- **No tocado, a propósito:** `images.unoptimized: true` en `next.config.mjs` (decisión de infra, no de código — ver punto 2 de la sección 6), y la duplicación en `design-system-section.tsx`/`admin.css` (documentación interna, bajo valor). Tampoco se migró ningún `<img>` a `next/image` — con `unoptimized: true` no hay ganancia real de hacerlo todavía.
- Build, lint y `tsc --noUnusedLocals` corren limpios después de todos los cambios. Todo el trabajo está en la rama `audit-cleanup`, sin pushear ni mergear a `main`.

---

## 1. Reconocimiento inicial

| | |
|---|---|
| Framework | Next.js 16.2.0 (App Router, Turbopack) |
| Lenguaje | TypeScript 5.7.3, `strict: true` |
| UI | React 19, Tailwind CSS v4, Radix UI (`react-dialog`) |
| Gestor de paquetes | pnpm 10.x (`pnpm-lock.yaml`) |
| Deploy | Railway (`railway.json`, `pnpm start`) |
| Persistencia de contenido | Archivos JSON en `data/` + commit automático a GitHub vía API (`lib/github-data.ts`), sin base de datos |

**Estructura principal / entry points:**
- `app/layout.tsx`, `app/page.tsx` — sitio público (portafolio).
- `app/admin/page.tsx` — panel admin (pestañas cargadas con `next/dynamic`).
- `app/api/admin/**/route.ts` — 12 endpoints REST para el CMS casero.
- `app/blog/**`, `app/projects/[id]/**` — rutas públicas adicionales.
- `components/portfolio/` — UI del sitio público.
- `lib/`, `hooks/` — data fetching, contexto de tema, utilidades.

**Tests:** no existen (`*.test.*`/`*.spec.*`: 0 archivos, sin Jest/Vitest/Playwright instalado). No hay línea base de tests que romper, pero tampoco red de seguridad para las eliminaciones que se aprueben.

**Baseline — build:** ✅ `pnpm build` compila limpio (TypeScript incluido), genera las 18 rutas sin errores ni warnings.

**Baseline — lint:** ❌ `pnpm lint` falla inmediatamente: el script corre `eslint .` pero **`eslint` no está instalado** (no está en `node_modules/.bin`, no está en `package.json`) y **no existe ningún archivo de configuración de ESLint** en el repo. El linteo no ha estado corriendo realmente — es un hallazgo en sí mismo, no una herramienta que pude usar para el resto de la auditoría.

---

## 2. Metodología y una nota importante sobre falsos positivos

Herramientas usadas: **knip** (dead code + deps, con su plugin de Next.js), **ts-prune** (cross-check de exports), **depcheck** (cross-check de dependencias), **jscpd** (duplicación), **`tsc --noUnusedLocals --noUnusedParameters`** (imports/variables/parámetros no usados), **`pnpm audit`** (vulnerabilidades). Todo cruzado con lectura manual del código antes de reportar cualquier hallazgo como confirmado.

Vale la pena documentar esto porque confirma la advertencia que pediste sobre no confiar en búsqueda de texto: corrí `ts-prune` sin configuración específica de Next.js y devolvió ~60 "exports no usados" que en realidad son **falsos positivos** — cada `default` export de `page.tsx`/`layout.tsx`, cada `GET/POST/PUT/DELETE` de un `route.ts`, y `metadata`/`viewport`, los consume el router de archivos de Next.js por convención de filesystem, no por import estático, así que una herramienta TS genérica no los puede ver como "usados". **knip sí tiene un plugin de Next.js que entiende esta convención** y los filtró correctamente — por eso es la fuente principal de la tabla de abajo, con ts-prune y grep manual como confirmación, no como fuente primaria.

---

## 3. Código muerto y no utilizado

### Archivos completos huérfanos

| Archivo | Líneas | Qué es | Confianza | Evidencia |
|---|---|---|---|---|
| `components/portfolio/project-panel.tsx` | 111 | Componente `ProjectPanel` (panel deslizante de detalle de proyecto) | **Alta** | knip + ts-prune + `grep -rn "ProjectPanel"` en todo el repo → cero referencias fuera del propio archivo. Muy probablemente quedó huérfano cuando el detalle de proyecto pasó a ser una ruta completa (`app/projects/[id]/` + `project-detail-view.tsx`) |
| `components/portfolio/sections/cv-section.tsx` | 84 | Componente `CVSection` | **Alta** | Solo lo referencia el barrel muerto `sections/index.ts` (ver abajo). Ningún componente vivo hace `import { CVSection }` |
| `components/portfolio/sections/index.ts` | 6 | Barrel/re-export de todas las secciones | **Alta** | `grep` de `from "./sections"` / `from "@/components/portfolio/sections"` en todo el repo → 0 resultados. Todos los imports reales apuntan directo al archivo de cada sección (`./sections/hero-section`, etc.), no al barrel |
| `styles/globals.css` | 125 | Copia de los tokens/reset globales | **Alta** | **Idéntico byte a byte** (`diff` sin salida) a `app/globals.css`, que es el que realmente importa `app/layout.tsx:4` (`import "./globals.css"`). `styles/globals.css` no tiene ni un solo import en el repo — parece un remanente de cuando el archivo vivía en `styles/` antes de moverse a `app/` |

**Nota aparte (fuera de alcance de producto):** knip también marcó como "no usados" 4 scripts `.cjs` dentro de `.claude/skills/brand/` y `.claude/skills/design-system/`, y `.claude/skills/threejs-webgl-1.0.0/assets/starter_scene/main.js`. Son archivos de ejemplo/utilidad de plugins de Claude Code, no código de tu aplicación — los excluyo de las recomendaciones de borrado porque no me corresponde tocarlos.

### Exports, imports, variables y parámetros no usados

**Ninguno encontrado.** `tsc --noEmit --noUnusedLocals --noUnusedParameters` corrió limpio (exit code 0) sobre todo el proyecto, y knip reportó 0 exports no usados fuera de los 4 archivos ya listados arriba. Buena señal de higiene general del código.

### Rutas/endpoints no referenciados

Ninguno. Los 12 endpoints en `app/api/admin/**` los consume el panel admin (`app/admin/_components/*-tab.tsx`), y las páginas públicas (`/`, `/blog`, `/blog/[slug]`, `/projects/[id]`) están todas enlazadas desde la navegación activa.

---

## 4. Dependencias

| Paquete | Ubicación | Problema | Confianza | Acción sugerida |
|---|---|---|---|---|
| `autoprefixer` | `dependencies` (debería ser `devDependencies` si se mantuviera) | No usado — `postcss.config.mjs` solo lista `'@tailwindcss/postcss'` en `plugins`; Tailwind v4 ya autoprefixa internamente (Lightning CSS), así que este paquete nunca se ejecuta | **Alta** — confirmado por knip + depcheck + lectura manual de `postcss.config.mjs` | Seguro eliminar de `package.json` |
| `eslint` | — (no está instalado) | El script `lint` lo invoca pero no existe ni el paquete ni un archivo de config | **Alta** | Requiere decisión tuya: o se instala + configura (`eslint.config.mjs` con `eslint-config-next`), o se retira el script `lint` de `package.json` para dejar de aparentar que existe |

**Dependencias duplicadas resolviendo el mismo problema:** ninguna encontrada (una sola librería de animación — `animejs` —, una sola de utilidades CSS — `clsx`/`tailwind-merge`, que son complementarias no duplicadas —, sin librerías de fechas ni de estado).

**Falsos positivos descartados** (los reportó `depcheck` pero son incorrectos — no los incluyo en la tabla): `@tailwindcss/postcss`, `postcss`, `tailwindcss`, `tw-animate-css` y `typescript` como "no usados". `depcheck` no entiende `@import` de CSS (Tailwind y tw-animate-css se cargan así en `app/globals.css`) ni que TypeScript compila todo el proyecto vía `tsconfig.json` sin un `import` explícito. Verificado manualmente que los cuatro están activos.

### Vulnerabilidades (`pnpm audit`)

**28 vulnerabilidades: 15 altas, 11 moderadas, 2 bajas** — todas originadas en 2 paquetes:

| Paquete | Instalada | Necesita | Vía |
|---|---|---|---|
| `next` | 16.2.0 (pin exacto en `package.json`, sin `^`) | `>=16.2.11` | Directa — trae varios CVEs de Next.js (bypass de middleware, DoS en optimización de imágenes SVG, exposición de endpoints de Server Functions, cache poisoning) |
| `sharp` | 0.34.5 | `>=0.35.0` | Transitiva de `next` — se resuelve sola al actualizar Next |
| `postcss` | 8.5.6 (resuelto desde `^8.5` en devDependencies) | `>=8.5.10`/`>=8.5.12` | Directa — XSS y exposición de `sourceMappingURL`; el rango `^8.5` ya declarado en `package.json` permite el fix, solo falta refrescar el lockfile |

Ninguna requiere un cambio de major/breaking a priori: `next` sube de patch/minor dentro de la v16, y `postcss` ya está dentro del rango declarado. Aun así, cualquier bump de Next conviene probarlo (build + revisión visual) antes de deployar, dado el trabajo reciente en el hero WebGL.

---

## 5. Duplicación y oportunidades de refactor

`jscpd` sobre `app/`, `components/`, `hooks/`, `lib/`: **23 clones, 2.36% de líneas duplicadas** (319 de 13.510) — bajo en términos absolutos, pero con un clúster que vale la pena resolver:

| Clúster | Archivos | Duplicación | Refactor sugerido |
|---|---|---|---|
| **A. CRUD JSON de rutas admin** | `app/api/admin/{about,cv,hero}/route.ts` (idénticos salvo el nombre de archivo/label), `footer`↔`social`, `footer`↔`logo`, `projects`↔`projects/[id]` | ~150 líneas repetidas entre 8 archivos — mismo patrón `read()` + `GET` + auth-check + `writeFileSync` + `commitToGitHub` + try/catch | Extraer un factory `createJsonAdminRoute(name: string)` en `lib/` que devuelva `{ GET, PUT }`. Reduce el riesgo de que un fix (ej. manejo de errores) se aplique en una ruta y se olvide en las otras 7 |
| **B. `lib/github-data.ts`** | `commitToGitHub` (líneas 7-37) vs `commitBinaryToGitHub` (líneas 39-67) | ~90% idénticas — mismo flujo GET-sha→PUT, solo cambia cómo se codifica el contenido | Extraer un `putToGitHub(apiUrl, headers, branch, contentBase64, message)` compartido |
| **C. Componentes de tabs admin** | `about-tab.tsx`↔`profile-tab.tsx` (34 líneas), `about-tab.tsx`↔`cv-tab.tsx`/`hero-tab.tsx` (21 líneas c/u), `profile-tab.tsx`↔`social-tab.tsx` (14 líneas), `blog-tab.tsx`↔`brands-tab.tsx` (9 líneas) | Mismo patrón de campo de subida de imagen / fila de formulario repetido | Extraer un `<ImageUploadField>` o `<FormRow>` compartido en `app/admin/_components/` |
| D. `design-system-section.tsx` (auto-duplicación interna) | Mismo archivo, varios bloques de 9-12 líneas | ~1.9% del archivo (3.876 líneas) | **Baja prioridad** — es la página interna de documentación del design system, no lógica de producto. No lo tocaría en esta ronda |
| E. `app/admin/admin.css` (auto-duplicación) | Mismo archivo, 10 líneas | Cosmético | Baja prioridad |

---

## 6. Oportunidades de optimización de rendimiento

Priorizadas por impacto estimado vs esfuerzo:

| # | Hallazgo | Impacto | Esfuerzo | Auto-aplicable |
|---|---|---|---|---|
| 1 | **`loading="lazy"` ausente en `<img>`** — de las 31 etiquetas `<img>` en todo el repo (grillas de proyectos, blog, galería, marcas, avatares), **solo 1** (`app/blog/[slug]/page.tsx:43`) usa `loading="lazy"`. Las otras 30 cargan siempre eager, incluidas imágenes muy por debajo del fold (galería completa de un proyecto, grid de blog, etc.) | **Alto** — menos bytes transferidos y mejor LCP en mobile, que es justo lo que veníamos optimizando | **Bajo** | Sí (excepto las imágenes ya visibles en el primer viewport — hero/thumbnail principal —, donde `loading="lazy"` sería contraproducente) |
| 2 | **`images.unoptimized: true` en `next.config.mjs`** — desactiva toda la pipeline de Next Image (compresión, conversión a AVIF/WebP, resize responsive) para **todo el sitio**, no solo donde se usa `<img>` en vez de `next/image` | **Alto** | **Medio** | **No** — requiere revisión manual. Probablemente es deliberado por el deploy en Railway (self-hosted, sin la infra de imágenes de Vercel); revertirlo sin confirmar que `sharp` corre bien en el contenedor de Railway, y sin medir el costo de CPU extra en el server, podría romper el deploy. Documentar la decisión, no auto-aplicar |
| 3 | **Extraer el CRUD admin duplicado** (ver Duplicación A) | Medio | Medio | Revisión manual (no es solo estilo — toca 8 endpoints con auth) |
| 4 | **Eliminar los 4 archivos huérfanos** (sección 3) | Bajo (Next.js ya no los incluye en el bundle si nadie los importa — no hay ganancia de performance real) pero reduce superficie de mantenimiento | Bajo | Sí, una vez que apruebes la tabla de código muerto |
| 5 | *(Ya optimizado, sin acción)* — `animejs` solo se usa en `hero-section.tsx` y ya está detrás de `import("animejs/lib/anime.es.js")` dinámico; las pestañas del panel admin (incluido el pesado `design-system-section.tsx`, 3.876 líneas) ya usan `next/dynamic({ ssr:false })` — confirmado que ese componente sale en su propio chunk separado (~1.4 MB sin minificar en dev) y no viaja en el bundle del sitio público | — | — | — |

**Lo que no pude medir:** el tamaño de bundle de producción por ruta. `next build` con Turbopack (el compilador que usa este proyecto en Next 16) no imprime la tabla de "First Load JS" que sí muestra el compilador Webpack clásico, y no instalé `@next/bundle-analyzer` porque hubiera requerido tocar `next.config.mjs` — algo que pediste no hacer todavía. Si lo quieres, lo agrego en una pasada aparte, específicamente para eso.

**Assets estáticos:** `public/uploads` (2.0 MB) e `imagenes/logo` (1.7 MB) son los más pesados, pero son contenido subido vía admin, no bundle de la app — su optimización real depende del punto 2 (`images.unoptimized`), no de un cambio de código aislado.

---

## 7. Resumen para decidir

**Seguro de aplicar automáticamente, bajo riesgo:**
- Borrar `project-panel.tsx`, `cv-section.tsx`, `sections/index.ts`, `styles/globals.css`.
- Quitar `autoprefixer` de `package.json`.
- Actualizar `postcss` dentro del rango ya declarado (`pnpm update postcss`).
- Agregar `loading="lazy"` a los `<img>` fuera del primer viewport.

**Requiere tu decisión antes de tocar nada:**
- Qué hacer con el script `lint` roto (instalar+configurar ESLint, o quitarlo).
- Actualizar `next` a `>=16.2.11` (recomendado por seguridad, pero probarlo antes de deployar).
- Si revisar/cambiar `images.unoptimized: true` dado el hosting en Railway.
- Si vale la pena el refactor del CRUD admin duplicado (cluster A) ahora o más adelante.

Decime qué de esto apruebas y lo aplico.
