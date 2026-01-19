import { Search, X, TrendingUp, Sparkles, Clock, Loader2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { useConfigStore } from "@/stores/configStore";
import { useSearchHistory } from "@/stores/searchHistoryStore";
import { ListingMaster } from "@/types/domain";

export function SmartSearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { language } = useConfigStore();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // AI 搜索集成
  const { results, loading, error, isAISearch } = useSemanticSearch(query, {
    enabled: query.length >= 2,
    threshold: 0.5,
    limit: 5
  });

  // 搜索建议 (热门搜索)
  const suggestions = language === 'zh'
    ? ["家政清洁", "除雪服务", "草坪护理", "工具租赁", "宠物看护", "家教辅导"]
    : ["House Cleaning", "Snow Removal", "Lawn Care", "Tool Rental", "Pet Sitting", "Tutoring"];

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery); // 保存到历史记录
      navigate(`/category/service?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const t = {
    placeholder: language === 'zh' ? '搜索服务、美食或任务..' : 'Search services, food, or tasks..',
    searchButton: language === 'zh' ? '搜索' : 'Search',
    aiRecommendations: language === 'zh' ? 'AI 智能推荐' : 'AI Recommendations',
    trendingSearches: language === 'zh' ? '热门搜索' : 'Trending Searches',
    recentSearches: language === 'zh' ? '最近搜索' : 'Recent Searches',
    clearHistory: language === 'zh' ? '清除历史' : 'Clear History',
    viewAll: language === 'zh' ? '查看全部' : 'View All',
    results: language === 'zh' ? '个结果' : 'Results',
    noResults: language === 'zh' ? '没有找到相关结果' : 'No results found',
    tryOther: language === 'zh' ? '试试其他关键词' : 'Try different keywords',
    highMatch: language === 'zh' ? '高度匹配' : 'High Match',
  };

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative group flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
            placeholder={t.placeholder}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/20 bg-white/20 backdrop-blur-md focus:bg-white/40 focus:border-primary/50 transition-all outline-none text-lg shadow-elevated"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />

          {/* AI 搜索加载指示器 */}
          {loading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}

          {/* 清除按钮 */}
          {query && !loading && (
            <button
              onClick={() => {
                setQuery("");
                setShowResults(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <Button
          onClick={() => handleSearch(query)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md animate-scale-hover whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          {t.searchButton}
        </Button>
      </div>

      {/* 搜索结果下拉框 */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-2xl p-3 shadow-elevated z-50 max-h-[500px] overflow-y-auto">
          {/* AI 搜索结果预览 */}
          {query && results.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                {t.aiRecommendations}
                {isAISearch && (
                  <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10">
                    AI
                  </Badge>
                )}
              </div>

              {results.slice(0, 3).map((item, index) => (
                <SearchResultPreview
                  key={item.id}
                  item={item}
                  query={query}
                  language={language}
                  onSelect={() => setShowResults(false)}
                />
              ))}

              {results.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full text-primary hover:text-primary/80"
                  onClick={() => handleSearch(query)}
                >
                  {t.viewAll} {results.length} {t.results} →
                </Button>
              )}
            </div>
          )}

          {/* 无结果提示 */}
          {query && !loading && results.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm mb-2">{t.noResults}</p>
              <p className="text-xs">{t.tryOther}</p>
            </div>
          )}

          {/* 搜索历史 (仅在无查询且有历史时显示) */}
          {!query && history.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>{t.recentSearches}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory();
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors normal-case flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {t.clearHistory}
                </button>
              </div>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(h);
                    handleSearch(h);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 rounded-xl transition-colors flex items-center gap-2 group"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{h}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(h);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* 热门搜索建议 (仅在无查询时显示) */}
          {!query && (
            <div className="space-y-2">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t.trendingSearches}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 搜索结果预览卡片组件
interface SearchResultPreviewProps {
  item: ListingMaster & { similarity?: number };
  query: string;
  language: 'en' | 'zh';
  onSelect: () => void;
}

const SearchResultPreview = ({ item, query, language, onSelect }: SearchResultPreviewProps) => {
  const title = language === 'zh' ? item.titleZh : (item.titleEn || item.titleZh);
  const description = language === 'zh' ? item.descriptionZh : (item.descriptionEn || item.descriptionZh);

  return (
    <Link
      to={`/service/${item.id}`}
      onClick={onSelect}
      className="flex gap-3 p-3 hover:bg-muted rounded-xl transition-colors group"
    >
      {/* 缩略图 */}
      <div className="shrink-0">
        <img
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'}
          alt={title}
          className="w-14 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate mb-1">
          {title}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </div>
      </div>

      {/* 相似度徽章 */}
      {item.similarity && item.similarity > 0.75 && (
        <div className="shrink-0">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'zh' ? '高度匹配' : 'High Match'}
          </Badge>
        </div>
      )}
    </Link>
  );
};
