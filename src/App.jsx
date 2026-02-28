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
import PhotoBreak from './components/PhotoBreak'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <News />
        <Research />
        <PhotoBreak
          src="/images/team/group-photo.jpg"
          alt="Nobori Lab group photo"
          caption="Nobori Lab, TSL"
        />
        <Projects />
        <Publications />
        <PhotoBreak
          src="/images/lab/20250327_VIB.JPG"
          alt="VIB Conference 2025"
          caption="VIB Conference, Antwerp 2025"
        />
        <OnlineTalks />
        <CV />
        <Team />
        <Gallery />
        <PhotoBreak
          src="/images/lab/IMG_0669.jpg"
          alt="The Sainsbury Laboratory"
          caption="The Sainsbury Laboratory"
        />
        <Contact />
        <Funders />
      </main>
      <Footer />
    </>
  )
}
