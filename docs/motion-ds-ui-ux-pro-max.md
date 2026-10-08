# Motion del Zero design system — trazabilidad con ui-ux-pro-max

Fecha: 2026-10-07 · Alcance: la página `/design-system` (y el mismo viewer dentro del admin).
Pedido: rehacer animaciones, transiciones y micro-interacciones del DS **guiadas por la skill en cada decisión**.

## Fuentes consultadas en la skill
- `references/quick-reference.md`: §2 Touch & Interaction y §7 Animation completos, §9 Navigation (reglas de transición).
- Búsquedas `--domain ux`: `scroll reveal animation`, `page transition navigation`, `tab switch indicator`, `copy clipboard feedback`, `search filter results`, `hover card feedback`, `skeleton loading image`.
- Búsquedas `--domain gsap` (como referencia de **tiempos y curvas**; el proyecto no usa GSAP): `tab underline indicator slide`, `button press scale`, `scroll triggered reveal`.
- `--design-system "design system documentation developer tool" --motion 4` (sin `--persist`): nivel de motion **Standard**, preset Stagger List y su *Pre-Delivery Checklist*.

## Qué se cambió respecto de la versión anterior (y por qué)
| Antes | Ahora | Regla de la skill |
|---|---|---|
| Cambio de página/pestaña: la anterior salía y **después** entraba la nueva (160ms bloqueado) | **Fade through**: la nueva se monta al instante; la anterior se desvanece rápido (160ms página / 100ms pestaña) y recién entonces aparece la nueva con dirección | `no-blocking-animation`; ver corrección abajo |
| Sin dirección | Página adelante entra desde abajo y atrás desde arriba; pestaña siguiente desde la derecha y anterior desde la izquierda | `navigation-direction`, `hierarchy-motion` |
| Página: 240/160ms | 480ms de entrada después de 160ms de salida (`--dur-reveal` / `--dur-hover`) | preset GSAP Page Transition 400–600ms + `exit-faster-than-enter` |
| `replaceState`: Atrás salía del DS | Historial real (`pushState`), Atrás vuelve a la página anterior y **restaura su scroll** | `back-behavior`, `state-preservation` |
| Barra activa estática (`::before`) en la nav y borde en la pestaña | Un indicador que se **desliza** entre ítems (solo `transform`) | `continuity`, `nav-state-active`, `transform-performance` |
| Revelado ligado al scroll (scrub) | Disparado al cruzar el 90% del viewport, 360ms (`--dur-reveal-sm` nuevo), 12px, curva suave, se revierte al quedar debajo; las grillas en cascada, máx. 8 | preset Scroll Reveal (300–400ms, 8–16px, `power1.out`, `top 90%`, `play none none reverse`, ≤8 hijos), `opacity-threshold` (el scrub dejaba texto a opacidad parcial) |
| Contenido oculto con CSS aunque no hubiera JS | Solo se oculta si `useReveal` puso `data-reveal`; sin JS o con movimiento reducido todo está visible | preset Scroll Reveal: "no invisible-by-default sin fallback" |
| Cascada del encabezado (eyebrow → título → resumen → pestañas), barra lateral deslizándose al cargar, «pop» de insignias | Eliminados: la página entra como un solo bloque | `excessive-motion` (1–2 elementos clave por vista), `motion-meaning` |
| Pestañas anidadas animaban junto con la página | `appear={false}`: no animan su primer montaje | `excessive-motion` |
| Hover de tarjeta 3px | −1.5px, 160ms, ease-out | preset Hover Micro-interaction (<2px, 150–200ms) |
| Sin feedback al presionar | Escala 0.98 al instante, vuelve con resorte | `press-feedback`, `scale-feedback` (0.95–1.05), `spring-physics` |
| Copiar: solo cambio de texto; si fallaba, nada | Estado en el mismo botón, pulso háptico corto al confirmar, respaldo si la API falla y "No se pudo copiar" si igual falla | Copy feedback → *Haptic Feedback* (solo confirmaciones), `error-feedback` |
| Búsqueda sin resultados: "Sin resultados" | Mensaje + sugerencias de páginas que navegan | *No Results* ("Show 'No results' with suggestions") |
| Capturas: aparecían de golpe | Esqueleto estable con `aria-busy` y fundido al cargar | *Loading Indicators* (estable, con estado accesible), *Continuous Animation* (el brillo continuo solo durante la carga) |
| Retardo de toque en móvil | `touch-action: manipulation` | `tap-delay` |
| Selector móvil sin `cursor: pointer` | Con pointer | checklist: `cursor-pointer` en todo lo clickable |

Se mantienen (ya cumplían): foco al título de la página nueva (`focus-on-route-change`), transiciones interrumpibles y sin depender de `animationend` (`interruptible`, `cancellable-state-transitions`), solo opacity/transform (`layout-shift-avoid`), tokens compartidos (`motion-consistency`), `prefers-reduced-motion`.

## Corrección tras la revisión del usuario (crossfade → fade through)
La primera versión aplicó `fade-crossfade` literalmente: las dos páginas visibles a la vez, la saliente encima. Con dos páginas de texto distintas, el resultado era **texto superpuesto e ilegible** a mitad de la transición (captura del usuario). La regla de la skill viene de Material Design, donde el crossfade es para reemplazar contenido **relacionado**. Para contenido distinto, Material usa **fade through**: la saliente se va rápido y recién entonces entra la nueva, sin superposición.
- Implementado en `styles/motion.css` (`.m-xfade`) y `lib/motion.ts` (`Crossfade`). La entrante se monta al instante (`no-blocking-animation` se mantiene) y su opacidad espera la salida. El retraso va en la clase de la entrante (`is-after`), no depende de que la saliente siga en el DOM: no cambia a mitad de la animación.
- Verificado frame a frame (`overlaptest`): 0 frames con las dos vistas visibles. Página: sale en ~190ms y entra de ~200 a ~500ms. Pestaña: sale en ~110ms y entra de ~120 a ~260ms.
- `--dur-exit-lg` quedó sin uso en el DS; se conserva como token para salidas de vistas grandes que no compitan con otra vista.

## Lo que la skill recomendó y NO se aplicó
- **Estilo, paleta y tipografía del `--design-system`** (Dark Mode OLED, JetBrains Mono + IBM Plex Sans, acento verde): la marca y el DS existentes son la fuente de verdad (regla del proyecto). Solo se tomó la parte de motion y el checklist.
- **GSAP**: se usaron sus presets como referencia de duración, distancia y curva; la implementación es CSS + `lib/motion.ts`, sin dependencias nuevas.
- **`back.out` / sobreoscilación en grillas**: la propia skill lo desaconseja en UI informativa. El resorte (`--ease-spring`) queda solo para los indicadores finos y el rebote al soltar.
- **`scroll-behavior: smooth` global**: rompería el salto instantáneo al cambiar de página; el scroll suave se usa donde aplica (al cambiar de pestaña con el panel fuera de vista).

## Verificación
- 41 pruebas por CDP, cada una etiquetada con su regla (`dsmotiontest`), con y sin movimiento reducido: 41/41.
- Checklist de la skill a 375 / 768 / 1024 / 1440px: sin scroll horizontal y todo lo clickable con pointer.
- Lighthouse en `/design-system` (inicio, movimiento, botón): a11y 100 · best practices 100 · CLS 0.

## Fuera de alcance (pendiente de decisión)
El cambio de sección del **admin** sigue con `Switch` (salida de 160ms y después la entrada, con la nueva sección montada recién al terminar). Pasarlo al mismo fade through del DS haría que la nueva sección se monte al instante.
