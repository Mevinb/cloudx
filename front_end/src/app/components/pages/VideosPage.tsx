import React, { useState, useEffect } from 'react';
import { videosAPI, Video, uploadAPI } from '@/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Trash2, Plus, Play, Loader2, Search, X, Youtube, HardDrive, Upload } from 'lucide-react';

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for adding videos
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    youtubeUrl: '', 
    description: '', 
    videoSource: 'youtube' as 'youtube' | 'gdrive' | 'upload'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Selected video for playback
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch videos
  const fetchVideos = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (search && search.trim()) {
        params.search = search;
      }
      const response = await videosAPI.getAll(params);
      console.log('Videos API Response:', response);
      console.log('Videos data:', response.data);
      setVideos(response.data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(searchQuery);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (formData.videoSource === 'upload') {
      if (!selectedFile) {
        setFormError('Please select a video file to upload');
        return;
      }
    } else if (!formData.youtubeUrl.trim()) {
      setFormError(`${formData.videoSource === 'youtube' ? 'YouTube' : 'Google Drive'} URL is required`);
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(0);

      let videoUrl = formData.youtubeUrl;

      // Handle file upload
      if (formData.videoSource === 'upload' && selectedFile) {
        const uploadResult: any = await uploadAPI.uploadVideo(
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
        videoUrl = uploadResult.url;
      }

      const response = await videosAPI.add({
        ...formData,
        youtubeUrl: videoUrl
      });
      setVideos([response.data, ...videos]);
      setFormData({ title: '', youtubeUrl: '', description: '', videoSource: 'youtube' });
      setSelectedFile(null);
      setUploadProgress(0);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await videosAPI.delete(id);
      setVideos(videos.filter(v => v._id !== id));
      if (selectedVideo?._id === id) {
        setSelectedVideo(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Videos</h1>
          <p className="text-gray-600 mt-1">Watch educational videos from YouTube</p>
        </div>
        
        {isTeacherOrAdmin && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        )}
      </div>

      {/* Add Video Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
            <DialogDescription>
              Add a video from YouTube or Google Drive to the learning library
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="videoSource">Video Source</Label>
                <Select 
                  value={formData.videoSource} 
                  onValueChange={(value: 'youtube' | 'gdrive' | 'upload') => {
                    setFormData({ ...formData, videoSource: value });
                    setSelectedFile(null);
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </div>
                    </SelectItem>
                    <SelectItem value="gdrive">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Google Drive
                      </div>
                    </SelectItem>
                    <SelectItem value="upload">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload File
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Cloud Computing"
                  disabled={submitting}
                />
              </div>
              
              {formData.videoSource === 'upload' ? (
                <div>
                  <Label htmlFor="file">Video File *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Input
                      id="file"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={submitting}
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to select a video file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI, etc. (Max 100MB)</p>
                    </label>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="url">
                    {formData.videoSource === 'youtube' ? 'YouTube URL' : 'Google Drive URL'} *
                  </Label>
                  <Input
                    id="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder={
                      formData.videoSource === 'youtube'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://drive.google.com/file/d/...'
                    }
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.videoSource === 'youtube' 
                      ? 'Supports youtube.com/watch, youtu.be, and embed links'
                      : 'Paste the shareable link from Google Drive. Make sure the video is set to "Anyone with the link can view"'
                    }
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the video content..."
                  rows={3}
                  disabled={submitting}
                />
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitting ? 'Adding...' : 'Add Video'}
              </Button>
            </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
          {searchQuery && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => { setSearchQuery(''); fetchVideos(); }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Selected Video Player */}
      {selectedVideo && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              {selectedVideo.videoId?.startsWith('uploaded_') ? (
                <video
                  src={selectedVideo.youtubeUrl}
                  title={selectedVideo.title}
                  className="w-full h-full rounded-t-lg"
                  controls
                  autoPlay
                />
              ) : (
                <iframe
                  src={
                    selectedVideo.videoId?.startsWith('gdrive_')
                      ? `https://drive.google.com/file/d/${selectedVideo.videoId.replace('gdrive_', '')}/preview`
                      : `https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`
                  }
                  title={selectedVideo.title}
                  className="w-full h-full rounded-t-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Added by {selectedVideo.addedBy?.name || 'Unknown'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && (
        <>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No videos yet</h3>
              <p className="text-gray-600">
                {isTeacherOrAdmin 
                  ? 'Add your first video to get started' 
                  : 'Videos will appear here once added by teachers'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Card 
                  key={video._id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video bg-gray-100">
                    {video.videoId?.startsWith('uploaded_') ? (
                      <img
                        src={video.youtubeUrl.replace('/video/upload/', '/video/upload/w_400,h_300,c_fill,q_auto/').replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient if thumbnail fails
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600"><svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg></div>';
                        }}
                      />
                    ) : video.videoId?.startsWith('gdrive_') ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                        <HardDrive className="h-16 w-16 text-white" />
                      </div>
                    ) : (
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    {video.videoId?.startsWith('uploaded_') && (
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        Uploaded
                      </div>
                    )}
                    {video.videoId?.startsWith('gdrive_') && (
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        Drive
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {video.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {video.addedBy?.name || 'Unknown'}
                      </span>
                      {isTeacherOrAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(video._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
