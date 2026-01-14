import { useState } from "react";
import { RefCode } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MapPin, Banknote, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { autoMatchSubcategory } from "@/utils/categoryMatcher";
import ImageUploader from "../common/ImageUploader";

interface PostTaskWizardProps {
    category: RefCode | null;
    onBack: () => void;
}

const URGENCY_OPTIONS = [
    { value: 'HIGH', label: '急需 (24h内)', icon: '🔥' },
    { value: 'MEDIUM', label: '本周内', icon: '📅' },
    { value: 'LOW', label: '不急 (灵活)', icon: '☕' },
];

const TASK_TEMPLATES = [
    { title: "宜家家具安装", desc: "刚买了橱柜/桌子，需要帮忙组装。自带工具优先。", emoji: "🪑" },
    { title: "搬运重物上楼", desc: "楼下有沙发/冰箱需要搬到3楼，无电梯，求两个壮汉。", emoji: "📦" },
    { title: "专业除雪/铲雪", desc: "家门口车位雪太厚了，需要清理。提供铲子。", emoji: "❄️" },
    { title: "远程带饭/代购", desc: "不方便出门，求帮忙带一份附近超市的快餐/日用品。", emoji: "🍔" },
];

const PostTaskWizard = ({ category, onBack }: PostTaskWizardProps) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // State
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const applyTemplate = (tpl: typeof TASK_TEMPLATES[0]) => {
        setTitle(tpl.title);
        setDescription(tpl.desc);
    };

    // Logistics
    const [urgency, setUrgency] = useState("MEDIUM");
    const [locationType, setLocationType] = useState("ON_SITE"); // ON_SITE | REMOTE
    const [address, setAddress] = useState("");

    // Budget
    const [budget, setBudget] = useState("");

    const { currentUser } = useAuthStore();
    const { addListing } = useListingStore();

    const handleSubmit = async () => {
        if (!currentUser) return;

        // Auto-match subcategory based on content
        const parentId = category?.codeId || 'TASK_GENERAL';
        const matchedCategoryId = autoMatchSubcategory(title, description, parentId);

        // Mock Submit - Adding to store
        /* ... existing logic ... */
        const newListingId = `task-${Date.now()}`;
        const newListing = {
            id: newListingId,
            providerId: currentUser.id,
            type: 'TASK' as const,
            categoryId: matchedCategoryId,
            titleEn: title,
            titleZh: title,
            descriptionEn: description,
            descriptionZh: description,
            images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&auto=format&fit=crop&q=60"],
            rating: 5,
            reviewCount: 0,
            status: 'PUBLISHED' as const,
            nodeId: 'lees-ave',
            tags: [],
            location: {
                fullAddress: address || "Ottawa, ON",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newItem = {
            id: `item-${Date.now()}`,
            masterId: newListingId,
            titleEn: 'Standard Bounty',
            titleZh: '标准赏金',
            nameZh: '标准赏金',
            descriptionZh: description,
            status: 'AVAILABLE' as const,
            pricing: {
                model: 'NEGOTIABLE' as const,
                price: { amount: parseFloat(budget) * 100, currency: 'CAD', formatted: `$${parseFloat(budget).toFixed(2)}` },
                unit: 'job'
            },
            attributes: {
                urgency,
                locationType,
                address
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addListing(newListing, [newItem]);

        console.log("Submitting Task:", newListing, newItem);
        alert("Bounty task successfully posted!");
        navigate('/my-listings');
    };

    // --- Steps ---

    const renderPhotoStep = () => (
        <div className="space-y-6 animate-fade-in text-center">
            <div className="bg-primary/5 p-4 rounded-xl mb-4 text-left">
                <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    上传任务相关照片
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    如有参考图、现场图或说明图，上传后邻居们更容易理解。
                </p>
            </div>

            <div className="bg-card border-none p-4 rounded-3xl">
                <ImageUploader
                    bucketName="listing-media"
                    onUpload={(urls) => setImages(urls)}
                    onUploadingChange={setIsUploading}
                    maxFiles={3}
                    existingImages={images}
                    folderPath={`tasks/${currentUser?.id || 'anonymous'}`}
                />
            </div>

            <Button
                onClick={() => setStep(2)}
                className="w-full py-6 text-lg rounded-xl font-bold"
                disabled={isUploading}
            >
                {isUploading ? '正在上传图片...' : '下一步 (可跳过)'}
            </Button>
            {images.length === 0 && !isUploading && (
                <p className="text-xs text-muted-foreground">如果您现在没有照片，可以直接点下一步</p>
            )}
        </div>
    );

    const renderDescriptionStep = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-primary/5 p-4 rounded-xl mb-4">
                <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="text-xl">👋</span>
                    需要大家帮什么忙？
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    清楚描述您的需求，能让邻居们更快响应哦。
                </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">快速模板</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                    {TASK_TEMPLATES.map((tpl, i) => (
                        <button
                            key={i}
                            onClick={() => applyTemplate(tpl)}
                            className="flex-shrink-0 px-4 py-3 rounded-2xl bg-white border border-border shadow-sm hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold flex items-center gap-2 group"
                        >
                            <span className="group-hover:scale-125 transition-transform">{tpl.emoji}</span>
                            <span>{tpl.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold block">标题 (一句话概括)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：这也太重了，求帮搬沙发上楼"
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all font-bold text-lg"
                    autoFocus
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold block">具体需求</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例如：沙发在楼下，没有电梯，需要搬到3楼。最好有两个人..."
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all min-h-[150px]"
                />
            </div>

            <Button onClick={() => setStep(3)} disabled={!title || !description} className="w-full py-6 text-lg rounded-xl font-bold">
                下一步
            </Button>
        </div>
    );

    const renderLogisticsStep = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">什么时间？在哪里？</h2>

            {/* Urgency */}
            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" /> 时间急吗？
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {URGENCY_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setUrgency(opt.value)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${urgency === opt.value ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-background hover:bg-muted/50'}`}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="font-bold text-sm">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 地点
                </label>
                <div className="flex bg-muted/30 p-1 rounded-lg mb-3">
                    <button
                        onClick={() => setLocationType('ON_SITE')}
                        className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${locationType === 'ON_SITE' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        线下见面
                    </button>
                    <button
                        onClick={() => setLocationType('REMOTE')}
                        className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${locationType === 'REMOTE' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        线上远程
                    </button>
                </div>

                {locationType === 'ON_SITE' && (
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="例如：Kanata Lakes 附近"
                        className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all"
                    />
                )}
            </div>

            <Button onClick={() => setStep(4)} className="w-full py-6 text-lg rounded-xl font-bold">
                下一步
            </Button>
        </div>
    );

    const renderBudgetStep = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="spac-y-2">
                <h2 className="text-2xl font-bold">您的预算是多少？</h2>
                <p className="text-muted-foreground text-sm">邻居们会根据预算决定是否接单，也可以稍后协商。</p>
            </div>

            <div className="relative mt-8 mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-3xl text-primary">$</span>
                <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50"
                    className="w-full p-6 pl-12 rounded-2xl border-2 border-primary/20 bg-primary/5 focus:border-primary focus:bg-background outline-none transition-all font-mono text-4xl font-bold text-center"
                    autoFocus
                />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm flex gap-3">
                <span className="text-xl">💡</span>
                <p>Based on your description, similar {category?.enName || category?.zhName} tasks in this area usually range from <strong>$40 - $80</strong>.</p>
            </div>

            <Button onClick={handleSubmit} disabled={!budget} className="w-full py-6 text-lg rounded-xl font-bold btn-action shadow-lg shadow-primary/20">
                🚀 发布悬赏
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
                <span className={step >= 2 ? "text-primary font-bold" : ""}>需求</span>
                <span className="text-muted/30">/</span>
                <span className={step >= 3 ? "text-primary font-bold" : ""}>时间地点</span>
                <span className="text-muted/30">/</span>
                <span className={step >= 4 ? "text-primary font-bold" : ""}>预算</span>
            </div>

            {step === 1 && renderPhotoStep()}
            {step === 2 && renderDescriptionStep()}
            {step === 3 && renderLogisticsStep()}
            {step === 4 && renderBudgetStep()}
        </div>
    );
};

export default PostTaskWizard;
