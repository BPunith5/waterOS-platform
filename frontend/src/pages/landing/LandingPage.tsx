import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { SocialProof } from './sections/SocialProof';
import { Pricing } from './sections/Pricing';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#01040F' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
