import { Link } from "react-router-dom";
import { Star, MapPin, Tag, TrendingUp, Heart } from "lucide-react";
import { ListingMaster } from "@/types/domain";
import { useListingStore } from "@/stores/listingStore";
import { useProviderStore } from "@/stores/providerStore";
import { useConfigStore } from "@/stores/configStore";
import { VerificationBadge } from "./ui/VerificationBadge";
import { motion } from "framer-motion";
import { useState } from "react";

export const ListingCard = ({ item }: { item: ListingMaster }) => {
    const { listingItems } = useListingStore();
    const { getProviderById } = useProviderStore();
    const { refCodes, language } = useConfigStore();
    const [isFavorited, setIsFavorited] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const provider = getProviderById(item.providerId);
    const items = listingItems.filter(li => li.masterId === item.id);
    const nodeInfo = refCodes.find(r => r.codeId === item.nodeId);

    // Helper for localized text
    const getLocalized = (en?: string, zh?: string) => {
        return language === 'zh' ? (zh || en) : (en || zh);
    };

    const displayTitle = getLocalized(item.titleEn, item.titleZh);
    const displayDesc = getLocalized(item.descriptionEn, item.descriptionZh);
    const displayBusinessName = provider ? getLocalized(provider.businessNameEn, provider.businessNameZh) : '';
    const displayNodeName = nodeInfo ? getLocalized(nodeInfo.enName, nodeInfo.zhName) : undefined;

    // Find the starting price (lowest amount)
    const startingPrice = items.length > 0
        ? items.reduce((min, cur) => cur.pricing.price.amount < min.pricing.price.amount ? cur : min, items[0]).pricing.price
        : null;

    // Type-based styling
    const getTypeConfig = () => {
        switch (item.type) {
            case 'RENTAL':
                return {
                    badge: language === 'zh' ? '租赁' : 'Rental',
                    bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    glowClass: 'group-hover:shadow-blue-500/20'
                };
            case 'CONSULTATION':
                return {
                    badge: language === 'zh' ? '专家' : 'Expert',
                    bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
                    glowClass: 'group-hover:shadow-purple-500/20'
                };
            case 'GOODS':
                return {
                    badge: language === 'zh' ? '集市' : 'Market',
                    bgClass: 'bg-gradient-to-br from-green-500 to-green-600',
                    glowClass: 'group-hover:shadow-green-500/20'
                };
            default:
                return {
                    badge: language === 'zh' ? '服务' : 'Service',
                    bgClass: 'bg-gradient-to-br from-primary to-primary/80',
                    glowClass: 'group-hover:shadow-primary/20'
                };
        }
    };

    const typeConfig = getTypeConfig();

    return (
        <Link to={`/service/${item.id}`} className="group block h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative bg-card rounded-2xl overflow-hidden h-full border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl ${typeConfig.glowClass}`}
            >
                {/* Image Section with Enhanced Overlays */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {/* Skeleton loader */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
                    )}

                    <img
                        src={item.images[0]}
                        alt={displayTitle}
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Gradient Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Rating Badge */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                    >
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-foreground">{item.rating}</span>
                    </motion.div>

                    {/* Type Badge */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`absolute top-3 left-3 ${typeConfig.bgClass} text-white px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm`}
                    >
                        {typeConfig.badge}
                    </motion.div>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsFavorited(!isFavorited);
                        }}
                        className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <Heart className={`w-4 h-4 transition-all ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>

                    {/* Trending indicator if rating > 4.5 */}
                    {item.rating && item.rating > 4.5 && (
                        <div className="absolute bottom-3 left-3 bg-orange-500/95 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                            <TrendingUp className="w-3 h-3" />
                            {language === 'zh' ? '热门' : 'Hot'}
                        </div>
                    )}
                </div>
                {/* Content Section */}
                <div className="p-5 flex flex-col gap-3">
                    {/* Title */}
                    <div>
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {displayTitle}
                        </h3>
                    </div>

                    {/* Provider Info */}
                    {provider && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-sm ${provider.identity === 'MERCHANT'
                                    ? 'bg-blue-50/80 text-blue-700 border-blue-200'
                                    : 'bg-green-50/80 text-green-700 border-green-200'
                                    }`}>
                                    {provider.identity === 'MERCHANT'
                                        ? (language === 'zh' ? '商家' : 'Merchant')
                                        : (language === 'zh' ? '邻居' : 'Neighbor')}
                                </div>
                                <span className="text-xs font-medium text-foreground/80 truncate flex-1">
                                    {displayBusinessName}
                                </span>
                            </div>
                            <VerificationBadge
                                level={(provider.verificationLevel || 1) as 1 | 2 | 3 | 4 | 5}
                                nodeName={displayNodeName}
                                endorsementCount={provider.stats?.repeatRate ? Math.floor(provider.stats.repeatRate * 10) : 0}
                                licenseInfo={provider.licenseInfo ? {
                                    type: (provider.licenseInfo.split(' ')[0] || 'ECRA') as 'ECRA' | 'TSSA' | 'RMT' | 'OPMCA',
                                    number: provider.licenseInfo.split('#')[1] || ''
                                } : undefined}
                                insuranceInfo={provider.insuranceSummaryEn || provider.insuranceSummaryZh ? {
                                    amount: 2,
                                    currency: 'CAD'
                                } : undefined}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {displayDesc}
                    </p>

                    {/* Footer: Location & Price */}
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-medium">{item.location.city}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            {startingPrice ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-right"
                                >
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium leading-none mb-0.5">
                                        {language === 'zh' ? '起' : 'From'}
                                    </div>
                                    <div className="text-primary font-black text-xl leading-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        {startingPrice.formatted}
                                    </div>
                                </motion.div>
                            ) : (
                                <span className="text-muted-foreground text-xs italic px-3 py-1 bg-muted/50 rounded-lg">
                                    {language === 'zh' ? '议价' : 'Quote'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Accent Line */}
                <div className={`h-1 w-full ${typeConfig.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
        </Link>
    );
};
