import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Research from './components/Research'
import Projects from './components/Projects'
import News from './components/News'
import Publications from './components/Publications'
import Team from './components/Team'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Research />
        <Projects />
        <News />
        <Publications />
        <Team />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
