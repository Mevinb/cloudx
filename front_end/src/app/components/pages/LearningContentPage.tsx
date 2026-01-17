import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Presentation, Plus, Search, Filter, Download, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const LearningContentPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await api.content.getAll();
        setContentItems(response.data || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        setContentItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning content...</p>
        </div>
      </div>
    );
  }

  // Handle video watch
  const handleWatchVideo = (item: any) => {
    // Open video in new tab or modal
    alert(`Opening video: ${item.title}\n\nNote: Video URL would be fetched from database in production.`);
    // In production: window.open(item.videoUrl, '_blank');
  };

  // Handle download
  const handleDownload = (item: any) => {
    // Download file
    alert(`Downloading: ${item.title}\n\nNote: File URL would be fetched from database in production.`);
    // In production: 
    // const link = document.createElement('a');
    // link.href = item.fileUrl;
    // link.download = item.title;
    // link.click();
  };

  // Handle view details
  const handleViewDetails = (item: any) => {
    const uploadedBy = typeof item.uploadedBy === 'string' ? item.uploadedBy : item.uploadedBy?.name || 'Unknown';
    const uploadDate = item.uploadDate || new Date(item.createdAt).toLocaleDateString();
    alert(`Viewing details for: ${item.title}\n\nType: ${item.type}\nTopic: ${item.topic}\nDescription: ${item.description}\nUploaded by: ${uploadedBy}\nDate: ${uploadDate}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'slides':
        return <Presentation className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'slides':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const ContentCard = ({ item }: { item: any }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Type Icon */}
          <div className={`p-3 ${getTypeColor(item.type)} rounded-xl flex-shrink-0`}>
            {getTypeIcon(item.type)}
          </div>

          {/* Content Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Badge variant="outline">{item.topic}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
              <span>By {typeof item.uploadedBy === 'string' ? item.uploadedBy : item.uploadedBy?.name || 'Unknown'}</span>
              <span>•</span>
              <span>{item.uploadDate || new Date(item.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              {item.duration && <span>{item.duration}</span>}
              {item.pages && <span>{item.pages} pages</span>}
              {item.slides && <span>{item.slides} slides</span>}
              {item.views && (
                <>
                  <span>•</span>
                  <span>{item.views} views</span>
                </>
              )}
              {item.downloads && (
                <>
                  <span>•</span>
                  <span>{item.downloads} downloads</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {item.type === 'video' ? (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => handleWatchVideo(item)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => handleDownload(item)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => handleViewDetails(item)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Learning Content
          </h1>
          <p className="text-gray-600 mt-1">Access videos, documents, and presentations</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Upload Content
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900">{contentItems.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Video Tutorials</p>
                <p className="text-3xl font-bold text-gray-900">
                  {contentItems.filter(i => i.type === 'video').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Documents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {contentItems.filter(i => i.type === 'pdf' || i.type === 'slides').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Topic
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="pdf">PDFs</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No content found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  );
};
