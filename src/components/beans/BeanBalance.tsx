import { Coins } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface BeanBalanceProps {
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export const BeanBalance = ({ showLabel = true, size = "md" }: BeanBalanceProps) => {
    const { currentUser } = useAuthStore();

    if (!currentUser) return null;

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <Coins className={`${iconSizes[size]} text-amber-600`} />
            <span className={`${sizeClasses[size]} font-bold text-amber-900 dark:text-amber-100`}>
                {currentUser.beansBalance?.toLocaleString() || 0}
            </span>
            {showLabel && (
                <span className={`${sizeClasses[size]} text-amber-700 dark:text-amber-300`}>
                    Beans
                </span>
            )}
        </div>
    );
};

export default BeanBalance;
