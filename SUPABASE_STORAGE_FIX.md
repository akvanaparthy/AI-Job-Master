# Supabase Storage Setup - Fix for RLS Error

## The Error

```
Supabase storage upload error: StorageApiError: new row violates row-level security policy
```

This error occurs because the Supabase Storage bucket doesn't have the proper Row Level Security (RLS) policies configured.

## Quick Fix (2 Methods)

### Method 1: Using SQL (Recommended - Fastest)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/pqqribyphairsorshiir/sql/new
   - Or navigate to your project → SQL Editor

2. **Copy and run the SQL script**
   - Copy all contents from `supabase-storage-setup.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify success**
   - You should see "Success. No rows returned" or query results
   - The bucket and policies are now created

### Method 2: Using Supabase Dashboard (Manual)

#### Step 1: Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/pqqribyphairsorshiir/storage/buckets
2. Click **"New bucket"** or **"Create a new bucket"**
3. Fill in details:
   - **Name**: `resumes`
   - **Public bucket**: ✅ YES (check this box)
   - **File size limit**: `10485760` (10MB in bytes)
   - **Allowed MIME types**:
     ```
     application/pdf
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     text/plain
     ```
4. Click **"Create bucket"**

#### Step 2: Add RLS Policies

1. After creating bucket, click on the **"resumes"** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Upload Files**
- Click **"Create policy"** → **"For full customization"**
- Policy name: `Allow authenticated users to upload their own files`
- Allowed operation: `INSERT` (check only INSERT)
- Target roles: `authenticated`
- USING expression: Leave empty
- WITH CHECK expression:
  ```sql
  bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

**Policy 2: Read Files**
- Click **"New Policy"** → **"For full customization"**
- Policy name: `Allow public read access`
- Allowed operation: `SELECT` (check only SELECT)
- Target roles: `public`
- USING expression:
  ```sql
  bucket_id = 'resumes'
  ```
- WITH CHECK expression: Leave empty
- Click **"Review"** → **"Save policy"**

**Policy 3: Delete Files**
- Click **"New Policy"** → **"For full customization"**
- Policy name: `Allow users to delete their own files`
- Allowed operation: `DELETE` (check only DELETE)
- Target roles: `authenticated`
- USING expression:
  ```sql
  bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- WITH CHECK expression: Leave empty
- Click **"Review"** → **"Save policy"**

**Policy 4: Update Files**
- Click **"New Policy"** → **"For full customization"**
- Policy name: `Allow users to update their own files`
- Allowed operation: `UPDATE` (check only UPDATE)
- Target roles: `authenticated`
- USING expression:
  ```sql
  bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- WITH CHECK expression: Leave empty
- Click **"Review"** → **"Save policy"**

## How It Works

### File Organization
Files are organized by user ID:
```
resumes/
├── {user-id-1}/
│   ├── 1732123456789-abc123.pdf
│   └── 1732123567890-def456.docx
├── {user-id-2}/
│   └── 1732123678901-ghi789.pdf
```

### Policy Explanation

1. **Upload Policy**: Users can only upload to folders matching their user ID
   - `(storage.foldername(name))[1] = auth.uid()::text` ensures users upload to `resumes/{their-uid}/...`

2. **Read Policy**: Anyone can read files (needed for public URLs)
   - Files are accessed via public URLs for downloading

3. **Delete Policy**: Users can only delete their own files
   - Same user ID check prevents deleting other users' files

4. **Update Policy**: Users can only update their own files
   - Consistent with security model

## Testing After Setup

### Test Upload
1. Go to your app: http://localhost:3000/settings
2. Click on **"Resumes"** tab
3. Upload a PDF/DOCX file
4. Should show success message
5. File should appear in the list

### Verify in Supabase
1. Go to: https://supabase.com/dashboard/project/pqqribyphairsorshiir/storage/buckets/resumes
2. You should see a folder with your user ID
3. Click on the folder to see uploaded files

## Troubleshooting

### Error: "Bucket already exists"
- This is fine, bucket was already created
- Just focus on setting up the policies

### Error: "Policy already exists"
- Drop old policies first:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON storage.objects;
  ```

### Error: "RLS is not enabled"
- Run this:
  ```sql
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  ```

### Still Getting 403 Error After Setup?
1. **Clear browser cache** (Ctrl+Shift+R)
2. **Re-login** to the app
3. **Check bucket is public**:
   - Go to Storage → resumes bucket
   - Verify "Public" is enabled
4. **Verify policies exist**:
   ```sql
   SELECT policyname, cmd FROM pg_policies
   WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

### Upload Works But Can't Download?
- Make sure bucket is set to **public**
- Check the `getPublicUrl` call in code is correct

## Alternative: Disable RLS for Testing (NOT RECOMMENDED FOR PRODUCTION)

If you just want to test quickly (development only):

```sql
-- DEVELOPMENT ONLY - NOT FOR PRODUCTION
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Make bucket public
UPDATE storage.buckets SET public = true WHERE id = 'resumes';
```

**⚠️ Warning**: This removes all security. Only use for local testing!

## Re-enable Security After Testing

```sql
-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Then run the proper policies from supabase-storage-setup.sql
```

## Quick Command Reference

```bash
# Test upload via curl (after getting auth token)
curl -X POST http://localhost:3000/api/settings/resumes \
  -H "Cookie: your-session-cookie" \
  -F "file=@resume.pdf" \
  -F "title=My Resume"

# Check if bucket exists (in Supabase SQL Editor)
SELECT * FROM storage.buckets WHERE id = 'resumes';

# List all policies
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

# Delete all policies (start fresh)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
  END LOOP;
END $$;
```

## After Setup Checklist

- [ ] Bucket `resumes` exists
- [ ] Bucket is set to public
- [ ] 4 RLS policies created (INSERT, SELECT, DELETE, UPDATE)
- [ ] Policies target correct roles (authenticated/public)
- [ ] Test upload works
- [ ] Test download works (public URL accessible)
- [ ] Test delete works

## Summary

The RLS error happens because Supabase protects storage by default. You must:
1. Create the `resumes` bucket (public)
2. Add 4 RLS policies for INSERT, SELECT, DELETE, UPDATE
3. Policies ensure users can only access their own files

Use **Method 1 (SQL script)** for fastest setup - just copy `supabase-storage-setup.sql` to SQL Editor and run!
