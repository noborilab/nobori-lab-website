import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import Research from './components/Research'
import ParallaxBreak from './components/ParallaxBreak'
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
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Research />
        <ParallaxBreak gradient="linear-gradient(135deg, #2E3A5C 0%, #1C1E22 60%, #6B8F6B 100%)" />
        <Projects />
        <News />
        <ParallaxBreak gradient="linear-gradient(135deg, #6B8F6B 0%, #2E3A5C 50%, #C85A3A 100%)" />
        <Publications />
        <Team />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
