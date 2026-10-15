// Display-size WebP copies of public/images/**, generated into
// src/assets/thumbs/ by `npm run optimize-images`. Use thumbUrl() wherever an
// image is shown much smaller than the original (cards, circles, grid squares);
// keep the original URL for lightboxes and downloads.
//
// Falls back to the original when no copy exists yet, so a missed script run
// costs bytes, never a broken image.
const thumbs = import.meta.glob('/src/assets/thumbs/**/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const thumbUrl = (src) =>
  thumbs[`/src/assets/thumbs${src.replace(/^\/images/, '')}.webp`] ??
  import.meta.env.BASE_URL + src.replace(/^\//, '')
