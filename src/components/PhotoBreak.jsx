export default function PhotoBreak({ src, alt, caption }) {
  return (
    <div className="relative w-full h-[250px] overflow-hidden">
      <img
        src={import.meta.env.BASE_URL + src.replace(/^\//, '')}
        alt={alt || ''}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />
      {/* Optional caption */}
      {caption && (
        <p className="absolute bottom-3 right-4 font-mono text-[10px] text-white/50 tracking-wide">
          {caption}
        </p>
      )}
    </div>
  )
}
