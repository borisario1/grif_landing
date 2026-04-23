import { Suspense } from "react";
import { CatalogSection } from "@/components/CatalogSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SocialProofSection } from "@/components/SocialProofSection";
import { Stage2HooksSection } from "@/components/Stage2HooksSection";
import { TrustSection } from "@/components/TrustSection";
import { ValuePropositionSection } from "@/components/ValuePropositionSection";
import { products } from "@/data/products";

export default function HomePage() {
  const maxSaving = products.reduce((max, product) => Math.max(max, product.saving), 0);

  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <ValuePropositionSection />
      <SocialProofSection maxSaving={maxSaving} />
      <Suspense fallback={null}>
        <CatalogSection />
      </Suspense>
      <TrustSection />
      <Stage2HooksSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
