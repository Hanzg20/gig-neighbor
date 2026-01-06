import { useState } from "react";
import { RefCode } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Check, Camera, Tag, Truck, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { autoMatchSubcategory } from "@/utils/categoryMatcher";

interface PostGoodWizardProps {
    category: RefCode | null;
    onBack: () => void;
}

const CONDITIONS = [
    { value: 'NEW', label: '全新', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'LIKE_NEW', label: '几乎全新', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'GOOD', label: '成色良好', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'FAIR', label: '功能正常', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const PostGoodWizard = ({ category, onBack }: PostGoodWizardProps) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // State
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("");
    const [price, setPrice] = useState("");
    const [delivery, setDelivery] = useState<string[]>(['PICKUP']);

    const handleDeliveryToggle = (method: string) => {
        setDelivery(prev =>
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    const { currentUser } = useAuthStore();
    const { addListing } = useListingStore();

    const handleSubmit = async () => {
        if (!currentUser) return;

        // Auto-match subcategory based on content
        const parentId = category?.codeId || 'GOODS_GENERAL';
        const matchedCategoryId = autoMatchSubcategory(title, description, parentId);

        // Mock Submit - Adding to store
        const newListingId = `listing-${Date.now()}`;
        const newListing = {
            id: newListingId,
            providerId: currentUser.id, // Buyer-as-Poster logic
            type: 'GOODS' as const,
            categoryId: matchedCategoryId,
            titleEn: title,
            titleZh: title,
            descriptionEn: description,
            descriptionZh: description,
            images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"],
            rating: 5,
            reviewCount: 0,
            status: 'PUBLISHED' as const,
            nodeId: 'lees-ave', // Default for pilot
            tags: [],
            location: {
                fullAddress: "Ottawa, ON",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newItem = {
            id: `item-${Date.now()}`,
            masterId: newListingId,
            titleEn: 'Standard',
            titleZh: '标准包',
            nameZh: '标准包',
            descriptionZh: description,
            status: 'AVAILABLE' as const,
            pricing: {
                model: 'FIXED' as const,
                price: { amount: parseFloat(price) * 100, currency: 'CAD', formatted: `$${parseFloat(price).toFixed(2)}` },
                unit: 'item'
            },
            attributes: {
                condition,
                delivery
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addListing(newListing, [newItem]);

        console.log("Submitting Good:", newListing, newItem);
        alert("Listing successfully posted!");
        navigate('/my-listings');
    };

    // --- Steps ---

    const renderPhotoStep = () => (
        <div className="space-y-6 animate-fade-in text-center">
            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors h-[300px]">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">上传宝贝照片</h3>
                <p className="text-muted-foreground mb-6">多角度拍摄，更容易卖出哦</p>
                <Button variant="outline" className="rounded-full px-8">
                    <Upload className="w-4 h-4 mr-2" /> 选择照片
                </Button>
            </div>

            {/* Mock Thumbnails */}
            {images.length > 0 && (
                <div className="flex gap-2 justify-center">
                    {/* ... thumbnails ... */}
                </div>
            )}

            <Button onClick={() => setStep(2)} className="w-full py-6 text-lg rounded-xl font-bold">
                下一步
            </Button>
        </div>
    );

    const renderDetailsStep = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Condition Chips */}
            <div>
                <label className="text-sm font-semibold mb-3 block">成色如何？</label>
                <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setCondition(c.value)}
                            className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${condition === c.value ? `ring-2 ring-offset-1 ring-primary ${c.color}` : 'bg-background border-muted text-muted-foreground hover:bg-muted/50'}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Smart Title */}
            <div className="space-y-2">
                <label className="text-sm font-semibold">标题</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="品牌 + 型号 + 关键特点"
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all font-bold text-lg"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">描述 (可选)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="入手渠道、使用感受、转手原因..."
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all min-h-[100px]"
                />
            </div>

            <Button onClick={() => setStep(3)} disabled={!title || !condition} className="w-full py-6 text-lg rounded-xl font-bold">
                下一步
            </Button>
        </div>
    );

    const renderPriceStep = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Banknote className="w-4 h-4" /> Price (CAD / USD)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">$</span>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-4 pl-10 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all font-mono text-3xl font-bold"
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" /> 交易方式
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleDeliveryToggle('PICKUP')}
                        className={`p-4 rounded-xl border flex items-center justify-center font-bold ${delivery.includes('PICKUP') ? 'border-primary bg-primary/5 text-primary' : 'bg-background hover:bg-muted/50'}`}
                    >
                        自提 (推荐)
                    </button>
                    <button
                        onClick={() => handleDeliveryToggle('DELIVERY')}
                        className={`p-4 rounded-xl border flex items-center justify-center font-bold ${delivery.includes('DELIVERY') ? 'border-primary bg-primary/5 text-primary' : 'bg-background hover:bg-muted/50'}`}
                    >
                        送货
                    </button>
                </div>
            </div>

            <Button onClick={handleSubmit} disabled={!price} className="w-full py-6 text-lg rounded-xl font-bold btn-action">
                ✨ 确认发布
            </Button>
        </div>
    );

    return (
        <div className="py-2">
            {/* Simple Step Indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <button onClick={onBack} className="hover:text-foreground"><ArrowLeft className="w-4 h-4" /></button>
                <span className={step >= 1 ? "text-primary font-bold" : ""}>照片</span>
                <span className="text-muted/30">/</span>
                <span className={step >= 2 ? "text-primary font-bold" : ""}>信息</span>
                <span className="text-muted/30">/</span>
                <span className={step >= 3 ? "text-primary font-bold" : ""}>价格</span>
            </div>

            {step === 1 && renderPhotoStep()}
            {step === 2 && renderDetailsStep()}
            {step === 3 && renderPriceStep()}
        </div>
    );
};

export default PostGoodWizard;
