import React, { useEffect } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { StoryCard } from '@/components/ui/StoryCard';
import { useCommunityStore } from '@/stores/communityStore';
import { Skeleton } from '@/components/ui/skeleton';

export const TodayStories: React.FC = () => {
    const { stories, fetchStories, isLoading } = useCommunityStore();

    useEffect(() => {
        fetchStories(6);
    }, [fetchStories]);

    return (
        <section className="py-12 bg-gradient-to-b from-transparent to-muted/30">
            <div className="container px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                            COMMUNITY SPIRIT
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                            Neighbor Stories
                        </h2>
                    </div>
                    <p className="text-slate-500 max-w-sm text-sm font-medium">
                        More than just transactions, we record the warmth of neighbors helping neighbors.
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                                <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : stories.length > 0 ? (
                            stories.map((story) => (
                                <CarouselItem key={story.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <StoryCard
                                            title={story.content.slice(0, 40) + (story.content.length > 40 ? '...' : '')}
                                            content={story.content}
                                            image={story.media?.[0]}
                                            authorName={story.buyerName}
                                            authorAvatar={story.buyerAvatar}
                                            likes={story.reactions?.length || 0}
                                            isFeatured={true}
                                            categoryName="Neighborly Support"
                                        />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <div className="w-full text-center py-10 text-muted-foreground">
                                No stories shared yet. Be the first to share your neighborly experience!
                            </div>
                        )}
                    </CarouselContent>
                    {stories.length > 3 && (
                        <div className="hidden md:block">
                            <CarouselPrevious className="-left-12 hover:bg-white hover:text-primary border-slate-200 shadow-sm" />
                            <CarouselNext className="-right-12 hover:bg-white hover:text-primary border-slate-200 shadow-sm" />
                        </div>
                    )}
                </Carousel>
            </div>
        </section>
    );
};

