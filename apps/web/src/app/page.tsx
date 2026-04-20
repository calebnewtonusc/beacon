import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SchemaGallery } from "@/components/schema-gallery";
import { Architecture } from "@/components/architecture";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SchemaGallery />
      <Architecture />
      <CTA />
      <Footer />
    </main>
  );
}
