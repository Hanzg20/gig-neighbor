import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunityPostStore } from "@/stores/communityPostStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Clock, Heart, MessageCircle, Share2, MoreVertical, Briefcase, Trash2, Edit2, Shield, Calendar, Bookmark } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CommunityPostType, FACT_TYPE_CONFIG, ConsensusVoteType } from "@/types/community";
import { ShareSheet } from "@/components/common/ShareSheet";
import { LitePost } from "@/components/Community/LitePost";
import { MediaEmbed } from "@/components/Community/MediaEmbed";
import { HashtagText } from "@/components/Community/HashtagText";
import { ConsensusBar, ConsensusLegend } from "@/components/Community/ConsensusBar";
import { FactVoteButtons } from "@/components/Community/FactVoteButtons";
import { UserLevelBadge } from "@/components/Community/UserLevelBadge";
import { CommentItem } from "@/components/Community/CommentItem";
import { parseEmbedLink } from "@/lib/embedUtils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommunityPostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentPost,
        currentPostComments,
        isLoadingDetail,
        fetchPostDetail,
        likePost,
        unlikePost,
        addComment,
        deletePost,
        voteOnFact,
        savePost,
        unsavePost,
        likeComment,
        unlikeComment
    } = useCommunityPostStore();
    const { currentUser } = useAuthStore();
    const { language } = useConfigStore();

    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
        }
    }, [id, fetchPostDetail]);

    if (isLoadingDetail || !currentPost) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container max-w-2xl py-8 px-4 space-y-8">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return '刚刚';
        if (diffHours < 24) return `${diffHours}小时前`;
        return `${Math.floor(diffHours / 24)}天前`;
    };

    const getPostTypeLabel = (type: CommunityPostType) => {
        const map: Record<CommunityPostType, { label: string; color: string }> = {
            'MOMENT': { label: '邻里', color: 'bg-green-100 text-green-700' },
            'ACTION': { label: '参加', color: 'bg-blue-100 text-blue-700' },
            'HELP': { label: '求助', color: 'bg-red-100 text-red-700' },
            'NOTICE': { label: '公告', color: 'bg-orange-100 text-orange-700' },
            'LATEST': { label: '动态', color: 'bg-gray-100 text-gray-700' }
        };
        return map[type] || map['GENERAL'];
    };

    const handleLike = async () => {
        if (!currentUser) return toast.error('请先登录');
        if (currentPost.isLikedByMe) {
            await unlikePost(currentPost.id, currentUser.id);
        } else {
            await likePost(currentPost.id, currentUser.id);
        }
    };

    const handleSubmitComment = async () => {
        if (!currentUser) return toast.error('请先登录');
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            await addComment(currentUser.id, {
                postId: currentPost.id,
                content: commentText
            });
            setCommentText("");
            toast.success("评论已发布");
        } catch (error) {
            toast.error("评论失败");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("确定要删除这条动态吗？删除后不可恢复。")) return;
        try {
            await deletePost(currentPost.id);
            toast.success("动态已删除");
            navigate('/community');
        } catch (error) {
            toast.error("删除失败");
        }
    };

    const handleConvertToService = () => {
        navigate(`/publish?from_post=${currentPost.id}`);
    };

    const handleVote = async (voteType: ConsensusVoteType) => {
        if (!currentUser) {
            toast.error(language === 'zh' ? '请先登录' : 'Please login first');
            return;
        }
        await voteOnFact(currentPost.id, currentUser.id, voteType);
    };

    const handleSave = async () => {
        if (!currentUser) {
            toast.error(language === 'zh' ? '请先登录' : 'Please login first');
            return;
        }
        if (currentPost.isSavedByMe) {
            await unsavePost(currentPost.id, currentUser.id);
            toast.success(language === 'zh' ? '已取消收藏' : 'Unsaved');
        } else {
            await savePost(currentPost.id, currentUser.id);
            toast.success(language === 'zh' ? '已收藏' : 'Saved');
        }
    };

    const isOwner = currentUser?.id === currentPost.authorId;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <div className="container max-w-2xl py-6 px-4">
                <Button variant="ghost" className="-ml-4 mb-4" onClick={() => navigate('/community')}>
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    返回社区
                </Button>

                {/* Main Content Card */}
                <div className={`rounded-3xl shadow-sm border p-6 mb-6 relative ${currentPost.isFact
                    ? 'bg-gradient-to-b from-amber-50 to-card border-amber-200/50'
                    : 'bg-card'
                    }`}>
                    {/* Fact Badge (if fact post) */}
                    {currentPost.isFact && (
                        <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-md">
                            <Shield className="w-3.5 h-3.5" />
                            {language === 'zh' ? '真言' : 'Verified Fact'}
                        </div>
                    )}

                    {/* Header: Author & Meta */}
                    <div className={`flex justify-between items-start mb-4 ${currentPost.isFact ? 'mt-2' : ''}`}>
                        <div className="flex items-center gap-3">
                            <Avatar className={`w-12 h-12 border-2 shadow-sm ${currentPost.isFact ? 'border-amber-300' : 'border-background'}`}>
                                <AvatarImage src={currentPost.author?.avatar} />
                                <AvatarFallback>{currentPost.author?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base">{currentPost.author?.name}</h3>
                                    {/* User Level Badge */}
                                    {currentPost.author?.level && (
                                        <UserLevelBadge
                                            level={currentPost.author.level}
                                            size="sm"
                                        />
                                    )}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPostTypeLabel(currentPost.postType).color}`}>
                                        {getPostTypeLabel(currentPost.postType).label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        {getTimeAgo(currentPost.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" />
                                        {currentPost.locationText || "附近"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Debug Menu - Always visible for now to debug */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl min-w-[140px]">
                                    {isOwner ? (
                                        <>
                                            <LitePost
                                                postId={currentPost.id}
                                                initialData={{
                                                    content: currentPost.content,
                                                    images: currentPost.images,
                                                    price: currentPost.priceHint,
                                                    postType: currentPost.postType,
                                                    nodeId: currentPost.nodeId
                                                }}
                                                trigger={
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer font-medium p-2.5">
                                                        <Edit2 className="w-4 h-4" /> 编辑
                                                    </DropdownMenuItem>
                                                }
                                            />
                                            <DropdownMenuItem onClick={handleConvertToService} className="gap-2 cursor-pointer font-medium p-2.5">
                                                <Briefcase className="w-4 h-4" /> 升级为服务
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-500 focus:text-red-500 cursor-pointer font-medium p-2.5">
                                                <Trash2 className="w-4 h-4" /> 删除
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                            非作者不可操作 <br />
                                            Me: {currentUser?.id?.slice(0, 6)}...<br />
                                            Au: {currentPost.authorId?.slice(0, 6)}...
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-4 mb-6">
                        {currentPost.title && (
                            <h1 className="text-xl font-black tracking-tight leading-snug">{currentPost.title}</h1>
                        )}

                        <HashtagText
                            text={currentPost.content}
                            className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px]"
                        />

                        {/* Fact Metadata (only for fact posts) */}
                        {currentPost.isFact && currentPost.factData && (
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/30 space-y-3">
                                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                                    <Shield className="w-4 h-4" />
                                    {language === 'zh' ? '真言信息' : 'Fact Details'}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {/* Event Type */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{FACT_TYPE_CONFIG[currentPost.factData.factType]?.icon}</span>
                                        <span className="text-foreground/80">
                                            {language === 'zh'
                                                ? FACT_TYPE_CONFIG[currentPost.factData.factType]?.zh
                                                : FACT_TYPE_CONFIG[currentPost.factData.factType]?.en}
                                        </span>
                                    </div>
                                    {/* Occurred At */}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>{currentPost.factData.occurredAt}</span>
                                    </div>
                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span>{currentPost.factData.location}</span>
                                    </div>
                                    {/* Subject (if present) */}
                                    {currentPost.factData.subject && (
                                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                {language === 'zh' ? '涉及' : 'Involves'}: {currentPost.factData.subject.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Evidence Images */}
                                {currentPost.factData.evidence && currentPost.factData.evidence.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {language === 'zh' ? '证据图片' : 'Evidence'}
                                        </span>
                                        <div className="flex gap-2">
                                            {currentPost.factData.evidence.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt={`Evidence ${i + 1}`}
                                                    className="w-16 h-16 rounded-lg object-cover border border-amber-200"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Price Display */}
                        {currentPost.priceHint !== undefined && currentPost.priceHint > 0 && (
                            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                                <span className="text-2xl font-black text-primary">
                                    ${(currentPost.priceHint / 100).toFixed(0)}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">CAD</span>
                                {currentPost.priceNegotiable && (
                                    <span className="text-xs bg-background px-2 py-0.5 rounded-md border text-muted-foreground font-bold">可议价</span>
                                )}
                            </div>
                        )}

                        {/* Media Area (Video + Images) */}
                        <div className="space-y-4">
                            {/* Always show video player here if detected in mediaUrl */}
                            <MediaEmbed content={currentPost.mediaUrl || ""} />

                            {/* Image Grid */}
                            {currentPost.images && currentPost.images.length > 0 && (
                                <div className={`grid gap-2 ${currentPost.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                    {currentPost.images.map((img, i) => (
                                        <div key={i} className="relative aspect-auto rounded-2xl overflow-hidden bg-muted">
                                            <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Consensus Section (only for fact posts) */}
                        {currentPost.isFact && currentPost.consensus && (
                            <div className="p-4 bg-white/50 rounded-2xl border border-amber-100 space-y-4">
                                <ConsensusBar
                                    consensus={currentPost.consensus}
                                    showLabels={true}
                                    showHint={true}
                                    size="lg"
                                />
                                <Separator className="bg-amber-100" />
                                <FactVoteButtons
                                    postId={currentPost.id}
                                    currentVote={currentPost.myVote}
                                    onVote={handleVote}
                                />
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                                className={`rounded-full px-4 ${currentPost.isLikedByMe ? "text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600" : "text-muted-foreground hover:bg-muted"}`}
                            >
                                <Heart className={`w-5 h-5 mr-1.5 ${currentPost.isLikedByMe ? "fill-current" : ""}`} />
                                <span className="font-bold">{currentPost.likeCount || "点赞"}</span>
                            </Button>

                            {/* 
                               Poster Fallback Logic:
                               If no images are manually uploaded for this post, we automatically
                               extract a thumbnail from the media link (if any) to use as the 
                               cover image for the generated sharing poster.
                            */}
                            {(() => {
                                const embed = currentPost.mediaUrl ? parseEmbedLink(currentPost.mediaUrl) : null;
                                const effectiveImageUrl = (currentPost.images && currentPost.images.length > 0)
                                    ? currentPost.images[0]
                                    : embed?.thumbnailUrl;

                                return (
                                    <ShareSheet
                                        open={isShareOpen}
                                        onOpenChange={setIsShareOpen}
                                        title={currentPost.title || "分享一条动态"}
                                        content={currentPost.content}
                                        url={`${window.location.origin}/community/${currentPost.id}`}
                                        imageUrl={effectiveImageUrl}
                                        authorName={currentPost.author?.name}
                                        authorAvatar={currentPost.author?.avatar}
                                        brandingTitle="渥帮 · 真言"
                                        brandingSubtitle="Just telling it like it is"
                                        trigger={
                                            <Button variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground hover:bg-muted">
                                                <Share2 className="w-5 h-5 mr-1.5" />
                                                <span className="font-bold">分享</span>
                                            </Button>
                                        }
                                    />
                                );
                            })()}

                            {/* Save/Bookmark Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                className={`rounded-full px-4 ${currentPost.isSavedByMe ? "text-amber-500 bg-amber-50 hover:bg-amber-100 hover:text-amber-600" : "text-muted-foreground hover:bg-muted"}`}
                            >
                                <Bookmark className={`w-5 h-5 mr-1.5 ${currentPost.isSavedByMe ? "fill-current" : ""}`} />
                                <span className="font-bold">{currentPost.saveCount || (language === 'zh' ? '收藏' : 'Save')}</span>
                            </Button>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                            {currentPost.viewCount} {language === 'zh' ? '次浏览' : 'views'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="container max-w-2xl px-4 pb-8">
                <div className="space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        {language === 'zh' ? '评论' : 'Comments'} <span className="text-muted-foreground font-normal text-sm">{currentPost.commentCount}</span>
                    </h3>

                    {/* Comment Input */}
                    <div className="flex gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={currentUser?.avatar} />
                            <AvatarFallback>{currentUser?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder={language === 'zh' ? '写下你的评论...' : 'Write a comment...'}
                                className="resize-none min-h-[80px] bg-background rounded-2xl border-muted focus:border-primary"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    className="rounded-full px-4"
                                    onClick={handleSubmitComment}
                                    disabled={!commentText.trim() || isSubmittingComment}
                                >
                                    {language === 'zh' ? '发布评论' : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-5">
                        {currentPostComments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                {language === 'zh' ? '暂无评论，快来抢沙发！' : 'No comments yet. Be the first!'}
                            </div>
                        ) : (
                            currentPostComments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onLike={async (commentId) => {
                                        if (!currentUser) {
                                            toast.error(language === 'zh' ? '请先登录' : 'Please login');
                                            return;
                                        }
                                        const targetComment = currentPostComments.find(c => c.id === commentId);
                                        if (targetComment?.isLikedByMe) {
                                            await unlikeComment(commentId, currentUser.id);
                                        } else {
                                            await likeComment(commentId, currentUser.id);
                                        }
                                    }}
                                    onReply={async (parentCommentId, content) => {
                                        if (!currentUser) {
                                            toast.error(language === 'zh' ? '请先登录' : 'Please login');
                                            return;
                                        }
                                        await addComment(currentUser.id, {
                                            postId: currentPost.id,
                                            content,
                                            parentCommentId
                                        });
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CommunityPostDetail;
