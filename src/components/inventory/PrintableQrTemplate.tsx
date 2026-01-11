import { forwardRef } from 'react';
import { QrCodeGenerator } from './QrCodeGenerator';
import { cn } from '@/lib/utils';
import { InventoryItem, ListingMaster, ListingItem } from '@/types/domain';

export interface PrintableQrData {
    serialNumber: string;
    productName: string;
    url: string;
}

interface PrintableQrTemplateProps {
    data: PrintableQrData[];
    className?: string;
}

export const PrintableQrTemplate = forwardRef<HTMLDivElement, PrintableQrTemplateProps>(
    ({ data, className }, ref) => {
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

                            <div className="w-32 h-32 mb-2">
                                <QrCodeGenerator value={item.url} size={128} />
                            </div>

                            <p className="font-mono text-xs text-gray-600">
                                {item.serialNumber}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Scan to Buy
                            </p>
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
