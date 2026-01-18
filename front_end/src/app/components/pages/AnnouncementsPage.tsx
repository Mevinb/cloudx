import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, AlertCircle, Info, CheckCircle, Pin, Edit, Trash2, Search, X, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  console.log('AnnouncementsPage - User:', user);
  console.log('AnnouncementsPage - User Role:', user?.role);
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  console.log('AnnouncementsPage - isTeacherOrAdmin:', isTeacherOrAdmin);
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // Create/Edit announcement dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: 'General',
    isPinned: false,
    targetAudience: 'all',
    targetBatch: '',
    expiresAt: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await api.announcements.getAll();
      setAnnouncements((response as any).data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createFormData.title.trim() || !createFormData.content.trim()) {
      setFormError('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      const dataToSend = {
        ...createFormData,
        expiresAt: createFormData.expiresAt || undefined
      };
      
      if (selectedAnnouncement) {
        const response = await api.announcements.update(selectedAnnouncement._id, dataToSend);
        setAnnouncements(announcements.map(a => 
          a._id === selectedAnnouncement._id ? response.data : a
        ));
      } else {
        const response = await api.announcements.create(dataToSend);
        setAnnouncements([response.data, ...announcements]);
      }
      
      setShowCreateDialog(false);
      setSelectedAnnouncement(null);
      setCreateFormData({
        title: '',
        content: '',
        priority: 'normal',
        category: 'General',
        isPinned: false,
        targetAudience: 'all',
        targetBatch: '',
        expiresAt: ''
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await api.announcements.delete(id);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      alert('Failed to delete announcement');
    }
  };

  const handleTogglePin = async (announcement: any) => {
    try {
      const response = await api.announcements.update(announcement._id, {
        isPinned: !announcement.isPinned
      });
      setAnnouncements(announcements.map(a => 
        a._id === announcement._id ? response.data : a
      ));
    } catch (error) {
      alert('Failed to update pin status');
    }
  };

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
      case 'urgent':
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
      case 'urgent':
        return <Badge variant="destructive" className="animate-pulse">Urgent</Badge>;
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
      case 'Urgent':
        return 'bg-red-100 text-red-700';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const AnnouncementCard = ({ announcement }: { announcement: any }) => {
    const authorName = typeof announcement.author === 'string' 
      ? announcement.author 
      : announcement.author?.name || 'Unknown';

    const authorRole = typeof announcement.author === 'object' 
      ? announcement.author?.role 
      : announcement.authorRole || '';

    return (
      <Card className={`shadow-md hover:shadow-lg transition-shadow ${
        announcement.priority === 'urgent' || announcement.priority === 'high' 
          ? 'border-l-4 border-l-red-500' 
          : ''
      } ${announcement.isPinned ? 'bg-yellow-50 border-yellow-200' : ''}`}>
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getPriorityBadge(announcement.priority)}
                  <Badge variant="outline" className={getCategoryColor(announcement.category)}>
                    {announcement.category}
                  </Badge>
                  {announcement.targetAudience !== 'all' && (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      <Users className="w-3 h-3 mr-1" />
                      {announcement.targetAudience}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Expiry Notice */}
              {announcement.expiresAt && (
                <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expires: {formatDate(announcement.expiresAt)}
                </div>
              )}

              {/* Author and Date */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{authorName}</p>
                    <p className="text-xs text-gray-500 capitalize">{authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  
                  {/* Teacher actions */}
                  {isTeacherOrAdmin && user?.id === announcement.author?._id && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePin(announcement)}
                        className="h-8 w-8 p-0"
                        title={announcement.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className={`w-4 h-4 ${announcement.isPinned ? 'fill-yellow-600 text-yellow-600' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setCreateFormData({
                            title: announcement.title,
                            content: announcement.content,
                            priority: announcement.priority,
                            category: announcement.category,
                            isPinned: announcement.isPinned,
                            targetAudience: announcement.targetAudience,
                            targetBatch: announcement.targetBatch || '',
                            expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
                          });
                          setShowCreateDialog(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    let matches = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        a.title?.toLowerCase().includes(query) || 
        a.content?.toLowerCase().includes(query)
      );
    }

    if (filterCategory !== 'all') {
      matches = matches && a.category === filterCategory;
    }

    if (filterPriority !== 'all') {
      matches = matches && a.priority === filterPriority;
    }

    return matches;
  });

  // Separate pinned and regular announcements
  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

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
        {isTeacherOrAdmin && (
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => {
              setSelectedAnnouncement(null);
              setCreateFormData({
                title: '',
                content: '',
                priority: 'normal',
                category: 'General',
                isPinned: false,
                targetAudience: 'all',
                targetBatch: '',
                expiresAt: ''
              });
              setShowCreateDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
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
                <p className="text-sm text-gray-600 mb-1">Urgent</p>
                <p className="text-3xl font-bold text-red-600">
                  {announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
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

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Events</p>
                <p className="text-3xl font-bold text-purple-600">
                  {announcements.filter(a => a.category === 'Event').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Resources">Resources</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Pinned Announcements</h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-xl font-bold text-gray-900">Recent Announcements</h2>
        )}
        {regularAnnouncements.length > 0 ? (
          regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))
        ) : filteredAnnouncements.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No announcements found</p>
              {isTeacherOrAdmin && (
                <p className="text-sm text-gray-500 mt-2">Be the first to post an announcement!</p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? 'Edit Announcement' : 'Post New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            {formError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                {formError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                placeholder="e.g., Important: Club Meeting Tomorrow"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={createFormData.content}
                onChange={(e) => setCreateFormData({ ...createFormData, content: e.target.value })}
                placeholder="Write your announcement here..."
                rows={6}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={createFormData.category} 
                  onValueChange={(value) => setCreateFormData({ ...createFormData, category: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Resources">Resources</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={createFormData.priority} 
                  onValueChange={(value) => setCreateFormData({ ...createFormData, priority: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select 
                  value={createFormData.targetAudience} 
                  onValueChange={(value) => setCreateFormData({ ...createFormData, targetAudience: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="batch">Specific Batch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createFormData.targetAudience === 'batch' && (
                <div className="space-y-2">
                  <Label htmlFor="targetBatch">Batch Name</Label>
                  <Input
                    id="targetBatch"
                    value={createFormData.targetBatch}
                    onChange={(e) => setCreateFormData({ ...createFormData, targetBatch: e.target.value })}
                    placeholder="e.g., 2024-A"
                    disabled={submitting}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={createFormData.expiresAt}
                onChange={(e) => setCreateFormData({ ...createFormData, expiresAt: e.target.value })}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500">
                Announcement will be automatically hidden after this date
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isPinned"
                checked={createFormData.isPinned}
                onChange={(e) => setCreateFormData({ ...createFormData, isPinned: e.target.checked })}
                className="rounded"
                disabled={submitting}
              />
              <Label htmlFor="isPinned" className="cursor-pointer">
                Pin this announcement to the top
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (selectedAnnouncement ? 'Update Announcement' : 'Post Announcement')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
