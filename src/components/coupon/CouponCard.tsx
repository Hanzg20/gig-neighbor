import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QrCodeGenerator } from '@/components/inventory/QrCodeGenerator';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, Check } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { cn } from '@/lib/utils';

export interface CouponData {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase: number;
    maxDiscount?: number;
    validUntil: string;
    providerName: string;
    providerLogo?: string;
    // 用于生成二维码的商品ID (可选)
    listingMasterId?: string;
}

interface CouponCardProps {
    coupon: CouponData;
    onShare?: () => void;
    showActions?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const i18n = {
    zh: {
        download: '下载图片',
        share: '分享',
        validUntil: '有效期至',
        minPurchase: '满',
        canUse: '可用',
        scanToUse: '扫码使用',
        downloading: '生成中...',
        downloaded: '已下载',
        off: '折',
        noLimit: '无门槛',
    },
    en: {
        download: 'Download',
        share: 'Share',
        validUntil: 'Valid until',
        minPurchase: 'Min.',
        canUse: 'purchase',
        scanToUse: 'Scan to use',
        downloading: 'Generating...',
        downloaded: 'Downloaded',
        off: 'OFF',
        noLimit: 'No minimum',
    }
};

export function CouponCard({
    coupon,
    onShare,
    showActions = true,
    size = 'medium',
    className
}: CouponCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { language } = useConfigStore();
    const t = i18n[language] || i18n.en;

    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    // 尺寸配置
    const sizeConfig = {
        small: { width: 280, qrSize: 80, titleSize: 'text-3xl', padding: 'p-4' },
        medium: { width: 340, qrSize: 120, titleSize: 'text-5xl', padding: 'p-6' },
        large: { width: 400, qrSize: 140, titleSize: 'text-6xl', padding: 'p-8' },
    };
    const config = sizeConfig[size];

    // 核销/使用 URL
    const baseUrl = window.location.origin;
    const redeemUrl = coupon.listingMasterId
        ? `${baseUrl}/scan/${coupon.listingMasterId}?coupon=${coupon.code}`
        : `${baseUrl}/redeem/${coupon.code}`;

    // 折扣显示文本
    const discountText = coupon.discountType === 'percentage'
        ? `${coupon.discountValue}%`
        : `$${coupon.discountValue}`;

    // 格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // 下载图片
    const handleDownload = async () => {
        if (!cardRef.current || downloading) return;

        setDownloading(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `coupon-${coupon.code}.png`;
            link.href = dataUrl;
            link.click();

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2000);
        } catch (error) {
            console.error('Failed to generate coupon image:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* 优惠券卡片 */}
            <div
                ref={cardRef}
                className="bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 rounded-2xl overflow-hidden shadow-xl"
                style={{ width: config.width }}
            >
                {/* 顶部锯齿边缘 */}
                <div className="h-4 flex justify-around bg-transparent">
                    {[...Array(Math.floor(config.width / 20))].map((_, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 bg-white rounded-full -mt-2"
                        />
                    ))}
                </div>

                <div className={cn("text-white text-center", config.padding)}>
                    {/* 商家信息 */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {coupon.providerLogo && (
                            <img
                                src={coupon.providerLogo}
                                alt={coupon.providerName}
                                className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                            />
                        )}
                        <span className="text-sm opacity-90 font-medium">
                            {coupon.providerName}
                        </span>
                    </div>

                    {/* 折扣金额 */}
                    <div className={cn("font-bold mb-1", config.titleSize)}>
                        {discountText}
                        <span className="text-2xl ml-1">{t.off}</span>
                    </div>

                    {/* 优惠券名称 */}
                    <div className="text-lg opacity-95 mb-1">{coupon.name}</div>

                    {/* 使用条件 */}
                    <div className="text-sm opacity-80 mb-4">
                        {coupon.minPurchase > 0
                            ? `${t.minPurchase} $${coupon.minPurchase} ${t.canUse}`
                            : t.noLimit
                        }
                    </div>

                    {/* 二维码 */}
                    <div className="bg-white rounded-xl p-3 inline-block mb-3 shadow-inner">
                        <QrCodeGenerator
                            value={redeemUrl}
                            size={config.qrSize}
                            level="H"
                            logoSize={18}
                        />
                        <div className="text-gray-500 text-xs mt-1 font-medium">
                            {t.scanToUse}
                        </div>
                    </div>

                    {/* 券码 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4 inline-block mb-3">
                        <span className="font-mono font-bold tracking-widest text-lg">
                            {coupon.code}
                        </span>
                    </div>

                    {/* 有效期 */}
                    <div className="text-xs opacity-70">
                        {t.validUntil} {formatDate(coupon.validUntil)}
                    </div>
                </div>

                {/* 底部锯齿边缘 */}
                <div className="h-4 flex justify-around bg-transparent">
                    {[...Array(Math.floor(config.width / 20))].map((_, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 bg-white rounded-full mt-0"
                        />
                    ))}
                </div>
            </div>

            {/* 操作按钮 */}
            {showActions && (
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        disabled={downloading}
                        className="min-w-[120px]"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.downloading}
                            </>
                        ) : downloaded ? (
                            <>
                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                {t.downloaded}
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                {t.download}
                            </>
                        )}
                    </Button>

                    {onShare && (
                        <Button onClick={onShare}>
                            <Share2 className="w-4 h-4 mr-2" />
                            {t.share}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CouponCard;
