import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import ServiceGrid from "@/components/ServiceGrid";
import CommunityBanner from "@/components/CommunityBanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />
        <ServiceGrid />
        <CommunityBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
