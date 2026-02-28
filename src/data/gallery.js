const placeholderColors = [
  '#6B8F6B', '#2E3A5C', '#C85A3A', '#8B7355', '#4A6E4A',
  '#5C6E8F', '#A0522D', '#708090', '#6B8F6B', '#2E3A5C',
  '#C85A3A', '#4A6E4A',
]

function makePlaceholders(count, offset = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i,
    src: null,
    color: placeholderColors[(offset + i) % placeholderColors.length],
    alt: `Photo ${offset + i + 1}`,
  }))
}

export const galleryAlbums = [
  {
    id: 'lab',
    title: 'Lab Life',
    images: makePlaceholders(8, 0),
  },
  {
    id: 'conferences',
    title: 'Conferences',
    images: makePlaceholders(6, 8),
  },
  {
    id: 'norwich',
    title: 'Norwich',
    images: makePlaceholders(5, 14),
  },
]
