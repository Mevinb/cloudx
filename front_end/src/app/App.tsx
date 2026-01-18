import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { Login } from '@/app/components/auth/Login';
import { Register } from '@/app/components/auth/Register';
import { Navbar } from '@/app/components/layout/Navbar';
import { Sidebar, PageType } from '@/app/components/layout/Sidebar';
import { StudentDashboard } from '@/app/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/app/components/dashboard/TeacherDashboard';
import { AdminDashboard } from '@/app/components/dashboard/AdminDashboard';
import { AttendancePage } from '@/app/components/pages/AttendancePage';
import { AgendaPage } from '@/app/components/pages/AgendaPage';
import { LearningContentPage } from '@/app/components/pages/LearningContentPage';
import { AssignmentsPage } from '@/app/components/pages/AssignmentsPage';
import { AnnouncementsPage } from '@/app/components/pages/AnnouncementsPage';
import { MembersPage } from '@/app/components/pages/MembersPage';
import { AdminPage } from '@/app/components/pages/AdminPage';
import { ProfilePage } from '@/app/components/pages/ProfilePage';
import { SettingsPage } from '@/app/components/pages/SettingsPage';
import VideosPage from '@/app/components/pages/VideosPage';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { Toaster } from '@/app/components/ui/toaster';
import logger from '@/utils/logger';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  useEffect(() => {
    logger.info('AppContent', 'Component mounted', { isAuthenticated, isLoading, user: user?.email });
  }, []);

  useEffect(() => {
    logger.info('AppContent', 'Auth state changed', { isAuthenticated, isLoading, user: user?.email, role: user?.role });
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    logger.info('AppContent', 'Page changed', { currentPage });
  }, [currentPage]);

  const handlePageChange = (page: PageType | string) => {
    logger.info('AppContent', 'handlePageChange called', { page });
    setCurrentPage(page as PageType);
  };

  // Show loading while auth is initializing
  if (isLoading) {
    logger.debug('AppContent', 'Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    logger.info('AppContent', 'User not authenticated, showing auth screen', { authView });
    if (authView === 'login') {
      return <Login onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  logger.info('AppContent', 'User authenticated, rendering main app', { user: user?.email, role: user?.role });

  // Render current page content
  const renderPageContent = () => {
    logger.debug('AppContent', 'renderPageContent called', { currentPage, userRole: user?.role });
    
    try {
      switch (currentPage) {
        case 'dashboard':
          logger.debug('AppContent', 'Rendering dashboard', { role: user?.role });
          if (user?.role === 'student') {
            return <StudentDashboard onNavigate={handlePageChange} />;
          } else if (user?.role === 'admin') {
            return <AdminDashboard onNavigate={handlePageChange} />;
          } else {
            return <TeacherDashboard onNavigate={handlePageChange} />;
          }
        case 'attendance':
          logger.debug('AppContent', 'Rendering AttendancePage');
          return <AttendancePage />;
        case 'agenda':
          logger.debug('AppContent', 'Rendering AgendaPage');
          return <AgendaPage />;
        case 'learning':
          logger.debug('AppContent', 'Rendering LearningContentPage');
          return <LearningContentPage />;
        case 'assignments':
          logger.debug('AppContent', 'Rendering AssignmentsPage');
          return <AssignmentsPage />;
        case 'announcements':
          logger.debug('AppContent', 'Rendering AnnouncementsPage');
          return <AnnouncementsPage />;
        case 'members':
          logger.debug('AppContent', 'Rendering MembersPage');
          return <MembersPage />;
        case 'videos':
          logger.debug('AppContent', 'Rendering VideosPage');
          return <VideosPage />;
        case 'admin':
          logger.debug('AppContent', 'Rendering AdminPage');
          return <AdminPage />;
        case 'profile':
          logger.debug('AppContent', 'Rendering ProfilePage');
          return <ProfilePage />;
        case 'settings':
          logger.debug('AppContent', 'Rendering SettingsPage');
          return <SettingsPage />;
        default:
          logger.warn('AppContent', 'Unknown page, rendering dashboard', { currentPage });
          return user?.role === 'student' ? (
            <StudentDashboard onNavigate={handlePageChange} />
          ) : (
            <TeacherDashboard onNavigate={handlePageChange} />
          );
      }
    } catch (error) {
      logger.error('AppContent', 'Error rendering page content', { error, currentPage });
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Navbar onNavigate={handlePageChange} />
      </ErrorBoundary>
      <div className="flex">
        <ErrorBoundary>
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </ErrorBoundary>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {renderPageContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  logger.info('App', 'App component rendering');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
