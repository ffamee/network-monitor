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

### Mode 1: Add New Files (Create Mode)

#### Step 1: Import the Hook and Component

```tsx
import { usePresignedImageUpload } from "@/components/presigned-image/logic";
import { SmartImageInput } from "@/components/presigned-image/upload-box";
```

#### Step 2: Initialize the Hook in Your Form

```tsx
export function MyForm() {
  // Create uploader instance with concurrency limit (3 files at a time)
  const upload = usePresignedImageUpload(3);

  // Your other form logic (useActionState, etc.)...
}
```

#### Step 3: Create a Custom Submit Handler for Server Actions

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

#### Step 4: Add the Component to Your Form

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

### Mode 2: Update Existing Files (Edit Mode)

For edit/update forms, you need to handle both new files and removal of old files. The hook manages both new uploads AND deleted file tracking.

#### Step 1: Initialize Hook with Deletion Tracking

```tsx
import { usePresignedImageUpload } from "@/components/presigned-image/logic";
import { SmartImageInput } from "@/components/presigned-image/upload-box";

export function EditZoneForm({ existingZone }) {
  // ⭐️ Initialize uploader hook
  // It manages BOTH new file uploads AND tracks deleted files
  const upload = usePresignedImageUpload(3);

  // Your other form logic...
}
```

#### Step 2: Display Old Files Section with Delete Capability

```tsx
// Before the SmartImageInput, show existing files
<div className="space-y-4">
  <div>
    <label className="text-sm font-semibold text-secondary-foreground/70">
      Existing Images
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
      {existingZone.images?.map((imageKey: string) => {
        const isDeleted = upload.isImageMarkedForDeletion(imageKey);
        
        return (
          <div
            key={imageKey}
            className={`
              group relative flex flex-col p-3 rounded-md border transition-all duration-200
              ${
                isDeleted
                  ? "border-destructive/50 bg-destructive/5 dark:bg-destructive/10 opacity-60"
                  : "border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
              }
            `}
          >
            <div className="flex gap-3">
              {/* Image preview */}
              <div className="relative w-16 h-16 shrink-0 bg-muted rounded overflow-hidden border border-border">
                <Image
                  fill
                  src={getImageUrl(imageKey)}  // Your function to generate URL
                  alt="existing image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {getImageName(imageKey)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {isDeleted ? (
                    <span className="text-xs font-medium text-destructive flex items-center gap-0.5">
                      ❌ Marked for deletion
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                      ✓ Keep
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle delete button */}
            <button
              type="button"
              onClick={() => {
                upload.toggleDeleteImage(imageKey);
              }}
              className={`
                absolute -top-2 -right-2 p-1.5 rounded-full transition-all duration-200 border border-border
                ${
                  isDeleted
                    ? "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-destructive/10 hover:border-destructive/50 text-emerald-600 hover:text-destructive"
                    : "bg-card dark:bg-muted hover:bg-destructive/10 hover:border-destructive/50 text-muted-foreground hover:text-destructive"
                }
              `}
              title={isDeleted ? "Undo delete" : "Mark for deletion"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  </div>

  {/* New files uploader */}
  <div>
    <SmartImageInput
      uploader={upload}
      name="zone_images"
      label="Add New Images"
    />
  </div>
</div>
```

#### Step 3: Submit with Both New and Deleted Images

```tsx
import { startTransition, useActionState } from "react";

const [state, formAction, isPending] = useActionState(editZoneAction, null);

const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // ⭐️ Get newly uploaded files (same as create mode)
  const newImages = upload.getSubmitPayload();
  // Returns: [{ filename: "zones/abc/new_image.jpg" }, ...]

  // ⭐️ Get deleted images from hook (NOT separate state!)
  const deletedImages = upload.getDeletedImages();
  // Returns: ["zones/abc/old_image1.jpg", "zones/abc/old_image2.jpg"]

  // Get form data
  const form = e.currentTarget;
  const formData = new FormData(form);

  // ⭐️ Append new images
  formData.append("images", JSON.stringify(newImages));

  // ⭐️ Append deleted images from hook
  formData.append("deleted_images", JSON.stringify(deletedImages));

  // ⭐️ IMPORTANT: Call within startTransition when preventing default behavior
  startTransition(() => {
    formAction(formData);
  });
};
```

#### Step 4: Handle in Server Action

```tsx
"use server";

export async function editZone(formData: FormData) {
  // Parse new images
  const imagesJson = formData.get("images") as string;
  const newImages: { filename: string }[] = imagesJson ? JSON.parse(imagesJson) : [];

  // Parse deleted images
  const deletedImagesJson = formData.get("deleted_images") as string;
  const deletedImages: string[] = deletedImagesJson ? JSON.parse(deletedImagesJson) : [];

  const zoneId = formData.get("zoneId") as string;
  const name = formData.get("name") as string;

  // Extract filenames from new images
  const newImageFilenames = newImages.map(img => img.filename);

  // Update zone in database
  const currentZone = await db.zone.findUnique({ where: { id: zoneId } });
  
  // Keep old images that weren't deleted
  const keptImages = currentZone.images.filter(
    (img) => !deletedImages.includes(img)
  );

  // Combine kept + new images
  const allImages = [...keptImages, ...newImageFilenames];

  // Update database
  await db.zone.update({
    where: { id: zoneId },
    data: { images: allImages }
  });

  // Optional: Delete files from MinIO
  if (deletedImages.length > 0) {
    await deleteFromMinio(deletedImages);
  }

  return { success: true };
}
```

## Complete Real-World Examples

### Create Mode (Adding New Files)

See [src/app/(action)/add/zone/add-zone-form.tsx](src/app/(action)/add/zone/add-zone-form.tsx) for a full implementation with:
- ✅ `usePresignedImageUpload` hook initialization
- ✅ Custom `handleFormSubmit` that prevents default
- ✅ `startTransition` wrapper for server action calls
- ✅ `getSubmitPayload()` to extract successful uploads
- ✅ Form validation and error handling
- ✅ Loading states with `isPending`

**Key Pattern:**
```tsx
// ⭐️ Always use startTransition when preventing form default behavior
const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();  // Prevent default form submission

  const uploadedFiles = upload.getSubmitPayload();
  const formData = new FormData(e.currentTarget);
  formData.append("images", JSON.stringify(uploadedFiles));

  // ⭐️ REQUIRED: Wrap server action in startTransition
  startTransition(() => {
    formAction(formData);
  });
};
```

### Update Mode (Editing Existing Files)

For an edit form, use the same pattern as create mode but with deleted images:
- ✅ Display existing files with delete buttons
- ✅ Track deleted files via hook methods (not separate useState)
- ✅ Get both `images` and `deleted_images` from hook
- ✅ Submit both lists to backend
- ✅ Use `startTransition` for proper state handling

**Key Pattern:**
```tsx
// ⭐️ Same pattern as create mode, but also handle deleted images
const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();  // Prevent default form submission

  // Get new uploads from hook
  const newImages = upload.getSubmitPayload();

  // ⭐️ Get deleted images from hook (NOT separate state)
  const deletedImages = upload.getDeletedImages();

  const formData = new FormData(e.currentTarget);
  formData.append("images", JSON.stringify(newImages));
  formData.append("deleted_images", JSON.stringify(deletedImages));

  // ⭐️ REQUIRED: Wrap server action in startTransition
  startTransition(() => {
    formAction(formData);
  });
};
```

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

### Core Presigned URL Endpoint

Your backend must provide a MinIO presigned URL endpoint:

#### `POST ${NEXT_PUBLIC_BACKEND_URL}/minio/get-presigned-urls`

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

### Server Action Endpoints

#### Create Mode: Adding New Images

**FormData Payload:**
```
{
  "images": "[{\"filename\": \"zones/abc123/image1.jpg\"}]"
  // Other form fields: "name", "description", etc.
}
```

**Backend Implementation:**
```tsx
"use server";

export async function addZone(formData: FormData) {
  // Parse new images
  const imagesJson = formData.get("images") as string;
  const images: { filename: string }[] = imagesJson ? JSON.parse(imagesJson) : [];
  
  // Save zone with images
  await db.zone.create({
    data: {
      name: formData.get("name") as string,
      images: images.map(img => img.filename)
    }
  });

  return { success: true };
}
```

#### Update Mode: Updating Files with Deletions

**FormData Payload:**
```
{
  "images": "[{\"filename\": \"zones/abc123/new_image.jpg\"}]",
  "deleted_images": "[\"zones/abc123/old_image1.jpg\", \"zones/abc123/old_image2.jpg\"]",
  "zoneId": "zone-123"
  // Other updated fields: "name", "description", etc.
}
```

**Backend Implementation:**
```tsx
"use server";

export async function editZone(formData: FormData) {
  const zoneId = formData.get("zoneId") as string;

  // Parse new images
  const imagesJson = formData.get("images") as string;
  const newImages: { filename: string }[] = imagesJson 
    ? JSON.parse(imagesJson) 
    : [];

  // Parse deleted images
  const deletedImagesJson = formData.get("deleted_images") as string;
  const deletedImages: string[] = deletedImagesJson 
    ? JSON.parse(deletedImagesJson) 
    : [];

  // Get current zone
  const zone = await db.zone.findUnique({ where: { id: zoneId } });
  
  // Keep images that weren't deleted
  const keptImages = zone.images.filter(img => !deletedImages.includes(img));
  
  // Combine kept + new images
  const finalImages = [...keptImages, ...newImages.map(img => img.filename)];

  // Update zone
  await db.zone.update({
    where: { id: zoneId },
    data: {
      name: formData.get("name") as string,
      images: finalImages
    }
  });

  // Optional: Clean up deleted files from MinIO
  if (deletedImages.length > 0) {
    await minioClient.removeObjects("my-bucket", deletedImages);
  }

  return { success: true };
}
```

## Features

✅ **Dual Mode Support** - Works for both "Create" (add new) and "Update" (edit with deletions)
✅ **Drag & Drop Support** - Users can drag files directly onto the component
✅ **Concurrent Upload Limits** - Control how many files upload simultaneously (default: 3 via p-limit)
✅ **Real-time Progress Tracking** - Visual progress bar for each file (0-100%)
✅ **Status Indicators** - Shows pending, uploading, success, or error state with icons
✅ **File Removal** - Users can remove files at any stage (pending/uploading/uploaded)
✅ **Old File Management** - Display existing files with delete/undo capability in update mode
✅ **TypeScript Support** - Fully typed hooks and components
✅ **Server Action Integration** - Seamless integration with Next.js server actions via `startTransition`
✅ **Image Preview** - Thumbnail preview using `URL.createObjectURL` and Next.js Image
✅ **Responsive Design** - Mobile-friendly with adaptive UI (Info icon on mobile)
✅ **Error Handling** - Graceful error handling with retry capability

## Mode Comparison

| Feature | Create Mode | Update Mode |
|---------|-------------|-------------|
| **Display existing files** | ✗ | ✓ Shows old files with visual indicators |
| **Add new files** | ✓ | ✓ Same as create |
| **Remove new files** | ✓ | ✓ Same as create |
| **Delete old files** | N/A | ✓ Mark for deletion with undo capability |
| **FormData fields** | `images` | `images` + `deleted_images` |
| **Server logic** | Save directly | Keep old + new, delete marked ones |
| **MinIO cleanup** | Optional | Delete marked files from storage |

## Usage Decision Tree

```
Start: Building a form?
├─ Adding NEW content (no existing files)?
│  └─ Use CREATE MODE
│     ├─ Initialize: usePresignedImageUpload(3)
│     ├─ Add: <SmartImageInput uploader={upload} />
│     └─ Submit: formData.append("images", JSON.stringify(newFiles))
│
└─ Editing EXISTING content (has existing files)?
   └─ Use UPDATE MODE
      ├─ Display: Old files with delete buttons
      ├─ Initialize: usePresignedImageUpload(3) + useState(deletedImages)
      ├─ Add: <SmartImageInput uploader={upload} />
      └─ Submit: Both "images" (new) + "deleted_images" (marked for delete)
```

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

// ⭐️ NEW FILES (for create mode)
// Get all files (including pending/uploading/error states)
console.log(upload.files);

// Get only successful uploads for submission
const readyFiles = upload.getSubmitPayload();
// Returns: [{ filename: "zones/abc/img1.jpg" }, { filename: "zones/abc/img2.png" }]

// Remove a specific file by ID
upload.removeFile(fileId);

// ⭐️ DELETED IMAGES (for update mode)
// Get list of images marked for deletion
const deletedList = upload.getDeletedImages();
// Returns: ["zones/abc/old_image1.jpg", "zones/abc/old_image2.jpg"]

// Toggle deletion status of an image
upload.toggleDeleteImage("zones/abc/image.jpg");

// Check if a specific image is marked for deletion
const isMarked = upload.isImageMarkedForDeletion("zones/abc/image.jpg");
// Returns: boolean

// Clear all marked deletions
upload.clearDeletedImages();

// Reset everything (files + deleted images)
upload.reset();
```

## Data Flow Summary

### Create Mode (Adding New Files)

```
┌─────────────────────────────────────────┐
│ User selects new images                 │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Request presigned URLs from backend     │
│ POST /minio/get-presigned-urls          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Upload files to MinIO (concurrent)      │
│ [pending] → [uploading] → [success]     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ User submits form                       │
│ FormData.append("images", JSON.stringify)
│ ✓ New files only                        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Server action receives:                 │
│ {                                       │
│   images: [...]  // New file list       │
│ }                                       │
└──────────────┬──────────────────────────┘
               ↓
         Save to database
```

### Update Mode (Edit with Deletions)

```
┌─────────────────────────────────────────┐
│ Form loads with existing images         │
│ - Display old files with delete buttons │
│ - Show which files marked for deletion  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ User can:                               │
│ 1. Delete old files                     │
│ 2. Add new images (same as create)      │
│ 3. Undo deletions before submit         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ User submits form                       │
│ FormData.append("images", JSON.stringify)
│ FormData.append("deleted_images", ...) │
│ ✓ New files + deleted file list         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Server action receives:                 │
│ {                                       │
│   images: [...],         // New files   │
│   deleted_images: [...]  // Delete list │
│ }                                       │
└──────────────┬──────────────────────────┘
               ↓
    - Combine: kept + new images
    - Delete old files from MinIO
    - Update database

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

// Hook return type
type UsePresignedImageUploadReturn = {
  // File upload management
  files: UploadFile[];
  addFiles: (selected: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  getSubmitPayload: () => UploadedFile[];
  hasErrorFiles: () => boolean;
  
  // Deleted images management (for update mode)
  getDeletedImages: () => string[];           // Get list of marked deletions
  toggleDeleteImage: (imageKey: string) => void;  // Toggle deletion status
  isImageMarkedForDeletion: (imageKey: string) => boolean;  // Check if marked
  clearDeletedImages: () => void;             // Clear all marked deletions
  
  // Reset all state
  reset: () => void;
};
```
