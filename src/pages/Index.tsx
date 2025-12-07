import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrustArchitecture } from "@/components/TrustArchitecture";
import { InfoCards } from "@/components/InfoCards";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Hero />
      <TrustArchitecture />
      <InfoCards />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
