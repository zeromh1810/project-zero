# AdminToast — Documentación del componente

**Versión DS:** v1.3.0  
**Componente:** `app/admin/_components/admin-toast.tsx`  
**Estilos:** `app/admin/admin.css` (sección `/* ── TOAST V2 ── */`)  
**Tokens:** `assets/design-tokens.json` → `component.admin-toast`  
**CSS vars:** `assets/design-tokens.css` (bloque `--admin-toast-*`)

---

## Descripción

Toast de notificación glassmorphism para el panel de administración. Soporta cuatro estados semánticos, barra de progreso auto-dismiss, pausa al hover y accesibilidad ARIA. Todas las propiedades visuales están tokenizadas en el Design System.

---

## Estados / Tipos

| Tipo       | Label        | Color acento              | Token DS                        | Uso                                 |
|------------|--------------|---------------------------|---------------------------------|-------------------------------------|
| `success`  | Éxito        | `#30d158` (Apple green)   | `--admin-toast-accent-success`  | Guardado exitoso, operación OK      |
| `error`    | Error        | `#ef4444` (Red 500)       | `--admin-toast-accent-error`    | Fallo de API, validación, error     |
| `warning`  | Advertencia  | `#f59e0b` (Amber 500)     | `--admin-toast-accent-warning`  | Acción potencialmente destructiva   |
| `info`     | Información  | `#0062cc` / `#2997ff` dark| `--admin-toast-accent-info`     | Confirmación neutral, aviso         |

---

## API del componente

```tsx
import AdminToast, { type ToastType } from "@/app/admin/_components/admin-toast"

<AdminToast
  type="success"          // "success" | "error" | "warning" | "info"
  title="Proyecto guardado"
  message="Los cambios se aplicaron correctamente."  // opcional
  onClose={closeToast}
  isLeaving={toastLeaving}  // boolean — activa animación de salida
/>
```

### Props

| Prop        | Tipo        | Requerido | Descripción                                         |
|-------------|-------------|-----------|-----------------------------------------------------|
| `type`      | `ToastType` | ✓         | Estado semántico del toast                          |
| `title`     | `string`    | ✓         | Mensaje principal (Plus Jakarta Sans 700, 14px)     |
| `message`   | `string`    | —         | Detalle opcional (DM Sans, 13px)                    |
| `onClose`   | `() => void`| ✓         | Callback al cerrar con botón X o al vencer el timer |
| `isLeaving` | `boolean`   | —         | Aplica animación de salida antes del unmount        |

---

## Uso en el admin panel

El estado se gestiona directamente en `app/admin/page.tsx` con `useState` y `useRef`.

```tsx
// Estado
const [toast, setToast]         = useState<ToastState>(null)
const [toastLeaving, setToastLeaving] = useState(false)
const leavingTimer = useRef<ReturnType<typeof setTimeout>>()
const dismissTimer = useRef<ReturnType<typeof setTimeout>>()

type ToastState = { title: string; msg?: string; type: ToastType } | null

// Mostrar
function showToast(title: string, type: ToastType, msg?: string) {
  clearTimeout(leavingTimer.current)
  clearTimeout(dismissTimer.current)
  setToast({ title, type, msg })
  setToastLeaving(false)
  leavingTimer.current = setTimeout(() => setToastLeaving(true), 3800)
  dismissTimer.current = setTimeout(() => { setToast(null); setToastLeaving(false) }, 4000)
}

// Cerrar manualmente (botón X)
function closeToast() {
  clearTimeout(leavingTimer.current)
  clearTimeout(dismissTimer.current)
  setToastLeaving(true)
  dismissTimer.current = setTimeout(() => { setToast(null); setToastLeaving(false) }, 200)
}

// Render
{toast && (
  <AdminToast
    type={toast.type}
    title={toast.title}
    message={toast.msg}
    onClose={closeToast}
    isLeaving={toastLeaving}
  />
)}
```

### Pasar showToast a tabs

```tsx
// Tipo del prop en los tabs
interface TabProps {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

// Desde page.tsx
<HeroTab onToast={showToast} />

// Dentro del tab
onToast("Cambios guardados", "success", "El hero se actualizó correctamente.")
onToast("Error al guardar", "error", error.message)
onToast("Sin cambios", "info")
```

---

## Comportamiento y timing

| Evento                  | Timing    | Descripción                                           |
|-------------------------|-----------|-------------------------------------------------------|
| Entrada (mount)         | 300ms     | `toastSlideUp` — sube 16px con spring easing          |
| Auto-dismiss (inicio)   | t+3800ms  | Se activa `isLeaving=true`                            |
| Salida animación         | 200ms     | `toastSlideDown` — baja 16px con ease-in              |
| Auto-dismiss (unmount)  | t+4000ms  | `setToast(null)`                                      |
| Pausa barra progreso    | hover     | `animation-play-state: paused` en `__bar`             |
| Cierre manual           | inmediato | Inicia salida 200ms, luego unmount                    |

---

## Design Tokens

Todos los valores visuales están en `assets/design-tokens.json → component.admin-toast` y generados en `assets/design-tokens.css`.

### Estructura y posición

| Token CSS                   | Valor         | Descripción                          |
|-----------------------------|---------------|--------------------------------------|
| `--admin-toast-radius`      | `16px`        | border-radius                        |
| `--admin-toast-min-width`   | `320px`       | Ancho mínimo                         |
| `--admin-toast-max-width`   | `420px`       | Ancho máximo                         |
| `--admin-toast-bottom`      | `28px`        | Posición desde borde inferior        |
| `--admin-toast-right`       | `28px`        | Posición desde borde derecho         |
| `--admin-toast-z-index`     | `600`         | Sobre modales (z 500) y nav (z 100)  |

### Espaciado interno

| Token CSS                   | Valor  | Descripción                       |
|-----------------------------|--------|-----------------------------------|
| `--admin-toast-px`          | `20px` | Padding horizontal                |
| `--admin-toast-pt`          | `16px` | Padding top                       |
| `--admin-toast-pb`          | `19px` | Padding bottom (16 + 3 para barra)|
| `--admin-toast-gap`         | `12px` | Gap entre icono, cuerpo y botón X |

### Visual / glassmorphism

| Token CSS                   | Valor (light)                              | Valor (dark)                               |
|-----------------------------|--------------------------------------------|--------------------------------------------|
| `--admin-toast-bg`          | `rgba(255,255,255,0.88)`                   | `rgba(20,20,22,0.90)`                      |
| `--admin-toast-border`      | `rgba(0,0,0,0.07)`                         | `rgba(255,255,255,0.09)`                   |
| `--admin-toast-blur`        | `12px`                                     | `12px`                                     |
| `--admin-toast-shadow`      | `0 8px 32px rgba(0,0,0,0.13), ...`         | `0 8px 32px rgba(0,0,0,0.50), ...`         |

### Barra de acento (izquierda)

| Token CSS                     | Valor  | Descripción                          |
|-------------------------------|--------|--------------------------------------|
| `--admin-toast-accent-bar-w`  | `3px`  | Ancho de la barra de acento lateral  |

### Barra de progreso (bottom)

| Token CSS                     | Valor  | Descripción                              |
|-------------------------------|--------|------------------------------------------|
| `--admin-toast-bar-h`         | `3px`  | Altura                                   |
| `--admin-toast-bar-opacity`   | `0.4`  | Opacidad sobre el color de acento        |
| `--admin-toast-bar-duration`  | `4s`   | Duración hasta auto-dismiss              |

### Tipografía

| Token CSS                      | Valor  | Descripción                          |
|--------------------------------|--------|--------------------------------------|
| `--admin-toast-title-size`     | `14px` | Título — Plus Jakarta Sans           |
| `--admin-toast-title-weight`   | `700`  | Peso del título                      |
| `--admin-toast-msg-size`       | `13px` | Mensaje opcional — DM Sans           |

### Iconografía

| Token CSS                      | Valor  | Descripción                          |
|--------------------------------|--------|--------------------------------------|
| `--admin-toast-icon-size`      | `20px` | SVG 20×20                            |
| `--admin-toast-icon-stroke`    | `1.75` | strokeWidth                          |

### Botón cerrar

| Token CSS                      | Valor  | Descripción                          |
|--------------------------------|--------|--------------------------------------|
| `--admin-toast-close-size`     | `24px` | Hit area (ancho y alto)              |
| `--admin-toast-close-radius`   | `6px`  | border-radius proporcional a 24×24   |

### Animaciones

| Token CSS                      | Valor                                          |
|--------------------------------|------------------------------------------------|
| `--admin-toast-anim-enter`     | `toastSlideUp 300ms cubic-bezier(0.16,1,0.3,1) both` |
| `--admin-toast-anim-exit`      | `toastSlideDown 200ms ease-in forwards`        |

### Colores de acento por estado

| Token CSS                        | Valor (light) | Valor (dark) | Estado     |
|----------------------------------|---------------|--------------|------------|
| `--admin-toast-accent-success`   | `#30d158`     | `#30d158`    | success    |
| `--admin-toast-accent-warning`   | `#f59e0b`     | `#f59e0b`    | warning    |
| `--admin-toast-accent-error`     | `#ef4444`     | `#ef4444`    | error      |
| `--admin-toast-accent-info`      | `#0062cc`     | `#2997ff`    | info       |

Los colores de acento se mapean a `semantic.color.success/warning/error/accent` para mantener coherencia con el resto del sistema.

---

## Clases CSS

| Clase                        | Descripción                                               |
|------------------------------|-----------------------------------------------------------|
| `.admin-toast-v2`            | Contenedor principal (fixed, glassmorphism)               |
| `.admin-toast-v2--{type}`    | Modifier de estado — define `--toast-accent`              |
| `.admin-toast-v2.leaving`    | Activa animación de salida                                |
| `.admin-toast-v2__icon`      | Icono SVG, color = `--toast-accent`                       |
| `.admin-toast-v2__body`      | Contenedor columna título + mensaje                       |
| `.admin-toast-v2__title`     | Título principal                                          |
| `.admin-toast-v2__msg`       | Mensaje secundario opcional                               |
| `.admin-toast-v2__close`     | Botón X cierre manual                                     |
| `.admin-toast-v2__bar`       | Barra de progreso auto-dismiss (bottom)                   |
| `.admin-toast-v2__bar.paused`| Pausa la animación de progreso (onMouseEnter)             |

---

## Accesibilidad

- `role="alert"` en el contenedor — anuncia el toast a screen readers
- `aria-live="polite"` — no interrumpe la navegación activa
- `aria-label="{LABEL}: {title}"` — contexto completo (ej. "Éxito: Proyecto guardado")
- `aria-label="Cerrar notificación"` en el botón X
- `aria-hidden="true"` en todos los SVG (decorativos)
- Toque mínimo 24×24px en botón X (cercano al mínimo WCAG 44px recomendado para áreas críticas)

---

## Consideraciones de diseño

**¿Por qué 14px en el título y no `--primitive-fontSize-base` (15px)?**  
La UI del admin es densa. 14px mantiene jerarquía clara entre título y mensaje (13px) sin aumentar la altura del componente.

**¿Por qué `close-radius` = 6px y no `--primitive-radius-sm` (8px)?**  
En un botón de 24×24px, 8px de radio es visualmente redondo en exceso. 6px mantiene proporción correcta.

**¿Por qué `bar-opacity` = 0.4?**  
La barra usa el mismo color de acento del estado. A opacidad 1 compite con la barra lateral. 0.4 la hace legible sin distraer.

**¿Por qué `pb` = 19px y no 16px?**  
La barra de progreso (3px) está posicionada `absolute bottom:0`. 3px extra de padding evita que el contenido quede debajo de la barra.
