import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  FileCheck,
  Activity,
  UserCheck,
  FileText,
  Calendar,
  BarChart3,
  Megaphone,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '@/services/api';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await api.dashboard.getTeacherDashboard();
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

  // Extract data from API response and map to expected format
  const members = dashboardData?.members || { total: 0 };
  const attendance = dashboardData?.attendance || { averageAttendance: 0, totalSessions: 0 };
  const assignments = dashboardData?.assignments || { pendingGrading: 0, total: 0, submissions: 0, graded: 0 };
  const sessions = dashboardData?.sessions || [];
  const announcements = dashboardData?.announcements || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  const stats = [
    { 
      label: 'Active Members', 
      value: members.total.toString(), 
      change: `${members.students || 0} students`, 
      icon: Users, 
      color: 'from-blue-500 to-indigo-500' 
    },
    { 
      label: 'Avg. Attendance', 
      value: `${attendance.averageAttendance}%`, 
      change: `${attendance.totalSessions} sessions`, 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Assignments Due', 
      value: assignments.pendingGrading.toString(), 
      change: `${assignments.total} total`, 
      icon: FileCheck, 
      color: 'from-orange-500 to-amber-500' 
    },
    { 
      label: 'Sessions This Month', 
      value: attendance.totalSessions.toString(), 
      change: `${attendance.totalRecords || 0} records`, 
      icon: Calendar, 
      color: 'from-purple-500 to-pink-500' 
    },
  ];

  // Map sessions to attendance trend data
  const attendanceTrend = sessions.map((session: any) => ({
    session: session.title || session.name || 'Session',
    attendance: session.attendanceSummary?.percentage || 0,
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Map assignment stats for pie chart
  const assignmentStats = [
    { name: 'Graded', value: assignments.graded, color: '#10b981' },
    { name: 'Pending', value: assignments.pendingGrading, color: '#f59e0b' },
    { name: 'No Submission', value: Math.max(0, assignments.total - assignments.submissions), color: '#ef4444' },
  ].filter(stat => stat.value > 0);

  // Map recent activity from announcements and events
  const recentActivity = [
    ...announcements.slice(0, 3).map((ann: any) => ({
      type: 'announcement',
      title: ann.title,
      time: new Date(ann.createdAt).toLocaleDateString(),
      author: ann.author?.name || 'Unknown'
    })),
    ...upcomingEvents.slice(0, 2).map((event: any) => ({
      type: 'event',
      title: event.topic,
      time: new Date(event.date).toLocaleDateString(),
      attendees: event.registeredAttendees?.length || 0
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Teacher Dashboard 📊</h2>
        <p className="text-blue-100">Manage and monitor your club activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceTrend.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={attendanceTrend}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="session" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAttendance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('attendance')}
            >
              View Detailed Attendance
            </Button>
          </CardContent>
        </Card>

        {/* Assignment Submission Stats */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Assignment Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentStats.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={assignmentStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assignmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {assignmentStats.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stat.color }} />
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.name}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No assignment data available</p>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('assignments')}
            >
              Manage Assignments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{typeof activity.user === 'string' ? activity.user : activity.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

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
              onClick={() => onNavigate('attendance')}
            >
              <UserCheck className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Mark Attendance</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('assignments')}
            >
              <FileText className="w-6 h-6 text-orange-600" />
              <span className="text-sm">Create Assignment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('announcements')}
            >
              <Megaphone className="w-6 h-6 text-purple-600" />
              <span className="text-sm">Post Announcement</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onNavigate('learning')}
            >
              <BookOpen className="w-6 h-6 text-green-600" />
              <span className="text-sm">Upload Content</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};