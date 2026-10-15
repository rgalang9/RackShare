# Rack Share

**Your closet is your social presence.** A wardrobe identity platform where your profile is your "rack" — the clothing you own, shown as a grid.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

## What's here (MVP)

- **Feed**: discover other people's racks (Discover / Following), plus "Fresh on the racks" with category filters.
- **Profiles**: avatar, name, title, bio, style tags, stats, follow, and the rack grid filtered by category. `/profile` is you and `/u/:handle` is anyone else.
- **Add Item**: the `+` button in the sidebar, on your profile, or in the mobile bottom nav. Upload or drag in a photo, then pick a category, name, brand, and style tags.
- **Item detail**: click any piece. You can remove your own items. Trade and Try-on are placeholder buttons for now.
- **Search**: people, pieces, brands, categories, and styles.
- **Messages**: a placeholder inbox for future DMs and trades.

Data is mock data saved to `localStorage`. Clear the `rackshare:v1` key to reset it. Items without a photo get an SVG garment illustration in the item's color, so nothing depends on external image hosts.

## Structure

```
src/
  types.ts                 domain types (User, Item, CategoryId)
  data/                    categories + mock users/items
  store/RackStore.tsx      data state + actions (swap internals for an API later)
  store/UIStore.tsx        app-wide modals (add item, item detail, edit profile)
  components/
    layout/                AppShell, Sidebar (→ bottom nav on mobile), TopBar, nav config
    ui/                    Button, Avatar, Chip/Tag, Modal, Icon, EmptyState
    items/                 ItemCard, ItemGrid, CategoryFilter, AddItemModal, PhotoDropzone, GarmentArt…
    profile/               ProfileHeader, RackPreviewCard, EditProfileModal
  pages/                   Feed, Profile, Search, Messages, NotFound
  styles/global.css        design tokens (colors, radii, shadows, fonts)
```

## Design tokens

Everything visual is driven by CSS variables in `src/styles/global.css`. The single accent is `--accent: #ff5a36` (tomato). Change it there to re-theme the app. Fonts are Bricolage Grotesque (display) and Plus Jakarta Sans (body).

## Built to extend

- **Mobile**: under 768px the sidebar already turns into an Instagram-style bottom nav. `NAV_ITEMS` in `components/layout/navItems.ts` feeds both layouts.
- **Backend**: pages only talk to `useRack()`. Replace the reducer and localStorage with API calls, and swap `utils/image.ts` for real uploads.
- **Full looks**: there's a "Full looks · Soon" tab on profiles. Add a `Look { itemIds[] }` type and a tab panel.
- **Try-on / trading / DMs**: the entry points already exist (Item detail buttons, Message button, `/messages`).
