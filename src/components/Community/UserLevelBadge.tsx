/**
 * UserLevelBadge - 用户等级徽章组件
 * 显示用户的社区等级和贡献度
 */
import { useMemo } from "react";
import { USER_LEVELS, getUserLevel } from "@/types/community";
import { useConfigStore } from "@/stores/configStore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserLevelBadgeProps {
    level?: number;
    score?: number;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// 等级名称的英文映射
const LEVEL_NAMES_EN: Record<number, string> = {
    1: 'New Neighbor',
    2: 'Active Neighbor',
    3: 'Helpful Neighbor',
    4: 'Community Expert',
    5: 'Truth Pioneer',
};

export function UserLevelBadge({
    level,
    score,
    showTooltip = true,
    size = 'md',
    className = '',
}: UserLevelBadgeProps) {
    const { language } = useConfigStore();

    // 计算等级信息
    const levelInfo = useMemo(() => {
        if (level !== undefined) {
            const foundLevel = USER_LEVELS.find(l => l.level === level);
            return foundLevel || USER_LEVELS[0];
        }
        if (score !== undefined) {
            return getUserLevel(score);
        }
        return USER_LEVELS[0];
    }, [level, score]);

    // 尺寸配置
    const sizeConfig = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const badge = (
        <span
            className={`inline-flex items-center ${sizeConfig[size]} ${className}`}
            role="img"
            aria-label={levelInfo.name}
        >
            {levelInfo.icon}
        </span>
    );

    if (!showTooltip) {
        return badge;
    }

    // 计算下一等级进度
    const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === levelInfo.level);
    const nextLevel = USER_LEVELS[currentLevelIndex + 1];
    const actualScore = score ?? 0;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                    <div className="space-y-1 text-center">
                        <div className="font-bold">
                            {levelInfo.icon} {language === 'zh' ? levelInfo.name : LEVEL_NAMES_EN[levelInfo.level]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Lv.{levelInfo.level}
                        </div>
                        {nextLevel && actualScore > 0 && (
                            <div className="text-xs">
                                {language === 'zh'
                                    ? `距下一级还需 ${nextLevel.minScore - actualScore} 分`
                                    : `${nextLevel.minScore - actualScore} pts to next level`}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * UserLevelProgress - 用户等级进度条组件
 * 用于个人资料页显示详细的等级进度
 */
interface UserLevelProgressProps {
    score: number;
    showStats?: boolean;
    className?: string;
}

export function UserLevelProgress({
    score,
    showStats = true,
    className = '',
}: UserLevelProgressProps) {
    const { language } = useConfigStore();
    const levelInfo = getUserLevel(score);

    // 计算进度
    const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === levelInfo.level);
    const nextLevel = USER_LEVELS[currentLevelIndex + 1];

    let progressPercent = 100;
    if (nextLevel) {
        const currentMin = levelInfo.minScore;
        const nextMin = nextLevel.minScore;
        progressPercent = ((score - currentMin) / (nextMin - currentMin)) * 100;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* 等级展示 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{levelInfo.icon}</span>
                    <div>
                        <div className="font-bold">
                            {language === 'zh' ? levelInfo.name : LEVEL_NAMES_EN[levelInfo.level]}
                        </div>
                        <div className="text-xs text-muted-foreground">Lv.{levelInfo.level}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-primary">{score}</div>
                    <div className="text-xs text-muted-foreground">
                        {language === 'zh' ? '贡献分' : 'Points'}
                    </div>
                </div>
            </div>

            {/* 进度条 */}
            {nextLevel && (
                <div className="space-y-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{levelInfo.minScore}</span>
                        <span>
                            {language === 'zh'
                                ? `距 ${nextLevel.name} 还需 ${nextLevel.minScore - score} 分`
                                : `${nextLevel.minScore - score} pts to ${LEVEL_NAMES_EN[nextLevel.level]}`}
                        </span>
                        <span>{nextLevel.minScore}</span>
                    </div>
                </div>
            )}

            {/* 等级说明 */}
            {showStats && (
                <div className="grid grid-cols-5 gap-1 pt-2">
                    {USER_LEVELS.map((lvl, idx) => (
                        <div
                            key={lvl.level}
                            className={`text-center p-1.5 rounded-lg transition-all ${
                                lvl.level === levelInfo.level
                                    ? 'bg-amber-100 border border-amber-300'
                                    : lvl.level < levelInfo.level
                                    ? 'bg-gray-100 opacity-60'
                                    : 'bg-gray-50 opacity-40'
                            }`}
                        >
                            <div className={lvl.level <= levelInfo.level ? '' : 'grayscale'}>
                                {lvl.icon}
                            </div>
                            <div className="text-[9px] text-muted-foreground truncate">
                                Lv.{lvl.level}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserLevelBadge;
