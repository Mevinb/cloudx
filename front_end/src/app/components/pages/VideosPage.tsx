import React, { useState, useEffect } from 'react';
import { videosAPI, Video } from '@/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Trash2, Plus, Play, Loader2, Search, X, Youtube, HardDrive } from 'lucide-react';

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
    videoSource: 'youtube' as 'youtube' | 'gdrive'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Selected video for playback
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch videos
  const fetchVideos = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await videosAPI.getAll({ search });
      setVideos(response.data);
    } catch (err) {
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

    if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
      setFormError(`Title and ${formData.videoSource === 'youtube' ? 'YouTube' : 'Google Drive'} URL are required`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await videosAPI.add(formData);
      setVideos([response.data, ...videos]);
      setFormData({ title: '', youtubeUrl: '', description: '', videoSource: 'youtube' });
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
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'Add Video'}
          </Button>
        )}
      </div>

      {/* Add Video Form */}
      {showForm && isTeacherOrAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Video</CardTitle>
            <CardDescription>
              Add a video from YouTube or Google Drive to the learning library
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  onValueChange={(value: 'youtube' | 'gdrive') => 
                    setFormData({ ...formData, videoSource: value })
                  }
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
          </CardContent>
        </Card>
      )}

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
                    {video.videoId?.startsWith('gdrive_') ? (
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
