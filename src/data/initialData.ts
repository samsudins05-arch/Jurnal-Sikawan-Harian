import { UserProfile, SchoolSettings, ShiftConfig, ActivityItem } from '../types/journal';

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

export const DEFAULT_STAFF_LIST: Partial<UserProfile>[] = [
  {
    name: 'SAMSUDIN, S.Pd',
    nip: '198506152010011025',
    position: 'Guru Kelas',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata / III/c',
    employeeStatus: 'PNS',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'SITI NURJANAH, S.Pd.I',
    nip: '198903142019022011',
    position: 'Guru PAI',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata Muda / III/a',
    employeeStatus: 'PPPK',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'H. AHMAD FAUZI, S.Pd',
    nip: '198207182009011007',
    position: 'Guru PJOK',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata Tk.I / III/d',
    employeeStatus: 'PNS',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'DEWI ANGGRAENI, S.Pd',
    nip: '199405222022212015',
    position: 'Guru Kelas',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata Muda / III/a',
    employeeStatus: 'PPPK',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'RUDI HARTONO, S.Pd',
    nip: '199112052023211009',
    position: 'Guru PJOK',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata Muda / III/a',
    employeeStatus: 'PPPK',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'BAMBANG HERMANTO, S.Pd',
    nip: '-',
    position: 'Guru Bahasa Inggris',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: '-',
    employeeStatus: 'Guru Honorer',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  },
  {
    name: 'NUR AINI, S.Pd',
    nip: '199608102024212018',
    position: 'Guru Kelas',
    unitWork: 'SDN BABELAN KOTA 01',
    rankGrade: 'Penata Muda / III/a',
    employeeStatus: 'PPPK',
    schoolHeadName: 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: '197501012000031005',
    cityLocation: 'Bekasi',
  }
];

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

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    startHour: '06',
    startMinute: '30',
    endHour: '07',
    endMinute: '30',
    activity: 'Menyambut kehadiran peserta didik di gerbang sekolah, pembiasaan senyum salam sapa, serta mengondisikan apel pagi dan doa bersama.',
    notes: 'Terlaksana dengan tertib dan lancar',
    photoUrl: '',
  },
  {
    id: 'act_2',
    startHour: '07',
    startMinute: '30',
    endHour: '09',
    endMinute: '30',
    activity: 'Melaksanakan Kegiatan Belajar Mengajar (KBM) materi Matematika tentang Operasi Hitung Pecahan di kelas, pendampingan kelompok dan evaluasi formatif.',
    notes: 'Diikuti 28 siswa secara aktif',
    photoUrl: '',
  },
  {
    id: 'act_3',
    startHour: '09',
    startMinute: '45',
    endHour: '11',
    endMinute: '30',
    activity: 'Membimbing kegiatan Literasi & Numerasi, mengoreksi lembar kerja harian siswa dan memberikan umpan balik (feedback).',
    notes: 'Siswa menyelesaikan lembar kerja',
    photoUrl: '',
  },
  {
    id: 'act_4',
    startHour: '12',
    startMinute: '30',
    endHour: '15',
    endMinute: '00',
    activity: 'Menyusun perangkat pembelajaran / modul ajar untuk pekan berikutnya serta koordinasi dengan rekan guru sejawat.',
    notes: 'Modul ajar semester ganjil',
    photoUrl: '',
  }
];

export const QUICK_ACTIVITY_TEMPLATES = [
  {
    category: 'Pembiasaan & Kedisiplinan',
    items: [
      { text: 'Menyambut kedatangan siswa di gerbang (5S: Senyum, Sapa, Salam, Sopan, Santun) dan pengondisian apel pagi.', notes: 'Terlaksana dengan tertib' },
      { text: 'Memimpin kegiatan literasi pagi, membaca Al-Quran/doa bersama di ruang kelas.', notes: 'Diikuti seluruh siswa' },
      { text: 'Melaksanakan pengawasan kegiatan istirahat dan pembiasaan hidup bersih dan sehat (PHBS).', notes: 'Lingkungan sekolah kondusif' }
    ]
  },
  {
    category: 'Kegiatan Belajar Mengajar (KBM)',
    items: [
      { text: 'Melaksanakan pembelajaran tatap muka dan diferensiasi berbasis Kurikulum Merdeka.', notes: 'Partisipasi aktif 100%' },
      { text: 'Memberikan bimbingan remedial dan pengayaan bagi siswa yang membutuhkan penguatan materi.', notes: '5 siswa remedial terbimbing' },
      { text: 'Melaksanakan asesmen formatif / ulangan harian dan evaluasi kompetensi siswa.', notes: 'Hasil evaluasi terinput' }
    ]
  },
  {
    category: 'Administrasi & Penilaian',
    items: [
      { text: 'Memeriksa dan menilai tugas harian, pekerjaan rumah, serta portofolio peserta didik.', notes: 'Nilai dimasukkan ke leger' },
      { text: 'Menyusun Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar dan bahan ajar digital.', notes: 'Modul terverifikasi' },
      { text: 'Mengisi daftar hadir siswa, jurnal kelas, dan rekapitulasi presensi harian.', notes: 'Data tersinkronisasi' }
    ]
  },
  {
    category: 'Rapat & Pengembangan Diri',
    items: [
      { text: 'Mengikuti rapat dinas dewan guru bersama Kepala Sekolah membahas evaluasi KBM.', notes: 'Notulensi tercatat' },
      { text: 'Mengikuti kegiatan Komunitas Belajar (Kombel) / KKG / MGMP peningkatan kompetensi guru.', notes: 'Sertifikat / Berita Acara' },
      { text: 'Koordinasi dengan wali murid mengenai perkembangan akademik dan karakter peserta didik.', notes: 'Komunikasi positif' }
    ]
  }
];
