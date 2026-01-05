import { supabase } from '@/lib/supabase';
import { ListingMaster, ListingType } from '@/types/domain';
import { IListingRepository } from '../interfaces';

export class SupabaseListingRepository implements IListingRepository {
    private mapFromDb(row: any): ListingMaster {
        return {
            id: row.id,
            providerId: row.provider_id,
            titleZh: row.title_zh,
            titleEn: row.title_en,
            descriptionZh: row.description_zh,
            descriptionEn: row.description_en,
            images: row.images || [],
            type: row.type as ListingType,
            categoryId: row.category_id,
            nodeId: row.node_id, // New
            tags: row.tags || [],
            status: row.status as any,
            location: {
                fullAddress: row.location_address,
            },
            rating: Number(row.rating),
            reviewCount: row.review_count,
            isPromoted: row.is_promoted,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    private mapToDb(listing: Partial<ListingMaster>): any {
        const dbRow: any = {
            provider_id: listing.providerId,
            title_zh: listing.titleZh,
            title_en: listing.titleEn,
            description_zh: listing.descriptionZh,
            description_en: listing.descriptionEn,
            images: listing.images,
            type: listing.type,
            category_id: listing.categoryId,
            node_id: listing.nodeId, // New
            tags: listing.tags,
            status: listing.status,
            location_address: listing.location?.fullAddress,
            rating: listing.rating,
            review_count: listing.reviewCount,
            is_promoted: listing.isPromoted,
        };

        // Remove undefined fields
        return Object.fromEntries(Object.entries(dbRow).filter(([_, v]) => v !== undefined));
    }

    async getAll(): Promise<ListingMaster[]> {
        const { data, error } = await supabase
            .from('listing_masters')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<ListingMaster | null> {
        const { data, error } = await supabase
            .from('listing_masters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapFromDb(data);
    }

    async getByCategory(categoryId: string): Promise<ListingMaster[]> {
        const { data, error } = await supabase
            .from('listing_masters')
            .select('*')
            .eq('category_id', categoryId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async getByNode(nodeId: string): Promise<ListingMaster[]> {
        const { data, error } = await supabase
            .from('listing_masters')
            .select('*')
            .eq('node_id', nodeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async getByProvider(providerId: string): Promise<ListingMaster[]> {
        const { data, error } = await supabase
            .from('listing_masters')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async create(listing: Omit<ListingMaster, 'id' | 'createdAt' | 'updatedAt'>): Promise<ListingMaster> {
        const { data, error } = await supabase
            .from('listing_masters')
            .insert(this.mapToDb(listing))
            .select()
            .single();

        if (error) throw error;
        return this.mapFromDb(data);
    }

    async update(id: string, data: Partial<ListingMaster>): Promise<ListingMaster> {
        const { data: updatedData, error } = await supabase
            .from('listing_masters')
            .update(this.mapToDb(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapFromDb(updatedData);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('listing_masters')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
