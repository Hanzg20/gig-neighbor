import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceGrid from "@/components/ServiceGrid";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServiceGrid />
      <BottomNav />
    </div>
  );
};

export default Index;
