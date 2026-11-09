import { projects } from './projects'
import { selected, originalArticles, reviews } from './publications'

// Stand-alone pages for a method or discovery: /<slug>/ (see src/components/TopicPage.jsx).
// Each page gathers what is already on the site about one topic: the project
// text and media from projects.js, the papers from publications.js (by id) and
// the project's resource links. Nothing is written twice: edit those files and
// the page follows.
//
// To add a page: add an entry here. To add an FAQ, fill `faq` with
// { q: '...', a: '...' } items; the section only appears when there are some.
const topicList = [
  {
    slug: 'primer-cells',
    kind: 'Discovery',
    title: 'PRIMER cells',
    projectId: 'sc-spatial',
    paperIds: ['s3', 's1'],
    faq: [],
  },
  {
    slug: 'phytomap',
    kind: 'Method',
    title: 'PHYTOMap',
    projectId: 'phytomap',
    paperIds: ['s5'],
    faq: [],
  },
]

const allPapers = [...selected, ...originalArticles, ...reviews]

// First sentence or two of the project text, for <meta name="description">.
function summarise(text, max = 170) {
  let out = ''
  for (const sentence of text.split(/(?<=\.)\s+/)) {
    if (out && (out + ' ' + sentence).length > max) break
    out = out ? `${out} ${sentence}` : sentence
  }
  return out
}

export const topics = topicList.map((topic) => {
  const project = projects.find((p) => p.id === topic.projectId)
  return {
    ...topic,
    path: `/${topic.slug}/`,
    project,
    papers: topic.paperIds.map((id) => allPapers.find((p) => p.id === id)).filter(Boolean),
    metaTitle: `${topic.title} | Nobori Lab`,
    metaDescription: summarise(project.description),
  }
})

export const topicForPath = (pathname) => {
  const clean = pathname.replace(/\/+$/, '').replace(/\/index\.html$/, '')
  return topics.find((t) => `/${t.slug}` === clean) ?? null
}

export const topicForProject = (projectId) => topics.find((t) => t.projectId === projectId) ?? null
