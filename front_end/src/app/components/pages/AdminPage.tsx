import React from 'react';
import { Settings, Users, Shield, Database, Activity, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';

export const AdminPage: React.FC = () => {
  // Handler functions
  const handleManageRoles = () => {
    alert('Manage Roles feature\n\nThis will open a dialog to:\n- View all user roles\n- Assign roles to users\n- Modify role permissions\n\nFeature coming soon!');
  };

  const handlePermissions = () => {
    alert('Permissions Management\n\nThis will allow you to:\n- Configure role-based permissions\n- Set access levels for different features\n- Define custom permission sets\n\nFeature coming soon!');
  };

  const handleActivityLogs = () => {
    alert('Activity Logs\n\nView system activity including:\n- User login/logout events\n- Content uploads and modifications\n- Admin actions and changes\n- Security events\n\nFeature coming soon!');
  };

  const handleBackupData = () => {
    if (confirm('Create a backup of all system data?\n\nThis will create a complete backup of:\n- User database\n- Content and files\n- Settings and configurations\n\nProceed with backup?')) {
      alert('Starting backup process...\n\nYou will receive an email when the backup is complete.');
    }
  };

  const handleExportUsers = () => {
    alert('Export Users\n\nExporting user data to CSV format...\n\nFeature coming soon!');
    // TODO: Implement CSV export
    // const csvData = generateUserCSV();
    // downloadCSV(csvData, 'users.csv');
  };

  const handleViewAnalytics = () => {
    alert('Analytics Dashboard\n\nThis will show:\n- User engagement metrics\n- Content usage statistics\n- Session attendance trends\n- System performance data\n\nFeature coming soon!');
  };

  const handleSystemConfig = () => {
    alert('System Configuration\n\nAdvanced settings for:\n- Server configuration\n- Database settings\n- Email and notification settings\n- Integration configurations\n\nFeature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Admin Panel
        </h1>
        <p className="text-gray-600 mt-1">Manage club settings and configurations</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">53</p>
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
                <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600">14</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                <p className="text-3xl font-bold text-orange-600">2.4GB</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">System Health</p>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Healthy</Badge>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Club Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Club Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="allow-registration" className="text-base">Allow New Registrations</Label>
              <p className="text-sm text-gray-600 mt-1">Enable or disable new member registrations</p>
            </div>
            <Switch id="allow-registration" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-600 mt-1">Send email notifications for important updates</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="auto-attendance" className="text-base">Auto Attendance Reminder</Label>
              <p className="text-sm text-gray-600 mt-1">Automatically remind students to mark attendance</p>
            </div>
            <Switch id="auto-attendance" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label htmlFor="public-profile" className="text-base">Public Member Profiles</Label>
              <p className="text-sm text-gray-600 mt-1">Allow member profiles to be visible publicly</p>
            </div>
            <Switch id="public-profile" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleManageRoles}
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Manage Roles</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handlePermissions}
            >
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="text-sm">Permissions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleActivityLogs}
            >
              <Activity className="w-6 h-6 text-green-600" />
              <span className="text-sm">Activity Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Recent System Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'success', message: 'Database backup completed successfully', time: '5 mins ago' },
              { type: 'info', message: '8 new members joined this week', time: '2 hours ago' },
              { type: 'warning', message: 'Storage usage at 80%', time: '1 day ago' },
            ].map((notification, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : notification.type === 'warning'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-600">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleBackupData}
            >
              <Database className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Backup Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleExportUsers}
            >
              <Users className="w-6 h-6 text-green-600" />
              <span className="text-sm">Export Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleViewAnalytics}
            >
              <Activity className="w-6 h-6 text-purple-600" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={handleSystemConfig}
            >
              <Settings className="w-6 h-6 text-orange-600" />
              <span className="text-sm">System Config</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
