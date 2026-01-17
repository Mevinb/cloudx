import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Upload, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await api.assignments.getAll();
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Submitted
        </Badge>;
      case 'graded':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </Badge>;
      case 'late':
        return <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Late
        </Badge>;
      default:
        return null;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const AssignmentCard = ({ assignment }: { assignment: any }) => {
    const daysRemaining = getDaysRemaining(assignment.dueDate);
    const isOverdue = daysRemaining < 0 && assignment.status === 'pending';

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
            {getStatusBadge(assignment.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{assignment.dueDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Points</p>
                <p className="font-medium text-gray-900">{assignment.points}</p>
              </div>
            </div>
            {assignment.submittedDate && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">{assignment.submittedDate}</p>
                </div>
              </div>
            )}
            {assignment.score !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Score</p>
                  <p className="font-medium text-green-600">{assignment.score}/{assignment.points}</p>
                </div>
              </div>
            )}
          </div>

          {assignment.status === 'pending' && (
            <div className={`p-3 rounded-lg mb-4 ${
              isOverdue ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                {isOverdue 
                  ? `⚠️ Overdue by ${Math.abs(daysRemaining)} days` 
                  : `📅 ${daysRemaining} days remaining`
                }
              </p>
            </div>
          )}

          {assignment.feedback && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm font-medium text-green-900 mb-1">Teacher Feedback:</p>
              <p className="text-sm text-green-700">{assignment.feedback}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{assignment.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date</Label>
                      <p className="text-sm text-gray-900 mt-1">{assignment.dueDate} at {assignment.dueTime}</p>
                    </div>
                    <div>
                      <Label>Points</Label>
                      <p className="text-sm text-gray-900 mt-1">{assignment.points}</p>
                    </div>
                  </div>
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div>
                      <Label>Attachments</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {assignment.attachments.map((file: string, index: number) => (
                          <Badge key={index} variant="outline" className="cursor-pointer">
                            <FileText className="w-3 h-3 mr-1" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {assignment.status === 'pending' && user?.role === 'student' && (
                    <div className="pt-4 border-t">
                      <Label>Submit Your Work</Label>
                      <div className="mt-2 space-y-3">
                        <Input type="file" />
                        <Textarea placeholder="Add a comment (optional)" rows={3} />
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Assignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            {assignment.status === 'pending' && user?.role === 'student' && (
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Upload className="w-4 h-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.status === 'graded');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Assignments
          </h1>
          <p className="text-gray-600 mt-1">Manage and submit your assignments</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Stats */}
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

      {/* Assignment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingAssignments.length > 0 ? (
            pendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
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

        <TabsContent value="submitted" className="space-y-4 mt-6">
          {submittedAssignments.length > 0 ? (
            submittedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submitted assignments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4 mt-6">
          {gradedAssignments.length > 0 ? (
            gradedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No graded assignments yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
