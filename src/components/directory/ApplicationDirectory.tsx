/**
 * ASKIA-SI GADIS - Application Directory Page
 * Menampilkan seluruh katalog aplikasi digital dengan filter komprehensif,
 * pencarian multi-kriteria, pengurutan, dan interaksi detail.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Layers, 
  Building2, 
  MapPin, 
  Cpu, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Application, School, Category, ApplicationType } from '../../types';
import { StorageService } from '../../services/storage';
import { ApplicationCard } from '../home/ApplicationCard';

interface ApplicationDirectoryProps {
  onOpenDetail: (app: Application) => void;
  onOpenQr: (app: Application) => void;
  initialCategory?: string;
  initialDistrict?: string;
}

export const ApplicationDirectory: React.FC<ApplicationDirectoryProps> = ({
  onOpenDetail,
  onOpenQr,
  initialCategory = '',
  initialDistrict = '',
}) => {
  const [allApps, setAllApps] = useState<Application[]>(() => StorageService.getApplications());
  const [schools, setSchools] = useState<School[]>(() => StorageService.getSchools());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [appTypes, setAppTypes] = useState<ApplicationType[]>(() => StorageService.getApplicationTypes());

  // Real-time synchronization dengan database sentral agar Pengawas dan Pengguna 100% sama
  useEffect(() => {
    let isMounted = true;

    const syncLive = async () => {
      await StorageService.syncWithServer();
      if (isMounted) {
        setAllApps(StorageService.getApplications());
        setSchools(StorageService.getSchools());
        setCategories(StorageService.getCategories());
        setAppTypes(StorageService.getApplicationTypes());
      }
    };

    // Sinkronisasi segera saat halaman dibuka
    syncLive();

    const handleUpdate = () => {
      if (isMounted) {
        setAllApps(StorageService.getApplications());
        setSchools(StorageService.getSchools());
        setCategories(StorageService.getCategories());
        setAppTypes(StorageService.getApplicationTypes());
      }
    };

    window.addEventListener('askia_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling background setiap 2.5 detik
    const interval = setInterval(syncLive, 2500);

    return () => {
      isMounted = false;
      window.removeEventListener('askia_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'favorites' | 'alphabetical'>('latest');
  const [showOnlyVerified, setShowOnlyVerified] = useState(true);

  // Extract unique districts
  const districts = useMemo(() => {
    const list = new Set<string>();
    allApps.forEach(a => { if (a.district) list.add(a.district); });
    schools.forEach(s => { if (s.district) list.add(s.district); });
    return Array.from(list).sort();
  }, [allApps, schools]);

  // Filtered & sorted apps
  const filteredApplications = useMemo(() => {
    return allApps.filter((app) => {
      // Query filter
      const matchesSearch = !searchQuery.trim() || 
        app.application_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.registration_code.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !selectedCategory || app.category === selectedCategory;

      // School filter
      const matchesSchool = !selectedSchool || app.school_id === selectedSchool;

      // District filter
      const matchesDistrict = !selectedDistrict || app.district === selectedDistrict;

      // Type filter
      const matchesType = !selectedType || app.application_type === selectedType;

      // Verification filter
      const matchesVerified = !showOnlyVerified || app.verification_status === 'Disetujui';

      return matchesSearch && matchesCategory && matchesSchool && matchesDistrict && matchesType && matchesVerified;
    }).sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'popular') {
        return (b.views_count || 0) - (a.views_count || 0);
      }
      if (sortBy === 'favorites') {
        return (b.favorites_count || 0) - (a.favorites_count || 0);
      }
      if (sortBy === 'alphabetical') {
        return a.application_name.localeCompare(b.application_name);
      }
      return 0;
    });
  }, [
    allApps,
    searchQuery,
    selectedCategory,
    selectedSchool,
    selectedDistrict,
    selectedType,
    showOnlyVerified,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSchool('');
    setSelectedDistrict('');
    setSelectedType('');
    setSortBy('latest');
    setShowOnlyVerified(true);
  };

  const hasActiveFilters = 
    searchQuery || selectedCategory || selectedSchool || selectedDistrict || selectedType || !showOnlyVerified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Direktori Inovasi Aplikasi Digital
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Jelajahi dan manfaatkan ratusan karya teknologi pendidikan dari sekolah-sekolah dampingan pengawas.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari nama aplikasi, sekolah pengembang, guru inovator, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-700"
              >
                <option value="latest">Terbaru Diunggah</option>
                <option value="popular">Paling Banyak Dilihat</option>
                <option value="favorites">Paling Banyak Disukai</option>
                <option value="alphabetical">Nama Aplikasi (A - Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.category_name}>
                {c.category_name}
              </option>
            ))}
          </select>

          {/* District */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Kecamatan</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                Kecamatan {d}
              </option>
            ))}
          </select>

          {/* Type / Platform */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Jenis Teknologi</option>
            {appTypes.map((t) => (
              <option key={t.id} value={t.type_name}>
                {t.type_name}
              </option>
            ))}
          </select>

          {/* School */}
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 truncate"
          >
            <option value="">Semua Sekolah</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.school_name}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Checkbox Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyVerified}
              onChange={(e) => setShowOnlyVerified(e.target.checked)}
              className="rounded text-blue-700 focus:ring-blue-600"
            />
            <span className="font-medium">Hanya tampilkan aplikasi terverifikasi pengawas</span>
          </label>
          <span className="text-xs text-slate-400 font-mono">
            Ditemukan {filteredApplications.length} aplikasi
          </span>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            Tidak Ada Aplikasi Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada karya inovasi digital yang cocok dengan filter atau kata kunci yang Anda masukkan.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onOpenDetail={onOpenDetail}
              onOpenQr={onOpenQr}
            />
          ))}
        </div>
      )}

    </div>
  );
};
