import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunityPostStore } from "@/stores/communityPostStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Clock, Heart, MessageCircle, Share2, MoreVertical, Briefcase, Trash2, Edit2, Shield, Calendar, Bookmark, ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CommunityPostType, FACT_TYPE_CONFIG, ConsensusVoteType } from "@/types/community";
import { ShareSheet } from "@/components/common/ShareSheet";
import { LitePost } from "@/components/Community/LitePost";
import { MediaEmbed } from "@/components/Community/MediaEmbed";
import { HashtagText } from "@/components/Community/HashtagText";
import { ConsensusBar } from "@/components/Community/ConsensusBar";
import { FactVoteButtons } from "@/components/Community/FactVoteButtons";
import { UserLevelBadge } from "@/components/Community/UserLevelBadge";
import { CommentItem } from "@/components/Community/CommentItem";
import { parseEmbedLink } from "@/lib/embedUtils";
import { updateOpenGraphTags, configWxShare, isWeChatBrowser } from "@/lib/wechatShare";
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
        }
    }, [id, fetchPostDetail]);

    // 配置微信分享和 Open Graph 标签
    useEffect(() => {
        if (!currentPost) return;

        const embed = currentPost.mediaUrl ? parseEmbedLink(currentPost.mediaUrl) : null;
        const shareImageUrl = (currentPost.images && currentPost.images.length > 0)
            ? currentPost.images[0]
            : embed?.thumbnailUrl || `${window.location.origin}/logo.png`;

        const shareData = {
            title: currentPost.title || currentPost.content.slice(0, 30) + '...',
            description: currentPost.content.slice(0, 100) + (currentPost.content.length > 100 ? '...' : ''),
            imageUrl: shareImageUrl,
            url: window.location.href
        };

        // 更新 Open Graph 标签 (对 Twitter/Facebook 等有效)
        updateOpenGraphTags(shareData);

        // 如果在微信浏览器中，配置微信 JS-SDK 分享
        if (isWeChatBrowser()) {
            configWxShare(shareData);
        }
    }, [currentPost]);

    // Loading skeleton - Instagram style
    if (isLoadingDetail || !currentPost) {
        return (
            <div className="min-h-screen bg-black">
                {/* Header skeleton */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                        <Skeleton className="h-4 w-24 bg-white/10" />
                        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                    </div>
                </div>
                {/* Image skeleton */}
                <div className="pt-14">
                    <Skeleton className="aspect-square w-full bg-white/5" />
                </div>
                {/* Content skeleton */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                        <Skeleton className="h-4 w-32 bg-white/10" />
                    </div>
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                </div>
            </div>
        );
    }

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return language === 'zh' ? '刚刚' : 'Just now';
        if (diffHours < 24) return language === 'zh' ? `${diffHours}小时前` : `${diffHours}h`;
        const days = Math.floor(diffHours / 24);
        if (days < 7) return language === 'zh' ? `${days}天前` : `${days}d`;
        return language === 'zh' ? `${Math.floor(days / 7)}周前` : `${Math.floor(days / 7)}w`;
    };

    const handleLike = async () => {
        if (!currentUser) return toast.error(language === 'zh' ? '请先登录' : 'Please login first');

        // Trigger animation
        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 300);

        if (currentPost.isLikedByMe) {
            await unlikePost(currentPost.id, currentUser.id);
        } else {
            await likePost(currentPost.id, currentUser.id);
        }
    };

    const handleDoubleTapLike = () => {
        if (!currentPost.isLikedByMe && currentUser) {
            handleLike();
        }
    };

    const handleSubmitComment = async () => {
        if (!currentUser) return toast.error(language === 'zh' ? '请先登录' : 'Please login first');
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            await addComment(currentUser.id, {
                postId: currentPost.id,
                content: commentText
            });
            setCommentText("");
            toast.success(language === 'zh' ? "评论已发布" : "Comment posted");
        } catch (error) {
            toast.error(language === 'zh' ? "评论失败" : "Failed to comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(language === 'zh' ? "确定要删除这条动态吗？删除后不可恢复。" : "Delete this post? This cannot be undone.")) return;
        try {
            await deletePost(currentPost.id);
            toast.success(language === 'zh' ? "动态已删除" : "Post deleted");
            navigate('/community');
        } catch (error) {
            toast.error(language === 'zh' ? "删除失败" : "Failed to delete");
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

    const focusCommentInput = () => {
        commentInputRef.current?.focus();
    };

    const isOwner = currentUser?.id === currentPost.authorId;
    const hasImages = currentPost.images && currentPost.images.length > 0;
    const hasVideo = currentPost.mediaUrl && parseEmbedLink(currentPost.mediaUrl);
    const totalSlides = (hasImages ? currentPost.images!.length : 0) + (hasVideo ? 1 : 0);

    // Get share image
    const embed = currentPost.mediaUrl ? parseEmbedLink(currentPost.mediaUrl) : null;
    const effectiveImageUrl = hasImages ? currentPost.images![0] : embed?.thumbnailUrl;

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed Header - Instagram style */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
                <div className="flex items-center justify-between px-2 py-2 max-w-lg mx-auto">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Author info in header - clickable to user profile */}
                    <button
                        onClick={() => navigate(`/user/${currentPost.authorId}`)}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                        <Avatar className="w-7 h-7">
                            <AvatarImage src={currentPost.author?.avatar} />
                            <AvatarFallback className="text-xs">{currentPost.author?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{currentPost.author?.name}</span>
                        {currentPost.author?.level && (
                            <UserLevelBadge level={currentPost.author.level} size="xs" />
                        )}
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
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
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                                                <Edit2 className="w-4 h-4" /> {language === 'zh' ? '编辑' : 'Edit'}
                                            </DropdownMenuItem>
                                        }
                                    />
                                    <DropdownMenuItem onClick={handleConvertToService} className="gap-2 cursor-pointer">
                                        <Briefcase className="w-4 h-4" /> {language === 'zh' ? '升级为服务' : 'Convert to Service'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                                        <Trash2 className="w-4 h-4" /> {language === 'zh' ? '删除' : 'Delete'}
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                    {language === 'zh' ? '暂无操作' : 'No actions available'}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-14 pb-20 max-w-lg mx-auto">
                {/* Media Section - Full width image/video carousel */}
                {(hasImages || hasVideo) && (
                    <div className="relative bg-black" onDoubleClick={handleDoubleTapLike}>
                        {/* Image Carousel */}
                        {hasImages && currentImageIndex < currentPost.images!.length && (
                            <div className="aspect-square relative overflow-hidden">
                                <img
                                    src={currentPost.images![currentImageIndex]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                {/* Like animation overlay */}
                                {isLikeAnimating && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Heart className="w-24 h-24 text-white fill-white animate-ping" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video embed */}
                        {hasVideo && currentImageIndex >= (currentPost.images?.length || 0) && (
                            <div className="aspect-square">
                                <MediaEmbed content={currentPost.mediaUrl || ""} />
                            </div>
                        )}

                        {/* Carousel Navigation */}
                        {totalSlides > 1 && (
                            <>
                                {/* Prev/Next buttons */}
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={() => setCurrentImageIndex(i => i - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}
                                {currentImageIndex < totalSlides - 1 && (
                                    <button
                                        onClick={() => setCurrentImageIndex(i => i + 1)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Dots indicator */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {Array.from({ length: totalSlides }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Counter */}
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                                    {currentImageIndex + 1}/{totalSlides}
                                </div>
                            </>
                        )}

                        {/* Fact Badge overlay */}
                        {currentPost.isFact && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-bold shadow-lg">
                                <Shield className="w-3.5 h-3.5" />
                                {language === 'zh' ? '真言' : 'JustTalk'}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Bar - Instagram style */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-4">
                        {/* Like */}
                        <button onClick={handleLike} className="flex items-center gap-1 group">
                            <Heart
                                className={`w-6 h-6 transition-all ${
                                    currentPost.isLikedByMe
                                        ? 'text-red-500 fill-red-500 scale-110'
                                        : 'text-foreground group-hover:scale-110'
                                } ${isLikeAnimating ? 'animate-bounce' : ''}`}
                            />
                            {currentPost.likeCount > 0 && (
                                <span className="text-sm font-semibold">{currentPost.likeCount}</span>
                            )}
                        </button>

                        {/* Comment */}
                        <button onClick={focusCommentInput} className="flex items-center gap-1 group">
                            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {currentPost.commentCount > 0 && (
                                <span className="text-sm font-semibold">{currentPost.commentCount}</span>
                            )}
                        </button>

                        {/* Share */}
                        <ShareSheet
                            open={isShareOpen}
                            onOpenChange={setIsShareOpen}
                            title={currentPost.title || (language === 'zh' ? "分享一条动态" : "Share post")}
                            content={currentPost.content}
                            url={`${window.location.origin}/community/${currentPost.id}`}
                            imageUrl={effectiveImageUrl}
                            authorName={currentPost.author?.name}
                            authorAvatar={currentPost.author?.avatar}
                            brandingTitle="渥帮 · 真言"
                            brandingSubtitle="Just telling it like it is"
                            trigger={
                                <button className="group">
                                    <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            }
                        />
                    </div>

                    {/* Save/Bookmark */}
                    <button onClick={handleSave} className="group">
                        <Bookmark
                            className={`w-6 h-6 transition-all ${
                                currentPost.isSavedByMe
                                    ? 'text-foreground fill-foreground'
                                    : 'text-foreground group-hover:scale-110'
                            }`}
                        />
                    </button>
                </div>

                {/* Content Section */}
                <div className="px-4 py-3 space-y-3">
                    {/* Likes count */}
                    {currentPost.likeCount > 0 && (
                        <p className="font-semibold text-sm">
                            {currentPost.likeCount} {language === 'zh' ? '人觉得很赞' : 'likes'}
                        </p>
                    )}

                    {/* Author & Content */}
                    <div className="space-y-1">
                        {currentPost.title && (
                            <p className="font-bold text-base">{currentPost.title}</p>
                        )}
                        <div className="text-sm">
                            <span className="font-semibold mr-1">{currentPost.author?.name}</span>
                            <HashtagText
                                text={currentPost.content}
                                className="inline"
                            />
                        </div>
                    </div>

                    {/* Price tag */}
                    {currentPost.priceHint !== undefined && currentPost.priceHint > 0 && (
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                            <span className="text-lg font-black text-primary">
                                ${(currentPost.priceHint / 100).toFixed(0)}
                            </span>
                            <span className="text-xs text-muted-foreground">CAD</span>
                            {currentPost.priceNegotiable && (
                                <span className="text-xs bg-background px-2 py-0.5 rounded-full text-muted-foreground">
                                    {language === 'zh' ? '可议价' : 'Negotiable'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Fact Details - Compact card */}
                    {currentPost.isFact && currentPost.factData && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 space-y-2">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                                <Shield className="w-3.5 h-3.5" />
                                {language === 'zh' ? '真言详情' : 'Fact Details'}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-black/20 px-2 py-1 rounded-full">
                                    {FACT_TYPE_CONFIG[currentPost.factData.factType]?.icon}
                                    {language === 'zh'
                                        ? FACT_TYPE_CONFIG[currentPost.factData.factType]?.zh
                                        : FACT_TYPE_CONFIG[currentPost.factData.factType]?.en}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-black/20 px-2 py-1 rounded-full text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {currentPost.factData.occurredAt}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-black/20 px-2 py-1 rounded-full text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {currentPost.factData.location}
                                </span>
                            </div>

                            {/* Consensus section */}
                            {currentPost.consensus && (
                                <div className="pt-2 space-y-2">
                                    <ConsensusBar
                                        consensus={currentPost.consensus}
                                        showLabels={true}
                                        size="sm"
                                    />
                                    <FactVoteButtons
                                        postId={currentPost.id}
                                        currentVote={currentPost.myVote}
                                        onVote={handleVote}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(currentPost.createdAt)}
                        </span>
                        {currentPost.locationText && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {currentPost.locationText}
                            </span>
                        )}
                        <span>{currentPost.viewCount} {language === 'zh' ? '浏览' : 'views'}</span>
                    </div>

                    {/* View all comments link */}
                    {currentPost.commentCount > 0 && (
                        <button
                            onClick={focusCommentInput}
                            className="text-sm text-muted-foreground"
                        >
                            {language === 'zh'
                                ? `查看全部 ${currentPost.commentCount} 条评论`
                                : `View all ${currentPost.commentCount} comments`}
                        </button>
                    )}
                </div>

                {/* Comments Section */}
                <div className="px-4 pb-4 space-y-4">
                    {currentPostComments.length > 0 && (
                        <div className="space-y-3">
                            {currentPostComments.map(comment => (
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
                            ))}
                        </div>
                    )}

                    {currentPostComments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {language === 'zh' ? '还没有评论，来抢沙发吧！' : 'No comments yet. Be the first!'}
                        </p>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Comment Input - Instagram style */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 safe-area-pb">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="text-xs">{currentUser?.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Input
                            ref={commentInputRef}
                            placeholder={language === 'zh' ? '添加评论...' : 'Add a comment...'}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                            className="pr-12 rounded-full bg-muted border-0 h-10"
                        />
                        {commentText.trim() && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSubmitComment}
                                disabled={isSubmittingComment}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full text-primary hover:text-primary"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPostDetail;
