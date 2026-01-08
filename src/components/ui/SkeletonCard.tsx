export function SkeletonCard() {
  return (
    <div className="card-warm overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="h-5 bg-muted rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardCompact() {
  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  );
}


