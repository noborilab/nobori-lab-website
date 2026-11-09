import { projects } from './projects'

// Everything the lab shares openly, in one list (shown as "Tools & data" at the
// foot of the Contributions section). Entries come from the `resources` of each
// project in projects.js, so adding a link there adds it here.
//
// For something that does not belong to a project card, add it to `extra`:
//   { type: 'Code', name: 'Tool name', label: 'Web app', href: 'https://...' }
// `type` is one of the keys of resourceTypes below.
const extra = []

export const resourceTypes = ['Data', 'Protocol', 'Code', 'Poster']

function typeOf(label) {
  if (/^data/i.test(label)) return 'Data'
  if (/^protocol/i.test(label)) return 'Protocol'
  if (/^github|code/i.test(label)) return 'Code'
  if (/^poster/i.test(label)) return 'Poster'
  return 'Data'
}

export const resources = [
  ...projects.flatMap((project) =>
    (project.resources ?? []).map((r) => ({
      type: typeOf(r.label),
      name: project.title,
      label: r.label,
      href: r.href,
    })),
  ),
  ...extra,
]

export const resourcesByType = resourceTypes
  .map((type) => ({ type, items: resources.filter((r) => r.type === type) }))
  .filter((group) => group.items.length > 0)
