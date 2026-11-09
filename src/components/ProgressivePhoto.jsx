import { useState } from 'react'

// Lightbox image that has its final size straight away: when the aspect ratio
// is known, the box is sized from it and shows the (already cached) thumbnail
// until the full-size file arrives. Without a ratio it is a plain image.
export default function ProgressivePhoto({ src, thumb, ratio, alt, radius = 0, style, onClick }) {
  const [loaded, setLoaded] = useState(false)

  if (!ratio) {
    return (
      <img
        src={src}
        alt={alt}
        decoding="async"
        onClick={onClick}
        style={{ maxWidth: '80vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: radius, ...style }}
      />
    )
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: `min(80vw, calc(85vh * ${ratio}))`,
        aspectRatio: String(ratio),
        borderRadius: radius,
        overflow: 'hidden',
        backgroundImage: thumb ? `url("${thumb}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
      />
    </div>
  )
}
