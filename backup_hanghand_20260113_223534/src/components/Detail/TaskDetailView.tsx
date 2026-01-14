import { useNavigate } from "react-router-dom";
import { ListingMaster, ListingItem, ProviderProfile } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MapPin, Share2, MoreHorizontal, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnhancedReviewList } from "@/components/reviews/EnhancedReviewList";

interface TaskDetailViewProps {
    master: ListingMaster;
    item: ListingItem;
    author?: ProviderProfile; // "Provider" in listing master is actually the Author for Tasks
    onQuote?: () => void;
    onChat?: () => void;
}

const URGENCIES: Record<string, { label: string; color: string }> = {
    'HIGH': { label: '急需 (24h)', color: 'bg-red-100 text-red-700' },
    'MEDIUM': { label: '本周内', color: 'bg-orange-100 text-orange-700' },
    'LOW': { label: '不急', color: 'bg-blue-100 text-blue-700' },
};

const TaskDetailView = ({ master, item, author, onQuote, onChat }: TaskDetailViewProps) => {
    const navigate = useNavigate();

    const urgencyCode = item.attributes?.urgency || 'LOW';
    const urgency = URGENCIES[urgencyCode];
    const locationType = item.attributes?.locationType === 'REMOTE' ? '线上远程' : '线下见面';
    const address = item.attributes?.address || '未填写地址';

    const budget = item.pricing.price.amount / 100;

    return (
        <div className="min-h-screen bg-muted/10 pb-32">
            {/* Header */}
            <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b z-50 px-4 h-14 flex items-center justify-between">
                <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
                <span className="font-bold text-sm">悬赏详情</span>
                <button><Share2 className="w-5 h-5" /></button>
            </header>

            <div className="container max-w-2xl px-4 py-6 space-y-4">
                {/* 1. Main Card */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-4">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`${urgency.color} border-transparent font-bold`}>
                            {urgency.label}
                        </Badge>
                        <span className="text-2xl font-black text-primary">¥{budget}</span>
                    </div>

                    <h1 className="text-2xl font-bold leading-tight">{master.titleZh}</h1>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> 发布于 2小时前
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {locationType}
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {master.descriptionZh}
                    </div>

                    {item.attributes?.locationType === 'ON_SITE' && (
                        <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3 text-sm">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold">执行地点</div>
                                <div className="text-muted-foreground text-xs">{address}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Requests / Author */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${master.providerId}`} className="w-full h-full" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">发布人: {author?.businessNameZh || "邻居"}</div>
                            <div className="text-xs text-muted-foreground">信用极好 · 已发布 3 个任务</div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
                </div>

                {/* 3. Safety */}
                <div className="p-4 text-xs text-center text-muted-foreground mb-4">
                    接单前请先沟通确认需求，平台全程担保资金安全。
                </div>

                {/* 4. Neighbor Stories */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border mb-8 overflow-hidden">
                    <EnhancedReviewList listingId={master.id} />
                </div>
            </div>

            {/* 4. Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t p-4 z-50">
                <div className="container max-w-2xl flex gap-3">
                    <Button onClick={onChat} variant="outline" className="flex-1 rounded-xl h-12 font-bold text-lg gap-2">
                        <MessageSquare className="w-5 h-5" /> 沟通
                    </Button>
                    <Button onClick={onQuote} className="flex-[2] rounded-xl h-12 font-bold text-lg shadow-lg shadow-primary/20">
                        🚀 接单赚钱
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailView;
