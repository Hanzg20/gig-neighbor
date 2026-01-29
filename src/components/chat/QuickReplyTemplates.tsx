import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
    Calendar,
    MapPin,
    Phone,
    ThumbsUp,
    X
} from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';

interface QuickReplyTemplate {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    text: string;
    category: 'greeting' | 'status' | 'scheduling' | 'payment' | 'general';
    variables?: string[]; // Variables to replace like {time}, {date}, {price}
}

interface QuickReplyTemplatesProps {
    onSelectReply: (text: string) => void;
    context?: 'buyer' | 'seller' | 'general';
}

export const QuickReplyTemplates: React.FC<QuickReplyTemplatesProps> = ({
    onSelectReply,
    context = 'general'
}) => {
    const { language } = useConfigStore();
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const templates: QuickReplyTemplate[] = language === 'zh' ? [
        // Greetings
        { id: 'hello', icon: ThumbsUp, label: '你好', text: '你好！有什么可以帮助您的吗？', category: 'greeting' },
        { id: 'thanks', icon: ThumbsUp, label: '谢谢', text: '非常感谢！', category: 'greeting' },

        // Status Updates
        { id: 'on-way', icon: MapPin, label: '在路上', text: '我正在路上，预计{time}分钟后到达。', category: 'status', variables: ['time'] },
        { id: 'completed', icon: CheckCircle, label: '已完成', text: '服务已完成，请确认。', category: 'status' },
        { id: 'processing', icon: Clock, label: '处理中', text: '正在处理您的订单，请稍等。', category: 'status' },

        // Scheduling
        { id: 'confirm-time', icon: Calendar, label: '确认时间', text: '好的，{date} {time}可以吗？', category: 'scheduling', variables: ['date', 'time'] },
        { id: 'reschedule', icon: Calendar, label: '改期', text: '抱歉，需要改期。什么时间方便？', category: 'scheduling' },
        { id: 'available-now', icon: Clock, label: '现在有空', text: '我现在有空，可以开始服务。', category: 'scheduling' },

        // Payment
        { id: 'price-confirm', icon: DollarSign, label: '确认价格', text: '价格是${price}，包含所有费用。', category: 'payment', variables: ['price'] },
        { id: 'payment-received', icon: CheckCircle, label: '已收款', text: '已收到付款，谢谢！', category: 'payment' },

        // General
        { id: 'need-info', icon: AlertCircle, label: '需要信息', text: '请提供更多信息：{info}', category: 'general', variables: ['info'] },
        { id: 'contact', icon: Phone, label: '联系方式', text: '您可以通过{phone}联系我。', category: 'general', variables: ['phone'] },
        { id: 'ok', icon: CheckCircle, label: '好的', text: '好的，明白了。', category: 'general' },
    ] : [
        // English templates
        // Greetings
        { id: 'hello', icon: ThumbsUp, label: 'Hello', text: 'Hello! How can I help you?', category: 'greeting' },
        { id: 'thanks', icon: ThumbsUp, label: 'Thanks', text: 'Thank you very much!', category: 'greeting' },

        // Status Updates
        { id: 'on-way', icon: MapPin, label: 'On the way', text: "I'm on my way, ETA {time} minutes.", category: 'status', variables: ['time'] },
        { id: 'completed', icon: CheckCircle, label: 'Completed', text: 'Service completed. Please confirm.', category: 'status' },
        { id: 'processing', icon: Clock, label: 'Processing', text: "Processing your order, please wait.", category: 'status' },

        // Scheduling
        { id: 'confirm-time', icon: Calendar, label: 'Confirm time', text: 'Would {date} at {time} work for you?', category: 'scheduling', variables: ['date', 'time'] },
        { id: 'reschedule', icon: Calendar, label: 'Reschedule', text: 'Sorry, need to reschedule. When works for you?', category: 'scheduling' },
        { id: 'available-now', icon: Clock, label: 'Available now', text: "I'm available now and can start the service.", category: 'scheduling' },

        // Payment
        { id: 'price-confirm', icon: DollarSign, label: 'Price confirm', text: 'The price is ${price}, all inclusive.', category: 'payment', variables: ['price'] },
        { id: 'payment-received', icon: CheckCircle, label: 'Payment received', text: 'Payment received, thank you!', category: 'payment' },

        // General
        { id: 'need-info', icon: AlertCircle, label: 'Need info', text: 'Please provide more information: {info}', category: 'general', variables: ['info'] },
        { id: 'contact', icon: Phone, label: 'Contact', text: 'You can reach me at {phone}.', category: 'general', variables: ['phone'] },
        { id: 'ok', icon: CheckCircle, label: 'OK', text: 'OK, got it.', category: 'general' },
    ];

    // Filter templates based on context
    const filteredTemplates = templates.filter(template => {
        if (context === 'buyer') {
            // Buyer-specific templates
            return !['on-way', 'completed', 'payment-received', 'available-now'].includes(template.id);
        }
        if (context === 'seller') {
            // Seller-specific templates
            return true;
        }
        return true;
    });

    const categories = [
        { id: 'greeting', label: language === 'zh' ? '问候' : 'Greetings', icon: ThumbsUp },
        { id: 'status', label: language === 'zh' ? '状态' : 'Status', icon: CheckCircle },
        { id: 'scheduling', label: language === 'zh' ? '时间' : 'Scheduling', icon: Calendar },
        { id: 'payment', label: language === 'zh' ? '支付' : 'Payment', icon: DollarSign },
        { id: 'general', label: language === 'zh' ? '通用' : 'General', icon: AlertCircle },
    ];

    const handleTemplateSelect = (template: QuickReplyTemplate) => {
        let text = template.text;

        // If template has variables, prompt for values
        if (template.variables && template.variables.length > 0) {
            for (const variable of template.variables) {
                const value = prompt(
                    language === 'zh'
                        ? `请输入 ${variable}:`
                        : `Please enter ${variable}:`
                );
                if (value) {
                    text = text.replace(`{${variable}}`, value);
                }
            }
        }

        onSelectReply(text);
        setShowTemplates(false);
    };

    const displayedTemplates = selectedCategory
        ? filteredTemplates.filter(t => t.category === selectedCategory)
        : filteredTemplates.slice(0, 5); // Show top 5 if no category selected

    return (
        <>
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="gap-2"
            >
                <Zap className="w-4 h-4" />
                {language === 'zh' ? '快捷回复' : 'Quick Reply'}
            </Button>

            {/* Templates Panel */}
            {showTemplates && (
                <Card className="absolute bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">
                            {language === 'zh' ? '选择快捷回复' : 'Select Quick Reply'}
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTemplates(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                        <Badge
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(null)}
                        >
                            {language === 'zh' ? '全部' : 'All'}
                        </Badge>
                        {categories.map(cat => (
                            <Badge
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                className="cursor-pointer gap-1"
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <cat.icon className="w-3 h-3" />
                                {cat.label}
                            </Badge>
                        ))}
                    </div>

                    {/* Template List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {displayedTemplates.map(template => {
                            const Icon = template.icon;
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-start gap-2">
                                        <Icon className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{template.label}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {template.text}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Reply Option */}
                    <div className="mt-3 pt-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                const custom = prompt(
                                    language === 'zh'
                                        ? '输入自定义回复：'
                                        : 'Enter custom reply:'
                                );
                                if (custom) {
                                    onSelectReply(custom);
                                    setShowTemplates(false);
                                }
                            }}
                        >
                            <AlertCircle className="w-4 h-4" />
                            {language === 'zh' ? '自定义回复' : 'Custom Reply'}
                        </Button>
                    </div>
                </Card>
            )}
        </>
    );
};