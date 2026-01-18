import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, UserCheck, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import api from '@/services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  batch?: string;
}

interface AttendanceRecord {
  _id?: string;
  user: Student | string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  checkInTime?: string;
}

interface AttendanceMarkingDialogProps {
  open: boolean;
  onClose: () => void;
  session: any;
  onSuccess: () => void;
}

export const AttendanceMarkingDialog: React.FC<AttendanceMarkingDialogProps> = ({
  open,
  onClose,
  session,
  onSuccess
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && session) {
      fetchData();
    }
  }, [open, session]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all students
      const studentsRes = await api.users.getAll({ role: 'student' });
      const studentList = (studentsRes as any).data || [];
      setStudents(studentList);

      // Fetch existing attendance for this session
      try {
        const attendanceRes = await api.attendance.getBySession(session._id || session.id);
        const existingAttendance = (attendanceRes as any).data?.attendance || [];
        
        // Create a map of existing attendance
        const attendanceMap = new Map<string, AttendanceRecord>();
        existingAttendance.forEach((record: any) => {
          const userId = typeof record.user === 'string' ? record.user : record.user._id;
          attendanceMap.set(userId, {
            _id: record._id,
            user: record.user,
            status: record.status,
            notes: record.notes,
            checkInTime: record.checkInTime
          });
        });

        // Initialize absent for students without records
        studentList.forEach((student: Student) => {
          if (!attendanceMap.has(student._id)) {
            attendanceMap.set(student._id, {
              user: student,
              status: 'absent',
              notes: ''
            });
          }
        });

        setAttendance(attendanceMap);
      } catch (error) {
        // If no attendance exists yet, initialize all as absent
        const attendanceMap = new Map<string, AttendanceRecord>();
        studentList.forEach((student: Student) => {
          attendanceMap.set(student._id, {
            user: student,
            status: 'absent',
            notes: ''
          });
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendance = (userId: string, status: AttendanceRecord['status']) => {
    const updated = new Map(attendance);
    const record = updated.get(userId);
    if (record) {
      updated.set(userId, { ...record, status });
      setAttendance(updated);
    }
  };

  const markAllPresent = () => {
    const updated = new Map(attendance);
    updated.forEach((record, userId) => {
      updated.set(userId, { ...record, status: 'present' });
    });
    setAttendance(updated);
  };

  const markAllAbsent = () => {
    const updated = new Map(attendance);
    updated.forEach((record, userId) => {
      updated.set(userId, { ...record, status: 'absent' });
    });
    setAttendance(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Prepare bulk attendance data
      const attendanceArray = Array.from(attendance.entries()).map(([userId, record]) => ({
        userId,
        status: record.status,
        notes: record.notes || ''
      }));

      await api.attendance.bulkMark({
        sessionId: session._id || session.id,
        attendance: attendanceArray
      });

      alert('Attendance saved successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      alert(error.message || 'Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.batch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: AttendanceRecord['status']) => {
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

  const presentCount = Array.from(attendance.values()).filter(r => r.status === 'present').length;
  const lateCount = Array.from(attendance.values()).filter(r => r.status === 'late').length;
  const absentCount = Array.from(attendance.values()).filter(r => r.status === 'absent').length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Mark Attendance - {session?.title || 'Session'}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {session?.date && new Date(session.date).toLocaleDateString()} | {session?.startTime} - {session?.endTime}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                <p className="text-sm text-gray-600">Late</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                className="flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAbsent}
                className="flex items-center gap-1"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                Mark All Absent
              </Button>
              <div className="ml-auto">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const record = attendance.get(student._id);
                    if (!record) return null;

                    return (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-gray-600 text-sm">{student.email}</TableCell>
                        <TableCell className="text-gray-600">{student.batch || '-'}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant={record.status === 'present' ? 'default' : 'outline'}
                              onClick={() => updateAttendance(student._id, 'present')}
                              className="h-8 px-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === 'late' ? 'default' : 'outline'}
                              onClick={() => updateAttendance(student._id, 'late')}
                              className="h-8 px-2"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === 'absent' ? 'default' : 'outline'}
                              onClick={() => updateAttendance(student._id, 'absent')}
                              className="h-8 px-2"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
