# Design brief — "dress" (wardrobe / outfit tool)

Paste this whole file into a new claude.ai/design project as the opening prompt, and attach the screenshots listed at the bottom. Ask it to: "Review this app end-to-end and produce a full, cohesive redesign — a design system plus every screen and state below."

## 1. Product in one line
A calm, editorial wardrobe app: you photograph your clothes, and it scores how any two pieces go together, then helps you assemble and save outfits. The signature UI is a **circular "match wheel"** where hovering a garment arcs lines to the pieces that pair with it, colored by a 0–36 harmony score.

## 2. Audience & tone
Personal, quiet, a little editorial ("a quiet way to dress"). Not loud e-commerce. Think atelier / lookbook, not a marketplace. Mobile matters (users photograph clothes on their phone) but it's currently desktop-first.

## 3. Current brand / visual language (keep the spirit, elevate the execution)
- Background: warm cream `#fbfaf6`; a slightly warmer beige for secondary panels. Foreground near-black `#252523`.
- Accent: muted green `#3d5a3d`. Warning: amber. Destructive: muted red.
- Type: Inter for headings and body, Geist Mono for mono. Bold headings, tight tracking.
- Shapes: generous rounding (12–28px), soft shadows, thin `1px` borders.
- **Score tiers** (0–36): Works/OK gold `#a68117`, Great green `#2f7d4f`, Perfect blue `#245179`. These colors carry meaning across badges, arcs, rings — keep a clear 3-tier scale.
- Must work in **light and dark**; dark theme currently has gaps.

## 4. Information architecture (routes)
- `/login` — email + password only (no password reset yet).
- Onboarding (first run, full-screen, 5 steps): splash → "who do we dress for?" → climate → pick 1–2 seasonal color palettes → "you're all set".
- App shell (persistent header): wordmark "dress" + `N items · M cats`, centered **Wardrobe / Outfits** tabs, right cluster = circular/list **view toggle**, **feedback** icon, black **+ Add item**, avatar.
- `/` **Wardrobe** — the match wheel (or list) + a bottom outfit-builder bar.
- `/outfits` — saved looks (folder filter + grid of cards).
- `/how-it-works` — explains the 7 scoring axes with an interactive color-wheel demo.

## 5. Screen-by-screen inventory (redesign each, with all states)

### Wardrobe `/` — circular view (the hero screen)
- **MatchWheel**: item tiles laid on a circle around a center label. Hovering a tile arcs curved lines to its matches, line color+width by score; center shows `<item name>` and `best · <top match> (score)`. Empty slots render as hatched placeholders.
- On a tile, on hover: a **pencil** (edit) top-left, an **eye** (exclude from matching) top-right; a **"?"** bottom-right opens a **score-breakdown popover** (7 mini bars: Color 11, Role 5, Season 5, Palette 5, Style 5, Pattern 3, Fit 2, red for negatives). Selected tile gets a green ring + check. Excluded tiles are dimmed with an eye-off badge.
- States: 0 items (empty state "Your wardrobe is empty" + Add), 1 item, loading spinner, error alert, all-excluded, building-in-progress.

### Wardrobe `/` — list view (OutfitCarousel)
- Horizontal lanes per category (Headwear→Accessory), tiles scroll horizontally. Same hover affordances (pencil, eye, score chip, match outline instead of arcs). This and the wheel should feel like two views of one system.

### Bottom outfit builder (OutfitBar) — floats bottom-right
- Idle: compact "Start a look" card (icon + hint).
- Building: big harmony score `NN / 36` + tier word + `clear`, a divider, a row of selected slot tiles (each with an × and a category label), dashed `+` placeholders for still-missing core slots (top/bottom/shoes), then a name field + **Save** (or **Save changes** + **Cancel** in edit mode). A conflict banner ("Doesn't go together … Wear it anyway · Why?") rides above it. On mobile it stacks full-width.

### Outfits `/outfits`
- Header: "Saved outfits", count, sort segmented control (Best match / Newest / Name).
- **Folder filter chips**: All / Unfiled / each folder (with counts, deletable), + "New folder" (opens a small modal).
- **Cards** grid: name, `Xd ago · N pieces` (+ "N unavailable" if items were deleted), big harmony score in tier color (or "—" if unscored), a row of piece thumbnails with "+N" overflow, a bottom folder dropdown + delete. Empty state + "nothing in this folder yet".

### Outfit detail (OutfitDetailModal) — two columns
- Left (beige): "THE LOOK" + large stacked garment tiles (layered/same-slot pieces sit side-by-side, accessories shrink to a small icon row) + a **circular score ring** with the number inside and the tier beside.
- Right: folder dropdown + close, title + "Saved … · N pieces", the piece list (swatch · name · CATEGORY), **"Why it works" chips** (palette cohesion, formality, season), footer Delete / Duplicate / Edit.

### Add / Edit item (ItemForm in a dialog)
- Photo drop/upload (auto-extracts main + accent color), name, category, subtype, pattern, formality, fit (fit only for tops/outerwear/bottom/dress), main + accent color swatches, season multi-select. Edit adds a two-step Delete. Needs a clean, compact, mobile-friendly form.

### Profile, Feedback, How-it-works, toasts, error boundary
- **ProfileModal**: identity, "score breakdown" toggle, palettes/climate editing, Export data / Delete account (two-step), Sign out.
- **FeedbackModal**: textarea → send.
- **/how-it-works**: editorial explainer of the 7 axes + a draggable color-wheel demo. Great candidate to make genuinely beautiful.
- Global: toast notifications (success/error), a friendly full-page error fallback, loading spinners (want skeletons).

## 6. Core flow to keep frictionless
onboard → add first item → wheel suggests matches on hover → tap pieces to build → bottom bar shows harmony → name & save → it lands on /outfits → open → edit on the wheel or duplicate → organize into folders → tweak profile / send feedback.

## 7. What to redesign vs preserve
- **Preserve**: the circular match wheel as the signature, the 3-tier score color scale, the calm cream/editorial mood.
- **Elevate**: cohesion across wheel/list/bar/cards/modals; a real design system (type scale, spacing, color tokens, component states, focus/hover); mobile layouts (the wheel, the bottom bar, the two-column detail modal, the item form); dark theme; skeleton loaders; the how-it-works page as a showcase.
- Deliverables wanted: a design-system page (tokens + components) + a full mock of every screen/state above, responsive, light+dark.

---

## Screenshots to attach (capture at localhost:3101 while signed in)
1. Onboarding — each of the 5 steps.
2. Wardrobe — wheel: idle, hovering a piece (arcs), score "?" popover open, an excluded piece.
3. Wardrobe — list view (same states).
4. Bottom bar — idle "Start a look", mid-build with slots + placeholders, edit mode, conflict banner.
5. Outfits — grid with folder chips, empty state, "New folder" modal.
6. Outfit detail modal — a 3-piece look and one with layers/accessories.
7. Add item + Edit item forms.
8. Profile modal, Feedback modal, how-it-works page.
9. Mobile widths (~390px) of: wheel, bottom bar, detail modal, item form, header.
