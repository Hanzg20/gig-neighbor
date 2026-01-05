import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { ListingCard } from "@/components/ListingCard";
import { SlidersHorizontal, ArrowDownWideNarrow } from "lucide-react";
import { Button } from "@/components/ui/button";

const CategoryListing = () => {
    const { type } = useParams<{ type: string }>();
    const { listings } = useListingStore();
    const { currentUser } = useAuthStore();
    const { refCodes } = useConfigStore();

    const getPageTitle = (type: string | undefined) => {
        // Find if type is a code
        const refCode = refCodes.find(r => r.codeId === type || r.zhName === type || r.enName?.toLowerCase() === type?.toLowerCase());
        if (refCode) return refCode.enName || refCode.zhName;

        switch (type?.toLowerCase()) {
            case 'service': return 'Life Services';
            case 'rental': return 'Community Rental';
            case 'consultation': return 'Expert Advice';
            case 'goods': return 'Marketplace';
            case 'task': return 'Local Tasks';
            default: return 'Explore All';
        }
    };

    const identifyIndustry = (type: string | undefined): string => {
        if (!type) return 'all';
        if (type.startsWith('101')) return 'food';
        if (type.startsWith('102')) return 'service';
        if (type.startsWith('103')) return 'transport';
        if (type.startsWith('104')) return 'rental';
        if (type.startsWith('105')) return 'learning';
        if (type.startsWith('106')) return 'professional';
        return type.toLowerCase();
    };

    const getFilteredListings = () => {
        if (!type) return listings;
        const industry = identifyIndustry(type);

        return listings.filter(l => {
            const lIndustry = identifyIndustry(l.categoryId);
            if (lIndustry === industry) return true;
            if (l.categoryId === type) return true;
            // Legacy support
            return l.type.toLowerCase() === type.toLowerCase();
        });
    };

    const filteredListings = getFilteredListings();

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            {/* Search Header */}
            <div className="bg-card border-b border-border py-4 sticky top-16 z-40">
                <div className="container flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        {getPageTitle(type)}
                        <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                            {filteredListings.length} Results
                        </span>
                    </h1>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <Button variant="outline" size="sm" className="rounded-full">
                            <SlidersHorizontal className="w-3 h-3 mr-2" /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full">
                            Closest <ArrowDownWideNarrow className="w-3 h-3 ml-1" />
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full">
                            Price Range
                        </Button>
                        {type === 'rental' && (
                            <Button variant="outline" size="sm" className="rounded-full">
                                No Deposit
                            </Button>
                        )}
                        {type === 'service' && (
                            <Button variant="outline" size="sm" className="rounded-full">
                                Neighbors Only
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <main className="container py-8">
                {type?.toLowerCase() === 'task' && !currentUser?.isVerifiedProvider ? (
                    <div className="card-warm p-10 flex flex-col items-center text-center gap-4 bg-gray-100/30 border-dashed border-2 border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <SlidersHorizontal className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Access Restricted</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Local tasks are only visible to verified neighbors. Please complete your profile verification to join.</p>
                        </div>
                        <Button className="btn-action rounded-full px-10">Verify Now</Button>
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredListings.map(item => (
                            <ListingCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg">No {getPageTitle(type)} found yet</p>
                        <p className="text-sm">Try different keywords or categories</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CategoryListing;
