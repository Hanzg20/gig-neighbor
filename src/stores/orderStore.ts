import { create } from 'zustand';
import { Order } from '@/types/orders';
import { repositoryFactory } from '@/services/repositories/factory';

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    setOrders: (orders: Order[]) => void;
    loadUserOrders: (userId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: any, metadata?: any) => Promise<void>;
    updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
    createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order | null>;
    subscribeToOrders: (userId: string) => void;
    unsubscribeFromOrders: () => void;
    unsubscribe: (() => void) | null;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,
    unsubscribe: null,
    setOrders: (orders) => set({ orders }),

    subscribeToOrders: (userId: string) => {
        const { unsubscribe } = get() as any;
        if (unsubscribe) unsubscribe();

        const repo = repositoryFactory.getOrderRepository();
        const newUnsubscribe = repo.subscribeToUserOrders(userId, (updatedOrder) => {
            set((state) => {
                const existing = state.orders.find(o => o.id === updatedOrder.id);
                if (existing) {
                    // Update existing
                    return {
                        orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                    };
                } else {
                    // Add new order at the top
                    return {
                        orders: [updatedOrder, ...state.orders]
                    };
                }
            });
        });

        set({ unsubscribe: newUnsubscribe });
    },

    unsubscribeFromOrders: () => {
        const { unsubscribe } = get() as any;
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    updateOrderStatus: async (orderId, status, metadata) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getOrderRepository();
            // @ts-ignore - The interface in repo might need update but we know it exists now
            const updatedOrder = await repo.update(orderId, { status, metadata });
            set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? updatedOrder : o),
                isLoading: false
            }));
        } catch (error: any) {
            console.error('Failed to update order status:', error);
            set({ error: error.message, isLoading: false });
        }
    },
    updateOrder: async (orderId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getOrderRepository();
            const updatedOrder = await repo.update(orderId, updates);
            set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? updatedOrder : o),
                isLoading: false
            }));
        } catch (error: any) {
            console.error('Failed to update order:', error);
            set({ error: error.message, isLoading: false });
        }
    },
    loadUserOrders: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getOrderRepository();

            // Fetch both as buyer and as provider
            const [buyerOrders, providerOrders] = await Promise.all([
                repo.getByUser(userId),
                repo.getByProvider(userId)
            ]);

            // Merge and deduplicate (though IDs should be unique across both queries unless self-dealing)
            const allOrders = [...buyerOrders];
            providerOrders.forEach(pOrder => {
                if (!allOrders.some(o => o.id === pOrder.id)) {
                    allOrders.push(pOrder);
                }
            });

            // Sort by createdAt desc
            allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            set({ orders: allOrders, isLoading: false });
        } catch (error: any) {
            console.error('Failed to load user orders:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getOrderRepository();
            const newOrder = await repo.create(orderData);
            set(state => ({
                orders: [newOrder, ...state.orders],
                isLoading: false
            }));
            return newOrder;
        } catch (error: any) {
            console.error('Failed to create order:', error);
            set({ error: error.message, isLoading: false });
            return null;
        }
    }
}));
