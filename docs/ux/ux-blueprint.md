# UX Blueprint

## Primary Screen

- Header: app name, edit mode, settings.
- Search: large input with compact provider selector.
- Favorites: compact draggable icon tiles.
- Favorites management: add/edit modal with name, URL, and logo picker.
- Workspace: draggable widgets below favorites.
- Settings: side drawer on desktop, full-screen feeling on mobile.

## Interaction Rules

- Enter submits search.
- Shortcuts: `g`, `d`, `b`, `yt`, `gh`, `p`.
- Edit mode reveals widget creation and drag handles.
- Add controls remain discoverable even outside edit mode for favorites.
- Background settings include theme thumbnails plus an image upload target.
- Normal mode keeps chrome minimal.
- Mobile layout stacks widgets and keeps tap targets at least 44px.

## Auto Text Contrast

- Auto contrast keeps text readable across themes and uploaded wallpapers.
- Without a wallpaper, only the graphite theme switches to light text.
- With a wallpaper, the uploaded image is sampled for average luminance; dark images (luminance < 0.55) flip to light text, bright images keep dark text.
- Users can override auto by picking Dark or Light text explicitly in Settings → Theme.
