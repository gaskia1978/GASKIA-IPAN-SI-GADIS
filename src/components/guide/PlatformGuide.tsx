/**
 * ASKIA-SI GADIS - Panduan & Standar Operasional Prosedur (SOP)
 * Petunjuk penggunaan untuk pengunjung, operator sekolah, dan tim pengawas
 */

import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Upload, 
  ShieldCheck, 
  Globe, 
  QrCode, 
  Download, 
  Sparkles,
  HelpCircle,
  FileCheck2,
  Users
} from 'lucide-react';

export const PlatformGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan Pengguna & SOP Inovasi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Panduan Operasional ASKIA-SI GADIS
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tata cara pemanfaatan platform, pengunggahan inovasi, dan mekanisme verifikasi oleh pengawas sekolah.
        </p>
      </div>

      {/* 3 User Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Role 1: Pengunjung */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. Bagi Pengunjung & Pendidik</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Guru, kepala sekolah, atau pengawas dapat mencari aplikasi inovasi berdasarkan mata pelajaran, kecamatan, atau jenis teknologi.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>Gunakan kolom pencarian untuk menemukan aplikasi spesifik.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>Klik tombol <strong>Buka Aplikasi</strong> untuk mengakses langsung di tab baru.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>Pindai QR Code untuk mencoba aplikasi di smartphone.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>Berikan ulasan umpan balik untuk mengapresiasi sekolah pengembang.</span>
            </li>
          </ul>
        </div>

        {/* Role 2: Operator Sekolah */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. Bagi Operator Sekolah</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Perwakilan sekolah dampingan dapat mempublikasikan karya teknologi mandiri atau berbasis Google Workspace.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Klik menu <strong>Unggah Aplikasi</strong> di navigasi atas.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Isi data identitas sekolah dan nomor NPSN resmi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pastikan izin akses (sharing permission) tautan aplikasi disetel terbuka.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Simpan Kode Registrasi untuk pelacakan status kurasi pengawas.</span>
            </li>
          </ul>
        </div>

        {/* Role 3: Pengawas Sekolah */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Bagi Pengawas Pembina</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Koordinator dan tim pengawas sekolah memvalidasi kelayakan, keamanan, dan manfaat pedagogik aplikasi.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
              <span>Masuk akun melalui tombol <strong>Masuk Akun (Admin)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
              <span>Periksa antrean aplikasi berstatus <em>Menunggu Verifikasi</em>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
              <span>Beri catatan supervisi, lalu pilih <strong>Setujui</strong> atau <strong>Tolak</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
              <span>Unduh rekap laporan digital dalam format Excel (.xlsx).</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Alur Kurasi & Verifikasi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Alur Pendaftaran & Verifikasi Inovasi Sekolah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tahapan transparan dari ide hingga publikasi di gudang aplikasi resmi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Pengisian Formulir</h4>
            <p className="text-slate-500 leading-relaxed">
              Sekolah mengisi informasi identitas, tautan aplikasi, petunjuk teknis, dan target pengguna.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Penerbitan Kode Reg</h4>
            <p className="text-slate-500 leading-relaxed">
              Sistem menerbitkan nomor registrasi unik (ASKIA-2026-XXXX) dan status menunggu kurasi.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Supervisi Pengawas</h4>
            <p className="text-slate-500 leading-relaxed">
              Pengawas menguji fungsionalitas tautan, kesesuaian kurikulum, dan memberikan catatan supervisi.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="font-bold text-emerald-950 mb-1">Publikasi & Replikasi</h4>
            <p className="text-emerald-800 leading-relaxed">
              Aplikasi tampil di direktori publik, siap dicoba dan direplikasi oleh sekolah dampingan lain.
            </p>
          </div>

        </div>
      </div>

      {/* Kriteria Verifikasi Pengawas */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-cyan-400" />
          <span>Kriteria Standar Verifikasi Inovasi Pengawas</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Setiap aplikasi yang dipublikasikan telah melalui penyaringan dengan kriteria:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong>1. Aksesibilitas:</strong> Tautan aktif, tidak meminta pembayaran tambahan yang memberatkan, dan dapat diakses dengan akun belajar.id atau browser standar.
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong>2. Relevansi Edukatif:</strong> Membantu pemecahan masalah konkret dalam pembelajaran, asesmen, atau tata kelola sekolah.
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong>3. Keamanan Data:</strong> Menjaga privasi data peserta didik dan pendidik sesuai kaidah perlindungan data pribadi.
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <strong>4. Potensi Replikasi:</strong> Memiliki dokumentasi atau alur yang memungkinkan dipelajari dan diadopsi oleh sekolah lain.
          </div>
        </div>
      </div>

    </div>
  );
};
