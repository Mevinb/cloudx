# Google Drive Video Integration

## Overview
The video section now supports both YouTube and Google Drive videos, allowing teachers to upload videos to Google Drive and share them in the learning platform.

## Changes Made

### Frontend (VideosPage.tsx)
1. **Video Source Selection**: Added dropdown to choose between YouTube and Google Drive
2. **Dynamic Form**: URL field and placeholder text change based on selected source
3. **Google Drive Icons**: Added HardDrive icon from lucide-react for visual distinction
4. **Thumbnail Display**: Google Drive videos show a gradient background with Drive icon instead of YouTube thumbnails
5. **Video Player**: iframe src automatically detects and uses correct embed URL:
   - YouTube: `https://www.youtube.com/embed/{videoId}`
   - Google Drive: `https://drive.google.com/file/d/{fileId}/preview`
6. **Source Badge**: Videos show a "Drive" badge in the top-right corner for Google Drive videos

### Backend (videoController.js)
1. **extractGoogleDriveId()**: New function to extract file IDs from various Google Drive URL formats:
   - `drive.google.com/file/d/FILE_ID/view`
   - `drive.google.com/open?id=FILE_ID`
   - `drive.google.com/uc?id=FILE_ID`
2. **Video Source Parameter**: Added `videoSource` parameter to addVideo endpoint
3. **ID Prefixing**: Google Drive file IDs are prefixed with `gdrive_` to distinguish them from YouTube IDs
4. **Improved Error Messages**: More descriptive error messages for invalid URLs

### Database Model (Video.js)
1. **Updated Comments**: Model now references both YouTube and Google Drive
2. **Smart Virtual Fields**:
   - `embedUrl`: Returns appropriate embed URL based on video source
   - `thumbnailUrl`: Returns YouTube thumbnail or null for Google Drive videos

## How to Use

### For Teachers:
1. Go to the Videos section
2. Click "Add Video" button
3. Select video source (YouTube or Google Drive)
4. For Google Drive:
   - Upload your video to Google Drive
   - Right-click the video → Share → Get link
   - Set permissions to "Anyone with the link can view"
   - Copy the shareable link
   - Paste it in the form
5. Fill in title and optional description
6. Click "Add Video"

### For Students:
- Google Drive videos are seamlessly integrated with YouTube videos
- Click any video thumbnail to play it
- Google Drive videos are indicated with a Drive icon badge

## Important Notes

### Google Drive Permissions
Videos must be shared with "Anyone with the link can view" permission for students to access them. Private videos will not be viewable.

### Supported URL Formats

**YouTube:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Google Drive:**
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/uc?id=FILE_ID`

## Technical Details

### Video ID Storage
- YouTube IDs: Stored as-is (11 character alphanumeric)
- Google Drive IDs: Stored with `gdrive_` prefix for identification

### Database Schema
No schema migration needed - existing `videoId` and `youtubeUrl` fields are reused:
- `videoId`: Stores either YouTube ID or `gdrive_{DRIVE_FILE_ID}`
- `youtubeUrl`: Stores the full URL (works for both sources)

### Frontend Detection
```typescript
// Check if video is from Google Drive
if (video.videoId?.startsWith('gdrive_')) {
  // Handle Google Drive video
} else {
  // Handle YouTube video
}
```

## Future Enhancements
- Auto-fetch video duration for Google Drive videos
- Generate custom thumbnails for Google Drive videos
- Support for other video platforms (Vimeo, etc.)
- Batch upload functionality
- Video analytics and view tracking
