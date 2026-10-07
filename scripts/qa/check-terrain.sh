#!/usr/bin/env sh
# Guardia del fondo 3D: falla si cambió el shader o la lógica de scroll del
# terreno en hero-section.tsx. El fondo 3D NO se toca en refinamiento-ui.
cd "$(dirname "$0")/../.." || exit 1
sha256sum -c scripts/qa/.terrain.sha256 --quiet || { echo "✗ hero-terrain.ts cambió"; exit 1; }
for line in \
  'terrain.style.filter  = blur' \
  'terrain.style.opacity = `${(1 - pBlur).toFixed(3)}`' \
  'const pBlur = Math.max(0, Math.min(1, (y - vh * 0.3) / (vh * 0.6)))' \
  'const blur  = `blur(${(pBlur * 18).toFixed(1)}px)`' \
  'terrainCleanupRef.current = buildHeroTerrain(' \
  'className="hero-terrain-container"'
do
  grep -qF "$line" components/portfolio/sections/hero-section.tsx || { echo "✗ falta en hero-section.tsx: $line"; exit 1; }
done
echo "✓ fondo 3D intacto"
awk '/^\.hero-terrain-container \{/,/^\}/' styles/portfolio.css | diff -q - scripts/qa/.terrain-css.txt >/dev/null \
  || { echo "✗ cambió el CSS de .hero-terrain-container"; exit 1; }
echo "✓ CSS del terreno intacto"
