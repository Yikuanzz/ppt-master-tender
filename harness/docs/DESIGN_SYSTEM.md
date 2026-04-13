# Design System: Minimalist Monochrome

**Harness Web UI 唯一视觉真源。** 实现时须将 token 映射到 Tailwind/CSS 变量；禁止引入彩色 accent、渐变、圆角或阴影（见下文「非目标」）。

---

## Design Philosophy

### Core Principle

**Reduction to Essence.** Minimalist Monochrome strips design down to its most fundamental elements: black, white, and typography. There are no accent colors to hide behind, no gradients to soften edges, no shadows to create false depth. Every design decision must stand on its own merit. This is design as discipline—where restraint becomes the ultimate form of expression.

### Visual Vibe

**Emotional Keywords**: Austere, Authoritative, Timeless, Editorial, Intellectual, Dramatic, Refined, Stark, Confident, Uncompromising

This is the visual language of:

- High-end fashion editorials (Vogue, Harper's Bazaar covers)
- Architectural monographs and museum catalogs
- Luxury brand identities (Chanel, Celine, Bottega Veneta)
- Award-winning book design and fine typography
- Gallery exhibition materials

The design commands respect through its confidence. It doesn't need color to be interesting—it uses scale, contrast, rhythm, and negative space to create visual drama.

### What This Design Is NOT

- Colorful or playful
- Soft, rounded, or friendly
- Gradient-based or with accent colors
- Shadow-heavy or "elevated"
- Generic or template-like
- Busy or cluttered
- Similar to "Minimalist Modern" (no blue accents, no gradients, no rounded corners)

### The DNA of Minimalist Monochrome

#### 1. Pure Black & White Palette

No grays for primary elements—use true black (`#000000`) and true white (`#FFFFFF`). Gray is reserved only for secondary text and borders. The stark contrast creates immediate visual impact and forces deliberate hierarchy decisions.

#### 2. Serif Typography as Hero

Unlike modern sans-serif minimalism, this style embraces classical serif typefaces. The serif adds sophistication, editorial weight, and timeless elegance. Typography isn't just content—it's the primary visual element.

#### 3. Oversized Type Scale

Headlines don't just inform—they dominate. Expect 8xl, 9xl, and custom larger sizes. Words become graphic elements. Single words or short phrases can fill entire viewport widths.

#### 4. Line-Based Visual System

Instead of filled shapes, shadows, or backgrounds, this design uses lines: hairlines, thick rules, borders, underlines, strikethroughs. Lines create structure without mass.

#### 5. Sharp Geometric Precision

Zero border radius everywhere. Perfect 90-degree corners. Precise alignments. The geometry is architectural—think Bauhaus meets editorial print design.

#### 6. Dramatic Negative Space

Whitespace isn't empty—it's active. Generous margins and padding create breathing room that makes the black elements more impactful. The page breathes.

#### 7. Inversion for Emphasis

Instead of accent colors, use color inversion (black background, white text) to highlight important elements. This creates drama without breaking the monochrome rule.

### Differentiation from Minimalist Modern

| Aspect | Minimalist Modern | Minimalist Monochrome |
|--------|-------------------|----------------------|
| Colors | Blue accent + gradients | Pure black & white only |
| Typography | Sans-serif (Inter) | Serif (Playfair Display) |
| Corners | Rounded (lg, xl, 2xl) | Sharp (0px everywhere) |
| Depth | Shadows, glows, elevation | Flat, 2D, no shadows |
| Visual elements | Gradient fills, colored icons | Lines, borders, typography |
| Vibe | Contemporary tech | Editorial luxury |
| Personality | Confident & approachable | Austere & commanding |

---

## Design Token System

### Colors (Strictly Monochrome)

| Token | Value | Usage |
|-------|-------|--------|
| `background` | `#FFFFFF` | Pure white |
| `foreground` | `#000000` | Pure black |
| `muted` | `#F5F5F5` | Off-white for subtle backgrounds |
| `mutedForeground` | `#525252` | Dark gray for secondary text |
| `accent` | `#000000` | Black IS the accent |
| `accentForeground` | `#FFFFFF` | White on black |
| `border` | `#000000` | Black borders |
| `borderLight` | `#E5E5E5` | Light gray for subtle dividers |
| `card` | `#FFFFFF` | White cards |
| `cardForeground` | `#000000` | Black text |
| `ring` | `#000000` | Black focus rings |

**Rule**: No other colors. Ever. The palette is absolute.

### Typography

**Font Stack**:

- **Display / Headlines**: `"Playfair Display", Georgia, serif` — elegant, high-contrast serif with beautiful italics
- **Body**: `"Source Serif 4", Georgia, serif` — highly readable serif for long-form text
- **Mono / Labels**: `"JetBrains Mono", monospace` — dates, metadata, technical details

**Type Scale** (dramatic range):

| Step | Size | Usage |
|------|------|--------|
| xs | 0.75rem (12px) | Fine print, metadata |
| sm | 0.875rem (14px) | Captions, labels |
| base | 1rem (16px) | Body text minimum |
| lg | 1.125rem (18px) | Body text preferred |
| xl | 1.25rem (20px) | Lead paragraphs |
| 2xl | 1.5rem (24px) | Section intros |
| 3xl | 2rem (32px) | Subheadings |
| 4xl | 2.5rem (40px) | Section titles |
| 5xl | 3.5rem (56px) | Page titles |
| 6xl | 4.5rem (72px) | Hero subheadings |
| 7xl | 6rem (96px) | Hero headlines |
| 8xl | 8rem (128px) | Display headlines |
| 9xl | 10rem (160px) | Oversized statements |

**Tracking & Leading**:

- Headlines: `tracking-tight` (-0.025em) or `tracking-tighter` (-0.05em)
- Body: `tracking-normal` (0)
- Small caps / Labels: `tracking-widest` (0.1em)
- Line heights: `leading-none` (1) for display, `leading-relaxed` (1.625) for body

### Border Radius

**ALL VALUES: `0px`.** No exceptions.

### Borders & Lines

| Name | Spec |
|------|------|
| hairline | 1px solid `#E5E5E5` — subtle dividers |
| thin | 1px solid `#000000` — standard borders |
| medium | 2px solid `#000000` — emphasis borders |
| thick | 4px solid `#000000` — heavy rules, section dividers |
| ultra | 8px solid `#000000` — maximum impact |

**Usage**: horizontal rules between sections (thick or ultra); vertical dividers (thin); card borders (thin or medium); link underlines (thin, on hover).

### Shadows

**NONE.** Depth via inversion, border weight, scale contrast, negative space.

### Textures & Patterns

Apply strategically so the UI is not flat.

**Primary: horizontal lines (global)**

```css
background-image: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 1px,
  #000 1px,
  #000 2px
);
background-size: 100% 4px;
opacity: 0.015;
```

**Secondary: grid (editorial sections)**

```css
background-image:
  linear-gradient(#00000008 1px, transparent 1px),
  linear-gradient(90deg, #00000008 1px, transparent 1px);
background-size: 40px 40px;
opacity: 0.015;
```

**Diagonal lines (process / timeline)**

```css
background-image: repeating-linear-gradient(
  45deg,
  transparent,
  transparent 40px,
  #00000008 40px,
  #00000008 42px
);
opacity: 0.01;
```

**Noise (paper-like)**

```css
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
opacity: 0.02;
```

**Inverted sections (dark bg)**: use white-based line textures or subtle radial highlights; keep opacity very low (see original spec for Stats / CTA variants).

---

## Component Stylings

### Buttons

**Primary**: bg `#000000`, text `#FFFFFF`, no border, padding generous (`px-8 py-4`), uppercase + `tracking-widest` + `font-medium` + `text-sm`. Hover: invert (white bg, black text, black border). Transition instant or ≤100ms.

**Secondary / Outline**: transparent bg, black text, `2px solid #000000` border; hover fill black, text white.

**Ghost**: transparent, black text, no border; underline on hover.

All rectangular; optional arrow (→) on CTAs.

### Cards / Containers

**Standard**: white bg, `1px solid #000000`, padding `p-6` or `p-8`, no shadow, no radius.

**Inverted**: black bg, white text, no border; use sparingly.

**Borderless**: no border/background; separate with whitespace or horizontal rules.

### Inputs

White bg, `2px solid #000000` (full or bottom-only), no radius, placeholder `#525252` italic. Focus: border thickens to 3–4px. Focus ring: black, use `focus-visible` patterns in Accessibility section—not colored halos.

---

## Layout Strategy

- **Container**: max-width ~72rem (1152px); horizontal padding `px-6 md:px-8 lg:px-12`
- **Section spacing**: vertical `py-24 md:py-32 lg:py-40`; major sections separated by thick (4px or 8px black) horizontal rules
- **Grid**: CSS Grid; 12-column mental model; strong vertical rhythm

---

## Effects & Animation

**Motion**: minimal and instant (0–100ms). Binary state changes. No bounce, parallax, slow easing, gradient animations.

**Hover** (examples):

- Cards / features: full inversion (`hover:bg-foreground hover:text-background`) ~100ms
- Links: underline appearance
- Optional image treatments: border thickens, subtle scale + grayscale removal (only if product includes image-heavy views; keep monochrome)

**Focus**: see Accessibility; always `focus-visible` where applicable.

---

## Iconography

Outlined, thin stroke (1–1.5). Black only (`#000000`). Prefer Lucide at `strokeWidth={1.5}`, size 20–24.

---

## Responsive Strategy

- Keep sharp corners and strict palette on all breakpoints
- Reduce display scale on small screens (e.g. 9xl → 5xl) without losing «editorial drama»
- Stack columns; full-width rules; maintain generous vertical spacing

---

## Accessibility

- Contrast: black on white is AAA-friendly
- **Buttons / primary controls**: `outline: 3px solid #000000`, `outline-offset: 3px`, `focus-visible`
- **Inputs**: border thickens 2px → 4px on focus; avoid relying on color-only cues
- **Touch targets**: minimum 44×44px on mobile
- **Skip link**: visible, high-contrast at top

---

## Bold Choices (Non-Negotiable for Marketing-Quality UI)

1. At least one display headline at 8xl+ (9xl on desktop where appropriate)
2. Thick rules + small bordered «punctuation» blocks where it fits the product chrome
3. Inverted sections for emphasis (stats, CTA) with subtle line texture
4. No accent colors
5. Heavy horizontal rules between major sections
6. Pull quotes: large italic serif + oversized quotation marks when testimonials exist
7. Sharp everything: **0px radius globally**
8. Instant interactions (≤100ms)
9. Typography as graphic elements
10. Layered subtle textures (not flat white boxes)
11. Hover inversions on dense feature grids
12. Any image modules: border weight + monochrome discipline

---

## What Success Looks Like

Should feel like: a fashion editorial, gallery catalog, or luxury print site.

Should **not** feel like: a generic SaaS landing page, «startup minimal», or «Minimalist Modern with color stripped out».

---

## Repository Note

Root [`index.html`](../../index.html) is **not** a reference for Harness. Harness UI must follow this document only.
