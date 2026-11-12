/**
 * ASKIA-SI GADIS - Full-Stack Express Server & Central Innovation Database
 * Menghubungkan secara otomatis seluruh sekolah pengunggah inovasi dengan Super Admin Pengawas.
 * Data tersimpan persisten secara sentral di database server.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_SCHOOLS, 
  INITIAL_CATEGORIES, 
  INITIAL_APPLICATION_TYPES, 
  INITIAL_FEEDBACKS, 
  INITIAL_REPORTS 
} from './src/data/initialData.ts';
import { Application, School, Category, Feedback, Report } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'askia_db.json');

interface DatabaseSchema {
  applications: Application[];
  schools: School[];
  categories: Category[];
  reports: Report[];
  feedbacks: Feedback[];
  deleted_application_ids: string[];
  deleted_school_ids: string[];
  updated_at: string;
}

// Daftar ID & Kode Registrasi aplikasi demo bawaan yang dihapus permanen dari platform
const LEGACY_DEMO_APP_IDS = new Set<string>([
  'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8',
  'ASKIA-2026-001', 'ASKIA-2026-002', 'ASKIA-2026-003', 'ASKIA-2026-004',
  'ASKIA-2026-005', 'ASKIA-2026-006', 'ASKIA-2026-007', 'ASKIA-2026-008',
]);

// Daftar ID sekolah demo bawaan yang dihapus permanen dari platform
const LEGACY_DEMO_SCHOOL_IDS = new Set<string>([
  'school-1', 'school-2', 'school-3', 'school-4', 'school-5', 'school-6',
]);

function isDemoApplicationRecord(app: Application): boolean {
  if (!app) return false;
  if (app.is_demo === true) return true;
  if (app.id && LEGACY_DEMO_APP_IDS.has(app.id)) return true;
  if (app.registration_code && LEGACY_DEMO_APP_IDS.has(app.registration_code)) return true;
  return false;
}

function isDemoSchoolRecord(school: School): boolean {
  if (!school) return false;
  if (school.is_demo === true) return true;
  if (school.id && LEGACY_DEMO_SCHOOL_IDS.has(school.id)) return true;
  return false;
}

// Inisialisasi Database Server
function getInitialDb(): DatabaseSchema {
  return {
    applications: [],
    schools: [],
    categories: [...INITIAL_CATEGORIES],
    reports: [...INITIAL_REPORTS],
    feedbacks: [...INITIAL_FEEDBACKS],
    deleted_application_ids: Array.from(LEGACY_DEMO_APP_IDS),
    deleted_school_ids: Array.from(LEGACY_DEMO_SCHOOL_IDS),
    updated_at: new Date().toISOString(),
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(content);
    
    // Ensure all arrays exist
    if (!parsed.applications) parsed.applications = [];
    if (!parsed.schools) parsed.schools = [];
    if (!parsed.categories) parsed.categories = [...INITIAL_CATEGORIES];
    if (!parsed.reports) parsed.reports = [...INITIAL_REPORTS];
    if (!parsed.feedbacks) parsed.feedbacks = [...INITIAL_FEEDBACKS];
    if (!parsed.deleted_application_ids) parsed.deleted_application_ids = [];
    if (!parsed.deleted_school_ids) parsed.deleted_school_ids = [];

    let needsDiskCleanup = false;

    // Pastikan seluruh ID aplikasi demo masuk ke blacklist permanen
    for (const demoId of LEGACY_DEMO_APP_IDS) {
      if (!parsed.deleted_application_ids.includes(demoId)) {
        parsed.deleted_application_ids.push(demoId);
        needsDiskCleanup = true;
      }
    }

    // Pastikan seluruh ID sekolah demo masuk ke blacklist permanen
    for (const demoSchoolId of LEGACY_DEMO_SCHOOL_IDS) {
      if (!parsed.deleted_school_ids.includes(demoSchoolId)) {
        parsed.deleted_school_ids.push(demoSchoolId);
        needsDiskCleanup = true;
      }
    }

    // Filter out seluruh aplikasi demo maupun aplikasi yang sudah dihapus permanen
    const delSet = new Set(parsed.deleted_application_ids);
    const beforeCount = parsed.applications.length;
    parsed.applications = parsed.applications.filter(
      app =>
        !isDemoApplicationRecord(app) &&
        !delSet.has(app.id) &&
        (!app.registration_code || !delSet.has(app.registration_code))
    );
    if (parsed.applications.length !== beforeCount) {
      needsDiskCleanup = true;
    }

    // Filter out seluruh sekolah demo maupun sekolah yang sudah dihapus permanen
    const delSchoolSet = new Set(parsed.deleted_school_ids);
    const beforeSchoolCount = parsed.schools.length;
    parsed.schools = parsed.schools.filter(
      s => !isDemoSchoolRecord(s) && !delSchoolSet.has(s.id)
    );
    if (parsed.schools.length !== beforeSchoolCount) {
      needsDiskCleanup = true;
    }

    // Otomatis pastikan semua aplikasi terhubung langsung ke Super Admin Pengawas
    parsed.applications = parsed.applications.map(app => ({
      ...app,
      assigned_supervisor_email: app.assigned_supervisor_email || 'ijinoperasionalsekolahkab.lmj@gmail.com',
      supervisor_name: app.supervisor_name || 'Dr. H. Bambang Sujarwo, M.Pd.',
      supervisor_id: app.supervisor_id || 'user-admin',
      connected_to_supervisor: true,
      needs_supervisor_verification: app.verification_status === 'Menunggu Verifikasi' || app.needs_supervisor_verification,
    }));

    if (needsDiskCleanup) {
      saveDatabase(parsed);
      console.log(`[ASKIA SERVER] Data demo dibersihkan permanen dari database. Sisa aktual: ${parsed.applications.length} aplikasi, ${parsed.schools.length} sekolah.`);
    }

    return parsed;
  } catch (err) {
    console.error('Error loading database file, using fallback:', err);
    return getInitialDb();
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.updated_at = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser
  app.use(express.json({ limit: '15mb' }));

  // In-memory cache synced with disk
  let db = loadDatabase();

  // ------------------ API ROUTES ------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      service: 'ASKIA-SI GADIS Central Sync Server',
      total_apps: db.applications.length,
      total_schools: db.schools.length,
      deleted_apps_count: (db.deleted_application_ids || []).length,
      last_updated: db.updated_at 
    });
  });

  // Full Sync Endpoint (Ambil data lengkap terkini untuk Admin & Publik)
  app.get('/api/sync', (_req: Request, res: Response) => {
    // Pastikan tidak ada aplikasi/sekolah demo maupun yang sudah dihapus dikirim ke klien
    const delSet = new Set(db.deleted_application_ids || []);
    const delSchoolSet = new Set(db.deleted_school_ids || []);
    db.applications = db.applications.filter(
      a => !isDemoApplicationRecord(a) && !delSet.has(a.id) && (!a.registration_code || !delSet.has(a.registration_code))
    );
    db.schools = db.schools.filter(
      s => !isDemoSchoolRecord(s) && !delSchoolSet.has(s.id)
    );

    res.json({
      applications: db.applications,
      schools: db.schools,
      categories: db.categories,
      reports: db.reports,
      feedbacks: db.feedbacks,
      deleted_application_ids: db.deleted_application_ids || [],
      deleted_school_ids: db.deleted_school_ids || [],
      updated_at: db.updated_at,
    });
  });

  // Bulk Merge / Sync from client (menghubungkan data yang mungkin pernah tersimpan di browser klien)
  app.post('/api/sync', (req: Request, res: Response) => {
    const { applications: clientApps, schools: clientSchools, deleted_application_ids, deleted_school_ids } = req.body;
    let modified = false;

    if (!db.deleted_application_ids) db.deleted_application_ids = [];
    if (!db.deleted_school_ids) db.deleted_school_ids = [];

    // Terima daftar terhapus dari klien jika ada
    if (Array.isArray(deleted_application_ids)) {
      for (const dId of deleted_application_ids) {
        if (dId && !db.deleted_application_ids.includes(dId)) {
          db.deleted_application_ids.push(dId);
          modified = true;
        }
      }
    }
    if (Array.isArray(deleted_school_ids)) {
      for (const dSchId of deleted_school_ids) {
        if (dSchId && !db.deleted_school_ids.includes(dSchId)) {
          db.deleted_school_ids.push(dSchId);
          modified = true;
        }
      }
    }

    const delSet = new Set(db.deleted_application_ids);
    const delSchoolSet = new Set(db.deleted_school_ids);

    // Hapus dari memori jika ada yang masuk daftar terhapus atau demo
    const prevAppCount = db.applications.length;
    db.applications = db.applications.filter(
      a => !isDemoApplicationRecord(a) && !delSet.has(a.id) && (!a.registration_code || !delSet.has(a.registration_code))
    );
    if (db.applications.length !== prevAppCount) modified = true;

    const prevSchoolCount = db.schools.length;
    db.schools = db.schools.filter(
      s => !isDemoSchoolRecord(s) && !delSchoolSet.has(s.id)
    );
    if (db.schools.length !== prevSchoolCount) modified = true;

    if (Array.isArray(clientApps)) {
      for (const cApp of clientApps) {
        if (!cApp || !cApp.id) continue;
        
        // PENTING: Jangan pernah terima atau bangkitkan kembali aplikasi demo maupun yang sudah dihapus!
        if (
          isDemoApplicationRecord(cApp) ||
          delSet.has(cApp.id) ||
          (cApp.registration_code && delSet.has(cApp.registration_code))
        ) {
          continue;
        }

        const exists = db.applications.find(a => a.id === cApp.id || (cApp.registration_code && a.registration_code === cApp.registration_code));
        if (!exists) {
          // Hubungkan otomatis ke Super Admin Pengawas
          cApp.assigned_supervisor_email = 'ijinoperasionalsekolahkab.lmj@gmail.com';
          cApp.supervisor_name = 'Dr. H. Bambang Sujarwo, M.Pd.';
          cApp.supervisor_id = 'user-admin';
          cApp.connected_to_supervisor = true;
          if (!cApp.verification_status) cApp.verification_status = 'Menunggu Verifikasi';
          cApp.needs_supervisor_verification = cApp.verification_status === 'Menunggu Verifikasi';

          db.applications.unshift(cApp);
          modified = true;
        }
      }
    }

    if (Array.isArray(clientSchools)) {
      for (const cSch of clientSchools) {
        if (!cSch || !cSch.id) continue;
        // PENTING: Jangan pernah terima atau bangkitkan kembali sekolah demo maupun yang sudah dihapus!
        if (isDemoSchoolRecord(cSch) || delSchoolSet.has(cSch.id)) {
          continue;
        }
        const exists = db.schools.find(s => s.id === cSch.id || (s.npsn && cSch.npsn && s.npsn === cSch.npsn));
        if (!exists) {
          db.schools.unshift({ ...cSch, is_demo: false });
          modified = true;
        }
      }
    }

    // Merge feedbacks dari klien
    const { feedbacks: clientFeedbacks, reports: clientReports } = req.body;
    if (Array.isArray(clientFeedbacks)) {
      if (!db.feedbacks) db.feedbacks = [];
      for (const cFb of clientFeedbacks) {
        if (!cFb || !cFb.id) continue;
        const exists = db.feedbacks.some(f => f.id === cFb.id);
        if (!exists) {
          db.feedbacks.unshift(cFb);
          modified = true;
        }
      }
    }

    // Merge reports dari klien
    if (Array.isArray(clientReports)) {
      if (!db.reports) db.reports = [];
      for (const cRep of clientReports) {
        if (!cRep || !cRep.id) continue;
        const exists = db.reports.some(r => r.id === cRep.id);
        if (!exists) {
          db.reports.unshift(cRep);
          modified = true;
        }
      }
    }

    if (modified) {
      saveDatabase(db);
    }

    res.json({ 
      success: true, 
      total_apps: db.applications.length, 
      total_schools: db.schools.length,
      total_feedbacks: (db.feedbacks || []).length,
      deleted_application_ids: db.deleted_application_ids,
      deleted_school_ids: db.deleted_school_ids,
    });
  });

  // Explicit Save All Changes Endpoint (Simpan Perubahan Permanen oleh Super Admin Pengawas)
  app.post('/api/save-all', (req: Request, res: Response) => {
    const { applications, schools, categories, reports, feedbacks, deleted_application_ids, deleted_school_ids } = req.body;

    if (!db.deleted_application_ids) db.deleted_application_ids = [];
    if (!db.deleted_school_ids) db.deleted_school_ids = [];

    // 1. Terima daftar deleted_application_ids dan deleted_school_ids eksplisit
    if (Array.isArray(deleted_application_ids)) {
      for (const dId of deleted_application_ids) {
        if (dId && !db.deleted_application_ids.includes(dId)) {
          db.deleted_application_ids.push(dId);
        }
      }
    }
    if (Array.isArray(deleted_school_ids)) {
      for (const dSchId of deleted_school_ids) {
        if (dSchId && !db.deleted_school_ids.includes(dSchId)) {
          db.deleted_school_ids.push(dSchId);
        }
      }
    }

    if (Array.isArray(applications)) {
      // Deteksi aplikasi yang ada di server tapi sengaja dihilangkan / dihapus oleh Super Admin
      const incomingKeys = new Set<string>();
      applications.forEach((a: Application) => {
        if (a.id) incomingKeys.add(a.id);
        if (a.registration_code) incomingKeys.add(a.registration_code);
      });

      for (const existingApp of db.applications) {
        const isRetained = incomingKeys.has(existingApp.id) || (existingApp.registration_code && incomingKeys.has(existingApp.registration_code));
        if (!isRetained) {
          // Tandai sebagai terhapus permanen agar sinkronisasi masa depan tidak mengembalikannya
          if (existingApp.id && !db.deleted_application_ids.includes(existingApp.id)) {
            db.deleted_application_ids.push(existingApp.id);
          }
          if (existingApp.registration_code && !db.deleted_application_ids.includes(existingApp.registration_code)) {
            db.deleted_application_ids.push(existingApp.registration_code);
          }
        }
      }

      const delSet = new Set(db.deleted_application_ids);

      // Tetapkan daftar aplikasi resmi, filter out segala aplikasi demo & item terhapus
      db.applications = applications
        .filter(
          app =>
            !isDemoApplicationRecord(app) &&
            !delSet.has(app.id) &&
            (!app.registration_code || !delSet.has(app.registration_code))
        )
        .map(app => ({
          ...app,
          assigned_supervisor_email: app.assigned_supervisor_email || 'ijinoperasionalsekolahkab.lmj@gmail.com',
          supervisor_name: app.supervisor_name || 'Dr. H. Bambang Sujarwo, M.Pd.',
          supervisor_id: app.supervisor_id || 'user-admin',
          connected_to_supervisor: true,
          needs_supervisor_verification: app.verification_status === 'Menunggu Verifikasi',
        }));
    }

    if (Array.isArray(schools)) {
      // Deteksi sekolah yang ada di server tapi sengaja dihilangkan / dihapus oleh Super Admin
      const incomingSchoolIds = new Set<string>(schools.map((s: School) => s.id).filter(Boolean));
      for (const existingSchool of db.schools) {
        if (existingSchool.id && !incomingSchoolIds.has(existingSchool.id)) {
          if (!db.deleted_school_ids.includes(existingSchool.id)) {
            db.deleted_school_ids.push(existingSchool.id);
          }
        }
      }

      const delSchoolSet = new Set(db.deleted_school_ids);
      db.schools = schools
        .filter((s: School) => !isDemoSchoolRecord(s) && !delSchoolSet.has(s.id))
        .map((s: School) => ({ ...s, is_demo: false }));
    }

    if (Array.isArray(categories)) {
      db.categories = categories;
    }

    if (Array.isArray(reports)) {
      db.reports = reports;
    }

    if (Array.isArray(feedbacks)) {
      db.feedbacks = feedbacks;
    }

    saveDatabase(db);
    console.log(`[ASKIA SERVER] Perubahan Super Admin berhasil disimpan permanen ke disk (${db.applications.length} apps, ${db.schools.length} schools).`);

    res.json({
      success: true,
      message: 'Seluruh perubahan berhasil disimpan permanen di database server.',
      total_apps: db.applications.length,
      total_schools: db.schools.length,
      deleted_application_ids: db.deleted_application_ids,
      deleted_school_ids: db.deleted_school_ids,
      updated_at: db.updated_at,
    });
  });

  // ------------------ APPLICATIONS API ------------------

  // 1. GET ALL APPLICATIONS
  app.get('/api/applications', (_req: Request, res: Response) => {
    res.json(db.applications);
  });

  // 2. GET SINGLE APPLICATION
  app.get('/api/applications/:id', (req: Request, res: Response) => {
    const found = db.applications.find(a => a.id === req.params.id);
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Aplikasi tidak ditemukan' });
    }
  });

  // 3. POST NEW APPLICATION (Otomatis terhubung langsung ke Super Admin Pengawas)
  app.post('/api/applications', (req: Request, res: Response) => {
    const appData: Application = req.body;
    if (!appData.application_name || !appData.school_name) {
      return res.status(400).json({ error: 'Nama aplikasi dan sekolah wajib diisi' });
    }

    // Pastikan ID dan kode registrasi
    if (!appData.id) {
      appData.id = `app-${Date.now()}`;
    }
    if (!appData.registration_code) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      appData.registration_code = `ASKIA-2026-${randomSuffix}`;
    }
    if (!appData.created_at) {
      appData.created_at = new Date().toISOString();
    }
    appData.updated_at = new Date().toISOString();

    // Default status verifikasi adalah Menunggu Verifikasi
    if (!appData.verification_status) {
      appData.verification_status = 'Menunggu Verifikasi';
    }

    // Relasi & Flag Khusus Super Admin Pengawas Otomatis
    appData.assigned_supervisor_email = 'ijinoperasionalsekolahkab.lmj@gmail.com';
    appData.supervisor_name = 'Dr. H. Bambang Sujarwo, M.Pd.';
    appData.supervisor_id = 'user-admin';
    appData.connected_to_supervisor = true;
    appData.needs_supervisor_verification = appData.verification_status === 'Menunggu Verifikasi';

    // Insert at beginning of array so newest appears on top in Super Admin console
    const existingIndex = db.applications.findIndex(a => a.id === appData.id);
    if (existingIndex >= 0) {
      db.applications[existingIndex] = { ...db.applications[existingIndex], ...appData };
    } else {
      db.applications.unshift(appData);
    }

    saveDatabase(db);
    console.log(`[ASKIA SERVER] Inovasi sekolah terhubung ke Super Admin Pengawas: "${appData.application_name}" dari ${appData.school_name}`);

    res.status(201).json(appData);
  });

  // 4. PUT UPDATE APPLICATION (Verifikasi, edit, keaktifan)
  app.put('/api/applications/:id', (req: Request, res: Response) => {
    const appId = req.params.id;
    const index = db.applications.findIndex(a => a.id === appId);
    if (index === -1) {
      return res.status(404).json({ error: 'Aplikasi tidak ditemukan' });
    }

    const updates = { ...req.body };
    if (updates.verification_status && updates.verification_status !== 'Menunggu Verifikasi') {
      updates.needs_supervisor_verification = false;
      if (!updates.verified_by) {
        updates.verified_by = 'Dr. H. Bambang Sujarwo, M.Pd.';
        updates.verified_by_email = 'ijinoperasionalsekolahkab.lmj@gmail.com';
        updates.verified_at = new Date().toISOString();
      }
    }

    db.applications[index] = {
      ...db.applications[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveDatabase(db);
    res.json(db.applications[index]);
  });

  // 5. TOGGLE ACTIVE
  app.put('/api/applications/:id/toggle-active', (req: Request, res: Response) => {
    const appId = req.params.id;
    const index = db.applications.findIndex(a => a.id === appId);
    if (index === -1) {
      return res.status(404).json({ error: 'Aplikasi tidak ditemukan' });
    }

    db.applications[index].is_active = !db.applications[index].is_active;
    db.applications[index].updated_at = new Date().toISOString();

    saveDatabase(db);
    res.json(db.applications[index]);
  });

  // 6. DELETE APPLICATION (Penghapusan Permanen Tahan Sinkronisasi)
  app.delete('/api/applications/:id', (req: Request, res: Response) => {
    const appId = req.params.id;
    const targetApp = db.applications.find(a => a.id === appId || (a.registration_code && a.registration_code === appId));

    if (!db.deleted_application_ids) db.deleted_application_ids = [];
    if (appId && !db.deleted_application_ids.includes(appId)) {
      db.deleted_application_ids.push(appId);
    }
    if (targetApp?.registration_code && !db.deleted_application_ids.includes(targetApp.registration_code)) {
      db.deleted_application_ids.push(targetApp.registration_code);
    }

    const prevCount = db.applications.length;
    db.applications = db.applications.filter(
      a => a.id !== appId && (!a.registration_code || a.registration_code !== appId)
    );

    saveDatabase(db);
    console.log(`[ASKIA SERVER] Aplikasi "${targetApp?.application_name || appId}" dihapus permanen. Sisa: ${db.applications.length}`);

    res.json({ 
      success: true, 
      message: 'Aplikasi berhasil dihapus secara permanen dari sistem',
      deleted_id: appId,
      total_apps: db.applications.length,
      deleted_application_ids: db.deleted_application_ids 
    });
  });

  // ------------------ SCHOOLS API ------------------

  app.get('/api/schools', (_req: Request, res: Response) => {
    const delSchoolSet = new Set(db.deleted_school_ids || []);
    const validSchools = db.schools.filter(s => !isDemoSchoolRecord(s) && !delSchoolSet.has(s.id));
    res.json(validSchools);
  });

  app.post('/api/schools', (req: Request, res: Response) => {
    const schoolData: School = req.body;
    if (!schoolData.school_name) {
      return res.status(400).json({ error: 'Nama sekolah wajib diisi' });
    }
    if (isDemoSchoolRecord(schoolData)) {
      return res.status(400).json({ error: 'Data sekolah demo tidak diperbolehkan' });
    }

    if (!schoolData.id) {
      schoolData.id = `school-${Date.now()}`;
    }
    if (!schoolData.created_at) {
      schoolData.created_at = new Date().toISOString();
    }
    schoolData.is_demo = false;

    if (Array.isArray(db.deleted_school_ids)) {
      db.deleted_school_ids = db.deleted_school_ids.filter(id => id !== schoolData.id);
    }

    const index = db.schools.findIndex(s => s.id === schoolData.id || (schoolData.npsn && s.npsn === schoolData.npsn));
    if (index >= 0) {
      db.schools[index] = { ...db.schools[index], ...schoolData, is_demo: false };
    } else {
      db.schools.unshift(schoolData);
    }

    saveDatabase(db);
    res.status(201).json(schoolData);
  });

  app.delete('/api/schools/:id', (req: Request, res: Response) => {
    const schoolId = req.params.id;
    if (!db.deleted_school_ids) db.deleted_school_ids = [];
    if (schoolId && !db.deleted_school_ids.includes(schoolId)) {
      db.deleted_school_ids.push(schoolId);
    }
    db.schools = db.schools.filter(s => s.id !== schoolId);
    saveDatabase(db);
    res.json({ success: true, deleted_school_ids: db.deleted_school_ids });
  });

  // ------------------ CATEGORIES API ------------------

  app.get('/api/categories', (_req: Request, res: Response) => {
    res.json(db.categories);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const cat: Category = req.body;
    if (!cat.id) cat.id = `cat-${Date.now()}`;
    db.categories.push(cat);
    saveDatabase(db);
    res.status(201).json(cat);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // ------------------ REPORTS & FEEDBACKS ------------------

  app.get('/api/reports', (_req: Request, res: Response) => {
    res.json(db.reports);
  });

  app.post('/api/reports', (req: Request, res: Response) => {
    const report: Report = req.body;
    if (!report.id) report.id = `rep-${Date.now()}`;
    report.created_at = new Date().toISOString();
    db.reports.unshift(report);
    saveDatabase(db);
    res.status(201).json(report);
  });

  app.put('/api/reports/:id', (req: Request, res: Response) => {
    const repId = req.params.id;
    const index = db.reports.findIndex(r => r.id === repId);
    if (index >= 0) {
      db.reports[index] = { ...db.reports[index], ...req.body };
      saveDatabase(db);
      res.json(db.reports[index]);
    } else {
      res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
  });

  app.get('/api/feedbacks', (_req: Request, res: Response) => {
    res.json(db.feedbacks);
  });

  app.post('/api/feedbacks', (req: Request, res: Response) => {
    const fb: Feedback = req.body;
    if (!fb.id) fb.id = `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    if (!fb.created_at) fb.created_at = new Date().toISOString();
    if (!db.feedbacks) db.feedbacks = [];

    const existingIdx = db.feedbacks.findIndex(f => f.id === fb.id);
    if (existingIdx >= 0) {
      db.feedbacks[existingIdx] = { ...db.feedbacks[existingIdx], ...fb };
    } else {
      db.feedbacks.unshift(fb);
    }

    saveDatabase(db);
    console.log(`[ASKIA SERVER] Ulasan baru diterima untuk inovasi "${fb.application_name || fb.registration_code || fb.application_id}" dari "${fb.user_name}" (${fb.rating}/5)`);
    res.status(201).json(fb);
  });

  // ------------------ DEMO DATA MANAGEMENT (SECTION K) ------------------

  app.post('/api/demo/purge', (_req: Request, res: Response) => {
    const prevApps = db.applications.length;
    const prevSchools = db.schools.length;

    if (!db.deleted_application_ids) db.deleted_application_ids = [];
    if (!db.deleted_school_ids) db.deleted_school_ids = [];

    for (const app of db.applications) {
      if (isDemoApplicationRecord(app)) {
        if (app.id && !db.deleted_application_ids.includes(app.id)) {
          db.deleted_application_ids.push(app.id);
        }
        if (app.registration_code && !db.deleted_application_ids.includes(app.registration_code)) {
          db.deleted_application_ids.push(app.registration_code);
        }
      }
    }

    for (const sch of db.schools) {
      if (isDemoSchoolRecord(sch)) {
        if (sch.id && !db.deleted_school_ids.includes(sch.id)) {
          db.deleted_school_ids.push(sch.id);
        }
      }
    }

    db.applications = db.applications.filter(a => !isDemoApplicationRecord(a));
    db.schools = db.schools.filter(s => !isDemoSchoolRecord(s));

    saveDatabase(db);
    res.json({
      success: true,
      removedApps: prevApps - db.applications.length,
      removedSchools: prevSchools - db.schools.length,
    });
  });

  app.post('/api/demo/restore', (_req: Request, res: Response) => {
    // Pertahankan seluruh aplikasi & sekolah aktual dan pastikan data demo tetap tidak dimunculkan
    const existingRealApps = db.applications.filter(a => !isDemoApplicationRecord(a));
    const existingRealSchools = db.schools.filter(s => !isDemoSchoolRecord(s));
    db.schools = existingRealSchools;
    db.applications = existingRealApps;
    saveDatabase(db);
    res.json({ success: true, message: 'Data referensi diperbarui (aplikasi & sekolah demo tetap dinonaktifkan)' });
  });

  // ------------------ VITE / STATIC SERVING ------------------

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASKIA-SI GADIS] Server sentral aktif di port ${PORT}`);
    console.log(`[ASKIA-SI GADIS] Seluruh inovasi sekolah terhubung langsung dengan Super Admin Pengawas`);
  });
}

startServer().catch((err) => {
  console.error('[ASKIA-SI GADIS] Gagal memulai server:', err);
});
