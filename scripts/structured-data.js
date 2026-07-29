// Builds Schema.org JSON-LD from the site's data files and returns a Vite
// plugin that injects it into index.html <head> at build/serve time.
// Sourcing from the data modules keeps the structured data from drifting.

import { org, pi, SITE_URL } from '../src/data/identity.js'
import { selected } from '../src/data/publications.js'

const ORG_ID = `${SITE_URL}/#lab`
const PI_ID = `${SITE_URL}/#pi`

function organizationNode() {
  return {
    '@type': ['Organization', 'ResearchOrganization'],
    '@id': ORG_ID,
    name: org.name,
    url: org.url,
    logo: org.logo,
    email: org.email,
    parentOrganization: { '@type': 'Organization', name: org.parent.name, url: org.parent.url },
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.street,
      addressLocality: org.address.locality,
      postalCode: org.address.postalCode,
      addressCountry: org.address.country,
    },
    founder: { '@id': PI_ID },
    member: { '@id': PI_ID },
  }
}

function personNode() {
  return {
    '@type': 'Person',
    '@id': PI_ID,
    name: pi.name,
    jobTitle: pi.jobTitle,
    image: pi.image,
    url: `${SITE_URL}/#cv`,
    affiliation: { '@id': ORG_ID },
    worksFor: { '@id': ORG_ID },
    knowsAbout: pi.knowsAbout,
    sameAs: pi.sameAs,
  }
}

function publicationNodes() {
  return selected
    .filter((p) => p.link)
    .map((p) => ({
      '@type': 'ScholarlyArticle',
      name: p.title,
      headline: p.title,
      datePublished: String(p.year),
      url: p.link,
      isPartOf: { '@type': 'Periodical', name: p.journal },
      author: { '@id': PI_ID },
      publisher: { '@id': ORG_ID },
    }))
}

export function buildStructuredData() {
  const graph = [organizationNode(), personNode(), ...publicationNodes()]
  return { '@context': 'https://schema.org', '@graph': graph }
}

// Escape the two characters that can break out of a <script> context or an
// HTML attribute; JSON.stringify handles the rest.
function safeJson(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/&/g, '\\u0026')
}

export function structuredDataPlugin() {
  return {
    name: 'nobori-structured-data',
    transformIndexHtml(html) {
      const tag = `<script type="application/ld+json">${safeJson(buildStructuredData())}</script>`
      return html.replace('</head>', `    ${tag}\n  </head>`)
    },
  }
}
