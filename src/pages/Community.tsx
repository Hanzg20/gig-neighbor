import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, User, MessageCircle, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

// Mock community posts data
const mockCommunityPosts = [
    {
        id: 'post1',
        type: 'TASK' as const,
        userId: 'u2',
        userName: '王先生',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
        title: '求帮忙代取快递',
        description: '明天上午有个大件快递到，我刚好要出差。愿意给50元报酬。',
        budget: { amount: 5000, currency: 'CNY', formatted: '¥50.00' },
        location: '幸福小区 3号楼',
        deadline: '2026-01-04',
        images: [],
        createdAt: '2026-01-03T10:30:00',
        responseCount: 3
    },
    {
        id: 'post2',
        type: 'GOODS' as const,
        userId: 'u3',
        userName: '李阿姨',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
        title: '自制手工曲奇饼干',
        description: '新鲜出炉的手工曲奇，用料健康，适合小朋友。昨天做了太多吃不完，分享给邻居。',
        price: { amount: 2000, currency: 'CNY', formatted: '¥20.00' },
        location: '幸福小区 5号楼',
        images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop'],
        createdAt: '2026-01-03T14:20:00',
        responseCount: 8
    },
    {
        id: 'post3',
        type: 'TASK' as const,
        userId: 'u4',
        userName: '张女士',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
        title: '谁能帮我组装家具',
        description: '刚买了个宜家衣柜，说明书看不懂。需要一个熟练的师傅帮忙组装。',
        budget: { amount: 10000, currency: 'CNY', formatted: '¥100.00' },
        location: '幸福小区 8号楼',
        deadline: '2026-01-05',
        images: [],
        createdAt: '2026-01-03T09:15:00',
        responseCount: 5
    },
    {
        id: 'post4',
        type: 'GOODS' as const,
        userId: 'u5',
        userName: '赵先生',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
        title: '闲置儿童滑板车',
        description: '九成新，孩子大了用不上了。免费送给需要的邻居。',
        price: { amount: 0, currency: 'CNY', formatted: '免费' },
        location: '幸福小区 12号楼',
        images: ['https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&h=400&fit=crop'],
        createdAt: '2026-01-02T16:45:00',
        responseCount: 12
    }
];

const Community = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'goods'>('all');

    const filteredPosts = mockCommunityPosts.filter(post => {
        if (activeFilter === 'tasks') return post.type === 'TASK';
        if (activeFilter === 'goods') return post.type === 'GOODS';
        return true;
    });

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
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="card-warm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => {
                                // In production, navigate to post detail
                                alert('帖子详情页面即将上线');
                            }}
                        >
                            {/* Post Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <img
                                    src={post.userAvatar}
                                    alt={post.userName}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{post.userName}</span>
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
                                            {post.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(post.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Post Content */}
                            <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {post.description}
                            </p>

                            {/* Post Images */}
                            {post.images && post.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {post.images.map((img, idx) => (
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
                                    {post.type === 'TASK' && 'budget' in post && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">悬赏</span>
                                            <span className="text-lg font-bold text-accent">
                                                {post.budget.formatted}
                                            </span>
                                        </div>
                                    )}
                                    {post.type === 'GOODS' && 'price' in post && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-bold text-primary">
                                                {post.price.formatted}
                                            </span>
                                        </div>
                                    )}
                                    {post.type === 'TASK' && 'deadline' in post && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            截止 {new Date(post.deadline).toLocaleDateString('zh-CN')}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{post.responseCount} 回复</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
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

            <Footer />
        </div>
    );
};

export default Community;
