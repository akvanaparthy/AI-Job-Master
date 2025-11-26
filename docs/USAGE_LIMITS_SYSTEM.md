# Usage Limits System

## Overview

The usage limits system allows admins to configure how many activities (cover letters, emails, LinkedIn messages) each user type can create. Follow-ups can optionally be excluded from the count.

## Features

✅ **Per-Role Limits**: Different limits for FREE, PLUS, and ADMIN users
✅ **Configurable by Admins**: Admins can change limits without code changes
✅ **Follow-up Exclusion**: Follow-up emails/messages don't count by default
✅ **Dynamic Dashboard**: Usage percentage updates based on user's limit
✅ **Flexible System**: Easy to add new user types or change rules

## Database Schema

### User Model
```prisma
model User {
  // ... existing fields
  userType  UserType @default(FREE)
  isAdmin   Boolean  @default(false)
}
```

### Usage Limit Settings
```prisma
model UsageLimitSettings {
  id               String   @id @default(uuid())
  userType         UserType @unique
  maxActivities    Int      @default(100)
  includeFollowups Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## Default Limits

| User Type | Max Activities | Include Followups |
|-----------|---------------|-------------------|
| FREE      | 100          | ❌ No            |
| PLUS      | 500          | ❌ No            |
| ADMIN     | 999,999      | ❌ No            |

## How It Works

### 1. User Creates Content
When a user creates a cover letter, email, or LinkedIn message:
- System checks their `userType`
- Looks up the corresponding `UsageLimitSettings`
- Counts their existing activities (excluding followups if configured)
- Calculates usage percentage

### 2. Dashboard Display
The dashboard shows:
- **Total activities used** (e.g., "45 items used of 100")
- **Usage percentage** (e.g., 45% gauge)
- **Current plan** (Free, Plus, or Admin)

### 3. Usage Calculation

```typescript
// Exclude follow-ups if configured
const emailCount = await prisma.emailMessage.count({
  where: {
    userId: user.id,
    ...(includeFollowups ? {} : { messageType: 'NEW' })
  }
});

// Calculate percentage
const usagePercentage = Math.min(
  Math.round((totalActivities / maxActivities) * 100),
  100
);
```

## Admin Management

### Viewing Current Limits
```bash
GET /api/admin/usage-limits

Response:
{
  "limits": [
    {
      "userType": "FREE",
      "maxActivities": 100,
      "includeFollowups": false
    },
    // ...
  ]
}
```

### Updating Limits
```bash
PUT /api/admin/usage-limits

Body:
{
  "userType": "FREE",
  "maxActivities": 150,
  "includeFollowups": false
}

Response:
{
  "limit": {
    "id": "...",
    "userType": "FREE",
    "maxActivities": 150,
    "includeFollowups": false
  }
}
```

### Managing Users
```bash
PUT /api/admin/users

Body:
{
  "userId": "user-uuid",
  "userType": "PLUS",  // Upgrade user
  "isAdmin": false      // Optional
}
```

## Usage in Code

### Dashboard Stats API
```typescript
// Get user's limit
const usageLimitSettings = await prisma.usageLimitSettings.findUnique({
  where: { userType: dbUser.userType },
});

const maxActivities = usageLimitSettings?.maxActivities || 100;
const includeFollowups = usageLimitSettings?.includeFollowups || false;
```

### React Hook
```typescript
const { data: stats } = useDashboardStats();

console.log(stats.maxActivities);  // 100, 500, or 999999
console.log(stats.userType);       // 'FREE', 'PLUS', or 'ADMIN'
console.log(stats.usagePercentage); // 45
```

### Dashboard UI
```tsx
<p>
  {stats.totalGenerated} items used of {stats.maxActivities}
</p>

<p>
  Current plan: {stats.userType === 'FREE' ? 'Free' : stats.userType}
</p>
```

## Setting Up Limits

### Initial Seed
Run once to create default limits:
```bash
npx tsx prisma/seed-usage-limits.ts
```

This creates the three default limits (FREE: 100, PLUS: 500, ADMIN: 999999).

### Modifying Limits
After initial setup, use the admin API or Prisma Studio to modify limits.

## User Type vs Admin Status

**Important distinction:**

- `userType`: Determines usage limits (FREE, PLUS, ADMIN)
- `isAdmin`: Grants administrative privileges

A user can be:
- ✅ `userType: FREE, isAdmin: true` - Admin with free limits
- ✅ `userType: ADMIN, isAdmin: true` - Admin with unlimited limits (recommended)
- ✅ `userType: PLUS, isAdmin: false` - Regular user with plus limits

## Future Enhancements

Potential additions:
- [ ] Time-based limits (per month/year)
- [ ] Soft limits with warnings
- [ ] Usage analytics dashboard
- [ ] Custom limits per user (override role limits)
- [ ] Automatic limit resets
- [ ] Usage notifications

## Migration Guide

If upgrading from hardcoded limits:

1. **Run schema changes**:
   ```bash
   npx prisma db push
   ```

2. **Seed default limits**:
   ```bash
   npx tsx prisma/seed-usage-limits.ts
   ```

3. **Set first admin** (see `ADMIN_SETUP.md`)

4. **Update frontend** to use dynamic values (already done)

5. **Test usage calculations** work correctly

## Troubleshooting

### Usage shows 0/0
- Check that usage limits are seeded in database
- Verify user has a `userType` set
- Check API logs for errors

### Limits not updating
- Verify admin privileges (`isAdmin = true`)
- Check API endpoint returns success
- Clear React Query cache: `refreshStats()`

### Followups counting incorrectly
- Verify `includeFollowups` setting in database
- Check that messages have correct `messageType`
- Review count query logic

## Related Documentation

- [Admin Setup Guide](./ADMIN_SETUP.md) - How to set up admin users
- [Data Fetching](./DATA_FETCHING.md) - React Query implementation
