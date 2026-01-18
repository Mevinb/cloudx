import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Upload, Eye, Edit, Trash2, Users, Calendar, Award, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create assignment dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: 100,
    topic: '',
    submissionType: 'any',
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    maxLateDay: 7
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // View submissions dialog
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Grade submission dialog
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: '' });
  const [grading, setGrading] = useState(false);
  
  // Student submission dialog
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitData, setSubmitData] = useState({ content: '', submissionLink: '' });
  const [submittingWork, setSubmittingWork] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await api.assignments.getAll();
      const data = (response as any).data || [];
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createFormData.title.trim() || !createFormData.description.trim() || !createFormData.dueDate) {
      setFormError('Title, description, and due date are required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.assignments.create(createFormData);
      setAssignments([response.data, ...assignments]);
      setShowCreateDialog(false);
      setCreateFormData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        points: 100,
        topic: '',
        submissionType: 'any',
        allowLateSubmission: true,
        lateSubmissionPenalty: 10,
        maxLateDay: 7
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await api.assignments.delete(id);
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (error) {
      alert('Failed to delete assignment');
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      setLoadingSubmissions(true);
      const response = await api.assignments.getSubmissions(assignmentId);
      setSubmissions((response as any).data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleViewSubmissions = (assignment: any) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment._id);
    setShowSubmissionsDialog(true);
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      await api.assignments.gradeSubmission(selectedSubmission._id, gradeData);
      setShowGradeDialog(false);
      // Refresh submissions
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment._id);
      }
      setGradeData({ score: 0, feedback: '' });
    } catch (error) {
      alert('Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!submitData.content.trim() && !submitData.submissionLink.trim()) {
      alert('Please provide either submission text or a link');
      return;
    }

    try {
      setSubmittingWork(true);
      await api.assignments.submit(selectedAssignment._id, submitData);
      setShowSubmitDialog(false);
      setSubmitData({ content: '', submissionLink: '' });
      // Refresh assignments to update submission status
      fetchAssignments();
    } catch (error) {
      alert('Failed to submit assignment');
    } finally {
      setSubmittingWork(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (submission?: any) => {
    if (!submission) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <Clock className="w-3 h-3 mr-1" />
        Not Submitted
      </Badge>;
    }
    
    if (submission.status === 'graded') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Graded
      </Badge>;
    }
    
    if (submission.isLate) {
      return <Badge variant="destructive">
        <AlertCircle className="w-3 h-3 mr-1" />
        Late Submission
      </Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
      <CheckCircle className="w-3 h-3 mr-1" />
      Submitted
    </Badge>;
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  // Teacher view: Assignment card
  const TeacherAssignmentCard = ({ assignment }: { assignment: any }) => {
    const submissionCount = assignment.submissionCount || 0;
    const gradedCount = assignment.gradedCount || 0;

    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                  {assignment.topic && (
                    <Badge variant="outline" className="mt-2">
                      {assignment.topic}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Points</p>
                <p className="font-medium text-gray-900">{assignment.points}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Submissions</p>
                <p className="font-medium text-blue-600">{submissionCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Graded</p>
                <p className="font-medium text-green-600">{gradedCount}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handleViewSubmissions(assignment)}
            >
              <Users className="w-4 h-4 mr-2" />
              View Submissions
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAssignment(assignment);
                setCreateFormData(assignment);
                setShowCreateDialog(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handleDeleteAssignment(assignment._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Student view: Assignment card
  const StudentAssignmentCard = ({ assignment }: { assignment: any }) => {
    const daysRemaining = getDaysRemaining(assignment.dueDate);
    const isOverdue = daysRemaining < 0 && !assignment.submission;

    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>
              </div>
            </div>
            {getStatusBadge(assignment.submission)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Points</p>
                <p className="font-medium text-gray-900">{assignment.points}</p>
              </div>
            </div>
            {assignment.submission?.submittedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDate(assignment.submission.submittedAt)}</p>
                </div>
              </div>
            )}
            {assignment.submission?.score !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Score</p>
                  <p className="font-medium text-green-600">{assignment.submission.score}/{assignment.points}</p>
                </div>
              </div>
            )}
          </div>

          {!assignment.submission && (
            <div className={`p-3 rounded-lg mb-4 ${
              isOverdue ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                {isOverdue 
                  ? `⚠️ Overdue by ${Math.abs(daysRemaining)} day(s)` 
                  : `📅 ${daysRemaining} day(s) remaining`
                }
              </p>
            </div>
          )}

          {assignment.submission?.feedback && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm font-medium text-green-900 mb-1">Teacher Feedback:</p>
              <p className="text-sm text-green-700">{assignment.submission.feedback}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!assignment.submission && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowSubmitDialog(true);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            )}
            {assignment.submission && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowSubmitDialog(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Submission
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return a.title?.toLowerCase().includes(query) || 
             a.description?.toLowerCase().includes(query) ||
             a.topic?.toLowerCase().includes(query);
    }
    return true;
  });

  // Categorize for students
  const pendingAssignments = filteredAssignments.filter(a => !a.submission);
  const submittedAssignments = filteredAssignments.filter(a => a.submission && a.submission.status !== 'graded');
  const gradedAssignments = filteredAssignments.filter(a => a.submission?.status === 'graded');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Assignments
          </h1>
          <p className="text-gray-600 mt-1">
            {isTeacherOrAdmin ? 'Manage assignments and review submissions' : 'View and submit your assignments'}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => {
              setSelectedAssignment(null);
              setCreateFormData({
                title: '',
                description: '',
                instructions: '',
                dueDate: '',
                points: 100,
                topic: '',
                submissionType: 'any',
                allowLateSubmission: true,
                lateSubmissionPenalty: 10,
                maxLateDay: 7
              });
              setShowCreateDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Stats */}
      {!isTeacherOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingAssignments.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted</p>
                  <p className="text-3xl font-bold text-blue-600">{submittedAssignments.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Graded</p>
                  <p className="text-3xl font-bold text-green-600">{gradedAssignments.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search assignments by title, description, or topic..."
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
        </CardContent>
      </Card>

      {/* Content */}
      {isTeacherOrAdmin ? (
        // Teacher view
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Assignments ({filteredAssignments.length})</h2>
          </div>
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <TeacherAssignmentCard key={assignment._id} assignment={assignment} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assignments found</p>
                <p className="text-sm text-gray-500 mt-2">Create your first assignment to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Student view with tabs
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="all">All ({filteredAssignments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <StudentAssignmentCard key={assignment._id} assignment={assignment} />
              ))
            ) : (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assignments found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map((assignment) => (
                <StudentAssignmentCard key={assignment._id} assignment={assignment} />
              ))
            ) : (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending assignments</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4 mt-6">
            {gradedAssignments.length > 0 ? (
              gradedAssignments.map((assignment) => (
                <StudentAssignmentCard key={assignment._id} assignment={assignment} />
              ))
            ) : (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No graded assignments yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
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
                placeholder="e.g., Essay on Cloud Computing"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Brief description of the assignment"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                value={createFormData.instructions}
                onChange={(e) => setCreateFormData({ ...createFormData, instructions: e.target.value })}
                placeholder="Detailed instructions for students..."
                rows={4}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={createFormData.points}
                  onChange={(e) => setCreateFormData({ ...createFormData, points: parseInt(e.target.value) || 0 })}
                  min="0"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic (optional)</Label>
                <Input
                  id="topic"
                  value={createFormData.topic}
                  onChange={(e) => setCreateFormData({ ...createFormData, topic: e.target.value })}
                  placeholder="e.g., Cloud Computing"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionType">Submission Type</Label>
                <Select 
                  value={createFormData.submissionType} 
                  onValueChange={(value) => setCreateFormData({ ...createFormData, submissionType: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="file">File Only</SelectItem>
                    <SelectItem value="link">Link Only</SelectItem>
                    <SelectItem value="text">Text Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <Label className="text-base">Late Submission Settings</Label>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowLateSubmission"
                  checked={createFormData.allowLateSubmission}
                  onChange={(e) => setCreateFormData({ ...createFormData, allowLateSubmission: e.target.checked })}
                  className="rounded"
                  disabled={submitting}
                />
                <Label htmlFor="allowLateSubmission" className="cursor-pointer">
                  Allow late submissions
                </Label>
              </div>

              {createFormData.allowLateSubmission && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="lateSubmissionPenalty">Penalty (% per day)</Label>
                    <Input
                      id="lateSubmissionPenalty"
                      type="number"
                      value={createFormData.lateSubmissionPenalty}
                      onChange={(e) => setCreateFormData({ ...createFormData, lateSubmissionPenalty: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLateDay">Max Late Days</Label>
                    <Input
                      id="maxLateDay"
                      type="number"
                      value={createFormData.maxLateDay}
                      onChange={(e) => setCreateFormData({ ...createFormData, maxLateDay: parseInt(e.target.value) || 0 })}
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (selectedAssignment ? 'Update Assignment' : 'Create Assignment')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Submissions Dialog */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions for {selectedAssignment?.title}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {submissions.length} submission(s) received
            </p>
          </DialogHeader>
          
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: any) => (
                <Card key={submission._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted: {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      {submission.isLate && (
                        <Badge variant="destructive">Late</Badge>
                      )}
                      {submission.status === 'graded' && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Graded: {submission.score}/{selectedAssignment?.points}
                        </Badge>
                      )}
                    </div>

                    {submission.content && (
                      <div className="mb-3">
                        <Label className="text-xs">Submission:</Label>
                        <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded">
                          {submission.content}
                        </p>
                      </div>
                    )}

                    {submission.submissionLink && (
                      <div className="mb-3">
                        <Label className="text-xs">Link:</Label>
                        <a 
                          href={submission.submissionLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block mt-1"
                        >
                          {submission.submissionLink}
                        </a>
                      </div>
                    )}

                    {submission.feedback && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                        <Label className="text-xs text-green-900">Feedback:</Label>
                        <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                      </div>
                    )}

                    {submission.status !== 'graded' && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeData({ 
                            score: submission.score || 0, 
                            feedback: submission.feedback || '' 
                          });
                          setShowGradeDialog(true);
                        }}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Grade Submission
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Student: {selectedSubmission?.student?.name}
            </p>
          </DialogHeader>
          <form onSubmit={handleGradeSubmission} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score (out of {selectedAssignment?.points})</Label>
              <Input
                id="score"
                type="number"
                value={gradeData.score}
                onChange={(e) => setGradeData({ ...gradeData, score: parseInt(e.target.value) || 0 })}
                min="0"
                max={selectedAssignment?.points || 100}
                disabled={grading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                placeholder="Provide feedback to the student..."
                rows={4}
                disabled={grading}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowGradeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={grading}>
                {grading ? 'Grading...' : 'Submit Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Submit Assignment Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Due: {selectedAssignment && formatDate(selectedAssignment.dueDate)}
            </p>
          </DialogHeader>

          {selectedAssignment?.submission ? (
            // View existing submission
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  {getStatusBadge(selectedAssignment.submission)}
                </div>
              </div>

              {selectedAssignment.submission.content && (
                <div>
                  <Label>Your Submission</Label>
                  <p className="text-sm text-gray-700 mt-2 p-4 bg-gray-50 rounded">
                    {selectedAssignment.submission.content}
                  </p>
                </div>
              )}

              {selectedAssignment.submission.submissionLink && (
                <div>
                  <Label>Submitted Link</Label>
                  <a 
                    href={selectedAssignment.submission.submissionLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-2"
                  >
                    {selectedAssignment.submission.submissionLink}
                  </a>
                </div>
              )}

              {selectedAssignment.submission.score !== undefined && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <Label className="text-green-900">Score</Label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {selectedAssignment.submission.score}/{selectedAssignment.points}
                  </p>
                </div>
              )}

              {selectedAssignment.submission.feedback && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <Label className="text-blue-900">Teacher Feedback</Label>
                  <p className="text-sm text-blue-700 mt-2">
                    {selectedAssignment.submission.feedback}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Submit form
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <Label>Assignment Details</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment?.description}</p>
                {selectedAssignment?.instructions && (
                  <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                    {selectedAssignment.instructions}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitContent">Your Answer (optional)</Label>
                <Textarea
                  id="submitContent"
                  value={submitData.content}
                  onChange={(e) => setSubmitData({ ...submitData, content: e.target.value })}
                  placeholder="Type your answer here or provide a link below..."
                  rows={6}
                  disabled={submittingWork}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitLink">Link to Your Work (optional)</Label>
                <Input
                  id="submitLink"
                  value={submitData.submissionLink}
                  onChange={(e) => setSubmitData({ ...submitData, submissionLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  disabled={submittingWork}
                />
                <p className="text-xs text-gray-500">
                  Link to Google Drive, Dropbox, or any other file sharing service
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingWork} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  {submittingWork ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
