# Baseline QA — admin + DS (2026-10-07, antes de implementar)

Medido en vivo con sesión iniciada por el usuario (`ui-audit.js`, claro + oscuro).

## Admin (9 tabs de contenido)
| Tab | Contraste < AA | Texto < 12px | Sin foco visible |
|---|---|---|---|
| Proyectos | admin-btn-sm "Eliminar" 3.76 | nav-badge 10 | — |
| Hero | — | nav-badge 10, admin-label 11 | editor Tiptap |
| Perfil | — | label 11, hint 11, code 11 | — |
| Sobre mí | "Quitar foto" 3.76 | label 11, hint 11, kpi-col-label 10 | Tiptap, chip-input, input |
| CV | (inline) "Descargar PDF" 3.02 | label 11, hint 11 | — |
| Logo | (inline) "Cambiar" 3.02 · btn-p deshabilitado 2.2–2.6* | label 11, hint 11, div/button 11 | — |
| Footer | btn-p deshabilitado 2.57* | label 11, span 11, hint 11 | — |
| Marcas | (inline) "Agregar otro logo" 3.02 · (inline) "Eliminar" 3.3 · btn-p deshabilitado* | div 11, hint 11 | — |
| Blog | (inline) "Eliminar" 3.3 | label 11, span 11, hint 11 | 3 controles |

\* Controles deshabilitados: WCAG 1.4.3 los exime, pero se rediseñan para que se lean como deshabilitados sin depender solo de la opacidad.

## DS viewer (18 páginas)
Todas: `ds-nav-group-label` 3.14 (claro) / 3.62 (oscuro). Fallas por página (contraste / < 12px): Overview 2/8 · Colores 2/6 · Tipografía 2/7 · Modo Oscuro 2/6 · Primitivos 2/6 · Animaciones 4/9 · Breakpoints 8/11 · Botones 5/4 · Tarjetas 2/5 · Formularios 5/7 · Navegación 2/7 · Badges 4/7 · Toast 3/9 · Modales 2/7 · Layouts 2/6 · Detalle 2/7 · Brands 4/8 · Blog 2/7.
