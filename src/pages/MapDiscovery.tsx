import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Navigation, Search, Filter, MapPin, Star } from "lucide-react";
import { useLocation } from '@/hooks/useLocation';
import { repositoryFactory } from '@/services/repositories/factory';
import { ListingMaster, ListingType } from '@/types/domain';
import { useNavigate } from 'react-router-dom';
import { useConfigStore } from '@/stores/configStore';
import { Skeleton } from '@/components/ui/skeleton';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons for different types
const getIcon = (type: ListingType) => {
    let color = '#3b82f6'; // Default blue
    if (type === 'GOODS') color = '#10b981'; // Green
    if (type === 'TASK') color = '#f59e0b'; // Orange
    if (type === 'RENTAL') color = '#8b5cf6'; // Purple

    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

const MapDiscovery = () => {
    const navigate = useNavigate();
    const { language } = useConfigStore();
    const { coords, loading: locLoading, error: locError } = useLocation();

    const [listings, setListings] = useState<ListingMaster[]>([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [activeType, setActiveType] = useState<ListingType | 'ALL'>('ALL');

    const fetchListings = useCallback(async (lat: number, lng: number, radius: number = 5000) => {
        setLoading(true);
        try {
            const repo = repositoryFactory.getListingRepository();
            const results = await repo.search({
                lat,
                lng,
                radius,
                type: activeType === 'ALL' ? undefined : activeType as ListingType
            });
            setListings(results);
        } catch (error) {
            console.error("Error fetching map listings:", error);
        } finally {
            setLoading(false);
        }
    }, [activeType]);

    const OTTAWA_CENTER: [number, number] = [45.4215, -75.6972];

    useEffect(() => {
        if (coords) {
            setMapCenter([coords.lat, coords.lng]);
            fetchListings(coords.lat, coords.lng);
        } else if (locError) {
            // Fallback to Ottawa center for pilot
            setMapCenter(OTTAWA_CENTER);
            fetchListings(OTTAWA_CENTER[0], OTTAWA_CENTER[1]);
        }
    }, [coords, locError, fetchListings]);

    const handleSearchArea = (map: L.Map) => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        const northEast = bounds.getNorthEast();
        // Calculate radius in meters (distance from center to corner)
        const radius = Math.round(center.distanceTo(northEast));
        fetchListings(center.lat, center.lng, radius);
    };

    if (locLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-muted/20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{language === 'zh' ? '正在获取您的位置...' : 'Locating you...'}</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] relative flex flex-col">
            {/* Filter Bar */}
            <div className="absolute top-4 left-0 right-0 z-[1000] px-4 flex justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-md border shadow-lg rounded-full px-2 py-1 flex gap-1 pointer-events-auto">
                    {(['ALL', 'GOODS', 'SERVICE', 'TASK', 'RENTAL'] as const).map(type => (
                        <Button
                            key={type}
                            variant={activeType === type ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-full h-8 text-xs px-3"
                            onClick={() => setActiveType(type)}
                        >
                            {type === 'ALL' ? (language === 'zh' ? '全域' : 'All') : type}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full relative">
                {mapCenter && (
                    <MapContainer
                        center={mapCenter}
                        zoom={14}
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Search in this area button */}
                        <MapController onSearchArea={handleSearchArea} />

                        {/* User Location Marker */}
                        {coords && (
                            <Marker
                                position={[coords.lat, coords.lng]}
                                icon={L.divIcon({
                                    html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
                                    className: 'user-location-icon'
                                })}
                            >
                                <Popup>
                                    <div className="text-xs font-bold">{language === 'zh' ? '您在这里' : 'You are here'}</div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Listings Markers */}
                        {listings.map(listing => (
                            <ListingMarker
                                key={listing.id}
                                listing={listing}
                                language={language}
                                navigate={navigate}
                            />
                        ))}
                    </MapContainer>
                )}

                {loading && (
                    <div className="absolute top-20 right-4 z-[1000] bg-background/80 backdrop-blur-md rounded-lg p-2 shadow-lg flex items-center gap-2 border">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs font-medium">{language === 'zh' ? '正在加载...' : 'Loading...'}</span>
                    </div>
                )}
            </div>

            {/* Nearby Listings List (Bottom Drawer Style for Mobile, Sidebar Style for Desktop) */}
            {listings.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:top-20 md:bottom-20 md:w-80 pointer-events-none">
                    <div className="bg-background/90 backdrop-blur-md border shadow-2xl rounded-3xl p-4 pointer-events-auto flex flex-col h-full max-h-[40vh] md:max-h-none overflow-hidden hover:shadow-glow transition-all duration-300">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-lg font-black tracking-tight">{language === 'zh' ? '推荐服务' : 'Recommended'}</h3>
                            <Badge className="bg-primary/10 text-primary border-none font-bold">{listings.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {listings.slice(0, 10).map(listing => (
                                <div
                                    key={listing.id}
                                    className="p-3 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group flex gap-3"
                                    onClick={() => {
                                        if (listing.location?.coordinates) {
                                            // Panning to marker is handled via state or ref ideally, 
                                            // for now we'll just navigate or use a map ref if we had it but MapContainer is already set.
                                            // The markers are already there.
                                            navigate(`/service/${listing.id}`);
                                        }
                                    }}
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                        <img src={listing.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate mb-0.5">{language === 'zh' ? listing.titleZh : listing.titleEn}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                                            <span className="text-primary">
                                                {listing.distanceMeters
                                                    ? (listing.distanceMeters > 1000
                                                        ? `${(listing.distanceMeters / 1000).toFixed(1)} km`
                                                        : `${Math.round(listing.distanceMeters)} m`)
                                                    : 'Nearby'}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <Star className="w-2 h-2 mr-0.5 fill-amber-400 text-amber-400" />
                                                {listing.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to handle map events and controllers
const MapController = ({ onSearchArea }: { onSearchArea: (map: L.Map) => void }) => {
    const map = useMap();
    const [moved, setMoved] = useState(false);

    useMapEvents({
        moveend: () => setMoved(true),
        zoomend: () => setMoved(true),
    });

    return (
        <div className="absolute bottom-10 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
            {moved && (
                <Button
                    className="rounded-full shadow-2xl pointer-events-auto bg-primary text-primary-foreground hover:scale-105 transition-transform gap-2 px-6 h-12 text-base font-bold"
                    onClick={() => {
                        onSearchArea(map);
                        setMoved(false);
                    }}
                >
                    <Search className="w-5 h-5" />
                    {document.documentElement.lang === 'zh' ? '搜索此区域' : 'Search this area'}
                </Button>
            )}
        </div>
    );
};

// Helper component for listing markers with Taobao-style popover cards
const ListingMarker = ({ listing, language, navigate }: { listing: ListingMaster, language: string, navigate: any }) => {
    const coords = listing.location?.coordinates;
    if (!coords) return null;

    return (
        <Marker
            position={[coords.lat, coords.lng]}
            icon={getIcon(listing.type)}
        >
            <Popup className="listing-popup">
                <Card className="border-0 shadow-none -m-3 overflow-hidden w-[220px]">
                    <div className="relative h-24 overflow-hidden">
                        <img
                            src={listing.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}
                            alt={listing.titleZh}
                            className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] h-5">
                            {listing.type}
                        </Badge>
                    </div>
                    <CardContent className="p-3">
                        <h4 className="font-bold text-sm line-clamp-1 mb-0.5">
                            {language === 'zh' ? listing.titleZh : listing.titleEn}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed italic">
                            {language === 'zh' ? listing.descriptionZh : listing.descriptionEn}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-amber-600">{listing.rating}</span>
                            <span>({listing.reviewCount})</span>
                            <span className="mx-1">•</span>
                            <span>{listing.location?.fullAddress?.split(',')[0] || (language === 'zh' ? '未知地址' : 'Address unknown')}</span>
                        </div>
                        <div className="text-[10px] font-black text-primary mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.distanceMeters
                                ? (listing.distanceMeters > 1000
                                    ? `${(listing.distanceMeters / 1000).toFixed(1)} km ${language === 'zh' ? '外' : 'away'}`
                                    : `${Math.round(listing.distanceMeters)} m ${language === 'zh' ? '外' : 'away'}`)
                                : (language === 'zh' ? '就在附近' : 'Nearby')}
                        </div>
                        <Button
                            className="w-full h-8 text-xs font-bold"
                            onClick={() => navigate(`/service/${listing.id}`)}
                        >
                            {language === 'zh' ? '详情 / 订购' : 'Details & Order'}
                        </Button>
                    </CardContent>
                </Card>
            </Popup>
        </Marker>
    );
};

export default MapDiscovery;
