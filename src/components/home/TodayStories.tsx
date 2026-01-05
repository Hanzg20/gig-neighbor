import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { StoryCard } from '@/components/ui/StoryCard';

const MOCK_STORIES = [
    {
        id: 's1',
        title: 'Lees 190 Snow Hero: Mr. Li',
        content: "This morning the snow was ankle-deep. Mr. Li took his own snow blower and cleared the path for the entire floor's neighbors. That's the community warmth we love.",
        image: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&h=600&fit=crop',
        authorName: 'Kevin W.',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
        categoryName: 'Neighborly Support',
        likes: 42,
        locationTag: '@Lees Ave',
        isFeatured: true
    },
    {
        id: 's2',
        title: 'Kanata Lawn Party',
        content: 'Last weekend we did a group buy for lawn mowing. We all sat on the grass, drank coffee, and chatted. It felt like the old-school neighborly life.',
        image: 'https://images.unsplash.com/photo-1558905619-1725cf26489c?w=800&h=600&fit=crop',
        authorName: 'Sarah',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        categoryName: 'Outdoor Living',
        likes: 28,
        locationTag: '@Kanata Lakes',
        isFeatured: false
    },
    {
        id: 's3',
        title: 'Unforgettable Tool Sharing',
        content: 'Needed a drill to mount some shelves. Posted a request and 10 minutes later Mr. Liu from across the hall brought his over.',
        image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&h=600&fit=crop',
        authorName: 'Min Z.',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
        categoryName: 'Tool Rental',
        likes: 56,
        locationTag: '@Lees Ave',
        isFeatured: false
    }
];

export const TodayStories: React.FC = () => {
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
                        {MOCK_STORIES.map((story) => (
                            <CarouselItem key={story.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <StoryCard {...story} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-12 hover:bg-white hover:text-primary border-slate-200 shadow-sm" />
                        <CarouselNext className="-right-12 hover:bg-white hover:text-primary border-slate-200 shadow-sm" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

