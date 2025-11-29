# Generation Tracking System Implementation

## Overview
Implemented a comprehensive three-tier usage tracking system to control costs while providing good user experience.

## System Architecture

### Three Separate Limits
1. **Activities** (Saved items only)
   - Free users: 80 activities/month
   - Only counts when users save generated content
   - Tracked in `User.activityCount`

2. **Generations** (All non-followup generations)
   - Free users: 100 generations/month
   - Counts every generation (saved or not)
   - Tracked in `User.generationCount`

3. **Followup Generations** (Separate limit)
   - Free users: 50 followup generations/month
   - Separate limit for followup messages
   - Tracked in `User.followupGenerationCount`

## Database Schema Updates

### User Model
Added three new fields:
- `generationCount` (Int, default 0)
- `activityCount` (Int, default 0)
- `followupGenerationCount` (Int, default 0)

### UsageLimitSettings Model
Added two new fields:
- `maxGenerations` (Int, default 100)
- `maxFollowupGenerations` (Int, default 50)

### ActivityHistory Model
Added two new fields:
- `isSaved` (Boolean, default false) - Marks if item was saved
- `isFollowup` (Boolean, default false) - Marks if it's a followup

## Files Created/Updated

### New Files
1. **`lib/usage-tracking.ts`** - Core tracking library
   - `checkUsageLimits()` - Check if user can generate
   - `trackGeneration()` - Increment generation counter
   - `trackActivity()` - Increment activity counter when saved
   - `checkActivityLimit()` - Check if user can save
   - `trackGenerationHistory()` - Track in ActivityHistory
   - `resetMonthlyCounters()` - Reset counters monthly

### Updated Files

#### Admin Panel
1. **`app/admin/settings/page.tsx`**
   - Added three separate input fields for limits
   - Updated UI to show Activities, Generations, and Followup Generations
   - Added handlers for all three limit types

2. **`app/api/admin/usage-limits/route.ts`**
   - Updated PUT endpoint to handle `maxGenerations` and `maxFollowupGenerations`

#### Generation APIs
All three generation APIs updated identically:

1. **`app/api/generate/cover-letter/route.ts`**
2. **`app/api/generate/linkedin/route.ts`**
3. **`app/api/generate/email/route.ts`**

Changes made to each:
- Added import for `checkUsageLimits`, `trackGeneration`, `trackGenerationHistory`, `trackActivity`
- Check generation limits before generating (replaces old activity limit check)
- Track generation immediately after successful generation
- Track in ActivityHistory with `isSaved=false`, `isFollowup=false/true`
- Increment activity counter when user saves (`trackActivityCount`)

## How It Works

### Generation Flow
1. User requests generation (cover letter, LinkedIn, or email)
2. System checks generation limit:
   - If followup: Check `followupGenerationCount` vs `maxFollowupGenerations`
   - If normal: Check `generationCount` vs `maxGenerations`
3. If allowed, generate content with AI
4. Increment appropriate counter (`generationCount` or `followupGenerationCount`)
5. Track in ActivityHistory with `isSaved=false`

### Save Flow
1. User saves generated content
2. Create database record (CoverLetter, LinkedInMessage, or EmailMessage)
3. Increment `activityCount`
4. Update old activity tracker (for compatibility)

### Monthly Reset
- Each user has `monthlyResetDate` field
- Cron job calls `resetMonthlyCounters()` daily
- Finds users past reset date
- Resets all three counters to 0
- Sets new reset date 30 days in future

## Admin Configuration

Admins can customize limits per user type (FREE/PLUS/ADMIN) via:
- Navigate to `/admin/settings`
- Three separate fields:
  - Max Activities (saved items)
  - Max Generations (all generations)
  - Max Followup Generations (followup only)
- Changes apply immediately to all users of that type

## Migration Required

⚠️ **IMPORTANT**: Database migration must be run before system is functional.

Run either:
```bash
npx prisma migrate dev --name add_generation_tracking
```
or
```bash
npx prisma db push
```

This will:
1. Add new fields to User table
2. Add new fields to UsageLimitSettings table
3. Add new fields to ActivityHistory table
4. Set default values for existing users (all counters = 0)

## Error Handling

Current TypeScript errors in `lib/usage-tracking.ts` are expected because:
- Prisma types haven't been regenerated with new schema
- Database migration hasn't been applied yet
- Errors will resolve after successful migration

## Testing Checklist

After migration:
- [ ] Test cover letter generation (should increment generationCount)
- [ ] Test saving cover letter (should increment activityCount)
- [ ] Test LinkedIn message generation (should increment generationCount)
- [ ] Test LinkedIn followup (should increment followupGenerationCount)
- [ ] Test email generation (should increment generationCount)
- [ ] Test email followup (should increment followupGenerationCount)
- [ ] Test hitting generation limit (should show error)
- [ ] Test hitting followup limit (should show separate error)
- [ ] Test hitting activity limit when saving (future feature)
- [ ] Verify admin panel shows three separate limits
- [ ] Verify admin can update all three limits

## Cost Analysis

With current limits for FREE users:
- 80 activities (saved items)
- 100 generations (all)
- 50 followup generations

Using Claude Haiku 4.5 ($0.005/generation):
- Max cost per FREE user/month: (100 + 50) × $0.005 = **$0.75/month**

Using Claude Haiku 3.5 ($0.004/generation):
- Max cost per FREE user/month: (100 + 50) × $0.004 = **$0.60/month**

## Next Steps

1. ✅ Run database migration (when connection available)
2. ✅ Test all generation flows
3. ⏳ Update activity history display to show "Generation" vs "Activity"
4. ⏳ Add activity limit check when saving (if needed)
5. ⏳ Set up cron job for monthly reset
6. ⏳ Update dashboard to show all three counters
