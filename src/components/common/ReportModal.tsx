/**
 * ASKIA-SI GADIS - Report Modal
 * Formulir pengaduan kendala aplikasi (tautan rusak, konten tidak sesuai, dsb.)
 */

import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Application, ReportType } from '../../types';
import { StorageService } from '../../services/storage';

interface ReportModalProps {
  application: Application | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const [reportType, setReportType] = useState<ReportType>('Link aplikasi tidak aktif');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterEmail.trim() || !description.trim()) {
      setError('Mohon lengkapi seluruh kolom formulir laporan.');
      return;
    }

    StorageService.addReport({
      application_id: application.id,
      application_name: application.application_name,
      reporter_name: reporterName.trim(),
      reporter_email: reporterEmail.trim(),
      report_type: reportType,
      report_description: description.trim(),
    });

    setSubmitted(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Laporkan Kendala Aplikasi
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[260px]">
              {application.application_name}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800">
              Laporan Berhasil Terkirim
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terima kasih atas kepedulian Anda. Tim admin pengawas akan segera meninjau dan menindaklanjuti kendala ini.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kendala
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Link aplikasi tidak aktif">Link aplikasi tidak aktif / Error 404</option>
                <option value="Informasi tidak sesuai">Informasi atau deskripsi tidak sesuai</option>
                <option value="Aplikasi tidak dapat digunakan">Aplikasi tidak dapat digunakan / izin akses tertutup</option>
                <option value="Konten yang tidak layak">Konten yang tidak layak atau melanggar norma</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pelapor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Pelapor
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@sekolah.id"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rincian Kendala yang Ditemukan
              </label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan secara spesifik apa kendala yang Anda alami saat mengakses aplikasi ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Laporan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
