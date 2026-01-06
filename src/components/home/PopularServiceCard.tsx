import { useNavigate } from "react-router-dom";
import { ListingMaster, ListingItem } from "@/types/domain";
import { MapPin, Heart, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { useState } from "react";
import { motion } from "framer-motion";
import { useListingStore } from "@/stores/listingStore";
import { useProviderStore } from "@/stores/providerStore";

interface PopularServiceCardProps {
  listing: ListingMaster;
  distance?: number;
  isInCommunity?: boolean;
  isUrgent?: boolean;
}

/**
 * Popular Service Card Component
 * Displays detailed service information with pricing options and booking button
 */
export function PopularServiceCard({ 
  listing, 
  distance = 0,
  isInCommunity = false,
  isUrgent = false
}: PopularServiceCardProps) {
  const navigate = useNavigate();
  const { listingItems } = useListingStore();
  const { getProviderById } = useProviderStore();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Get items for this listing
  const listingItemsForMaster = listingItems.filter(item => item.masterId === listing.id);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(
    listingItemsForMaster[0] || null
  );

  // Get provider data
  const provider = getProviderById(listing.providerId);
  const providerName = provider?.businessNameZh || provider?.businessNameEn || 'Provider';
  const verificationLevel = provider?.verificationLevel || 1;
  const rating = listing.rating || 4.5;
  const reviewCount = listing.reviewCount || 0;

  // Format earliest available time (mock for now)
  const earliestTime = "今天 12:00";

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItem) {
      navigate(`/service/${listing.id}?item=${selectedItem.id}`);
    } else {
      navigate(`/service/${listing.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/service/${listing.id}`)}
      className="relative w-80 md:w-96 flex-shrink-0 card-warm overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted/50">
        <img
          src={listing.images[0] || '/placeholder.svg'}
          alt={listing.titleEn || listing.titleZh}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {isInCommunity && (
            <Badge className="bg-primary/90 text-white border-none px-2 py-1 text-xs font-bold">
              同小区
            </Badge>
          )}
          <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {distance > 0 ? `${distance.toFixed(0)}m` : '同小区'}
          </Badge>
          {isUrgent && (
            <Badge className="bg-red-500 text-white border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              急单
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Provider Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{providerName}</span>
          <VerificationBadge
            level={verificationLevel as 1 | 2 | 3 | 4 | 5}
            nodeName=""
            endorsementCount={0}
          />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        {/* Service Name */}
        <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {listing.titleZh || listing.titleEn}
        </h3>

        {/* Availability */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>最早{earliestTime}</span>
        </div>

        {/* Options (Pricing Tiers) */}
        {listingItemsForMaster.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {listingItemsForMaster.slice(0, 3).map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {item.nameZh || item.nameEn}
                </button>
              );
            })}
          </div>
        )}

        {/* Price */}
        {selectedItem && selectedItem.pricing && (
          <div className="text-sm text-foreground">
            <span className="font-bold">
              {selectedItem.pricing.price?.formatted || 
               `$${(selectedItem.pricing.price?.amount || 0) / 100}`}
            </span>
            {selectedItem.pricing.unit && (
              <span className="text-muted-foreground">/{selectedItem.pricing.unit}</span>
            )}
          </div>
        )}

        {/* Order Button */}
        <Button
          onClick={handleOrder}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl py-2.5"
        >
          立即下单
        </Button>
      </div>
    </motion.div>
  );
}
