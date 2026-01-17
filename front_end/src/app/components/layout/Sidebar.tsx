import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  BookOpen,
  FileText,
  Megaphone,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { useAuth } from '@/app/context/AuthContext';

export type PageType = 
  | 'dashboard' 
  | 'attendance' 
  | 'agenda' 
  | 'learning' 
  | 'assignments' 
  | 'announcements' 
  | 'members' 
  | 'videos'
  | 'admin';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

interface MenuItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('student' | 'teacher' | 'admin')[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'learning', label: 'Learning Content', icon: BookOpen },
  { id: 'videos', label: 'Videos', icon: PlayCircle },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-[calc(100vh-4rem)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Sidebar Content */}
      <div className="flex-1 py-6 px-3 overflow-y-auto">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
