import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  FileText,
  Megaphone,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import api from '@/services/api';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response: any = await api.dashboard.getStudentDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract data from API response or use empty defaults
  const attendancePercentage = dashboardData?.attendance?.percentage || 0;
  const upcomingSession = dashboardData?.upcomingSession || null;
  const pendingAssignments = dashboardData?.pendingAssignments || [];
  const recentAnnouncements = dashboardData?.recentAnnouncements || [];
  const sessionsAttended = dashboardData?.attendance?.attended || 0;
  const totalSessions = dashboardData?.attendance?.total || 0;
  const pendingAssignmentsCount = pendingAssignments.length;
  const newAnnouncementsCount = recentAnnouncements.length;

  const stats = [
    { label: 'Attendance Rate', value: `${attendancePercentage}%`, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Sessions Attended', value: `${sessionsAttended}/${totalSessions}`, icon: Calendar, color: 'from-blue-500 to-indigo-500' },
    { label: 'Assignments', value: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} Pending` : 'None', icon: FileText, color: 'from-orange-500 to-amber-500' },
    { label: 'Announcements', value: newAnnouncementsCount > 0 ? `${newAnnouncementsCount} New` : 'None', icon: Megaphone, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back! 👋</h2>
        <p className="text-blue-100">Here's what's happening with your club activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall Attendance</span>
                  <span className="text-sm font-medium text-gray-900">{attendancePercentage}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-2" />
              </div>
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Great job! You're maintaining excellent attendance.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate('attendance')}
              >
                View Attendance History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Session */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSession ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{upcomingSession.topic}</h4>
                      <p className="text-sm text-gray-600">by {upcomingSession.speaker}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 {upcomingSession.date}</span>
                    <span>🕐 {upcomingSession.time}</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => onNavigate('agenda')}
                >
                  View Full Agenda
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming sessions scheduled</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => onNavigate('agenda')}
                >
                  View Agenda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Pending Assignments
              </span>
              <Badge variant="secondary">{pendingAssignments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('assignments')}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Pending
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onNavigate('assignments')}
                >
                  View All Assignments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending assignments</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => onNavigate('assignments')}
                >
                  View Assignments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Announcements */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement: any) => (
                  <div
                    key={announcement.id || announcement._id}
                    className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow ${
                      announcement.important || announcement.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => onNavigate('announcements')}
                  >
                    <div className="flex items-start gap-3">
                      {(announcement.important || announcement.priority === 'high') && (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{announcement.title}</h4>
                        <p className="text-sm text-gray-600">{announcement.date || announcement.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onNavigate('announcements')}
                >
                  View All Announcements
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No announcements yet</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => onNavigate('announcements')}
                >
                  View Announcements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('learning')}
            >
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Browse Content</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('assignments')}
            >
              <FileText className="w-6 h-6 text-orange-600" />
              <span className="text-sm">Submit Work</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('members')}
            >
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm">View Members</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('agenda')}
            >
              <Calendar className="w-6 h-6 text-green-600" />
              <span className="text-sm">Check Schedule</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
