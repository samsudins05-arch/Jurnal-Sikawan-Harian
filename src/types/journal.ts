export interface ActivityItem {
  id: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  activity: string;
  indicator?: string; // Indikator Kinerja / Capaian Output
  photoUrl?: string; // base64 or storage url
  notes: string;
}

export interface ActivityTemplateItem {
  text: string;
  indicator: string; // Indikator Kinerja / Capaian Output
  notes: string; // Keterangan / Bukti Dukung
  role?: 'Guru' | 'Tendik' | 'Umum';
  timeRange?: string; // e.g. "06.30 - 07.15"
}

export interface ActivityTemplateCategory {
  category: string;
  role: 'Guru' | 'Tendik' | 'Umum';
  items: ActivityTemplateItem[];
}

export interface FullDayTemplatePackage {
  id: string;
  title: string;
  role: 'Guru' | 'Tendik';
  shift: string;
  description: string;
  activities: ActivityItem[];
}

export interface UserProfile {
  name: string;
  nip: string;
  position: string; // Jabatan, e.g. "Guru Kelas V", "Guru PJOK"
  unitWork: string; // Unit Kerja, e.g. "SDN Babelan Kota 01", "Dinas Pendidikan Kab. Bekasi"
  rankGrade: string; // Pangkat / Gol, e.g. "Penata Muda / III/a"
  employeeStatus: string; // Status Pegawai, e.g. "PNS", "PPPK", "Guru Honorer"
  photoUrl?: string; // Pas Foto 3x4
  signatureUrl?: string; // Tanda Tangan Pegawai / Guru (PNG/JPG)
  schoolHeadName: string; // Nama Kepala Sekolah
  schoolHeadNip: string; // NIP Kepala Sekolah
  schoolHeadSignatureUrl?: string; // Tanda Tangan Kepala Sekolah (PNG/JPG)
  schoolStampUrl?: string; // Stempel Resmi Sekolah (PNG/JPG transparan)
  cityLocation: string; // Lokasi TTD, e.g. "Bekasi"
}

export interface ShiftConfig {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface JournalDay {
  id?: string;
  userId: string;
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Jumat, 28 Agustus 2026"
  shift: string;
  activities: ActivityItem[];
  profileSnapshot?: Partial<UserProfile>;
  teacherName?: string;
  teacherNip?: string;
  isPdfSaved?: boolean; // True only if teacher has filled journal AND clicked Simpan PDF
  pdfSavedAt?: number | null;
  updatedAt?: number;
}

export interface SchoolSettings {
  govName: string; // e.g. "PEMERINTAH KABUPATEN BEKASI"
  deptName: string; // e.g. "DINAS PENDIDIKAN"
  subUnitName?: string; // e.g. "SD NEGERI SIKAWAN 01"
  address?: string;
  kopMode?: 'text' | 'image'; // 'text' or 'image'
  customKopImage?: string; // full header banner image
  customLogoLeft?: string;
  customLogoRight?: string;
  schoolStampUrl?: string; // Stempel Sekolah resmi
}

export type ActiveTab = 'jurnal' | 'rekap' | 'pengaturan';
