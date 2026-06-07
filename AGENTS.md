<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-system -->
# Design System

This is the canonical design token reference. Use these values — never hardcode arbitrary colors, fonts, or radii unless explicitly asked.

## Typography

| Token | Value |
|---|---|
| `font-display` / `font-serif` | Playfair Display, Georgia, serif |
| `font-body` / `font-sans` | DM Sans, system-ui, sans-serif |

**Rules:**
- Headings, hero text, editorial → `font-display`
- Body copy, labels, UI → `font-body`
- Preferred font sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-5xl`, `text-6xl`
- Preferred tracking: `tracking-wide`, `tracking-wider`, `tracking-widest`

## Color Palette

### Brand (prefer these over Tailwind defaults)

| Token | Hex | Usage |
|---|---|---|
| `bg/text/border-brand-primary` | `#FF6A1B` | CTA, accents, highlights |
| `bg/text/border-brand-primary-hover` | `#E55A0D` | Hover state of primary |
| `bg/text/border-brand-dark` | `#1A1A1A` | Dark backgrounds, headings |
| `bg/text/border-brand-cream` | `#FDF6EE` | Page backgrounds, cards |
| `bg/text-brand-muted` | `#6B6B6B` | Secondary text, captions |
| `bg/border-brand-light` | `#F5F0E8` | Subtle section backgrounds |
| `bg/border-brand-border` | `#E8E0D5` | Dividers, input borders |
| `bg-brand-white` | `#FFFFFF` | White surfaces |

### Legacy Tuco (still in use — do not remove)

| Token | Hex |
|---|---|
| `bg/text/border-tuco-red` | `#C0392B` |
| `bg/text/border-tuco-red-dark` | `#A93226` |
| `bg/text-tuco-green` | `#2E7D32` |
| `bg/text/border-tuco-cream` | `#F5F0E8` |
| `bg/text/border-tuco-brown` | `#6D4C41` |
| `bg/text/border-tuco-brown-light` | `#8D6E63` |
| `bg/text-tuco-white` | `#FAFAF7` |

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-card` | 16px | Cards, panels |
| `rounded-btn` | 999px | Buttons (pill shape) |
| `rounded-input` | 12px | Inputs, selects |
| `rounded-full` | 9999px | Avatars, badges |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` (var) | `0 4px 24px rgba(0,0,0,0.08)` | Cards at rest |
| `shadow-card-hover` (var) | `0 8px 32px rgba(0,0,0,0.14)` | Cards on hover |
| `shadow-nav` (var) | `0 2px 16px rgba(0,0,0,0.06)` | Navbar |

## Animations

| Class | Behavior |
|---|---|
| `animate-badge-bounce` | Scale pulse (badge notifications) |
| `animate-slide-text` | Fade + slide-up (text reveals) |

Prefer `transition-all duration-200` for interactive elements. Use `active:scale-[0.98]` on tappable buttons.

## Breakpoints

Standard Tailwind v4: `sm` 640px · `md` 768px · `lg` 1024px.
<!-- END:design-system -->
