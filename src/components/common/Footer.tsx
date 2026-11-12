/**
 * ASKIA-SI GADIS - Footer Component
 * Tampilan bersih, profesional, dan institusional
 */

import React from 'react';
import { Sparkles, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Kolom 1: Profil Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">
                  ASKIA-SI GADIS
                </span>
                <p className="text-xs text-cyan-400 font-medium">
                  Informasi Gudang Aplikasi Digital Sekolah
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Wadah digital terpadu untuk menghimpun, mendokumentasikan, mempublikasikan, 
              dan mereplikasi inovasi aplikasi digital hasil karya sekolah dampingan pengawas.
            </p>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 max-w-md">
              <div className="text-xs font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tagline Platform</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                &ldquo;Satu Gudang Digital, Ribuan Inspirasi Inovasi Sekolah.&rdquo;
              </p>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('beranda')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Beranda Publik
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('direktori-aplikasi')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Direktori Aplikasi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('direktori-sekolah')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Direktori Sekolah Dampingan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('statistik')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Statistik & Grafik Inovasi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('panduan')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Panduan & Tata Cara
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Verifikasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Pembinaan & Kontak
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verifikasi Resmi oleh Koordinator Pengawas Sekolah</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Kabupaten Lumajang, Jawa Timur</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">pengawas.sekolah@dinas.lumajangkab.go.id</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Server Siap Operasional</span>
              </div>
            </div>
          </div>

        </div>

        {/* Baris Bawah */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ASKIA-SI GADIS. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <span>Standar Kurikulum Merdeka</span>
            <span>·</span>
            <span>Transformasi Digital Sekolah</span>
            <span>·</span>
            <span className="text-slate-400">v1.2 Produksi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
