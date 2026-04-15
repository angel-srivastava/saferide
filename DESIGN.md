# Design Brief

## Direction

Trust in Motion — a safety-first visual language for ride-sharing that communicates calm, clarity, and human-centered care through refined minimalism.

## Tone

Refined minimalism with human warmth; anti-corporate but professional. Every color choice and interaction reinforces safety, built for mobile-first motion and decision-making under attention constraints.

## Differentiation

Soft teal primary palette and graduated card elevation create instant visual safety signals without sterility; trust design that feels personal, not institutional.

## Color Palette

| Token          | OKLCH           | Role                               |
| -------------- | --------------- | ---------------------------------- |
| primary        | 0.65 0.16 200   | Teal — trust, calm, ride actions   |
| secondary      | 0.82 0.06 162   | Soft sage — support, balance       |
| accent         | 0.75 0.15 80    | Warm amber — confirmations, alerts |
| destructive    | 0.55 0.18 20    | Soft coral — cancellations, danger |
| background     | 0.98 0.01 254   | Off-white with warmth (light)      |
| card           | 1.0 0 0         | Pure white surfaces (light)        |
| foreground     | 0.18 0.01 254   | Near-black text (light)            |
| muted          | 0.88 0.03 200   | Disabled, secondary states         |

## Typography

- Display: Lora — editorial confidence for headers, ride details, landmarks
- Body: DM Sans — modern, approachable body copy, driver/passenger info, pricing
- Mono: JetBrains Mono — code blocks, trip IDs, referral codes
- Scale: H1 `text-3xl font-display font-semibold`, H2 `text-2xl font-display`, Label `text-xs uppercase tracking-wide`, Body `text-base font-body`

## Elevation & Depth

Card-based surfaces on muted backgrounds with soft shadows; no borders. Three shadow levels: `shadow-card` (2px, micro), `shadow-safety` (4px, card lift), `shadow-elevated` (8px, modal/drawer).

## Structural Zones

| Zone      | Background           | Border       | Notes                                              |
| --------- | -------------------- | ------------ | -------------------------------------------------- |
| Header    | `bg-background/50`   | `border-b`   | Sticky, blurred backdrop, safety info pinned      |
| Content   | `bg-background`      | —            | Cards on subtle muted underlay, alternating zones |
| Footer    | `bg-muted/20`        | `border-t`   | Integrated into flow, minimal weight              |
| Modals    | `bg-popover`         | —            | Elevated card with `shadow-elevated`              |
| Drawers   | `bg-card`            | —            | Full-screen mobile cards, no border radius top    |

## Spacing & Rhythm

Base rhythm 1rem/16px; sections 2rem gaps, card padding 1.5rem, micro-spacing 0.5rem; 8px border-radius across all surfaces for consistent softness.

## Component Patterns

- Buttons: primary `bg-primary text-white rounded-lg`, secondary `bg-secondary text-foreground rounded-lg`, outline `border border-border text-foreground`; hover state opacity 0.9
- Cards: rounded-lg, `bg-card shadow-card`, hover lift to `shadow-safety`; no borders
- Badges: rounded-full, `bg-muted text-muted-foreground`, accent `bg-accent/20 text-accent`
- Input: `bg-input border border-border rounded-md`, focus `ring-2 ring-primary`

## Motion

- Entrance: fade + slide up (300ms ease-out) on page load, cards stagger 50ms
- Hover: subtle lift via `shadow-card` → `shadow-safety` transition 200ms
- Decorative: pulsing SOS button, gentle fade on navigation transitions, no bounce

## Constraints

- No full-page gradients; depth via layers and elevation only
- All colors OKLCH-based, no hex/rgb literals in components
- Soft chroma across palette (no saturation spikes) to maintain calm
- Mobile-first: touch targets minimum 44px, tap feedback via background color not border

## Signature Detail

Graduated card shadows without borders create depth-through-layering that feels safe and tactile — the visual metaphor of stacking documents in a well-organized desk, reinforcing trust through familiar spatial organization.
