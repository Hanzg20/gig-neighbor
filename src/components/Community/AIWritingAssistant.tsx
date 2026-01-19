import { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AIWritingAssistantProps {
  currentText: string;
  onApply: (text: string) => void;
  postType?: string;
  className?: string;
}

type AssistantAction =
  | 'polish'      // 润色文案
  | 'expand'      // 扩展内容
  | 'summarize'   // 精简内容
  | 'emojify'     // 添加表情
  | 'hashtag';    // 生成标签

interface Suggestion {
  action: AssistantAction;
  text: string;
  reason?: string;
}

export const AIWritingAssistant = ({
  currentText,
  onApply,
  postType,
  className = ''
}: AIWritingAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 模拟 AI 生成建议
  const generateSuggestions = async (action: AssistantAction) => {
    setIsGenerating(true);
    setSuggestions([]);

    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟生成结果
    const mockSuggestions: Record<AssistantAction, Suggestion[]> = {
      polish: [
        {
          action: 'polish',
          text: `${currentText} ✨ 诚心出售，物美价廉！有需要的邻居可以联系我哦~ 支持上门自提或同城配送。`,
          reason: '添加了更友好的语气和交易细节'
        },
        {
          action: 'polish',
          text: `【邻里特惠】${currentText} 💫 品质保证，价格实惠，先到先得！`,
          reason: '使用了吸引眼球的标题格式'
        }
      ],
      expand: [
        {
          action: 'expand',
          text: `${currentText}\n\n📦 商品详情：\n- 成色：9成新\n- 购买时间：半年前\n- 原价：¥XXX\n- 现价：¥XXX\n\n💬 温馨提示：\n- 支持看货验货\n- 可议价\n- 欢迎咨询`,
          reason: '添加了详细的商品信息和交易说明'
        }
      ],
      summarize: [
        {
          action: 'summarize',
          text: currentText.split('。')[0] + '。' + (currentText.includes('价格') ? '价格优惠，欢迎咨询！' : ''),
          reason: '保留核心信息，更简洁明了'
        }
      ],
      emojify: [
        {
          action: 'emojify',
          text: `✨ ${currentText} 🎁`,
          reason: '添加适当的表情符号增加亲和力'
        }
      ],
      hashtag: [
        {
          action: 'hashtag',
          text: `${currentText}\n\n#二手交易 #社区好物 #邻里互助`,
          reason: '推荐相关热门标签'
        }
      ]
    };

    setSuggestions(mockSuggestions[action] || []);
    setIsGenerating(false);
  };

  const handleApply = (suggestion: Suggestion) => {
    onApply(suggestion.text);
    toast.success('已应用 AI 建议');
    setIsOpen(false);
    setSuggestions([]);
  };

  const actionButtons = [
    {
      action: 'polish' as AssistantAction,
      label: '润色',
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      action: 'expand' as AssistantAction,
      label: '扩展',
      icon: Wand2,
      color: 'text-blue-600'
    },
    {
      action: 'summarize' as AssistantAction,
      label: '精简',
      icon: RefreshCw,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-primary hover:text-primary border-primary/30 hover:border-primary"
      >
        <Sparkles className="w-4 h-4" />
        AI 助手
      </Button>

      {/* 助手面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
          >
            {/* 标题 */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">AI 写作助手</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 操作按钮 */}
            {!isGenerating && suggestions.length === 0 && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  选择一个 AI 功能来优化你的内容：
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {actionButtons.map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => generateSuggestions(btn.action)}
                      disabled={!currentText || currentText.length < 5}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg
                        border border-border hover:border-primary/50
                        transition-all hover:shadow-md
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${btn.color}
                      `}
                    >
                      <btn.icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-foreground">
                        {btn.label}
                      </span>
                    </button>
                  ))}
                </div>

                {(!currentText || currentText.length < 5) && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    请先输入至少 5 个字符
                  </p>
                )}
              </div>
            )}

            {/* 加载状态 */}
            {isGenerating && (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">AI 正在思考中...</p>
              </div>
            )}

            {/* 建议列表 */}
            {!isGenerating && suggestions.length > 0 && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    选择一个建议或点击刷新重新生成
                  </p>
                  <button
                    onClick={() => setSuggestions([])}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    重新生成
                  </button>
                </div>

                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-3 rounded-lg border transition-all cursor-pointer
                      ${
                        selectedIndex === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }
                    `}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                      {suggestion.text}
                    </p>
                    {suggestion.reason && (
                      <p className="text-xs text-muted-foreground">
                        💡 {suggestion.reason}
                      </p>
                    )}

                    {selectedIndex === index && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleApply(suggestion)}
                          className="flex-1 gap-1"
                        >
                          <Check className="w-4 h-4" />
                          应用此建议
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
