import { useState } from "react";
import Header from "@/components/Header";
import { ArrowLeft, Check, Upload, Banknote, Tag, MapPin, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategorySelector from "@/components/Post/CategorySelector";
import PostGoodWizard from "@/components/Post/PostGoodWizard";
import PostTaskWizard from "@/components/Post/PostTaskWizard";
import { RefCode } from "@/types/domain";
import { useEffect } from "react";

type ListingType = 'SERVICE' | 'RENTAL' | 'CONSULTATION' | 'GOODS' | 'TASK';

const PostGig = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeFromUrl = searchParams.get('type') as ListingType | null;

    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<ListingType | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<RefCode | null>(null);

    useEffect(() => {
        if (typeFromUrl && ['SERVICE', 'RENTAL', 'CONSULTATION', 'GOODS', 'TASK'].includes(typeFromUrl)) {
            setSelectedType(typeFromUrl);
            setStep(2);
        }
    }, [typeFromUrl]);

    // Form State
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");

    const steps = [
        { id: 1, title: "选择类型" },
        { id: 2, title: "选择分类" },
        { id: 3, title: "基本信息" },
        { id: 4, title: "价格与交付" },
    ];

    const handleTypeSelect = (type: ListingType) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleCategorySelect = (category: RefCode) => {
        setSelectedCategory(category);
        setStep(3);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in py-4">
            <h2 className="text-2xl font-black tracking-tight mb-8 text-center">您想发布什么？</h2>
            <div className="flex flex-col gap-4">
                {[
                    { id: 'GOODS', emoji: '🍪', title: '发布闲置', desc: '衣服、电器、美食... 腾空空间赚点钱', color: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-200' },
                    { id: 'RENTAL', emoji: '📸', title: '发布出租', desc: '相机、露营车、工具... 闲置物品生钱', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
                    { id: 'TASK', emoji: '💰', title: '发布任务', desc: '搬家、修补、跑腿... 让邻居帮个忙', color: 'from-indigo-500 to-primary', shadow: 'shadow-indigo-200' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTypeSelect(item.id as ListingType)}
                        className={`p-6 rounded-[2rem] border-2 border-transparent bg-white shadow-xl ${item.shadow} hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden flex items-center gap-6`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity rounded-bl-[4rem]`} />
                        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-black text-2xl tracking-tight mb-1">{item.title}</h3>
                            <p className="text-sm font-bold text-muted-foreground leading-tight">{item.desc}</p>
                        </div>
                        <div className="ml-auto bg-muted/20 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <CategorySelector
            onSelect={handleCategorySelect}
            onBack={() => setStep(1)}
        />
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">描述您的{selectedType === 'RENTAL' ? '宝贝' : '服务'}</h2>

            {selectedCategory && (
                <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm text-primary font-medium">
                    <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">已选分类</span>
                    {selectedCategory.zhName}
                </div>
            )}

            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4" /> 标题
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：索尼 A7M4 相机出租"
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all"
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> 上传照片
                </label>
                <div className="h-40 rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 mb-2" />
                    <p>点击上传或拖拽图片到这里</p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 服务/交易区域
                </label>
                <input
                    type="text"
                    placeholder="例如：幸福小区附近 3km"
                    className="w-full p-4 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all"
                />
            </div>

            <Button onClick={() => setStep(4)} className="w-full py-6 font-bold text-lg rounded-xl" disabled={!title}>
                下一步
            </Button>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">设置价格</h2>

            <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    {selectedType === 'RENTAL' ? '日租金' : selectedType === 'CONSULTATION' ? '每小时价格' : selectedType === 'TASK' ? '悬赏金额' : '一口价'} (CNY)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">¥</span>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-4 pl-10 rounded-xl border bg-muted/30 focus:bg-background focus:border-primary outline-none transition-all font-mono text-lg"
                    />
                </div>
            </div>

            {selectedType === 'RENTAL' && (
                <div className="space-y-3 animate-slide-in">
                    <label className="text-sm font-semibold">押金 (CNY)</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        className="w-full p-4 rounded-xl border bg-muted/30 outline-none"
                    />
                </div>
            )}

            {selectedType === 'GOODS' && (
                <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                    <label className="text-sm font-semibold block mb-2">交付方式</label>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary">自提</button>
                        <button className="px-3 py-1 bg-background border rounded-lg text-sm text-muted-foreground">送货</button>
                        <button className="px-3 py-1 bg-background border rounded-lg text-sm text-muted-foreground">快递</button>
                    </div>
                </div>
            )}

            <Button
                onClick={() => {
                    // Finish logic
                    alert("发布成功！(Mock)");
                    navigate('/');
                }}
                className="w-full py-6 font-bold text-lg rounded-xl btn-action"
            >
                <span className="mr-2">✨</span> 确认发布
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container max-w-xl py-8">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                            </div>
                            <span className={`text-xs font-medium ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
                        </div>
                    ))}
                    {/* Progress Line */}
                    <div className="absolute left-0 right-0 top-4 h-[2px] bg-muted -z-0 mx-8">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form Area */}
                <div className="bg-card shadow-lg rounded-3xl p-6 md:p-8 border border-border/50 relative overflow-hidden min-h-[400px]">

                    {/* SPECIALIZED WIZARDS */}
                    {step >= 3 && selectedType === 'GOODS' ? (
                        <PostGoodWizard
                            category={selectedCategory}
                            onBack={() => setStep(2)}
                        />
                    ) : (
                        /* GENERIC WIZARD */
                        <div className="mt-4">
                            {/* Step Back (Generic) */}
                            {step > 1 && step < 3 && (
                                <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 text-muted-foreground hover:text-foreground z-20">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {step === 1 && renderStep1()}
                            {step === 2 && (
                                <CategorySelector
                                    onSelect={handleCategorySelect}
                                    onBack={() => setStep(1)}
                                    majorOnly={true}
                                />
                            )}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostGig;
