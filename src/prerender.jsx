/* eslint-disable react-refresh/only-export-components -- build-time module, never hot-reloaded */
// Build-time entry: renders each page to an HTML string (scripts/prerender.mjs).
// Not part of the browser bundle.
import { renderToString } from 'react-dom/server'
import { SiteContent } from './App.jsx'
import TopicPage from './components/TopicPage.jsx'
import { topics } from './data/topics'
import { SITE_URL } from './data/identity'

export { SITE_URL }

// Every page of the site. `head` is null for the home page, whose <head> is
// index.html as written.
export const routes = [
  { path: '/', head: null, render: () => renderToString(<SiteContent />) },
  ...topics.map((topic) => ({
    path: topic.path,
    head: { title: topic.metaTitle, description: topic.metaDescription },
    render: () => renderToString(<TopicPage topic={topic} />),
  })),
]
