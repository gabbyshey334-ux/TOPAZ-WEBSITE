# Gallery images

- **`history/`** — TOPAZ HISTORY (1972–2023) vintage photos used on the Gallery page.
- **`topaz-2-0/`** — Reserved for future TOPAZ 2.0 season media (folder ready; add files when available).

# How to Add Photos

1. Upload your photo to the correct subfolder (`history/` or `topaz-2-0/`).
2. Name it descriptively (e.g. `competition-2026-01.jpg`).
3. Open `src/pages/Gallery.tsx`.
4. Add an entry to the `photos` array:
   ```ts
   { id: X, src: '/images/gallery/your-photo.jpg', alt: 'Description' }
   ```
5. Save and deploy!
