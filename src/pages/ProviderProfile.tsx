import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { repositoryFactory } from '@/services/repositories/factory';
import { ProviderProfile as ProviderProfileType, ListingMaster, Review } from '@/types/domain';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    MessageCircle,
    Share2,
    MapPin,
    Award,
    Star,
    Clock,
    TrendingUp,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useConfigStore } from '@/stores/configStore';
import { getTranslation } from '@/stores/listingStore';

export default function ProviderProfile() {
    const { providerId } = useParams<{ providerId: string }>();
    const navigate = useNavigate();
    const { language } = useConfigStore();

    const [provider, setProvider] = useState<ProviderProfileType | null>(null);
    const [providerAvatar, setProviderAvatar] = useState<string | undefined>(undefined);
    const [listings, setListings] = useState<ListingMaster[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (providerId) {
            loadProviderData();
        }
    }, [providerId]);

    const loadProviderData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const providerRepo = repositoryFactory.getProviderRepository();
            const listingRepo = repositoryFactory.getListingRepository();
            const reviewRepo = repositoryFactory.getReviewRepository();

            // 1. Load provider profile
            const providerData = await providerRepo.getById(providerId!);
            if (!providerData) {
                setError(language === 'zh' ? '提供商未找到' : 'Provider not found');
                return;
            }
            setProvider(providerData);

            // 1.1 Fetch User Avatar
            const { data: userData } = await supabase
                .from('user_profiles')
                .select('avatar')
                .eq('id', providerData.userId)
                .single();

            if (userData) {
                setProviderAvatar(userData.avatar);
            }

            // 2. Load all provider's published services
            const allListings = await listingRepo.getAll();
            const providerListings = allListings.filter(
                l => l.providerId === providerId && l.status === 'PUBLISHED'
            );
            setListings(providerListings);

            // 3. Load cross-service reviews
            if (providerListings.length > 0) {
                const reviewsPromises = providerListings.map(listing =>
                    reviewRepo.getByListing(listing.id)
                );
                const reviewsNested = await Promise.all(reviewsPromises);
                const allReviews = reviewsNested.flat();
                setReviews(allReviews);
            }
        } catch (err) {
            console.error('Failed to load provider data:', err);
            setError(language === 'zh' ? '加载提供商信息失败' : 'Failed to load provider information');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for localized text
    const t = {
        contact: language === 'zh' ? '联系提供商' : 'Contact Provider',
        share: language === 'zh' ? '分享' : 'Share',
        verified: language === 'zh' ? '已认证' : 'Verified',
        elite: language === 'zh' ? '精英邻居' : 'Elite Neighbor',
        reviews: language === 'zh' ? '条评价' : 'reviews',
        services: language === 'zh' ? '个服务' : 'Services',
        years: language === 'zh' ? '年经验' : 'years exp',
        year: language === 'zh' ? '年经验' : 'year exp',
        activeFor: language === 'zh' ? '从业' : 'Active for',
        tabServices: language === 'zh' ? '服务' : 'Services',
        tabReviews: language === 'zh' ? '评价' : 'Reviews',
        tabAbout: language === 'zh' ? '关于' : 'About',
        noServices: language === 'zh' ? '暂无可用服务' : 'No services available yet',
        noReviews: language === 'zh' ? '暂无评价' : 'No reviews yet',
        aboutTitle: language === 'zh' ? '关于此提供商' : 'About This Provider',
        experience: language === 'zh' ? '经验' : 'Experience',
        certifications: language === 'zh' ? '认证资质' : 'Certifications',
        serviceArea: language === 'zh' ? '服务范围' : 'Service Area',
        bio: language === 'zh' ? '简介' : 'Bio',
        from: language === 'zh' ? '来自服务' : 'From',
        neighborStory: language === 'zh' ? '邻里故事' : 'Neighbor Story',
        providerNotFound: language === 'zh' ? '提供商未找到' : 'Provider Not Found',
        backToHome: language === 'zh' ? '返回首页' : 'Back to Home',
        providerNotFoundDesc: language === 'zh' ? '您查找的提供商不存在。' : 'The provider you are looking for does not exist.',
        defaultBio: language === 'zh' ? '专业服务提供商' : 'Professional service provider'
    };

    // Get display content based on language
    const businessName = language === 'zh'
        ? (provider?.businessNameZh || provider?.businessNameEn)
        : (provider?.businessNameEn || provider?.businessNameZh);

    const description = language === 'zh'
        ? (provider?.descriptionZh || provider?.descriptionEn)
        : (provider?.descriptionEn || provider?.descriptionZh);

    // Calculate aggregated stats
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const handleContactProvider = () => {
        navigate('/chat', { state: { providerId } });
    };

    const handleShareProfile = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: businessName || 'Provider Profile',
                url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert(language === 'zh' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container max-w-6xl py-20 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-muted rounded-xl" />
                        <div className="h-64 bg-muted rounded-xl" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container max-w-6xl py-20 text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">
                        {t.providerNotFound}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || t.providerNotFoundDesc}
                    </p>
                    <Button onClick={() => navigate('/')}>
                        {t.backToHome}
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    // Calculate years active
    const joinedDate = new Date(provider.createdAt);
    const yearsActive = Math.max(1, new Date().getFullYear() - joinedDate.getFullYear());

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
            <Header />

            <div className="container max-w-6xl py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-8 mb-8 bg-gradient-to-br from-white to-primary/5">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="shrink-0">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                                    <AvatarImage src={providerAvatar} alt={businessName} />
                                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                                        {businessName?.[0] || 'P'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Provider Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-black">{businessName}</h1>

                                    {/* Badges */}
                                    {provider.isVerified && (
                                        <Badge variant="default" className="gap-1 bg-blue-600">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {t.verified}
                                        </Badge>
                                    )}

                                    {avgRating >= 4.8 && reviews.length >= 20 && (
                                        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                            <Award className="w-3 h-3" />
                                            {t.elite}
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-muted-foreground mb-4 max-w-2xl">
                                    {description || t.defaultBio}
                                </p>

                                {/* Stats Row */}
                                <div className="flex flex-wrap gap-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                        <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                                        <span className="text-sm text-muted-foreground">
                                            ({reviews.length} {t.reviews})
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">
                                            {listings.length} {t.services}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {yearsActive > 1 ? `${yearsActive} ${t.years}` : `1 ${t.year}`}
                                        </span>
                                    </div>

                                    {provider.location?.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {provider.location.address}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button onClick={handleContactProvider} className="gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        {t.contact}
                                    </Button>
                                    <Button variant="outline" onClick={handleShareProfile} className="gap-2">
                                        <Share2 className="w-4 h-4" />
                                        {t.share}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Tabs Section */}
                <Tabs defaultValue="services" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                        <TabsTrigger value="services">
                            {t.tabServices} ({listings.length})
                        </TabsTrigger>
                        <TabsTrigger value="reviews">
                            {t.tabReviews} ({reviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="about">
                            {t.tabAbout}
                        </TabsTrigger>
                    </TabsList>

                    {/* Services Tab */}
                    <TabsContent value="services" className="space-y-6">
                        {listings.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">
                                    {t.noServices}
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <motion.div
                                        key={listing.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ListingCard item={listing} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-6">
                        {reviews.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-muted-foreground">
                                    {t.noReviews}
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => {
                                    const serviceListing = listings.find(l => l.id === review.listingId);
                                    return (
                                        <Card key={review.id} className="p-6">
                                            {/* Review Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={review.buyerAvatar} />
                                                        <AvatarFallback>{review.buyerName?.[0] || 'N'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{review.buyerName || 'Neighbor'}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating
                                                                            ? 'text-amber-500 fill-amber-500'
                                                                            : 'text-muted stroke-muted'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {serviceListing && (
                                                    <Link
                                                        to={`/service/${serviceListing.id}`}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        {t.from}: {getTranslation(serviceListing, 'title', language === 'zh' ? 'Zh' : 'En')}
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Review Content */}
                                            <p className="text-sm leading-relaxed mb-4">{review.content}</p>

                                            {/* Media Gallery */}
                                            {review.media && Array.isArray(review.media) && review.media.length > 0 && (
                                                <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-none">
                                                    {review.media.map((url, i) => (
                                                        <div key={i} className="min-w-[120px] h-[120px] rounded-2xl overflow-hidden border border-muted/20 shadow-sm shrink-0 group/img cursor-pointer">
                                                            <img
                                                                src={url}
                                                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                                                alt="Review media"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120?text=Image+Error';
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Neighbor Story Badge */}
                                            {review.isNeighborStory && (
                                                <Badge variant="secondary" className="mt-3">
                                                    ⭐ {t.neighborStory}
                                                </Badge>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* About Tab */}
                    <TabsContent value="about">
                        <Card className="p-8">
                            <h3 className="text-xl font-bold mb-6">
                                {t.aboutTitle}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {t.experience}
                                    </h4>
                                    <p className="text-muted-foreground">
                                        {t.activeFor} {yearsActive} {yearsActive > 1 ? (language === 'zh' ? '年' : 'years') : (language === 'zh' ? '年' : 'year')}
                                    </p>
                                </div>

                                {provider.licenseInfo && (
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-primary" />
                                            {t.certifications}
                                        </h4>
                                        <p className="text-muted-foreground">{provider.licenseInfo}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {t.serviceArea}
                                    </h4>
                                    <p className="text-muted-foreground">
                                        {provider.location?.address || 'Ottawa, ON'}
                                    </p>
                                </div>

                                {description && (
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            {t.bio}
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
