import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import CV from './components/CV'
import Research from './components/Research'
import Projects from './components/Projects'
import News from './components/News'
import Publications from './components/Publications'
import OnlineTalks from './components/OnlineTalks'
import Team from './components/Team'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Funders from './components/Funders'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <News />
        <Research />
        <Projects />
        <Publications />
        <OnlineTalks />
        <CV />
        <Team />
        <Gallery />
        <Contact />
        <Funders />
      </main>
      <Footer />
    </>
  )
}
