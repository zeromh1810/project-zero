"use client"

import { DsShell } from "@/components/design-system/ds-shell"

// v2.1.0 — El viewer del Design System vive en components/design-system/
// (documentación para diseñadores: Uso · Estilo · Contenido · Accesibilidad ·
// Código, con ejemplos ✓/✗ de componentes reales). Se mantiene esta
// exportación porque es la que usa el admin.
export function DesignSystemSection({ adminMode }: { adminMode?: boolean }) {
  return <DsShell adminMode={adminMode} />
}
