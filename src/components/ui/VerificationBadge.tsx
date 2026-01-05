import { Shield, Award, MapPin, Users } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface VerificationBadgeProps {
  level: 1 | 2 | 3 | 4 | 5;
  nodeName?: string;
  endorsementCount?: number;
  licenseInfo?: {
    type: 'ECRA' | 'TSSA' | 'RMT' | 'OPMCA';
    number: string;
  };
  insuranceInfo?: {
    amount: number; // in millions
    currency: string;
  };
}

const LEVEL_CONFIG = {
  1: { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Email Verified' },
  2: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Phone Verified' },
  3: { icon: Shield, color: 'text-green-500', bg: 'bg-green-100', label: 'ID & Background Checked' },
  4: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Insured Professional' },
  5: { icon: Award, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Licensed Professional' },
};

export function VerificationBadge({ 
  level, 
  nodeName, 
  endorsementCount = 0,
  licenseInfo,
  insuranceInfo 
}: VerificationBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const hasEndorsements = endorsementCount >= 5;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Level Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.bg} ${config.color} border-none px-2 py-1 text-xs font-bold flex items-center gap-1 cursor-help`}>
              <Icon className="w-3 h-3" />
              Level {level}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{config.label}</p>
            {insuranceInfo && (
              <p className="text-xs mt-1">Insured up to {insuranceInfo.amount}M {insuranceInfo.currency}</p>
            )}
            {licenseInfo && (
              <p className="text-xs mt-1">{licenseInfo.type} #{licenseInfo.number}</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Community Node */}
        {nodeName && (
          <Badge variant="outline" className="text-xs px-2 py-1 border-primary/20 text-primary">
            <MapPin className="w-3 h-3 mr-1" />
            {nodeName}
          </Badge>
        )}

        {/* Neighbor Endorsements */}
        {hasEndorsements && (
          <Badge className="bg-orange-100 text-orange-600 border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
            <Users className="w-3 h-3" />
            Community Trusted
          </Badge>
        )}

        {/* License Badge (if Level 5) */}
        {level === 5 && licenseInfo && (
          <Badge className="bg-amber-100 text-amber-700 border-none px-2 py-1 text-xs font-bold">
            {licenseInfo.type} Verified
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}
