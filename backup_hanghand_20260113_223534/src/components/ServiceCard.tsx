import { MapPin, Clock, Star, Shield, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ServiceTier {
  name: string;
  price: number;
  description: string;
}

interface ServiceCardProps {
  id: number;
  title: string;
  provider: string;
  avatar: string;
  rating: number;
  reviews: number;
  distance: string;
  nextAvailable: string;
  tiers: ServiceTier[];
  image: string;
  verified?: boolean;
  urgent?: boolean;
}

const ServiceCard = ({
  id,
  title,
  provider,
  avatar,
  rating,
  reviews,
  distance,
  nextAvailable,
  tiers,
  image,
  verified,
  urgent,
}: ServiceCardProps) => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleCardClick = () => {
    navigate(`/service/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card-warm overflow-hidden group animate-fade-in hover:shadow-elevated transition-all duration-500 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />

        {/* Floating badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="tag-distance">
            <MapPin className="w-3.5 h-3.5" />
            {distance}
          </span>
          {urgent && (
            <span className="tag-urgent">
              <Clock className="w-3.5 h-3.5" />
              Urgent
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-warm hover:scale-110 transition-all"
        >
          <Heart
            className={`w-5 h-5 transition-all ${isLiked ? 'fill-accent text-accent animate-scale-in' : 'text-muted-foreground'}`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Provider Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={avatar}
              alt={provider}
              className="w-10 h-10 rounded-full object-cover border-2 border-card shadow-sm"
            />
            {verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground truncate">{provider}</p>
              {verified && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Vouched</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
              <span className="text-sm font-semibold text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>

        {/* Available Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="tag-time">
            <Clock className="w-3.5 h-3.5" />
            Avail. {nextAvailable}
          </span>
        </div>

        {/* Tier Selection */}
        <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
          {tiers.map((tier, index) => (
            <button
              key={tier.name}
              onClick={() => setSelectedTier(index)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all duration-300 ${selectedTier === index
                  ? 'bg-primary text-primary-foreground shadow-warm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {tier.name}
            </button>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-0.5 leading-none">
              {tiers[selectedTier].description}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">${tiers[selectedTier].price}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">/ start</span>
            </div>
          </div>
          <button className="btn-action p-3 text-sm flex items-center justify-center rounded-2xl aspect-square">
            <span>🤝</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
