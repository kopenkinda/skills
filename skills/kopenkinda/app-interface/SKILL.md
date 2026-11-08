---
name: app-interface
description: Calm, dense, tasteful design for product UI people work in every day - dashboards, admin panels, tables, forms, settings, detail views and internal tools. Use when building, restyling or reviewing app screens. Not for landing pages or marketing sites.
---

# App interface

People open an app to get work done, many times a day. The interface should disappear behind the task: fast to scan, predictable, quiet. Distinctiveness comes from precision and good defaults, not decoration.

The project's design system wins. Use its components, tokens, spacing and density, and change only what the task names. These rules fill the gaps it leaves and replace the generated-dashboard defaults below.

## Structure without boxes

- **No cards by default.** A card is for an object the user can act on as a unit: open it, drag it, select it. Grouping is not a reason. Group with spacing, a heading, or a single divider instead.
- **Never nest containers.** No card inside a card, no bordered section inside a bordered panel. If you need a second level, use spacing and type.
- **Lists of records are tables or lists, not card grids.** Rows align values into columns the eye can scan down; cards scatter them. Use a grid of cards only for visual objects like images, files or boards.
- **One surface level for content.** The page background and content share a plane. Raise only what floats: menus, popovers, dialogs, toasts. Shadows belong to floating layers, not to static sections.
- **Borders are hairlines, and rare.** A 1px low-contrast line between regions or rows. If whitespace already separates two things, remove the border.

## Density and alignment

- Size for repeated use, not first impressions: body text 13-14px, table rows 32-40px, compact controls that match row height.
- Pick one spacing scale (4px steps) and use few of its values. Related things sit close; groups get clearly more space between them than within them.
- Align everything to a few vertical edges. Labels, values, column contents and actions should line up across sections.
- Numbers: `font-variant-numeric: tabular-nums`, right-aligned in tables, consistent precision, units in the header instead of every cell.
- Truncate long text with an ellipsis and the full value on hover or in the detail view. Layout never breaks on a long name, an empty field or a huge count.

## Hierarchy

- Build hierarchy with size, weight and position. Use color for meaning, not rank.
- No eyebrows: no small all-caps or muted line above a title or section. The title names the section; a kicker above it adds noise.
- One page title. No subtitle repeating it, no description under every section heading that restates the heading.
- Secondary text is one muted tone, not three shades of gray.
- One accent color, spent on the primary action and the current selection. Status colors (success, warning, danger) appear only where they carry status.
- One primary button per view. Other actions are secondary or live in a menu.

## Remove generated-dashboard furniture

- No KPI tile row unless the user actually monitors those numbers. When it's warranted: plain numbers with a label, no icons in colored circles, no gradient, no fake trend arrows.
- No icon on every heading, button and menu item. Use icons where they speed recognition: a toolbar, a status, a known action.
- No "Welcome back" greetings, emoji, decorative illustrations or charts added to fill space.
- No badge or pill for values that are just text. Keep a pill for status the user filters or acts on.
- Uniform radius: one small radius for controls and one for floating layers. No pill-shaped everything.

## Behavior

- Keep the user in place. Edit inline or in a side panel when the context matters. Reserve modals for focused decisions and destructive confirmations.
- Every view has an empty, loading and error state. Empty states say what goes here and offer the action that fills it; no giant illustration. Loading keeps the layout's shape so nothing jumps when data arrives.
- Feedback lives where the action happened: the row updates, the button shows progress. Toast only for background results or undo.
- Destructive actions name the object ("Delete 3 invoices") and confirm or offer undo.
- Keyboard: visible focus, logical tab order, Enter submits, Escape closes. Frequent actions get a shortcut where the app already has them.
- Motion is functional and short: 150-200ms for state changes, none for content that just appeared. Respect reduced motion.
- Sticky table headers and toolbars when the list scrolls. Filters and sort state are visible and resettable.

## Before you finish

Look at a screenshot at real size. Remove one thing: a border, an icon, a line of copy, a container. If the screen still works, keep it removed.
