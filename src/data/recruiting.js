// Set active: false once the position is filled — removes every touchpoint
// (hero line, navbar pill, Team-section callout). The news item in news.js
// is separate: reword or delete it manually when the position closes.
export const recruiting = {
  active: true,
  title: 'Research Assistant or Postdoctoral Researcher',
  group: 'Nobori group',
  shortText: "We're hiring: Research Assistant / Postdoc in plant immunity imaging",
  summary:
    'Fluorescence microscopy and 3D live-cell imaging combined with PHYTOMap spatial transcriptomics to study plant immunity.',
  salary: '£31,236 to £46,049',
  deadline: 'Apply by 23:59 (UK), 14 September 2026',
  reference: 'TN02-2026',
  contract: '24 months initially',
  url: 'https://www.tsl.ac.uk/working-at-tsl/current-opportunities/173302',
}

// Informal expressions-of-interest call. Set active: false to remove its
// hero pill and Team-section card. Full copy lives in Team.jsx.
export const expressionsOfInterest = {
  active: true,
  code: 'REGGEN-2026',
  title: 'Regulatory genomics and machine learning',
  shortText: 'Expressions of interest: regulatory genomics & machine learning',
}
