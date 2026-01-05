import { useEffect, useState } from "react";
import { RefCode } from "@/types/domain";
import { repositoryFactory } from "@/services/repositories/factory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";

interface CategorySelectorProps {
    onSelect: (category: RefCode) => void;
    onBack: () => void;
    majorOnly?: boolean;
}

const CategorySelector = ({ onSelect, onBack, majorOnly = false }: CategorySelectorProps) => {
    const [industries, setIndustries] = useState<RefCode[]>([]);
    const [subCategories, setSubCategories] = useState<RefCode[]>([]);
    const [selectedIndustry, setSelectedIndustry] = useState<RefCode | null>(null);
    const [loading, setLoading] = useState(true);

    const refRepo = repositoryFactory.getRefCodeRepository();

    // Fetch Industries on mount
    /* ... existing ... */
    useEffect(() => {
        const loadIndustries = async () => {
            try {
                const data = await refRepo.getByType('INDUSTRY');
                setIndustries(data);
            } catch (err) {
                console.error("Failed to load industries", err);
            } finally {
                setLoading(false);
            }
        };
        loadIndustries();
    }, []);

    // Fetch SubCategories when Industry selected
    useEffect(() => {
        if (!selectedIndustry || majorOnly) {
            setSubCategories([]);
            return;
        }

        const loadSubCats = async () => {
            setLoading(true);
            try {
                const data = await refRepo.getByParent(selectedIndustry.codeId);
                setSubCategories(data);
            } catch (err) {
                console.error("Failed to load subcategories", err);
            } finally {
                setLoading(false);
            }
        };
        loadSubCats();
    }, [selectedIndustry, majorOnly]);

    const handleIndustryClick = (ind: RefCode) => {
        if (majorOnly) {
            onSelect(ind);
        } else {
            setSelectedIndustry(ind);
        }
    };

    const handleBack = () => {
        if (selectedIndustry) {
            setSelectedIndustry(null);
        } else {
            onBack();
        }
    };

    if (loading && industries.length === 0) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold">
                    {selectedIndustry ? selectedIndustry.zhName : "选择分类"}
                </h2>
            </div>

            {/* Level 1: Industries */}
            {!selectedIndustry && (
                <div className="grid grid-cols-1 gap-3">
                    {industries.map((ind) => (
                        <button
                            key={ind.codeId}
                            onClick={() => handleIndustryClick(ind)}
                            className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                                    {/* Icon logic can be enhanced later parsing extraData.icon */}
                                    📦
                                </span>
                                <div className="text-left">
                                    <h3 className="font-bold text-foreground">{ind.zhName}</h3>
                                    <p className="text-xs text-muted-foreground">{ind.enName}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                    ))}
                </div>
            )}

            {/* Level 2: Sub-Categories */}
            {selectedIndustry && (
                <div className="grid grid-cols-2 gap-3">
                    {subCategories.map((sub) => (
                        <button
                            key={sub.codeId}
                            onClick={() => onSelect(sub)}
                            className="p-4 rounded-xl border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                            <div className="font-bold text-foreground mb-1">{sub.zhName}</div>
                            <div className="text-xs text-muted-foreground">{sub.enName}</div>
                        </button>
                    ))}
                </div>
            )}

            {selectedIndustry && subCategories.length === 0 && !loading && (
                <div className="text-center text-muted-foreground py-8">
                    该分类下暂无细项
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
