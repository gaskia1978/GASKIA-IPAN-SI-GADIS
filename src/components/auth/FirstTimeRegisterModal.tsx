/**
 * ASKIA-SI GADIS - First Time Visitor Registration Modal
 * Wajib diisi oleh pengunjung yang pertama kali mengakses platform.
 * Cukup diisi 1 kali, kunjungan berikutnya otomatis langsung dikenali.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  UserCheck, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';

interface FirstTimeRegisterModalProps {
  isOpen: boolean;
  onOpenLoginModal: () => void;
}

export const FirstTimeRegisterModal: React.FC<FirstTimeRegisterModalProps> = ({
  isOpen,
  onOpenLoginModal,
}) => {
  const { registerVisitor } = useAuth();
  const schools = StorageService.getSchools();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [position, setPosition] = useState('Guru Mata Pelajaran');
  const [district, setDistrict] = useState('Lumajang');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !institution.trim()) {
      setError('Mohon lengkapi Nama Lengkap, Email, dan Asal Sekolah/Instansi.');
      return;
    }

    registerVisitor({
      full_name: fullName.trim(),
      email: email.trim(),
      institution: institution.trim(),
      position,
      district,
      phone: phone.trim() || undefined,
    });

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-tr from-blue-900 via-blue-800 to-sky-600 text-white rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-50">
            <Sparkles className="w-7 h-7 text-cyan-300" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200/60 rounded-full text-xs font-bold mb-2">
            <span>Registrasi Pengunjung Pertama Kali</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang di ASKIA-SI GADIS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Informasi Gudang Aplikasi Digital Sekolah
          </p>
        </div>

        {/* 1-Time Notice Banner */}
        <div className="mb-5 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-blue-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Pendaftaran Cukup Sekali (1x) Saja</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Sebagai pengunjung baru, Anda diwajibkan mendaftarkan identitas sekali saat pertama masuk. 
            Pada kunjungan berikutnya, sistem akan <strong>otomatis mengenali akun Anda</strong> tanpa perlu mendaftar lagi!
          </p>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pendaftaran Berhasil!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mt-1">
                Akun pengunjung Anda telah tersimpan dan aktif. Selamat datang di portal inovasi digital sekolah.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                // Refresh to trigger immediate dashboard recognition
                window.location.reload();
              }}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Mulai Jelajahi Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap (beserta Gelar) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dra. Hj. Nur Aini, M.Pd."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@sekolah.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / HP (Opsional)
                </label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asal Sekolah / Lembaga / Instansi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SMKN 1 Lumajang / Dinas Pendidikan"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profesi / Peran Anda
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>Daftar & Masuk ke Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Akses Khusus Pengawas / Operator (Tampilan Diskrit & Tidak Mengganggu Pengunjung) */}
        {!isSuccess && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Akses Khusus Pengawas Pembina / Operator Sekolah
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
