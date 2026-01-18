import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Award, Calendar, Phone, MapPin, BookOpen, GraduationCap, TrendingUp, CheckCircle, Clock, X } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Check if current user can view sensitive data (teachers and admins only)
  const canViewSensitiveData = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response: any = await api.users.getAll();
        setMembers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch profile data when a member is selected
  const fetchProfileData = async (memberId: string) => {
    if (!canViewSensitiveData) return;
    
    try {
      setLoadingProfile(true);
      const response: any = await api.users.getProfile(memberId);
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenProfile = (member: any) => {
    setSelectedMember(member);
    setProfileData(null);
    setIsProfileOpen(true);
    if (canViewSensitiveData && member.role === 'student') {
      fetchProfileData(member._id);
    }
  };

  // Handle send message
  const handleSendMessage = (member: any) => {
    window.location.href = `mailto:${member.email}`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.skills && Array.isArray(member.skills) && member.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const students = filteredMembers.filter(m => m.role === 'student');
  const teachers = filteredMembers.filter(m => m.role === 'teacher');
  const admins = filteredMembers.filter(m => m.role === 'admin');

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  const MemberCard = ({ member }: { member: any }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border-4 border-blue-100 mb-4">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{member.email}</p>
          
          <Badge className={`${getRoleBadgeColor(member.role)} hover:${getRoleBadgeColor(member.role)} mb-4`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>

          {member.role === 'student' && canViewSensitiveData && (
            <div className="grid grid-cols-2 gap-3 w-full mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Status</p>
                <p className="text-sm font-bold text-green-600">
                  {member.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Batch</p>
                <p className="text-sm font-bold text-gray-900">{member.batch || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {member.skills && Array.isArray(member.skills) && member.skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {member.skills && member.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{member.skills.length - 3}
              </Badge>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleOpenProfile(member)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Members
          </h1>
          <p className="text-gray-600 mt-1">
            {canViewSensitiveData ? 'View detailed member information and analytics' : 'View and connect with club members'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students</p>
                <p className="text-3xl font-bold text-green-600">{students.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Teachers</p>
                <p className="text-3xl font-bold text-blue-600">{teachers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admins</p>
                <p className="text-3xl font-bold text-purple-600">{admins.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10"
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

      {/* Members Grid */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all">All ({filteredMembers.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No members found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {students.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teachers.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No teachers found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          {admins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {admins.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No admins found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Member Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Member Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center pb-6 border-b">
                  <Avatar className="h-24 w-24 border-4 border-blue-100 mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMember.name}</h3>
                  <Badge className={`${getRoleBadgeColor(selectedMember.role)} hover:${getRoleBadgeColor(selectedMember.role)} mb-2`}>
                    {selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)}
                  </Badge>
                  {selectedMember.isActive !== undefined && (
                    <Badge variant="outline" className={selectedMember.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                      {selectedMember.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-gray-600 text-xs">Email</Label>
                      <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {selectedMember.email}
                      </p>
                    </div>
                    {selectedMember.phone && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Label className="text-gray-600 text-xs">Phone</Label>
                        <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-blue-600" />
                          {selectedMember.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic/Professional Information */}
                {selectedMember.role === 'student' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedMember.batch && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-blue-900 text-xs">Batch</Label>
                          <p className="text-sm font-bold text-blue-700 mt-1">{selectedMember.batch}</p>
                        </div>
                      )}
                      {selectedMember.studentId && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <Label className="text-purple-900 text-xs">Student ID</Label>
                          <p className="text-sm font-bold text-purple-700 mt-1">{selectedMember.studentId}</p>
                        </div>
                      )}
                      {selectedMember.department && (
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <Label className="text-indigo-900 text-xs">Department</Label>
                          <p className="text-sm font-bold text-indigo-700 mt-1">{selectedMember.department}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Metrics (Teachers Only) */}
                {canViewSensitiveData && selectedMember.role === 'student' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                    {loadingProfile ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="p-4 bg-gray-100 rounded-lg text-center animate-pulse">
                            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                            <div className="h-6 bg-gray-300 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : profileData ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <Label className="text-green-900 text-xs block mb-1">Attendance</Label>
                          <p className="text-2xl font-bold text-green-700">
                            {profileData.attendance?.percentage || 0}%
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <Label className="text-blue-900 text-xs block mb-1">Assignments</Label>
                          <p className="text-2xl font-bold text-blue-700">
                            {profileData.assignments?.graded || 0}/{profileData.assignments?.total || 0}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
                          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <Label className="text-purple-900 text-xs block mb-1">Avg Score</Label>
                          <p className="text-2xl font-bold text-purple-700">
                            {profileData.assignments?.averageScore || 0}%
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg text-center border border-orange-200">
                          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <Label className="text-orange-900 text-xs block mb-1">Pending</Label>
                          <p className="text-2xl font-bold text-orange-700">
                            {profileData.assignments?.pending || 0}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Unable to load performance data</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills & Expertise */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          <Award className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedMember.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Bio</h4>
                    <p className="text-sm text-gray-700 p-4 bg-gray-50 rounded-lg">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                {/* Additional Details (Teachers Only) */}
                {canViewSensitiveData && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Label className="text-gray-600 text-xs flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Join Date
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedMember.createdAt)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Label className="text-gray-600 text-xs flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Last Active
                        </Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedMember.lastActive) || 'Recently'}
                        </p>
                      </div>
                      {selectedMember.location && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Label className="text-gray-600 text-xs flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">{selectedMember.location}</p>
                        </div>
                      )}
                      {selectedMember.github && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Label className="text-gray-600 text-xs">GitHub</Label>
                          <a 
                            href={selectedMember.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-1 block"
                          >
                            {selectedMember.github}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                    onClick={() => handleSendMessage(selectedMember)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
