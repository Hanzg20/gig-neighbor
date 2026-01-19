import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Send, Loader2, Edit2 } from "lucide-react";
import ImageUploader from "@/components/common/ImageUploader";
import { useAuthStore } from "@/stores/authStore";
import { useCommunityPostStore } from "@/stores/communityPostStore";
import { toast } from "sonner";
import { CommunityPostType } from "@/types/community";
import { MediaEmbed } from "./MediaEmbed";

interface LitePostProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
    // Edit mode props
    postId?: string;
    initialData?: {
        title?: string;
        content: string;
        images: string[];
        mediaUrl?: string;
        price?: number;
        postType: CommunityPostType;
        nodeId?: string;
    };
}

const LITE_CATEGORIES: { id: CommunityPostType; label: string; icon: string; tag: string }[] = [
    { id: 'MOMENT', label: '邻里动态', icon: '🏘️', tag: '#邻里' },
    { id: 'ACTION', label: '闲置交易', icon: '🎒', tag: '#交易' },
    { id: 'HELP', label: '求助寻物', icon: '🔍', tag: '#求助' },
    { id: 'NOTICE', label: '社区公告', icon: '📢', tag: '#公告' },
    { id: 'LATEST', label: '发现分享', icon: '✨', tag: '#分享' },
];

export function LitePost({ onSuccess, trigger, postId, initialData }: LitePostProps) {
    const isEditMode = !!postId;
    const [open, setOpen] = useState(false);

    // Form State
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mediaUrl, setMediaUrl] = useState(""); // Decoupled media link field for posters/clean content
    const [selectedCat, setSelectedCat] = useState(LITE_CATEGORIES[0]); const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMediaInput, setShowMediaInput] = useState(false);

    const { currentUser } = useAuthStore();
    const { createPost, updatePost } = useCommunityPostStore();

    // Initialize form when opening in edit mode
    useEffect(() => {
        if (open && initialData) {
            setImages(initialData.images || []);
            setTitle(initialData.title || "");
            setDescription(initialData.content || "");
            setMediaUrl(initialData.mediaUrl || "");
            if (initialData.mediaUrl) setShowMediaInput(true);

            if (initialData.price) {
                setPrice((initialData.price / 100).toString());
            }

            const category = LITE_CATEGORIES.find(c => c.id === initialData.postType) || LITE_CATEGORIES[0];
            setSelectedCat(category);
        }
    }, [open, initialData]);

    const handlePost = async () => {
        if (!currentUser) {
            toast.error("请先登录");
            return;
        }

        if (!description && images.length === 0) {
            toast.error("加点内容吧！图片或文字都行");
            return;
        }

        setIsSubmitting(true);
        try {
            const finalTitle = title.trim() || description.slice(0, 30) || (isEditMode ? "编辑动态" : "邻里分享");
            const priceInCents = price ? Math.floor(parseFloat(price) * 100) : undefined;
            const nodeId = currentUser.nodeId || 'NODE_LEES';

            if (isEditMode && postId) {
                // UPDATE
                await updatePost(postId, {
                    postType: selectedCat.id,
                    title: finalTitle,
                    content: description,
                    images: images,
                    mediaUrl: mediaUrl,
                    priceHint: priceInCents,
                    locationText: "渥说", // Could make this editable later
                    tags: [selectedCat.tag.replace('#', '')]
                });
                toast.success("动态已更新");
            } else {
                // CREATE
                await createPost(currentUser.id, {
                    postType: selectedCat.id,
                    title: finalTitle,
                    content: description,
                    images: images,
                    mediaUrl: mediaUrl,
                    priceHint: priceInCents,
                    priceNegotiable: true,
                    locationText: "渥说",
                    nodeId: nodeId,
                    tags: [selectedCat.tag.replace('#', '')]
                });
                toast.success("发布成功！已在渥说展示");
            }

            setOpen(false);
            if (!isEditMode) resetForm();
            onSuccess?.();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "操作失败，请重试");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setImages([]);
        setTitle("");
        setDescription("");
        setMediaUrl("");
        setShowMediaInput(false);
        setPrice("");
        setSelectedCat(LITE_CATEGORIES[0]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-full w-14 h-14 shadow-glow flex items-center justify-center p-0">
                        <Plus className="w-8 h-8" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border-none max-h-[90vh]">
                <DialogHeader className="p-6 bg-primary/5 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                        {isEditMode ? '编辑动态' : '发个动态'} <span className="text-primary">Neighbor</span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        快速发布社区动态，分享闲置、求助、活动等内容
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {/* Tag Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {LITE_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCat(cat)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                  ${selectedCat.id === cat.id
                                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Media Area */}
                    <div className="bg-muted/20 rounded-2xl p-4 border-2 border-dashed border-muted space-y-4">
                        <ImageUploader
                            bucketName="listing-media"
                            onUpload={setImages}
                            maxFiles={4}
                            existingImages={images}
                            folderPath={`community/${currentUser?.id || 'anonymous'}`}
                        />
                        {/* Media Preview: Now specifically looks at the mediaUrl field */}
                        <MediaEmbed content={mediaUrl} />
                    </div>

                    {/* Input Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMediaInput(!showMediaInput)}
                                className={`rounded-full px-4 flex gap-2 font-bold ${showMediaInput ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                            >
                                <Plus className={`w-4 h-4 transition-transform ${showMediaInput ? 'rotate-45' : ''}`} />
                                {showMediaInput ? '移除链接' : '添加视频/音频链接'}
                            </Button>
                        </div>

                        {showMediaInput && (
                            <Input
                                placeholder="粘贴 YouTube/B站/小红书/Spotify 链接..."
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="bg-primary/5 border-primary/20 focus-visible:ring-1 focus-visible:ring-primary rounded-2xl h-12 p-4 text-base"
                            />
                        )}

                        <Input
                            placeholder="写个标题 (可选)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-2xl h-12 p-4 text-base font-bold"
                        />
                        <Textarea
                            placeholder="分享点新鲜事..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px] bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-2xl p-4 text-base resize-none"
                        />

                        {/* Price Row (Optional) */}
                        {(selectedCat.id === 'ACTION' || selectedCat.id === 'HELP') && (
                            <div className="flex items-center gap-3 bg-muted/10 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="font-bold">$</span>
                                </div>
                                <Input
                                    type="number"
                                    placeholder={selectedCat.id === 'ACTION' ? "出个价 (CAD)" : "预算范围 (CAD)"}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="bg-transparent border-none focus-visible:ring-0 text-lg font-bold p-0"
                                />
                            </div>
                        )}
                    </div>

                    {/* Location / Action Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">{currentUser?.nodeId || 'Kanata Lakes'}</span>
                        </div>

                        <Button
                            onClick={handlePost}
                            disabled={isSubmitting}
                            className="btn-action px-8 rounded-full font-black flex gap-2 h-12"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? '保存修改' : '立即发布'}</span>
                                    {isEditMode ? <Edit2 className="w-4 h-4 ml-1" /> : <Send className="w-4 h-4" />}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
