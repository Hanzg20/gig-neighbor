import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickSearchTag {
  label: string;
  query: string;
  color?: string;
}

const quickTags: QuickSearchTag[] = [
  { label: "深度保洁", query: "深度保洁", color: "#10b981" },
  { label: "水管维修", query: "水管维修", color: "#3b82f6" },
  { label: "搬家服务", query: "搬家服务", color: "#f59e0b" },
  { label: "跑腿代购", query: "跑腿代购", color: "#8b5cf6" },
];

/**
 * Quick Search Tags Component
 * Displays quick search buttons below the search bar
 */
export function QuickSearchTags() {
  const navigate = useNavigate();

  const handleTagClick = (query: string) => {
    navigate(`/category/service?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mt-3">
      {quickTags.map((tag, index) => (
        <motion.button
          key={tag.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTagClick(tag.query)}
          className="px-4 py-1.5 rounded-full text-sm font-medium bg-muted/50 hover:bg-primary/10 text-foreground hover:text-primary transition-all border border-border/50 hover:border-primary/50"
        >
          {tag.label}
        </motion.button>
      ))}
    </div>
  );
}

