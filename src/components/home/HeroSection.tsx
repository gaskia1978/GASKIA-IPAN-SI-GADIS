/**
 * ASKIA-SI GADIS - Hero Section
 * Representasi visual inspiratif transformasi inovasi digital sekolah dampingan pengawas
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Upload, 
  Compass, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import heroImg from '../../assets/images/hero_digital_school_1794236889494.jpg';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onNavigate,
  onOpenUpload,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('direktori-aplikasi');
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white overflow-hidden py-12 lg:py-20 border-b border-slate-800">
      
      {/* Subtle Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Kolom Kiri: Teks & Pencarian */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Platform Resmi Inovasi Digital Sekolah</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
                ASKIA-SI GADIS
              </h1>
              <p className="text-base sm:text-lg text-cyan-300 font-semibold">
                Informasi Gudang Aplikasi Digital Sekolah
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-xl backdrop-blur-xs">
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  &ldquo;Satu Gudang Digital, Ribuan Inspirasi Inovasi Sekolah.&rdquo;
                </p>
              </div>
            </div>

            {/* Narasi Inspirasi Inovasi Digital (Section 1.F) */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              ASKIA-SI GADIS merupakan ruang kolaborasi digital untuk menghimpun dan berbagi 
              inovasi aplikasi sekolah. Melalui platform ini, setiap sekolah dapat memperkenalkan 
              karya digitalnya, sementara sekolah dan lembaga lain dapat menemukan inspirasi, 
              mempelajari, serta memanfaatkan aplikasi yang tersedia.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cari inovasi pembelajaran, asesmen, presensi..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>Cari Aplikasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('direktori-aplikasi')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4 text-blue-700" />
                <span>Jelajahi Direktori</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-700/80 hover:bg-blue-700 border border-blue-500/40 rounded-xl transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-300" />
                <span>Unggah Karya Sekolah</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terkurasi Pengawas Sekolah</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-Platform (Web, Apps Script, AI, Android)</span>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Foto Visual Dokumenter Sekolah */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-[4/3] group">
              <img
                src={heroImg || "/assets/images/hero_digital_school_1794236889494.jpg"}
                alt="Kolaborasi Inovasi Digital Guru dan Siswa Sekolah"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('unsplash.com')) {
                    target.src = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80';
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Komunitas Sekolah Dampingan Pengawas</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Mendorong replikasi praktik baik antarsekolah untuk akselerasi mutu pendidikan.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
