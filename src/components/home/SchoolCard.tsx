/**
 * ASKIA-SI GADIS - School Card Component
 * Menampilkan profil ringkas sekolah dampingan pengembang aplikasi
 */

import React, { useState } from 'react';
import { Building2, MapPin, Layers, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { School } from '../../types';

interface SchoolCardProps {
  school: School;
  totalApps: number;
  approvedApps: number;
  onSelectSchool: (school: School) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  totalApps,
  approvedApps,
  onSelectSchool,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      onClick={() => onSelectSchool(school)}
      className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Header: Logo & Identity */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-13 h-13 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            {!imageError && school.logo_url ? (
              <img
                src={school.logo_url}
                alt={school.school_name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <Building2 className="w-6 h-6 text-blue-700" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                NPSN: {school.npsn}
              </span>
              {school.is_demo && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-amber-700 rounded border border-amber-200">
                  DEMO
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-900 transition-colors truncate">
              {school.school_name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Kec. {school.district}</span>
            </div>
          </div>
        </div>

        {/* Principal Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">KS: {school.principal_name}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {school.description || school.address}
        </p>
      </div>

      {/* Metrics & Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 tabular-nums">{totalApps}</span>
            <span className="text-slate-500 ml-1">Karya</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="tabular-nums">{approvedApps} Publik</span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all"
        >
          <span>Lihat Karya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
