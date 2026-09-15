import { 
  UserProfile, 
  SchoolSettings, 
  ShiftConfig, 
  ActivityItem, 
  ActivityTemplateCategory, 
  FullDayTemplatePackage 
} from '../types/journal';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  nip: '',
  position: 'Guru Kelas',
  unitWork: 'SDN BABELAN KOTA 01',
  rankGrade: '',
  employeeStatus: 'PNS',
  photoUrl: '',
  signatureUrl: '',
  schoolHeadName: '',
  schoolHeadNip: '',
  schoolHeadSignatureUrl: '',
  schoolStampUrl: '',
  cityLocation: 'Bekasi',
};

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  govName: 'PEMERINTAH KABUPATEN BEKASI',
  deptName: 'DINAS PENDIDIKAN',
  subUnitName: 'SDN BABELAN KOTA 01',
  address: 'Komplek Perkantoran Pemkab Bekasi, Cikarang Pusat',
  kopMode: 'text',
  customKopImage: '',
  customLogoLeft: '',
  customLogoRight: '',
  schoolStampUrl: '',
};

export const DEFAULT_STAFF_LIST: Partial<UserProfile>[] = [];

export const DEFAULT_SHIFTS: ShiftConfig[] = [
  {
    id: 'shift_guru_pagi',
    title: 'Guru : Shift Pagi (06.30 - 15.00)',
    startTime: '06:30',
    endTime: '15:00',
  },
  {
    id: 'shift_guru_siang',
    title: 'Guru : Shift Siang (10.00 - 17.00)',
    startTime: '10:00',
    endTime: '17:00',
  },
  {
    id: 'shift_tendik_tu',
    title: 'Tenaga Kependidikan / TU (07.00 - 15.30)',
    startTime: '07:00',
    endTime: '15:30',
  },
  {
    id: 'shift_piket',
    title: 'Guru Piket / Tambahan (06.15 - 16.00)',
    startTime: '06:15',
    endTime: '16:00',
  },
];

// Standar 6 Kegiatan Harian Guru (Ringkas & Efektif)
export const SIX_ACTIVITIES_GURU: ActivityItem[] = [
  {
    id: 'act_guru_1',
    startHour: '06',
    startMinute: '30',
    endHour: '07',
    endMinute: '15',
    activity: 'Kegiatan Pagi Ceria dan Gerakan 7 Kebiasaan Anak Indonesia Hebat',
    notes: 'Buku piket, presensi pagi',
    photoUrl: '',
  },
  {
    id: 'act_guru_2',
    startHour: '07',
    startMinute: '15',
    endHour: '09',
    endMinute: '30',
    activity: 'Pelaksanaan KBM tatap muka interaktif sesuai Modul Ajar',
    notes: 'Modul Ajar, lembar LKPD',
    photoUrl: '',
  },
  {
    id: 'act_guru_3',
    startHour: '09',
    startMinute: '45',
    endHour: '11',
    endMinute: '15',
    activity: 'Bimbingan literasi, numerasi, serta remedial dan pengayaan',
    notes: 'Daftar hadir remedi, portofolio',
    photoUrl: '',
  },
  {
    id: 'act_guru_4',
    startHour: '11',
    startMinute: '15',
    endHour: '12',
    endMinute: '30',
    activity: 'Pelaksanaan asesmen formatif dan pemeriksaan tugas siswa',
    notes: 'Buku Nilai Harian, lembar tugas',
    photoUrl: '',
  },
  {
    id: 'act_guru_5',
    startHour: '13',
    startMinute: '00',
    endHour: '14',
    endMinute: '00',
    activity: 'Penyusunan modul ajar, rubrik asesmen, dan media pembelajaran',
    notes: 'Modul Ajar, instrumen asesmen',
    photoUrl: '',
  },
  {
    id: 'act_guru_6',
    startHour: '14',
    startMinute: '00',
    endHour: '15',
    endMinute: '00',
    activity: 'Kegiatan Komunitas Belajar (Kombel) dan refleksi pembelajaran',
    notes: 'Notula Kombel, jurnal refleksi',
    photoUrl: '',
  },
];

// Standar 6 Kegiatan Harian Tenaga Kependidikan / Tendik / TU
export const SIX_ACTIVITIES_TENDIK: ActivityItem[] = [
  {
    id: 'act_tendik_1',
    startHour: '07',
    startMinute: '00',
    endHour: '08',
    endMinute: '00',
    activity: 'Pengelolaan presensi pegawai dan kesiapan operasional kantor',
    notes: 'Rekap presensi, buku tamu',
    photoUrl: '',
  },
  {
    id: 'act_tendik_2',
    startHour: '08',
    startMinute: '00',
    endHour: '10',
    endMinute: '00',
    activity: 'Pengelolaan surat dinas masuk/keluar dan agenda disposisi',
    notes: 'Buku agenda surat dinas',
    photoUrl: '',
  },
  {
    id: 'act_tendik_3',
    startHour: '10',
    startMinute: '00',
    endHour: '12',
    endMinute: '00',
    activity: 'Pemutakhiran data Dapodikdasmen dan verifikasi kepegawaian',
    notes: 'SPTJM Dapodik / InfoGTK',
    photoUrl: '',
  },
  {
    id: 'act_tendik_4',
    startHour: '12',
    startMinute: '30',
    endHour: '13',
    endMinute: '30',
    activity: 'Pencatatan inventaris sarana prasarana sekolah (KIR/KIB)',
    notes: 'Buku Induk Inventaris',
    photoUrl: '',
  },
  {
    id: 'act_tendik_5',
    startHour: '13',
    startMinute: '30',
    endHour: '14',
    endMinute: '30',
    activity: 'Penyusunan berkas SPJ BOSP dan verifikasi bukti belanja',
    notes: 'Draf BKU, kuitansi sah',
    photoUrl: '',
  },
  {
    id: 'act_tendik_6',
    startHour: '14',
    startMinute: '30',
    endHour: '15',
    endMinute: '30',
    activity: 'Pelayanan administrasi kesiswaan dan mutasi peserta didik',
    notes: 'Buku ekspedisi layanan kesiswaan',
    photoUrl: '',
  },
];

// Default harian (kini berisi 6 kegiatan ringkas standar)
export const INITIAL_ACTIVITIES: ActivityItem[] = SIX_ACTIVITIES_GURU;

// Paket 6 Kegiatan Lengkap 1 Hari Kerja
export const FULL_DAY_PACKAGES: FullDayTemplatePackage[] = [
  {
    id: 'pkg_guru_6',
    title: 'Paket Standar 6 Kegiatan Harian Guru',
    role: 'Guru',
    shift: 'Guru : Shift Pagi (06.30 - 15.00)',
    description: 'Format ringkas 6 kegiatan kerja harian guru (Pagi Ceria & 7 Kebiasaan, KBM, Bimbingan, Asesmen, Administrasi Ajar & Kombel).',
    activities: SIX_ACTIVITIES_GURU,
  },
  {
    id: 'pkg_tendik_6',
    title: 'Paket Standar 6 Kegiatan Harian Tendik / TU',
    role: 'Tendik',
    shift: 'Tenaga Kependidikan / TU (07.00 - 15.30)',
    description: 'Format ringkas 6 kegiatan kerja harian Tenaga Kependidikan / Tata Usaha (Presensi, Persuratan, Dapodik, Sarpras, SPJ & Kesiswaan).',
    activities: SIX_ACTIVITIES_TENDIK,
  },
];

// Pustaka Kategori Template Kegiatan Guru & Tendik (Ringkas, Tanpa Jam & Tanpa Indikator)
export const QUICK_ACTIVITY_TEMPLATES: ActivityTemplateCategory[] = [
  // --- 6 KATEGORI GURU ---
  {
    category: 'Guru 1: Pembiasaan & Karakter Pagi',
    role: 'Guru',
    items: [
      {
        text: 'Kegiatan Pagi Ceria dan Gerakan 7 Kebiasaan Anak Indonesia Hebat',
        notes: 'Buku piket & presensi pagi',
        role: 'Guru',
      },
      {
        text: 'Pembiasaan literasi, numerasi pagi, dan tadarus Al-Quran di kelas',
        notes: 'Jurnal pembiasaan kelas',
        role: 'Guru',
      },
      {
        text: 'Pemeriksaan kedisiplinan pakaian seragam dan kerapian siswa',
        notes: 'Buku catatan kedisiplinan',
        role: 'Guru',
      },
      {
        text: 'Pengondisian ketertiban kelas dan menyanyikan lagu wajib nasional',
        notes: 'Foto kegiatan pembiasaan',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 2: Kegiatan Belajar Mengajar (KBM)',
    role: 'Guru',
    items: [
      {
        text: 'Pelaksanaan KBM tatap muka materi inti sesuai Modul Ajar',
        notes: 'Modul Ajar & lembar LKPD',
        role: 'Guru',
      },
      {
        text: 'Pembelajaran interaktif, diskusi kelompok terarah, dan presentasi siswa',
        notes: 'Lembar observasi kelas',
        role: 'Guru',
      },
      {
        text: 'Praktik pembelajaran kontekstual dan pemanfaatan media alat peraga',
        notes: 'Dokumentasi praktik siswa',
        role: 'Guru',
      },
      {
        text: 'Pelaksanaan kegiatan Projek Penguatan Profil Pelajar Pancasila (P5)',
        notes: 'Rubrik penilaian P5',
        role: 'Guru',
      },
      {
        text: 'Pendampingan aktivitas belajar siswa dan tanya jawab pemahaman materi',
        notes: 'Lembar kerja siswa',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 3: Diferensiasi & Bimbingan',
    role: 'Guru',
    items: [
      {
        text: 'Bimbingan remedial bagi siswa yang belum mencapai tujuan pembelajaran',
        notes: 'Daftar hadir remedi & nilai',
        role: 'Guru',
      },
      {
        text: 'Pemberian materi pengayaan bagi siswa berpencapaian tinggi',
        notes: 'Lembar tugas pengayaan',
        role: 'Guru',
      },
      {
        text: 'Pendampingan khusus literasi dan numerasi terbimbing di pojok baca',
        notes: 'Buku bimbingan literasi',
        role: 'Guru',
      },
      {
        text: 'Bimbingan konseling dan motivasi belajar peserta didik di kelas',
        notes: 'Buku catatan bimbingan',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 4: Asesmen & Koreksi Tugas',
    role: 'Guru',
    items: [
      {
        text: 'Pelaksanaan asesmen formatif harian dan kuis pemahaman materi',
        notes: 'Instrumen asesmen formatif',
        role: 'Guru',
      },
      {
        text: 'Pemeriksaan dan pengoreksian lembar latihan serta tugas mandiri siswa',
        notes: 'Lembar tugas bertanda tangan',
        role: 'Guru',
      },
      {
        text: 'Pelaksanaan asesmen sumatif materi / ulangan harian',
        notes: 'Daftar nilai ulangan harian',
        role: 'Guru',
      },
      {
        text: 'Pemeriksaan kelengkapan portofolio hasil karya dan nilai siswa',
        notes: 'Buku rekapitulasi nilai',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 5: Perangkat Ajar & Administrasi',
    role: 'Guru',
    items: [
      {
        text: 'Penyusunan dan penyempurnaan Modul Ajar Kurikulum Merdeka',
        notes: 'Draf Modul Ajar',
        role: 'Guru',
      },
      {
        text: 'Pengembangan media pembelajaran interaktif dan bahan tayang digital',
        notes: 'Bahan tayang / presentasi',
        role: 'Guru',
      },
      {
        text: 'Penyusunan instrumen kisi-kisi soal dan rubrik penilaian asesmen',
        notes: 'Rubrik penilaian ajar',
        role: 'Guru',
      },
      {
        text: 'Pengisian administrasi presensi siswa dan rekapitulasi ketidakhadiran',
        notes: 'Buku presensi kelas',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 6: Kombel, Refleksi & PKB',
    role: 'Guru',
    items: [
      {
        text: 'Kegiatan Komunitas Belajar (Kombel) intra-sekolah / KKG guru',
        notes: 'Notula kegiatan Kombel',
        role: 'Guru',
      },
      {
        text: 'Refleksi dan evaluasi hasil pembelajaran harian bersama rekan sejawat',
        notes: 'Lembar jurnal refleksi',
        role: 'Guru',
      },
      {
        text: 'Pelatihan mandiri peningkatan kompetensi pada Platform Merdeka Mengajar (PMM)',
        notes: 'Bukti aksi nyata / modul PMM',
        role: 'Guru',
      },
      {
        text: 'Komunikasi dan koordinasi perkembangan belajar siswa dengan orang tua / wali',
        notes: 'Buku penghubung / paguyuban',
        role: 'Guru',
      },
    ],
  },

  // --- 6 KATEGORI TENDIK (TENAGA KEPENDIDIKAN) ---
  {
    category: 'Tendik 1: Presensi & Operasional Kantor',
    role: 'Tendik',
    items: [
      {
        text: 'Pengelolaan presensi harian pegawai dan kesiapan operasional kantor',
        notes: 'Rekap presensi harian',
        role: 'Tendik',
      },
      {
        text: 'Pemeriksaan kebersihan lingkungan sekolah dan fasilitas air/listrik',
        notes: 'Lembar ceklis kebersihan',
        role: 'Tendik',
      },
      {
        text: 'Pelayanan loket informasi umum sekolah dan penerimaan tamu dinas',
        notes: 'Buku tamu dinas',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 2: Persuratan & Disposisi Dinas',
    role: 'Tendik',
    items: [
      {
        text: 'Pengelolaan agenda surat dinas masuk/keluar dan lembar disposisi',
        notes: 'Buku agenda persuratan',
        role: 'Tendik',
      },
      {
        text: 'Penyusunan draf surat tugas dinas, surat undangan, dan pengantar',
        notes: 'Draf naskah surat dinas',
        role: 'Tendik',
      },
      {
        text: 'Digitalisasi arsip dokumen dan penataan berkas persuratan sekolah',
        notes: 'Folder arsip digital',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 3: Dapodik & Pelaporan Pusdatin',
    role: 'Tendik',
    items: [
      {
        text: 'Verifikasi dan pemutakhiran data peserta didik dan PTK pada Dapodik',
        notes: 'Lembar validasi Dapodik',
        role: 'Tendik',
      },
      {
        text: 'Pengurusan verifikasi mutasi peserta didik dan validasi NISN di VervalPD',
        notes: 'Bukti persetujuan mutasi',
        role: 'Tendik',
      },
      {
        text: 'Pengecekan validasi data kepegawaian dan riwayat KGB pada InfoGTK',
        notes: 'Lembar cetak InfoGTK',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 4: Sarpras & Inventaris (KIR/KIB)',
    role: 'Tendik',
    items: [
      {
        text: 'Pencatatan inventaris Barang Milik Daerah (KIR/KIB) dan mutasi sarpras',
        notes: 'Buku Induk Inventaris',
        role: 'Tendik',
      },
      {
        text: 'Pengecekan kelayakan fasilitas fisik sarana prasarana sekolah',
        notes: 'Format ceklis sarpras',
        role: 'Tendik',
      },
      {
        text: 'Penerimaan dan pencatatan buku teks kurikulum serta persediaan ATK',
        notes: 'Kartu stok barang ATK',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 5: Administrasi Keuangan & SPJ BOSP',
    role: 'Tendik',
    items: [
      {
        text: 'Penyusunan berkas SPJ BOSP dan verifikasi kuitansi bukti belanja',
        notes: 'Draf BKU & kuitansi sah',
        role: 'Tendik',
      },
      {
        text: 'Pencatatan realisasi pembelanjaan operasional pada ARKAS dan SIPLAH',
        notes: 'Bukti transaksi ARKAS',
        role: 'Tendik',
      },
      {
        text: 'Penyiapan berkas kode billing dan bukti penyetoran pajak dinas',
        notes: 'Bukti Penerimaan Negara (BPN)',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 6: Layanan Kesiswaan & Buku Induk',
    role: 'Tendik',
    items: [
      {
        text: 'Pelayanan administrasi kesiswaan, legalisir ijazah, dan surat keterangan',
        notes: 'Buku ekspedisi kesiswaan',
        role: 'Tendik',
      },
      {
        text: 'Penulisan dan pemutakhiran riwayat siswa pada Buku Induk Register',
        notes: 'Buku Induk Siswa',
        role: 'Tendik',
      },
      {
        text: 'Verifikasi berkas usulan Program Indonesia Pintar (PIP) siswa',
        notes: 'Daftar nominasi PIP',
        role: 'Tendik',
      },
    ],
  },
];

export function normalizeActivityText(text: string): string {
  if (!text) return text;
  if (
    text.includes('Penyambutan siswa (5S), apel pagi, dan doa bersama') ||
    text.includes('Penyambutan peserta didik (5S), apel pagi, dan doa bersama') ||
    text.includes('Penyambutan siswa (5S)') ||
    text.includes('Penyambutan peserta didik (5S)')
  ) {
    return 'Kegiatan Pagi Ceria dan Gerakan 7 Kebiasaan Anak Indonesia Hebat';
  }
  return text;
}

export function normalizeActivities(items: ActivityItem[]): ActivityItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((act) => ({
    ...act,
    activity: normalizeActivityText(act.activity),
  }));
}

