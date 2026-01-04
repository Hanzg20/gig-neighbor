import { useState } from "react";
import { MapPin, ChefHat, Sparkles, Package } from "lucide-react";

interface Tab {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const tabs: Tab[] = [
  { id: "nearby", icon: <MapPin className="w-4 h-4" />, label: "同小区" },
  { id: "food", icon: <ChefHat className="w-4 h-4" />, label: "美食" },
  { id: "service", icon: <Sparkles className="w-4 h-4" />, label: "服务" },
  { id: "task", icon: <Package className="w-4 h-4" />, label: "任务" },
];

interface TabFilterProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabFilter = ({ activeTab, onTabChange }: TabFilterProps) => {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-warm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-2" />

          {/* Sub-filters */}
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>距离</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>评分</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>筛选</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabFilter;
