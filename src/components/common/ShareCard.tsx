import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ShareCardProps {
    title: string;
    content: string;
    imageUrl?: string;
    authorName?: string;
    authorAvatar?: string;
    qrUrl: string;
    id?: string; // DOM ID for capture
}

export const ShareCard = ({ title, content, imageUrl, authorName, authorAvatar, qrUrl, id = "share-card" }: ShareCardProps) => {
    return (
        <div
            id={id}
            className="w-[375px] bg-white p-6 rounded-none shadow-xl"
            style={{ backgroundColor: '#ffffff' }}
        >
            {/* Header / Branding */}
            <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
                <div className="flex flex-col leading-none">
                    <span className="font-black text-sm tracking-tight">渥帮 JUSTWEDO</span>
                    <span className="text-[10px] text-muted-foreground font-bold tracking-widest">JWD</span>
                </div>
            </div>

            {/* Main Image */}
            <div className="w-full aspect-square bg-muted rounded-2xl overflow-hidden relative mb-4">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Post Cover"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/30">
                        <span className="text-4xl mb-2">📝</span>
                        <span className="text-sm font-medium">纯文字动态</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mb-4">
                <h2 className="text-xl font-black leading-tight text-foreground line-clamp-2 mb-2">
                    {title}
                </h2>

                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6 border border-border/50">
                        <AvatarImage src={authorAvatar} crossOrigin="anonymous" />
                        <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-muted-foreground">{authorName}</span>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap decoration-clone box-decoration-clone">
                    {content}
                </p>
            </div>

            <div className="my-4 border-t border-dashed border-gray-200" />

            {/* Footer / QR */}
            <div className="flex items-center justify-between bg-[#daf4e6] p-4 rounded-xl">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-[#0f4d30]">长按识别二维码</span>
                    <span className="text-[10px] text-[#2c7a52]">查看详情 & 参与互动</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <QRCodeSVG value={qrUrl} size={60} />
                </div>
            </div>
        </div>
    );
};
