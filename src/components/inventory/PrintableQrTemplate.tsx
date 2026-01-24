import { forwardRef } from 'react';
import { QrCodeGenerator } from './QrCodeGenerator';
import { cn } from '@/lib/utils';
import { InventoryItem, ListingMaster, ListingItem } from '@/types/domain';

export interface PrintableQrData {
    serialNumber: string; // Display text below QR (e.g., "Standard Card - $50.00" or "Universal QR")
    productName: string;
    productImage?: string; // Optional image URL
    url: string;
}

interface PrintableQrTemplateProps {
    data: PrintableQrData[];
    className?: string;
    logoUrl?: string; // 自定义logo URL，默认使用QR码专用logo
    showLogo?: boolean; // 是否显示logo，默认true
}

export const PrintableQrTemplate = forwardRef<HTMLDivElement, PrintableQrTemplateProps>(
    ({ data, className, logoUrl = '/qr-logo.png', showLogo = true }, ref) => {
        return (
            <div ref={ref} className={cn("pk-print-container hidden print:block bg-white", className)}>
                {/*
                    A4 Grid Layout
                    Standard A4 is roughly 210mm x 297mm.
                    We aim for a 3x5 or 4x6 grid depending on label size.
                    Here we use a responsive grid that wraps.
                */}
                <div className="grid grid-cols-3 gap-4 p-8">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-4 break-inside-avoid aspect-square text-center"
                        >
                            <h3 className="text-sm font-bold mb-2 line-clamp-2 h-10 flex items-center justify-center w-full">
                                {item.productName}
                            </h3>

                            {/* Optional Product Image */}
                            {item.productImage && (
                                <div className="w-24 h-24 mb-2 mx-auto">
                                    <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            )}

                            <div className="w-32 h-32 mb-2">
                                <QrCodeGenerator
                                    value={item.url}
                                    size={150}
                                    logoUrl={showLogo ? logoUrl : undefined}
                                    logoSize={18} // Logo占QR码的18%（稍小以确保扫描稳定性）
                                    level="H" // 最高纠错级别
                                />
                            </div>

                            {/* Bottom Label - Variant Info or Universal Label */}
                            <div className="w-full border-t border-gray-200 pt-3 mt-2">
                                <p className="text-sm font-bold text-gray-900 tracking-wide">
                                    {item.serialNumber}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                    Scan to Buy
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <style type="text/css" media="print">{`
                    @page { 
                        size: auto;   /* auto is the initial value */
                        margin: 0mm;  /* this affects the margin in the printer settings */
                    }
                    body {
                        background-color: white;
                    }
                    .pk-print-container {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        z-index: 9999;
                        background: white;
                    }
                    /* Hide everything else */
                    body > *:not(.pk-print-container) {
                        display: none !important;
                    }
                `}</style>
            </div>
        );
    }
);

PrintableQrTemplate.displayName = "PrintableQrTemplate";
