/**
 * ASKIA-SI GADIS - Feedback & Review Modal
 * Memberikan masukan atau pengalaman penggunaan aplikasi inovasi sekolah
 */

import React, { useState } from 'react';
import { X, Star, MessageSquareHeart, Send, CheckCircle2 } from 'lucide-react';
import { Application } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface FeedbackModalProps {
  application: Application | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState(currentUser?.full_name || '');
  const [userRole, setUserRole] = useState(
    currentUser?.role === 'admin' 
      ? 'Pengawas Sekolah' 
      : currentUser?.institution 
        ? `${currentUser.position || 'Pendidik'} - ${currentUser.institution}`
        : currentUser?.school_name 
          ? `Guru di ${currentUser.school_name}` 
          : 'Pendidik / Pengunjung'
  );
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !feedbackText.trim()) {
      setError('Mohon lengkapi nama dan ulasan Anda.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await StorageService.addFeedback({
        application_id: application.id,
        registration_code: application.registration_code,
        application_name: application.application_name,
        user_name: userName.trim(),
        user_role: userRole.trim() || 'Pendidik',
        rating,
        feedback_text: feedbackText.trim(),
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err);
      setError('Terjadi kendala saat mengirim ulasan, silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Beri Ulasan & Umpan Balik
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
              Ulasan Anda Berhasil Ditambahkan
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Umpan balik Anda sangat berharga bagi sekolah pengembang untuk menyempurnakan inovasi ini.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tingkat Kepuasan & Kemanfaatan
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5 ? 'Sangat Menginspirasi (5/5)' : `${rating}/5 Bintang`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama & Gelar"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profesi / Asal Sekolah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Guru SMAN 1"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ulasan / Praktik Baik yang Dirasakan
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ceritakan pengalaman Anda, dampak aplikasi ini dalam proses pembelajaran, atau saran pengembangan berikutnya..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
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
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
