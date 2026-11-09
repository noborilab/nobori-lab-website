// Sends a Google Analytics event when a visitor follows a link to a paper, PDF,
// protocol, dataset or code repository, with the section it was clicked in.
// One delegated listener; does nothing if analytics is blocked or absent.

function linkType(url) {
  const { hostname, pathname } = url
  if (/\.pdf$/i.test(pathname) || hostname === 'drive.google.com') return 'pdf'
  if (hostname === 'github.com') return 'code'
  if (hostname.endsWith('protocols.io')) return 'protocol'
  if (hostname === 'zenodo.org') return 'poster'
  if (/atlas/i.test(hostname)) return 'data'
  if (/(^|\.)(doi\.org|nature\.com|cell\.com|science\.org|pnas\.org|biorxiv\.org|embopress\.org|wiley\.com|oup\.com)$/.test(hostname)) return 'paper'
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(hostname)) return 'video'
  return 'other'
}

export function trackResourceClicks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a[href]')
    if (!link || typeof window.gtag !== 'function') return
    let url
    try {
      url = new URL(link.href, window.location.href)
    } catch {
      return
    }
    const isFile = /\.pdf$/i.test(url.pathname)
    if (url.origin === window.location.origin && !isFile) return
    if (!/^https?:$/.test(url.protocol)) return

    window.gtag('event', 'resource_click', {
      link_type: linkType(url),
      link_url: url.href,
      link_text: link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
      page_section: link.closest('section[id], [id="resources"]')?.id || 'page',
    })
  })
}
