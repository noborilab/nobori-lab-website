// Sci-Art: downloadable artwork made in the lab.
//
// To add a piece: drop files into public/images/sci-art/ and rebuild.
// No code changes needed. Files sharing the same basename
// (e.g. lab-logo.gif + lab-logo.png + lab-logo.svg) are grouped into
// one card offering each format as a download.
//
// Titles default to the filename (dashes/underscores become spaces).
// Add an entry to `artMeta` below to override the title or add a caption.

const fileModules = import.meta.glob(
  '/public/images/sci-art/*.{png,PNG,gif,GIF,jpg,JPG,jpeg,JPEG,svg,SVG,webp,WEBP}',
  { eager: false },
)

// Optional overrides, keyed by basename (filename without extension).
export const artMeta = {
  'nobori-lab-logo': {
    title: 'Nobori Lab logo',
    description: '',
  },
}

// Preview preference: animated first, then raster, then vector.
const FORMAT_ORDER = ['gif', 'png', 'jpg', 'jpeg', 'webp', 'svg']

const groups = {}
for (const path of Object.keys(fileModules)) {
  const src = path.replace('/public', '') // → /images/sci-art/foo.png
  const filename = src.split('/').pop()
  const dot = filename.lastIndexOf('.')
  const base = filename.slice(0, dot)
  const format = filename.slice(dot + 1).toLowerCase()
  if (!groups[base]) groups[base] = []
  groups[base].push({ src, filename, format })
}

function titleFromBase(base) {
  const words = base.replace(/[-_]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const sciArtItems = Object.keys(groups)
  .sort((a, b) => a.localeCompare(b))
  .map((base) => {
    const files = groups[base].sort(
      (a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format),
    )
    const meta = artMeta[base] || {}
    return {
      id: base,
      title: meta.title || titleFromBase(base),
      description: meta.description || '',
      preview: files[0].src,
      files,
    }
  })
