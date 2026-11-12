/**
 * ASKIA-SI GADIS - School Detail Modal
 * Menampilkan profil lengkap sekolah pengembang dan seluruh aplikasi inovasinya
 */

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { School, Application } from '../../types';
import { StorageService } from '../../services/storage';

interface SchoolDetailModalProps {
  school: School | null;
  onClose: () => void;
  onSelectApplication: (app: Application) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  onSelectApplication,
}) => {
  if (!school) return null;

  const [imageError, setImageError] = useState(false);
  const allApps = StorageService.getApplications();
  const schoolApps = allApps.filter(a => a.school_id === school.id);
  const approvedApps = schoolApps.filter(a => a.verification_status === 'Disetujui');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 bg-blue-50 text-blue-800 font-semibold rounded">
              NPSN: {school.npsn}
            </span>
            <span className="text-xs text-slate-500">Kec. {school.district}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {!imageError && school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={school.school_name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-blue-700" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {school.school_name}
                </h2>
                {school.is_demo && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded border border-amber-300">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{school.address}, Kec. {school.district}</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kepala Sekolah: <strong>{school.principal_name}</strong></span>
                </div>
                {school.operator_name && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pengelola: <strong>{school.operator_name}</strong></span>
                  </div>
                )}
                {school.contact_email && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{school.contact_email}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{school.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {school.description && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {school.description}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900 tabular-nums">
                {schoolApps.length}
              </div>
              <div className="text-xs text-blue-700 font-medium">
                Total Inovasi Diunggah
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-800 tabular-nums">
                {approvedApps.length}
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Telah Terverifikasi Publik
              </div>
            </div>
          </div>

          {/* List of Applications from this school */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Daftar Inovasi Aplikasi ({schoolApps.length})</span>
            </h3>

            {schoolApps.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600">
                  Sekolah ini belum mempublikasikan aplikasi digital.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {schoolApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      onClose();
                      onSelectApplication(app);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-500">
                          {app.registration_code}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-semibold text-blue-700">
                          {app.category}
                        </span>
                        {app.verification_status === 'Disetujui' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Terverifikasi</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 truncate">
                        {app.application_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {app.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 group-hover:bg-blue-700 group-hover:text-white rounded-lg transition-colors shrink-0"
                    >
                      Buka
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
