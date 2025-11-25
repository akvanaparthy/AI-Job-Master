# Testing Plan

This document outlines the testing plan for the API endpoints of the AI-Job-Master application.

## Authentication and Authorization

- **For all endpoints:**
  - Send requests without a valid authentication token and expect a `401 Unauthorized` error.
  - For admin-only endpoints, send requests with a non-admin user and expect a `403 Forbidden` error.

## Admin Endpoints

### `GET /api/admin/stats`

- **Success:**
  - Send a `GET` request as an admin user.
  - Expect a `200 OK` response with a JSON body containing the platform statistics.
  - Verify that the statistics are accurate by cross-referencing with the database.

### `GET /api/admin/users`

- **Success:**
  - Send a `GET` request as an admin user.
  - Expect a `200 OK` response with a paginated list of users.
  - Test the filtering by `userType` and `search` (email) query parameters.
  - Verify that the response does not contain sensitive information like API keys.

### `PATCH /api/admin/users/{id}`

- **Success:**
  - Send a `PATCH` request as an admin user to update a user's `userType`.
  - Expect a `200 OK` response with the updated user object.
  - Verify that the user's `userType` has been updated in the database.
- **Failure:**
  - Try to update the `userType` of the admin user themselves to a non-admin role and expect a `400 Bad Request` error.
  - Try to update with an invalid `userType` and expect a `400 Bad Request` error.

### `DELETE /api/admin/users/{id}`

- **Success:**
  - Send a `DELETE` request as an admin user to delete a user.
  - Expect a `200 OK` response with a success message.
  - Verify that the user has been deleted from the database.
- **Failure:**
  - Try to delete the admin user themselves and expect a `400 Bad Request` error.

## Settings Endpoints

### `GET /api/settings/available-models`

- **Success:**
  - Send a `GET` request as a logged-in user.
  - Expect a `200 OK` response with a list of available AI models for the user.
  - Verify that the list of models is accurate based on the user's configured API keys.

### `GET /api/settings/api-keys`

- **Success:**
  - Send a `GET` request as a logged-in user.
  - Expect a `200 OK` response with boolean flags indicating which API keys are set for the user.
  - Verify that the response does not contain the actual API keys.

### `POST /api/settings/api-keys`

- **Success:**
  - Send a `POST` request with valid API keys for OpenAI, Anthropic, and Gemini.
  - Expect a `200 OK` response with a success message.
  - Verify that the encrypted keys and the fetched models are stored in the database.
- **Failure:**
  - Send a `POST` request with invalid API keys and expect a `400 Bad Request` error.
  - Send a `POST` request with an empty string for an API key and verify that the key and models are removed from the database.

### `GET /api/settings/resumes`

- **Success:**
  - Send a `GET` request as a logged-in user.
  - Expect a `200 OK` response with a list of the user's resumes.

### `POST /api/settings/resumes`

- **Success:**
  - Send a `POST` request with a resume file (PDF, DOCX, or TXT) and a title.
  - Expect a `200 OK` response with the created resume object.
  - Verify that the resume file is uploaded to Supabase Storage and the resume data is stored in the database.
- **Failure:**
  - Send a `POST` request without a file or title and expect a `400 Bad Request` error.
  - Try to upload more than 3 resumes and expect a `400 Bad Request` error.
  - Send a `POST` request with an unsupported file type and expect a `400 Bad Request` error.

### `DELETE /api/settings/resumes`

- **Success:**
  - Send a `DELETE` request with a `resumeId`.
  - Expect a `200 OK` response with a success message.
  - Verify that the resume is deleted from the database and the file is deleted from Supabase Storage.
- **Failure:**
  - Send a `DELETE` request with an invalid `resumeId` and expect a `404 Not Found` error.
  - Try to delete a resume that belongs to another user and expect a `404 Not Found` error.

### `GET /api/settings/models`

- **Success:**
  - Send a `GET` request with a valid `provider` query parameter (`openai`, `anthropic`, or `gemini`).
  - Expect a `200 OK` response with a list of available models for that provider.
- **Failure:**
  - Send a `GET` request without a `provider` query parameter and expect a `400 Bad Request` error.
  - Send a `GET` request with an invalid `provider` and expect a `400 Bad Request` error.
  - Send a `GET` request for a provider for which the user has not configured an API key and expect a `400 Bad Request` error.

## History Endpoints

### `PATCH /api/history/email/{id}`

- **Success:**
  - Send a `PATCH` request with a valid `status`.
  - Expect a `200 OK` response with the updated email message's `id`, `status`, and `updatedAt`.
  - Verify that the email message's status has been updated in the database.
- **Failure:**
  - Send a `PATCH` request with an invalid `status` and expect a `400 Bad Request` error.
  - Try to update an email message that belongs to another user and expect a `404 Not Found` error.

### `DELETE /api/history/email/{id}`

- **Success:**
  - Send a `DELETE` request for an email message.
  - Expect a `200 OK` response with a success message.
  - Verify that the email message has been deleted from the database.
- **Failure:**
  - Try to delete an email message that belongs to another user and expect a `404 Not Found` error.

### `PATCH /api/history/linkedin/{id}`

- **Success:**
  - Send a `PATCH` request with a valid `status`.
  - Expect a `200 OK` response with the updated LinkedIn message's `id`, `status`, and `updatedAt`.
  - Verify that the LinkedIn message's status has been updated in the database.
- **Failure:**
  - Send a `PATCH` request with an invalid `status` and expect a `400 Bad Request` error.
  - Try to update a LinkedIn message that belongs to another user and expect a `404 Not Found` error.

### `DELETE /api/history/linkedin/{id}`

- **Success:**
  - Send a `DELETE` request for a LinkedIn message.
  - Expect a `200 OK` response with a success message.
  - Verify that the LinkedIn message has been deleted from the database.
- **Failure:**
  - Try to delete a LinkedIn message that belongs to another user and expect a `404 Not Found` error.

### `PATCH /api/history/cover-letter/{id}`

- **Success:**
  - Send a `PATCH` request with a valid `status`.
  - Expect a `200 OK` response with the updated cover letter's `id`, `status`, and `updatedAt`.
  - Verify that the cover letter's status has been updated in the database.
- **Failure:**
  - Send a `PATCH` request with an invalid `status` and expect a `400 Bad Request` error.
  - Try to update a cover letter that belongs to another user and expect a `404 Not Found` error.

### `DELETE /api/history/cover-letter/{id}`

- **Success:**
  - Send a `DELETE` request for a cover letter.
  - Expect a `200 OK` response with a success message.
  - Verify that the cover letter has been deleted from the database.
- **Failure:**
  - Try to delete a cover letter that belongs to another user and expect a `404 Not Found` error.

## Other Endpoints

I will continue to add more endpoints to this testing plan as I analyze them.
The next endpoints to analyze are:
- `app/api/history/linkedin/[id]/route.ts`
- `app/api/history/cover-letter/[id]/route.ts`
- `app/api/settings/prompts/route.ts`
- `app/api/history/route.ts`
- `app/api/history/export/route.ts`
- `app/api/generate/email/route.ts`
- `app/api/generate/linkedin/route.ts`
- `app/api/generate/cover-letter/route.ts`
- `app/api/settings/preferences/route.ts`
- `app/api/settings/resumes/default/route.ts`
