import { MapPin, Search, ChefHat, Sparkles, Package } from "lucide-react";
import { useState } from "react";

interface BusinessEntry {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
}

const businessEntries: BusinessEntry[] = [
  {
    icon: <ChefHat className="w-8 h-8" />,
    label: "邻里美食",
    sublabel: "私房菜·盒饭",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    label: "上门服务",
    sublabel: "保洁·维修·搬家",
    color: "text-primary",
    bgColor: "bg-primary/5",
  },
  {
    icon: <Package className="w-8 h-8" />,
    label: "跑腿任务",
    sublabel: "代取·代买·帮忙",
    color: "text-accent",
    bgColor: "bg-accent/5",
  },
];

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Kanata Lakes");

  const locations = ["Kanata Lakes", "190 Lees Ave", "170 Lees Ave"];

  return (
    <section className="relative py-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-warm opacity-50" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container relative">
        {/* Location Bar */}
        <div className="flex items-center justify-between mb-5">
          <button className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{selectedLocation}</span>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">切换社区:</span>
            {locations.slice(0, 2).map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  selectedLocation === loc
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {loc.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索服务、美食或任务..."
            className="search-input pl-14 pr-28"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 btn-action py-2.5 px-5 text-sm">
            搜索
          </button>
        </div>

        {/* Business Entry Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {businessEntries.map((entry) => (
            <button
              key={entry.label}
              className={`${entry.bgColor} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className={`${entry.color} group-hover:scale-110 transition-transform`}>
                {entry.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{entry.label}</p>
                <p className="text-xs text-muted-foreground">{entry.sublabel}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Tags */}
        <div className="flex flex-wrap gap-2">
          {["🍲 家常菜", "🧹 深度保洁", "📦 代取快递", "🔧 水管维修", "🚚 小型搬家"].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 rounded-full bg-card border border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
