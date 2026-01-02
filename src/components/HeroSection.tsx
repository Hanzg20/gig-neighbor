import { MapPin, Search, Sparkles } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useState("Downtown Toronto");

  return (
    <section className="relative overflow-hidden bg-gradient-warm pb-8 pt-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container relative z-10">
        {/* Location Bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-warm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{location}</span>
            <span className="text-xs text-muted-foreground">• 切换</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="text-foreground">邻里互助，</span>
            <span className="text-gradient">恒心相帮</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            像买衣服一样购买本地服务，透明定价，一键预约
          </p>
        </div>

        {/* Search Box */}
        <div className="relative max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索服务，如：漏水、搬家、保洁..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-14 pr-28"
            />
            <button className="btn-action absolute right-2 top-1/2 -translate-y-1/2 py-2.5 px-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">智能搜索</span>
            </button>
          </div>
          
          {/* Quick search tags */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["深度保洁", "水管维修", "搬家服务", "跑腿代购"].map((tag) => (
              <button
                key={tag}
                className="px-4 py-1.5 text-sm font-medium bg-card text-foreground rounded-full shadow-warm hover:shadow-card-hover transition-all duration-300 hover:scale-105"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
