/**
 * ASKIA-SI GADIS - Application Card Component
 * Kartu ringkas dan elegan untuk menampilkan inovasi aplikasi digital sekolah.
 */

import React, { useState } from 'react';
import { 
  ExternalLink, 
  Eye, 
  QrCode, 
  Heart, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  Building2, 
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import { Application } from '../../types';
import { StorageService } from '../../services/storage';

interface ApplicationCardProps {
  application: Application;
  onOpenDetail: (app: Application) => void;
  onOpenQr: (app: Application) => void;
  onRefresh?: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onOpenDetail,
  onOpenQr,
  onRefresh,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(() => {
    return StorageService.getFavorites().includes(application.id);
  });
  const [favoriteCount, setFavoriteCount] = useState(application.favorites_count || 0);
  const [copied, setCopied] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fav = StorageService.toggleFavorite(application.id);
    setIsFavorited(fav);
    setFavoriteCount(prev => Math.max(0, prev + (fav ? 1 : -1)));
    if (onRefresh) onRefresh();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(application.application_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.incrementViews(application.id);
    window.open(application.application_url, '_blank', 'noopener,noreferrer');
  };

  // Status visual badge styling
  const getStatusBadge = () => {
    switch (application.verification_status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi</span>
          </span>
        );
      case 'Menunggu Verifikasi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu</span>
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <span>Nonaktif</span>
          </span>
        );
    }
  };

  return (
    <div 
      onClick={() => onOpenDetail(application)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {!imageError && application.thumbnail_url ? (
          <img
            src={application.thumbnail_url}
            alt={application.application_name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-sky-900 flex flex-col items-center justify-center p-4 text-center">
            <Sparkles className="w-8 h-8 text-cyan-300 mb-1" />
            <span className="text-xs font-semibold text-white/90 line-clamp-1">
              {application.application_name}
            </span>
            <span className="text-[10px] text-cyan-200/80">
              {application.category}
            </span>
          </div>
        )}

        {/* Floating Tag Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <div>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-1 pointer-events-auto">
            {application.is_demo && (
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-slate-900/80 text-amber-300 rounded border border-amber-400/40 backdrop-blur-xs">
                DEMO
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              title={isFavorited ? 'Hapus dari favorit' : 'Simpan favorit'}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Heart 
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Registration code overlay */}
        <div className="absolute bottom-2 left-2.5">
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-slate-800 bg-white/90 rounded backdrop-blur-xs shadow-xs border border-slate-200/60">
            {application.registration_code}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata category & type without static pill clutter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-blue-700">{application.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="truncate">{application.application_type}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors mb-2">
            {application.application_name}
          </h3>

          {/* School Name */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{application.school_name}</span>
            <span className="text-slate-400">({application.district})</span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {application.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-slate-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQr(application);
              }}
              title="Tampilkan QR Code"
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              title="Salin Tautan"
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && (
              <span className="text-[10px] text-emerald-600 font-medium animate-fade-in">
                Disalin!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(application);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Detail
            </button>
            <button
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <span>Buka</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
