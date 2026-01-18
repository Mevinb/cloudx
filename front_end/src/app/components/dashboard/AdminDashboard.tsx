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
  Shield,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Video,
  FolderOpen,
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
  LineChart,
  Line,
} from 'recharts';
import api from '@/services/api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const members = dashboardData?.members || { total: 0, students: 0, teachers: 0, admins: 0 };
  const attendance = dashboardData?.attendance || { averageAttendance: 0, totalSessions: 0, totalRecords: 0 };
  const assignments = dashboardData?.assignments || { pendingGrading: 0, total: 0, submissions: 0, graded: 0 };
  const sessions = dashboardData?.sessions || [];
  const announcements = dashboardData?.announcements || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  // Comprehensive stats for admin
  const adminStats = [
    { 
      label: 'Total Members', 
      value: members.total.toString(), 
      change: `${members.students} students, ${members.teachers} teachers`, 
      icon: Users, 
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Active Students', 
      value: members.students.toString(), 
      change: `${members.admins} admins`, 
      icon: UserCheck, 
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      label: 'Avg. Attendance', 
      value: `${attendance.averageAttendance}%`, 
      change: `${attendance.totalSessions} sessions tracked`, 
      icon: TrendingUp, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      label: 'Total Assignments', 
      value: assignments.total.toString(), 
      change: `${assignments.submissions} submissions`, 
      icon: FileCheck, 
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      label: 'Pending Grading', 
      value: assignments.pendingGrading.toString(), 
      change: `${assignments.graded} graded`, 
      icon: Clock, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    { 
      label: 'Active Sessions', 
      value: attendance.totalSessions.toString(), 
      change: `${attendance.totalRecords} attendance records`, 
      icon: Calendar, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    { 
      label: 'Announcements', 
      value: announcements.length.toString(), 
      change: 'Recent posts', 
      icon: Megaphone, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    { 
      label: 'Upcoming Events', 
      value: upcomingEvents.length.toString(), 
      change: 'Scheduled', 
      icon: Activity, 
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
  ];

  // Map sessions to attendance trend data
  const attendanceTrend = sessions.slice(0, 10).map((session: any) => ({
    name: session.title || session.name || 'Session',
    attendance: session.attendanceSummary?.percentage || 0,
    present: session.attendanceSummary?.present || 0,
    absent: session.attendanceSummary?.absent || 0,
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Assignment submission breakdown
  const assignmentStats = [
    { name: 'Graded', value: assignments.graded, color: '#10b981' },
    { name: 'Pending Review', value: assignments.pendingGrading, color: '#f59e0b' },
    { name: 'Not Submitted', value: Math.max(0, (assignments.total * members.students) - assignments.submissions), color: '#ef4444' },
  ].filter(stat => stat.value > 0);

  // Member distribution
  const memberDistribution = [
    { name: 'Students', value: members.students, color: '#3b82f6' },
    { name: 'Teachers', value: members.teachers, color: '#8b5cf6' },
    { name: 'Admins', value: members.admins, color: '#ec4899' },
  ].filter(stat => stat.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-10 h-10" />
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        </div>
        <p className="text-indigo-100 text-lg">Complete system overview and management center</p>
      </div>

      {/* Comprehensive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAttendance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Distribution */}
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Assignment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {assignmentStats.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={assignmentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {assignmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4 w-full">
                  {assignmentStats.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stat.color }}></div>
                      <p className="text-xs text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No assignment data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Distribution */}
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Member Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {memberDistribution.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={memberDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {memberDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4 w-full">
                  {memberDistribution.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stat.color }}></div>
                      <p className="text-xs text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No member data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sessions.length > 0 ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {sessions.slice(0, 5).map((session: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {session.title || session.name || 'Untitled Session'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {new Date(session.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {session.attendanceSummary && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            session.attendanceSummary.percentage >= 80 ? 'bg-green-100 text-green-700' :
                            session.attendanceSummary.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {session.attendanceSummary.percentage}%
                        </Badge>
                      )}
                    </div>
                    {session.attendanceSummary && (
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {session.attendanceSummary.present} present
                        </span>
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {session.attendanceSummary.absent} absent
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No sessions available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('members')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('attendance')}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('assignments')}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Grade Assignments
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('announcements')}
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('agenda')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="shadow-lg border-none lg:col-span-2">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-rose-50">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-pink-600" />
              Recent Announcements & Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {(announcements.length > 0 || upcomingEvents.length > 0) ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {announcements.slice(0, 3).map((announcement: any, index: number) => (
                  <div key={`ann-${index}`} className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{announcement.title}</h4>
                      {announcement.priority && announcement.priority !== 'normal' && (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-700 text-xs">
                          {announcement.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {announcement.author?.name || 'Unknown'} • {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                    {announcement.content && (
                      <p className="text-xs text-gray-700 line-clamp-2">{announcement.content}</p>
                    )}
                  </div>
                ))}
                {upcomingEvents.slice(0, 3).map((event: any, index: number) => (
                  <div key={`event-${index}`} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{event.topic}</h4>
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                        Event
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })} {event.startTime && `at ${event.startTime}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {event.speaker && <span>Speaker: {event.speaker}</span>}
                      {event.registeredAttendees && (
                        <span>• {event.registeredAttendees.length} registered</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-center">
                  <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <Card className="shadow-lg border-none bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-700">System Status</p>
              </div>
              <p className="text-xs text-gray-600">All systems operational</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-700">Active Now</p>
              </div>
              <p className="text-xs text-gray-600">{members.total} members online</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-700">Completion Rate</p>
              </div>
              <p className="text-xs text-gray-600">
                {assignments.total > 0 ? Math.round((assignments.graded / assignments.total) * 100) : 0}%
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-700">Engagement</p>
              </div>
              <p className="text-xs text-gray-600">{attendance.averageAttendance}% avg attendance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
