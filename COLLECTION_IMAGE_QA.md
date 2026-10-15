# Collection Image Presentation QA

Collection profile images are presented as the primary visual wherever they appear as category/collection imagery:

- Homepage Featured Categories: square 1:1 edge-to-edge image, `object-fit: cover`, no border, radius, or inner padding.
- Desktop mega-menu category cards: thumbnails use `object-cover`.
- Search category suggestions: thumbnails use `object-cover`.
- All Categories page: image fills the square tile with `object-cover`, no inner padding.
- All Categories dropdown: thumbnails use `object-cover`.
- Collection detail hero image: already uses `object-cover`.
- Homepage category hero tiles: already use `object-cover`.

Product photography and brand logos remain `object-contain` where preserving the complete product/logo is correct.
