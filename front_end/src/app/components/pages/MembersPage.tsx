import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/services/api';

export const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user can view sensitive data (teachers and admins only)
  const canViewSensitiveData = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response: any = await api.users.getAll();
        // Backend returns { success: true, data: users }
        setMembers(response.data || []);
        console.log('Members fetched:', response.data);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Handle send message
  const handleSendMessage = (member: any) => {
    alert(`Send message to ${member.name} at ${member.email}\n\nNote: Email functionality would be integrated in production.`);
    setIsProfileOpen(false);
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

          {member.role === 'student' && canViewSensitiveData && member.batch && (
            <div className="grid grid-cols-2 gap-3 w-full mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Attendance</p>
                <p className="text-sm font-bold text-gray-900">{member.attendance || 0}%</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Batch</p>
                <p className="text-sm font-bold text-gray-900">{member.batch}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {member.skills && Array.isArray(member.skills) && member.skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {member.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{member.skills.length - 3}
              </Badge>
            )}
          </div>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedMember(member);
                  setIsProfileOpen(true);
                }}
              >
                View Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Member Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center pb-4 border-b">
                  <Avatar className="h-24 w-24 border-4 border-blue-100 mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <Badge className={`${getRoleBadgeColor(member.role)} hover:${getRoleBadgeColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-600">Join Date</Label>
                    <p className="text-sm text-gray-900 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {member.joinDate}
                    </p>
                  </div>

                  {member.role === 'student' && (
                    <>
                      {member.batch && (
                        <div>
                          <Label className="text-gray-600">Batch</Label>
                          <p className="text-sm text-gray-900 mt-1">{member.batch}</p>
                        </div>
                      )}

                      {canViewSensitiveData && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-gray-600">Attendance</Label>
                            <p className="text-sm font-bold text-green-600 mt-1">{member.attendance || 0}%</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Assignments</Label>
                            <p className="text-sm font-bold text-blue-600 mt-1">{member.assignments || 0}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <Label className="text-gray-600 mb-2 block">Skills & Expertise</Label>
                    <div className="flex flex-wrap gap-2">
                      {member.skills && Array.isArray(member.skills) && member.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => handleSendMessage(member)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <p className="text-gray-600 mt-1">View and connect with club members</p>
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
                <Users className="w-8 h-8 text-green-600" />
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
                <Users className="w-8 h-8 text-blue-600" />
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
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teachers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {admins.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
