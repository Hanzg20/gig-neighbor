import { useState, useEffect, useCallback } from 'react';
import { BeanTransaction } from '@/types/domain';
import { repositoryFactory } from '@/services/repositories/factory';
import { useAuthStore } from '@/stores/authStore';

export const useTransactions = () => {
    const { currentUser, refreshBalance } = useAuthStore();
    const [transactions, setTransactions] = useState<BeanTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!currentUser) return;

        setIsLoading(true);
        setError(null);

        try {
            const beanRepo = repositoryFactory.getBeanRepository();
            const data = await beanRepo.getTransactions(currentUser.id);
            setTransactions(data);

            // Also refresh balance to ensure sync
            await refreshBalance();
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, refreshBalance]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        isLoading,
        error,
        refresh: fetchTransactions
    };
};
