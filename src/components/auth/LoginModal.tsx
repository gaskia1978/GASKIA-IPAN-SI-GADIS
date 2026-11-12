/**
 * ASKIA-SI GADIS - Login & Registrasi Modal
 * Mengakomodasi:
 * 1. Pendaftaran akun pengunjung baru (1x saat pertama masuk)
 * 2. Masuk akun pengunjung terdaftar (tanpa perlu daftar lagi)
 * 3. Masuk Akun Resmi Admin Pengawas & Operator Sekolah dengan Email & Password
 *    untuk membuka akses menu "Panel Admin"
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  School, 
  ArrowRight, 
  UserCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Building2, 
  Mail,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { UserRole, SystemCredential } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (loggedRole?: UserRole) => void;
  initialTab?: 'daftar' | 'masuk-pengunjung' | 'admin-operator';
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialTab = 'masuk-pengunjung'
}) => {
  const { 
    loginAs, 
    loginWithCredentials, 
    loginVisitor, 
    registerVisitor, 
    registeredVisitors,
    systemCredentials
  } = useAuth();
  const schools = StorageService.getSchools();

  const [activeTab, setActiveTab] = useState<'daftar' | 'masuk-pengunjung' | 'admin-operator'>(
    initialTab === 'admin-operator' ? 'admin-operator' : (initialTab || 'masuk-pengunjung')
  );
  const [isAdminMode, setIsAdminMode] = useState(initialTab === 'admin-operator');

  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'admin-operator') {
        setIsAdminMode(true);
        setActiveTab('admin-operator');
      } else {
        setIsAdminMode(false);
        setActiveTab(initialTab || 'masuk-pengunjung');
      }
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab]);
  
  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regPosition, setRegPosition] = useState('Guru Mata Pelajaran');
  const [regDistrict, setRegDistrict] = useState('Lumajang');
  const [regPhone, setRegPhone] = useState('');

  // Returning visitor login state
  const [visitorEmailInput, setVisitorEmailInput] = useState('');

  // Admin / Operator Credentials State
  const [credEmail, setCredEmail] = useState('ijinoperasionalsekolahkab.lmj@gmail.com');
  const [credPassword, setCredPassword] = useState('AdminPengawas2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Register Visitor
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regInstitution.trim()) {
      setError('Mohon lengkapi Nama Lengkap, Email, dan Asal Sekolah/Instansi.');
      return;
    }

    registerVisitor({
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      institution: regInstitution.trim(),
      position: regPosition,
      district: regDistrict,
      phone: regPhone.trim() || undefined,
    });

    setSuccessMsg('Akun pengunjung berhasil didaftarkan! Anda otomatis masuk.');
    setTimeout(() => {
      if (onSuccess) onSuccess('visitor');
      onClose();
    }, 1200);
  };

  // Handle Returning Visitor Login
  const handleVisitorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorEmailInput.trim()) {
      setError('Masukkan alamat email yang pernah Anda daftarkan.');
      return;
    }

    const success = loginVisitor(visitorEmailInput.trim());
    if (success) {
      setSuccessMsg('Selamat datang kembali!');
      setTimeout(() => {
        if (onSuccess) onSuccess('visitor');
        onClose();
      }, 1000);
    } else {
      setError('Email belum terdaftar. Silakan pilih tab "Daftar Akun Baru" terlebih dahulu.');
    }
  };

  // Quick 1-click select saved visitor
  const handleSelectSavedVisitor = (email: string) => {
    loginVisitor(email);
    if (onSuccess) onSuccess('visitor');
    onClose();
  };

  // Handle Autofill Credential
  const handleAutofillCredential = (cred: SystemCredential) => {
    setCredEmail(cred.email);
    setCredPassword(cred.password);
    setError('');
  };

  // Handle Admin/Operator Credential Submit with Password
  const handleCredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credEmail.trim() || !credPassword.trim()) {
      setError('Mohon masukkan email dan kata sandi akun.');
      return;
    }

    const result = loginWithCredentials(credEmail, credPassword);
    if (result.success) {
      if (result.role === 'admin') {
        setSuccessMsg('Berhasil masuk sebagai Admin Pengawas! Mengalihkan ke Panel Admin...');
      } else {
        setSuccessMsg('Berhasil masuk sebagai Operator Sekolah! Mengalihkan ke Panel Pengelolaan...');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(result.role);
        onClose();
      }, 1000);
    } else {
      setError(result.message || 'Email atau kata sandi tidak sesuai.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2.5 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center shadow-xs">
            <KeyRound className="w-6 h-6 text-blue-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Masuk ke ASKIA-SI GADIS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat Informasi Gudang Aplikasi Digital Sekolah
          </p>
        </div>

        {/* Tab navigation khusus pengunjung */}
        {!isAdminMode ? (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('masuk-pengunjung');
                setError('');
              }}
              className={`flex-1 py-2.5 text-center rounded-lg transition-colors cursor-pointer ${
                activeTab === 'masuk-pengunjung'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk Pengunjung
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('daftar');
                setError('');
              }}
              className={`flex-1 py-2.5 text-center rounded-lg transition-colors cursor-pointer ${
                activeTab === 'daftar'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Pengunjung Baru
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-blue-900">Portal Pengawas &amp; Operator Sekolah</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('masuk-pengunjung');
                setError('');
              }}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              ← Beralih ke Pengunjung
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5 font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: ADMIN & OPERATOR (DENGAN EMAIL & PASSWORD LENGKAP) */}
        {activeTab === 'admin-operator' && (
          <div className="space-y-4">
            
            {/* Banner Informasi Akun & Password Resmi */}
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Akun & Kata Sandi Resmi Pengawas / Operator</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Gunakan kredensial resmi di bawah ini untuk mengakses <strong>Panel Admin</strong> pengawas atau panel pengelolaan sekolah dampingan:
              </p>

              {/* Quick autofill list */}
              <div className="space-y-2 pt-1">
                {/* 1. Admin Pengawas Utama */}
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-blue-900 text-xs flex items-center gap-1">
                      <span>👑 Admin Pengawas (Akses Panel Admin)</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Email: <strong>ijinoperasionalsekolahkab.lmj@gmail.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Password: <strong>AdminPengawas2026!</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutofillCredential(systemCredentials[0])}
                    className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer shrink-0"
                  >
                    Gunakan Akun Ini
                  </button>
                </div>

                {/* 2. Operator SMKN 1 Lumajang */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <span>🏫 Operator SMKN 1 Lumajang</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Email: <strong>operator@smkn1lumajang.sch.id</strong>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Password: <strong>Operator2026!</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutofillCredential(systemCredentials[3])}
                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer shrink-0"
                  >
                    Gunakan Akun Ini
                  </button>
                </div>

                {/* 3. Operator SMAN 2 Lumajang */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <span>🏫 Operator SMAN 2 Lumajang</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Email: <strong>operator@sman2lumajang.sch.id</strong>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Password: <strong>Operator2026!</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutofillCredential(systemCredentials[4])}
                    className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 cursor-pointer shrink-0"
                  >
                    Gunakan Akun Ini
                  </button>
                </div>
              </div>
            </div>

            {/* Form Login Kredensial */}
            <form onSubmit={handleCredSubmit} className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@dinas.go.id atau @sekolah.sch.id"
                    value={credEmail}
                    onChange={(e) => setCredEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 pl-9 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk & Buka Panel Admin / Operator</span>
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: MASUK PENGUNJUNG TERDAFTAR */}
        {activeTab === 'masuk-pengunjung' && (
          <div className="space-y-4">
            
            {registeredVisitors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Pilih Akun Pengunjung Tersimpan (1-Klik Masuk):
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {registeredVisitors.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectSavedVisitor(v.email)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {v.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                            {v.full_name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {v.institution || v.position || v.email}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-2 text-slate-400">Atau masuk dengan email</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email login form */}
            <form onSubmit={handleVisitorLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Terdaftar
                </label>
                <input
                  type="email"
                  required
                  placeholder="Masukkan email pengunjung yang pernah didaftarkan"
                  value={visitorEmailInput}
                  onChange={(e) => setVisitorEmailInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Masuk ke Platform
              </button>
            </form>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center">
              Belum pernah mendaftar?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('daftar');
                  setError('');
                }}
                className="font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Daftar Akun Pengunjung (Cukup 1x)
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: DAFTAR PENGUNJUNG BARU (1-TIME REGISTRATION) */}
        {activeTab === 'daftar' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-snug">
              Pendaftaran pengunjung cukup dilakukan <strong>sekali saat pertama masuk</strong>. Kunjungan berikutnya tidak perlu mendaftar ulang.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dra. Hj. Nur Aini, M.Pd."
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@sekolah.sch.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp (Opsional)
                </label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asal Sekolah / Lembaga *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SMKN 1 Lumajang / Dinas Pendidikan"
                value={regInstitution}
                onChange={(e) => setRegInstitution(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profesi / Jabatan
                </label>
                <select
                  value={regPosition}
                  onChange={(e) => setRegPosition(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                  <option value="Guru Penggerak">Guru Penggerak</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Tenaga Kependidikan / TU">Tenaga Kependidikan / TU</option>
                  <option value="Pengawas / Penilik">Pengawas / Penilik Sekolah</option>
                  <option value="Mahasiswa / Peneliti">Mahasiswa / Peneliti</option>
                  <option value="Komite / Wali Murid">Komite / Wali Murid</option>
                  <option value="Masyarakat Umum">Masyarakat Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kecamatan / Wilayah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lumajang, Pasirian"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Daftar & Langsung Masuk
            </button>
          </form>
        )}

        {/* Akses Khusus Pengawas / Operator (Disembunyikan dari menu pengunjung) */}
        {!isAdminMode ? (
          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setActiveTab('admin-operator');
                setError('');
                setSuccessMsg('');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Akses Khusus Pengawas Pembina / Operator Sekolah
            </button>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('masuk-pengunjung');
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              ← Kembali ke Masuk Pengunjung
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
