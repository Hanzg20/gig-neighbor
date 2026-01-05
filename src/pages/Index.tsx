import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { useCommunity } from "@/context/CommunityContext";
import { useConfigStore } from "@/stores/configStore";
import { TodayStories } from "@/components/home/TodayStories";
import { CategoryIconGrid } from "@/components/home/CategoryIconGrid";
import { PopularInCommunity } from "@/components/home/PopularInCommunity";
import { QuickSearchTags } from "@/components/home/QuickSearchTags";
import { LocationSelector } from "@/components/home/LocationSelector";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import { ListingMaster } from "@/types/domain";
import { ListingCard } from "@/components/ListingCard";
import { repositoryFactory } from "@/services/repositories/factory";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { listings } = useListingStore();
  const { currentUser } = useAuthStore();
  const { activeNodeId } = useCommunity();
  const { refCodes, setRefCodes } = useConfigStore();

  // Load ref codes on mount
  useEffect(() => {
    const loadRefCodes = async () => {
      try {
        const refCodeRepo = repositoryFactory.getRefCodeRepository();
        const codes = await refCodeRepo.getAll();
        setRefCodes(codes);
      } catch (error) {
        console.error('Failed to load ref codes:', error);
      }
    };

    if (refCodes.length === 0) {
      loadRefCodes();
    }
  }, [refCodes.length, setRefCodes]);

  // Load listings for current node
  useEffect(() => {
    const loadNodeListings = async () => {
      try {
        const listingRepo = repositoryFactory.getListingRepository();
        const nodeListings = await listingRepo.getByNode(activeNodeId);
        // Update store if needed - listings are already in store from other pages
      } catch (error) {
        console.error('Failed to load node listings:', error);
      }
    };

    if (listings.length === 0) {
      loadNodeListings();
    }
  }, [activeNodeId, listings.length]);

  // Get node display name
  const nodeInfo = refCodes.find(r => r.codeId === activeNodeId);
  const nodeDisplayName = nodeInfo?.enName || nodeInfo?.zhName || 'Ottawa';

  // Filter listings by type
  const services = listings.filter(l => l.type === 'SERVICE');
  const rentals = listings.filter(l => l.type === 'RENTAL');
  const goods = listings.filter(l => l.type === 'GOODS');
  const tasks = listings.filter(l => l.type === 'TASK');

  // Get nearby hot services (top 10 by rating)
  const nearbyHotServices = [...services, ...rentals]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b border-border/40 sticky top-16 z-40 shadow-sm/50 backdrop-blur-xl">
        <div className="container py-6 md:py-8">
          {/* Location Selector */}
          <LocationSelector />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="max-w-3xl mx-auto mb-4"
          >
            <SearchBar />
          </motion.div>

          {/* Quick Search Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <QuickSearchTags />
          </motion.div>

          {/* Category Icons Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CategoryIconGrid />
          </motion.div>
        </div>
      </div>

      <main className="container max-w-7xl py-8 space-y-12">
        {/* Popular In Community - Horizontal Scroll */}
        {nearbyHotServices.length > 0 && (
          <PopularInCommunity listings={nearbyHotServices} />
        )}

        {/* Today Stories Carousel */}
        <TodayStories />

        {/* Goods / Marketplace Section */}
        {goods.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  🍪 美食市集
                </h2>
                <p className="text-muted-foreground text-sm">Homemade treats and local finds</p>
              </div>
              <Link to="/category/goods" className="text-sm font-semibold text-primary hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {goods.slice(0, 8).map(item => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  🧹 生活服务
                </h2>
                <p className="text-muted-foreground text-sm">Everyday help for a better life</p>
              </div>
              <Link to="/category/service" className="text-sm font-semibold text-primary hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.slice(0, 6).map(item => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Rental Section */}
        {rentals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  📸 共享租赁
                </h2>
                <p className="text-muted-foreground text-sm">Rent instead of buying, save more</p>
              </div>
              <Link to="/category/rental" className="text-sm font-semibold text-primary hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rentals.slice(0, 6).map(item => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  💰 附近任务
                </h2>
                <p className="text-muted-foreground text-sm">Help a neighbor and earn rewards</p>
              </div>
              <Link to="/category/task" className="text-sm font-semibold text-primary hover:underline flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.slice(0, 4).map(item => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;