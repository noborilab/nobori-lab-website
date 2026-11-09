import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TopicPage from './components/TopicPage.jsx'
import { topicForPath } from './data/topics'
import { trackResourceClicks } from './lib/analytics'

// /phytomap/ and /primer-cells/ are pages of their own; everything else is the
// one-page site. The static HTML already in #root (written at build time for
// search engines and link previews) is replaced by this render.
const topic = topicForPath(window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {topic ? <TopicPage topic={topic} /> : <App />}
  </StrictMode>,
)

trackResourceClicks()
