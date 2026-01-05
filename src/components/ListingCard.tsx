import { Link } from "react-router-dom";
import { Star, MapPin, Tag } from "lucide-react";
import { ListingMaster } from "@/types/domain";
import { useListingStore } from "@/stores/listingStore";
import { useProviderStore } from "@/stores/providerStore";
import { useConfigStore } from "@/stores/configStore";
import { VerificationBadge } from "./ui/VerificationBadge";

export const ListingCard = ({ item }: { item: ListingMaster }) => {
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
            <div className="card-warm overflow-hidden h-full animate-lift">
                <div className="relative aspect-video overflow-hidden bg-muted/50">
                    <img
                        src={item.images[0]}
                        alt={item.titleEn || item.titleZh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                    </div>
                    {item.type === 'RENTAL' && (
                        <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                            Rental
                        </div>
                    )}
                    {item.type === 'CONSULTATION' && (
                        <div className="absolute top-2 left-2 bg-purple-500/90 text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                            Expert
                        </div>
                    )}
                    {item.type === 'GOODS' && (
                        <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                            Market
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.titleEn || item.titleZh}</h3>
                    </div>
                    {provider && (
                        <div className="mb-2">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${provider.identity === 'MERCHANT'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-green-50 text-green-600 border-green-200'
                                    }`}>
                                    {provider.identity === 'MERCHANT' ? 'Merchant' : 'Neighbor'}
                                </div>
                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{provider.businessNameEn || provider.businessNameZh}</span>
                            </div>
                            <VerificationBadge
                                level={(provider.verificationLevel || 1) as 1 | 2 | 3 | 4 | 5}
                                nodeName={nodeInfo?.enName || nodeInfo?.zhName}
                                endorsementCount={provider.stats?.repeatRate ? Math.floor(provider.stats.repeatRate * 10) : 0}
                                licenseInfo={provider.licenseInfo ? {
                                    type: (provider.licenseInfo.split(' ')[0] || 'ECRA') as 'ECRA' | 'TSSA' | 'RMT' | 'OPMCA',
                                    number: provider.licenseInfo.split('#')[1] || ''
                                } : undefined}
                                insuranceInfo={provider.insuranceSummaryEn || provider.insuranceSummaryZh ? {
                                    amount: 2, // Default, can be parsed from summary
                                    currency: 'CAD'
                                } : undefined}
                            />
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">{item.descriptionEn || item.descriptionZh}</p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {item.location.city}
                        </div>
                        <div className="flex flex-col items-end">
                            {startingPrice ? (
                                <>
                                    <span className="text-[10px] text-muted-foreground leading-none">From</span>
                                    <span className="text-primary font-extrabold text-lg leading-tight">
                                        {startingPrice.formatted}
                                    </span>
                                </>
                            ) : (
                                <span className="text-muted-foreground text-xs italic">No Price</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
