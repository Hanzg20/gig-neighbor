
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListingStore, getTranslation } from "@/stores/listingStore";
import { useProviderStore } from "@/stores/providerStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { ListingMaster, ListingItem, Order } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Share2, Check, Shield, Award, MapPin, MessageCircle, Star, Sparkles, AlertCircle, Info, Calendar as CalendarIcon, Clock } from "lucide-react";
import { InstantPayFlow } from "@/components/checkout/InstantPayFlow";
import { QuoteRequestFlow } from "@/components/checkout/QuoteRequestFlow";
import { GoodsDetailView } from "@/components/checkout/GoodsDetailView";
import { TaskDetailView } from "@/components/checkout/TaskDetailView";
import { ShareSheet } from "@/components/common/ShareSheet";
import { EnhancedReviewList } from "@/components/reviews/EnhancedReviewList";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { repositoryFactory } from "@/services/repositories/factory";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings } = useListingStore();
  const { getProviderById } = useProviderStore();
  const { refCodes, language } = useConfigStore();
  // const { addOrder } = useOrderStore() as any; 
  const [master, setMaster] = useState<ListingMaster | null>(null);
  const [items, setItems] = useState<ListingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [provider, setProvider] = useState<any>(null);

  // Flow States
  const [isInstantPayOpen, setIsInstantPayOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Rental Date State
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>(undefined);

  // Consult Duration State
  const [consultHours, setConsultHours] = useState(1);

  // Localization Helper
  // NOTE: This can be moved to a separate file but keeping it here for simplicity
  const t = {
    notFound: language === 'zh' ? '未找到服务...' : 'Listing not found...',
    total: language === 'zh' ? '总计' : 'Total',
    deposit: language === 'zh' ? '押金 (可退)' : 'Ref. Deposit',
    day: language === 'zh' ? '天' : 'day',
    hr: language === 'zh' ? '小时' : 'hr',
    ea: language === 'zh' ? '件' : 'ea',
    rentNow: language === 'zh' ? '立即租赁' : 'Rent Now',
    bookTime: language === 'zh' ? '预约时间' : 'Book Time',
    bookNow: language === 'zh' ? '立即预订' : 'Book Now',
    bookVisit: language === 'zh' ? '预约上门' : 'Book Visit',
    requestQuote: language === 'zh' ? '获取报价' : 'Request Quote',
    viewProfile: language === 'zh' ? '查看主页' : 'View Profile',
    merchant: language === 'zh' ? '商家' : 'Merchant',
    neighbor: language === 'zh' ? '邻居' : 'Neighbor',
    vouched: language === 'zh' ? '人担保' : 'Vouched',
    verifiedInsurance: language === 'zh' ? '保险已验证' : 'Verified Insurance',
    professionalLicense: language === 'zh' ? '专业执照' : 'Professional License',
    selectOption: language === 'zh' ? '选择选项' : 'Select Option',
    rentalPeriod: language === 'zh' ? '租赁周期' : 'Rental Period',
    daysTotal: language === 'zh' ? '天总计' : 'Days Total',
    selectedDates: language === 'zh' ? '已选日期' : 'Selected Dates',
    pickRange: language === 'zh' ? '选择日期' : 'Pick a range',
    securityDeposit: language === 'zh' ? '归还后押金将全额退还。' : 'Security deposit is required and fully refundable after return.',
    duration: language === 'zh' ? '时长' : 'Duration',
    hours: language === 'zh' ? '小时' : 'Hours',
    chat: language === 'zh' ? '私信' : 'Chat',
    share: language === 'zh' ? '分享' : 'Share',
  }

  useEffect(() => {
    // Find master from store or fetch (omitted fetch for now, assuming store populated)
    // In real app, perform fetch if not found
    const foundMaster = listings.find(l => l.id === id);

    // Fetch items if master found
    if (foundMaster) {
      setMaster(foundMaster);
      const foundProvider = getProviderById(foundMaster.providerId);


      // If provider not in store, we should fetch it (Critical fix from previous session)
      if (!foundProvider) {
        const loadProvider = async () => {
          const repo = repositoryFactory.getProviderRepository();
          const p = await repo.getById(foundMaster.providerId);
          setProvider(p);
        }
        loadProvider();
      } else {
        setProvider(foundProvider);
      }

      // Simulate fetching items
      // In a real app we would use listingItemRepository.getByMasterId(id)
      const repo = repositoryFactory.getListingItemRepository();
      repo.getByMaster(foundMaster.id).then(loadedItems => {
        setItems(loadedItems);
        if (loadedItems.length > 0) setSelectedItem(loadedItems[0]);
      });
    } else {
      // Only verify "Load Logic" if not found in list (e.g. direct link)
      const loadData = async () => {
        const repo = repositoryFactory.getListingRepository();
        const listing = await repo.getById(id!);
        if (listing) {
          setMaster(listing);
          // Fetch provider
          const providerRepo = repositoryFactory.getProviderRepository();
          const p = await providerRepo.getById(listing.providerId);
          setProvider(p);

          // Fetch Items
          const itemRepo = repositoryFactory.getListingItemRepository();
          const i = await itemRepo.getByMaster(listing.id);
          setItems(i);
          if (i.length > 0) setSelectedItem(i[0]);
        }
      }
      if (id) loadData();
    }
  }, [id, listings, getProviderById]);


  if (!master) return <div className="p-8 text-center text-muted-foreground">{t.notFound}</div>;

  // --- ROUTING LOGIC ---
  if (master.type === 'GOODS' && selectedItem) {
    return <GoodsDetailView
      master={master}
      item={selectedItem}
      items={items}
      provider={provider}
      onBuy={() => navigate(`/checkout?item_id=${selectedItem.id}`)}
      onChat={() => navigate('/chat')}
      onSelect={setSelectedItem}
    />;
  }

  if (master.type === 'TASK' && selectedItem) {
    // For tasks, provider_id is the Author, so we pass it as author
    return <TaskDetailView
      master={master}
      item={selectedItem}
      author={provider}
      onQuote={() => navigate(`/checkout?item_id=${selectedItem.id}`)}
      onChat={() => navigate('/chat')}
    />;
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % master.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + master.images.length) % master.images.length);

  const categoryInfo = refCodes.find(r => r.codeId === master.categoryId);

  // --- Dynamic Pricing & Action Section ---
  const calculateTotal = () => {
    if (!selectedItem) return 0;
    const basePrice = selectedItem.pricing.price.amount;

    if (master.type === 'RENTAL' && dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) || 1;
      return (basePrice * days) + (selectedItem.pricing.deposit?.amount || 0);
    }

    if (master.type === 'CONSULTATION') {
      return basePrice * consultHours;
    }

    return basePrice;
  };

  const renderPricingCard = () => {
    // 1. Negotiable Mode: Hide price, show status
    if (master.attributes?.pricingMode === 'NEGOTIABLE') {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-black text-primary">{language === 'zh' ? '价格面议' : 'Negotiable'}</span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {language === 'zh' ? '请联系商家确认' : 'Please contact provider'}
          </p>
        </div>
      );
    }

    // 2. Quote Mode: Show "Visit Fee" or "Request Quote"
    if (master.attributes?.pricingMode === 'QUOTE') {
      if (!selectedItem) return null;
      const basePrice = selectedItem.pricing.price.amount;
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-black text-primary">
            {basePrice > 0 ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(basePrice / 100) : (language === 'zh' ? '免费询价' : 'Free Quote')}
          </span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {basePrice > 0 ? (language === 'zh' ? '上门/预订费' : 'Booking Fee') : (language === 'zh' ? '需确认最终报价' : 'Price TBD')}
          </p>
        </div>
      );
    }

    // 3. Fixed Mode (Default)
    if (!selectedItem) return null;
    const { pricing } = selectedItem;
    const total = calculateTotal();
    const formattedTotal = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(total / 100);

    return (
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary">{formattedTotal}</span>
          {master.type !== 'GOODS' && (
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t.total}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pricing.price.amount > 0 && (
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ${pricing.price.amount / 100} / {pricing.unit || (master.type === 'RENTAL' ? t.day : master.type === 'CONSULTATION' ? t.hr : t.ea)}
            </p>
          )}
          {pricing.deposit && (
            <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-black border-orange-200 bg-orange-50 text-orange-600 uppercase">
              {t.deposit} ${pricing.deposit.amount / 100}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const getActionButtonText = () => {
    if (master.type === 'RENTAL') return t.rentNow;
    if (master.type === 'CONSULTATION') return t.bookTime;
    return t.bookNow;
  };


  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative h-80 md:h-[450px] bg-muted overflow-hidden">
        <img
          src={master.images[currentImage]}
          alt={getTranslation(master, 'title')}
          className="w-full h-full object-cover transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />

        {/* Glassmorphism Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30 hover:bg-white/40 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setIsLiked(!isLiked)} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30 hover:bg-white/40 transition-all">
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-accent text-accent' : 'text-white'}`} />
            </button>
            <ShareSheet
              title={getTranslation(master, 'title')}
              content={getTranslation(master, 'description')}
              imageUrl={master.images[currentImage]}
              authorName={provider ? getTranslation(provider, 'businessName') : 'Gig Neighbor'}
              authorAvatar={provider ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.id}` : undefined}
              trigger={
                <button className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30 hover:bg-white/40 transition-all">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              }
            />
          </div>
        </div>

        {/* Carousel Indicators (Meituan Style) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
          {master.images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImage ? 'w-4 bg-primary' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="container max-w-4xl px-4 -mt-6 relative z-10">
        <div className="card-warm p-6 mb-6 shadow-glow border-none relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

          {/* Provider Profile (Neighbor Trust Section) */}
          {provider && (
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-white shadow-card">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.id}`} alt="Provider" className="w-full h-full object-cover bg-muted" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black text-foreground tracking-tight">{getTranslation(provider, 'businessName')}</h2>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-tighter uppercase px-2 py-0">
                    {provider.identity === 'MERCHANT' ? t.merchant : t.neighbor}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 rounded-lg">
                    <Star className="w-3 h-3 fill-secondary text-secondary" />
                    <span className="text-xs font-black text-foreground">{provider.stats.averageRating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    <Award className="w-3 h-3 text-primary" />
                    <span>{provider.stats.reviewCount} {t.vouched}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{provider.location.address?.split(',')[0]}</span>
                  </div>
                </div>
                <Link to={`/provider/${master.providerId}`} className="text-xs font-bold text-primary hover:underline mt-1.5 inline-flex items-center gap-1">
                  {t.viewProfile} <span className="text-[10px]">→</span>
                </Link>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">{getTranslation(master, 'title')}</h1>
          </div>

          {categoryInfo && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              <Sparkles className="w-3 h-3" />
              {getTranslation(categoryInfo, 'name')}
            </div>
          )}

          <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
            {getTranslation(master, 'description')}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {master.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-muted/50 rounded-xl text-[10px] font-black text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                <Check className="w-3 h-3 text-primary" /> {tag}
              </span>
            ))}
          </div>

          {/* Trust Indicators (Insurance/License) - Meituan inspired professional transparency */}
          {(provider?.insuranceSummaryEn || provider?.licenseInfo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {provider?.insuranceSummaryEn && (
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-emerald-50/40 border border-emerald-100/50 group hover:bg-emerald-50 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200/50">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">{t.verifiedInsurance}</p>
                    <p className="text-sm font-bold text-emerald-900/80 leading-tight">{provider.insuranceSummaryEn}</p>
                  </div>
                </div>
              )}
              {provider?.licenseInfo && (
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-blue-50/40 border border-blue-100/50 group hover:bg-blue-50 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200/50">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{t.professionalLicense}</p>
                    <p className="text-sm font-bold text-blue-900/80 leading-tight">{provider.licenseInfo}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Multi-tier SKU Picker (Meituan Style Flow) */}
        {items.length > 0 && (
          <div className="mt-8 border-t border-border/10 pt-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full" />
                {t.selectOption}
              </h3>
            </div>
            <div className="grid gap-3">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${selectedItem?.id === item.id ? 'border-primary bg-primary/5 shadow-warm' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
                >
                  {selectedItem?.id === item.id && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedItem?.id === item.id ? 'bg-primary text-white shadow-warm' : 'bg-muted text-muted-foreground'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-black text-sm transition-colors uppercase tracking-tight ${selectedItem?.id === item.id ? 'text-primary' : 'group-hover:text-primary'}`}>{getTranslation(item, 'name')}</p>
                      <p className="text-[11px] font-bold text-muted-foreground/80 lowercase leading-tight">{getTranslation(item, 'description')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-lg tracking-tighter">${item.pricing.price.amount / 100}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50">/{item.pricing.unit || 'hr'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* 3. Type Specific Controls (Dynamic Experience) */}
        {master.type === 'RENTAL' && (
          <div className="card-warm p-6 mb-6 shadow-sm border-none bg-orange-50/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" /> {t.rentalPeriod}
              </h3>
              {dateRange?.from && dateRange?.to && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {differenceInDays(dateRange.to, dateRange.from) || 1} {t.daysTotal}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-black h-16 rounded-2xl border-none bg-white shadow-sm hover:bg-white/80 transition-all px-4",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <div className="flex flex-col">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none">{t.selectedDates}</span>
                          <span className="font-black text-foreground text-sm tracking-tight">
                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                          </span>
                        </div>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="uppercase tracking-widest text-xs">{t.pickRange}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-elevated rounded-3xl overflow-hidden" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={(date) => date < new Date() || date < addDays(new Date(), -1)}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1.5 mt-2 ml-1 px-3 py-2 bg-orange-100/50 rounded-xl border border-orange-200/50">
                <Info className="w-3 h-3 text-orange-600" />
                <p className="text-[10px] font-bold text-orange-700 leading-tight">
                  {t.securityDeposit}
                </p>
              </div>
            </div>
          </div>
        )}

        {master.type === 'CONSULTATION' && (
          <div className="card-warm p-6 mb-6 shadow-sm border-none bg-blue-50/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" /> {t.duration}
              </h3>
              <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                {consultHours} {t.hours}
              </span>
            </div>
            <div className="px-2">
              <Slider
                defaultValue={[consultHours]}
                max={8}
                min={1}
                step={0.5}
                onValueChange={(vals) => setConsultHours(vals[0])}
                className="mb-6"
              />
              <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase opacity-50 px-1">
                <span>1hr</span>
                <span>2hr</span>
                <span>4hr</span>
                <span>8hr</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Enhanced Neighbor Reviews */}
        <div className="container max-w-4xl px-4 py-12 border-t border-border/10">
          <EnhancedReviewList listingId={master.id} />
        </div>
      </div>

      {/* 4. Fixed Bottom Bar (Premium Meituan Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 glass-sticky-bar px-4 py-5 z-50 safe-area-bottom">
        <div className="container max-w-4xl flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-all">
                <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase group-hover:text-primary">{t.chat}</span>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
            {renderPricingCard()}
            {/* Dynamic Buttons based on Pricing Mode */}
            {master.attributes?.pricingMode === 'NEGOTIABLE' ? (
              <Button
                onClick={() => navigate('/chat')}
                className="btn-action h-14 flex-1 max-w-[200px] text-sm font-black uppercase tracking-widest shadow-elevated rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {language === 'zh' ? '联系议价' : 'Contact for Price'}
              </Button>
            ) : master.attributes?.pricingMode === 'QUOTE' ? (
              <Button
                onClick={() => navigate(`/checkout?item_id=${selectedItem?.id || ''}`)}
                className="btn-action h-14 flex-1 max-w-[200px] text-sm font-black uppercase tracking-widest shadow-elevated rounded-2xl bg-blue-600 hover:bg-blue-700"
              >
                {language === 'zh' ? '发起询价' : 'Request Quote'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.append('item_id', selectedItem?.id || '');
                  if (dateRange?.from) params.append('start', dateRange.from.toISOString());
                  if (dateRange?.to) params.append('end', dateRange.to.toISOString());
                  if (consultHours) params.append('hours', consultHours.toString());
                  navigate(`/checkout?${params.toString()}`);
                }}
                className="btn-action h-14 flex-1 max-w-[200px] text-sm font-black uppercase tracking-widest shadow-elevated rounded-2xl"
              >
                {getActionButtonText()}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Instant Pay Flow Wizard */}
      {selectedItem && (
        <InstantPayFlow
          isOpen={isInstantPayOpen}
          onClose={() => setIsInstantPayOpen(false)}
          master={master}
          item={selectedItem}
          dateRange={dateRange}
          consultHours={consultHours}
        />
      )}

      {/* Quote Request Flow */}
      {selectedItem && (
        <QuoteRequestFlow
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          master={master}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
