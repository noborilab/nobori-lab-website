import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import CV from './components/CV'
import Mission from './components/Mission'
import LabVideo from './components/LabVideo'
import Projects from './components/Projects'
import News from './components/News'
import Publications from './components/Publications'
import OnlineTalks from './components/OnlineTalks'
import Team from './components/Team'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Funders from './components/Funders'
import Footer from './components/Footer'
import EasterEgg from './components/EasterEgg'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  return (
    <>
      <LoadingScreen />
      <EasterEgg />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Mission />
        <LabVideo />
        <Projects />
        <Publications />
        <OnlineTalks />
        <CV />
        <Team />
        <Gallery />
        <News />
        <Contact />
        <Funders />
      </main>
      <Footer />
    </>
  )
}
