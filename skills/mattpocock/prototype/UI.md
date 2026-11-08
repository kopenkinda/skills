# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a small floating switcher. The user flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic/state rather than what something looks like, this is the wrong branch. Use [LOGIC.md](LOGIC.md).

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise spend a day picking between three vague mockups in their head.

## Two sub-shapes: strongly prefer sub-shape A

A UI prototype is much easier to judge when it's **butting up against the rest of the app**: real header, real sidebar, real data, real density. A throwaway route on its own is a vacuum: every variant looks fine in isolation. Default to sub-shape A whenever there's a plausible existing page to host the variants. Only reach for sub-shape B if the prototype genuinely has no nearby home.

### Sub-shape A: adjustment to an existing page (preferred)

The route already exists. Variants are rendered **on the same route**, gated by a `?variant=` URL search param. The existing data fetching, params, and auth all stay. Only the rendering swaps. This is the default; pick it unless there's a specific reason not to.

If the prototype is for something that doesn't yet have a page but *would naturally live inside one* (a new section of the dashboard, a new card on the settings screen, a new step in an existing flow), it's still sub-shape A. Mount the variants inside the host page.

### Sub-shape B: a new page (last resort)

Only use this when the thing being prototyped genuinely has no existing page to live inside (e.g. an entirely new top-level surface, or a flow that can't be embedded anywhere sensible).

Create a **throwaway route** following whatever routing convention the project already uses. Don't invent a new top-level structure. Name it so it's obviously a prototype (e.g. include the word `prototype` in the path or filename). Same `?variant=` pattern. Reach it by URL only; don't add it to the app's navigation.

Before committing to sub-shape B, sanity-check: is there really no existing page this could be embedded in? An empty route hides design problems that a populated one would expose.

In both sub-shapes the floating switcher is identical.

## Process

### 1. State the question and pick N

Default to **3 variants**. More than 5 stops being radically different and starts being noise, so cap there.

Write down the plan in one line, in the prototype's location or a top-of-file comment:

> "Three variants of the settings page, switchable via `?variant=`, on the existing `/settings` route."

This works whether the user is here to push back or not.

### 2. Generate radically different variants

Draft each variant. Hold each one to:

- The page's purpose and the data it has access to.
- The project's component library / styling system (TailwindCSS, shadcn, MUI, plain CSS, whatever).
- A clear exported component name, e.g. `VariantA`, `VariantB`, `VariantC`.

Variants must be **structurally different**: different layout, different information hierarchy, different primary affordance, not just different colours. Three slightly-tweaked card grids isn't a UI prototype, it's wallpaper. If two drafts come out too similar, redo one with explicit "do not use a card grid" guidance.

### 3. Wire them together

Render the variant from the `?variant=` search param, read through the project's router so the page re-renders when it changes:

```tsx
// pseudo-code, adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
  </>
);
```

For sub-shape A (existing page): keep all the existing data fetching above the switch; only the rendered subtree changes per variant.

For sub-shape B (new page): the throwaway route under `/prototype/<name>` does the same.

### 4. Mount the floating switcher

Don't build a switcher. Copy [prototype-switcher.ts](prototype-switcher.ts) next to the prototype unchanged and mount it once, in dev builds only:

```tsx
// React example; any framework mounts it the same way, once, on the client
useEffect(() => {
  if (!import.meta.env.DEV) return; // or process.env.NODE_ENV !== 'production'
  return mountPrototypeSwitcher({
    variants: [{ key: 'A', name: 'Table' }, { key: 'B', name: 'Split view' }, { key: 'C', name: 'Timeline' }],
  });
}, []);
```

It is a tiny pill, `‹ B (Split view) ›`, that the user can drag anywhere; it snaps to the nearest corner and remembers the corner across reloads. Arrows and the `←`/`→` keys cycle variants (not while typing in a field). It renders in a shadow root, so it can't pick up or leak page styles.

A switch rewrites `?variant=` with `history.replaceState` and fires `popstate`, which React Router, Vue Router, TanStack Router and Next.js all follow. Check that clicking an arrow re-renders the variant. Only if it doesn't, pass `onChange: (key) => ...` and set the param with the router. Either way the mount effect runs once: keep its dependency list empty (reach an unstable router function through a ref), or the switcher is torn down and rebuilt on every switch.

Mount it from the prototype itself, not from shared app code, so removing the prototype removes the switcher. The `.ts` file works in any TypeScript project; in a plain JavaScript project, strip the types.

### 5. Hand it over

Surface the URL (and the `?variant=` keys) on the project's regular dev server.

If you're running in T3 Code (the `preview_*` tools are available), show the variants in the chat once the prototype is ready to present, after the last code change, so no screenshot shows an outdated variant: start the dev server, open the prototype with `preview_open`, and capture every variant with `preview_snapshot` (`includeImage: true`, `save: true`) so each screenshot appears in the conversation. Embed every screenshot inline in the hand-off message, one per variant, straight from the `screenshotPath` the snapshot returns (`![B (Split view)](<screenshotPath>)`), not inside a collapsed block. Never copy or commit screenshots into the project. Then stop the dev server and close the tab. If a snapshot times out, retry once, then say which variant has no screenshot. Use only T3's built-in preview for this; don't take control of another browser or the desktop (computer use, Chrome automation) unless the user allows it.

The user will flip through whenever they get to it. The interesting feedback is usually **"I want the header from B with the sidebar from C"**, which is the actual design they want.

### 6. Capture the answer and clean up

Once a variant has won, capture the answer (which variant and why), then capture the prototype the way the [SKILL](SKILL.md) describes. Fold the winner into the real code and move the rest onto the throwaway branch, not into main:

- **Sub-shape A**: fold the winner into the existing page; drop the losing variants and the switcher from main.
- **Sub-shape B**: promote the winning variant to a real route; drop the throwaway route and the switcher from main.

The full set of variants is the primary source, so it lands on the throwaway branch, not the bin, since variant components and the switcher left in the main branch rot fast and confuse the next reader.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak, not a prototype. Real variants disagree about structure.
- **Sharing too much code between variants.** A shared `<Header>` is fine; a shared `<Layout>` defeats the point. Each variant should be free to throw out the layout.
- **Wiring variants to real mutations.** Read-only prototypes are fine. If a variant needs to mutate, point it at a stub: the question is "what should this look like", not "does the backend work".
- **Promoting the prototype directly to production.** The variant code was written under prototype constraints (no tests, minimal error handling). Rewrite it properly when you fold it in.
