import { Link } from 'react-router-dom';

interface HashtagTextProps {
  text: string;
  className?: string;
  onHashtagClick?: (tag: string) => void;
}

/**
 * 解析文本中的 #标签 并渲染为可点击的链接
 * 支持中英文标签，例如：#二手交易 #ForSale
 */
export const HashtagText = ({ text, className = '', onHashtagClick }: HashtagTextProps) => {
  // 匹配 #标签（支持中英文、数字、下划线）
  const hashtagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g;

  const parseText = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
      // 添加标签前的文本
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // 添加标签
      const tag = match[1];
      parts.push(
        <Link
          key={`tag-${match.index}`}
          to={`/community?tag=${encodeURIComponent(tag)}`}
          onClick={(e) => {
            if (onHashtagClick) {
              e.preventDefault();
              onHashtagClick(tag);
            }
          }}
          className="text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer hover:underline"
        >
          #{tag}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <span className={className}>{parseText()}</span>;
};

/**
 * 从文本中提取所有标签
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g;
  const tags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }

  return tags;
};

/**
 * 验证标签是否有效
 */
export const isValidHashtag = (tag: string): boolean => {
  return /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,20}$/.test(tag);
};
