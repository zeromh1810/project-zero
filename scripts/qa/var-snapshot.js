/* Foto de los valores computados de las variables del :root/.dark de portfolio.css. Uso: await __varSnap() */
window.__VAR_NAMES = '--accent,--accent-h,--bg,--bg2,--bg3,--bg4,--border,--border-h,--card,--card-hover,--content-sheet,--content-sheet-rgb,--error,--glass,--glass-blur-lg,--glass-blur-md,--glass-blur-sm,--glass-blur-xl,--glass-blur-xs,--glass-hover,--highlight,--highlight-bg,--navbar-bg,--portfolio-font,--portfolio-heading-font,--r-2xl,--r-full,--r-lg,--r-md,--r-sm,--r-xl,--shadow,--shadow-2xl,--shadow-accent,--shadow-focus,--shadow-lg,--shadow-md,--shadow-sm,--shadow-up,--shadow-xl,--shadow-xs,--space-1,--space-10,--space-12,--space-14,--space-16,--space-2,--space-20,--space-24,--space-3,--space-4,--space-5,--space-6,--space-7,--space-8,--success,--txt,--txt2,--txt3,--warning,--z-base,--z-content,--z-dropdown,--z-emergency,--z-modal,--z-navigation,--z-notification,--z-raised,--z-sticky'.split(',');
window.__varSnap = async () => {
  const read = () => Object.fromEntries(__VAR_NAMES.map((n) => [n, getComputedStyle(document.documentElement).getPropertyValue(n).trim()]))
  const root = document.documentElement, wasDark = root.classList.contains("dark")
  root.classList.remove("dark"); root.classList.add("light"); const light = read()
  root.classList.add("dark"); root.classList.remove("light"); const dark = read()
  root.classList.toggle("dark", wasDark); root.classList.toggle("light", !wasDark)
  return { light, dark }
}
