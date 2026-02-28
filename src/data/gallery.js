export const labMoments = [
  {
    id: 'gp-202602',
    date: 'February 2026',
    caption: 'Group photo',
    src: '/images/lab/group_photo/20260214_group_photo.jpg',
  },
  {
    id: 'gp-202411',
    date: 'November 2024',
    caption: 'Group photo',
    src: '/images/lab/group_photo/20241101_group_photo.jpg',
  },
  {
    id: 'gp-202409',
    date: 'September 2024',
    caption: 'Group photo',
    src: '/images/lab/group_photo/20240925_group_photo.jpg',
  },
]

// Auto-detect images from year folders at build time.
// To add photos: just drop files into public/images/lab/<year>/
// and rebuild. No code changes needed.
const imageModules = import.meta.glob(
  '/public/images/lab/{2024,2025,2026,2027,2028,2029,2030}/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: false },
)

// Parse glob keys into year-grouped arrays
// Keys look like: /public/images/lab/2025/IMG_0260.jpg
const yearMap = {}
for (const path of Object.keys(imageModules)) {
  const stripped = path.replace('/public', '')       // → /images/lab/2025/IMG_0260.jpg
  const parts = stripped.split('/')
  const year = parts[3]
  const filename = parts[parts.length - 1]
  if (!yearMap[year]) yearMap[year] = []
  yearMap[year].push({ src: stripped, name: filename })
}

// Sort years descending, filenames ascending within each year
export const galleryByYear = Object.keys(yearMap)
  .sort((a, b) => b.localeCompare(a))
  .map((year) => ({
    year,
    photos: yearMap[year].sort((a, b) => a.name.localeCompare(b.name)),
  }))
