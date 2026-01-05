import { useNavigate } from "react-router-dom";
import { ListingMaster } from "@/types/domain";
import { PopularServiceCard } from "./PopularServiceCard";
import { ArrowRight } from "lucide-react";
import { useCommunity } from "@/context/CommunityContext";
import { useConfigStore } from "@/stores/configStore";

interface PopularInCommunityProps {
  listings: ListingMaster[];
}

/**
 * Popular In Community Section
 * Displays services popular in the current community node
 */
export function PopularInCommunity({ listings }: PopularInCommunityProps) {
  const navigate = useNavigate();
  const { activeNodeId } = useCommunity();
  const { refCodes } = useConfigStore();

  // Get node display name
  const nodeInfo = refCodes.find(r => r.codeId === activeNodeId);
  const nodeDisplayName = nodeInfo?.zhName || nodeInfo?.enName || 'Community';

  // Filter listings for current node and sort by popularity
  const popularListings = listings
    .filter(l => l.nodeId === activeNodeId)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  if (popularListings.length === 0) {
    return null;
  }

  // Mock distance calculation (should use PostGIS in production)
  const getDistance = (listing: ListingMaster): number => {
    return Math.random() * 2000; // 0-2000m
  };

  return (
    <section className="py-6">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              同小区热门
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {nodeDisplayName} 社区
            </p>
          </div>
          <button
            onClick={() => navigate('/category/service')}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Scrollable Cards */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {popularListings.map((listing, index) => {
              const distance = getDistance(listing);
              const isInCommunity = distance < 500; // Within 500m = same community
              const isUrgent = listing.tags?.includes('urgent') || false;

              return (
                <PopularServiceCard
                  key={listing.id}
                  listing={listing}
                  distance={distance}
                  isInCommunity={isInCommunity}
                  isUrgent={isUrgent}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
