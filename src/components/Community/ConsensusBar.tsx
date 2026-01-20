/**
 * ConsensusBar - 共识进度条组件
 * 显示真言帖的社区共识投票分布
 */
import { Consensus, ConsensusLevel, CONSENSUS_LEVEL_HINTS } from "@/types/community";
import { useConfigStore } from "@/stores/configStore";
import { motion } from "framer-motion";

interface ConsensusBarProps {
    consensus: Consensus;
    showLabels?: boolean;
    showHint?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// 共识等级样式配置
const LEVEL_CONFIG: Record<ConsensusLevel, { color: string; bgColor: string; icon: string }> = {
    HIGH: { color: 'text-green-600', bgColor: 'bg-green-500/10', icon: '✓✓' },
    MEDIUM: { color: 'text-blue-600', bgColor: 'bg-blue-500/10', icon: '✓' },
    LOW: { color: 'text-gray-500', bgColor: 'bg-gray-500/10', icon: '?' },
    CONTROVERSIAL: { color: 'text-orange-600', bgColor: 'bg-orange-500/10', icon: '⚡' },
    PENDING: { color: 'text-amber-600', bgColor: 'bg-amber-500/10', icon: '⏳' },
};

// 投票类型配置
const VOTE_COLORS = {
    agree: { bg: 'bg-green-500', label: { zh: '一致', en: 'Agree' } },
    partial: { bg: 'bg-blue-400', label: { zh: '部分', en: 'Partial' } },
    disagree: { bg: 'bg-orange-500', label: { zh: '不符', en: 'Disagree' } },
    uncertain: { bg: 'bg-gray-300', label: { zh: '不确定', en: 'Unsure' } },
};

export function ConsensusBar({
    consensus,
    showLabels = false,
    showHint = true,
    size = 'md',
    className = '',
}: ConsensusBarProps) {
    const { language } = useConfigStore();
    const levelConfig = LEVEL_CONFIG[consensus.level];

    // 尺寸配置
    const sizeConfig = {
        sm: { bar: 'h-1', text: 'text-[10px]' },
        md: { bar: 'h-1.5', text: 'text-xs' },
        lg: { bar: 'h-2', text: 'text-sm' },
    };

    const { bar: barHeight, text: textSize } = sizeConfig[size];

    // 计算百分比
    const getPercent = (value: number) => {
        if (consensus.totalVotes === 0) return 0;
        return (value / consensus.totalVotes) * 100;
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* 进度条 */}
            <div className={`flex ${barHeight} rounded-full overflow-hidden bg-gray-100`}>
                {consensus.totalVotes > 0 ? (
                    <>
                        <motion.div
                            className={`${VOTE_COLORS.agree.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercent(consensus.agree)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        <motion.div
                            className={`${VOTE_COLORS.partial.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercent(consensus.partial)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        />
                        <motion.div
                            className={`${VOTE_COLORS.disagree.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercent(consensus.disagree)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        />
                        <motion.div
                            className={`${VOTE_COLORS.uncertain.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercent(consensus.uncertain)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                        />
                    </>
                ) : (
                    <div className="w-full bg-gray-200 animate-pulse" />
                )}
            </div>

            {/* 标签行 (可选) */}
            {showLabels && consensus.totalVotes > 0 && (
                <div className={`flex items-center gap-3 ${textSize}`}>
                    {Object.entries(VOTE_COLORS).map(([key, config]) => {
                        const count = consensus[key as keyof typeof VOTE_COLORS];
                        if (count === 0) return null;
                        return (
                            <div key={key} className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${config.bg}`} />
                                <span className="text-muted-foreground">
                                    {language === 'zh' ? config.label.zh : config.label.en}
                                </span>
                                <span className="font-medium">{count}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 共识提示 */}
            {showHint && (
                <div className={`flex items-center justify-between ${textSize}`}>
                    <span className={`font-medium ${levelConfig.color}`}>
                        {levelConfig.icon}{' '}
                        {language === 'zh'
                            ? CONSENSUS_LEVEL_HINTS[consensus.level]?.zh
                            : CONSENSUS_LEVEL_HINTS[consensus.level]?.en}
                    </span>
                    <span className="text-muted-foreground">
                        {consensus.totalVotes} {language === 'zh' ? '人验证' : 'verified'}
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * ConsensusLegend - 共识图例组件
 * 用于详情页底部展示投票类型说明
 */
export function ConsensusLegend({ className = '' }: { className?: string }) {
    const { language } = useConfigStore();

    return (
        <div className={`flex flex-wrap items-center gap-4 text-xs ${className}`}>
            {Object.entries(VOTE_COLORS).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                    <span className="text-muted-foreground">
                        {language === 'zh' ? config.label.zh : config.label.en}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default ConsensusBar;
