/**
 * ASKIA-SI GADIS
 * Informasi Gudang Aplikasi Digital Sekolah
 * Platform Repositori & Verifikasi Inovasi Digital Sekolah Dampingan Pengawas
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storage';
import { Application, School, DashboardStats } from './types';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { QrCodeModal } from './components/common/QrCodeModal';
import { ReportModal } from './components/common/ReportModal';
import { FeedbackModal } from './components/common/FeedbackModal';
import { LoginModal } from './components/auth/LoginModal';
import { FirstTimeRegisterModal } from './components/auth/FirstTimeRegisterModal';

import { HomeView } from './components/home/HomeView';
import { ApplicationDirectory } from './components/directory/ApplicationDirectory';
import { ApplicationDetailModal } from './components/directory/ApplicationDetailModal';
import { SchoolDirectory } from './components/schools/SchoolDirectory';
import { SchoolDetailModal } from './components/schools/SchoolDetailModal';
import { UploadApplicationForm } from './components/upload/UploadApplicationForm';
import { InnovationAnalytics } from './components/stats/InnovationAnalytics';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlatformGuide } from './components/guide/PlatformGuide';

const MainApp: React.FC = () => {
  const { role, hasCompletedFirstRegistration, currentUser } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');

  // Modals state
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [qrApp, setQrApp] = useState<Application | null>(null);
  const [reportApp, setReportApp] = useState<Application | null>(null);
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Data cache trigger
  const [dataVersion, setDataVersion] = useState(0);

  // Initialize storage once and listen for data updates
  useEffect(() => {
    StorageService.init();
    setDataVersion(v => v + 1);

    const handleUpdate = () => {
      setDataVersion(v => v + 1);
    };
    window.addEventListener('askia_data_updated', handleUpdate);

    // Global background sync setiap 10 detik agar hemat bandwidth & tidak balapan data
    const interval = setInterval(() => {
      StorageService.syncWithServer();
    }, 10000);

    return () => {
      window.removeEventListener('askia_data_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  // Guard kelola tab: only admin and operator can access
  useEffect(() => {
    if (activeTab === 'kelola' && role !== 'admin' && role !== 'operator') {
      setActiveTab('beranda');
    }
  }, [activeTab, role]);

  const applications = StorageService.getApplications();
  const schools = StorageService.getSchools();
  const stats = StorageService.getDashboardStats();

  const handleNavigate = (tab: string, filter?: { category?: string; district?: string }) => {
    if (filter?.category) setFilterCategory(filter.category);
    if (filter?.district) setFilterDistrict(filter.district);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUpload = () => {
    setActiveTab('unggah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleGlobalSearch = (query: string) => {
    setActiveTab('direktori-aplikasi');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={handleOpenUpload}
        onOpenLogin={handleOpenLogin}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'beranda' && (
          <HomeView
            stats={stats}
            applications={applications}
            schools={schools}
            onNavigate={handleNavigate}
            onOpenApplicationDetail={(app) => setDetailApp(app)}
            onOpenSchoolDetail={(sch) => setDetailSchool(sch)}
            onOpenQr={(app) => setQrApp(app)}
            onOpenUpload={handleOpenUpload}
            onSearchGlobal={handleGlobalSearch}
          />
        )}

        {activeTab === 'direktori-aplikasi' && (
          <ApplicationDirectory
            onOpenDetail={(app) => setDetailApp(app)}
            onOpenQr={(app) => setQrApp(app)}
            initialCategory={filterCategory}
            initialDistrict={filterDistrict}
          />
        )}

        {activeTab === 'direktori-sekolah' && (
          <SchoolDirectory
            onSelectSchool={(school) => setDetailSchool(school)}
          />
        )}

        {activeTab === 'statistik' && (
          <InnovationAnalytics
            onSelectSchool={(school) => setDetailSchool(school)}
            onFilterByCategory={(cat) => handleNavigate('direktori-aplikasi', { category: cat })}
            onFilterByDistrict={(dist) => handleNavigate('direktori-aplikasi', { district: dist })}
          />
        )}

        {activeTab === 'panduan' && (
          <PlatformGuide />
        )}

        {activeTab === 'unggah' && (
          <UploadApplicationForm
            onSuccess={() => {
              refreshData();
            }}
            onCancel={() => {
              setActiveTab('beranda');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'kelola' && (
          <AdminDashboard
            onRefreshData={refreshData}
            onOpenApplicationDetail={(app) => setDetailApp(app)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Interactive Global Modals */}
      <ApplicationDetailModal
        application={detailApp}
        onClose={() => setDetailApp(null)}
        onOpenQr={(app) => setQrApp(app)}
        onOpenReport={(app) => setReportApp(app)}
        onOpenFeedback={(app) => setFeedbackApp(app)}
        onSelectRelatedApp={(app) => setDetailApp(app)}
        onSelectSchool={(school) => {
          setDetailApp(null);
          setDetailSchool(school);
        }}
      />

      <SchoolDetailModal
        school={detailSchool}
        onClose={() => setDetailSchool(null)}
        onSelectApplication={(app) => {
          setDetailSchool(null);
          setDetailApp(app);
        }}
      />

      <QrCodeModal
        application={qrApp}
        onClose={() => setQrApp(null)}
      />

      <ReportModal
        application={reportApp}
        onClose={() => setReportApp(null)}
        onSuccess={refreshData}
      />

      <FeedbackModal
        application={feedbackApp}
        onClose={() => setFeedbackApp(null)}
        onSuccess={refreshData}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(loggedRole) => {
          refreshData();
          if (loggedRole === 'admin' || loggedRole === 'operator') {
            setActiveTab('kelola');
          }
        }}
      />

      {/* Modal Pendaftaran Wajib Pengunjung Pertama Kali (Cukup 1x Saja) */}
      <FirstTimeRegisterModal
        isOpen={!hasCompletedFirstRegistration && !currentUser}
        onOpenLoginModal={() => setIsLoginOpen(true)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
