# Admin Setup Guide

## Setting Up the First Admin User

Since admin users can only be created by other admins, you need to manually set the first admin user directly in the database.

### Method 1: Using Prisma Studio (Recommended for Development)

1. **Open Prisma Studio**:
   ```bash
   npx prisma studio
   ```

2. **Navigate to the `User` model** in the left sidebar

3. **Find your user** by email address

4. **Click on your user row** to edit

5. **Set the `isAdmin` field to `true`** (check the checkbox)

6. **Save the changes**

7. **Refresh your browser** - you now have admin access!

### Method 2: Using SQL (Production/Supabase)

1. **Get your user ID** from Supabase Auth dashboard or by checking your auth token

2. **Run this SQL query** in Supabase SQL Editor:
   ```sql
   UPDATE users
   SET "isAdmin" = true
   WHERE email = 'your-email@example.com';
   ```

3. **Verify the change**:
   ```sql
   SELECT id, email, "userType", "isAdmin"
   FROM users
   WHERE email = 'your-email@example.com';
   ```

### Method 3: Using Prisma CLI

1. **Create a quick script** (`set-admin.ts`):
   ```typescript
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();
   const ADMIN_EMAIL = 'your-email@example.com'; // Change this!

   async function setAdmin() {
     const user = await prisma.user.update({
       where: { email: ADMIN_EMAIL },
       data: { isAdmin: true },
       select: { email: true, isAdmin: true },
     });

     console.log('✅ Admin set:', user);
   }

   setAdmin()
     .catch(console.error)
     .finally(() => prisma.$disconnect());
   ```

2. **Run the script**:
   ```bash
   npx tsx set-admin.ts
   ```

## Admin Capabilities

Once you're an admin, you can:

1. **View all users** at `/dashboard/admin/users`
2. **Manage usage limits** at `/dashboard/admin/settings`
3. **Set other users as admins** through the API
4. **Change user types** (FREE, PLUS, ADMIN)
5. **Configure max activities per user type**

## Admin API Endpoints

### Get All Users
```bash
GET /api/admin/users
```

### Update User
```bash
PUT /api/admin/users
Body: {
  "userId": "user-id-here",
  "userType": "FREE" | "PLUS" | "ADMIN",
  "isAdmin": true | false
}
```

### Get Usage Limits
```bash
GET /api/admin/usage-limits
```

### Update Usage Limit
```bash
PUT /api/admin/usage-limits
Body: {
  "userType": "FREE" | "PLUS" | "ADMIN",
  "maxActivities": 100,
  "includeFollowups": false
}
```

## Default Usage Limits

The system comes with these default limits (already seeded):

| User Type | Max Activities | Include Followups |
|-----------|---------------|-------------------|
| FREE      | 100          | No               |
| PLUS      | 500          | No               |
| ADMIN     | 999,999      | No               |

## Security Notes

⚠️ **Important Security Considerations:**

1. **Protect Admin Routes**: Only admins can access `/api/admin/*` endpoints
2. **Don't Expose Admin Status**: The `isAdmin` field is separate from `userType`
3. **Audit Admin Actions**: Consider adding logging for admin actions in production
4. **Limit Admin Count**: Only give admin access to trusted users
5. **Environment Variables**: Never commit admin credentials to git

## Troubleshooting

### "Forbidden - Admin access required"
- Make sure `isAdmin` is set to `true` in the database
- Clear your browser cache and re-login
- Check that the API is reading from the correct database

### Can't see admin menu
- Admin UI routes need to be created
- Make sure you're logged in with an admin account
- Check browser console for errors

### Changes not reflecting
- Run `npx prisma db push` to sync schema
- Restart your development server
- Clear browser cache and cookies
