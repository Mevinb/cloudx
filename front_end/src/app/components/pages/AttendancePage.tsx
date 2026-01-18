import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, Download, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useAuth } from '@/app/context/AuthContext';
import { AttendanceMarkingDialog } from './AttendanceMarkingDialog';
import api from '@/services/api';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMarkingDialog, setShowMarkingDialog] = useState(false);
  const [userSummary, setUserSummary] = useState<any>(null);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    fetchSessions();
    if (isStudent && user?.id) {
      fetchUserAttendance();
    }
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionAttendance();
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await api.sessions.getAll();
      const sessionList = (response as any).data || [];
      setSessions(sessionList);
      
      // Auto-select most recent session
      if (sessionList.length > 0) {
        setSelectedSession(sessionList[0]);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionAttendance = async () => {
    if (!selectedSession) return;
    
    try {
      const response = await api.attendance.getBySession(selectedSession._id || selectedSession.id);
      setAttendance((response as any).data?.attendance || []);
      setSummary((response as any).data?.summary || null);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setAttendance([]);
      setSummary(null);
    }
  };

  const fetchUserAttendance = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.attendance.getByUser(user.id);
      setAttendance((response as any).data?.attendance || []);
      setUserSummary((response as any).data?.summary || null);
    } catch (error) {
      console.error('Failed to fetch user attendance:', error);
    }
  };

  const handleExportCSV = () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    
    const exportUrl = api.attendance.exportCSV(selectedSession._id || selectedSession.id);
    window.open(exportUrl, '_blank');
  };

  const handleMarkAttendance = () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    setShowMarkingDialog(true);
  };

  const handleAttendanceSuccess = () => {
    fetchSessionAttendance();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Present
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </Badge>
        );
      case 'excused':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Excused
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // Student View
  if (isStudent) {
    const filteredAttendance = attendance.filter((record: any) =>
      record.session?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const presentCount = userSummary?.present || 0;
    const absentCount = userSummary?.absent || 0;
    const lateCount = userSummary?.late || 0;
    const attendancePercentage = userSummary?.percentage || 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-600" />
            My Attendance
          </h1>
          <p className="text-gray-600 mt-1">View your session attendance history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-green-600">{attendancePercentage}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Present</p>
                  <p className="text-3xl font-bold text-gray-900">{presentCount}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Late</p>
                  <p className="text-3xl font-bold text-gray-900">{lateCount}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Absent</p>
                  <p className="text-3xl font-bold text-gray-900">{absentCount}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Your Attendance Records</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Session Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record: any) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {record.session?.title || 'Unknown Session'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.session?.date ? new Date(record.session.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.session?.startTime || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-gray-600">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Teacher/Admin View
  const filteredAttendance = attendance.filter((record: any) => {
    const userName = typeof record.user === 'object' ? record.user?.name : '';
    const userEmail = typeof record.user === 'object' ? record.user?.email : '';
    const userBatch = typeof record.user === 'object' ? record.user?.batch : '';
    
    return (
      userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userBatch?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const presentCount = summary?.present || 0;
  const absentCount = summary?.absent || 0;
  const lateCount = summary?.late || 0;
  const excusedCount = summary?.excused || 0;
  const totalCount = summary?.total || 0;
  const attendancePercentage = totalCount > 0 
    ? Math.round(((presentCount + lateCount) / totalCount) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-600" />
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">Track and manage session attendance</p>
        </div>
        {isTeacher && (
          <Button 
            onClick={handleMarkAttendance}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            disabled={!selectedSession}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600">{attendancePercentage}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-3xl font-bold text-gray-900">{presentCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Late</p>
                <p className="text-3xl font-bold text-gray-900">{lateCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-3xl font-bold text-gray-900">{absentCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Excused</p>
                <p className="text-3xl font-bold text-gray-900">{excusedCount}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Selector */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Select Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sessions.map((session) => (
                <button
                  key={session._id || session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSession?._id === session._id || selectedSession?.id === session.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="font-medium text-gray-900 mb-2">{session.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{session.type || 'Regular'}</Badge>
                    <span className="text-xs text-gray-600">{session.startTime}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No sessions found</p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {selectedSession && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>
                Attendance for {selectedSession.title}
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record: any) => {
                      const student = typeof record.user === 'object' ? record.user : null;
                      return (
                        <TableRow key={record._id}>
                          <TableCell className="font-medium">
                            {student?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-gray-600">{student?.email || '-'}</TableCell>
                          <TableCell className="text-gray-600">{student?.batch || '-'}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-gray-600">
                            {record.checkInTime 
                              ? new Date(record.checkInTime).toLocaleTimeString() 
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No attendance records yet. Click "Mark Attendance" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Marking Dialog */}
      {showMarkingDialog && selectedSession && (
        <AttendanceMarkingDialog
          open={showMarkingDialog}
          onClose={() => setShowMarkingDialog(false)}
          session={selectedSession}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
};
