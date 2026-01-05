import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { ListingMaster } from "@/types/domain";
import { useListingStore } from "@/stores/listingStore";
import { useProviderStore } from "@/stores/providerStore";
import { useConfigStore } from "@/stores/configStore";
import { VerificationBadge } from "./ui/VerificationBadge";
import { Badge } from "./ui/badge";

export const ListingCardCompact = ({ item }: { item: ListingMaster }) => {
    const { listingItems } = useListingStore();
    const { getProviderById } = useProviderStore();
    const { refCodes } = useConfigStore();
    const provider = getProviderById(item.providerId);
    const items = listingItems.filter(li => li.masterId === item.id);
    const nodeInfo = refCodes.find(r => r.codeId === item.nodeId);

    // Find the starting price (lowest amount)
    const startingPrice = items.length > 0
        ? items.reduce((min, cur) => cur.pricing.price.amount < min.pricing.price.amount ? cur : min, items[0]).pricing.price
        : null;

    return (
        <Link to={`/service/${item.id}`} className="group block">
            <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all animate-lift">
                {/* 紧凑图片 */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                        src={item.images[0]}
                        alt={item.titleEn || item.titleZh}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* 类型标签 */}
                    <div className="absolute top-1 right-1 bg-primary/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {item.type}
                    </div>
                </div>

                {/* 信息区 */}
                <div className="flex-1 min-w-0">
                    {/* 标题和评分一行 */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {item.titleEn || item.titleZh}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold">{item.rating}</span>
                        </div>
                    </div>

                    {/* 服务商信息一行 */}
                    {provider && (
                        <div className="flex items-center gap-2 mb-1.5 text-xs text-muted-foreground">
                            <span className="truncate">{provider.businessNameEn || provider.businessNameZh}</span>
                            {provider.isVerified && (
                                <Badge className="bg-green-100 text-green-600 border-none px-1 py-0 text-[9px]">
                                    ✓
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* 描述和价格一行 */}
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                            {item.descriptionEn || item.descriptionZh}
                        </p>
                        {startingPrice && (
                            <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-[10px] text-muted-foreground">From</span>
                                <span className="text-primary font-extrabold text-base leading-tight">
                                    {startingPrice.formatted}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 标签行 */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {provider && (
                            <VerificationBadge
                                level={(provider.verificationLevel || 1) as 1 | 2 | 3 | 4 | 5}
                                nodeName={nodeInfo?.enName || nodeInfo?.zhName}
                                endorsementCount={provider.stats?.repeatRate ? Math.floor(provider.stats.repeatRate * 10) : 0}
                            />
                        )}
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20">
                            <MapPin className="w-2.5 h-2.5 mr-0.5" />
                            {item.location.city}
                        </Badge>
                    </div>
                </div>
            </div>
        </Link>
    );
};
