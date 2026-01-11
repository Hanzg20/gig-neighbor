import { supabase } from '@/lib/supabase';
import { IInventoryRepository } from '../interfaces';
import { InventoryItem, InventoryUsageLog } from '@/types/domain';

export class SupabaseInventoryRepository implements IInventoryRepository {
    async getByListingItem(listingItemId: string): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('listing_inventory')
            .select('*')
            .eq('listing_item_id', listingItemId);

        if (error) throw error;
        return data.map(this.mapToDomain);
    }

    async getByOrder(orderId: string): Promise<InventoryItem | null> {
        const { data, error } = await supabase
            .from('listing_inventory')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle();

        if (error) throw error;
        return data ? this.mapToDomain(data) : null;
    }

    async getByProvider(providerId: string): Promise<InventoryItem[]> {
        console.log('[🗄️ InventoryRepository] Fetching inventory for provider:', providerId);
        const { data, error } = await supabase
            .from('listing_inventory')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[❌ InventoryRepository] Error fetching inventory:', error);
            throw error;
        }

        console.log('[🗄️ InventoryRepository] Raw data received:', data?.length || 0, 'items');
        console.log('[🗄️ InventoryRepository] First raw item:', data?.[0]);

        const mapped = data ? data.map(this.mapToDomain) : [];
        console.log('[🗄️ InventoryRepository] Mapped to domain:', mapped.length, 'items');
        return mapped;
    }

    async allocateSerialNumber(listingItemId: string, orderId: string, buyerId: string): Promise<InventoryItem> {
        const { data, error } = await supabase.rpc('allocate_inventory_item', {
            p_listing_item_id: listingItemId,
            p_order_id: orderId,
            p_buyer_id: buyerId
        });

        if (error) {
            console.error('Error allocating inventory item:', error);
            if (error.code === 'P0002' || error.message?.includes('NO_AVAILABLE_INVENTORY')) {
                throw new Error('NO_AVAILABLE_INVENTORY');
            }
            throw error;
        }

        return this.mapToDomain(data);
    }

    async addUsageLog(log: Omit<InventoryUsageLog, 'id' | 'createdAt'>): Promise<InventoryUsageLog> {
        const { data, error } = await supabase
            .from('inventory_usage_logs')
            .insert({
                inventory_id: log.inventoryId,
                action_type: log.actionType,
                amount: log.amount,
                location_id: log.locationId,
                metadata: log.metadata
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapUsageLogToDomain(data);
    }

    async getUsageLogs(inventoryId: string): Promise<InventoryUsageLog[]> {
        const { data, error } = await supabase
            .from('inventory_usage_logs')
            .select('*')
            .eq('inventory_id', inventoryId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(this.mapUsageLogToDomain);
    }

    async importInventory(items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderId' | 'buyerId'>[]): Promise<void> {
        const insertData = items.map(item => ({
            listing_item_id: item.listingItemId,
            provider_id: item.providerId,
            serial_number: item.serialNumber,
            secret_code: item.secretCode,
            valid_from: item.validFrom,
            valid_until: item.validUntil,
            metadata: item.metadata,
            status: 'available'
        }));

        const { error } = await supabase
            .from('listing_inventory')
            .insert(insertData);

        if (error) throw error;
    }

    private mapToDomain(data: any): InventoryItem {
        return {
            id: data.id,
            listingItemId: data.listing_item_id,
            providerId: data.provider_id,
            serialNumber: data.serial_number,
            secretCode: data.secret_code,
            status: data.status,
            validFrom: data.valid_from,
            validUntil: data.valid_until,
            metadata: data.metadata,
            orderId: data.order_id,
            buyerId: data.buyer_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }

    private mapUsageLogToDomain(data: any): InventoryUsageLog {
        return {
            id: data.id,
            inventoryId: data.inventory_id,
            actionType: data.action_type,
            amount: data.amount,
            locationId: data.location_id,
            metadata: data.metadata,
            createdAt: data.created_at
        };
    }
}
