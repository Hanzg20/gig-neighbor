import { useState } from "react";
import { ArrowLeft, Share2, Heart, Shield, MessageCircle, MapPin, Truck, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ListingMaster, ListingItem, ProviderProfile } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GoodsDetailViewProps {
    master: ListingMaster;
    item: ListingItem;
    provider?: ProviderProfile;
    onBuy?: () => void;
    onChat?: () => void;
}

const GoodsDetailView = ({ master, item, provider, onBuy, onChat }: GoodsDetailViewProps) => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    const condition = item.attributes?.condition || 'USED';
    const conditionLabel = {
        'NEW': '全新',
        'LIKE_NEW': '几乎全新',
        'GOOD': '成色良好',
        'FAIR': '功能正常',
        'USED': '二手'
    }[condition] || condition;

    const deliveryMethods = item.attributes?.delivery || ['PICKUP'];

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* 1. Photo Gallery (Swipeable feel) */}
            <div className="relative h-[400px] bg-black">
                <img
                    src={master.images[currentImage] || "https://placehold.co/600x400?text=No+Image"}
                    alt={master.titleZh}
                    className="w-full h-full object-contain"
                />

                {/* Overlay Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                            <Heart className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold">
                    {currentImage + 1} / {master.images.length}
                </div>
            </div>

            {/* 2. Price & Title */}
            <div className="container max-w-2xl px-4 py-4 -mt-4 relative z-20 bg-background rounded-t-3xl shadow-sm">
                <div className="flex items-baseline justify-between mb-2">
                    <div className="text-primary font-black text-3xl">
                        <span className="text-lg mr-1">¥</span>
                        {item.pricing.price.amount / 100}
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {conditionLabel}
                    </Badge>
                </div>

                <h1 className="text-xl font-bold mb-3 leading-snug">{master.titleZh}</h1>

                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-6">
                    {master.descriptionZh}
                </p>

                {/* Tags / Methods */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {deliveryMethods.includes('PICKUP') && (
                        <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> 自提 · {master.location.fullAddress?.split(',')[0] || 'Kanata'}
                        </div>
                    )}
                    {deliveryMethods.includes('DELIVERY') && (
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Truck className="w-3 h-3" /> 支持送货
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Seller Info */}
            <div className="container max-w-2xl px-4 mb-6">
                <div className="bg-muted/30 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${master.providerId}`} className="w-full h-full" />
                        </div>
                        <div>
                            <div className="font-bold text-sm flex items-center gap-1">
                                {provider?.businessNameZh || "邻居"}
                                <Shield className="w-3 h-3 text-primary fill-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {provider?.stats?.totalOrders || 0} 笔交易 · 信用极好
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                        查看主页
                    </Button>
                </div>
            </div>

            {/* 4. Safety Tips */}
            <div className="container max-w-2xl px-4 text-xs text-muted-foreground bg-orange-50/50 p-4 rounded-xl mx-4 mb-8">
                <p className="font-bold text-orange-800 mb-1">💡 交易提醒</p>
                建议当面交易，钱货两清。如需邮寄，请使用平台担保交易。
            </div>

            {/* 5. Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t p-4 z-50">
                <div className="container max-w-2xl flex gap-3">
                    <button onClick={onChat} className="flex flex-col items-center justify-center min-w-[60px] text-xs text-muted-foreground gap-1 hover:text-primary transition-colors">
                        <MessageCircle className="w-6 h-6" />
                        <span>我想要</span>
                    </button>
                    <Button onClick={onBuy} className="flex-1 rounded-xl h-12 font-bold text-lg shadow-lg shadow-primary/20">
                        立即购买
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GoodsDetailView;
