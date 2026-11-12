/**
 * ASKIA-SI GADIS - Core Types and Models
 * Informasi Gudang Aplikasi Digital Sekolah
 */

export type UserRole = 'admin' | 'operator' | 'visitor';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  school_id?: string;
  school_name?: string;
  institution?: string;
  position?: string;
  phone?: string;
  district?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SystemCredential {
  email: string;
  password: string;
  role: 'admin' | 'operator';
  full_name: string;
  label: string;
  school_id?: string;
  school_name?: string;
}

export interface School {
  id: string;
  school_name: string;
  npsn: string;
  address: string;
  district: string; // Kecamatan
  principal_name: string;
  operator_name?: string;
  contact_email: string;
  phone?: string;
  logo_url: string;
  description: string;
  is_demo: boolean;
  created_at: string;
}

export type VerificationStatus = 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak' | 'Tidak Aktif';

export interface Application {
  id: string;
  registration_code: string;
  school_id: string;
  school_name: string;
  district: string;
  application_name: string;
  category: string;
  application_type: string;
  description: string;
  benefits: string;
  target_users: string;
  usage_guide: string;
  application_url: string;
  demo_url?: string;
  thumbnail_url: string;
  developer_name: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
  is_active: boolean;
  is_demo: boolean;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  // Relasi & Flag Khusus Super Admin Pengawas
  assigned_supervisor_email?: string;
  supervisor_name?: string;
  supervisor_id?: string;
  connected_to_supervisor?: boolean;
  needs_supervisor_verification?: boolean;
  verified_by?: string;
  verified_by_email?: string;
  verified_at?: string;
}

export interface Category {
  id: string;
  category_name: string;
  description: string;
  icon_name?: string;
}

export interface ApplicationType {
  id: string;
  type_name: string;
  description: string;
}

export interface Feedback {
  id: string;
  application_id: string;
  registration_code?: string;
  application_name?: string;
  user_name: string;
  user_role: string;
  rating: number; // 1 to 5
  feedback_text: string;
  created_at: string;
}

export type ReportType = 
  | 'Link aplikasi tidak aktif'
  | 'Informasi tidak sesuai'
  | 'Aplikasi tidak dapat digunakan'
  | 'Konten yang tidak layak'
  | 'Lainnya';

export type ReportStatus = 'Menunggu Peninjauan' | 'Ditindaklanjuti' | 'Selesai';

export interface Report {
  id: string;
  application_id: string;
  application_name: string;
  reporter_name: string;
  reporter_email: string;
  report_type: ReportType;
  report_description: string;
  report_status: ReportStatus;
  created_at: string;
}

export interface DashboardStats {
  total_schools: number;
  total_applications: number;
  total_categories: number;
  total_verified: number;
  total_active: number;
  total_pending: number;
  total_rejected: number;
}
