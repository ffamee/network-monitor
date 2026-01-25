# Image Upload Component Integration Guide

## Overview
This guide explains how to integrate the drag-and-drop image uploader component into your forms using presigned URLs and concurrent upload management with MinIO.

## Architecture

### Core Components

1. **`usePresignedImageUpload` Hook** (`src/components/presigned-image/logic.tsx`)
   - Manages upload state and file metadata
   - Requests presigned URLs from backend endpoint: `${NEXT_PUBLIC_BACKEND_URL}/minio/get-presigned-urls`
   - Handles concurrent uploads using `p-limit` (default 3 files at a time)
   - Tracks progress for each file (pending → uploading → success/error)
   - Returns successful uploads via `getSubmitPayload()` as array of `{ filename: string }`

2. **`SmartImageInput` Component** (`src/components/presigned-image/upload-box.tsx`)
   - Drag-and-drop UI with image preview
   - Integrates with the uploader hook
   - Shows upload progress, status badges (pending/uploading/success/error)
   - Allows users to remove files (even after successful upload)
   - Fully responsive with mobile-friendly design
   - Exportable for reuse in any form

## How to Use

### Step 1: Import the Hook and Component

```tsx
import { usePresignedImageUpload } from "@/components/presigned-image/logic";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
```

### Step 2: Initialize the Hook in Your Form

```tsx
export function MyForm() {
  // Create uploader instance with concurrency limit (3 files at a time)
  const upload = usePresignedImageUpload(3);

  // Your other form logic (useActionState, etc.)...
}
```

### Step 3: Create a Custom Submit Handler for Server Actions

**Important:** When using Next.js server actions with `useActionState`, you must:
1. Wrap the action call in `startTransition()`
2. Bundle uploaded files as a JSON string in FormData

```tsx
import { startTransition, useActionState } from "react";

const [state, formAction, isPending] = useActionState(yourServerAction, null);

const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Get all successfully uploaded files
  const uploadedFiles = upload.getSubmitPayload();
  // Returns: [{ filename: "path/to/file1.jpg" }, { filename: "path/to/file2.png" }, ...]

  // Get form data
  const form = e.currentTarget;
  const formData = new FormData(form);

  // ⭐️ Bundle file data as JSON string
  // This makes parsing easier on the server side
  formData.append("images", JSON.stringify(uploadedFiles));

  // ⭐️ Call server action within startTransition
  // This is required for proper state updates with useActionState
  startTransition(() => {
    formAction(formData);
  });
};
```

### Step 4: Add the Component to Your Form

```tsx
<form onSubmit={handleFormSubmit}>
  {/* Your other fields (name, description, etc.) */}

  <SmartImageInput
    uploader={upload}
    name="zone_images"
    label="Zone Images / Floor Plans"
  />

  <button type="submit" disabled={isPending}>
    {isPending ? "Saving..." : "Submit"}
  </button>
</form>
```

## Complete Real-World Example

See [src/app/(action)/add/zone/add-zone-form.tsx](src/app/(action)/add/zone/add-zone-form.tsx) for a full implementation with:
- ✅ `useActionState` for server action state management
- ✅ `startTransition` for proper action invocation
- ✅ JSON bundling of uploaded files
- ✅ Form validation and error handling
- ✅ Loading states with `isPending`

### Example Implementation Pattern

```tsx
"use client";

import { startTransition, useActionState } from "react";
import { usePresignedImageUpload } from "@/components/presigned-image/logic";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
import { myServerAction } from "@/actions/my-action";

export function MyForm() {
  // Initialize uploader with concurrency limit
  const upload = usePresignedImageUpload(3);

  // Setup server action state
  const [state, formAction, isPending] = useActionState(myServerAction, null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const uploadedFiles = upload.getSubmitPayload();
    const formData = new FormData(e.currentTarget);

    // Bundle images as JSON
    formData.append("images", JSON.stringify(uploadedFiles));

    // Invoke action in transition
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <fieldset disabled={isPending}>
        {/* Your form fields */}
        <input name="name" required />

        {/* Image uploader */}
        <SmartImageInput
          uploader={upload}
          name="images"
          label="Upload Images"
        />

        <button type="submit">
          {isPending ? "Saving..." : "Submit"}
        </button>
      </fieldset>
    </form>
  );
}
```

## API Requirements

Your backend must provide a MinIO presigned URL endpoint:

### `POST ${NEXT_PUBLIC_BACKEND_URL}/minio/get-presigned-urls`

**Request Body:**
```json
[
  { "name": "image1.jpg", "type": "image/jpeg" },
  { "name": "image2.png", "type": "image/png" }
]
```

**Response:**
```json
[
  {
    "url": "https://minio.example.com/bucket/file1.jpg?X-Amz-Algorithm=...",
    "key": "zones/abc123/image1.jpg",
    "originalName": "image1.jpg"
  },
  {
    "url": "https://minio.example.com/bucket/file2.png?X-Amz-Algorithm=...",
    "key": "zones/abc123/image2.png",
    "originalName": "image2.png"
  }
]
```

**Critical Requirements:**
- ✅ Response array **must be in the same order** as the request
- ✅ Each `url` must be a valid presigned PUT URL for MinIO
- ✅ The `key` is the object path that will be stored in MinIO
- ✅ If any URL generation fails, return `null` for that item (handled gracefully)

## Features

✅ **Drag & Drop Support** - Users can drag files directly onto the component
✅ **Concurrent Upload Limits** - Control how many files upload simultaneously (default: 3 via p-limit)
✅ **Real-time Progress Tracking** - Visual progress bar for each file (0-100%)
✅ **Status Indicators** - Shows pending, uploading, success, or error state with icons
✅ **File Removal** - Users can remove files at any stage (pending/uploading/uploaded)
✅ **TypeScript Support** - Fully typed hooks and components
✅ **Server Action Integration** - Seamless integration with Next.js server actions via `startTransition`
✅ **Image Preview** - Thumbnail preview using `URL.createObjectURL` and Next.js Image
✅ **Responsive Design** - Mobile-friendly with adaptive UI (Info icon on mobile)
✅ **Error Handling** - Graceful error handling with retry capability

## File States & Lifecycle

```
User selects file
      ↓
[pending] - Waiting for presigned URL from backend
      ↓
[uploading] - Uploading to MinIO with progress tracking (0-100%)
      ↓
[success] - Upload complete, file included in getSubmitPayload()
      ↓
[removed] - User can remove at any stage

OR

[error] - Upload failed (network error, presigned URL failed, etc.)
```

### State Descriptions

- **`pending`** - File selected, waiting for presigned URL response from backend
- **`uploading`** - File is being uploaded to MinIO, showing progress percentage
- **`success`** - File successfully uploaded, ready for form submission
- **`error`** - Upload failed (can be removed and user can retry by re-adding)

## Customization

### Change Concurrency Limit
```tsx
// Upload up to 5 files simultaneously instead of default 3
const upload = usePresignedImageUpload(5);
```

### Change Component Label and Name
```tsx
<SmartImageInput
  uploader={upload}
  name="floor_plans"           // FormData field name
  label="Upload Floor Plans"    // Display label
/>
```

### Access File Data from Hook
```tsx
const upload = usePresignedImageUpload(3);

// Get all files (including pending/uploading/error states)
console.log(upload.files);

// Get only successful uploads for submission
const readyFiles = upload.getSubmitPayload();
// Returns: [{ filename: "zones/abc/img1.jpg" }, { filename: "zones/abc/img2.png" }]

// Remove a specific file by ID
upload.removeFile(fileId);

// Reset all files
upload.reset();
```

## Handling Uploaded Files in Server Action

The uploader sends all file data as a **JSON string** in the `images` field of FormData for easy parsing.

```tsx
"use server";

export async function addZone(formData: FormData) {
  // Parse the JSON string to get file list
  const imagesJson = formData.get("images") as string;
  const images: { filename: string }[] = imagesJson ? JSON.parse(imagesJson) : [];

  // Extract just the filenames
  const filenames = images.map(img => img.filename);
  // Example: ["zones/abc123/photo1.jpg", "zones/abc123/photo2.png"]

  // Get other form fields
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Process your data (save to database, etc.)
  await db.zone.create({
    data: {
      name,
      description,
      images: filenames, // Store array of MinIO keys
    }
  });

  return { success: true };
}
```

### Alternative: Individual FormData Entries

If you prefer individual entries instead of JSON (modify the submit handler):

```tsx
// In your form component
uploadedFiles.forEach((file, index) => {
  formData.append(`image_${index}`, file.filename);
});

// In server action
const image0 = formData.get("image_0") as string;
const image1 = formData.get("image_1") as string;
// etc...
```

**Recommended:** Use JSON bundling (default approach) for cleaner code and easier scaling.

## Environment Variables

Ensure you have the backend URL configured:

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

The uploader will call: `${NEXT_PUBLIC_BACKEND_URL}/minio/get-presigned-urls`

## Cleanup & Lifecycle Management

### Temporary Upload Bucket
- Files are uploaded to a **temporary MinIO bucket** immediately upon selection
- Use MinIO lifecycle policies to auto-delete unconfirmed uploads after 24-48 hours
- When form is submitted successfully, move files from temp bucket to permanent storage

### User Removes Files
- If user clicks the "X" button on an uploaded file, it's **removed from the component state only**
- The file remains in MinIO temp bucket until lifecycle cleanup occurs
- This prevents accidental data loss and simplifies logic

### Recommended Flow
```
1. User uploads → Files go to temp bucket (e.g., "temp-uploads/")
2. User submits form → Server moves files to permanent bucket (e.g., "zones/")
3. Server deletes from temp bucket (or let lifecycle policy handle it)
4. If user abandons form → Lifecycle policy cleans up after 24h
```

## Troubleshooting

### Issue: "No presigned info for file X"
- **Cause:** Backend returned `null` for a file in the presigned URL array
- **Fix:** Check backend logs, ensure MinIO credentials are correct

### Issue: Upload stuck at 0% or "pending"
- **Cause:** Backend endpoint not responding or CORS issues
- **Fix:** Check `NEXT_PUBLIC_BACKEND_URL` and backend CORS configuration

### Issue: Files upload but form submission doesn't include them
- **Cause:** Forgot to call `getSubmitPayload()` or append to FormData
- **Fix:** Ensure you're calling `upload.getSubmitPayload()` and appending as JSON

### Issue: useActionState not updating after submission
- **Cause:** Server action not called within `startTransition()`
- **Fix:** Wrap `formAction(formData)` in `startTransition(() => { ... })`

### Issue: Multiple files fail immediately
- **Cause:** Concurrency limit too high, network congestion, or MinIO rate limiting
- **Fix:** Reduce concurrency limit: `usePresignedImageUpload(2)` or check backend logs

## Dependencies

Required npm packages:
```bash
pnpm install axios p-limit uuid
```

```json
{
  "dependencies": {
    "axios": "^1.x.x",
    "p-limit": "^5.x.x",
    "uuid": "^10.x.x",
    "lucide-react": "^0.x.x"  // For icons
  }
}
```

## TypeScript Types

```tsx
// From logic.tsx
export type UploadStatus = "pending" | "uploading" | "success" | "error";

export type UploadFile = {
  id: string;              // Unique ID (UUID)
  name: string;            // Original filename
  sizeMB: number;          // File size in MB
  file: File;              // Original File object
  preview: string;         // Object URL for preview
  status: UploadStatus;    // Current status
  progress: number;        // Upload progress (0-100)
  s3Key: string | null;    // MinIO object key
  uploadedUrl: string | null; // Full MinIO URL (without query params)
};

// Return type of getSubmitPayload()
type UploadedFile = {
  filename: string;  // The MinIO key (s3Key)
};
```
