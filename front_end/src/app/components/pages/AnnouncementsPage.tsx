import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, AlertCircle, Info, CheckCircle, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await api.announcements.getAll();
        setAnnouncements(response.data || []);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-orange-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Medium Priority</Badge>;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Event':
        return 'bg-purple-100 text-purple-700';
      case 'Assignment':
        return 'bg-orange-100 text-orange-700';
      case 'Resources':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AnnouncementCard = ({ announcement }: { announcement: any }) => (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${
      announcement.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
    } ${announcement.pinned ? 'bg-yellow-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Priority Icon */}
          <div className="flex-shrink-0">
            {getPriorityIcon(announcement.priority)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {announcement.pinned && (
                    <Pin className="w-4 h-4 text-yellow-600" />
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                </div>
                <p className="text-gray-700">{announcement.content}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getPriorityBadge(announcement.priority)}
                <Badge variant="outline" className={getCategoryColor(announcement.category)}>
                  {announcement.category}
                </Badge>
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                    {getInitials(typeof announcement.author === 'string' ? announcement.author : announcement.author?.name || 'Unknown')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {typeof announcement.author === 'string' ? announcement.author : announcement.author?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {announcement.authorRole || (typeof announcement.author === 'object' ? announcement.author?.role : '')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {announcement.date || new Date(announcement.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {announcement.timestamp || new Date(announcement.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter(a => a.pinned);
  const regularAnnouncements = announcements.filter(a => !a.pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with club news and events</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Announcements</p>
                <p className="text-3xl font-bold text-gray-900">{announcements.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Megaphone className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">High Priority</p>
                <p className="text-3xl font-bold text-red-600">
                  {announcements.filter(a => a.priority === 'high').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pinned</p>
                <p className="text-3xl font-bold text-yellow-600">{pinnedAnnouncements.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Pin className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Pinned Announcements</h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-xl font-bold text-gray-900">Recent Announcements</h2>
        )}
        {regularAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </div>
  );
};
