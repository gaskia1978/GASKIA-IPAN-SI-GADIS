/**
 * ASKIA-SI GADIS - Authentication Context
 * Mengelola pendaftaran satu kali untuk pengunjung pertama kali,
 * autentikasi resmi Admin Pengawas & Operator Sekolah dengan password,
 * serta kontrol akses ke Panel Admin.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SystemCredential } from '../types';
import { INITIAL_USERS, OFFICIAL_SYSTEM_CREDENTIALS } from '../data/initialData';
import { StorageService } from '../services/storage';

interface LoginResult {
  success: boolean;
  message?: string;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  hasCompletedFirstRegistration: boolean;
  registeredVisitors: User[];
  systemCredentials: SystemCredential[];
  registerVisitor: (data: {
    full_name: string;
    email: string;
    institution: string;
    position: string;
    district?: string;
    phone?: string;
  }) => User;
  loginVisitor: (emailOrId: string) => boolean;
  loginAs: (role: UserRole, schoolId?: string) => void;
  loginWithCredentials: (email: string, password?: string, fallbackRole?: UserRole, schoolId?: string) => LoginResult;
  logout: () => void;
  resetRegistrationStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'askia_current_user_v1';
const FIRST_REG_KEY = 'askia_first_registration_completed_v1';
const VISITORS_LIST_KEY = 'askia_registered_visitors_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current user in session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Has completed first registration
  const [hasCompletedFirstRegistration, setHasCompletedFirstRegistration] = useState<boolean>(() => {
    try {
      return localStorage.getItem(FIRST_REG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // 3. Registered visitors list
  const [registeredVisitors, setRegisteredVisitors] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(VISITORS_LIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const role: UserRole = currentUser ? currentUser.role : 'visitor';

  // Register new visitor (Wajib saat pertama kali masuk platform)
  const registerVisitor = (data: {
    full_name: string;
    email: string;
    institution: string;
    position: string;
    district?: string;
    phone?: string;
  }): User => {
    const newVisitor: User = {
      id: `visitor-${Date.now()}`,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'visitor',
      institution: data.institution.trim(),
      position: data.position.trim(),
      district: data.district?.trim() || 'Lumajang',
      phone: data.phone?.trim(),
      created_at: new Date().toISOString(),
    };

    // Update list
    const updatedVisitors = [...registeredVisitors, newVisitor];
    setRegisteredVisitors(updatedVisitors);
    localStorage.setItem(VISITORS_LIST_KEY, JSON.stringify(updatedVisitors));

    // Mark as completed first registration
    setHasCompletedFirstRegistration(true);
    localStorage.setItem(FIRST_REG_KEY, 'true');

    // Set as current logged in user
    setCurrentUser(newVisitor);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newVisitor));

    return newVisitor;
  };

  // Login as existing registered visitor
  const loginVisitor = (emailOrId: string): boolean => {
    const found = registeredVisitors.find(
      (v) => v.email.toLowerCase() === emailOrId.toLowerCase() || v.id === emailOrId
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      setHasCompletedFirstRegistration(true);
      localStorage.setItem(FIRST_REG_KEY, 'true');
      return true;
    }
    return false;
  };

  const loginAs = (targetRole: UserRole, schoolId?: string) => {
    if (targetRole === 'admin') {
      const adminCred = OFFICIAL_SYSTEM_CREDENTIALS[0];
      const adminUser: User = {
        id: 'user-admin',
        full_name: adminCred.full_name,
        email: adminCred.email,
        role: 'admin',
        school_name: adminCred.school_name,
        created_at: '2026-01-01T00:00:00Z',
      };
      setCurrentUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      setHasCompletedFirstRegistration(true);
      localStorage.setItem(FIRST_REG_KEY, 'true');
    } else if (targetRole === 'operator') {
      const schools = StorageService.getSchools();
      const targetSchool = schoolId 
        ? schools.find((s) => s.id === schoolId) || schools[0]
        : schools[0];

      const opUser: User = {
        id: `user-op-${targetSchool?.id || 'default'}`,
        full_name: targetSchool?.operator_name || 'Operator Sekolah',
        email: targetSchool?.contact_email || 'operator@sekolah.sch.id',
        role: 'operator',
        school_id: targetSchool?.id,
        school_name: targetSchool?.school_name,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(opUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(opUser));
      setHasCompletedFirstRegistration(true);
      localStorage.setItem(FIRST_REG_KEY, 'true');
    } else {
      logout();
    }
  };

  // Login resmi Admin Pengawas & Operator dengan Email & Password
  const loginWithCredentials = (
    email: string, 
    password?: string, 
    fallbackRole?: UserRole, 
    schoolId?: string
  ): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    // Cari di daftar kredensial resmi pengawas/operator
    const matchedCred = OFFICIAL_SYSTEM_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    if (matchedCred) {
      if (cleanPass && matchedCred.password !== cleanPass) {
        return {
          success: false,
          message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi akun Anda.',
        };
      }

      const verifiedUser: User = {
        id: `user-${matchedCred.role}-${Date.now()}`,
        full_name: matchedCred.full_name,
        email: matchedCred.email,
        role: matchedCred.role,
        school_id: matchedCred.school_id,
        school_name: matchedCred.school_name,
        created_at: new Date().toISOString(),
      };

      setCurrentUser(verifiedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedUser));
      setHasCompletedFirstRegistration(true);
      localStorage.setItem(FIRST_REG_KEY, 'true');

      return {
        success: true,
        role: matchedCred.role,
      };
    }

    // Jika dimasukkan sebagai operator sekolah kustom
    if (fallbackRole === 'operator') {
      const schools = StorageService.getSchools();
      const assignedSchool = schools.find((s) => s.id === schoolId) || schools[0];

      const customOpUser: User = {
        id: `user-op-${Date.now()}`,
        full_name: assignedSchool?.operator_name || 'Operator Sekolah',
        email: cleanEmail,
        role: 'operator',
        school_id: assignedSchool?.id,
        school_name: assignedSchool?.school_name,
        created_at: new Date().toISOString(),
      };

      setCurrentUser(customOpUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customOpUser));
      setHasCompletedFirstRegistration(true);
      localStorage.setItem(FIRST_REG_KEY, 'true');

      return {
        success: true,
        role: 'operator',
      };
    }

    return {
      success: false,
      message: 'Email atau kata sandi tidak terdaftar sebagai Admin Pengawas atau Operator Sekolah.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Helper untuk reset jika ingin menguji kembali flow pendaftaran pertama
  const resetRegistrationStatus = () => {
    localStorage.removeItem(FIRST_REG_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setHasCompletedFirstRegistration(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        hasCompletedFirstRegistration,
        registeredVisitors,
        systemCredentials: OFFICIAL_SYSTEM_CREDENTIALS,
        registerVisitor,
        loginVisitor,
        loginAs,
        loginWithCredentials,
        logout,
        resetRegistrationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
