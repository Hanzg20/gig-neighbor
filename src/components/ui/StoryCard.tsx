import React from 'react';
import { Card, CardContent } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Heart, MapPin, Award } from 'lucide-react';

interface StoryCardProps {
    title: string;
    content: string;
    image?: string;
    authorName: string;
    authorAvatar?: string;
    categoryName?: string;
    likes?: number;
    locationTag?: string;
    isFeatured?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
    title,
    content,
    image,
    authorName,
    authorAvatar,
    categoryName,
    likes = 0,
    locationTag,
    isFeatured = false
}) => {
    return (
        <Card className={`overflow-hidden border border-border/50 group hover:border-primary/50 transition-all duration-300 rounded-3xl bg-card animate-lift ${isFeatured ? 'ring-2 ring-primary/20' : ''}`}>
            {image && (
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* 温暖徽章 */}
                    {isFeatured && (
                        <div className="absolute top-4 right-4 z-10">
                            <Badge className="bg-orange-100 text-orange-600 border-none px-2 py-1 text-xs font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Featured Story
                            </Badge>
                        </div>
                    )}

                    {/* 位置标签 */}
                    {locationTag && (
                        <div className="absolute bottom-4 left-4">
                            <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-none px-2 py-1 text-xs font-medium">
                                <MapPin className="w-3 h-3 mr-1" />
                                {locationTag}
                            </Badge>
                        </div>
                    )}

                    {categoryName && (
                        <Badge className="absolute top-4 left-4 bg-white/90 text-primary-foreground hover:bg-white backdrop-blur-sm border-none font-medium">
                            {categoryName}
                        </Badge>
                    )}
                </div>
            )}
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {content}
                </p>

                {/* 作者和互动 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                            <AvatarImage src={authorAvatar} alt={authorName} />
                            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs font-semibold text-foreground">{authorName}</p>
                            {categoryName && (
                                <p className="text-[10px] text-muted-foreground">{categoryName}</p>
                            )}
                        </div>
                    </div>

                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group/like">
                        <Heart className={`w-4 h-4 ${likes > 0 ? 'fill-red-500 text-red-500' : ''} group-hover/like:scale-110 transition-transform`} />
                        <span className="text-xs font-semibold">{likes}</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};
