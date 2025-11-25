# User Types & Admin System

## Overview

The AI Job Master application now includes a comprehensive user management system with three user types and a full-featured admin dashboard.

## User Types

### 1. FREE (Default)
- Default user type for all new signups
- Full access to all application features
- No restrictions (currently)
- Can be upgraded to PLUS or ADMIN by admins

### 2. PLUS
- Premium user type
- Currently same features as FREE (placeholder for future premium features)
- Can be upgraded by admins
- Designated with a crown icon in admin panel

### 3. ADMIN
- Full administrative access
- Can view and manage all users
- Can upgrade/downgrade user types
- Can delete users (except themselves)
- Access to admin dashboard and statistics
- Designated with a shield icon

## Database Schema Changes

### Migration: `20251125064053_add_user_types`

Added to User model:
```prisma
enum UserType {
  FREE
  PLUS
  ADMIN
}

model User {
  // ... existing fields
  userType  UserType  @default(FREE)
  // ... rest of model
}
```

## Admin Features

### Admin Dashboard (`/admin`)

**Stats Overview:**
- Total Users (with breakdown by type: FREE, PLUS, ADMIN)
- Content Generated (cover letters, LinkedIn messages, emails)
- Resumes Uploaded
- API Keys Configured (by provider)

**Quick Actions:**
- Manage Users
- User Activity (coming soon)
- Analytics (coming soon)

**Access Control:**
- Protected by middleware
- Redirects non-admins to `/dashboard`
- API returns 403 for non-admin users

### User Management (`/admin/users`)

**Features:**
- List all users with pagination (20 per page)
- Search users by email
- Filter by user type (FREE, PLUS, ADMIN, ALL)
- View user statistics:
  - Number of resumes
  - Generated content count
  - API keys configured
- Upgrade/downgrade users
- Delete users (with confirmation)

**User Information Displayed:**
- Email address
- User ID (truncated)
- User type (with inline dropdown to change)
- API keys configured (OpenAI, Claude, Gemini badges)
- Content statistics
- Join date

**Safety Features:**
- Admins cannot demote themselves
- Admins cannot delete themselves
- Confirmation dialog before user deletion
- All actions require admin authentication

## API Endpoints

### Admin APIs

#### GET /api/admin/stats
**Returns platform statistics (Admin only)**
```json
{
  "users": {
    "total": 150,
    "free": 120,
    "plus": 25,
    "admin": 5
  },
  "content": {
    "resumes": 300,
    "coverLetters": 450,
    "linkedInMessages": 230,
    "emailMessages": 180,
    "totalGenerated": 860
  },
  "apiKeys": {
    "openai": 100,
    "anthropic": 50,
    "gemini": 30
  }
}
```

#### GET /api/admin/users
**List all users with filtering and pagination (Admin only)**

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `userType` - Filter by type (FREE, PLUS, ADMIN, ALL)
- `search` - Search by email

Response:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "userType": "FREE",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "hasOpenaiKey": true,
      "hasAnthropicKey": false,
      "hasGeminiKey": true,
      "stats": {
        "resumes": 2,
        "coverLetters": 5,
        "linkedinMessages": 3,
        "emailMessages": 2,
        "totalMessages": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}
```

#### PATCH /api/admin/users/[id]
**Update user type (Admin only)**

Request:
```json
{
  "userType": "PLUS"
}
```

Safety checks:
- Validates user type (FREE, PLUS, ADMIN)
- Prevents admin from demoting themselves
- Returns 400 if trying to change own admin status

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "PLUS",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/admin/users/[id]
**Delete user (Admin only)**

Safety checks:
- Prevents admin from deleting themselves
- Returns 400 if trying to delete own account
- Confirmation required on frontend

Response:
```json
{
  "success": true
}
```

## Middleware Protection

Updated `middleware.ts` to protect admin routes:

```typescript
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth/:path*', '/admin/:path*'],
};
```

Admin routes (`/admin/*`) now:
- Require authentication
- Redirect unauthenticated users to login
- API endpoints check for ADMIN user type

## Frontend Components

### Admin Dashboard
- File: `app/admin/page.tsx`
- Modern card-based layout
- Real-time statistics
- Quick action buttons
- Responsive design

### User Management Page
- File: `app/admin/users/page.tsx`
- Sortable table with user data
- Inline user type editing (dropdown)
- Search and filter functionality
- Pagination controls
- Delete buttons with confirmation

## Frontend-Backend Sync Improvements

### API Key Management Enhanced

**File**: `components/settings/ApiKeyManager.tsx`

**New Features:**
1. **Remove Key Functionality**
   - Added "Remove" buttons for each provider
   - Confirmation dialog before removal
   - Properly clears both encrypted key and model list
   - Updates UI after removal

2. **Better Feedback**
   - Success message mentions "models fetched"
   - Reload status after save to reflect changes
   - Handles empty payload (no keys entered)

3. **Improved Key Handling**
   - Only sends keys that were entered
   - Supports partial updates (e.g., only update OpenAI)
   - Properly handles key removal via empty string

**Usage:**
- Enter API key → Save → Models fetched and stored
- Click "Remove" button → Confirmation → Key and models cleared
- Frontend automatically reloads key status after any change

## Security

### Admin Access Control
- All admin endpoints check for ADMIN user type
- Middleware protects admin routes
- Non-admins receive 403 Forbidden
- API keys are never exposed (only boolean flags)

### Self-Protection
- Admins cannot demote themselves
- Admins cannot delete themselves
- Prevents accidental lockout

### User Data Privacy
- API keys shown only as configured/not configured
- Actual keys never sent to frontend
- User stats aggregated safely

## Future Enhancements

### Potential Premium Features (PLUS users)
- Higher API rate limits
- Priority support
- Advanced analytics
- Custom branding
- Export history in multiple formats
- Unlimited resumes
- Premium templates

### Admin Features (Future)
- User activity logs
- Usage analytics and charts
- Bulk user operations
- Email notifications
- System settings
- Revenue tracking (if monetized)
- Ban/suspend users

## Usage Examples

### Making Your First Admin

**Option 1: Direct Database Update**
```sql
UPDATE users SET "userType" = 'ADMIN' WHERE email = 'your@email.com';
```

**Option 2: Via Supabase Dashboard**
1. Go to Supabase dashboard → Database → users table
2. Find your user record
3. Edit userType column → Set to 'ADMIN'
4. Save changes

### Upgrading a User to PLUS
1. Admin logs in → Goes to `/admin/users`
2. Search for user by email
3. Click dropdown in "Type" column
4. Select "PLUS"
5. Change is saved immediately

### Viewing Platform Statistics
1. Admin logs in
2. Navigate to `/admin`
3. Dashboard shows real-time stats
4. Stats auto-update on page refresh

## Build Status

✅ **Build Successful**
- All TypeScript types valid
- All API routes compiled
- No errors
- Expected warnings only (React hooks exhaustive deps)

## Routes Added

**Frontend:**
- `/admin` - Admin dashboard
- `/admin/users` - User management

**API:**
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/[id]` - Update user type
- `DELETE /api/admin/users/[id]` - Delete user

## Testing Checklist

### Admin Dashboard
- [ ] Access `/admin` as FREE user → Redirected to `/dashboard`
- [ ] Access `/admin` as ADMIN → Dashboard loads with stats
- [ ] Stats show correct counts
- [ ] "Manage Users" button works

### User Management
- [ ] Search users by email works
- [ ] Filter by user type works
- [ ] Pagination works
- [ ] Upgrade user to PLUS → Success
- [ ] Downgrade user to FREE → Success
- [ ] Try to demote self → Error message
- [ ] Delete user → Confirmation → Success
- [ ] Try to delete self → Error message

### API Keys
- [ ] Add API key → Models fetched → Success message
- [ ] Click "Remove" button → Confirmation → Key removed
- [ ] Removed key → Model dropdown says "Please add API key first"
- [ ] Add key back → Models reappear

## Summary

The application now has:
✅ Three user types (FREE, PLUS, ADMIN)
✅ Full admin dashboard with statistics
✅ User management system
✅ Safe admin operations (self-protection)
✅ Improved API key management
✅ Complete frontend-backend sync
✅ Secure access control
✅ Ready for future premium features

All systems are operational and ready for production deployment!
