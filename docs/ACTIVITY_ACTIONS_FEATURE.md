# Activity Actions & Notifications Feature

## Overview
This document outlines the implementation of the activity actions and notifications system.

## Features Implemented

### 1. Database Schema ✅
- Added `Notification` model
- Added `followupReminderDays` to User model
- Added notifications relations to EmailMessage and LinkedInMessage

### 2. Dashboard Stats API ✅
- Updated to return status, messageType, and full data for each activity
- This allows the frontend to display proper status badges and action buttons

## Features To Complete

### 3. Dashboard UI Updates
**File**: `app/dashboard/page.tsx`

Update the activity table row to show:
```tsx
// Status Column
<td className="text-center py-5 px-4">
  {activity.type === 'Cover Letter' ? (
    <span className="text-sm text-slate-500">N/A</span>
  ) : (
    <Badge variant={
      activity.status === 'SENT' ? 'default' :
      activity.status === 'DONE' ? 'success' :
      activity.status === 'GHOST' ? 'destructive' : 'secondary'
    }>
      {activity.status}
    </Badge>
  )}
</td>

// Actions Column
<td className="text-center py-5 px-4">
  <div className="flex items-center justify-center gap-2">
    {/* Follow-up button for LinkedIn/Email NEW messages */}
    {(activity.type === 'LinkedIn' || activity.type === 'Email') &&
     activity.messageType === 'NEW' && (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleFollowup(activity)}
      >
        <Reply className="w-4 h-4 mr-1" />
        Follow-up
      </Button>
    )}

    {/* Delete button for cover letters or follow-up messages */}
    {(activity.type === 'Cover Letter' || activity.messageType === 'FOLLOW_UP') && (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(activity)}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    )}
  </div>
</td>
```

### 4. Follow-up Handler Function

```tsx
const handleFollowup = (activity: any) => {
  const params = new URLSearchParams({
    followup: 'true',
    id: activity.id,
    // Pass all the data needed to pre-fill the form
    ...(activity.data || {})
  });

  const route = activity.type === 'LinkedIn'
    ? '/dashboard/linkedin'
    : '/dashboard/email';

  router.push(`${route}?${params.toString()}`);
};
```

### 5. Delete Handler Function

```tsx
const handleDelete = async (activity: any) => {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const endpoint = activity.type === 'Cover Letter'
      ? `/api/cover-letters/${activity.id}`
      : activity.type === 'LinkedIn'
      ? `/api/linkedin-messages/${activity.id}`
      : `/api/email-messages/${activity.id}`;

    const response = await fetch(endpoint, { method: 'DELETE' });

    if (response.ok) {
      toast({ title: 'Deleted successfully' });
      refreshStats(); // Refresh dashboard stats
    }
  } catch (error) {
    toast({ title: 'Error deleting item', variant: 'destructive' });
  }
};
```

### 6. LinkedIn Page - Handle Pre-fill from Follow-up

**File**: `app/dashboard/linkedin/page.tsx`

```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const isFollowup = params.get('followup') === 'true';
  const messageId = params.get('id');

  if (isFollowup && messageId) {
    setMessageType('FOLLOW_UP');

    // Pre-fill form fields from URL params
    setPositionTitle(params.get('positionTitle') || '');
    setCompanyName(params.get('companyName') || '');
    setLinkedinUrl(params.get('linkedinUrl') || '');
    setRecipientName(params.get('recipientName') || '');
    // ... etc

    // Set parent message ID for follow-up tracking
    setParentMessageId(messageId);
  }
}, []);
```

### 7. Email Page - Handle Pre-fill from Follow-up

**File**: `app/dashboard/email/page.tsx`

Same pattern as LinkedIn page.

### 8. Delete API Endpoints

Create DELETE endpoints for each resource:
- `/api/cover-letters/[id]/route.ts`
- `/api/linkedin-messages/[id]/route.ts`
- `/api/email-messages/[id]/route.ts`

```tsx
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.coverLetter.delete({
    where: {
      id: params.id,
      userId: user.id, // Ensure user owns this resource
    },
  });

  return NextResponse.json({ success: true });
}
```

### 9. Notifications UI Component

**File**: `components/NotificationsBell.tsx`

```tsx
'use client';

import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export function NotificationsBell() {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread-count');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <button className="relative">
      <Bell className="w-5 h-5" />
      {data?.count > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
```

### 10. Settings Page - Followup Reminder Days

Add to settings page:
```tsx
<div>
  <Label>Follow-up Reminder (days)</Label>
  <Input
    type="number"
    min="1"
    max="30"
    value={followupReminderDays}
    onChange={(e) => setFollowupReminderDays(parseInt(e.target.value))}
  />
  <p className="text-sm text-slate-500 mt-1">
    You'll be notified to follow up after this many days
  </p>
</div>
```

### 11. Notification Generation (Cron Job or API)

Create a scheduled job or API endpoint that runs daily:
```tsx
// api/cron/generate-notifications/route.ts

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, followupReminderDays: true, email: true, userType: true },
  });

  for (const user of users) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - user.followupReminderDays);

    // Find LinkedIn messages needing follow-up
    const linkedInMessages = await prisma.linkedInMessage.findMany({
      where: {
        userId: user.id,
        messageType: 'NEW',
        createdAt: { lte: cutoffDate },
        followUpMessages: { none: {} }, // No follow-up exists
      },
    });

    // Create notifications
    for (const message of linkedInMessages) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'FOLLOWUP_REMINDER',
          title: 'Follow-up Reminder',
          message: `Time to follow up with ${message.companyName} about ${message.positionTitle}`,
          linkedInMessageId: message.id,
        },
      });

      // Send email for PLUS users
      if (user.userType === 'PLUS') {
        // await sendEmailNotification(user.email, ...);
      }
    }

    // Same for email messages...
  }

  return NextResponse.json({ success: true });
}
```

## Summary

This feature adds:
1. ✅ Status column showing application status
2. ✅ Actions column with Follow-up and Delete buttons
3. ✅ Follow-up button pre-fills the form with existing data
4. ✅ Delete button removes activities
5. ✅ Notifications system for follow-up reminders
6. ✅ Settings to configure reminder days
7. ✅ Email notifications for PLUS users (future)

The implementation is partially complete. You'll need to continue with steps 3-11 to finish the feature.
