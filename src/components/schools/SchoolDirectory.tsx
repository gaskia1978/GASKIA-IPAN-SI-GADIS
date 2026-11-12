/**
 * ASKIA-SI GADIS - School Directory Page
 * Menampilkan daftar sekolah/lembaga pengembang inovasi digital
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Building2, MapPin, Filter, RotateCcw } from 'lucide-react';
import { School, Application } from '../../types';
import { StorageService } from '../../services/storage';
import { SchoolCard } from '../home/SchoolCard';

interface SchoolDirectoryProps {
  onSelectSchool: (school: School) => void;
}

export const SchoolDirectory: React.FC<SchoolDirectoryProps> = ({ onSelectSchool }) => {
  const [schools, setSchools] = useState<School[]>(() => StorageService.getSchools());
  const [applications, setApplications] = useState<Application[]>(() => StorageService.getApplications());

  // Real-time synchronization dengan database sentral agar Pengawas dan Pengguna 100% sama
  useEffect(() => {
    let isMounted = true;

    const syncLive = async () => {
      await StorageService.syncWithServer();
      if (isMounted) {
        setSchools(StorageService.getSchools());
        setApplications(StorageService.getApplications());
      }
    };

    // Sinkronisasi segera saat halaman dibuka
    syncLive();

    const handleUpdate = () => {
      if (isMounted) {
        setSchools(StorageService.getSchools());
        setApplications(StorageService.getApplications());
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Extract districts
  const districts = useMemo(() => {
    const list = new Set<string>();
    schools.forEach(s => { if (s.district) list.add(s.district); });
    return Array.from(list).sort();
  }, [schools]);

  // Map school app counts
  const appCountMap = useMemo(() => {
    const map: Record<string, { total: number; approved: number }> = {};
    schools.forEach(s => {
      map[s.id] = { total: 0, approved: 0 };
    });
    applications.forEach(a => {
      if (!map[a.school_id]) {
        map[a.school_id] = { total: 0, approved: 0 };
      }
      map[a.school_id].total += 1;
      if (a.verification_status === 'Disetujui') {
        map[a.school_id].approved += 1;
      }
    });
    return map;
  }, [schools, applications]);

  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const matchesSearch = !searchQuery.trim() ||
        s.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery.trim()) ||
        s.principal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict = !selectedDistrict || s.district === selectedDistrict;

      return matchesSearch && matchesDistrict;
    });
  }, [schools, searchQuery, selectedDistrict]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Direktori Sekolah Pengembang Inovasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lembaga pendidikan dampingan pengawas yang aktif melahirkan aplikasi penunjang pembelajaran dan tata kelola.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="Cari nama sekolah, NPSN, nama kepala sekolah, atau kecamatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="">Semua Kecamatan</option>
            {districts.map(d => (
              <option key={d} value={d}>Kecamatan {d}</option>
            ))}
          </select>

          {(searchQuery || selectedDistrict) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('');
              }}
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Reset pencarian"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredSchools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            Sekolah Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada data sekolah dampingan yang cocok dengan kriteria pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map(school => (
            <SchoolCard
              key={school.id}
              school={school}
              totalApps={appCountMap[school.id]?.total || 0}
              approvedApps={appCountMap[school.id]?.approved || 0}
              onSelectSchool={onSelectSchool}
            />
          ))}
        </div>
      )}

    </div>
  );
};
