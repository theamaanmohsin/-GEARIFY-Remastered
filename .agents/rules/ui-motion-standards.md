# AGENTS.md — UI & Motion Standards for AI Coding Agents

> Read this before generating, editing, or reviewing any frontend UI or animation code.
> Goal: interfaces that feel **professional, crafted, and alive** — never generic, robotic,
> or "default-AI-template" looking. Applies to any project (React/Next.js, Vue, or plain
> HTML/CSS/JS) unless a project-specific style guide overrides it.

Sources this file was distilled from (reviewed and summarized on 2026-08-15):
- Anime.js (animejs.com) — lightweight, modular JS animation engine
- Motion / prev. Framer Motion (motion.dev) — React-first animation library
- GSAP (gsap.com) — professional-grade animation engine, Flip/Draggable/SVG/Text plugins
- StringTune (string-tune.fiddle.digital) — attribute-driven, CSS-first scroll/interaction library
- 21st.dev — community registry of React + Tailwind + shadcn/ui components, templates, themes

---

## 1. Prime directive: motion is seasoning, not the meal

The single biggest way AI-generated UIs look robotic is **treating animation as decoration
sprinkled on afterward** instead of as part of the interface's logic. Before adding any
animation, ask: *does this help the user understand what just happened, or am I just
making it move because I can?*

- Every animation must justify itself: state change, spatial relationship, hierarchy,
  feedback, or delight at a moment that's earned it (success, completion, first load).
- If removing an animation doesn't hurt comprehension, it's decoration — keep it minimal
  or cut it.
- Never animate everything on a page with the same easing/duration. Uniform motion
  everywhere is the #1 tell of a template/AI-generated site.

## 2. Timing & easing rules (the actual "feel" of professional motion)

- **Duration:** UI micro-interactions (hover, press, toggle) → 100–250ms. Page/section
  transitions → 300–600ms. Anything longer needs a strong reason (hero reveals, onboarding).
- **Never use `linear` easing** for anything a human perceives as physical (movement,
  scale, opacity fading over distance). Linear motion reads as mechanical/robotic instantly.
  Use eased curves: `ease-out` for things entering/appearing, `ease-in` for things leaving,
  `ease-in-out` for things that move and settle.
- **Prefer spring physics over duration-based easing for anything interactive** (drag,
  gesture-driven, hover-reactive elements). Springs respond naturally to interruption —
  duration-based tweens look stiff when a user interrupts them mid-flight.
- **Stagger, don't synchronize**, when animating a list/grid of items in — 30–80ms delay
  per item is usually enough. Simultaneous "everything pops at once" reads as a bad
  PowerPoint transition.
- Respect `prefers-reduced-motion` — always provide a reduced/no-motion fallback path.
  This is non-negotiable for accessibility, not optional polish.
- **Accessibility beyond reduced-motion:** never remove or hide the browser's focus-visible
  ring in favor of a purely visual/animated hover state — keyboard users need a clear focus
  indicator at all times. Don't let an in-progress transition trap or delay keyboard focus
  (e.g. a modal's focus should move in as soon as it's interactive, not only after its
  animation fully completes). Use `aria-live` regions for content that updates dynamically
  without a page navigation (toasts, async status changes) so screen readers announce it.

## 3. Interaction & micro-interaction vocabulary (borrow from GSAP/StringTune concepts)

Use these concepts as reference patterns — implement with whichever animation library the
project already uses, don't force a new dependency in just to get one effect:

- **FLIP-style state transitions** (First-Last-Invert-Play): when an element changes
  position/size/parent (card → detail view, list reordering, moving between columns/status),
  animate the delta between before/after states rather than cross-fading or hard-cutting.
  (Concept from GSAP Flip / Motion's `layout`/`layoutId` prop.)
- **Shared-element transitions** for anything that visually "is the same object" across two
  views (a thumbnail becoming a hero image, a list row becoming a detail header).
- **Magnetic/gravity hover** for primary CTAs on marketing surfaces only — buttons that
  subtly pull toward the cursor. Use sparingly (1–2 elements per screen, never on every button).
  **Always gate hover/cursor-follow effects behind a `(hover: hover) and (pointer: fine)`
  media query check (or JS equivalent)** — these effects have no meaning on touch devices
  and must degrade to a normal static/tap state, not run broken or do nothing silently.
- **Draggable with real inertia/momentum + snapping**, not instant snap-to-grid, for any
  drag interaction (reordering, sliders, swipeable cards, bottom sheets).
- **Scroll-linked reveals**: elements should enter with a *purposeful* small transform
  (8–24px translate + fade), not a generic "fade in from nowhere." Avoid parallax on more
  than one or two layers per screen — heavy parallax everywhere feels dated and gimmicky,
  not premium.
- **Loading/skeleton states must be animated**, never a static gray box. A subtle shimmer
  or pulse communicates "working," not "broken."

## 4. Visual/interface craft rules (why AI output often "looks AI")

- **Never ship default framework spacing/shadow/radius values unmodified across an entire
  UI.** Cookie-cutter `rounded-lg shadow-md p-4` on every card, everywhere, is the most
  common "generic AI-generated Tailwind site" signature. Vary hierarchy: not every
  container needs the same radius, shadow depth, or border treatment.
- **Depth should come from layering (glassmorphism/neumorphism/subtle gradients/borders),
  not from stacking heavier and heavier drop-shadows.** Pick one depth language per project
  and apply it consistently and sparingly, not everywhere.
- **Typography carries more "premium" signal than color.** Get type scale, line-height,
  and letter-spacing intentional before reaching for animation to make something feel high
  quality. A page with great type and zero animation beats a page with mediocre type and
  heavy animation.
- **Custom cursor / magnetic effects, split-text reveals, and scramble-text effects** are
  differentiators most templates skip — use them deliberately on 1–2 focal moments (hero
  headline, a key CTA) rather than throughout, or they stop being special.
- **Dark mode is not "invert the colors."** Neon/accent colors need to be re-tuned for
  contrast and glow in dark contexts, not just reused at the same saturation.
- Avoid generic stock icon+color pairings (e.g., always-green-checkmark,
  always-red-trash) without checking the project's actual accent-color system first.

## 5. Performance rules (non-negotiable, not optional polish)

- Animate `transform` and `opacity` only wherever possible — avoid animating properties
  that trigger layout/reflow (`width`, `height`, `top`, `left`, box-shadow spread) in
  anything that runs every frame.
- Batch/only update what's necessary — don't recalculate full styles on every scroll/frame
  tick when only one CSS custom property or transform needs updating.
- Disable or reduce animation modules that aren't in view / aren't active — don't run
  scroll listeners, cursors, or parallax calculations for off-screen elements.
- Test on a throttled/lower-end device profile before considering an animated feature done
  — a 60fps animation on a dev machine can drop frames badly elsewhere.
- Never block first paint or interaction on animation library initialization — animations
  should enhance an already-usable page, not gate it.
- **Lazy-load offscreen images/video/heavy assets** (don't fetch what isn't visible yet) —
  pair this with scroll-reveal animations rather than treating loading and animation as
  separate concerns.
- **Scale animation complexity down on smaller viewports**, not just visual layout. Reduce
  or drop parallax, large-distance transforms, and simultaneous multi-element sequences on
  mobile — lower-end phones (common in the Pakistan market Gearify targets) drop frames on
  effects that run fine on desktop. Simpler motion on mobile is a correctness issue, not a
  taste preference.

## 6. Library/tool selection guidance (when to reach for what)

- **React/Next.js project already using component state and hooks** → prefer Motion
  (motion.dev, prev. Framer Motion). Best fit for `layout`/`layoutId` transitions,
  `AnimatePresence` exit animations, gesture props (`drag`, `hover`, `press`), and spring
  physics that compose naturally with React state.
- **Heavy/complex orchestrated sequences, SVG morphing/drawing, scroll-driven storytelling,
  or framework-agnostic (non-React) work** → GSAP is the more mature, battle-tested choice
  (ScrollTrigger, MorphSVG, DrawSVG, Flip, Draggable+Inertia).
- **Need something extremely lightweight, framework-agnostic, and don't need React-specific
  ergonomics** → Anime.js is a good lean alternative (SVG toolset, Scope for responsive
  media-query-based animation, Timeline).
- **Want to drive simple scroll-based visual effects (parallax, progress bars, reveal
  transforms) with minimal JS and let CSS own the actual visual logic** → the
  attribute-driven + CSS-variable pattern (as seen in StringTune: `string="progress"` +
  `var(--progress)` in CSS) is a good lightweight approach worth replicating even without
  installing StringTune itself, especially for content-heavy/marketing pages that don't
  need a full JS animation library.
- **Need actual UI components (hero sections, cards, nav, sign-in forms, buttons,
  dashboards), not just animation primitives** → check 21st.dev first before hand-building
  from scratch, especially in a React + Tailwind + shadcn/ui project. Components there are
  pre-wired to shadcn conventions and design tokens, and are real editable source, not a
  locked dependency. "Motion Primitives" library on 21st.dev specifically pairs with a
  Motion-based animation approach.
- **Don't add a second/third animation library "just in case."** Pick one primary engine
  per project and stay consistent — mixing GSAP + Motion + Anime.js in the same codebase
  adds bundle weight and inconsistent easing/timing feel across the UI.

## 7. Definition of "done" for any UI/animation task

Before considering a UI feature complete, confirm:
- [ ] Every animation has a clear purpose (state change, feedback, hierarchy, or an
      earned delight moment) — not decoration for its own sake.
- [ ] No `linear` easing on anything perceived as physical motion.
- [ ] Interactive/gesture-driven elements use spring physics, not fixed-duration tweens.
- [ ] Lists/grids stagger in rather than popping simultaneously.
- [ ] `prefers-reduced-motion` fallback exists.
- [ ] Only `transform`/`opacity` animate on any frequently-updating interaction (scroll,
      drag, cursor-follow).
- [ ] Spacing, radius, and shadow values are intentional and varied by hierarchy — not
      uniformly copy-pasted across every card/container.
- [ ] Loading states are animated (skeleton/shimmer), not static placeholders.
- [ ] Dark mode colors are re-tuned, not a blind invert.
- [ ] Only one primary animation library is a hard dependency in the project.
- [ ] Hover/cursor-follow effects are gated behind a `pointer: fine` check and degrade
      cleanly on touch devices.
- [ ] Focus-visible ring is intact for keyboard users; focus isn't trapped/delayed behind
      an in-progress transition.
- [ ] Animation complexity (parallax layers, transform distance, simultaneous sequences)
      is reduced on mobile viewports, not just the layout.

---

*This file should be updated whenever new UI/animation references are reviewed. Keep it
concise and rule-based — agents should be able to load it once and apply it consistently
without re-reading external documentation each time.*
