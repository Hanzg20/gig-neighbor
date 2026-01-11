import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface QrCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    fgColor?: string;
    bgColor?: string;
}

export function QrCodeGenerator({
    value,
    size = 128,
    className,
    level = 'M',
    includeMargin = false,
    fgColor = "#000000",
    bgColor = "#FFFFFF"
}: QrCodeGeneratorProps) {
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
            />
        </div>
    );
}
