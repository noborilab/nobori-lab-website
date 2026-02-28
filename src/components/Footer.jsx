export default function Footer() {
  return (
    <footer className="bg-navy text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-logo text-lg font-light uppercase tracking-[0.2em] text-white">
            Nobori Lab
          </p>
          <p className="font-mono text-xs mt-1">
            The Sainsbury Laboratory
          </p>
        </div>

        <nav className="flex gap-6 flex-wrap justify-center">
          {['Research', 'Projects', 'Publications', 'Team', 'Contact'].map(
            (link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                {link}
              </a>
            ),
          )}
        </nav>

        <p className="font-mono text-xs">
          &copy; {new Date().getFullYear()} Nobori Lab
        </p>
      </div>
    </footer>
  )
}
