# Project Zero — Brand Guidelines

## Identity

**Studio Name:** Project Zero  
**Author:** Carlos Felipe Rojas Hickmann  
**Role:** Product Designer & Frontend Developer  
**Location:** Santiago, Chile  
**Experience:** 5+ años · 40+ proyectos  

## Mission

Diseño de experiencias digitales que equilibran estética refinada con funcionalidad real. Cada producto nace de la tensión entre simplicidad y profundidad.

## Voice

- **Tono:** Directo, confiado, sin grandilocuencia
- **Voz:** Primera persona. Habla de resultados verificables, no de promesas
- **Anti-patrones:** Nunca "apasionado por", nunca "soluciones innovadoras", nunca emojis como decoración

## Color System

### Primary — Blue Apple
Derivado de la paleta Apple Human Interface Guidelines. Comunica precisión técnica y confianza.

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--accent` | `#0062cc` | `#2997ff` | CTAs, links, accent primario |
| `--accent-h` | `#1a7fd4` | `#5ac8fa` | Hover states |

### Success — Green
| Token | Valor | Uso |
|-------|-------|-----|
| `--success` | `#30d158` | Disponibilidad, resultados positivos |

### Neutrals — Near Black / Off White
Escala de grises con temperatura ligeramente fría (HSL ~240°).

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--txt` | `#1d1d1f` | `#f5f5f7` | Texto principal |
| `--txt2` | `#3a3a40` | `#b0b0b5` | Texto secundario |
| `--txt3` | `#5e5e64` | `#8e8e93` | Labels, placeholders |
| `--bg` | `#f8f8f8` | `#000000` | Fondo principal |
| `--bg2` | `#ffffff` | `#0a0a0a` | Fondo elevado |
| `--bg3` | `#f0f0f0` | `#141414` | Fondo deprimido |

## Typography

### Typefaces
| Rol | Fuente | Peso(s) |
|-----|--------|---------|
| Headings | Plus Jakarta Sans | 700, 800 |
| Body / UI | DM Sans | 400, 500, 600 |

### Scale
Tokens en `design-tokens.json > primitive.fontSize`. Variables CSS en `design-tokens.css`.

| Token JSON | CSS var | px | Uso |
|------------|---------|-----|-----|
| `primitive.fontSize.xs` | `--primitive-fontSize-xs` | 11px | Labels uppercase, stat labels |
| `primitive.fontSize.sm` | `--primitive-fontSize-sm` | 13px | Skill tags, metadata, blog-tag |
| `primitive.fontSize.base` | `--primitive-fontSize-base` | 15px | Body, botones |
| `primitive.fontSize.md` | `--primitive-fontSize-md` | 16px | Bio text, form inputs |
| `primitive.fontSize.lg` | `--primitive-fontSize-lg` | 17px | Blog post content |
| `primitive.fontSize.xl` | `--primitive-fontSize-xl` | 20px | — |
| `primitive.fontSize.2xl` | `--primitive-fontSize-2xl` | 22px | Related posts title |
| `primitive.fontSize.3xl` | `--primitive-fontSize-3xl` | 28px | Stat numbers |
| *(clamp, CSS only)* | — | clamp(52px,7.5vw,100px) | Hero title |
| *(clamp, CSS only)* | — | clamp(28px,4vw,44px) | Section titles (.s-title) |

### Line Heights
| Token | Valor | Uso |
|-------|-------|-----|
| `--lh-tight` | 1.1 | Titulares grandes |
| `--lh-snug` | 1.25 | Subtítulos |
| `--lh-normal` | 1.5 | UI labels |
| `--lh-relaxed` | 1.65 | Subtítulos de sección |
| `--lh-loose` | 1.8 | Texto largo (bio) |

## Spacing System
Base 8dp. Múltiplos de 8 para ritmo visual consistente.  
Tokens en `design-tokens.json > primitive.spacing`. Variables CSS: `--primitive-spacing-{n}`.

| Token JSON | CSS var | px | Uso |
|------------|---------|-----|-----|
| `primitive.spacing.1` | `--primitive-spacing-1` | 4px | Micro gaps, badge-pulse |
| `primitive.spacing.2` | `--primitive-spacing-2` | 8px | Gaps internos, gap botones |
| `primitive.spacing.3` | `--primitive-spacing-3` | 12px | Gaps de componentes |
| `primitive.spacing.4` | `--primitive-spacing-4` | 16px | Padding estándar, social-padding |
| `primitive.spacing.5` | `--primitive-spacing-5` | 20px | Padding cómodo, toast px |
| `primitive.spacing.6` | `--primitive-spacing-6` | 24px | Padding generoso |
| `primitive.spacing.8` | `--primitive-spacing-8` | 32px | Form card padding, modal padding |
| `primitive.spacing.10` | `--primitive-spacing-10` | 40px | Padding de cards |
| `primitive.spacing.12` | `--primitive-spacing-12` | 48px | Section heading gap (.s-head) |
| `primitive.spacing.14` | `--primitive-spacing-14` | 56px | Related posts padding-top |
| `primitive.spacing.16` | `--primitive-spacing-16` | 64px | Related posts margin-top, gap secciones |
| `primitive.spacing.20` | `--primitive-spacing-20` | 80px | Padding vertical sección |
| `primitive.spacing.24` | `--primitive-spacing-24` | 96px | Offset navbar |

## Border Radius
| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 8px | Nav items, tags |
| `--radius-md` | 12px | Form inputs |
| `--radius-lg` | 16px | Stats cards, KPI boxes |
| `--radius-xl` | 20px | Project cards |
| `--radius-2xl` | 24px | Form cards, photo |
| `--radius-full` | 9999px | Pills, badges |

## Motion
Curvas de easing estilo Apple (spring-like).

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas, expansiones |
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Botones, hover |
| `--ease-snap` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Pop animations |
| `--dur-instant` | `80ms` | Tilt cards |
| `--dur-fast` | `160ms` | Transiciones de sección |
| `--dur-normal` | `200ms` | Hover estados |
| `--dur-slow` | `300ms` | Overlays |
| `--dur-entrance` | `650ms` | Entradas scroll |

## Component Specs

### Navbar
- Height: 64px · Blur: 48px · Saturate: 180%
- Background: semitransparente con `var(--navbar-bg)`

### Buttons
- Primary (`.btn-p`): accent fill · pill radius · 15px · 500w
- Secondary (`.btn-g`): border · transparent bg · pill radius · 15px · 500w
- Min touch target: 44px height

### Project Cards (bento)
- Featured: span 2 · 16/10 ratio · gradient + info overlay
- Compact: span 1 · stretch height · minimal overlay
- Corner radius: 20px · 3D tilt on hover

### Form
- Floating labels · focus ring accent · 12px radius inputs
- Submit button: full width · pill · accent fill
