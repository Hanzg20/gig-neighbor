import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/orders';

interface CartState {
    items: CartItem[];
    addItem: (item: Partial<CartItem> & { itemId: string; masterId: string; userId: string }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const existingItem = get().items.find(i =>
                    i.itemId === item.itemId &&
                    i.rentalStart === item.rentalStart &&
                    i.rentalEnd === item.rentalEnd &&
                    i.consultHours === item.consultHours
                );
                if (existingItem) {
                    get().updateQuantity(existingItem.id, existingItem.quantity + (item.quantity || 1));
                } else {
                    set((state) => ({
                        items: [
                            ...state.items,
                            {
                                quantity: 1,
                                ...item,
                                id: Math.random().toString(36).substring(7),
                                addedAt: new Date().toISOString()
                            } as CartItem
                        ]
                    }));
                }
            },
            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
            })),
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        {
            name: 'hanghand-cart-storage',
        }
    )
);
