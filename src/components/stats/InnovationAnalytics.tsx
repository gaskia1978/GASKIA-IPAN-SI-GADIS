/**
 * ASKIA-SI GADIS - Innovation Analytics & Visual Stats
 * Menampilkan statistik dinamis dan visualisasi sebaran inovasi aplikasi sekolah
 */

import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Layers, 
  ShieldCheck, 
  PieChart as PieIcon, 
  Sparkles, 
  MapPin, 
  Cpu, 
  Award,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { School, Application } from '../../types';

interface InnovationAnalyticsProps {
  onSelectSchool?: (school: School) => void;
  onFilterByCategory?: (category: string) => void;
  onFilterByDistrict?: (district: string) => void;
}

export const InnovationAnalytics: React.FC<InnovationAnalyticsProps> = ({
  onSelectSchool,
  onFilterByCategory,
  onFilterByDistrict,
}) => {
  const stats = useMemo(() => StorageService.getDashboardStats(), []);
  const analytics = useMemo(() => StorageService.getDetailedAnalytics(), []);

  // Sort and pick top items
  const sortedCategories = useMemo(() => {
    return Object.entries(analytics.categoryCounts)
      .sort(([, a], [, b]) => b - a);
  }, [analytics.categoryCounts]);

  const sortedTech = useMemo(() => {
    return Object.entries(analytics.techCounts)
      .sort(([, a], [, b]) => b - a);
  }, [analytics.techCounts]);

  const sortedDistricts = useMemo(() => {
    return Object.entries(analytics.districtCounts)
      .sort(([, a], [, b]) => b - a);
  }, [analytics.districtCounts]);

  const maxCategoryCount = sortedCategories[0]?.[1] || 1;
  const maxTechCount = sortedTech[0]?.[1] || 1;
  const maxDistrictCount = sortedDistricts[0]?.[1] || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Eksekutif Pengawas Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Statistik Perkembangan Inovasi Digital
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Pemetaan sebaran aplikasi, jenis teknologi, kategori pemanfaatan, 
            dan sekolah dampingan teraktif dalam transformasi digital pendidikan.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Sekolah Berinovasi</span>
            <Building2 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {stats.total_schools}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lembaga Terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Aplikasi</span>
            <Layers className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {stats.total_applications}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Karya Terhimpun</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Terverifikasi</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
            {stats.total_verified}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {stats.total_applications ? Math.round((stats.total_verified / stats.total_applications) * 100) : 0}% Lolos Kurasi
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Kategori Aktif</span>
            <PieIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {stats.total_categories}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Bidang Inovasi</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Antrean Verifikasi</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
            {stats.total_pending}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Menunggu Review</span>
        </div>
      </div>

      {/* Grid 2 Kolom: Kategori & Jenis Teknologi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi Berdasarkan Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <span>Distribusi Aplikasi Berdasarkan Kategori</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kebutuhan pemanfaatan aplikasi di sekolah dampingan
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {sortedCategories.length} Kategori
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.map(([cat, count]) => {
              const percentage = Math.round((count / (analytics.totalApps || 1)) * 100);
              const barWidth = Math.round((count / maxCategoryCount) * 100);
              return (
                <div 
                  key={cat}
                  onClick={() => onFilterByCategory && onFilterByCategory(cat)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-900 transition-colors">
                      {cat}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      <strong>{count}</strong> aplikasi ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-700 h-full rounded-full transition-all duration-500 group-hover:bg-blue-600"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribusi Berdasarkan Jenis Teknologi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                <span>Distribusi Berdasarkan Jenis Teknologi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ragam platform dan ekosistem digital yang dikembangkan
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {sortedTech.length} Teknologi
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedTech.map(([tech, count]) => {
              const percentage = Math.round((count / (analytics.totalApps || 1)) * 100);
              const barWidth = Math.round((count / maxTechCount) * 100);
              return (
                <div key={tech} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-cyan-800 transition-colors">
                      {tech}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      <strong>{count}</strong> ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-600 h-full rounded-full transition-all duration-500 group-hover:bg-cyan-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid 2 Kolom: Sebaran Kecamatan & Ranking Sekolah Teraktif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sebaran Berdasarkan Kecamatan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Sebaran Inovasi per Kecamatan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribusi wilayah sekolah dampingan pengawas
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {sortedDistricts.length} Kecamatan
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedDistricts.map(([dist, count]) => {
              const barWidth = Math.round((count / maxDistrictCount) * 100);
              return (
                <div 
                  key={dist} 
                  onClick={() => onFilterByDistrict && onFilterByDistrict(dist)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-rose-900 transition-colors">
                      Kecamatan {dist}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      <strong>{count}</strong> aplikasi
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500 group-hover:bg-rose-400"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Ranking Sekolah Teraktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Peringkat Sekolah Pengembang Inovasi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sekolah paling produktif menghasilkan karya digital
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium w-8">No</th>
                    <th className="pb-2 font-medium">Nama Sekolah</th>
                    <th className="pb-2 font-medium text-center">Wilayah</th>
                    <th className="pb-2 font-medium text-right">Total Inovasi</th>
                    <th className="pb-2 font-medium text-right">Terverifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.schoolRankings.map((item, idx) => (
                    <tr 
                      key={item.school.id}
                      onClick={() => onSelectSchool && onSelectSchool(item.school)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 font-bold text-slate-500">
                        {idx + 1 === 1 && <span className="text-amber-500">🥇</span>}
                        {idx + 1 === 2 && <span className="text-slate-400">🥈</span>}
                        {idx + 1 === 3 && <span className="text-amber-700">🥉</span>}
                        {idx + 1 > 3 && idx + 1}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800 group-hover:text-blue-900 truncate max-w-[180px]">
                        {item.school.school_name}
                      </td>
                      <td className="py-2.5 text-center text-slate-500">
                        {item.school.district}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 tabular-nums">
                        {item.total}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-700 tabular-nums">
                        {item.approved}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400">
              * Diperbarui secara otomatis berdasarkan data aktual sistem
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
