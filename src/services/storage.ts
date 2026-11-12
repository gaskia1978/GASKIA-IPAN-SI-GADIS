/**
 * ASKIA-SI GADIS - Storage & Data Access Service
 * Menyediakan penyimpanan persisten berbasis browser dengan query dinamis,
 * relasi data, ekspor Excel (.xlsx), dan mekanisme pembersihan data demonstrasi.
 */

import * as XLSX from 'xlsx';
import { 
  Application, 
  School, 
  Category, 
  ApplicationType, 
  Feedback, 
  Report, 
  DashboardStats,
  VerificationStatus,
  ReportStatus
} from '../types';
import { 
  INITIAL_SCHOOLS, 
  INITIAL_APPLICATIONS, 
  INITIAL_CATEGORIES, 
  INITIAL_APPLICATION_TYPES, 
  INITIAL_FEEDBACKS, 
  INITIAL_REPORTS 
} from '../data/initialData';

const STORAGE_KEYS = {
  SCHOOLS: 'askia_schools_v1',
  APPLICATIONS: 'askia_applications_v1',
  CATEGORIES: 'askia_categories_v1',
  APP_TYPES: 'askia_app_types_v1',
  FEEDBACKS: 'askia_feedbacks_v1',
  REPORTS: 'askia_reports_v1',
  FAVORITES: 'askia_favorites_v1',
  DELETED_APPS: 'askia_deleted_apps_v1',
  DELETED_SCHOOLS: 'askia_deleted_schools_v1',
};

// Helper untuk membaca dari localStorage dengan fallback
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.error(`Failed to read ${key} from storage:`, err);
    return defaultVal;
  }
}

// Helper untuk menyimpan ke localStorage
function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

// Daftar ID & Kode Registrasi aplikasi demo bawaan yang telah dihapus permanen dari platform
const LEGACY_DEMO_APP_IDS = new Set<string>([
  'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8',
  'ASKIA-2026-001', 'ASKIA-2026-002', 'ASKIA-2026-003', 'ASKIA-2026-004',
  'ASKIA-2026-005', 'ASKIA-2026-006', 'ASKIA-2026-007', 'ASKIA-2026-008',
]);

function isDemoApplicationRecord(app: Application): boolean {
  if (!app) return false;
  if (app.is_demo === true) return true;
  if (app.id && LEGACY_DEMO_APP_IDS.has(app.id)) return true;
  if (app.registration_code && LEGACY_DEMO_APP_IDS.has(app.registration_code)) return true;
  return false;
}

export const StorageService = {
  // Pengelolaan daftar ID & kode yang telah dihapus permanen (Tombstone List)
  getDeletedAppIds(): string[] {
    return getLocalItem<string[]>(STORAGE_KEYS.DELETED_APPS, []);
  },

  addDeletedAppId(id: string, regCode?: string): void {
    const list = this.getDeletedAppIds();
    let updated = false;
    if (id && !list.includes(id)) {
      list.push(id);
      updated = true;
    }
    if (regCode && !list.includes(regCode)) {
      list.push(regCode);
      updated = true;
    }
    if (updated) {
      setLocalItem(STORAGE_KEYS.DELETED_APPS, list);
    }
  },

  removeDeletedAppId(id: string, regCode?: string): void {
    const list = this.getDeletedAppIds();
    const filtered = list.filter(item => item !== id && (!regCode || item !== regCode));
    if (filtered.length !== list.length) {
      setLocalItem(STORAGE_KEYS.DELETED_APPS, filtered);
    }
  },

  // Inisialisasi data awal jika belum ada
  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      setLocalItem(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      setLocalItem(STORAGE_KEYS.APPLICATIONS, []);
    } else {
      // Otomatis bersihkan aplikasi demo lama yang mungkin masih tersimpan di cache peramban
      try {
        const currentApps = getLocalItem<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
        const cleanedApps = currentApps.filter(a => !isDemoApplicationRecord(a));
        if (cleanedApps.length !== currentApps.length) {
          setLocalItem(STORAGE_KEYS.APPLICATIONS, cleanedApps);
        }
      } catch {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      setLocalItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_TYPES)) {
      setLocalItem(STORAGE_KEYS.APP_TYPES, INITIAL_APPLICATION_TYPES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEEDBACKS)) {
      setLocalItem(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      setLocalItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
      setLocalItem(STORAGE_KEYS.FAVORITES, []);
    }

    // Auto-migrate any old relative image paths in stored data
    try {
      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (storedApps && storedApps.includes('/src/assets/images/')) {
        localStorage.setItem(
          STORAGE_KEYS.APPLICATIONS,
          storedApps.replaceAll('/src/assets/images/', '/assets/images/')
        );
      }
    } catch {}

    // Otomatis sinkronisasi dengan Server Sentral ASKIA-SI GADIS
    this.syncWithServer();
  },

  // Sinkronisasi data real-time dengan server sentral (Server Authoritative Sync)
  async syncWithServer(): Promise<boolean> {
    try {
      const deletedIds = this.getDeletedAppIds();
      const localApps = this.getApplications();
      const localSchools = this.getSchools();
      
      // Jangan pernah kirim aplikasi demo maupun aplikasi yang sudah dihapus permanen
      const customApps = localApps.filter(
        a => !isDemoApplicationRecord(a) && !deletedIds.includes(a.id) && (!a.registration_code || !deletedIds.includes(a.registration_code))
      );
      const customSchools = localSchools.filter(s => !s.is_demo);
      const localFeedbacks = this.getFeedbacks();
      const localReports = this.getReports();

      // 1. Beritahu server tentang inovasi baru, ulasan pengguna, laporan, dan blacklist ID terhapus
      if (customApps.length > 0 || customSchools.length > 0 || localFeedbacks.length > 0 || localReports.length > 0 || deletedIds.length > 0) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applications: customApps,
            schools: customSchools,
            feedbacks: localFeedbacks,
            reports: localReports,
            deleted_application_ids: deletedIds,
          }),
        }).catch(err => console.warn('Sync push to server warn:', err));
      }

      // 2. Unduh data lengkap terbaru dari server sentral sebagai Single Source of Truth
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        
        // Simpan blacklist ID terhapus dari server
        if (Array.isArray(data.deleted_application_ids)) {
          for (const sDelId of data.deleted_application_ids) {
            this.addDeletedAppId(sDelId);
          }
        }

        const latestDelSet = new Set(this.getDeletedAppIds());

        // Update applications: Server sentral adalah Single Source of Truth (tanpa aplikasi demo)
        if (Array.isArray(data.applications)) {
          const validServerApps: Application[] = data.applications.filter(
            (a: Application) =>
              !isDemoApplicationRecord(a) &&
              !latestDelSet.has(a.id) &&
              (!a.registration_code || !latestDelSet.has(a.registration_code))
          );
          
          setLocalItem(STORAGE_KEYS.APPLICATIONS, validServerApps);
        }

        // Update schools
        if (Array.isArray(data.schools)) {
          setLocalItem(STORAGE_KEYS.SCHOOLS, data.schools);
        }

        if (Array.isArray(data.categories)) {
          setLocalItem(STORAGE_KEYS.CATEGORIES, data.categories);
        }

        // Merge cerdas laporan agar tidak tertimpa
        if (Array.isArray(data.reports)) {
          const serverReports: Report[] = data.reports;
          const currentReports = this.getReports();
          const repMap = new Map<string, Report>();
          serverReports.forEach(r => { if (r && r.id) repMap.set(r.id, r); });
          currentReports.forEach(r => { if (r && r.id && !repMap.has(r.id)) repMap.set(r.id, r); });
          const mergedRep = Array.from(repMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setLocalItem(STORAGE_KEYS.REPORTS, mergedRep);
        }

        // Merge cerdas ulasan / feedback pengguna agar tidak hilang saat polling
        if (Array.isArray(data.feedbacks)) {
          const serverFeedbacks: Feedback[] = data.feedbacks;
          const currentFeedbacks = this.getFeedbacks();
          const fbMap = new Map<string, Feedback>();
          serverFeedbacks.forEach(f => { if (f && f.id) fbMap.set(f.id, f); });
          currentFeedbacks.forEach(f => { if (f && f.id && !fbMap.has(f.id)) fbMap.set(f.id, f); });
          const mergedFb = Array.from(fbMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setLocalItem(STORAGE_KEYS.FEEDBACKS, mergedFb);
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('askia_data_updated'));
        }
        return true;
      }
    } catch (err) {
      console.warn('Sync server skipped (offline mode):', err);
    }
    return false;
  },

  // Simpan Seluruh Perubahan Secara Permanen ke Server Database
  // Menjamin seluruh mutasi (verifikasi, status aktif, kategori, sekolah, dsb) tetap utuh saat reload/refresh
  async saveAllChanges(): Promise<{ success: boolean; message: string; updated_at?: string }> {
    const currentApps = this.getApplications();
    const currentSchools = this.getSchools();
    const currentCategories = this.getCategories();
    const currentReports = this.getReports();
    const currentFeedbacks = this.getFeedbacks();
    const deletedIds = this.getDeletedAppIds();

    // 1. Kunci di penyimpanan lokal peramban
    setLocalItem(STORAGE_KEYS.APPLICATIONS, currentApps);
    setLocalItem(STORAGE_KEYS.SCHOOLS, currentSchools);
    setLocalItem(STORAGE_KEYS.CATEGORIES, currentCategories);
    setLocalItem(STORAGE_KEYS.REPORTS, currentReports);
    setLocalItem(STORAGE_KEYS.FEEDBACKS, currentFeedbacks);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    // 2. Kunci permanen di database server disk (askia_db.json)
    try {
      const res = await fetch('/api/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applications: currentApps,
          schools: currentSchools,
          categories: currentCategories,
          reports: currentReports,
          feedbacks: currentFeedbacks,
          deleted_application_ids: deletedIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.deleted_application_ids)) {
          for (const dId of data.deleted_application_ids) {
            this.addDeletedAppId(dId);
          }
        }
        return {
          success: true,
          message: 'Seluruh perubahan berhasil disimpan permanen di database server.',
          updated_at: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('Failed to call /api/save-all, using fallback sync:', err);
    }

    return {
      success: true,
      message: 'Perubahan diamankan di memori lokal dan antrean sinkronisasi server.',
      updated_at: new Date().toISOString(),
    };
  },

  // ------------------ SCHOOLS ------------------
  getSchools(): School[] {
    return getLocalItem<School[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
  },

  getSchoolById(id: string): School | undefined {
    return this.getSchools().find(s => s.id === id);
  },

  async saveSchool(school: School): Promise<School> {
    const schools = this.getSchools();
    const index = schools.findIndex(s => s.id === school.id || (school.npsn && s.npsn === school.npsn));
    if (index >= 0) {
      schools[index] = { ...schools[index], ...school };
    } else {
      schools.unshift(school);
    }
    setLocalItem(STORAGE_KEYS.SCHOOLS, schools);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    // Push ke server sentral dan tunggu respon
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(school),
      });
      if (res.ok) {
        const saved = await res.json();
        return saved;
      }
    } catch (err) {
      console.warn('Failed to save school on server, kept in local:', err);
    }

    return school;
  },

  deleteSchool(id: string): boolean {
    const schools = this.getSchools().filter(s => s.id !== id);
    setLocalItem(STORAGE_KEYS.SCHOOLS, schools);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    fetch(`/api/schools/${id}`, { method: 'DELETE' }).catch(err => console.warn('Failed to delete school on server:', err));
    return true;
  },

  // ------------------ APPLICATIONS ------------------
  getApplications(): Application[] {
    const raw = getLocalItem<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const deleted = this.getDeletedAppIds();
    const delSet = new Set(deleted);
    return raw.filter(
      a =>
        !isDemoApplicationRecord(a) &&
        !delSet.has(a.id) &&
        (!a.registration_code || !delSet.has(a.registration_code))
    );
  },

  getApplicationById(id: string): Application | undefined {
    return this.getApplications().find(a => a.id === id);
  },

  // Identitas & Relasi Resmi Super Admin Pengawas
  SUPERVISOR_TARGET: {
    id: 'user-admin',
    full_name: 'Dr. H. Bambang Sujarwo, M.Pd.',
    email: 'ijinoperasionalsekolahkab.lmj@gmail.com',
    institution: 'Koordinator Pengawas Sekolah Kab. Lumajang',
  },

  async saveApplication(app: Application): Promise<Application> {
    // Jika aplikasi ini pernah dihapus, hapus dari blacklist agar aktif kembali
    this.removeDeletedAppId(app.id, app.registration_code);

    // Otomatisasi relasi dan flag khusus ke akun Super Admin Pengawas
    const enrichedApp: Application = {
      ...app,
      assigned_supervisor_email: app.assigned_supervisor_email || this.SUPERVISOR_TARGET.email,
      supervisor_name: app.supervisor_name || this.SUPERVISOR_TARGET.full_name,
      supervisor_id: app.supervisor_id || this.SUPERVISOR_TARGET.id,
      connected_to_supervisor: true,
      needs_supervisor_verification: app.verification_status ? (app.verification_status === 'Menunggu Verifikasi') : true,
      verification_status: app.verification_status || 'Menunggu Verifikasi',
      updated_at: new Date().toISOString(),
    };

    // 1. Simpan segera di browser agar responsif instan
    const apps = this.getApplications();
    const index = apps.findIndex(
      a => a.id === enrichedApp.id || (enrichedApp.registration_code && a.registration_code === enrichedApp.registration_code)
    );
    if (index >= 0) {
      apps[index] = { ...apps[index], ...enrichedApp };
    } else {
      apps.unshift(enrichedApp);
    }
    setLocalItem(STORAGE_KEYS.APPLICATIONS, apps);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    // 2. Kirim dan tunggu konfirmasi tersimpan di Server Sentral ASKIA
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedApp),
      });
      if (res.ok) {
        const serverSaved: Application = await res.json();
        // Perbarui local item dengan hasil server
        const current = this.getApplications();
        const sIdx = current.findIndex(
          a => a.id === serverSaved.id || a.registration_code === serverSaved.registration_code
        );
        if (sIdx >= 0) {
          current[sIdx] = { ...current[sIdx], ...serverSaved };
        } else {
          current.unshift(serverSaved);
        }
        setLocalItem(STORAGE_KEYS.APPLICATIONS, current);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('askia_data_updated'));
        }
        return serverSaved;
      }
    } catch (err) {
      console.warn('Network issue saving application to server, kept in local queue:', err);
    }

    return enrichedApp;
  },

  updateVerificationStatus(id: string, status: VerificationStatus, notes?: string): Application | undefined {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index >= 0) {
      apps[index].verification_status = status;
      if (notes !== undefined) {
        apps[index].verification_notes = notes;
      }
      apps[index].verified_by = this.SUPERVISOR_TARGET.full_name;
      apps[index].verified_by_email = this.SUPERVISOR_TARGET.email;
      apps[index].verified_at = new Date().toISOString();
      apps[index].needs_supervisor_verification = false;
      apps[index].updated_at = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.APPLICATIONS, apps);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('askia_data_updated'));
      }

      fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_status: status,
          verification_notes: notes,
          verified_by: this.SUPERVISOR_TARGET.full_name,
          verified_by_email: this.SUPERVISOR_TARGET.email,
          verified_at: apps[index].verified_at,
          needs_supervisor_verification: false,
        }),
      }).catch(err => console.warn('Failed to update status on server:', err));

      return apps[index];
    }
    return undefined;
  },

  // Query helper khusus Super Admin Pengawas: prioritas antrean verifikasi
  getApplicationsForAdmin(): Application[] {
    const all = this.getApplications();
    return [...all].sort((a, b) => {
      // Prioritaskan yang menunggu verifikasi di paling atas
      if (a.verification_status === 'Menunggu Verifikasi' && b.verification_status !== 'Menunggu Verifikasi') return -1;
      if (b.verification_status === 'Menunggu Verifikasi' && a.verification_status !== 'Menunggu Verifikasi') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  getPendingApplicationsForSupervisor(): Application[] {
    return this.getApplications().filter(
      a => a.verification_status === 'Menunggu Verifikasi' || a.needs_supervisor_verification === true
    );
  },

  toggleApplicationActive(id: string): Application | undefined {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index >= 0) {
      apps[index].is_active = !apps[index].is_active;
      apps[index].updated_at = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.APPLICATIONS, apps);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('askia_data_updated'));
      }

      fetch(`/api/applications/${id}/toggle-active`, {
        method: 'PUT',
      }).catch(err => console.warn('Failed to toggle active on server:', err));

      return apps[index];
    }
    return undefined;
  },

  async deleteApplication(id: string): Promise<boolean> {
    const apps = this.getApplications();
    const target = apps.find(a => a.id === id || (a.registration_code && a.registration_code === id));

    // 1. Catat ke blacklist ID & kode registrasi yang terhapus permanen
    this.addDeletedAppId(id, target?.registration_code);

    // 2. Bersihkan dari memori peramban
    const remaining = apps.filter(
      a => a.id !== id && (!a.registration_code || a.registration_code !== id)
    );
    setLocalItem(STORAGE_KEYS.APPLICATIONS, remaining);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    // 3. Eksekusi penghapusan di database server disk
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete on server:', err);
    }

    return true;
  },

  incrementViews(id: string): void {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index >= 0) {
      apps[index].views_count = (apps[index].views_count || 0) + 1;
      setLocalItem(STORAGE_KEYS.APPLICATIONS, apps);
    }
  },

  // ------------------ FAVORITES ------------------
  getFavorites(): string[] {
    return getLocalItem<string[]>(STORAGE_KEYS.FAVORITES, []);
  },

  toggleFavorite(appId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(appId);
    let isFav = false;
    if (index >= 0) {
      favorites.splice(index, 1);
      isFav = false;
    } else {
      favorites.push(appId);
      isFav = true;
    }
    setLocalItem(STORAGE_KEYS.FAVORITES, favorites);

    // Update count in application record
    const apps = this.getApplications();
    const appIndex = apps.findIndex(a => a.id === appId);
    if (appIndex >= 0) {
      apps[appIndex].favorites_count = Math.max(0, (apps[appIndex].favorites_count || 0) + (isFav ? 1 : -1));
      setLocalItem(STORAGE_KEYS.APPLICATIONS, apps);
    }
    return isFav;
  },

  // ------------------ CATEGORIES & TYPES ------------------
  getCategories(): Category[] {
    return getLocalItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategory(cat: Category): Category {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === cat.id);
    if (index >= 0) {
      categories[index] = cat;
    } else {
      categories.push(cat);
    }
    setLocalItem(STORAGE_KEYS.CATEGORIES, categories);
    return cat;
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories().filter(c => c.id !== id);
    setLocalItem(STORAGE_KEYS.CATEGORIES, categories);
    return true;
  },

  getApplicationTypes(): ApplicationType[] {
    return getLocalItem<ApplicationType[]>(STORAGE_KEYS.APP_TYPES, INITIAL_APPLICATION_TYPES);
  },

  // ------------------ FEEDBACK ------------------
  getFeedbacks(applicationId?: string, registrationCode?: string): Feedback[] {
    const all = getLocalItem<Feedback[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
    if (!applicationId && !registrationCode) {
      return all;
    }
    const targetId = applicationId?.trim();
    const targetCode = registrationCode?.trim();

    return all.filter(f => {
      if (targetId && (f.application_id === targetId || f.registration_code === targetId)) return true;
      if (targetCode && (f.application_id === targetCode || f.registration_code === targetCode)) return true;
      return false;
    });
  },

  async addFeedback(fb: Omit<Feedback, 'id' | 'created_at'> & { registration_code?: string; application_name?: string }): Promise<Feedback> {
    const all = this.getFeedbacks();
    const newFb: Feedback = {
      ...fb,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newFb);
    setLocalItem(STORAGE_KEYS.FEEDBACKS, all);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
      window.dispatchEvent(new CustomEvent('askia_feedback_added', { detail: newFb }));
    }

    // Simpan permanen ke database server sentral
    try {
      await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFb),
      });
    } catch (err) {
      console.warn('Network issue saving feedback to server, safely kept in localStorage:', err);
    }

    return newFb;
  },

  // ------------------ REPORTS ------------------
  getReports(): Report[] {
    return getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  async addReport(report: Omit<Report, 'id' | 'created_at' | 'report_status'>): Promise<Report> {
    const all = this.getReports();
    const newRep: Report = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      report_status: 'Menunggu Peninjauan',
      created_at: new Date().toISOString(),
    };
    all.unshift(newRep);
    setLocalItem(STORAGE_KEYS.REPORTS, all);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRep),
      });
    } catch (err) {
      console.warn('Network issue saving report to server:', err);
    }

    return newRep;
  },

  updateReportStatus(id: string, status: ReportStatus): void {
    const all = this.getReports();
    const index = all.findIndex(r => r.id === id);
    if (index >= 0) {
      all[index].report_status = status;
      setLocalItem(STORAGE_KEYS.REPORTS, all);
    }
  },

  // ------------------ STATISTIK DINAMIS ------------------
  getDashboardStats(): DashboardStats {
    const apps = this.getApplications();
    const schools = this.getSchools();
    const categories = this.getCategories();

    // Sekolah yang telah mengunggah aplikasi
    const schoolIdsWithApps = new Set(apps.map(a => a.school_id));

    return {
      total_schools: schoolIdsWithApps.size || schools.length,
      total_applications: apps.length,
      total_categories: categories.length,
      total_verified: apps.filter(a => a.verification_status === 'Disetujui').length,
      total_active: apps.filter(a => a.is_active && a.verification_status === 'Disetujui').length,
      total_pending: apps.filter(a => a.verification_status === 'Menunggu Verifikasi').length,
      total_rejected: apps.filter(a => a.verification_status === 'Ditolak').length,
    };
  },

  // Rincian Statistik Lanjutan untuk Halaman Statistik & Admin
  getDetailedAnalytics() {
    const apps = this.getApplications();
    const schools = this.getSchools();

    // 1. Berdasarkan Kategori
    const categoryCounts: Record<string, number> = {};
    apps.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    // 2. Berdasarkan Jenis Teknologi
    const techCounts: Record<string, number> = {};
    apps.forEach(a => {
      techCounts[a.application_type] = (techCounts[a.application_type] || 0) + 1;
    });

    // 3. Berdasarkan Kecamatan
    const districtCounts: Record<string, number> = {};
    apps.forEach(a => {
      const d = a.district || 'Lainnya';
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    });

    // 4. Ranking Sekolah Terbanyak Berinovasi
    const schoolAppMap: Record<string, { school: School; total: number; approved: number }> = {};
    schools.forEach(s => {
      schoolAppMap[s.id] = { school: s, total: 0, approved: 0 };
    });

    apps.forEach(a => {
      if (!schoolAppMap[a.school_id]) {
        // Fallback jika sekolah belum terdata
        schoolAppMap[a.school_id] = {
          school: {
            id: a.school_id,
            school_name: a.school_name,
            npsn: '-',
            address: '-',
            district: a.district || 'Lumajang',
            principal_name: '-',
            contact_email: '-',
            logo_url: '',
            description: '',
            is_demo: a.is_demo,
            created_at: a.created_at,
          },
          total: 0,
          approved: 0,
        };
      }
      schoolAppMap[a.school_id].total += 1;
      if (a.verification_status === 'Disetujui') {
        schoolAppMap[a.school_id].approved += 1;
      }
    });

    const schoolRankings = Object.values(schoolAppMap)
      .sort((a, b) => b.total - a.total);

    // 5. Status Verifikasi
    const statusCounts: Record<string, number> = {
      'Disetujui': apps.filter(a => a.verification_status === 'Disetujui').length,
      'Menunggu Verifikasi': apps.filter(a => a.verification_status === 'Menunggu Verifikasi').length,
      'Ditolak': apps.filter(a => a.verification_status === 'Ditolak').length,
      'Tidak Aktif': apps.filter(a => a.verification_status === 'Tidak Aktif').length,
    };

    return {
      categoryCounts,
      techCounts,
      districtCounts,
      schoolRankings,
      statusCounts,
      totalApps: apps.length,
      totalSchools: schools.length,
    };
  },

  // ------------------ KELOLA DATA DEMONSTRASI (SECTION K) ------------------
  // Menghapus data berlabel DEMO secara sentral sehingga sistem bersih untuk seluruh akun
  async purgeDemoData(): Promise<{ removedApps: number; removedSchools: number }> {
    const rawApps = getLocalItem<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const schools = this.getSchools();

    const demoApps = rawApps.filter(a => isDemoApplicationRecord(a));
    for (const dApp of demoApps) {
      this.addDeletedAppId(dApp.id, dApp.registration_code);
    }

    const realApps = rawApps.filter(a => !isDemoApplicationRecord(a));
    const realSchools = schools.filter(s => !s.is_demo);

    const removedApps = rawApps.length - realApps.length;
    const removedSchools = schools.length - realSchools.length;

    setLocalItem(STORAGE_KEYS.APPLICATIONS, realApps);
    setLocalItem(STORAGE_KEYS.SCHOOLS, realSchools);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    try {
      await fetch('/api/demo/purge', { method: 'POST' });
      await this.syncWithServer();
    } catch (err) {
      console.warn('Failed to purge demo data on server:', err);
    }

    return { removedApps, removedSchools };
  },

  // Memulihkan data master sekolah/kategori tanpa memunculkan kembali aplikasi demo
  async restoreDemoData(): Promise<void> {
    const existingRealApps = this.getApplications().filter(a => !isDemoApplicationRecord(a));
    setLocalItem(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    setLocalItem(STORAGE_KEYS.APPLICATIONS, existingRealApps);
    setLocalItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocalItem(STORAGE_KEYS.APP_TYPES, INITIAL_APPLICATION_TYPES);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('askia_data_updated'));
    }

    try {
      await fetch('/api/demo/restore', { method: 'POST' });
      await this.syncWithServer();
    } catch (err) {
      console.warn('Failed to restore school data on server:', err);
    }
  },

  // ------------------ EKSPOR DATA KE EXCEL (.XLSX) ------------------
  exportApplicationsToExcel(): void {
    const apps = this.getApplications();
    const exportData = apps.map((a, idx) => ({
      No: idx + 1,
      'Kode Registrasi': a.registration_code,
      'Nama Aplikasi': a.application_name,
      'Sekolah Pengembang': a.school_name,
      'Kecamatan': a.district,
      'Kategori': a.category,
      'Jenis Aplikasi': a.application_type,
      'Pengembang / Tim': a.developer_name,
      'Status Verifikasi': a.verification_status,
      'Status Aktif': a.is_active ? 'Aktif' : 'Nonaktif',
      'Data Demonstrasi': a.is_demo ? 'Ya (Demo)' : 'Bukan (Aktual)',
      'Tautan Aplikasi': a.application_url,
      'Tanggal Unggah': a.created_at.split('T')[0],
      'Jumlah Dilihat': a.views_count || 0,
      'Jumlah Favorit': a.favorites_count || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aplikasi Digital');

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 }, { wch: 18 }, { wch: 35 }, { wch: 25 }, { wch: 15 },
      { wch: 22 }, { wch: 22 }, { wch: 25 }, { wch: 18 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `ASKIA_Gudang_Aplikasi_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportSchoolsToExcel(): void {
    const schools = this.getSchools();
    const apps = this.getApplications();

    const exportData = schools.map((s, idx) => {
      const schoolApps = apps.filter(a => a.school_id === s.id);
      const approvedApps = schoolApps.filter(a => a.verification_status === 'Disetujui');
      return {
        No: idx + 1,
        'Nama Sekolah': s.school_name,
        'NPSN': s.npsn,
        'Kecamatan': s.district,
        'Alamat Lengkap': s.address,
        'Kepala Sekolah': s.principal_name,
        'Operator Sekolah': s.operator_name || '-',
        'Email Kontak': s.contact_email,
        'Telepon': s.phone || '-',
        'Total Aplikasi': schoolApps.length,
        'Aplikasi Terverifikasi': approvedApps.length,
        'Status Demo': s.is_demo ? 'Ya (Demo)' : 'Aktual',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sekolah Dampingan');

    const colWidths = [
      { wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 35 },
      { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `ASKIA_Daftar_Sekolah_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};
