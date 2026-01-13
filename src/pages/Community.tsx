import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, MessageCircle, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCommunityStore } from "@/stores/communityStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingType } from "@/types/domain";

const Community = () => {
    const navigate = useNavigate();
    const { communityListings, fetchCommunityFeed, isLoading } = useCommunityStore();
    const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'goods'>('all');

    useEffect(() => {
        const typeFilter = activeFilter === 'tasks' ? 'TASK' : activeFilter === 'goods' ? 'GOODS' : undefined;
        fetchCommunityFeed({ type: typeFilter as ListingType });
    }, [activeFilter, fetchCommunityFeed]);

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return '刚刚';
        if (diffHours < 24) return `${diffHours}小时前`;
        return `${Math.floor(diffHours / 24)}天前`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-4xl py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-1">社区广场</h1>
                        <p className="text-sm text-muted-foreground">邻里互助，温暖社区</p>
                    </div>
                    <Button
                        onClick={() => navigate('/post-gig')}
                        className="btn-action gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        发布
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${activeFilter === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        全部
                    </button>
                    <button
                        onClick={() => setActiveFilter('tasks')}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${activeFilter === 'tasks'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        需求悬赏
                    </button>
                    <button
                        onClick={() => setActiveFilter('goods')}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${activeFilter === 'goods'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        邻里好物
                    </button>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton key={idx} className="h-48 w-full rounded-2xl" />
                        ))
                    ) : communityListings.length > 0 ? (
                        communityListings.map((post) => (
                            <div
                                key={post.id}
                                className="card-warm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/listing/${post.id}`)}
                            >
                                {/* Post Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {post.images?.[0] ? (
                                            <img
                                                src={post.images[0]}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <TrendingUp className="w-6 h-6 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{post.titleZh}</span>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-bold rounded-full ${post.type === 'TASK'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {post.type === 'TASK' ? '需求' : '好物'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {post.location?.fullAddress || '渥太华'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getTimeAgo(post.createdAt || '')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                    {post.descriptionZh}
                                </p>

                                {/* Post Images */}
                                {post.images && post.images.length > 1 && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {post.images.slice(0, 3).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt=""
                                                className="w-full aspect-square object-cover rounded-xl"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Post Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-primary">
                                            查看详情
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>了解更多</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">暂无相关内容</p>
                            <Button
                                onClick={() => navigate('/post-gig')}
                                className="btn-action"
                            >
                                发布第一条动态
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Community;
