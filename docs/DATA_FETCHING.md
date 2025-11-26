# Data Fetching Strategy

## Overview

The dashboard uses **React Query (TanStack Query)** for efficient data fetching and caching, significantly reducing API calls and improving user experience.

## Why React Query?

### Previous Approach (Basic useEffect)
```typescript
// ❌ Old approach - fetches on every mount
useEffect(() => {
  fetch('/api/dashboard/stats').then(...)
}, []);
```

**Problems:**
- Fetches data on every component mount
- No caching between navigations
- Increased server load
- Slower user experience

### Current Approach (React Query)
```typescript
// ✅ New approach - intelligent caching
const { data, isLoading } = useDashboardStats();
```

**Benefits:**
- **Automatic Caching**: Data is cached for 60 seconds
- **Stale-While-Revalidate**: Shows cached data instantly while fetching fresh data in background
- **Reduced API Calls**: Only refetches when cache is stale
- **Better Performance**: Instant page transitions with cached data
- **Manual Refresh**: Can manually invalidate cache when needed

## Configuration

### Cache Settings
Located in `components/providers/QueryProvider.tsx`:

```typescript
staleTime: 60 * 1000      // Data is fresh for 60 seconds
gcTime: 5 * 60 * 1000     // Cache persists for 5 minutes
refetchOnWindowFocus: false // Don't refetch on window focus
```

### Custom Hook
Located in `hooks/useDashboardStats.ts`:

```typescript
export function useDashboardStats() {
  const query = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    // ... config
  });

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
  };

  return { ...query, refreshStats };
}
```

## Usage Examples

### Basic Usage
```typescript
function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <LoadingSpinner />;

  return <div>{stats.totalCoverLetters}</div>;
}
```

### Manual Refresh
Use `refreshStats()` when you know the data has changed (e.g., after creating new content):

```typescript
function CoverLetterPage() {
  const { refreshStats } = useDashboardStats();

  const handleCreate = async () => {
    await createCoverLetter();
    refreshStats(); // Refresh dashboard stats
  };
}
```

### Optimistic Updates
For even better UX, you can update the cache optimistically:

```typescript
const queryClient = useQueryClient();

const handleCreate = async () => {
  // Optimistically update cache
  queryClient.setQueryData(['dashboardStats'], (old) => ({
    ...old,
    totalCoverLetters: old.totalCoverLetters + 1
  }));

  await createCoverLetter();

  // Refresh to sync with server
  refreshStats();
};
```

## Performance Impact

### Before React Query
- **Page load**: ~500ms (fresh fetch every time)
- **Navigation back to dashboard**: ~500ms (fresh fetch)
- **API calls per session**: 5-10+

### After React Query
- **Initial load**: ~500ms (first fetch)
- **Cached load**: <50ms (instant from cache)
- **Background refresh**: transparent to user
- **API calls per session**: 1-3 (depending on cache duration)

## Best Practices

1. **Don't over-invalidate**: Only call `refreshStats()` when data actually changes
2. **Adjust cache duration**: If data changes frequently, reduce `staleTime`
3. **Use query keys wisely**: Different data should have different query keys
4. **Monitor usage**: Check Network tab to verify reduced API calls

## Future Enhancements

Potential improvements:
- Add mutation hooks for create/update operations
- Implement optimistic updates across all data mutations
- Add infinite query for paginated history
- Add prefetching for faster navigation
