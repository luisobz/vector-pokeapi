### Tailwind CSS 4.3 vs 3.4 — Diferencias clave (Junio 2026)

#### 1. Instalación y Setup (Cambio mayor)

**v3.4**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**v4.3**:
```css
@import "tailwindcss";
```

- Ya no se usan las directivas `@tailwind`.
- Configuración principal ahora es **CSS-first** con `@theme`, `@plugin`, `@source`.
- Motor reescrito en **Rust (Oxide)** → builds 3.5x–8x más rápidos (full rebuild) y hasta 180x en incremental sin cambios.

#### 2. Configuración (Mayor cambio)

**v3.4**: `tailwind.config.js` (JavaScript)

**v4.3**:
```css
@theme {
  --color-primary: #0ea5e9;
  --font-sans: "Inter", system-ui, sans-serif;
  --radius-lg: 0.75rem;
}
```

- `tailwind.config.js` ya no es necesario en la mayoría de proyectos.
- Todo se define en CSS usando variables y `@theme`.

#### 3. Renombrados importantes (Utilities)

| v3.4 (Legacy)              | v4.3 (Canonical)            | Categoría      |
|---------------------------|-----------------------------|----------------|
| `bg-gradient-to-r`        | `bg-linear-to-r`            | Gradients      |
| `flex-shrink-0`           | `shrink-0`                  | Flexbox        |
| `flex-grow`               | `grow`                      | Flexbox        |
| `aspect-[16/9]`           | `aspect-video`              | Aspect         |
| `overflow-ellipsis`       | `text-ellipsis`             | Typography     |
| `decoration-clone`        | `box-decoration-clone`      | Decoration     |

#### 4. Nuevas utilidades en v4 (especialmente 4.3)

- **Scrollbars** (v4.3):
  - `scrollbar-thin`, `scrollbar-auto`, `scrollbar-none`
  - `scrollbar-thumb-*`, `scrollbar-track-*`
  - `scrollbar-gutter-*`

- **Container Queries**:
  - `@container-size` (v4.3)

- **Otras nuevas**:
  - `zoom-*`
  - `tab-*`
  - Mejores logical properties (`start`, `end`, `inset-*`, etc.)
  - Soporte nativo mejorado para `color-scheme`, `field-sizing`, `inert`, etc.

#### 5. Otras diferencias técnicas relevantes

- **Gradientes**: Ahora usa `linear-`, `radial-`, `conic-`.
- **Dark mode**: Más estable y nativo.
- **Build size**: CSS final más pequeño gracias a mejor tree-shaking y uso de Cascade Layers.
- **Plugins**: Nueva API basada en CSS (`@plugin`).
- **Soporte de navegadores**: Safari 16.4+, Chrome 111+, Firefox 128+.