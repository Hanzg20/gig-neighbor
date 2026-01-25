import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { QR_LOGO_BASE64 } from '@/constants/assets';

interface QrCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    fgColor?: string;
    bgColor?: string;
    logoUrl?: string; // Logo image URL
    logoSize?: number; // Logo size as percentage of QR code size (default: 20%)
    logoOpacity?: number; // Logo opacity (0-1)
    logoPadding?: number; // White padding around logo (default: 4px)
}

export function QrCodeGenerator({
    value,
    size = 128,
    className,
    level = 'H', // 使用最高纠错级别以支持logo遮挡
    includeMargin = false,
    fgColor = "#000000",
    bgColor = "#FFFFFF",
    logoUrl = QR_LOGO_BASE64,
    logoSize = 20, // Logo占QR码的20%
    logoOpacity = 1,
    logoPadding = 4
}: QrCodeGeneratorProps) {
    // Calculate logo dimensions
    const logoPixelSize = logoUrl ? (size * logoSize) / 100 : 0;

    return (
        <div className={cn("inline-block", className)}>
            <QRCodeSVG
                value={value}
                size={size}
                level={level}
                includeMargin={includeMargin}
                fgColor={fgColor}
                bgColor={bgColor}
                className="w-full h-full"
                imageSettings={logoUrl ? {
                    src: logoUrl,
                    x: undefined, // 自动居中
                    y: undefined, // 自动居中
                    height: logoPixelSize,
                    width: logoPixelSize,
                    opacity: logoOpacity,
                    excavate: true, // 挖空logo下方的二维码，提高扫描成功率
                } : undefined}
            />
        </div>
    );
}
