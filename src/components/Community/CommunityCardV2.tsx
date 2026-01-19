import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Layers, MapPin } from "lucide-react";
import { CommunityPost } from "@/types/community";
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

interface CommunityCardV2Props {
  post: CommunityPost;
  onDoubleTap?: () => void;
}

export const CommunityCardV2 = ({ post, onDoubleTap }: CommunityCardV2Props) => {
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
      <Link
        to={`/community/${post.id}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* 图片/视频媒体区域 - Image carousel takes priority; video fallback used if no images */}
        <div className="relative w-full overflow-hidden bg-muted" onDoubleClick={handleDoubleTap}>
          {post.images.length > 0 ? (
            <ImageCarousel images={post.images} onImageClick={handleImageClick} showArrows={false} />
          ) : (
            <MediaEmbed content={post.mediaUrl || ""} isCover={true} />
          )}

          {/* 类型标签 (左上角) */}
          <div className="absolute top-3 left-3 z-20">
            <Badge className={`${typeConfig.bgClass} text-white border-none shadow-md text-xs font-bold px-2.5 py-1`}>
              {typeConfig.label}
            </Badge>
          </div>

          {/* 价格标签 (左下角) */}
          {post.priceHint && (
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 z-20">
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

          {/* 标签云 (如果有) */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  to={`/community?tag=${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary/70 hover:text-primary cursor-pointer transition-colors hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 底部栏 */}
          <div className="flex items-center justify-between pt-2">
            {/* 作者信息 */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-6 h-6 border border-border">
                <AvatarImage src={post.author?.avatar} loading="lazy" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {post.author?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {post.author?.name || 'User'}
              </span>
            </div>

            {/* 互动数据 */}
            <div className="flex items-center gap-3 shrink-0">
              {/* 点赞 */}
              <button
                onClick={handleLikeClick}
                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
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
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{post.commentCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

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
