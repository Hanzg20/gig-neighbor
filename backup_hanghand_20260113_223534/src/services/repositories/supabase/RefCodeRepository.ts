import { supabase } from '@/lib/supabase';
import { IRefCodeRepository } from '../interfaces';
import { RefCode } from '@/types/domain';

export class SupabaseRefCodeRepository implements IRefCodeRepository {
    async getAll(): Promise<RefCode[]> {
        const { data, error } = await supabase
            .from('ref_codes')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        return (data || []).map(this.mapFromDb);
    }

    async getById(codeId: string): Promise<RefCode | null> {
        const { data, error } = await supabase
            .from('ref_codes')
            .select('*')
            .eq('code_id', codeId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data ? this.mapFromDb(data) : null;
    }

    async getByType(type: string): Promise<RefCode[]> {
        const { data, error } = await supabase
            .from('ref_codes')
            .select('*')
            .eq('type', type)
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        return (data || []).map(this.mapFromDb);
    }

    async getByParent(parentId: string): Promise<RefCode[]> {
        const { data, error } = await supabase
            .from('ref_codes')
            .select('*')
            .eq('parent_id', parentId)
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;

        return (data || []).map(this.mapFromDb);
    }

    private mapFromDb(row: any): RefCode {
        return {
            codeId: row.code_id,
            parentId: row.parent_id,
            type: row.type,
            zhName: row.zh_name,
            enName: row.en_name,
            extraData: row.extra_data || {},
            sortOrder: row.sort_order,
        };
    }
}
