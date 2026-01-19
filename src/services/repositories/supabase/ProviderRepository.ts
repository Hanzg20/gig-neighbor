import { supabase } from '@/lib/supabase';
import { ProviderProfile, ProviderIdentity } from '@/types/domain';
import { IProviderRepository } from '../interfaces';

export class SupabaseProviderRepository implements IProviderRepository {
    private mapFromDb(row: any): ProviderProfile {
        return {
            id: row.id,
            userId: row.user_id,
            businessNameZh: row.business_name_zh,
            businessNameEn: row.business_name_en,
            descriptionZh: row.description_zh,
            descriptionEn: row.description_en,
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
                lat: row.location_lat || 0,
                lng: row.location_lng || 0,
                address: row.location_address,
                radiusKm: row.service_radius_km || 5,
            } : { lat: 0, lng: 0, address: '', radiusKm: 5 },
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            credentials: row.professional_credentials ? row.professional_credentials.map((c: any) => ({
                id: c.id,
                providerId: c.provider_id,
                type: c.type,
                licenseNumber: c.license_number,
                jurisdiction: c.jurisdiction,
                status: c.status,
                verifiedAt: c.verified_at,
                extraData: c.extra_data,
                createdAt: c.created_at,
                updatedAt: c.updated_at
            })) : undefined
        };
    }

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
            .from('provider_profiles')
            .select('*, professional_credentials(*)')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapFromDb(data);
    }

    async getAll(): Promise<ProviderProfile[]> {
        const { data, error } = await supabase
            .from('provider_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapFromDb);
    }

    async create(profile: Omit<ProviderProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderProfile> {
        const { data, error } = await supabase
            .from('provider_profiles')
            .insert(this.mapToDb(profile))
            .select()
            .single();

        if (error) throw error;
        return this.mapFromDb(data);
    }

    async update(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
        const { data: updatedData, error } = await supabase
            .from('provider_profiles')
            .update(this.mapToDb(data))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapFromDb(updatedData);
    }
}
