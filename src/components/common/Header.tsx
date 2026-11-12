/**
 * ASKIA-SI GADIS - Header Navigation
 * Mengikuti Top Bar Contract:
 * [Logo & Brand ASKIA-SI GADIS] --- [Nav Links] --- [Aksi Utama & Profil/Login]
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  School as SchoolIcon, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenLogin,
}) => {
  const { currentUser, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'direktori-aplikasi', label: 'Direktori Aplikasi' },
    { id: 'direktori-sekolah', label: 'Direktori Sekolah' },
    { id: 'statistik', label: 'Statistik Inovasi' },
    { id: 'panduan', label: 'Panduan' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* Zone 1: Brand & Logo */}
          <div 
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-sky-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-900/10 transition-transform group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
                  ASKIA-SI GADIS
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 rounded">
                  Gudang Inovasi
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                Informasi Gudang Aplikasi Digital Sekolah
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-2 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'text-blue-900' 
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* CTA Unggah Aplikasi */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unggah Aplikasi</span>
            </button>

            {/* User / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {/* Tombol Panel Admin Khusus Akun Utama Pembuat Platform (Admin) */}
                {role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('kelola')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'kelola'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}

                {/* Tombol Kelola Khusus Operator Sekolah */}
                {role === 'operator' && (
                  <button
                    onClick={() => handleNavClick('kelola')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'kelola'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <SchoolIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kelola Sekolah</span>
                  </button>
                )}

                <div 
                  onClick={() => {
                    if (role === 'admin' || role === 'operator') {
                      handleNavClick('kelola');
                    }
                  }}
                  className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-colors ${
                    role === 'admin' || role === 'operator' ? 'hover:bg-slate-100 cursor-pointer' : ''
                  }`}
                  title={
                    role === 'visitor'
                      ? `Akun Pengunjung Terdaftar: ${currentUser.full_name} (${currentUser.institution || currentUser.position || 'Terdaftar'})`
                      : 'Klik untuk membuka panel pengelolaan'
                  }
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    {role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                    ) : role === 'operator' ? (
                      <SchoolIcon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-xs font-bold text-sky-700">
                        {currentUser.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left hidden xl:block max-w-[130px]">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {currentUser.full_name.split(',')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize truncate">
                      {role === 'admin' 
                        ? 'Pengawas Sekolah' 
                        : role === 'operator' 
                          ? 'Operator Sekolah' 
                          : (currentUser.position || 'Pengunjung')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Keluar"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenUpload}
              className="p-2 text-white bg-blue-700 rounded-lg text-xs"
              title="Unggah Aplikasi"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile link to Panel Admin only for admin account */}
            {role === 'admin' && (
              <button
                onClick={() => handleNavClick('kelola')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'kelola'
                    ? 'bg-blue-900 text-white'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Panel Admin Pengawas</span>
              </button>
            )}

            {role === 'operator' && (
              <button
                onClick={() => handleNavClick('kelola')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'kelola'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <SchoolIcon className="w-4 h-4" />
                <span>Kelola Sekolah</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs">
                  <div className="font-semibold text-slate-800">{currentUser.full_name}</div>
                  <div className="text-slate-500">
                    {role === 'admin' 
                      ? 'Pengawas Sekolah' 
                      : role === 'operator' 
                        ? currentUser.school_name 
                        : (currentUser.institution || 'Pengunjung Terdaftar')}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-rose-600 bg-rose-50 rounded-lg font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
