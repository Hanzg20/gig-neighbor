import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { useCommunity } from "@/context/CommunityContext";
import { useConfigStore } from "@/stores/configStore";
import { TodayStories } from "@/components/home/TodayStories";
import { IndustryIconGrid } from "@/components/home/IndustryIconGrid";
import { PopularInCommunity } from "@/components/home/PopularInCommunity";
import { LocationSelector } from "@/components/home/LocationSelector";
import { PromoBanner } from "@/components/home/PromoBanner";
import { TaskBoard } from "@/components/home/TaskBoard";
import { ArrowRight, Sparkles, TrendingUp, Clock, MapPin } from "lucide-react";
import { SmartSearchBar } from "@/components/SmartSearchBar";
import { Link, useNavigate } from "react-router-dom";
import { ListingMaster } from "@/types/domain";
import { ListingCard } from "@/components/ListingCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { repositoryFactory } from "@/services/repositories/factory";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();
  const { listings, setListings } = useListingStore();
  const { currentUser } = useAuthStore();
  const { activeNodeId } = useCommunity();
  const { refCodes, setRefCodes, language } = useConfigStore();
  const [isLoading, setIsLoading] = useState(true);

  // Localization Dictionary
  const t = {
    currentCommunity: language === 'zh' ? '当前社区' : 'Current Community',
    aiSearch: language === 'zh' ? 'AI搜索' : 'AI Search',
    pulse: language === 'zh' ? '社区脉搏' : 'Community Pulse',
    liveUpdates: language === 'zh' ? '实时更新' : 'Live Updates',
    marketTitle: language === 'zh' ? '美食市集' : 'Community Market',
    marketDesc: language === 'zh' ? '自家制作美食与二手好物' : 'Homemade treats and local finds',
    viewAll: language === 'zh' ? '查看全部' : 'View All',
    serviceTitle: language === 'zh' ? '生活服务' : 'Life Services',
    serviceDesc: language === 'zh' ? '让生活更轻松的日常帮助' : 'Everyday help for a better life',
    rentalTitle: language === 'zh' ? '共享租赁' : 'Rentals',
    rentalDesc: language === 'zh' ? '以租代买，省钱更环保' : 'Rent instead of buying, save more',
    emptyTitle: language === 'zh' ? '社区正在建设中' : 'Community Under Construction',
    emptyDesc: language === 'zh' ? '很快就会有更多精彩服务上线' : 'More exciting services coming soon',
    beFirst: language === 'zh' ? '成为第一个发布者' : 'Be the First to Post',
  };

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
      setIsLoading(true);
      try {
        const listingRepo = repositoryFactory.getListingRepository();
        const nodeListings = await listingRepo.getByNode(activeNodeId);
        console.log(`📦 Loaded ${nodeListings.length} listings for node ${activeNodeId}`);
        setListings(nodeListings);
      } catch (error) {
        console.error('Failed to load node listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNodeListings();
  }, [activeNodeId, setListings]);

  // Filter listings by type
  const services = listings.filter(l => l.type === 'SERVICE');
  const rentals = listings.filter(l => l.type === 'RENTAL');
  const goods = listings.filter(l => l.type === 'GOODS');
  const tasks = listings.filter(l => l.type === 'TASK');

  // Get nearby hot services (top 10 by rating)
  const nearbyHotServices = [...services, ...rentals]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  // Section animation variants
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-20">
      <Header />

      {/* Hero Section with Glassmorphism */}
      {/* Hero Section - Compact & Active */}
      <div className="relative bg-background border-b border-border shadow-sm overflow-hidden">
        {/* Animated Background - Enhanced Mesh Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(var(--background),0.8)_100%)]" />
        </div>

        <div className="container relative py-3 sm:py-4 px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4">

            {/* Top Row: Location & Stats (Compact) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <LocationSelector />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-2 sm:px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="hidden md:inline">{t.liveUpdates}</span>
              </div>
            </motion.div>

            {/* Middle Row: Search (Prominent but concise) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-4xl mx-auto relative z-10"
            >
              <SmartSearchBar />
              {/* Floating AI badge - Closer integration */}
              <div className="absolute -top-2 sm:-top-3 right-0 md:-right-4">
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 shadow-sm backdrop-blur-md">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-primary" />
                  {t.aiSearch}
                </Badge>
              </div>
            </motion.div>

            {/* Bottom Row: Industry Icons Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-1 sm:pt-2"
            >
              <IndustryIconGrid />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Promotional Banner - Elegant Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <PromoBanner />
      </motion.div>

      <main className="container max-w-7xl py-4 sm:py-8 px-4 sm:px-6 space-y-8 sm:space-y-16">
        {/* Popular In Community - Enhanced Card Design */}
        {nearbyHotServices.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="py-1"
          >
            <PopularInCommunity listings={nearbyHotServices} />
          </motion.section>
        )}

        {/* Today Stories with enhanced styling */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-1"
        >
          <TodayStories />
        </motion.section>

        {/* Task Board with gradient background */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="relative py-1"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 rounded-3xl blur-3xl opacity-30" />
          <div className="relative">
            <TaskBoard />
          </div>
        </motion.section>

        {/* Goods Section with loading state */}
        {(goods.length > 0 || isLoading) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 p-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-2xl shadow-sm border border-orange-200/50">
                  🍪
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                    {t.marketTitle}
                    <Sparkles className="w-5 h-5 text-orange-400" />
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.marketDesc}</p>
                </div>
              </div>
              <Link
                to="/category/goods"
                className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">{t.viewAll}</span>
                <span className="sm:hidden">{language === 'zh' ? '全部' : 'All'}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                >
                  {goods.slice(0, 8).map(item => (
                    <motion.div key={item.id} variants={cardVariants}>
                      <ListingCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Services Section with enhanced grid */}
        {(services.length > 0 || isLoading) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  🧹 {t.serviceTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.serviceDesc}</p>
              </div>
              <Link
                to="/category/service"
                className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">{t.viewAll}</span>
                <span className="sm:hidden">{language === 'zh' ? '全部' : 'All'}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  {services.slice(0, 6).map(item => (
                    <motion.div key={item.id} variants={cardVariants}>
                      <ListingCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Rental Section with card animations */}
        {(rentals.length > 0 || isLoading) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  📸 {t.rentalTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.rentalDesc}</p>
              </div>
              <Link
                to="/category/rental"
                className="group flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">{t.viewAll}</span>
                <span className="sm:hidden">{language === 'zh' ? '全部' : 'All'}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                >
                  {rentals.slice(0, 6).map(item => (
                    <motion.div key={item.id} variants={cardVariants}>
                      <ListingCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Empty State when no listings */}
        {!isLoading && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.emptyTitle}</h3>
            <p className="text-muted-foreground mb-6">{t.emptyDesc}</p>
            <button
              onClick={() => navigate('/post-gig')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {t.beFirst}
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;