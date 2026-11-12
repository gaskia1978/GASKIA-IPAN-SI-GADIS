/**
 * ASKIA-SI GADIS - Application Detail Modal
 * Menampilkan rincian komprehensif aplikasi inovasi digital sekolah (17+ komponen detail)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ExternalLink, 
  Youtube, 
  Building2, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  QrCode, 
  Heart, 
  Share2, 
  AlertTriangle, 
  MessageSquare, 
  Star,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { Application, Feedback, School } from '../../types';
import { StorageService } from '../../services/storage';

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onOpenQr: (app: Application) => void;
  onOpenReport: (app: Application) => void;
  onOpenFeedback: (app: Application) => void;
  onSelectRelatedApp?: (app: Application) => void;
  onSelectSchool?: (school: School) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onOpenQr,
  onOpenReport,
  onOpenFeedback,
  onSelectRelatedApp,
  onSelectSchool,
}) => {
  if (!application) return null;

  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'feedback'>('info');

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const loadFeedbacks = useCallback(() => {
    if (!application) return;
    const list = StorageService.getFeedbacks(application.id, application.registration_code);
    setFeedbacks(list);
  }, [application]);

  useEffect(() => {
    loadFeedbacks();
    const handleUpdate = () => {
      loadFeedbacks();
    };
    window.addEventListener('askia_data_updated', handleUpdate);
    window.addEventListener('askia_feedback_added', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('askia_data_updated', handleUpdate);
      window.removeEventListener('askia_feedback_added', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFeedbacks]);
  const school = StorageService.getSchoolById(application.school_id);
  const allApps = StorageService.getApplications();
  const relatedApps = allApps
    .filter(a => a.id !== application.id && (a.category === application.category || a.district === application.district))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(application.application_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    StorageService.incrementViews(application.id);
    window.open(application.application_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden my-auto">
        
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded">
              {application.registration_code}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-blue-700 truncate">
              {application.category}
            </span>
            {application.is_demo && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded border border-amber-300">
                DEMO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQr(application)}
              title="Tampilkan QR Code"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              title="Salin tautan"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
            >
              <Share2 className="w-5 h-5" />
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow">
                  Disalin!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Hero Banner with Thumbnail and Quick Title */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[16/11]">
              {!imageError && application.thumbnail_url ? (
                <img
                  src={application.thumbnail_url}
                  alt={application.application_name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-sky-900 flex flex-col items-center justify-center p-6 text-center text-white">
                  <Sparkles className="w-10 h-10 text-cyan-300 mb-2" />
                  <span className="text-sm font-semibold">{application.application_name}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {application.verification_status === 'Disetujui' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Inovasi Terverifikasi Pengawas</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded border border-amber-200">
                    <span>Status: {application.verification_status}</span>
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs text-slate-600 bg-slate-100 rounded">
                  {application.application_type}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {application.application_name}
              </h2>

              {/* School identity click */}
              <div 
                onClick={() => school && onSelectSchool && onSelectSchool(school)}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>{application.school_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      NPSN: {school?.npsn || '-'} · Kec. {application.district}
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-700 font-semibold group-hover:underline">
                    Lihat Profil Sekolah →
                  </span>
                </div>
              </div>

              {/* Primary action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleOpenApp}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <span>Buka Aplikasi Digital</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                {application.demo_url && (
                  <a
                    href={application.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Video Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs inside Modal */}
          <div className="flex items-center gap-4 border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setActiveSubTab('info')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeSubTab === 'info'
                  ? 'text-blue-900 border-b-2 border-blue-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Informasi & Panduan
            </button>
            <button
              onClick={() => {
                setActiveSubTab('feedback');
                loadFeedbacks();
              }}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'feedback'
                  ? 'text-blue-900 border-b-2 border-blue-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Ulasan & Masukan</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold transition-colors ${
                feedbacks.length > 0
                  ? 'bg-blue-100 text-blue-800 font-bold'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {feedbacks.length}
              </span>
            </button>
          </div>

          {activeSubTab === 'info' ? (
            <div className="space-y-6 text-sm">
              {/* Deskripsi */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deskripsi Inovasi
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {application.description}
                </p>
              </div>

              {/* Grid 2 Kolom: Tujuan/Manfaat & Sasaran Pengguna */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/60">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tujuan & Manfaat Inovasi</span>
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {application.benefits || 'Meningkatkan efisiensi pengelolaan sekolah dan kualitas pembelajaran.'}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sasaran Pengguna</span>
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {application.target_users || 'Pendidik, Tenaga Kependidikan, dan Peserta Didik.'}
                  </p>
                </div>
              </div>

              {/* Petunjuk Penggunaan */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Petunjuk Penggunaan & Alur Akses</span>
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {application.usage_guide || '1. Akses tautan aplikasi melalui tombol Buka Aplikasi.\n2. Masuk menggunakan akun terdaftar atau ikuti panduan pada layar.\n3. Hubungi tim pengembang jika memerlukan bantuan akses tambahan.'}
                </div>
              </div>

              {/* Catatan Verifikasi Pengawas (jika ada) */}
              {application.verification_notes && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Catatan Tim Verifikator Pengawas</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    {application.verification_notes}
                  </p>
                </div>
              )}

              {/* Meta Informasi Tabel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Pengembang / Tim</span>
                  <span className="font-semibold text-slate-800">{application.developer_name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tanggal Unggah</span>
                  <span className="font-semibold text-slate-800">{application.created_at ? application.created_at.split('T')[0] : '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dilihat</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{application.views_count || 1} kali</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Disukai</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{application.favorites_count || 0} pendidik</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ulasan Praktik Baik ({feedbacks.length})
                  </h4>
                  {feedbacks.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {(feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)} / 5.0
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onOpenFeedback(application)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tulis Ulasan</span>
                </button>
              </div>

              {feedbacks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600">
                    Belum ada ulasan untuk aplikasi ini.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jadilah yang pertama membagikan pengalaman penggunaan aplikasi ini!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{fb.user_name}</div>
                          <div className="text-[11px] text-slate-500">{fb.user_role}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {fb.feedback_text}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        {fb.created_at ? (fb.created_at.includes('T') ? fb.created_at.split('T')[0] : fb.created_at) : 'Baru saja'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rekomendasi Aplikasi Sejenis */}
          {relatedApps.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Inovasi Terkait Lainnya
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedApps.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedApp && onSelectRelatedApp(rel)}
                    className="p-3 bg-slate-50 hover:bg-white hover:shadow-sm rounded-xl border border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-semibold text-blue-700 truncate mb-1">
                      {rel.category}
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 line-clamp-1 mb-1">
                      {rel.application_name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {rel.school_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onOpenReport(application)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Laporkan Kendala / Link Rusak</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFeedback(application)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Beri Ulasan
            </button>
            <button
              onClick={handleOpenApp}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <span>Buka Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
