import React, { useState } from 'react';
import { X, Upload, FileText, Video, Presentation, Link as LinkIcon, Save, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import api, { uploadAPI } from '@/services/api';

interface UploadContentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadContentDialog: React.FC<UploadContentDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    topic: '',
    url: '',
    embedUrl: '',
    duration: '',
    pageCount: '',
    slideCount: '',
    tags: '',
    accessLevel: 'members',
    useFileUpload: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const contentTypes = [
    { value: 'video', label: 'Video Tutorial', icon: Video },
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'slides', label: 'Presentation Slides', icon: Presentation },
    { value: 'document', label: 'Document', icon: File },
    { value: 'link', label: 'External Link', icon: LinkIcon },
  ];

  const topics = [
    'Cloud Computing',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Database',
    'Security',
    'AI/ML',
    'Data Science',
    'Networking',
    'Programming Fundamentals',
    'Other'
  ];

  const accessLevels = [
    { value: 'all', label: 'Everyone (Public)' },
    { value: 'members', label: 'Club Members Only' },
    { value: 'teachers', label: 'Teachers Only' },
    { value: 'admin', label: 'Admins Only' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Content type is required';
    }
    if (!formData.topic) {
      newErrors.topic = 'Topic is required';
    }
    
    if (formData.useFileUpload) {
      if (!selectedFile) {
        newErrors.file = 'Please select a file to upload';
      }
    } else {
      if (!formData.url.trim()) {
        newErrors.url = 'URL or link is required';
      }
      // Type-specific validations
      if (formData.type === 'video' && formData.embedUrl && !isValidUrl(formData.embedUrl)) {
        newErrors.embedUrl = 'Please enter a valid URL';
      }
      if (!isValidUrl(formData.url)) {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setUploadProgress(0);

      let contentUrl = formData.url.trim();

      // Handle file upload
      if (formData.useFileUpload && selectedFile) {
        const isVideo = formData.type === 'video';
        const uploadResult: any = isVideo 
          ? await uploadAPI.uploadVideo(selectedFile, (progress) => setUploadProgress(progress))
          : await uploadAPI.uploadImage(selectedFile);
        contentUrl = uploadResult.url;
      }

      const contentData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        topic: formData.topic,
        url: contentUrl,
        accessLevel: formData.accessLevel,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
      };

      // Add type-specific fields
      if (formData.type === 'video') {
        if (formData.embedUrl) contentData.embedUrl = formData.embedUrl.trim();
        if (formData.duration) contentData.duration = formData.duration.trim();
      }
      if (formData.type === 'pdf' && formData.pageCount) {
        contentData.pageCount = parseInt(formData.pageCount);
      }
      if (formData.type === 'slides' && formData.slideCount) {
        contentData.slideCount = parseInt(formData.slideCount);
      }

      await api.content.create(contentData);

      alert('Content uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        topic: '',
        url: '',
        embedUrl: '',
        duration: '',
        pageCount: '',
        slideCount: '',
        tags: '',
        accessLevel: 'members',
        useFileUpload: false
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to upload content:', error);
      alert(error.message || 'Failed to upload content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        topic: '',
        url: '',
        embedUrl: '',
        duration: '',
        pageCount: '',
        slideCount: '',
        tags: '',
        accessLevel: 'members',
        useFileUpload: false
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setErrors({});
      onClose();
    }
  };

  const getTypeIcon = () => {
    const typeData = contentTypes.find(t => t.value === formData.type);
    return typeData ? <typeData.icon className="w-5 h-5" /> : <File className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload Learning Content
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Add videos, documents, or external resources for students
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Content Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Introduction to AWS Cloud Computing"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn from this content..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Topic and Access Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.topic} onValueChange={(value) => handleSelectChange('topic', value)}>
                <SelectTrigger className={errors.topic ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topic && <p className="text-sm text-red-500">{errors.topic}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={formData.accessLevel} onValueChange={(value) => handleSelectChange('accessLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Method Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="useFileUpload"
              checked={formData.useFileUpload}
              onChange={(e) => {
                setFormData({ ...formData, useFileUpload: e.target.checked });
                setSelectedFile(null);
                setErrors({});
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="useFileUpload" className="cursor-pointer">
              Upload file from my computer instead of providing a URL
            </Label>
          </div>

          {/* File Upload or URL */}
          {formData.useFileUpload ? (
            <div className="space-y-2">
              <Label htmlFor="file">
                {formData.type === 'video' ? 'Video File' : 
                 formData.type === 'pdf' ? 'PDF File' :
                 formData.type === 'slides' ? 'Presentation File' :
                 'File'} <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Input
                  id="file"
                  type="file"
                  accept={
                    formData.type === 'video' ? 'video/*' :
                    formData.type === 'pdf' ? 'application/pdf' :
                    formData.type === 'slides' ? '.ppt,.pptx,.key' :
                    'image/*,application/pdf,.doc,.docx'
                  }
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isSaving}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to select a file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'video' ? 'MP4, MOV, AVI, etc. (Max 100MB)' :
                     formData.type === 'pdf' ? 'PDF files only' :
                     formData.type === 'slides' ? 'PPT, PPTX, KEY files' :
                     'Images and documents'}
                  </p>
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
              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">
                {formData.type === 'video' ? 'Video URL' : 
                 formData.type === 'link' ? 'Link URL' : 
                 'File URL'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder={
                  formData.type === 'video' ? 'https://example.com/video.mp4' :
                  formData.type === 'link' ? 'https://external-resource.com' :
                  'https://example.com/document.pdf'
                }
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
              <p className="text-xs text-gray-500">
                {formData.type === 'video' ? 'Direct link to video file or YouTube/Vimeo URL' :
                 formData.type === 'link' ? 'URL to external resource' :
                 'Direct link to the file (PDF, PPT, etc.)'}
              </p>
            </div>
          )}

          {/* Type-specific fields */}
          {formData.type === 'video' && !formData.useFileUpload && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="embedUrl">Embed URL (Optional)</Label>
                <Input
                  id="embedUrl"
                  name="embedUrl"
                  type="url"
                  value={formData.embedUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/embed/..."
                  className={errors.embedUrl ? 'border-red-500' : ''}
                />
                {errors.embedUrl && <p className="text-sm text-red-500">{errors.embedUrl}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 15:30 or 1h 30m"
                />
              </div>
            </div>
          )}

          {formData.type === 'pdf' && (
            <div className="space-y-2">
              <Label htmlFor="pageCount">Number of Pages</Label>
              <Input
                id="pageCount"
                name="pageCount"
                type="number"
                value={formData.pageCount}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                min="1"
              />
            </div>
          )}

          {formData.type === 'slides' && (
            <div className="space-y-2">
              <Label htmlFor="slideCount">Number of Slides</Label>
              <Input
                id="slideCount"
                name="slideCount"
                type="number"
                value={formData.slideCount}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                min="1"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., cloud, aws, tutorial, beginner"
            />
            <p className="text-xs text-gray-500">Add tags to help students find this content</p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Uploading...' : 'Upload Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
