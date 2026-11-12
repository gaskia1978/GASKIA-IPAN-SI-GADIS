/**
 * ASKIA-SI GADIS - Admin & Operator Management Console
 * Mengakomodasi otorisasi penuh Admin Pengawas dan otorisasi terbatas Operator Sekolah.
 * Dilengkapi verifikasi inovasi, manajemen sekolah, ekspor Excel, dan pembersihan data demo.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Building2, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Power, 
  ExternalLink, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  MessageSquare,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Download,
  Key,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Save,
  CheckCheck,
  Database
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { OFFICIAL_SYSTEM_CREDENTIALS } from '../../data/initialData';
import { Application, School, Category, VerificationStatus, ReportStatus, Report } from '../../types';

interface AdminDashboardProps {
  onRefreshData: () => void;
  onOpenApplicationDetail: (app: Application) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onRefreshData,
  onOpenApplicationDetail,
}) => {
  const { currentUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'apps' | 'schools' | 'categories' | 'reports' | 'demo' | 'accounts'>(
    'apps'
  );

  // Data state
  const [applications, setApplications] = useState<Application[]>(() => {
    const all = StorageService.getApplications();
    if (role === 'operator' && currentUser?.school_id) {
      return all.filter(a => a.school_id === currentUser.school_id);
    }
    return all;
  });

  const [schools, setSchools] = useState<School[]>(() => {
    const all = StorageService.getSchools();
    if (role === 'operator' && currentUser?.school_id) {
      return all.filter(s => s.id === currentUser.school_id);
    }
    return all;
  });

  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [reports, setReports] = useState<Report[]>(() => StorageService.getReports());

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Application | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Password visibility and copy states for Accounts tab
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showNotification(`"${text}" berhasil disalin ke clipboard.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const togglePasswordVisibility = (email: string) => {
    setRevealedPasswords(prev => ({ ...prev, [email]: !prev[email] }));
  };

  // Refresh helper
  const reloadData = () => {
    const allApps = StorageService.getApplications();
    if (role === 'operator' && currentUser?.school_id) {
      setApplications(allApps.filter(a => a.school_id === currentUser.school_id));
    } else {
      setApplications(allApps);
    }

    const allSchools = StorageService.getSchools();
    if (role === 'operator' && currentUser?.school_id) {
      setSchools(allSchools.filter(s => s.id === currentUser.school_id));
    } else {
      setSchools(allSchools);
    }

    setCategories(StorageService.getCategories());
    setReports(StorageService.getReports());
    onRefreshData();
  };

  const [isSyncing, setIsSyncing] = useState(false);

  // State fitur Simpan Perubahan (Super Admin Pengawas)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  isSavingRef.current = isSavingChanges;

  // Otomatis sinkronisasi server sentral & polling real-time
  useEffect(() => {
    let isMounted = true;

    const performSync = async () => {
      if (isSavingRef.current) return;
      await StorageService.syncWithServer();
      if (isMounted) reloadData();
    };

    // 1. Sinkronisasi instan saat konsol dibuka
    performSync();

    // 2. Listener event pembaruan data
    const handleUpdate = () => {
      if (isMounted) reloadData();
    };
    window.addEventListener('askia_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // 3. Polling background berkala agar inovasi baru dari sekolah dampingan tetap terhubung
    const interval = setInterval(() => {
      performSync();
    }, 6000);

    return () => {
      isMounted = false;
      window.removeEventListener('askia_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [role, currentUser?.school_id]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await StorageService.syncWithServer();
    reloadData();
    setIsSyncing(false);
    const total = StorageService.getApplications().length;
    showNotification(`Database sentral disinkronkan. Total ${total} aplikasi aktif terhubung.`);
  };

  // Simpan Seluruh Perubahan Permanen ke Server Database Disk
  const handleSaveAllChanges = async () => {
    setIsSavingChanges(true);
    try {
      const res = await StorageService.saveAllChanges();
      reloadData();
      setHasUnsavedChanges(false);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSavedTime(timeStr);
      showNotification(`Seluruh perubahan berhasil disimpan permanen ke database pada ${timeStr}. Aman saat reload / refresh platform!`);
    } catch (err) {
      console.error('Gagal menyimpan perubahan:', err);
      showNotification('Gagal menyimpan ke server sentral, perubahan tetap dicadangkan secara lokal.', 'error');
    } finally {
      setIsSavingChanges(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Actions for applications dengan penyimpanan permanen otomatis
  const handleVerify = async (appId: string, status: VerificationStatus, notes?: string) => {
    StorageService.updateVerificationStatus(appId, status, notes);
    reloadData();
    setSelectedAppForEdit(null);
    showNotification(`Status aplikasi berhasil diubah menjadi "${status}". Menyimpan permanen ke server...`);
    
    // Simpan permanen ke database server disk
    await StorageService.saveAllChanges();
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    setLastSavedTime(timeStr);
    setHasUnsavedChanges(false);
    showNotification(`Perubahan verifikasi aplikasi berhasil disimpan permanen (${timeStr}). Aman saat reload!`);
  };

  const handleToggleActive = async (appId: string) => {
    StorageService.toggleApplicationActive(appId);
    reloadData();
    await StorageService.saveAllChanges();
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    setLastSavedTime(timeStr);
    setHasUnsavedChanges(false);
    showNotification(`Status keaktifan aplikasi berhasil diperbarui & disimpan permanen (${timeStr}).`);
  };

  const handleDeleteApp = async (appId: string, appName: string) => {
    if (window.confirm(`Yakin ingin menghapus inovasi "${appName}" dari sistem? Penghapusan bersifat permanen.`)) {
      setIsSavingChanges(true);
      try {
        await StorageService.deleteApplication(appId);
        reloadData();
        await StorageService.saveAllChanges();
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        setLastSavedTime(timeStr);
        setHasUnsavedChanges(false);
        showNotification(`Aplikasi "${appName}" berhasil dihapus secara permanen (${timeStr}). Data tidak akan kembali lagi.`);
      } finally {
        setIsSavingChanges(false);
      }
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (window.confirm(`Yakin ingin menghapus sekolah "${schoolName}" dari sistem? Penghapusan bersifat permanen.`)) {
      setIsSavingChanges(true);
      try {
        await StorageService.deleteSchool(schoolId);
        reloadData();
        await StorageService.saveAllChanges();
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        setLastSavedTime(timeStr);
        setHasUnsavedChanges(false);
        showNotification(`Sekolah "${schoolName}" berhasil dihapus secara permanen (${timeStr}). Data tidak akan muncul kembali.`);
      } finally {
        setIsSavingChanges(false);
      }
    }
  };

  // Category Actions dengan penyimpanan permanen
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    StorageService.saveCategory({
      id: `cat-${Date.now()}`,
      category_name: newCatName.trim(),
      description: newCatDesc.trim() || 'Kategori Inovasi Baru',
    });
    setNewCatName('');
    setNewCatDesc('');
    reloadData();
    await StorageService.saveAllChanges();
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    setLastSavedTime(timeStr);
    setHasUnsavedChanges(false);
    showNotification(`Kategori baru berhasil ditambahkan & disimpan permanen (${timeStr}).`);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Hapus kategori "${name}"?`)) {
      StorageService.deleteCategory(id);
      reloadData();
      await StorageService.saveAllChanges();
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSavedTime(timeStr);
      setHasUnsavedChanges(false);
      showNotification(`Kategori dihapus & disimpan permanen (${timeStr}).`);
    }
  };

  // Report status update dengan penyimpanan permanen
  const handleUpdateReportStatus = async (repId: string, status: ReportStatus) => {
    StorageService.updateReportStatus(repId, status);
    reloadData();
    await StorageService.saveAllChanges();
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    setLastSavedTime(timeStr);
    setHasUnsavedChanges(false);
    showNotification(`Laporan diperbarui menjadi "${status}" & disimpan permanen (${timeStr}).`);
  };

  // Section K: Demo Data Purge
  const handlePurgeDemo = async () => {
    if (window.confirm('PERINGATAN: Anda akan menghapus seluruh data demonstrasi [DEMO] (aplikasi & sekolah demo). Data aktual yang diinput manual tidak akan terhapus. Lanjutkan?')) {
      const result = await StorageService.purgeDemoData();
      reloadData();
      await StorageService.saveAllChanges();
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSavedTime(timeStr);
      setHasUnsavedChanges(false);
      showNotification(`Berhasil membersihkan ${result.removedApps} aplikasi demo dan ${result.removedSchools} sekolah demo secara permanen (${timeStr}).`);
    }
  };

  const handleRestoreDemo = async () => {
    if (window.confirm('Perbarui daftar kategori & jenis aplikasi referensi? Aplikasi dan sekolah demo tetap dinonaktifkan dan tidak akan dimunculkan.')) {
      await StorageService.restoreDemoData();
      reloadData();
      await StorageService.saveAllChanges();
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSavedTime(timeStr);
      setHasUnsavedChanges(false);
      showNotification(`Data referensi diperbarui (${timeStr}). Aplikasi dan sekolah demo tetap tidak dimunculkan.`);
    }
  };

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.application_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || app.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              role === 'admin' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {role === 'admin' ? 'Super Admin Pengawas' : `Operator: ${currentUser?.school_name}`}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Sentral Terhubung</span>
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold" title="Seluruh perubahan disimpan permanen di database server dan aman saat refresh/reload">
              <Database className="w-3 h-3 text-blue-600" />
              <span>Penyimpanan Permanen Aktif {lastSavedTime ? `(Tersimpan: ${lastSavedTime})` : '• Anti-Hilang saat Reload'}</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {role === 'admin' ? 'Konsol Pengelolaan Pengawas' : 'Dasbor Operator Sekolah'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {role === 'admin'
              ? 'Verifikasi karya digital, kendalikan status publikasi, kelola data sekolah dampingan, dan ekspor data.'
              : 'Kelola aplikasi digital sekolah Anda, pantau status kurasi verifikasi pengawas, dan perbarui data.'}
          </p>
        </div>

        {/* Global Action: Save Changes, Export & Sync */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {role === 'admin' && (
            <button
              onClick={handleSaveAllChanges}
              disabled={isSavingChanges}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title="Kunci dan simpan seluruh perubahan secara permanen ke server database. Aman saat reload atau refresh!"
            >
              {isSavingChanges ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan</span>
                  {lastSavedTime && (
                    <span className="text-[10px] text-emerald-200 font-normal hidden sm:inline ml-1">
                      ({lastSavedTime})
                    </span>
                  )}
                </>
              )}
            </button>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
            title="Sinkronkan dengan data unggahan sekolah terbaru"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>

          <button
            onClick={() => StorageService.exportApplicationsToExcel()}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Aplikasi (.xlsx)</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={() => StorageService.exportSchoolsToExcel()}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Ekspor Sekolah (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('apps')}
          className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'apps'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Aplikasi ({applications.length})</span>
        </button>

        {role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('schools')}
              className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'schools'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sekolah Dampingan ({schools.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Kelola Kategori ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Laporan Kendala ({reports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'accounts'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Akun & Password Resmi</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Manajemen Data Demo</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: MANAJEMEN APLIKASI */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          
          {/* Banner Antrean Verifikasi untuk Super Admin Pengawas */}
          {applications.filter(a => a.verification_status === 'Menunggu Verifikasi').length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                    <span>Terdapat {applications.filter(a => a.verification_status === 'Menunggu Verifikasi').length} Karya Inovasi Sekolah Baru Menunggu Verifikasi!</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white uppercase tracking-wider">
                      Antrean Pengawas
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    Setiap aplikasi yang diunggah oleh sekolah dampingan secara otomatis terhubung ke konsol pengawas dan siap dikurasi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter('Menunggu Verifikasi')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>Tinjau Aplikasi Antrean ({applications.filter(a => a.verification_status === 'Menunggu Verifikasi').length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Filter Status Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Semua ({applications.length})
            </button>

            <button
              onClick={() => setStatusFilter('Menunggu Verifikasi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Menunggu Verifikasi'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>Menunggu Verifikasi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'Menunggu Verifikasi' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900 font-bold'
              }`}>
                {applications.filter(a => a.verification_status === 'Menunggu Verifikasi').length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Disetujui')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Disetujui'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>Disetujui ({applications.filter(a => a.verification_status === 'Disetujui').length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Ditolak')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'Ditolak'
                  ? 'bg-rose-700 text-white font-bold shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Ditolak ({applications.filter(a => a.verification_status === 'Ditolak').length})
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Controls bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Cari kode, nama, atau sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Semua Status</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">No</th>
                  <th className="py-3 px-4">Nama Aplikasi & Kode</th>
                  <th className="py-3 px-4">Sekolah & Wilayah</th>
                  <th className="py-3 px-4">Kategori & Tipe</th>
                  <th className="py-3 px-4">Status Verifikasi</th>
                  <th className="py-3 px-4">Keaktifan</th>
                  <th className="py-3 px-4 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada aplikasi yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            {app.registration_code}
                          </span>
                          {app.is_demo && (
                            <span className="text-[9px] font-bold px-1 bg-amber-50 text-amber-700 rounded border border-amber-300">
                              DEMO
                            </span>
                          )}
                          {app.connected_to_supervisor && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" title="Otomatis terhubung ke Super Admin Pengawas">
                              <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                              <span>Pengawas Dampingan</span>
                            </span>
                          )}
                        </div>
                        <div 
                          onClick={() => onOpenApplicationDetail(app)}
                          className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-xs mt-0.5 line-clamp-1"
                        >
                          {app.application_name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 line-clamp-1">{app.school_name}</div>
                        <div className="text-[11px] text-slate-400">Kec. {app.district}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-blue-700 font-semibold">{app.category}</div>
                        <div className="text-[10px] text-slate-500 truncate">{app.application_type}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {app.verification_status === 'Disetujui' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Disetujui</span>
                          </span>
                        )}
                        {app.verification_status === 'Menunggu Verifikasi' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu</span>
                          </span>
                        )}
                        {app.verification_status === 'Ditolak' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Ditolak</span>
                          </span>
                        )}
                        {app.verification_status === 'Tidak Aktif' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            <span>Tidak Aktif</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(app.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                            app.is_active 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {app.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {role === 'admin' && (
                            <>
                              {app.verification_status === 'Menunggu Verifikasi' && (
                                <button
                                  onClick={() => {
                                    setSelectedAppForEdit(app);
                                    setVerificationNotes(app.verification_notes || '');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer mr-1"
                                  title="Verifikasi aplikasi yang baru diunggah"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Tinjau</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedAppForEdit(app);
                                  setVerificationNotes(app.verification_notes || '');
                                }}
                                title="Verifikasi / Edit Keputusan"
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {app.verification_status !== 'Disetujui' && (
                                <button
                                  onClick={() => handleVerify(app.id, 'Disetujui', 'Disetujui langsung oleh pengawas sekolah.')}
                                  title="Langsung Setujui"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}

                              {app.verification_status !== 'Ditolak' && (
                                <button
                                  onClick={() => handleVerify(app.id, 'Ditolak', 'Belum memenuhi kriteria teknis.')}
                                  title="Tolak Publikasi"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteApp(app.id, app.application_name)}
                                title="Hapus Aplikasi"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <a
                            href={app.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Tautan Eksternal"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Verification Modal for Admin */}
          {selectedAppForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Verifikasi Inovasi Aplikasi
                  </h3>
                  <button 
                    onClick={() => setSelectedAppForEdit(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl mb-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedAppForEdit.application_name}</div>
                  <div className="text-slate-500">{selectedAppForEdit.school_name} (Wilayah: Kec. {selectedAppForEdit.district})</div>
                  <a 
                    href={selectedAppForEdit.application_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-700 hover:underline flex items-center gap-1 font-mono pt-1"
                  >
                    <span>{selectedAppForEdit.application_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl mb-4 text-[11px] text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Otomatis Terhubung ke Super Admin Pengawas</div>
                    <div className="text-blue-700">
                      Pengawas Pembina: <span className="font-semibold">{selectedAppForEdit.supervisor_name || 'Dr. H. Bambang Sujarwo, M.Pd.'}</span> ({selectedAppForEdit.assigned_supervisor_email || 'ijinoperasionalsekolahkab.lmj@gmail.com'})
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-semibold text-slate-700">
                    Catatan Supervisi / Rekomendasi Pengawas:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan evaluasi instrumen, rekomendasi perbaikan, atau apresiasi inovasi..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                  <button
                    onClick={() => handleVerify(selectedAppForEdit.id, 'Ditolak', verificationNotes)}
                    className="flex items-center gap-1.5 px-4 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak & Simpan</span>
                  </button>
                  <button
                    onClick={() => handleVerify(selectedAppForEdit.id, 'Disetujui', verificationNotes)}
                    className="flex items-center gap-1.5 px-5 py-2 text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Setujui & Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN SEKOLAH */}
      {activeTab === 'schools' && role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Data Sekolah Dampingan Pengawas
              </h2>
              <p className="text-xs text-slate-500">
                Daftar institusi pendidikan yang terintegrasi di sistem
              </p>
            </div>
            <button
              onClick={() => StorageService.exportSchoolsToExcel()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap Sekolah</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">No</th>
                  <th className="py-3 px-4">Nama Sekolah</th>
                  <th className="py-3 px-4">NPSN</th>
                  <th className="py-3 px-4">Kecamatan</th>
                  <th className="py-3 px-4">Kepala Sekolah</th>
                  <th className="py-3 px-4">Kontak Email</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Belum ada data sekolah dampingan aktual yang terdaftar di sistem.
                    </td>
                  </tr>
                ) : (
                  schools.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.school_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.npsn}</td>
                      <td className="py-3 px-4 text-slate-600">{s.district}</td>
                      <td className="py-3 px-4 text-slate-800">{s.principal_name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.contact_email}</td>
                      <td className="py-3 px-4 text-center">
                        {s.is_demo ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-300">
                            DEMO
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-300">
                            AKTUAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSchool(s.id, s.school_name)}
                          title="Hapus sekolah secara permanen"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAJEMEN KATEGORI */}
      {activeTab === 'categories' && role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Tambah Kategori Baru</span>
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Robotika & IoT Sekolah"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan cakupan bidang inovasi..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Simpan Kategori
              </button>
            </form>
          </div>

          <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Kategori Aplikasi ({categories.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.category_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.category_name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAPORAN PENGADUAN */}
      {activeTab === 'reports' && role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">
              Pengaduan & Laporan Kendala Pengunjung ({reports.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pantau laporan link tidak aktif, aplikasi tertutup, atau konten yang dilaporkan pengunjung
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada laporan kendala yang masuk. Sistem berjalan normal.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {rep.report_type}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {rep.application_name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-2xl">
                      {rep.report_description}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Pelapor: {rep.reporter_name} ({rep.reporter_email}) · {rep.created_at.split('T')[0]}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={rep.report_status}
                      onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value as ReportStatus)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Menunggu Peninjauan">Menunggu Peninjauan</option>
                      <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MANAJEMEN AKUN & PASSWORD RESMI SISTEM */}
      {activeTab === 'accounts' && role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                  <Key className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Daftar Akun dan Password Resmi Akses Sistem
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Kredensial login resmi untuk Admin Pengawas (Akses Penuh &apos;Panel Admin&apos;) dan Operator Sekolah binaan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sistem Siap Digunakan</span>
                </span>
              </div>
            </div>

            {/* Petunjuk Penggunaan */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Ketentuan Hak Akses &amp; Otorisasi:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                <li>
                  <strong className="text-blue-900">Admin Pengawas:</strong> Memiliki otorisasi penuh untuk mengakses menu <span className="font-semibold text-blue-800">Panel Admin</span>, memverifikasi dan mengkurasi aplikasi, mengelola kategori, mengelola sekolah, serta mengunduh rekap Excel.
                </li>
                <li>
                  <strong className="text-emerald-900">Operator Sekolah:</strong> Memiliki otorisasi khusus untuk mendaftarkan dan mengelola karya inovasi digital sekolah masing-masing.
                </li>
                <li>
                  <strong>Fitur Kemudahan:</strong> Pengguna dapat menyalin email/password secara langsung atau memanfaatkan tombol <em>&ldquo;Gunakan Akun Ini (Isi Otomatis)&rdquo;</em> pada jendela Masuk Platform.
                </li>
              </ul>
            </div>

            {/* Bagian 1: Akun Admin Pengawas */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Akun Admin Pengawas (Hak Akses Penuh: Panel Admin)
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {OFFICIAL_SYSTEM_CREDENTIALS.filter(c => c.role === 'admin').map((cred) => {
                  const isRevealed = !!revealedPasswords[cred.email];
                  const isCopiedEmail = copiedKey === `email-${cred.email}`;
                  const isCopiedPwd = copiedKey === `pwd-${cred.email}`;

                  return (
                    <div 
                      key={cred.email} 
                      className="p-5 rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/40 to-white hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-800 text-white uppercase tracking-wider">
                            Super Admin Pengawas
                          </span>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                            Panel Admin: Aktif
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {cred.full_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {cred.school_name}
                          </p>
                          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                            {cred.label}
                          </p>
                        </div>

                        {/* Email box */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              Email Akun
                            </span>
                            <button
                              onClick={() => handleCopyText(cred.email, `email-${cred.email}`)}
                              className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{isCopiedEmail ? 'Disalin!' : 'Salin'}</span>
                            </button>
                          </div>
                          <p className="text-xs font-mono font-bold text-slate-800 break-all select-all">
                            {cred.email}
                          </p>
                        </div>

                        {/* Password box */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Password
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePasswordVisibility(cred.email)}
                                className="text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-0.5"
                              >
                                {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{isRevealed ? 'Tutup' : 'Lihat'}</span>
                              </button>
                              <button
                                onClick={() => handleCopyText(cred.password, `pwd-${cred.email}`)}
                                className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{isCopiedPwd ? 'Disalin!' : 'Salin'}</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-mono font-bold text-blue-900 tracking-wide select-all">
                            {isRevealed ? cred.password : '••••••••••••'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Akses Penuh
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Terkonfirmasi Aktif
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bagian 2: Akun Operator Sekolah */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Akun Operator Sekolah (Hak Akses: Pengelolaan Aplikasi Sekolah)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {OFFICIAL_SYSTEM_CREDENTIALS.filter(c => c.role === 'operator').map((cred) => {
                  const isRevealed = !!revealedPasswords[cred.email];
                  const isCopiedEmail = copiedKey === `email-${cred.email}`;
                  const isCopiedPwd = copiedKey === `pwd-${cred.email}`;

                  return (
                    <div 
                      key={cred.email} 
                      className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white uppercase tracking-wider">
                            Operator Sekolah
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                            {cred.school_name}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {cred.full_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {cred.label}
                          </p>
                        </div>

                        {/* Email box */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              Email Akun
                            </span>
                            <button
                              onClick={() => handleCopyText(cred.email, `email-${cred.email}`)}
                              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{isCopiedEmail ? 'Disalin!' : 'Salin'}</span>
                            </button>
                          </div>
                          <p className="text-xs font-mono font-bold text-slate-800 break-all select-all">
                            {cred.email}
                          </p>
                        </div>

                        {/* Password box */}
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Password
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePasswordVisibility(cred.email)}
                                className="text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-0.5"
                              >
                                {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{isRevealed ? 'Tutup' : 'Lihat'}</span>
                              </button>
                              <button
                                onClick={() => handleCopyText(cred.password, `pwd-${cred.email}`)}
                                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{isCopiedPwd ? 'Disalin!' : 'Salin'}</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-mono font-bold text-emerald-900 tracking-wide select-all">
                            {isRevealed ? cred.password : '••••••••••••'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Kelola Aplikasi Sekolah
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Terkonfirmasi Aktif
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: SECTION K - MANAJEMEN DATA DEMO */}
      {activeTab === 'demo' && role === 'admin' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pembersihan Data Demonstrasi (Section K)
              </h2>
              <p className="text-xs text-slate-500">
                Mekanisme resmi untuk membersihkan data contoh sebelum platform digunakan secara operasional.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Status Aplikasi &amp; Sekolah Demo: Dihapus Permanen dari Sistem</span>
            </div>
            <p className="leading-relaxed">
              Seluruh aplikasi dan sekolah percontohan <strong>[DEMO]</strong> telah dihapus secara permanen dari sistem dan tidak akan dimunculkan kembali baik pada akun utama Panel Admin maupun pada dashboard pengguna baru/pengunjung.
              Hanya data sekolah dan inovasi aplikasi aktual yang diunggah sekolah yang tampil di platform.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePurgeDemo}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Sisa Data Demonstrasi (Siap Operasional)</span>
            </button>

            <button
              onClick={handleRestoreDemo}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Perbarui Data Kategori Referensi (Tanpa Data Demo)</span>
            </button>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  if (window.confirm('Reset status registrasi pertama kali untuk menguji tampilan pendaftaran pengunjung baru?')) {
                    localStorage.removeItem('askia_first_registration_completed_v1');
                    localStorage.removeItem('askia_current_user_v1');
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Uji Tampilan Registrasi Pengunjung Pertama Kali</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
