// Single source of truth for the lab's public identity — used to generate
// Schema.org JSON-LD structured data at build time (see vite.config.js).
// Keep the external profile URLs here in sync with Contact.jsx.

export const SITE_URL = 'https://noborilab.org'

export const org = {
  name: 'Nobori Lab',
  url: SITE_URL,
  logo: `${SITE_URL}/images/lab-logo.png`,
  parent: {
    name: 'The Sainsbury Laboratory',
    url: 'https://www.tsl.ac.uk',
  },
  address: {
    street: 'Norwich Research Park',
    locality: 'Norwich',
    postalCode: 'NR4 7UH',
    country: 'GB',
  },
  email: 'Tatsuya.Nobori@tsl.ac.uk',
}

export const pi = {
  name: 'Tatsuya Nobori',
  jobTitle: 'Group Leader',
  image: `${SITE_URL}/images/team/tatsuya-nobori.jpg`,
  knowsAbout: [
    'Plant-microbe interactions',
    'Plant immunity',
    'Single-cell omics',
    'Spatial omics',
    'Single-cell and spatial transcriptomics',
  ],
  // Keep in sync with the links list in src/components/Contact.jsx
  sameAs: [
    'https://scholar.google.com/citations?user=35_IIHgAAAAJ&hl=en',
    'https://bsky.app/profile/tatsuyanobori.bsky.social',
    'https://twitter.com/nobolly',
    'https://www.tsl.ac.uk/our-work/scientific-groups/tatsuya-nobori-group',
    'https://www.the-scientist.com/living-maps-uncovering-the-spatial-biology-of-plants-73690',
  ],
}
