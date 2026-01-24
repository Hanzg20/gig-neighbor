/**
 * UserProfile - 用户主页
 * 展示用户信息、关注/粉丝、发布的帖子
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useCommunityPostStore } from "@/stores/communityPostStore";
import { userRepository, UserProfileWithFollowStatus } from "@/services/repositories/supabase/UserRepository";
import { communityPostRepository } from "@/services/repositories/supabase/CommunityPostRepository";
import { CommunityPost } from "@/types/community";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Settings, Grid3X3, Bookmark, UserPlus, UserMinus, Users, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { CommunityCardV2 } from "@/components/Community/CommunityCardV2";
import { UserLevelBadge } from "@/components/Community/UserLevelBadge";

const UserProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { language } = useConfigStore();

    const [profile, setProfile] = useState<UserProfileWithFollowStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

    const isOwnProfile = currentUser?.id === userId;

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;

            setIsLoading(true);
            try {
                const data = await userRepository.getUserProfileWithFollowStatus(
                    userId,
                    currentUser?.id
                );
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error(language === 'zh' ? '加载用户信息失败' : 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId, currentUser?.id, language]);

    // Fetch user's posts
    useEffect(() => {
        const fetchPosts = async () => {
            if (!userId) return;

            setIsLoadingPosts(true);
            try {
                const posts = await communityPostRepository.getByAuthor(userId);
                setUserPosts(posts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [userId]);

    const handleFollow = async () => {
        if (!currentUser) {
            toast.error(language === 'zh' ? '请先登录' : 'Please login first');
            return;
        }
        if (!profile) return;

        setIsFollowLoading(true);
        try {
            if (profile.isFollowedByMe) {
                await userRepository.unfollowUser(currentUser.id, profile.id);
                setProfile(prev => prev ? {
                    ...prev,
                    isFollowedByMe: false,
                    followerCount: prev.followerCount - 1
                } : null);
                toast.success(language === 'zh' ? '已取消关注' : 'Unfollowed');
            } else {
                await userRepository.followUser(currentUser.id, profile.id);
                setProfile(prev => prev ? {
                    ...prev,
                    isFollowedByMe: true,
                    followerCount: prev.followerCount + 1
                } : null);
                toast.success(language === 'zh' ? '关注成功' : 'Followed');
            }
        } catch (error: any) {
            toast.error(error.message || (language === 'zh' ? '操作失败' : 'Failed'));
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleMessage = () => {
        if (!currentUser) {
            toast.error(language === 'zh' ? '请先登录' : 'Please login first');
            return;
        }
        // Navigate to messages with this user
        navigate(`/messages?user=${userId}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-lg mx-auto pt-4 px-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                    </div>
                </div>
            </div>
        );
    }

    // User not found
    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-lg mx-auto pt-20 px-4 text-center">
                    <p className="text-muted-foreground">
                        {language === 'zh' ? '用户不存在' : 'User not found'}
                    </p>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {language === 'zh' ? '返回' : 'Go back'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <div className="max-w-lg mx-auto">
                {/* Header with back button */}
                <div className="flex items-center justify-between px-4 py-3 border-b sticky top-14 bg-background/80 backdrop-blur-lg z-10">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-bold">{profile.name}</h1>
                    {isOwnProfile ? (
                        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                            <Settings className="w-5 h-5" />
                        </Button>
                    ) : (
                        <div className="w-9" /> // Spacer
                    )}
                </div>

                {/* Profile Header */}
                <div className="px-4 py-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="w-20 h-20 border-2 border-background shadow-lg">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-2xl font-bold">
                                {profile.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Stats */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold">{profile.name}</h2>
                                <UserLevelBadge level={1} size="sm" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="font-bold text-lg">{profile.postCount}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {language === 'zh' ? '帖子' : 'Posts'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/user/${userId}/followers`)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <p className="font-bold text-lg">{profile.followerCount}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {language === 'zh' ? '粉丝' : 'Followers'}
                                    </p>
                                </button>
                                <button
                                    onClick={() => navigate(`/user/${userId}/following`)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <p className="font-bold text-lg">{profile.followingCount}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {language === 'zh' ? '关注' : 'Following'}
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        {isOwnProfile ? (
                            <Button
                                variant="outline"
                                className="flex-1 rounded-lg"
                                onClick={() => navigate('/settings/profile')}
                            >
                                {language === 'zh' ? '编辑资料' : 'Edit Profile'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant={profile.isFollowedByMe ? "outline" : "default"}
                                    className="flex-1 rounded-lg"
                                    onClick={handleFollow}
                                    disabled={isFollowLoading}
                                >
                                    {profile.isFollowedByMe ? (
                                        <>
                                            <UserMinus className="w-4 h-4 mr-2" />
                                            {profile.isFollowingMe
                                                ? (language === 'zh' ? '互相关注' : 'Following')
                                                : (language === 'zh' ? '已关注' : 'Following')}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            {profile.isFollowingMe
                                                ? (language === 'zh' ? '回关' : 'Follow Back')
                                                : (language === 'zh' ? '关注' : 'Follow')}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={handleMessage}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="w-full justify-center border-b rounded-none bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="posts"
                            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </TabsTrigger>
                        {isOwnProfile && (
                            <TabsTrigger
                                value="saved"
                                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3"
                            >
                                <Bookmark className="w-5 h-5" />
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="posts" className="mt-0">
                        {isLoadingPosts ? (
                            <div className="grid grid-cols-3 gap-0.5">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-square" />
                                ))}
                            </div>
                        ) : userPosts.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>{language === 'zh' ? '还没有发布帖子' : 'No posts yet'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-0.5">
                                {userPosts.map(post => (
                                    <button
                                        key={post.id}
                                        onClick={() => navigate(`/community/${post.id}`)}
                                        className="aspect-square relative overflow-hidden bg-muted group"
                                    >
                                        {post.images && post.images.length > 0 ? (
                                            <img
                                                src={post.images[0]}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2 text-xs text-muted-foreground bg-muted">
                                                <span className="line-clamp-4 text-center">
                                                    {post.content.slice(0, 50)}
                                                </span>
                                            </div>
                                        )}
                                        {/* Multiple images indicator */}
                                        {post.images && post.images.length > 1 && (
                                            <div className="absolute top-2 right-2">
                                                <Grid3X3 className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                        {/* Hover overlay with stats */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                                            <span className="flex items-center gap-1">
                                                ❤️ {post.likeCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                💬 {post.commentCount || 0}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {isOwnProfile && (
                        <TabsContent value="saved" className="mt-0">
                            <div className="py-20 text-center text-muted-foreground">
                                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>{language === 'zh' ? '收藏功能开发中' : 'Saved posts coming soon'}</p>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
};

export default UserProfile;
