import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { repositoryFactory } from "@/services/repositories/factory";
import { useAuthStore } from "@/stores/authStore";
import { Order } from "@/types/orders";
import { toast } from "sonner";
import ImageUploader from "@/components/common/ImageUploader";

const ReviewSubmission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [dimensions, setDimensions] = useState<Record<string, number>>({
        Quality: 5,
        Communication: 5,
        Value: 5,
    });
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [content, setContent] = useState("");
    const [isNeighborStory, setIsNeighborStory] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const orderRepo = repositoryFactory.getOrderRepository();
                const foundOrder = await orderRepo.getById(id);
                if (foundOrder) {
                    setOrder(foundOrder);
                }
            } catch (error) {
                console.error("Failed to load order:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleSubmit = async () => {
        if (!order || !currentUser) return;
        setIsSubmitting(true);
        try {
            const reviewRepo = repositoryFactory.getReviewRepository();
            await reviewRepo.submitReview({
                orderId: order.id,
                listingId: order.masterId,
                buyerId: currentUser.id,
                providerId: order.providerId,
                rating,
                ratingDimensions: dimensions,
                content,
                media: uploadedImages,
                isNeighborStory,
            });
            toast.success("Review submitted! You've earned 50 JinBeans! 🎉");
            navigate(`/service/${order.masterId}`);
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
    if (!order) return <div className="p-8 text-center text-muted-foreground bg-background min-h-screen">Order not found.</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-xl py-8 px-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground mb-8 group transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Back to Orders</span>
                </button>

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-3 leading-none">Share your Story</h1>
                        <p className="text-muted-foreground font-medium text-lg leading-tight">Your neighbors value your feedback!</p>
                    </div>

                    <Card className="p-6 border-none shadow-sm card-warm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                        <div className="flex gap-4 items-center relative z-10">
                            <img src={order.snapshot.masterImages[0]} className="w-16 h-16 rounded-2xl object-cover shadow-card" alt="Listing" />
                            <div className="flex-1">
                                <h2 className="font-black text-lg tracking-tight leading-none mb-1">{order.snapshot.masterTitle}</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">{order.snapshot.itemName}</p>
                            </div>
                        </div>
                    </Card>

                    <section className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 block leading-none">Overall Experience</label>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button key={s} onClick={() => setRating(s)} className="group relative">
                                        <Star className={`w-12 h-12 transition-all duration-300 ${s <= rating ? 'fill-secondary text-secondary scale-110' : 'text-muted/20 group-hover:text-muted/40 hover:scale-105'}`} />
                                        {s === rating && (
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-6 bg-muted/20 p-8 rounded-[40px] border border-muted/30 shadow-inner">
                            {Object.keys(dimensions).map((dim) => (
                                <div key={dim} className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{dim}</span>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button key={s} onClick={() => setDimensions({ ...dimensions, [dim]: s })} className="hover:scale-110 transition-transform">
                                                <Star className={`w-5 h-5 ${s <= dimensions[dim] ? 'fill-secondary text-secondary' : 'text-muted/20'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block leading-none">Add Photos (Optional)</label>
                            <ImageUploader
                                bucketName="review-media"
                                onUpload={setUploadedImages}
                                onUploadingChange={setIsUploading}
                                maxFiles={3}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block leading-none">Tell the story</label>
                            <Textarea
                                placeholder="Helpful neighbors deserve recognition! Describe what made this special..."
                                className="min-h-[160px] rounded-[40px] border-none bg-muted/30 p-8 font-medium text-foreground focus-visible:ring-primary shadow-inner resize-none text-lg"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-orange-50/50 rounded-[40px] border border-orange-100/50 group hover:bg-orange-50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-[20px] bg-orange-100 flex items-center justify-center shadow-sm shadow-orange-200">
                                    <Heart className="w-6 h-6 text-orange-600 fill-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-orange-950 tracking-tight">Promote to Neighbor Stories</p>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Earn 50 JinBeans Reward 🎁</p>
                                </div>
                            </div>
                            <Switch checked={isNeighborStory} onCheckedChange={setIsNeighborStory} className="data-[state=checked]:bg-orange-500" />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full h-20 rounded-[40px] text-lg font-black uppercase tracking-[0.2em] shadow-glow hover:shadow-glow-lg transition-all active:scale-95 disabled:opacity-50"
                            disabled={isSubmitting || isUploading || !content || content.length < 5}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> :
                                isUploading ? 'Uploading Images...' : 'Complete & Earn Beans'}
                        </Button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmission;
