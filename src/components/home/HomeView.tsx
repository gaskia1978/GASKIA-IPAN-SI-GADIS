/**
 * ASKIA-SI GADIS - Home View Component
 * Beranda publik terpadu yang menampilkan hero, statistik aktual,
 * daftar aplikasi digital terbaru, dan daftar sekolah dampingan pengembang.
 */

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Building2, 
  ExternalLink,
  ChevronRight,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { Application, School, DashboardStats } from '../../types';
import { HeroSection } from './HeroSection';
import { StatsCards } from './StatsCards';
import { ApplicationCard } from './ApplicationCard';
import { SchoolCard } from './SchoolCard';

interface HomeViewProps {
  stats: DashboardStats;
  applications: Application[];
  schools: School[];
  onNavigate: (tab: string, initialFilter?: { category?: string; district?: string }) => void;
  onOpenApplicationDetail: (app: Application) => void;
  onOpenSchoolDetail: (school: School) => void;
  onOpenQr: (app: Application) => void;
  onOpenUpload: () => void;
  onSearchGlobal: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  applications,
  schools,
  onNavigate,
  onOpenApplicationDetail,
  onOpenSchoolDetail,
  onOpenQr,
  onOpenUpload,
  onSearchGlobal,
}) => {
  // Filter for verified/active apps for public display
  const verifiedApps = applications.filter(a => a.verification_status === 'Disetujui');
  const latestApps = verifiedApps.slice(0, 6);
  const featuredSchools = schools.slice(0, 6);

  // Map school app counts
  const appCounts = React.useMemo(() => {
    const map: Record<string, { total: number; approved: number }> = {};
    schools.forEach(s => {
      map[s.id] = { total: 0, approved: 0 };
    });
    applications.forEach(a => {
      if (!map[a.school_id]) {
        map[a.school_id] = { total: 0, approved: 0 };
      }
      map[a.school_id].total += 1;
      if (a.verification_status === 'Disetujui') {
        map[a.school_id].approved += 1;
      }
    });
    return map;
  }, [schools, applications]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero Section */}
      <HeroSection
        onSearch={onSearchGlobal}
        onNavigate={onNavigate}
        onOpenUpload={onOpenUpload}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* 2. Statistik Dashboard (Section 1.B) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Statistik Ekosistem Digital Terkini
              </h2>
              <p className="text-xs text-slate-500">
                Dihitung secara otomatis berdasarkan data aktual di dalam database
              </p>
            </div>
            <button
              onClick={() => onNavigate('statistik')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Analisis Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <StatsCards
            stats={stats}
            onNavigateStat={(tab) => onNavigate(tab)}
          />
        </section>

        {/* 3. Daftar Aplikasi Digital Terbaru (Section 1.D) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Inovasi Terpilih
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">Hasil Kurasi Pengawas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Daftar Aplikasi Digital Terbaru
              </h2>
            </div>

            <button
              onClick={() => onNavigate('direktori-aplikasi')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer w-fit"
            >
              <span>Lihat Seluruh Direktori ({verifiedApps.length} Aplikasi)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {latestApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum Ada Aplikasi Terverifikasi</p>
              <p className="text-xs text-slate-500 mt-1">Aplikasi yang baru diunggah sedang menunggu peninjauan pengawas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onOpenDetail={onOpenApplicationDetail}
                  onOpenQr={onOpenQr}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. Banner Inspirasi & Ajakan Partisipasi Sekolah */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-10 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-cyan-300 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerakan Berbagi Inovasi</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sekolah Anda Memiliki Inovasi Aplikasi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Mulai dari Google Form otomatis, Google Sites portal materi, spreadsheet dashboard, 
              hingga aplikasi Android dan web mandiri—daftarkan dan publikasikan karya sekolah Anda 
              untuk menginspirasi sekolah lainnya!
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenUpload}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>Unggah Aplikasi Sekarang</span>
            </button>
          </div>
        </section>

        {/* 5. Daftar Sekolah Pengembang Aplikasi (Section 1.C) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Komunitas Dampingan
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">Pusat Keunggulan & Penggerak</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Daftar Sekolah Pengembang Aplikasi
              </h2>
            </div>

            <button
              onClick={() => onNavigate('direktori-sekolah')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer w-fit"
            >
              <span>Lihat Seluruh Sekolah ({schools.length} Lembaga)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {featuredSchools.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum Ada Sekolah Pengembang Terdaftar</p>
              <p className="text-xs text-slate-500 mt-1">Sekolah akan tampil otomatis di sini setelah mendaftarkan inovasi digital pertamanya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchools.map((school) => (
                <SchoolCard
                  key={school.id}
                  school={school}
                  totalApps={appCounts[school.id]?.total || 0}
                  approvedApps={appCounts[school.id]?.approved || 0}
                  onSelectSchool={onOpenSchoolDetail}
                />
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
};
