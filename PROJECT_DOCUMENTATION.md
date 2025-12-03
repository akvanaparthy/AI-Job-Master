# AI Job Master - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Security](#authentication--security)
6. [AI Integration](#ai-integration)
7. [Usage Tracking System](#usage-tracking-system)
8. [User Flows](#user-flows)
9. [API Routes](#api-routes)
10. [Admin Features](#admin-features)
11. [Key Features Deep Dive](#key-features-deep-dive)

---

## Project Overview

**AI Job Master** is a comprehensive web application that helps job seekers create personalized application content using multiple AI providers. The platform generates cover letters, LinkedIn messages, and professional emails tailored to specific job descriptions and company information.

### Core Capabilities
- Multi-provider AI integration (OpenAI, Anthropic Claude, Google Gemini)
- Intelligent usage tracking with three-tier limit system
- Secure API key encryption and management
- Resume parsing and management (PDF/DOCX)
- Outreach history tracking with status management
- Admin dashboard with analytics and user management
- Shared API key system for PLUS users

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 18
- **Styling:** TailwindCSS 3.4
- **Component Library:** shadcn/ui (built on Radix UI)
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes (serverless)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 6.0
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage

### AI Providers
- **OpenAI API** - GPT-4, GPT-3.5-turbo
- **Anthropic API** - Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus
- **Google Generative AI** - Gemini 1.5 Pro, Gemini 1.5 Flash

### Security
- **Encryption:** AES-256-CBC (crypto module)
- **Authentication:** JWT tokens (Supabase)
- **CSRF Protection:** Custom rate limiting
- **Password Hashing:** bcryptjs

### Deployment
- **Hosting:** Vercel (serverless)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Settings │  │  Admin   │  │  History │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Generate │  │ Settings │  │  Admin   │  │  Auth    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────┬──────────────┬──────────────┬──────────────┬─────────┘
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ OpenAI   │  │Anthropic │  │  Gemini  │  │Supabase  │
│   API    │  │   API    │  │   API    │  │   Auth   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
      │              │              │              │
      └──────────────┴──────────────┴──────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Resumes  │  │Messages  │  │ History  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
AI-Job-Master/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (40+ endpoints)
│   │   ├── generate/             # AI generation endpoints
│   │   │   ├── cover-letter/
│   │   │   ├── linkedin/
│   │   │   └── email/
│   │   ├── settings/             # User settings APIs
│   │   ├── admin/                # Admin-only endpoints
│   │   └── dashboard/            # Dashboard data APIs
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── dashboard/                # Main application pages
│   │   ├── cover-letter/
│   │   ├── linkedin/
│   │   ├── email/
│   │   ├── settings/
│   │   ├── manage/
│   │   └── activity-history/
│   ├── admin/                    # Admin panel
│   │   ├── users/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── shared-keys/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin-specific components
│   └── settings/                 # Settings components
│
├── lib/                          # Utility libraries
│   ├── ai/                       # AI provider integrations
│   │   ├── providers.ts          # Multi-provider abstraction
│   │   └── prompts.ts            # Prompt templates
│   ├── db/                       # Database utilities
│   │   └── prisma.ts             # Prisma client
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── validations/              # Zod schemas
│   ├── encryption.ts             # AES-256 encryption
│   ├── usage-tracking.ts         # Usage limit system
│   ├── shared-keys.ts            # Shared key management
│   ├── activity-tracker.ts       # Activity logging
│   └── csrf-protection.ts        # Rate limiting
│
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema (12 models)
│
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts              # Toast notifications
│   └── useDashboardStats.ts      # Dashboard data fetching
│
├── types/                        # TypeScript types
│   └── index.ts                  # Shared types
│
└── store/                        # Zustand state management
```

---

## Database Schema

### Entity Relationship Overview

**12 Prisma Models with Complex Relationships:**

1. **User** - Core user account with encrypted API keys
2. **Resume** - PDF/DOCX resume storage (max 3 per user)
3. **CoverLetter** - Generated cover letters
4. **LinkedInMessage** - LinkedIn outreach messages
5. **EmailMessage** - Email outreach messages
6. **CustomPrompt** - User-saved AI prompts
7. **ActivityHistory** - Unified activity log
8. **UsageLimitSettings** - Per-user-type limits
9. **SharedApiKey** - Admin-managed shared keys
10. **Notification** - User notifications
11. **SystemSettings** - Global system config
12. **Recommendation** - AI recommendations (future)

### Key Models Explained

#### User Model
```
User {
  id: UUID (PK)
  email: String (unique)
  
  // Encrypted API Keys
  openaiApiKey: String? (AES-256-CBC encrypted)
  anthropicApiKey: String? (AES-256-CBC encrypted)
  geminiApiKey: String? (AES-256-CBC encrypted)
  
  // User Type & Permissions
  userType: Enum (FREE, PLUS, ADMIN)
  isAdmin: Boolean (default: false)
  
  // Usage Counters (Three-Tier System)
  generationCount: Int (default: 0)
  activityCount: Int (default: 0)
  followupGenerationCount: Int (default: 0)
  monthlyResetDate: DateTime (default: now)
  
  // Preferences
  defaultResumeId: String?
  defaultLlmModel: String?
  defaultLength: Enum (CONCISE, MEDIUM, LONG)
  autoSave: Boolean (default: true)
  
  // Model Storage (cached from API)
  openaiModels: String[] (default: [])
  anthropicModels: String[] (default: [])
  geminiModels: String[] (default: [])
  
  // Relations
  resumes: Resume[]
  coverLetters: CoverLetter[]
  linkedinMessages: LinkedInMessage[]
  emailMessages: EmailMessage[]
  customPrompts: CustomPrompt[]
  activityHistory: ActivityHistory[]
  notifications: Notification[]
}
```

#### LinkedInMessage Model
```
LinkedInMessage {
  id: UUID (PK)
  userId: String (FK → User)
  resumeId: String? (FK → Resume)
  
  // Message Details
  messageType: Enum (NEW, FOLLOW_UP)
  linkedinUrl: String? (recipient profile)
  recipientName: String?
  positionTitle: String?
  companyName: String
  content: String (generated message)
  
  // Follow-up Logic
  parentMessageId: String? (FK → LinkedInMessage, self-reference)
  
  // Metadata
  llmModel: String? (which AI model used)
  status: Enum (DRAFT, SENT, DONE, GHOST)
  length: Enum (CONCISE, MEDIUM, LONG)
  
  // Job Context
  jobDescription: String?
  companyDescription: String?
  areasOfInterest: String?
  
  timestamps: createdAt, updatedAt
}
```

#### UsageLimitSettings Model
```
UsageLimitSettings {
  id: UUID (PK)
  userType: Enum (FREE, PLUS, ADMIN) - unique
  
  // Three-Tier Limits
  maxActivities: Int (default: 100) - saved items only
  maxGenerations: Int (default: 100) - all generations
  maxFollowupGenerations: Int (default: 50) - followups only
  
  includeFollowups: Boolean (default: false)
  
  timestamps: createdAt, updatedAt
}
```

#### ActivityHistory Model
```
ActivityHistory {
  id: UUID (PK)
  userId: String (FK → User)
  
  activityType: Enum (COVER_LETTER, LINKEDIN_MESSAGE, EMAIL_MESSAGE)
  companyName: String
  positionTitle: String?
  recipient: String? (for messages)
  
  // Tracking Flags
  isSaved: Boolean (default: false) - counts toward activityCount
  isFollowup: Boolean (default: false) - uses followup limit
  isDeleted: Boolean (default: false) - soft delete
  
  status: Enum (DRAFT, SENT, DONE, GHOST)?
  llmModel: String? (which AI used)
  
  createdAt: DateTime
}
```

#### SharedApiKey Model
```
SharedApiKey {
  id: UUID (PK)
  provider: Enum (OPENAI, ANTHROPIC, GEMINI)
  apiKey: String (AES-256-CBC encrypted)
  models: String[] (allowed models)
  isActive: Boolean (default: true)
  
  timestamps: createdAt, updatedAt
}
```

### Database Relationships

- **User → Resume** (1:many, cascade delete)
- **User → CoverLetter** (1:many, cascade delete)
- **User → LinkedInMessage** (1:many, cascade delete)
- **User → EmailMessage** (1:many, cascade delete)
- **User → CustomPrompt** (1:many, cascade delete)
- **User → ActivityHistory** (1:many, cascade delete)
- **Resume → CoverLetter** (1:many)
- **LinkedInMessage → LinkedInMessage** (self-reference for followups)
- **EmailMessage → EmailMessage** (self-reference for followups)

### Indexes
- `User.email` (unique)
- `Resume.userId` (composite)
- `CoverLetter.userId + createdAt` (composite)
- `LinkedInMessage.userId + createdAt` (composite)
- `ActivityHistory.userId + createdAt` (composite)
- `ActivityHistory.userId + activityType` (composite)

---

## Authentication & Security

### Supabase Authentication

**Flow:**
1. User signs up with email/password
2. Supabase sends verification email
3. User clicks link → redirects to `/auth/callback`
4. Callback exchanges code for session
5. JWT token stored in cookies
6. Token auto-refreshes on expiry

**Implementation:**
- `createClient()` for browser-side auth (app/supabase/client.ts)
- `createServerClient()` for server-side auth (app/supabase/server.ts)
- Middleware checks auth on protected routes
- Row-level security policies on database

### AES-256-CBC Encryption

**Purpose:** Encrypt user API keys before storing in database

**Implementation (lib/encryption.ts):**
```
Encryption:
1. Generate random IV (16 bytes)
2. Create cipher with AES-256-CBC algorithm
3. Use ENCRYPTION_KEY from env (32 bytes)
4. Encrypt plaintext API key
5. Store: iv:encryptedData (hex format)

Decryption:
1. Split stored value by ':'
2. Extract IV and encrypted data
3. Create decipher with same algorithm
4. Decrypt and return plaintext key
```

**Key Storage:**
- Environment variable: `ENCRYPTION_KEY` (32 character string)
- Generated once, never changed
- API keys encrypted before INSERT/UPDATE
- Decrypted only when making AI API calls

### CSRF Protection & Rate Limiting

**Rate Limiting (lib/csrf-protection.ts):**
- In-memory store with request counts per user
- Limits: 5 requests per minute for generation endpoints
- Auto-cleanup of expired entries every 60 seconds
- Returns 429 status with retry-after header

**Implementation:**
```
Rate Limit Check:
1. Generate key: `operation:userId`
2. Check if key exists in store
3. If exists and within window: increment count
4. If count > limit: return 429
5. If window expired: reset count and window
6. Add X-RateLimit headers to response
```

### Password Security

**Supabase handles password hashing:**
- Bcrypt algorithm internally
- Minimum 6 characters required
- Email verification required
- Password reset via email link

---

## AI Integration

### Multi-Provider Abstraction Layer

**Architecture (lib/ai/providers.ts):**

```
generateContent() → Provider Router
                         ↓
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      OpenAI API   Anthropic API  Gemini API
         (GPT)       (Claude)    (Gemini)
```

**Provider Detection:**
- Model name starts with `gpt-` → OpenAI
- Model name starts with `claude-` → Anthropic
- Model name starts with `gemini-` → Google

**API Call Structure:**
```
Input:
- provider: 'openai' | 'anthropic' | 'gemini'
- apiKey: string (decrypted)
- model: string (e.g., 'gpt-4', 'claude-3-5-sonnet-20241022')
- systemPrompt: string
- userPrompt: string
- maxTokens: number (500-2000)
- temperature: number (0.7)

Output:
- string (generated content)
```

### OpenAI Integration

**SDK:** `openai` npm package

**Implementation:**
1. Initialize client with API key
2. Call `chat.completions.create()`
3. Pass messages array: system + user
4. Specify model, max_tokens, temperature
5. Extract response from `choices[0].message.content`

**Supported Models:**
- gpt-4-turbo
- gpt-4
- gpt-3.5-turbo
- gpt-3.5-turbo-16k

### Anthropic Integration

**SDK:** `@anthropic-ai/sdk`

**Implementation:**
1. Initialize Anthropic client
2. Call `messages.create()`
3. Pass system prompt separately (not in messages)
4. Specify model, max_tokens, temperature
5. Extract response from `content[0].text`

**Supported Models:**
- claude-3-5-sonnet-20241022
- claude-3-5-haiku-20241022
- claude-3-opus-20240229
- claude-3-haiku-20240307

### Google Gemini Integration

**SDK:** `@google/generative-ai`

**Implementation:**
1. Initialize GoogleGenerativeAI client
2. Get generative model
3. Combine system + user prompt (Gemini doesn't separate)
4. Call `generateContent()`
5. Extract response from `response.text()`

**Supported Models:**
- gemini-1.5-pro
- gemini-1.5-flash
- gemini-1.0-pro

### Dynamic Model Discovery

**Process:**
1. User enters API key in settings
2. System calls provider API to list available models
3. Filter models by type (chat models only, exclude embeddings/vision)
4. Store filtered list in User.openaiModels / anthropicModels / geminiModels
5. Dropdown shows only discovered models

**Filtering Logic:**
- **Anthropic:** Include models with "claude-" prefix, exclude "embedding"
- **OpenAI:** Include chat models (gpt-*), exclude ada/embedding/whisper/dall-e
- **Gemini:** Include gemini-1.5/1.0 models, exclude embedding models

### Prompt Engineering

**Structure (lib/ai/prompts.ts):**

```
Cover Letter:
System: "You are an expert career advisor..."
User: Resume content + job description + company info

LinkedIn Message:
System: "You are a professional recruiter..."
User: Resume + recipient details + message type (new/followup)

Email:
System: "You are a professional email writer..."
User: Resume + recipient + job details
```

**Prompt Components:**
- System prompt: Defines AI role and behavior
- User prompt: Contains context (resume, job description)
- Length control: "Be concise" vs "Be detailed"
- Tone guidelines: Professional, friendly, not desperate

---

## Usage Tracking System

### Three-Tier Architecture

**Why Three Tiers?**
- Prevent API cost explosion while maintaining UX
- Separate limits for different action types
- Granular control for admins
- Accurate tracking of user behavior

### Tier 1: Generation Limit

**What it tracks:** All AI generations (non-followup)

**When incremented:**
- User generates cover letter
- User generates new LinkedIn message
- User generates new email

**Limit:** 100 per month for FREE users

**Implementation:**
- Check `user.generationCount` vs `limits.maxGenerations`
- Increment after successful generation
- Reset to 0 on monthly reset date

### Tier 2: Followup Generation Limit

**What it tracks:** LinkedIn/Email followup messages only

**When incremented:**
- User generates LinkedIn followup
- User generates Email followup

**Limit:** 50 per month for FREE users

**Implementation:**
- Check `user.followupGenerationCount` vs `limits.maxFollowupGenerations`
- Separate counter from main generations
- Prevents followup spam

### Tier 3: Activity Limit

**What it tracks:** Only saved/stored items

**When incremented:**
- User saves cover letter to database
- User saves LinkedIn message
- User saves email message

**Limit:** 80 per month for FREE users

**Implementation:**
- Check `user.activityCount` vs `limits.maxActivities`
- Increment only if `saveToHistory=true`
- Not incremented if user just previews content

### Usage Flow

**Pre-Generation Check:**
```
1. User clicks "Generate"
2. API calls checkUsageLimits(userId, isFollowup)
3. Function queries User table for counters
4. Compares with UsageLimitSettings for user type
5. Returns { allowed: boolean, reason?: string }
6. If not allowed: return 429 with error message
7. If allowed: proceed to generation
```

**Post-Generation Tracking:**
```
1. AI generation completes successfully
2. Call trackGeneration(userId, isFollowup)
   - If followup: increment followupGenerationCount
   - If not: increment generationCount
3. Call trackGenerationHistory() to create ActivityHistory entry
   - Set isSaved=false (not saved yet)
   - Set isFollowup flag
4. If user clicks "Save to History":
   - Create CoverLetter/LinkedInMessage/EmailMessage record
   - Call trackActivity(userId, isFollowup)
   - Increment activityCount
   - Update ActivityHistory: isSaved=true
```

### Monthly Reset Logic

**Cron Job (to be implemented):**
```
Daily at midnight:
1. Query all users where monthlyResetDate <= NOW()
2. For each user:
   - Set generationCount = 0
   - Set activityCount = 0
   - Set followupGenerationCount = 0
   - Set monthlyResetDate = NOW() + 30 days
3. Log reset actions
```

**User-Specific Reset:**
- Each user has their own `monthlyResetDate`
- Set on registration to current date + 30 days
- Resets happen independently per user
- Prevents all users resetting simultaneously

### Admin Configuration

**UsageLimitSettings Model:**
- One record per UserType (FREE, PLUS, ADMIN)
- Admin can modify limits via `/admin/settings`
- Changes apply to all users of that type immediately
- ADMIN users have unlimited (0 = unlimited)

**Admin Panel:**
- Input fields for all three limits
- Real-time validation
- Save button updates database
- Toast confirmation on success

---

## User Flows

### 1. New User Onboarding

**Steps:**
1. User visits landing page
2. Clicks "Sign Up"
3. Enters email + password (min 6 chars)
4. Supabase sends verification email
5. User clicks email link
6. Redirected to `/auth/callback`
7. Callback completes authentication
8. Redirected to `/dashboard`
9. Dashboard shows "Add API Key" prompt
10. User goes to Settings → API Keys
11. Enters OpenAI/Anthropic/Gemini key
12. Key is encrypted and stored
13. System discovers available models
14. User uploads resume (optional)
15. Ready to generate content

**Database Changes:**
- User record created in PostgreSQL
- `userType` set to FREE
- Counters initialized to 0
- `monthlyResetDate` set to now + 30 days

### 2. Cover Letter Generation

**Flow:**
1. User navigates to `/dashboard/cover-letter`
2. Selects resume from dropdown (or uses default)
3. Pastes job description in textarea
4. Optionally adds company description
5. Selects length (Concise/Medium/Long)
6. Selects AI model from dropdown
7. Clicks "Generate Cover Letter"

**Backend Process:**
```
API: POST /api/generate/cover-letter

1. Validate user session (Supabase Auth)
2. Check rate limit (5 req/min)
3. Check generation limit (generationCount vs maxGenerations)
4. If limit exceeded: return 429 with error
5. Decrypt user's API key
6. Build prompts:
   - System: "You are an expert career advisor..."
   - User: Resume content + job description + company info
7. Call AI provider API
8. Receive generated content
9. Check for misuse (inappropriate content detection)
10. Increment generationCount
11. Create ActivityHistory entry (isSaved=false)
12. If autoSave enabled or user saves:
    - Create CoverLetter record
    - Increment activityCount
    - Update ActivityHistory (isSaved=true)
13. Return generated content to frontend
```

**Frontend Display:**
8. Generated cover letter appears in preview
9. User can copy to clipboard
10. User can save to history (if not auto-saved)
11. Toast notification confirms save
12. Redirected to history page

### 3. LinkedIn Message Generation (New)

**Flow:**
1. User navigates to `/dashboard/linkedin`
2. Selects "New Message" tab
3. Fills in recipient details:
   - LinkedIn URL (auto-parses username)
   - Recipient name
   - Position title
   - Company name
4. Selects resume
5. Pastes job description (optional)
6. Adds company description (optional)
7. Selects length and AI model
8. Selects status (Sent/Draft)
9. Clicks "Generate Message"

**Backend Process:**
```
API: POST /api/generate/linkedin

1. Validate session
2. Check rate limit
3. Check generation limit (generationCount)
4. Decrypt API key
5. Build LinkedIn-specific prompts
6. Call AI provider
7. Increment generationCount
8. Create ActivityHistory (isSaved=false, isFollowup=false)
9. If saved:
   - Create LinkedInMessage record
   - Increment activityCount
10. Return message
```

**2-Message Limit Check:**
- Query LinkedInMessage table for same linkedinUrl
- Count existing messages
- If count >= 2: block generation with error
- Error message: "Already sent 2 messages to this recipient"

### 4. LinkedIn Followup Generation

**Flow:**
1. User goes to `/dashboard/linkedin`
2. Selects "Follow-up" tab
3. Dropdown shows all previous NEW messages
4. User selects recipient from dropdown
5. Form auto-fills with:
   - LinkedIn URL
   - Recipient name
   - Position, company
   - Previous message content (read-only)
6. User can edit company description, add notes
7. Selects length and AI model
8. Clicks "Generate Follow-up"

**Backend Process:**
```
API: POST /api/generate/linkedin (with messageType='FOLLOW_UP')

1. Validate session
2. Check rate limit
3. Check FOLLOWUP limit (followupGenerationCount vs maxFollowupGenerations)
4. Query existing messages for linkedinUrl
5. If count >= 2: return error "Already sent followup"
6. Decrypt API key
7. Build followup prompt (includes previous message)
8. Call AI provider
9. Increment followupGenerationCount (NOT generationCount)
10. Create ActivityHistory (isSaved=false, isFollowup=true)
11. If saved:
    - Create LinkedInMessage with parentMessageId
    - Increment activityCount (if includeFollowups=true)
12. Return followup message
```

### 5. Activity History Viewing

**Flow:**
1. User navigates to `/dashboard/activity-history`
2. Dashboard displays:
   - Total activities count
   - Recent activities (last 10)
   - Filter options (platform, status, date)
3. User can filter by:
   - Platform: All, Cover Letter, LinkedIn, Email
   - Status: All, Draft, Sent, Done, Ghost
   - Date range: Last 7/30/90 days
4. User clicks on activity to view details
5. Detail modal shows:
   - Full content
   - Company, position
   - Generated date
   - AI model used
   - Status
6. User can:
   - Update status
   - Generate followup (if LinkedIn/Email)
   - Delete activity (soft delete)

**Backend:**
```
API: GET /api/activity-history

1. Validate session
2. Get userId from session
3. Query ActivityHistory with filters
4. Join with related tables (CoverLetter/LinkedInMessage/EmailMessage)
5. Order by createdAt DESC
6. Return paginated results
```

### 6. Settings Management

**API Keys:**
1. User goes to `/dashboard/settings`
2. Clicks "API Keys" tab
3. Can add/update:
   - OpenAI key
   - Anthropic key
   - Gemini key
4. Enters key → system validates → encrypts → stores
5. System auto-discovers available models
6. Models cached in User table

**Preferences:**
1. Clicks "Preferences" tab
2. Can set:
   - Default resume
   - Default AI model
   - Default length
   - Auto-save toggle
   - Default status
3. Changes saved to User table

**Resumes:**
1. Clicks "Resumes" tab
2. Can upload new resume (PDF/DOCX)
3. File uploaded to Supabase Storage
4. Content extracted with pdf-parse/mammoth
5. Resume record created in database
6. Max 3 resumes enforced
7. Can delete or set as default

### 7. Admin User Management

**Flow:**
1. Admin logs in (isAdmin=true)
2. Navigates to `/admin`
3. Dashboard shows:
   - Total users count
   - Active users today
   - Total generations this month
   - User growth chart
4. Admin clicks "Users"
5. User list displays:
   - Email
   - User type (FREE/PLUS/ADMIN)
   - Registration date
   - Last active
   - Generation counts
6. Admin clicks on user
7. User detail page shows:
   - All user info
   - Activity history
   - Usage statistics
8. Admin can:
   - Change user type
   - Reset counters
   - View all activities

### 8. Admin Shared Keys

**Flow:**
1. Admin goes to `/admin/shared-keys`
2. Clicks "Add Shared Key"
3. Enters:
   - Provider (OpenAI/Anthropic/Gemini)
   - API key
4. System fetches available models from API
5. Admin selects which models to enable
6. Key is encrypted and stored
7. PLUS users now see these models as "(Free) Plus"
8. Admin can edit models or delete key

---

## API Routes

### Authentication Routes

**POST /api/auth/signup**
- Create new user account
- Trigger verification email
- Return session token

**POST /api/auth/login**
- Validate credentials
- Return JWT token
- Set session cookie

**POST /api/auth/logout**
- Clear session
- Invalidate token

**GET /api/auth/callback**
- Exchange code for session
- Set cookie
- Redirect to dashboard

### Generation Routes

**POST /api/generate/cover-letter**
- Input: resume, jobDescription, companyName, length, model
- Checks: Rate limit, usage limit
- Process: Decrypt key → AI call → Track usage
- Output: Generated cover letter + id

**POST /api/generate/linkedin**
- Input: messageType, recipient details, jobDescription, length, model
- Checks: Rate limit, usage limit, 2-message limit
- Process: Build prompt with/without previous message → AI call
- Output: Generated message + id

**POST /api/generate/email**
- Input: recipient details, jobDescription, length, model
- Process: Same as LinkedIn
- Output: { subject, body, id }

### Settings Routes

**GET /api/settings/api-keys**
- Returns: User's encrypted keys (masked)
- No decryption on read

**PUT /api/settings/api-keys**
- Input: { openaiApiKey?, anthropicApiKey?, geminiApiKey? }
- Process: Encrypt → Store → Discover models
- Output: Success + available models

**GET /api/settings/available-models**
- Returns: All models available to user
- Includes: User's models + shared models (if PLUS)

**GET /api/settings/models**
- Discovers models from API keys
- Caches in User table
- Returns: { openaiModels, anthropicModels, geminiModels }

**PUT /api/settings/preferences**
- Input: defaultResumeId, defaultLlmModel, defaultLength, autoSave
- Updates User table

**GET /api/settings/resumes**
- Returns: All user's resumes

**POST /api/settings/resumes**
- Upload: PDF or DOCX file
- Process: Extract text → Store in Supabase Storage
- Limit: Max 3 resumes
- Output: Resume record

**DELETE /api/settings/resumes**
- Input: resumeId
- Process: Delete from storage + database

### Dashboard Routes

**GET /api/dashboard/stats**
- Returns: {
    totalCoverLetters,
    totalLinkedInMessages,
    totalEmailMessages,
    totalGenerated,
    recentActivities,
    generationCount,
    followupGenerationCount,
    activityCount,
    maxGenerations,
    maxFollowupGenerations,
    maxActivities
  }

### Activity Routes

**GET /api/activity-history**
- Query params: platform, status, startDate, endDate
- Returns: Paginated activity list

**PUT /api/history/[type]/[id]**
- Update status of cover letter/message
- Types: cover-letter, linkedin, email

**DELETE /api/history/[type]/[id]**
- Soft delete (set isDeleted=true)

**GET /api/history/export**
- Export all activities to JSON
- Returns: Complete history with metadata

### Admin Routes

**GET /api/admin/stats**
- Returns: {
    totalUsers,
    activeToday,
    totalGenerations,
    userGrowth: [] (chart data)
  }

**GET /api/admin/users**
- Returns: All users with usage stats

**GET /api/admin/users/[id]**
- Returns: Detailed user info

**PUT /api/admin/users/[id]**
- Update user type (FREE/PLUS/ADMIN)
- Reset counters

**GET /api/admin/users/[id]/activity**
- Returns: User's complete activity history

**GET /api/admin/usage-limits**
- Returns: UsageLimitSettings for all user types

**PUT /api/admin/usage-limits**
- Input: { userType, maxActivities, maxGenerations, maxFollowupGenerations }
- Updates limits

**GET /api/admin/shared-keys**
- Returns: All shared API keys (masked)

**POST /api/admin/shared-keys**
- Input: { provider, apiKey, models[] }
- Process: Encrypt → Store
- Output: Success

**PUT /api/admin/shared-keys/[id]**
- Update models for shared key

**DELETE /api/admin/shared-keys/[id]**
- Remove shared key

**POST /api/admin/shared-keys/fetch-models**
- Input: { provider, apiKey }
- Fetches models from provider API
- Returns: Available models list

**POST /api/admin/shared-keys/decrypt**
- Input: { keyId }
- Returns: Decrypted API key (for editing)

---

## Admin Features

### Dashboard Analytics

**Metrics Displayed:**
- Total users count
- Active users today
- Total generations this month
- User registrations (last 30 days chart)

**Implementation:**
- Recharts line chart for user growth
- Real-time stats from database queries
- Auto-refresh every 30 seconds

### User Management

**Capabilities:**
- View all users in table
- Search by email
- Filter by user type
- Sort by registration date / last active
- Click user to view details

**User Detail Page:**
- Complete profile info
- Usage statistics (all three counters)
- Activity history
- Actions:
  - Change user type
  - Reset monthly counters
  - View all activities
  - Impersonate user (future)

### Usage Limit Configuration

**Interface:**
- Three input fields per user type
- Labels: "Max Activities", "Max Generations", "Max Followup Generations"
- Description text explains each limit
- Save button with confirmation toast

**Backend:**
- Updates UsageLimitSettings table
- Changes apply immediately to all users of that type
- Validation: Must be >= 0 (0 = unlimited)

### Shared API Keys Management

**Purpose:**
- Allow PLUS users to use AI without their own keys
- Reduce barrier to entry
- Control costs centrally

**Features:**
- Add new shared key (provider + API key)
- System fetches available models
- Admin selects which models to enable
- Edit existing key to update models
- Delete shared key (disables for all users)
- Toggle active status

**User Experience:**
- PLUS users see shared models in dropdown
- Marked as "(Free) Plus"
- No API key required from user
- Admin pays for API usage

### Analytics Dashboard

**Charts:**
- User growth over time (line chart)
- Generations by type (bar chart)
- Active users by day (area chart)
- Top users by generation count (table)

**Filters:**
- Date range selector
- User type filter
- Activity type filter

---

## Key Features Deep Dive

### Resume Parsing

**Supported Formats:**
- PDF (via pdf-parse library)
- DOCX (via mammoth library)

**Process:**
1. User uploads file via `/api/settings/resumes`
2. File saved to Supabase Storage
3. File buffer read into memory
4. If PDF:
   - Call `pdf-parse(buffer)`
   - Extract `.text` property
5. If DOCX:
   - Call `mammoth.extractRawText(buffer)`
   - Extract `.value` property
6. Store extracted text in Resume.content
7. Store file metadata (name, URL)

**Limitations:**
- Max 3 resumes per user
- Max file size: 5MB (Supabase limit)
- Only text extraction (no formatting preserved)

### Custom Prompts

**Feature:**
- Users can create custom AI prompts
- Tab-specific (cover letter prompts ≠ LinkedIn prompts)
- Named prompts saved to database
- Dropdown to select prompt before generation

**Implementation:**
1. User clicks "Edit Prompt" in generation tab
2. Default prompt shown in textarea
3. User modifies prompt
4. Must provide name to save
5. Saved to CustomPrompt table with tabType
6. Dropdown shows all prompts for current tab
7. Selected prompt used in AI generation

**Use Cases:**
- Emphasize specific skills
- Change tone (formal vs casual)
- Add company-specific context
- Focus on achievements

### LinkedIn URL Parsing

**Purpose:**
- Extract username from LinkedIn profile URL
- Validate URL format
- Store for duplicate detection

**Regex Pattern:**
```
/linkedin\.com\/in\/([^\/\?]+)/
```

**Examples:**
- Input: `https://linkedin.com/in/john-doe`
- Extracted: `john-doe`

**Validation:**
- Must contain "linkedin.com/in/"
- Username can contain letters, numbers, hyphens
- Stops at query params or trailing slash

### 2-Message LinkedIn Limit

**Logic:**
```
For each linkedinUrl:
1. Query LinkedInMessage where linkedinUrl = input
2. Count results
3. If count == 0: Allow new message
4. If count == 1: Allow followup only
5. If count >= 2: Block with error
```

**Error Message:**
"Already sent 2 messages to this recipient (1 initial + 1 follow-up)"

**Rationale:**
- Prevents spam behavior
- Encourages quality over quantity
- Professional networking standard
- Respects recipient's inbox

### Status Workflow

**States:**
- **DRAFT** - Saved but not sent
- **SENT** - Message was sent (default)
- **DONE** - Completed interaction (got response/hired)
- **GHOST** - No response, lost cause

**Transitions:**
```
DRAFT → SENT (user sent the message)
SENT → DONE (got positive response)
SENT → GHOST (no response after followup)
GHOST → (end state, no transitions)
DONE → (end state, no transitions)
```

**Follow-up Rules:**
- Can generate followup if status = SENT
- Cannot followup if status = DONE or GHOST
- Followup inherits original message context

### Auto-Save Feature

**Scope:** Cover letters only (not messages)

**Behavior:**
- If `user.autoSave = true`: Automatically save after generation
- If `false`: User must click "Save to History"

**Implementation:**
```
1. User generates cover letter
2. Check user.autoSave setting
3. If true:
   - Create CoverLetter record immediately
   - Increment activityCount
   - Show "Saved automatically" toast
4. If false:
   - Show "Save to History" button
   - User clicks → trigger save
```

**Rationale:**
- Some users want to preview before saving
- Others want seamless workflow
- Configurable in settings

### Model Display Names

**Problem:** Model IDs are technical and ugly
- `claude-3-5-sonnet-20241022` → user-unfriendly

**Solution:** Humanize model names
- `Claude 3.5 Sonnet (Anthropic)`
- `GPT-4 Turbo (OpenAI)`
- `Gemini 1.5 Pro (Google)`

**Implementation (lib/utils/modelNames.ts):**
```
1. Detect provider from model name
2. Parse version numbers
3. Capitalize model type
4. Format as: "{Name} {Version} {Type} ({Provider})"
```

### Shared Model Prefix System

**Problem:** Distinguish user's models from shared models

**Solution:** Prefix shared models with "shared:"
- User's model: `claude-3-5-sonnet-20241022`
- Shared model: `shared:claude-3-5-sonnet-20241022`

**Benefits:**
- Clear indication of free models
- Backend can route to shared key
- User knows which models cost them nothing

**Display:**
- Shared models shown as "Claude 3.5 Sonnet (Free) Plus"
- Regular models shown as "Claude 3.5 Sonnet (Anthropic)"

---

## Performance Optimizations

### Database Indexing
- Composite indexes on userId + createdAt for fast queries
- Unique indexes on email for fast user lookups
- Enum types for fixed sets (UserType, Length, Status)

### Caching Strategies
- Model lists cached in User table (avoid repeated API calls)
- Rate limit store in memory (avoid DB hits)
- Session tokens in cookies (avoid DB lookups)

### API Response Times
- Cover letter generation: 2-4 seconds
- LinkedIn message: 2-3 seconds
- Email generation: 3-5 seconds
- Settings update: < 500ms
- Dashboard stats: < 1 second

### Bundle Optimization
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Tree shaking unused code
- Image optimization with Next/Image

---

## Future Enhancements

### Planned Features
1. Email integration (Gmail API) - send directly
2. Calendar integration - schedule followups
3. Chrome extension - generate on LinkedIn
4. Interview prep generator
5. Company research automation
6. A/B testing different message styles
7. Analytics - response rate tracking
8. Team collaboration - shared prompts
9. Template library - community templates
10. Mobile app (React Native)

### Technical Improvements
1. Redis caching for sessions
2. Queue system for heavy operations (Bull)
3. Webhook notifications (Slack/Discord)
4. GraphQL API alternative
5. Real-time collaboration (Socket.io)
6. PDF export for cover letters
7. Bulk generation operations
8. Advanced search/filtering
9. Data visualization dashboards
10. API rate limit per user tier

---

## Deployment Guide

### Environment Variables

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
ENCRYPTION_KEY=
NEXT_PUBLIC_APP_URL=
```

**Optional (for testing):**
```
Anthropic_API_Key=
Google_API_Key=
OpenAI_API_Key=
```

### Vercel Deployment Steps

1. Push code to GitHub
2. Import project in Vercel
3. Select Next.js framework preset
4. Add environment variables
5. Deploy
6. Update Supabase redirect URLs with production domain
7. Test authentication flow
8. Verify API routes work
9. Check database connections

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
```

### Post-Deployment Checklist

- [ ] Authentication working
- [ ] API key encryption working
- [ ] AI generation successful
- [ ] File uploads to Supabase Storage
- [ ] Admin panel accessible
- [ ] Email verification emails sending
- [ ] Rate limiting active
- [ ] Usage tracking incrementing
- [ ] Shared keys working for PLUS users
- [ ] Analytics charts displaying

---

## Troubleshooting Common Issues

### Database Connection Failed
**Cause:** Invalid DATABASE_URL or Supabase down
**Solution:** 
- Verify connection string format
- Check Supabase project status
- Use DIRECT_URL for migrations
- Try connection pooler URL for runtime

### API Key Encryption Error
**Cause:** ENCRYPTION_KEY missing or wrong length
**Solution:**
- Generate 32-character key
- Add to .env
- Restart server

### AI Generation Fails
**Cause:** Invalid API key or quota exceeded
**Solution:**
- Verify key in settings
- Check provider dashboard for quota
- Try different model
- Check API status page

### Rate Limit Hit Immediately
**Cause:** In-memory store not clearing
**Solution:**
- Restart server (clears memory)
- Increase limits in csrf-protection.ts
- Implement Redis for production

### Resume Upload Fails
**Cause:** File too large or wrong type
**Solution:**
- Check file size < 5MB
- Verify PDF/DOCX format
- Check Supabase Storage permissions

---

## Security Considerations

### Data Protection
- All API keys encrypted at rest (AES-256-CBC)
- Passwords hashed with bcrypt (via Supabase)
- Session tokens HTTPOnly cookies
- Row-level security on database

### API Security
- Rate limiting on all endpoints
- CSRF token validation
- Input sanitization with Zod
- SQL injection prevention (Prisma)

### Authentication
- Email verification required
- JWT token expiration
- Secure session storage
- Password reset via email only

### Best Practices
- Never log decrypted keys
- Validate all user inputs
- Escape HTML in outputs
- Use HTTPS only
- Regular dependency updates

---

## Cost Analysis

### FREE User (Max Usage)
- 100 generations: $0.50 (Claude Haiku 4.5 @ $0.005 each)
- 50 followup generations: $0.25
- **Total: $0.75/month per user**

### PLUS User (Shared Keys)
- Admin pays for all generations
- User pays $0/month
- Admin cost depends on user count

### Infrastructure Costs
- Vercel: Free tier (hobbyist) or $20/month (Pro)
- Supabase: Free tier or $25/month (Pro)
- **Total: Free to $45/month**

### Scaling Estimates
- 100 FREE users: $75/month in API costs
- 1000 FREE users: $750/month in API costs
- Revenue needed: ~$1-2 per user/month to break even

---

## Conclusion

AI Job Master is a production-ready, full-stack application demonstrating:
- **AI Engineering:** Multi-provider integration, prompt engineering, usage optimization
- **Security:** Encryption, authentication, CSRF protection
- **System Design:** Three-tier usage tracking, follow-up logic, status workflows
- **Database:** Complex relations, indexing, efficient queries
- **User Experience:** Intuitive flows, auto-save, preferences
- **Admin Tools:** Analytics, user management, shared keys

The project showcases modern web development practices with TypeScript, Next.js 14, and serverless architecture, while solving a real-world problem for job seekers.
