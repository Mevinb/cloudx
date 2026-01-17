import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setTokens, clearTokens, getAccessToken, User as ApiUser } from '@/services/api';
import logger from '@/utils/logger';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  batch?: string;
  skills?: string[];
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to convert API user to local user type
const mapApiUser = (userData: ApiUser): User => ({
  id: userData._id || userData.id,
  name: userData.name,
  email: userData.email,
  role: userData.role as UserRole,
  batch: userData.batch,
  skills: userData.skills,
  avatar: userData.avatar,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  logger.info('AuthProvider', 'AuthProvider rendering', { isLoading, hasUser: !!user });

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      logger.info('AuthProvider', 'initAuth started');
      const token = getAccessToken();
      logger.debug('AuthProvider', 'Token check', { hasToken: !!token });
      
      if (token) {
        try {
          logger.info('AuthProvider', 'Fetching user with token');
          const response = await authAPI.getMe();
          logger.info('AuthProvider', 'getMe response', { response });
          const mappedUser = mapApiUser(response.data);
          logger.info('AuthProvider', 'Setting user', { user: mappedUser });
          setUser(mappedUser);
        } catch (error) {
          logger.error('AuthProvider', 'Session restoration failed', { error });
          clearTokens();
        }
      }
      logger.info('AuthProvider', 'Setting isLoading to false');
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    logger.info('AuthProvider', 'Login attempt', { email });
    try {
      const response = await authAPI.login({ email, password });
      logger.info('AuthProvider', 'Login response received', { response });
      const { user: userData, accessToken, refreshToken } = response.data;
      
      setTokens(accessToken, refreshToken);
      const mappedUser = mapApiUser(userData);
      logger.info('AuthProvider', 'Setting user after login', { user: mappedUser });
      setUser(mappedUser);
    } catch (error: unknown) {
      logger.error('AuthProvider', 'Login failed', { error });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    logger.info('AuthProvider', 'Register attempt', { name, email, role });
    try {
      const response = await authAPI.register({ name, email, password, role }) as {
        data: {
          user: ApiUser;
          accessToken: string;
          refreshToken: string;
        };
      };
      logger.info('AuthProvider', 'Register response received', { response });
      const { user: userData, accessToken, refreshToken } = response.data;
      
      setTokens(accessToken, refreshToken);
      const mappedUser = mapApiUser(userData);
      logger.info('AuthProvider', 'Setting user after register', { user: mappedUser });
      setUser(mappedUser);
    } catch (error: unknown) {
      logger.error('AuthProvider', 'Registration failed', { error });
      throw error;
    }
  };

  const logout = async () => {
    logger.info('AuthProvider', 'Logout called');
    try {
      await authAPI.logout();
    } catch (error) {
      logger.error('AuthProvider', 'Logout error', { error });
    } finally {
      clearTokens();
      setUser(null);
      logger.info('AuthProvider', 'User logged out');
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    logger.debug('AuthProvider', 'Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  logger.debug('AuthProvider', 'Rendering children', { isAuthenticated: !!user, user: user?.email });

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
