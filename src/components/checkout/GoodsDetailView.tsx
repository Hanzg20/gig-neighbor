import { ListingMaster, ListingItem, User } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, ShoppingBag, Truck, ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getTranslation } from "@/stores/listingStore";
import { useConfigStore } from "@/stores/configStore";

interface GoodsDetailViewProps {
    master: ListingMaster;
    item: ListingItem;
    provider: User;
    onBuy: () => void;
    onChat: () => void;
}

export const GoodsDetailView = ({ master, item, provider, onBuy, onChat }: GoodsDetailViewProps) => {
    const [currentImage, setCurrentImage] = useState(0);
    const { language } = useConfigStore();

    const t = {
        back: language === 'zh' ? '返回' : 'Back',
        verified: language === 'zh' ? '认证' : 'Verified',
        delivery: language === 'zh' ? '配送方式' : 'Delivery',
        meetup: language === 'zh' ? '当面交易' : 'Meetup',
        shipping: language === 'zh' ? '快递邮寄' : 'Shipping',
        condition: language === 'zh' ? '成色' : 'Condition',
        brand: language === 'zh' ? '品牌' : 'Brand',
        chat: language === 'zh' ? '联系卖家' : 'Chat',
        buyNow: language === 'zh' ? '立即购买' : 'Buy Now',
        postedBy: language === 'zh' ? '发布者' : 'Posted by',
        location: language === 'zh' ? '位置' : 'Location',
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Mobile-first Header */}
            <div className="relative h-96 bg-muted">
                <img
                    src={master.images[currentImage]}
                    alt={getTranslation(master, 'title')}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
                    <Link to="/" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="container max-w-lg -mt-6 relative z-10">
                <div className="card-warm p-6 mb-4 shadow-elevated">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-black text-foreground">{getTranslation(master, 'title')}</h1>
                            <p className="text-2xl font-black text-primary mt-1">
                                ${item.pricing.price.amount / 100}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <Badge variant="outline" className="border-primary text-primary font-bold">
                                {t.condition}: {item.attributes?.condition || 'Used'}
                            </Badge>
                            {item.attributes?.brand && (
                                <Badge variant="secondary" className="font-bold">
                                    {item.attributes.brand}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {master.location.fullAddress?.split(',')[0] || t.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {t.meetup}
                        </div>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
                        {getTranslation(master, 'description')}
                    </p>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center">
                            <img src={provider?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.id}`} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase">{t.postedBy}</p>
                            <p className="font-black text-foreground">{provider.name || 'Neighbor'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 glass-sticky-bar border-t border-border/10 z-50">
                <div className="container max-w-lg flex gap-3">
                    <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold gap-2" onClick={onChat}>
                        <MessageCircle className="w-5 h-5 text-primary" />
                        {t.chat}
                    </Button>
                    <Button size="lg" className="flex-[2] rounded-2xl font-black shadow-warm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none" onClick={onBuy}>
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        {t.buyNow}
                    </Button>
                </div>
            </div>
        </div>
    );
};
