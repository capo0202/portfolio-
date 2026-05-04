# High-Agency Frontend Skill Document

This comprehensive guide establishes a senior UI/UX engineering framework for building premium digital interfaces that systematically override common LLM design biases.

## Core Configuration Baseline

The system operates with three tunable parameters:
- **DESIGN_VARIANCE: 8** (asymmetric, creative layouts)
- **MOTION_INTENSITY: 6** (fluid, spring-physics animations)
- **VISUAL_DENSITY: 4** (balanced spacing, art-gallery aesthetic)

Users can override these values dynamically through chat requests.

## Key Architectural Principles

**Dependency Management:** All third-party libraries must be verified in `package.json` before use, with installation commands provided when missing.

**Technology Stack:** React/Next.js with Server Components by default, Tailwind CSS v3/v4 for styling, and strict isolation of interactive components using `"use client"` directives. For vanilla HTML/CSS/JS projects, apply all design principles using CSS and GSAP.

**Critical Constraints:**
- Emoji usage is completely prohibited; replace with high-quality icon libraries
- Use `min-height: 100dvh` instead of `height: 100vh` to prevent mobile layout shifts
- CSS Grid preferred over complex flexbox percentage calculations
- Maximum one accent color per project with saturation below 80%

## Design Engineering Rules

The framework enforces six deterministic rules addressing LLM biases:

1. **Typography:** Force premium typefaces (Geist, Outfit, Cabinet Grotesk) instead of default Inter; ban serif fonts in dashboards
2. **Color:** Eliminate the "AI Purple/Blue" aesthetic; use neutral bases with high-contrast, singular accents
3. **Layout:** Prevent centered Hero sections when variance exceeds 4; enforce asymmetric structures
4. **Materiality:** Restrict generic card overuse in high-density interfaces; use borders and negative space instead
5. **States:** Mandate full interaction cycles (loading, empty, error states) beyond static success screens
6. **Forms:** Standardize label-above-input structure with consistent spacing

## Advanced Motion & Interactions

The "Motion-Engine Bento Paradigm" prescribes perpetual micro-interactions using spring physics (`stiffness: 100, damping: 20`), layout transitions with `layoutId`, and isolated Client Components to prevent performance degradation.

Five core card archetypes define interaction patterns: auto-sorting lists, typewriter inputs, breathing status indicators, infinite carousels, and floating action toolbars.

## Performance & Quality Safeguards

- Animate exclusively via `transform` and `opacity`; never use `top`, `left`, `width`, `height`
- Isolate CPU-heavy animations in separate memoized Client Components
- Apply grain filters only to fixed, non-interactive pseudo-elements
- Implement strict cleanup functions in `useEffect` hooks

## Forbidden AI Patterns (Anti-Slop)

Prohibited design signatures include neon glows, pure black colors, oversaturated accents, Inter font, generic 3-column card layouts, placeholder names ("John Doe"), fake numbers, startup clichés ("Nexus"), and broken image links.

---

**Document provides actionable, metrics-driven guidance for engineering interfaces that feel refined, performant, and deliberately engineered rather than algorithmically generic.**
