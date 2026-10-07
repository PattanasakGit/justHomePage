# UI Design — Homepage v2 (sidebar toggle + add flows)

**Canonical demo:** [`docs/ui/demo-v2.html`](./demo-v2.html)  
**Status:** Awaiting user OK before Dev.

## Information architecture

| Surface | Behavior |
|---------|----------|
| **Desktop (≥860px)** | Library **sidebar** toggleable via top-left control (`data-sidebar=open\|closed`). Open: folders + New Bookmark / New Folder / Import / Export. Closed: main full-bleed. |
| **Mobile** | Same top-left control opens/closes **full-screen** Library sheet. |
| **Add** | Unified sheet: **Bookmark** (name, URL, folder = None \| folder) or **Folder** (name). Entry points: sidebar/sheet footers + dashed Add tile (defaults to Bookmark). |
| **Main canvas** | Greeting · Google search · favorites grid. No folder rail / + strip. |

## Kept product rules

- Google-only search
- Space over stacked bars; soft borderless search
- Mitr (+ Thasadith); Phosphor Light
- Icon size S–XL; flat glass; accent `#0071e3`
- Brand tiles = metadata / SVG plates

## Settings (unchanged this pass)

iOS grouped cards: Appearance · Icons & layout · Glass · Wallpaper.

## Dev requirements

1. Sidebar open/close on **desktop and mobile** (desktop collapses sticky sidebar; mobile uses full-screen sheet). Shared toggle affordance top-left.
2. Add **folder** and **bookmark**; bookmark folder optional (`None` = root).
3. Prefill folder select when browsing a folder.
4. Keep Google-only, icon S–XL, Mitr, Phosphor, Settings pattern.
5. Wait user OK before code.

## Out of scope

Multi-search engines; 3D controls; Safari e2e.
