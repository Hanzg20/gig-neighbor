import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void> | void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  enabled?: boolean;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
  enabled = true,
}: UseInfiniteScrollOptions) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      // 只在目标可见、有更多数据、未在加载中、功能启用时触发
      if (
        target.isIntersecting &&
        hasMore &&
        !isLoading &&
        !loadingRef.current &&
        enabled
      ) {
        loadingRef.current = true;
        try {
          await onLoadMore();
        } finally {
          loadingRef.current = false;
        }
      }
    },
    [hasMore, isLoading, enabled, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    const currentTarget = observerTarget.current;
    if (currentTarget && enabled) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleIntersect, threshold, enabled]);

  return { observerTarget };
};
