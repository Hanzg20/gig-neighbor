import { supabase } from '@/lib/supabase';
import { ProviderProfile, ProviderIdentity } from '@/types/domain';
import { IProviderRepository } from '../interfaces';

export class SupabaseProviderRepository implements IProviderRepository {
    private mapFromView(row: any): ProviderProfile {
        return {
            id: row.id,
            userId: row.user_id,
            businessNameZh: row.business_name_zh,
            businessNameEn: row.business_name_en,
            descriptionZh: row.description_zh,
            descriptionEn: row.description_en,
            avatar: row.user_avatar, // From View
            identity: row.identity as ProviderIdentity,
            isVerified: row.is_verified,
            verificationLevel: row.verification_level || 1,
            badges: row.badges || [],
            stats: {
                totalOrders: row.stats?.total_orders || 0,
                averageRating: row.stats?.average_rating || 0,
                totalIncome: row.stats?.total_income || 0,
                reviewCount: row.stats?.review_count || 0,
            },
            location: row.location_address ? {
                lat: 0, // View simplified
                lng: 0,
                address: row.location_address,
                radiusKm: row.service_radius_km || 5,
            } : { lat: 0, lng: 0, address: '', radiusKm: 5 },
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            credentials: row.credentials_json ? row.credentials_json.map((c: any) => ({
                id: c.id,
                type: c.type,
                licenseNumber: c.license_number,
                jurisdiction: c.jurisdiction,
                status: c.status,
                verifiedAt: c.verified_at
            })) : undefined
        };
    }

    // mapToDb remains same for Writes (Writes still go to Table, Reads go to View)
    private mapToDb(profile: Partial<ProviderProfile>): any {
        return {
            user_id: profile.userId,
            business_name_zh: profile.businessNameZh,
            business_name_en: profile.businessNameEn,
            description_zh: profile.descriptionZh,
            description_en: profile.descriptionEn,
            identity: profile.identity,
            is_verified: profile.isVerified,
            badges: profile.badges,
            stats: profile.stats ? {
                total_orders: profile.stats.totalOrders,
                average_rating: profile.stats.averageRating,
                total_income: profile.stats.totalIncome
            } : undefined,
            location_address: profile.location?.address,
            service_radius_km: profile.location?.radiusKm
        };
    }

    async getById(id: string): Promise<ProviderProfile | null> {
        const { data, error } = await supabase
            .from('view_provider_details')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapFromView(data);
    }

    async getAll(): Promise<ProviderProfile[]> {
        const { data, error } = await supabase
            .from('view_provider_details')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromView);
    }

    async create(profile: Omit<ProviderProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderProfile> {
        // Writes still go to TABLE
        const { data, error } = await supabase
            .from('provider_profiles')
            .insert(this.mapToDb(profile))
            .select()
            .single();

        if (error) throw error;
        // Re-fetch from view to return complete object? Or just return basic map
        // For simplicity and performance, we'll map what we have, but avatar might be missing
        // Better: return this.getById(data.id) to ensure consistency, but expensive.
        // Let's stick to basic map for now or fetch view.
        return this.getById(data.id) as Promise<ProviderProfile>;
    }

    async update(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
        const { error } = await supabase
            .from('provider_profiles')
            .update(this.mapToDb(data))
            .eq('id', id);

        if (error) throw error;
        return (await this.getById(id))!;
    }
}
