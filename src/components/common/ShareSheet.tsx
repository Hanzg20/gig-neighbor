import { useRef, useState } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Link2, Download, Share2, Check, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { ShareCard } from "./ShareCard";

interface ShareSheetProps {
    title: string;
    content: string;
    url?: string;
    imageUrl?: string;
    authorName?: string;
    authorAvatar?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    brandingTitle?: string;
    brandingSubtitle?: string;
}

export function ShareSheet({
    title,
    content,
    url = window.location.href,
    imageUrl,
    authorName,
    authorAvatar,
    trigger,
    open,
    onOpenChange,
    brandingTitle,
    brandingSubtitle
}: ShareSheetProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isOpen, setIsOpen] = useState(false);
    const hasControlledOpen = open !== undefined;
    const show = hasControlledOpen ? open : isOpen;
    const setShow = hasControlledOpen ? onOpenChange! : setIsOpen;

    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedText, setCopiedText] = useState(false);

    // Poster State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Combine text for "Copy Text" feature (Xiaohongshu style)
    const combinedText = `【${title}】\n${content}\n----------------\n链接：${url}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            toast.success("链接已复制");
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            toast.error("复制失败");
        }
    };

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(combinedText);
            setCopiedText(true);
            toast.success("口令文本已复制");
            setTimeout(() => setCopiedText(false), 2000);
        } catch (err) {
            toast.error("复制失败");
        }
    };

    const handleGeneratePoster = async () => {
        setIsGenerating(true);
        try {
            const element = cardRef.current;
            if (!element) throw new Error("Card element not found");

            // Wait for images and layout
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false, // Turn off for production
                width: 375,
                height: element.offsetHeight,
                windowWidth: 375, // Lock window width for consistent layout calculation
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.querySelector('[data-share-card]');
                    if (clonedElement instanceof HTMLElement) {
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.position = 'static';
                    }
                }
            });

            const dataUrl = canvas.toDataURL('image/png');
            setGeneratedImage(dataUrl);
            toast.success("海报生成成功");
        } catch (error) {
            console.error("Poster generation failed:", error);
            toast.error("海报生成失败，请重试");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        const safeTitle = title.slice(0, 10).replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_'); // sanitize
        link.href = generatedImage;
        link.download = `GigNeighbor_${safeTitle}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ShareContent = () => (
        <div className="p-4 space-y-6">
            {/* Hidden Source Card - Visibility hidden avoids layout issues while allowing cloning */}
            <div className="absolute opacity-0 pointer-events-none -z-50 overflow-hidden h-0 overflow-y-visible">
                <div ref={cardRef} data-share-card>
                    <ShareCard
                        title={title}
                        content={content}
                        imageUrl={imageUrl}
                        authorName={authorName || 'Gig Neighbor'}
                        authorAvatar={authorAvatar}
                        qrUrl={url}
                        brandingTitle={brandingTitle}
                        brandingSubtitle={brandingSubtitle}
                    />
                </div>
            </div>

            {generatedImage ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative rounded-xl overflow-hidden shadow-lg border">
                        <img src={generatedImage} alt="Share Poster" className="w-full h-auto" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setGeneratedImage(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回选项
                        </Button>
                        <Button onClick={handleDownloadImage} className="font-bold">
                            <Download className="w-4 h-4 mr-2" />
                            保存图片
                        </Button>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">长按图片也可直接保存发送给朋友</p>
                </div>
            ) : (
                <>
                    {/* Preview Card */}
                    <div className="bg-muted/30 rounded-xl p-4 flex gap-4 items-start">
                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {imageUrl ? (
                                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold line-clamp-1">{title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{content}</p>
                            <p className="text-[10px] text-muted-foreground/60 break-all">{url}</p>
                        </div>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4 gap-2 border-2 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                            onClick={handleCopyLink}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${copiedLink ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                                {copiedLink ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-xs md:text-sm">复制链接</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4 gap-2 border-2 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                            onClick={handleCopyText}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${copiedText ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                                {copiedText ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-xs md:text-sm">复制口令</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto flex-col py-4 gap-2 border-2 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all"
                            onClick={handleGeneratePoster}
                            disabled={isGenerating}
                        >
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-xs md:text-sm">生成海报</span>
                        </Button>
                    </div>

                    {/* QR Code (Optional decoration) */}
                    <div className="flex justify-center pt-2 opacity-50 pointer-events-none">
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-white p-2 rounded-lg">
                                <QRCodeSVG value={url} size={60} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">扫码查看</span>
                        </div>
                    </div>
                </>
            )}

            <div className="text-center">
                <Button variant="ghost" className="w-full rounded-full" onClick={() => setShow(false)}>关闭</Button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={show} onOpenChange={setShow}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="ghost" size="icon">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black text-xl">
                            {generatedImage ? '保存海报' : '分享给邻居'}
                        </DialogTitle>
                    </DialogHeader>
                    <ShareContent />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={show} onOpenChange={setShow}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Share2 className="w-5 h-5" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="rounded-t-3xl max-h-[90vh]">
                <DrawerHeader className="text-center pb-2">
                    <DrawerTitle className="font-black text-xl">
                        {generatedImage ? '保存海报' : '分享给邻居'}
                    </DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto">
                    <ShareContent />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
