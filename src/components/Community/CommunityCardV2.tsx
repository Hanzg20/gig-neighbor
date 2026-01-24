import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Layers, MapPin, Shield, Calendar, CheckCircle2 } from "lucide-react";
import { CommunityPost, FACT_TYPE_CONFIG, CONSENSUS_LEVEL_HINTS, ConsensusLevel } from "@/types/community";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCommunityPostStore } from "@/stores/communityPostStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { toast } from "sonner";
import { ImageCarousel } from "./ImageCarousel";
import { ImageViewer } from "./ImageViewer";
import { HashtagText } from "./HashtagText";
import { MediaEmbed } from "./MediaEmbed";
import { ShareSheet } from "@/components/common/ShareSheet";

interface CommunityCardV2Props {
  post: CommunityPost;
  onDoubleTap?: () => void;
}

export const CommunityCardV2 = ({ post, onDoubleTap }: CommunityCardV2Props) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { language } = useConfigStore();
  const { likePost, unlikePost } = useCommunityPostStore();
  const [showLikeExplosion, setShowLikeExplosion] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // 处理双击点赞
  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error(language === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    if (!post.isLikedByMe) {
      // 触发点赞
      likePost(post.id, currentUser.id);

      // 显示爆炸动画
      setShowLikeExplosion(true);
      setTimeout(() => setShowLikeExplosion(false), 600);

      // 回调
      onDoubleTap?.();
    }
  };

  // 处理单击点赞按钮
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error(language === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    if (post.isLikedByMe) {
      unlikePost(post.id, currentUser.id);
    } else {
      likePost(post.id, currentUser.id);
    }
  };

  // 获取类型配置
  const getTypeConfig = () => {
    const configs = {
      SECOND_HAND: {
        label: language === 'zh' ? '🎒 二手' : '🎒 Used',
        bgClass: 'bg-green-500/90',
      },
      WANTED: {
        label: language === 'zh' ? '🔍 求购' : '🔍 Wanted',
        bgClass: 'bg-orange-500/90',
      },
      GIVEAWAY: {
        label: language === 'zh' ? '🎁 免费' : '🎁 Free',
        bgClass: 'bg-purple-500/90',
      },
      EVENT: {
        label: language === 'zh' ? '🎉 活动' : '🎉 Event',
        bgClass: 'bg-blue-500/90',
      },
      HELP: {
        label: language === 'zh' ? '🤝 互助' : '🤝 Help',
        bgClass: 'bg-red-500/90',
      },
      GENERAL: {
        label: language === 'zh' ? '📝 分享' : '📝 Share',
        bgClass: 'bg-gray-500/90',
      },
    };

    return configs[post.postType] || configs.GENERAL;
  };

  const typeConfig = getTypeConfig();
  const coverImage = post.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60';
  const hasMultipleImages = post.images.length > 1;

  // 共识等级样式配置
  const getConsensusLevelConfig = (level: ConsensusLevel) => {
    const configs: Record<ConsensusLevel, { color: string; bgColor: string; icon: string }> = {
      HIGH: { color: 'text-green-600', bgColor: 'bg-green-500/10', icon: '✓✓' },
      MEDIUM: { color: 'text-blue-600', bgColor: 'bg-blue-500/10', icon: '✓' },
      LOW: { color: 'text-gray-500', bgColor: 'bg-gray-500/10', icon: '?' },
      CONTROVERSIAL: { color: 'text-orange-600', bgColor: 'bg-orange-500/10', icon: '⚡' },
      PENDING: { color: 'text-amber-600', bgColor: 'bg-amber-500/10', icon: '⏳' },
    };
    return configs[level] || configs.PENDING;
  };

  // 处理图片点击
  const handleImageClick = (index: number) => {
    setViewerInitialIndex(index);
    setShowImageViewer(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="masonry-card group"
    >
      <div
        onClick={() => {
          // Only navigate if no text is selected (to allow copying text)
          if (!window.getSelection()?.toString()) {
            navigate(`/community/${post.id}`);
          }
        }}
        className={`block cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${post.isFact
          ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-200/50'
          : 'bg-white'
          }`}
      >
        {/* 图片/视频媒体区域 - Image carousel takes priority; video fallback used if no images */}
        <div className="relative w-full overflow-hidden bg-muted" onDoubleClick={handleDoubleTap}>
          {post.images.length > 0 ? (
            <ImageCarousel images={post.images} onImageClick={handleImageClick} showArrows={false} />
          ) : (
            <MediaEmbed content={post.mediaUrl || ""} isCover={true} />
          )}

          {/* 类型标签 (左上角) */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Badge className={`${typeConfig.bgClass} text-white border-none shadow-md text-xs font-bold px-2.5 py-1`}>
              {typeConfig.label}
            </Badge>
            {/* 真言标识 */}
            {post.isFact && (
              <Badge className="bg-amber-500/90 text-white border-none shadow-md text-xs font-bold px-2.5 py-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {language === 'zh' ? '真言' : 'Fact'}
              </Badge>
            )}
          </div>

          {/* 价格标签 (左下角) */}
          {post.priceHint && (
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 z-20" onClick={(e) => e.stopPropagation()}>
              <span className="text-base">${(post.priceHint / 100).toFixed(0)}</span>
              {post.priceNegotiable && (
                <span className="text-xs opacity-80">{language === 'zh' ? '可议' : 'OBO'}</span>
              )}
            </div>
          )}

          {/* 点赞爆炸动画 */}
          {showLikeExplosion && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.6 }}
            >
              <Heart className="w-24 h-24 fill-red-500 text-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-4 space-y-2">
          {/* 标题 (2行截断) */}
          {post.title && (
            <h3 className="font-semibold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          )}

          <HashtagText
            text={post.content}
            className="text-sm text-muted-foreground leading-snug line-clamp-2"
          />

          {/* 真言信息 (仅真言帖显示) */}
          {post.isFact && post.factData && (
            <div className="flex flex-wrap items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
              {/* 事件类型 */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                {FACT_TYPE_CONFIG[post.factData.factType]?.icon}
                {language === 'zh'
                  ? FACT_TYPE_CONFIG[post.factData.factType]?.zh
                  : FACT_TYPE_CONFIG[post.factData.factType]?.en}
              </span>
              {/* 时间 */}
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {post.factData.occurredAt}
              </span>
              {/* 地点 */}
              <span className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[120px]">
                <MapPin className="w-3 h-3 shrink-0" />
                {post.factData.location}
              </span>
            </div>
          )}

          {/* 共识条 (仅真言帖显示) */}
          {post.isFact && post.consensus && (
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              {/* 共识进度条 */}
              <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                {post.consensus.totalVotes > 0 && (
                  <>
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${(post.consensus.agree / post.consensus.totalVotes) * 100}%` }}
                    />
                    <div
                      className="bg-blue-400 transition-all"
                      style={{ width: `${(post.consensus.partial / post.consensus.totalVotes) * 100}%` }}
                    />
                    <div
                      className="bg-orange-500 transition-all"
                      style={{ width: `${(post.consensus.disagree / post.consensus.totalVotes) * 100}%` }}
                    />
                    <div
                      className="bg-gray-300 transition-all"
                      style={{ width: `${(post.consensus.uncertain / post.consensus.totalVotes) * 100}%` }}
                    />
                  </>
                )}
              </div>
              {/* 共识状态 */}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${getConsensusLevelConfig(post.consensus.level).color}`}>
                  {getConsensusLevelConfig(post.consensus.level).icon}{' '}
                  {language === 'zh'
                    ? CONSENSUS_LEVEL_HINTS[post.consensus.level]?.zh
                    : CONSENSUS_LEVEL_HINTS[post.consensus.level]?.en}
                </span>
                <span className="text-muted-foreground">
                  {post.consensus.totalVotes} {language === 'zh' ? '人验证' : 'verified'}
                </span>
              </div>
            </div>
          )}

          {/* 标签云 (如果有) */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  to={`/community?tag=${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary/70 hover:text-primary cursor-pointer transition-colors hover:underline relative z-20"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 底部栏 */}
          <div className="flex items-center justify-between pt-2">
            {/* 作者信息 */}
            <div className="flex items-center gap-2 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
              <Avatar className={`w-6 h-6 border ${post.isFact ? 'border-amber-300' : 'border-border'}`}>
                <AvatarImage src={post.author?.avatar} loading="lazy" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {post.author?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {post.author?.name || 'User'}
              </span>
              {/* 用户等级徽章 */}
              {post.author?.levelIcon && (
                <span className="text-xs" title={`Level ${post.author.level}`}>
                  {post.author.levelIcon}
                </span>
              )}
            </div>

            {/* 互动数据 */}
            <div className="flex items-center gap-3 shrink-0">
              {/* 点赞 */}
              <button
                onClick={handleLikeClick}
                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors relative z-20"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${post.isLikedByMe
                    ? 'fill-red-500 text-red-500 scale-110'
                    : 'hover:scale-110'
                    }`}
                />
                {post.likeCount > 0 && (
                  <span className="text-xs font-medium">{post.likeCount}</span>
                )}
              </button>

              {/* 评论 */}
              {post.commentCount > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground relative z-20" onClick={(e) => e.stopPropagation()}>
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{post.commentCount}</span>
                </div>
              )}

              {/* 分享 */}
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="relative z-20">
                <ShareSheet
                  title={post.title || "分享一条动态"}
                  content={post.content}
                  url={`${window.location.origin}/community/${post.id}`}
                  imageUrl={post.images[0]}
                  authorName={post.author?.name}
                  authorAvatar={post.author?.avatar}
                  brandingTitle="渥帮 · 真言"
                  brandingSubtitle="Just telling it like it is"
                  trigger={
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 沉浸式图片查看器 */}
      <ImageViewer
        images={post.images}
        initialIndex={viewerInitialIndex}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </motion.div>
  );
};
