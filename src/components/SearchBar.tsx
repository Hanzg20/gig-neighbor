import { Search, X, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const suggestions = [
    "House Cleaning",
    "Snow Removal",
    "Lawn Care",
    "Tool Rental",
    "Pet Sitting",
    "Tutoring",
  ];

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/category/service?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative group flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
            placeholder="搜索服务、美食或任务.."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-border/50 bg-muted/30 focus:bg-background focus:border-primary transition-all outline-none text-lg shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <Button
          onClick={() => navigate(`/category/service`)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md animate-scale-hover whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          搜索
        </Button>
      </div>

      {/* 搜索建议 */}
      {showSuggestions && (query || suggestions.length > 0) && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-2xl p-2 shadow-elevated z-50">
          {query ? (
            <div className="p-2 text-sm text-muted-foreground">
              Searching for "{query}"...
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Trending Searches
              </div>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {suggestion}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
