/**
 * ASKIA-SI GADIS - Dynamic KPI Stats Cards
 * Menghitung statistik aktual secara otomatis dari basis data
 */

import React from 'react';
import { Building2, Layers, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats;
  onNavigateStat?: (tab: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, onNavigateStat }) => {
  const cards = [
    {
      label: 'Sekolah Berinovasi',
      value: stats.total_schools,
      sublabel: 'Lembaga Dampingan',
      icon: Building2,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      tab: 'direktori-sekolah',
    },
    {
      label: 'Aplikasi Digital',
      value: stats.total_applications,
      sublabel: 'Karya Terhimpun',
      icon: Layers,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      tab: 'direktori-aplikasi',
    },
    {
      label: 'Kategori Inovasi',
      value: stats.total_categories,
      sublabel: 'Bidang Pembelajaran & Manajemen',
      icon: Cpu,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      tab: 'statistik',
    },
    {
      label: 'Aplikasi Terverifikasi',
      value: stats.total_verified,
      sublabel: 'Lolos Kurasi Pengawas',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      tab: 'direktori-aplikasi',
    },
    {
      label: 'Aplikasi Aktif',
      value: stats.total_active,
      sublabel: 'Dapat Diakses Publik',
      icon: Globe,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      tab: 'direktori-aplikasi',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            onClick={() => onNavigateStat && onNavigateStat(c.tab)}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${c.bgColor} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums group-hover:text-blue-900 transition-colors">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {c.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
