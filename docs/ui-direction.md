# UI direction

- Style: **neumorphism** (soft raised/inset surfaces) on a bento-style dashboard grid.
- Light and dark themes, each with its own shadow colors, defined as CSS variables.
- Three shadow states only: raised (cards, buttons), inset (inputs, progress tracks, selected items), flat (minor items).
- Charts: Recharts, themed with the same palette.

## Accessibility rules (override the style when they conflict)

- Text contrast at least 4.5:1.
- Never rely on shadows alone to show something is clickable; use labels, icons and a visible focus ring.
- Budget status colors (green/amber/red) are always paired with text such as "Over by $12".
- The primary "Add transaction" button uses a solid accent fill.
- Keep tables and transaction lists flat, with thin dividers.
