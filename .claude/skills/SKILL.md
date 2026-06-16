---
name: ui-design-system
description: Enforces WaterOS design system rules — typography scale, 8px spacing grid, color tokens, component patterns, and anti-generic-AI aesthetic guidelines.
---

# WaterOS UI Design System Skill

When building or modifying any UI in this project, strictly follow these rules.

---

## Typography Scale

Use only these sizes. No arbitrary values.

| Token | Size | Usage |
|---|---|---|
| `text-xs` | 11px | Labels, captions, badges |
| `text-sm` | 13px | Body secondary, metadata |
| `text-base` | 15px | Body primary |
| `text-lg` | 17px | Card titles, section labels |
| `text-xl` | 20px | Page subtitles |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero numbers, stats |
| `text-4xl` | 36px | Hero headings |

Font families:
- Headings, numbers, labels: `font-family: var(--font-heading)` (Outfit)
- Body, descriptions, metadata: `font-family: var(--font-body)` (Manrope)

Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold). Nothing else.

---

## Spacing System — 8px Base Grid

Every margin, padding, gap must be a multiple of 8px. Use Tailwind spacing tokens:

| Token | Value |
|---|---|
| `p-1` / `gap-1` | 4px (half-unit, use sparingly) |
| `p-2` / `gap-2` | 8px |
| `p-3` / `gap-3` | 12px |
| `p-4` / `gap-4` | 16px |
| `p-5` / `gap-5` | 20px |
| `p-6` / `gap-6` | 24px |
| `p-8` / `gap-8` | 32px |
| `p-10` / `gap-10` | 40px |
| `p-12` / `gap-12` | 48px |

Never use arbitrary values like `p-[13px]` or `mt-[7px]`.

---

## Color Tokens

Always use tokens from `frontend/src/theme/tokens.ts`. Never hardcode hex values.

### Primary palette
```ts
colors.cyan          // #22D3EE — primary accent, interactive elements
colors.aqua          // #4DE8E6 — highlights, hover states
colors.electricBlue  // #3B82F6 — info, links
colors.teal          // #2DD4BF — secondary accent
colors.seafoam       // #5EEAD4 — soft accent
```

### Semantic
```ts
colors.success  // #34D8A6 — healthy, active, ok
colors.warning  // #FBBF24 — degraded, low battery, caution
colors.danger   // #FB7185 — critical, error, offline
colors.info     // #60A5FA — informational
```

### Text
```ts
colors.textPrimary    // #F4FBFF — headings, primary content
colors.textSecondary  // rgba(244,251,255,0.68) — body text
colors.textTertiary   // rgba(244,251,255,0.42) — labels, placeholders
colors.textInverse    // #03142E — text on light/colored backgrounds
```

### Surfaces
```ts
colors.glassFill        // rgba(255,255,255,0.08) — card backgrounds
colors.glassFillStrong  // rgba(255,255,255,0.14) — hover state surfaces
colors.glassBorder      // rgba(255,255,255,0.18) — borders
colors.deepNavy         // #03142E — page background
colors.abyss            // #01040F — deepest background
```

---

## Component Patterns

### Buttons
- Primary: gradient background (`gradients.aquaGlow`), `LiquidButton` component, `border-radius: 999px`
- Secondary: glass surface, border `glassBorder`, no fill
- Danger: `colors.danger` tint border + text
- All buttons: min height 44px, horizontal padding 24px, `font-semibold`, `var(--font-heading)`
- States: hover → `glassFillStrong` + `translateY(-1px)`, active → `scale(0.97)`, disabled → `opacity-40`

### Cards
- Always use `GlassSurface` component as the wrapper
- Inner padding: `p-4` (16px) minimum, `p-5` (20px) for content cards
- Gap between card elements: `gap-3` (12px) or `gap-4` (16px)
- Never use plain `div` with manual background for cards
- Hover: `interactive` prop on `GlassSurface` handles lift + border brighten

### Forms
- Inputs: `GlassInput` component only
- Label above input, gap `gap-2` between label and input
- Error message below input in `colors.danger`, `text-xs`
- Form sections separated by `gap-6` (24px)
- Submit button full-width on mobile, auto-width on desktop

### Section headers
- Use `SectionHeader` component
- Page title: `text-2xl font-bold` + subtitle `text-sm` below in `textSecondary`
- Section title inside a card: `text-sm font-semibold` in `textTertiary` uppercase

### Status indicators
- Active: `colors.success` dot (8px circle)
- Warning: `colors.warning` dot
- Offline / error: `colors.danger` dot
- Use `StatusPill` component for pill-style badges

---

## Anti-Generic-AI Aesthetic Rules

These are what separate a real product from an AI-generated template. Enforce all of them.

1. **No white backgrounds** — this is a dark ocean theme. Every surface is glass over deep navy. Never use `bg-white`, `bg-gray-*`, or light mode patterns.

2. **No flat bold color blocks** — buttons and cards are never solid flat colors. They are always glass (backdrop blur + subtle gradient) or have a gradient. A solid `#3B82F6` filled div is wrong.

3. **No default shadows** — no `shadow-md`, `shadow-lg` etc. Glow effects use `box-shadow: 0 0 Xpx colorAA` (colored glow), not grey drop shadows.

4. **No icon + text + chevron repetition** — avoid building every list item as `[icon] [title] [subtitle] [chevron >]`. Vary the layout. Some items are stat-forward, some are visual-forward.

5. **No rainbow gradients or neon overload** — the palette is deep ocean: teals, cyans, electric blues. No purples, oranges, hot pinks used decoratively. Danger red (`#FB7185`) is for errors only.

6. **No lorem ipsum or placeholder copy** — every label, empty state, and description must be written for the water monitoring domain specifically.

7. **Micro-interactions are required** — every interactive element must have a hover and active state. Static cards with no feedback feel broken.

8. **Consistent border radius** — use the token scale: `radius.sm` (14px), `radius.md` (20px), `radius.lg` (28px), `radius.xl` (36px), `radius.pill` (999px). Never mix arbitrary values.

9. **Data-first layouts** — the most important number on a card should be the largest element visually. Don't bury key metrics in small text.

10. **Empty states must be designed** — never show a blank area. Every empty state has an icon, a title, a description, and optionally a CTA.
