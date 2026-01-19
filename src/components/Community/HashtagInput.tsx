import { useState, useRef, useEffect } from 'react';
import { Hash, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { isValidHashtag } from './HashtagText';
import { motion, AnimatePresence } from 'framer-motion';

interface HashtagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  suggestions?: string[];
}

export const HashtagInput = ({
  tags,
  onChange,
  maxTags = 10,
  placeholder = '添加标签...',
  suggestions = []
}: HashtagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤建议标签
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !tags.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '').trim();

    if (!cleanTag) return;
    if (tags.length >= maxTags) return;
    if (tags.includes(cleanTag)) return;
    if (!isValidHashtag(cleanTag)) return;

    onChange([...tags, cleanTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 自动添加 # 前缀
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }

    setInputValue(value);
    setShowSuggestions(value.length > 1);
  };

  return (
    <div className="space-y-2">
      {/* 标签输入框 */}
      <div className="relative">
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary/20">
          <Hash className="w-4 h-4 text-muted-foreground shrink-0" />

          {/* 已添加的标签 */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1 text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 hover:bg-background/50 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {/* 输入框 */}
            {tags.length < maxTags && (
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 px-0 h-6 text-sm"
              />
            )}
          </div>

          {/* 标签计数 */}
          <span className="text-xs text-muted-foreground shrink-0">
            {tags.length}/{maxTags}
          </span>
        </div>

        {/* 建议标签下拉 */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
            >
              {filteredSuggestions.slice(0, 8).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addTag(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Hash className="w-3 h-3 text-muted-foreground" />
                  <span>#{suggestion}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 提示文本 */}
      {tags.length === 0 && (
        <p className="text-xs text-muted-foreground">
          添加标签让更多人发现你的内容（支持中英文，按 Enter 或空格添加）
        </p>
      )}
    </div>
  );
};
