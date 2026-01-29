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
        <Card className={`overflow-hidden border border-border/50 group hover:border-primary/50 transition-all duration-300 rounded-2xl sm:rounded-3xl bg-card ${isFeatured ? 'ring-1 ring-primary/20 shadow-lg' : ''}`}>
            {image && (
                <div className="relative aspect-video sm:aspect-[4/3] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Featured Badge - Minimal */}
                    {isFeatured && (
                        <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-primary text-white border-none px-1.5 py-0.5 text-[10px] font-black">
                                <Award className="w-2.5 h-2.5 mr-1" />
                                Top
                            </Badge>
                        </div>
                    )}

                    {/* Category - Minimal */}
                    {categoryName && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-white/90 text-primary border-none text-[10px] font-black py-0.5">
                                {categoryName}
                            </Badge>
                        </div>
                    )}
                </div>
            )}
            <CardContent className="p-3 sm:p-5">
                <div className="mb-1">
                    <h3 className="font-extrabold text-sm sm:text-lg line-clamp-1 text-foreground">
                        {title}
                    </h3>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-3 leading-snug">
                    {content}
                </p>

                {/* Author row - Compact */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border border-primary/10">
                            <AvatarImage src={authorAvatar} alt={authorName} />
                            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-black text-foreground truncate">{authorName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${likes > 0 ? 'fill-red-500 text-red-500 border-none' : ''}`} />
                        <span className="text-[10px] sm:text-xs font-black">{likes}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
