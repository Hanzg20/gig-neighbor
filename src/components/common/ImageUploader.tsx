import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
    bucketName: string;
    onUpload: (urls: string[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
    maxFiles?: number;
    existingImages?: string[];
    folderPath?: string;
}

const ImageUploader = ({
    bucketName,
    onUpload,
    onUploadingChange,
    maxFiles = 3,
    existingImages = [],
    folderPath = 'uploads'
}: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState<string[]>(existingImages);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (previews.length + files.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        setUploading(true);
        onUploadingChange?.(true);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                if (file.size > 2 * 1024 * 1024) {
                    toast.error(`${file.name} is too large. Max size is 2MB.`);
                    continue;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const filePath = `${folderPath}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast.error(`Failed to upload ${file.name}`);
                    continue;
                }

                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                if (publicUrlData) {
                    newUrls.push(publicUrlData.publicUrl);
                }
            }

            const updatedPreviews = [...previews, ...newUrls];
            setPreviews(updatedPreviews);
            onUpload(updatedPreviews);
            toast.success('Images uploaded successfully!');
        } catch (error) {
            console.error('Upload process error:', error);
            toast.error('An unexpected error occurred during upload.');
        } finally {
            setUploading(false);
            onUploadingChange?.(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
        onUpload(updatedPreviews);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {previews.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/30 shadow-sm animate-in zoom-in-95 duration-200">
                        <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors scale-0 group-hover:scale-100 duration-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {previews.length < maxFiles && (
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group
                            ${uploading
                                ? 'bg-muted/50 border-muted cursor-wait'
                                : 'bg-primary/5 border-primary/20 hover:border-primary hover:bg-primary/10 hover:shadow-warm'
                            }`}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Upload</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                Supported: JPG, PNG • Max 2MB • Up to {maxFiles} images
            </p>
        </div>
    );
};

export default ImageUploader;
