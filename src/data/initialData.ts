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

// Standar 6 Kegiatan Harian Guru (Lengkap Indikator Kinerja & Bukti Dukung)
export const SIX_ACTIVITIES_GURU: ActivityItem[] = [
  {
    id: 'act_guru_1',
    startHour: '06',
    startMinute: '30',
    endHour: '07',
    endMinute: '15',
    activity: 'Menyambut kehadiran peserta didik di gerbang sekolah dengan pembiasaan 5S (Senyum, Salam, Sapa, Sopan, Santun), mendampingi pengondisian apel pagi, menyanyikan lagu Indonesia Raya, dan doa bersama.',
    indicator: 'Terlaksananya pembiasaan budaya positif karakter 5S dan 100% peserta didik terkondisikan tertib di kelas/lapangan.',
    notes: 'Buku piket, presensi pagi, dan foto dokumentasi apel',
    photoUrl: '',
  },
  {
    id: 'act_guru_2',
    startHour: '07',
    startMinute: '15',
    endHour: '09',
    endMinute: '30',
    activity: 'Melaksanakan Kegiatan Belajar Mengajar (KBM) tatap muka interaktif berbasis Kurikulum Merdeka (apersepsi, eksplorasi konsep, diskusi kelompok terarah, dan pemanfaatan media ajar kontekstual).',
    indicator: 'Ketercapaian Tujuan Pembelajaran (TP) sesi pagi dan terlaksananya pembelajaran berdiferensiasi aktif-partisipatif.',
    notes: 'Modul Ajar, LKPD siswa, dan lembar observasi kelas',
    photoUrl: '',
  },
  {
    id: 'act_guru_3',
    startHour: '09',
    startMinute: '45',
    endHour: '11',
    endMinute: '15',
    activity: 'Melaksanakan bimbingan literasi dan numerasi di kelas/pojok baca, pendampingan diferensiasi bagi siswa yang memerlukan penguatan materi, serta pelaksanaan remedial dan pengayaan.',
    indicator: 'Tuntasnya bimbingan intensif literasi-numerasi dan penguatan kompetensi esensial minimal 5-8 siswa.',
    notes: 'Daftar hadir remedi, portofolio literasi, dan buku bimbingan',
    photoUrl: '',
  },
  {
    id: 'act_guru_4',
    startHour: '11',
    startMinute: '15',
    endHour: '12',
    endMinute: '30',
    activity: 'Melaksanakan asesmen formatif harian, memeriksa dan mengoreksi hasil latihan/tugas mandiri peserta didik, serta memberikan umpan balik (feedback) konstruktif.',
    indicator: 'Terkoreksinya 100% lembar asesmen tugas siswa dan terinputnya data capaian kompetensi ke leger nilai harian.',
    notes: 'Buku Daftar Nilai Harian dan lembar tugas terkoreksi',
    photoUrl: '',
  },
  {
    id: 'act_guru_5',
    startHour: '13',
    startMinute: '00',
    endHour: '14',
    endMinute: '00',
    activity: 'Menyusun dan menyempurnakan administrasi perangkat pembelajaran, modul ajar terdiferensiasi, rubrik penilaian, serta menyiapkan media ajar inovatif untuk pertemuan esok hari.',
    indicator: 'Tersedianya 1 set Modul Ajar terverifikasi, instrumen penilaian, dan media pembelajaran siap pakai.',
    notes: 'Draf Modul Ajar Kurikulum Merdeka dan instrumen asesmen',
    photoUrl: '',
  },
  {
    id: 'act_guru_6',
    startHour: '14',
    startMinute: '00',
    endHour: '15',
    endMinute: '00',
    activity: 'Mengikuti kegiatan Komunitas Belajar (Kombel) intra-sekolah / KKG, refleksi evaluasi pembelajaran harian bersama rekan sejawat, dan koordinasi perkembangan belajar siswa dengan Kepala Sekolah/wali murid.',
    indicator: 'Terdokumentasikannya catatan refleksi pembelajaran harian dan kesepakatan tindak lanjut peningkatan mutu pembelajaran.',
    notes: 'Notula kegiatan Kombel, jurnal refleksi guru, dan log wali murid',
    photoUrl: '',
  },
];

// Standar 6 Kegiatan Harian Tenaga Kependidikan / Tendik / TU (Lengkap Indikator Kinerja & Bukti Dukung)
export const SIX_ACTIVITIES_TENDIK: ActivityItem[] = [
  {
    id: 'act_tendik_1',
    startHour: '07',
    startMinute: '00',
    endHour: '08',
    endMinute: '00',
    activity: 'Melaksanakan pengelolaan presensi harian pendidik & tenaga kependidikan (fingerprint & manual), membuka loket layanan administrasi sekolah, dan memeriksa kesiapan operasional ruang kantor.',
    indicator: 'Rekapitulasi presensi harian guru & staf tercatat 100% tepat waktu serta ruang loket tata usaha siap beroperasi.',
    notes: 'Rekap mesin presensi, buku tamu layanan, dan ceklis kantor',
    photoUrl: '',
  },
  {
    id: 'act_tendik_2',
    startHour: '08',
    startMinute: '00',
    endHour: '10',
    endMinute: '00',
    activity: 'Melaksanakan pengelolaan persuratan sekolah (pencatatan agenda surat dinas masuk/keluar, penyiapan lembar disposisi Kepala Sekolah, dan pengarsipan berkas dinas).',
    indicator: 'Tercatat dan terdistribusikannya seluruh surat dinas masuk/keluar secara tertib dan terarsip aman.',
    notes: 'Buku agenda surat dinas, berkas disposisi, dan arsip dokumen',
    photoUrl: '',
  },
  {
    id: 'act_tendik_3',
    startHour: '10',
    startMinute: '00',
    endHour: '12',
    endMinute: '00',
    activity: 'Melakukan verifikasi dan pemutakhiran data peserta didik, PTK, rombongan belajar, dan sarana prasarana pada aplikasi Dapodikdasmen serta sinkronisasi server Pusdatin Kemendikbudristek.',
    indicator: 'Tervalidasinya data pokok peserta didik dan PTK dengan status 0 invalid pada aplikasi Dapodik.',
    notes: 'SPTJM Dapodik / lembar validasi Dapodikdasmen termutakhir',
    photoUrl: '',
  },
  {
    id: 'act_tendik_4',
    startHour: '12',
    startMinute: '30',
    endHour: '13',
    endMinute: '30',
    activity: 'Melaksanakan inventarisasi Barang Milik Daerah (BMD/KIB/KIR), pencatatan mutasi aset sarpras sekolah, dan penataan buku induk inventaris sarana prasarana.',
    indicator: 'Terdatanya kondisi fisik sarpras ruang kelas/kantor dan tertempelnya kode barcode/label inventaris barang.',
    notes: 'Buku Induk Inventaris, Kartu Inventaris Ruangan (KIR), dan foto aset',
    photoUrl: '',
  },
  {
    id: 'act_tendik_5',
    startHour: '13',
    startMinute: '30',
    endHour: '14',
    endMinute: '30',
    activity: 'Menyusun kelengkapan berkas administrasi pertanggungjawaban belanja BOSP (Surat Pertanggungjawaban/SPJ), rekonsiliasi Buku Kas Umum (BKU), dan verifikasi kuitansi belanja operasional.',
    indicator: 'Tersusunnya dokumen SPJ BOSP yang akuntabel, tertib bukti pembayaran transaksi, dan sesuai juknis BOS.',
    notes: 'Draf BKU, kuitansi sah bermaterai, dan faktur pajak belanja',
    photoUrl: '',
  },
  {
    id: 'act_tendik_6',
    startHour: '14',
    startMinute: '30',
    endHour: '15',
    endMinute: '30',
    activity: 'Melaksanakan layanan administrasi kesiswaan (legalisir ijazah, surat keterangan siswa aktif/pindah sekolah), pengarsipan buku induk kesiswaan, dan pelaporan harian layanan tata usaha.',
    indicator: 'Tuntasnya pelayanan administrasi siswa/wali murid secara prima dan amannya penyimpanan dokumen rahasia sekolah.',
    notes: 'Buku ekspedisi layanan kesiswaan, buku induk siswa, dan laporan TU',
    photoUrl: '',
  },
];

// Default harian (kini berisi 6 kegiatan lengkap dengan indikator masing-masing)
export const INITIAL_ACTIVITIES: ActivityItem[] = SIX_ACTIVITIES_GURU;

// Paket 6 Kegiatan Lengkap 1 Hari Kerja
export const FULL_DAY_PACKAGES: FullDayTemplatePackage[] = [
  {
    id: 'pkg_guru_6',
    title: 'Paket Standar 6 Kegiatan Harian Guru',
    role: 'Guru',
    shift: 'Guru : Shift Pagi (06.30 - 15.00)',
    description: 'Format ideal 6 kegiatan kerja harian guru (KBM, Diferensiasi, Asesmen, Administrasi Ajar & Kombel) lengkap dengan indikator kinerja.',
    activities: SIX_ACTIVITIES_GURU,
  },
  {
    id: 'pkg_tendik_6',
    title: 'Paket Standar 6 Kegiatan Harian Tendik / TU',
    role: 'Tendik',
    shift: 'Tenaga Kependidikan / TU (07.00 - 15.30)',
    description: 'Format ideal 6 kegiatan kerja harian Tenaga Kependidikan / Tata Usaha (Presensi, Persuratan, Dapodik, Sarpras, SPJ & Kesiswaan) lengkap dengan indikator kinerja.',
    activities: SIX_ACTIVITIES_TENDIK,
  },
];

// Pustaka Kategori Template Kegiatan Guru & Tendik (Lengkap dengan Indikator Kinerja & Bukti Dukung)
export const QUICK_ACTIVITY_TEMPLATES: ActivityTemplateCategory[] = [
  // --- 6 KATEGORI GURU ---
  {
    category: 'Guru 1: Pembiasaan & Karakter Pagi',
    role: 'Guru',
    items: [
      {
        text: 'Menyambut kehadiran peserta didik di gerbang sekolah dengan pembiasaan 5S (Senyum, Salam, Sapa, Sopan, Santun), pengondisian apel pagi, menyanyikan lagu Indonesia Raya, dan doa bersama.',
        indicator: 'Terlaksananya pembiasaan budaya positif karakter 5S dan 100% siswa terkondisikan tertib di kelas/lapangan.',
        notes: 'Buku piket, presensi kehadiran pagi, dan foto dokumentasi apel',
        timeRange: '06.30 - 07.15',
        role: 'Guru',
      },
      {
        text: 'Memimpin kegiatan literasi pagi, tadarus Al-Quran / pembacaan Asmaul Husna / doa bersama dan pembacaan ikrar pelajar di ruang kelas.',
        indicator: 'Keterlibatan aktif 100% siswa dalam kegiatan penguatan spiritualitas dan literasi pagi.',
        notes: 'Jurnal pembiasaan kelas dan buku catatan literasi pagi siswa',
        timeRange: '06.45 - 07.15',
        role: 'Guru',
      },
      {
        text: 'Melaksanakan pengawasan kedisiplinan pakaian seragam, kebersihan kuku, dan pembiasaan kerapian peserta didik sebelum masuk jam pelajaran pertama.',
        indicator: 'Tertibnya standar kedisiplinan dan kerapian peserta didik 100%.',
        notes: 'Buku catatan kedisiplinan siswa dan dokumentasi pemeriksaan',
        timeRange: '06.45 - 07.15',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 2: Kegiatan Belajar Mengajar (KBM)',
    role: 'Guru',
    items: [
      {
        text: 'Melaksanakan Kegiatan Belajar Mengajar (KBM) tatap muka interaktif berbasis Kurikulum Merdeka (apersepsi kontekstual, pemaparan materi, diskusi kelompok terarah, dan presentasi hasil karya).',
        indicator: 'Ketercapaian Tujuan Pembelajaran (TP) sesi pagi dan terciptanya suasana kelas yang kondusif, aktif, dan menyenangkan.',
        notes: 'Modul Ajar, lembar LKPD, dan lembar observasi aktivitas belajar',
        timeRange: '07.15 - 09.30',
        role: 'Guru',
      },
      {
        text: 'Melaksanakan pembelajaran praktik sains / seni budaya / PJOK kontekstual dengan pemanfaatan media konkret dan alat peraga edukatif.',
        indicator: 'Tuntasnya keterampilan unjuk kerja praktik siswa sesuai rubrik capaian kompetensi.',
        notes: 'Rubrik penilaian unjuk kerja dan dokumentasi kegiatan praktik siswa',
        timeRange: '07.15 - 09.30',
        role: 'Guru',
      },
      {
        text: 'Melaksanakan pembelajaran berbasis proyek kokurikuler P5 (Projek Penguatan Profil Pelajar Pancasila) dengan tema Kearifan Lokal / Gaya Hidup Berkelanjutan.',
        indicator: 'Terbentuknya karakter gotong royong, nalar kritis, dan kreativitas siswa dalam pengerjaan proyek.',
        notes: 'Rubrik dimensi profil P5 dan portofolio progres proyek siswa',
        timeRange: '07.15 - 09.30',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 3: Diferensiasi & Bimbingan Literasi',
    role: 'Guru',
    items: [
      {
        text: 'Melaksanakan pendampingan bimbingan literasi dan numerasi terbimbing di pojok baca/kelas, serta bimbingan remedial bagi siswa yang belum tuntas materi.',
        indicator: 'Tuntasnya bimbingan intensif literasi-numerasi dan peningkatan pemahaman bagi 5-8 siswa remedial.',
        notes: 'Daftar hadir remedi, portofolio lembar kerja, dan buku bimbingan',
        timeRange: '09.45 - 11.15',
        role: 'Guru',
      },
      {
        text: 'Memberikan program pengayaan materi lanjutan dan tugas tantangan eksploratif bagi siswa dengan capaian belajar tinggi.',
        indicator: 'Meningkatnya daya nalar kritis siswa berkemampuan tinggi melalui materi pengayaan tingkat lanjut.',
        notes: 'Lembar tugas pengayaan dan hasil karya analisis siswa',
        timeRange: '09.45 - 11.15',
        role: 'Guru',
      },
      {
        text: 'Melaksanakan bimbingan konseling individual dan pembinaan karakter bagi peserta didik yang memerlukan perhatian khusus.',
        indicator: 'Terpetakannya solusi hambatan belajar dan perilaku siswa dengan tindak lanjut yang terukur.',
        notes: 'Buku catatan kasus / jurnal bimbingan konseling guru kelas',
        timeRange: '09.45 - 11.15',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 4: Asesmen & Koreksi Tugas',
    role: 'Guru',
    items: [
      {
        text: 'Melaksanakan asesmen formatif harian, memeriksa dan mengoreksi lembar latihan serta tugas mandiri peserta didik, dan memberikan catatan umpan balik (feedback).',
        indicator: 'Terkoreksinya 100% lembar asesmen latihan siswa dan terinputnya data nilai capaian ke buku nilai harian.',
        notes: 'Buku Daftar Nilai Harian (Leger Nilai) dan sampel lembar tugas bertanda tangan',
        timeRange: '11.15 - 12.30',
        role: 'Guru',
      },
      {
        text: 'Melaksanakan asesmen sumatif lingkup materi (ulangan harian) dan analisis butir soal evaluasi pembelajaran.',
        indicator: 'Tersedianya rekapitulasi data ketuntasan hasil belajar dan analisis daya serap materi siswa.',
        notes: 'Format analisis butir soal dan rekapitulasi nilai ulangan',
        timeRange: '11.15 - 12.30',
        role: 'Guru',
      },
      {
        text: 'Memeriksa dan memvalidasi kelengkapan portofolio hasil karya siswa serta catatan perkembangan psikomotorik siswa.',
        indicator: 'Terdokumentasikannya rekam jejak portofolio perkembangan karya belajar siswa secara sistematis.',
        notes: 'Buku map portofolio siswa dan rubrik penilaian perkembangan',
        timeRange: '11.15 - 12.30',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 5: Perangkat Ajar & Modul',
    role: 'Guru',
    items: [
      {
        text: 'Menyusun dan menyempurnakan administrasi perangkat pembelajaran, modul ajar terdiferensiasi, instrumen asesmen, serta menyiapkan media ajar untuk pertemuan berikutnya.',
        indicator: 'Tersedianya 1 set Modul Ajar terverifikasi dan media pembelajaran siap pakai untuk esok hari.',
        notes: 'Draf Modul Ajar Kurikulum Merdeka dan instrumen asesmen lengkap',
        timeRange: '13.00 - 14.00',
        role: 'Guru',
      },
      {
        text: 'Mengembangkan media pembelajaran interaktif berbasis digital (Canva / Google Slides / Quizizz) dan lembar LKPD kontekstual.',
        indicator: 'Tersedianya media ajar digital interaktif yang siap ditayangkan dalam pembelajaran.',
        notes: 'Tautan bahan tayang presentasi / QR Code lembar kerja interaktif',
        timeRange: '13.00 - 14.00',
        role: 'Guru',
      },
      {
        text: 'Mengisi administrasi presensi bulanan siswa, buku mutasi kelas, dan rekapitulasi capaian ketidakhadiran siswa.',
        indicator: 'Tersinkronisasinya data presensi kehadiran siswa kelas 100% akurat.',
        notes: 'Buku presensi kelas dan rekapitulasi absensi harian',
        timeRange: '13.00 - 14.00',
        role: 'Guru',
      },
    ],
  },
  {
    category: 'Guru 6: Kombel, PKB & Refleksi',
    role: 'Guru',
    items: [
      {
        text: 'Mengikuti kegiatan Komunitas Belajar (Kombel) intra-sekolah / KKG, refleksi evaluasi pembelajaran harian bersama rekan sejawat, dan koordinasi peningkatan mutu pembelajaran.',
        indicator: 'Terdokumentasikannya catatan refleksi pembelajaran harian dan kesepakatan tindak lanjut mutu.',
        notes: 'Notula kegiatan Kombel, catatan refleksi guru, dan lembar penghubung wali murid',
        timeRange: '14.00 - 15.00',
        role: 'Guru',
      },
      {
        text: 'Mengikuti pelatihan mandiri pada Platform Merdeka Mengajar (PMM) / webinar peningkatan kompetensi pedagogik guru.',
        indicator: 'Terselesaikannya 1 modul topik PMM dan bukti aksi nyata / sertifikat pelatihan.',
        notes: 'Tangkapan layar modul PMM / sertifikat partisipasi webinar',
        timeRange: '14.00 - 15.00',
        role: 'Guru',
      },
      {
        text: 'Melakukan komunikasi dan koordinasi perkembangan belajar serta karakter peserta didik dengan wali murid melalui buku penghubung / paguyuban kelas.',
        indicator: 'Terjalinnya sinergi kemitraan positif antara guru kelas dengan orang tua murid.',
        notes: 'Catatan buku penghubung dan notula konsultasi wali murid',
        timeRange: '14.00 - 15.00',
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
        text: 'Melaksanakan pengelolaan presensi harian pendidik & tenaga kependidikan (fingerprint & manual), membuka loket layanan administrasi sekolah, dan memeriksa kesiapan operasional kantor.',
        indicator: 'Rekapitulasi presensi harian guru & staf tercatat 100% tepat waktu serta ruang loket tata usaha siap beroperasi.',
        notes: 'Rekap mesin presensi, buku tamu layanan, dan ceklis kantor',
        timeRange: '07.00 - 08.00',
        role: 'Tendik',
      },
      {
        text: 'Melaksanakan pengecekan kebersihan lingkungan sekolah, koordinasi dengan petugas kebersihan, serta kesiapan fasilitas air dan listrik.',
        indicator: 'Terjaminnya kebersihan dan kenyamanan seluruh ruang kelas, toilet, dan kantor sebelum aktivitas dimulai.',
        notes: 'Lembar ceklis kebersihan harian dan foto pemantauan lingkungan',
        timeRange: '07.00 - 08.00',
        role: 'Tendik',
      },
      {
        text: 'Membuka loket layanan informasi sekolah, menerima tamu dinas, dan mencatat permohonan layanan umum di buku tamu sekolah.',
        indicator: 'Terlayaninya seluruh tamu dan kepentingan wali murid dengan ramah dan tercatat pada buku tamu.',
        notes: 'Buku register tamu dinas dan formulir permohonan layanan',
        timeRange: '07.00 - 08.00',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 2: Persuratan & Disposisi Dinas',
    role: 'Tendik',
    items: [
      {
        text: 'Melaksanakan pengelolaan persuratan sekolah (pencatatan agenda surat dinas masuk/keluar, penyiapan lembar disposisi Kepala Sekolah, dan pengarsipan berkas dinas).',
        indicator: 'Tercatat dan terdistribusikannya seluruh surat dinas masuk/keluar secara tertib dan terarsip aman.',
        notes: 'Buku agenda surat dinas, berkas disposisi, dan arsip dokumen',
        timeRange: '08.00 - 10.00',
        role: 'Tendik',
      },
      {
        text: 'Membuat konsep draf surat dinas keluar (Surat Tugas, Surat Undangan Rapat, Surat Pengantar Dinas) dan mengajukan persetujuan Kepala Sekolah.',
        indicator: 'Diterbitkannya surat dinas resmi dengan nomor registrasi yang valid dan sesuai tata naskah dinas.',
        notes: 'Draf surat bertanda tangan basah / barcode dan lembar tembusan',
        timeRange: '08.00 - 10.00',
        role: 'Tendik',
      },
      {
        text: 'Melaksanakan digitalisasi arsip persuratan dan dokumen penting sekolah ke dalam sistem penyimpanan awan (Google Drive arsip sekolah).',
        indicator: 'Tersimpannya salinan digital surat masuk/keluar dalam folder terindeks yang mudah diakses.',
        notes: 'Tautan folder arsip digital dan daftar indeks arsip',
        timeRange: '08.00 - 10.00',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 3: Dapodik & Pelaporan Pusdatin',
    role: 'Tendik',
    items: [
      {
        text: 'Melakukan verifikasi dan pemutakhiran data peserta didik, PTK, rombongan belajar, dan sarana prasarana pada aplikasi Dapodikdasmen serta sinkronisasi server Pusdatin Kemendikbudristek.',
        indicator: 'Tervalidasinya data pokok peserta didik dan PTK dengan status 0 invalid pada aplikasi Dapodik.',
        notes: 'SPTJM Dapodik / lembar validasi Dapodikdasmen termutakhir',
        timeRange: '10.00 - 12.00',
        role: 'Tendik',
      },
      {
        text: 'Melakukan pemrosesan Nomor Induk Siswa Nasional (NISN) baru bagi peserta didik baru dan mutasi keluar/masuk pada portal VervalPD.',
        indicator: 'Terbitnya NISN valid dan terselesaikannya persetujuan mutasi siswa pada sistem VervalPD.',
        notes: 'Tangkapan layar bukti persetujuan mutasi VervalPD / daftar NISN',
        timeRange: '10.00 - 12.00',
        role: 'Tendik',
      },
      {
        text: 'Melakukan verifikasi data sertifikasi pendidik, riwayat kenaikan gaji berkala (KGB), dan pemutakhiran riwayat kepangkatan PTK pada InfoGTK.',
        indicator: 'Tervalidasinya status InfoGTK guru penerima tunjangan profesi dan akuratnya data riwayat kepegawaian.',
        notes: 'Lembar cetak InfoGTK status valid dan salinan SK KGB',
        timeRange: '10.00 - 12.00',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 4: Sarpras & Inventaris (KIR/KIB)',
    role: 'Tendik',
    items: [
      {
        text: 'Melaksanakan inventarisasi Barang Milik Daerah (BMD/KIB/KIR), pencatatan mutasi aset sarpras sekolah, dan penataan buku induk inventaris sarana prasarana.',
        indicator: 'Terdatanya kondisi fisik sarpras ruang kelas/kantor dan tertempelnya kode barcode/label inventaris barang.',
        notes: 'Buku Induk Inventaris, Kartu Inventaris Ruangan (KIR), dan foto aset',
        timeRange: '12.30 - 13.30',
        role: 'Tendik',
      },
      {
        text: 'Melakukan pengecekan fisik berkala kelayakan fasilitas sarana prasarana sekolah (meja kursi, proyektor, kelistrikan, MCK) dan merekap usulan perbaikan.',
        indicator: 'Tersedianya rekapitulasi data kondisi sarpras (baik, rusak ringan, rusak berat) sebagai dasar RKAS.',
        notes: 'Format ceklis kondisi fisik sarpras dan dokumentasi visual',
        timeRange: '12.30 - 13.30',
        role: 'Tendik',
      },
      {
        text: 'Melaksanakan pencatatan penerimaan buku teks kurikulum merdeka dan barang habis pakai (ATK) ke dalam kartu stok persediaan barang.',
        indicator: 'Tertibnya pembukuan keluar masuk barang habis pakai dan terjaganya ketersediaan ATK sekolah.',
        notes: 'Buku kartu stok persediaan barang dan berita acara serah terima',
        timeRange: '12.30 - 13.30',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 5: Administrasi Keuangan & SPJ BOSP',
    role: 'Tendik',
    items: [
      {
        text: 'Menyusun kelengkapan berkas administrasi pertanggungjawaban belanja BOSP (Surat Pertanggungjawaban/SPJ), rekonsiliasi Buku Kas Umum (BKU), dan verifikasi kuitansi belanja operasional.',
        indicator: 'Tersusunnya dokumen SPJ BOSP yang akuntabel, tertib bukti pembayaran transaksi, dan sesuai juknis BOS.',
        notes: 'Draf BKU, kuitansi sah bermaterai, dan faktur pajak belanja',
        timeRange: '13.30 - 14.30',
        role: 'Tendik',
      },
      {
        text: 'Melakukan input dan pelaporan realisasi belanja modal dan operasional pada aplikasi SIPLAH dan ARKAS (Aplikasi Rencana Kegiatan dan Anggaran Sekolah).',
        indicator: 'Tersinkronisasinya transaksi pembelanjaan ARKAS dengan rekening koran sekolah secara berimbang.',
        notes: 'Bukti cetak transaksi BKU ARKAS dan nota dinas belanja',
        timeRange: '13.30 - 14.30',
        role: 'Tendik',
      },
      {
        text: 'Menyiapkan berkas pemotongan dan penyetoran pajak belanja dinas (PPh 21, PPh 22, PPh 23, dan PPN) melalui billing DJP Online.',
        indicator: 'Tuntasnya penyetoran pajak daerah/negara dan terarsipnya Bukti Penerimaan Negara (BPN).',
        notes: 'Kode billing dan lembar Bukti Penerimaan Negara (BPN)',
        timeRange: '13.30 - 14.30',
        role: 'Tendik',
      },
    ],
  },
  {
    category: 'Tendik 6: Layanan Kesiswaan & Buku Induk',
    role: 'Tendik',
    items: [
      {
        text: 'Melaksanakan layanan administrasi kesiswaan (legalisir ijazah, surat keterangan siswa aktif/pindah sekolah), pengarsipan buku induk kesiswaan, dan pelaporan harian layanan tata usaha.',
        indicator: 'Tuntasnya pelayanan administrasi siswa/wali murid secara prima dan amannya penyimpanan dokumen rahasia sekolah.',
        notes: 'Buku ekspedisi layanan kesiswaan, buku induk siswa, dan laporan TU',
        timeRange: '14.30 - 15.30',
        role: 'Tendik',
      },
      {
        text: 'Melakukan penulisan dan pemutakhiran data riwayat akademik dan non-akademik siswa pada Buku Induk Register Peserta Didik.',
        indicator: 'Terdatanya profil lengkap peserta didik secara permanen pada dokumen arsip negara (buku induk).',
        notes: 'Lembar Buku Induk Siswa bernomor stambuk resmi',
        timeRange: '14.30 - 15.30',
        role: 'Tendik',
      },
      {
        text: 'Melaksanakan verifikasi berkas usulan Program Indonesia Pintar (PIP) dan koordinasi aktivasi buku tabungan SimPel siswa penerima bantuan.',
        indicator: 'Tervalidasinya data usulan nominasi PIP dan terfasilitasinya penyaluran hak bantuan siswa.',
        notes: 'Daftar SK Nominasi PIP dan tanda terima penyerahan surat pengantar',
        timeRange: '14.30 - 15.30',
        role: 'Tendik',
      },
    ],
  },
];

