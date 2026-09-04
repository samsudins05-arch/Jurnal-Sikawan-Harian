import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon,
  ChevronRight,
  Users,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Info,
  CalendarCheck,
  ExternalLink,
  ChevronLeft,
  Filter,
  UserCheck,
  UserX,
  Lock,
  CalendarDays
} from 'lucide-react';
import { JournalDay, UserProfile, SchoolSettings } from '../types/journal';
import { indonesianMonths, parseDateStrToIndonesian } from '../utils/dateFormat';
import { DEFAULT_STAFF_LIST } from '../data/initialData';

interface MonthlyRecapProps {
  journals: JournalDay[];
  staffList?: Partial<UserProfile>[];
  onSelectDateToEdit: (dateStr: string, teacher?: Partial<UserProfile>) => void;
  onOpenMasterData?: () => void;
  onDeleteJournal: (journalId: string, dateStr: string) => void;
  profile: UserProfile;
  schoolSettings: SchoolSettings;
}

type RecapViewMode = 'matrix' | 'daily_monitor' | 'journal_list';

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  journals,
  staffList,
  onSelectDateToEdit,
  onOpenMasterData,
  onDeleteJournal,
  profile,
  schoolSettings,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [viewMode, setViewMode] = useState<RecapViewMode>('matrix');

  // Specific day selection for "daily_monitor" mode (defaults to current day if in current month)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    const today = new Date();
    if (today.getFullYear() === selectedYear && today.getMonth() === selectedMonth) {
      return today.getDate();
    }
    return 1;
  });

  // 1. Resolve Effective Master Data Staff List
  const effectiveStaffList: Partial<UserProfile>[] = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return staffList;
    }
    const saved = localStorage.getItem('sijunawan_staff_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // If active profile has name, use it; otherwise fallback to default staff list
    if (profile.name && profile.name.trim() !== '') {
      return [
        {
          name: profile.name,
          nip: profile.nip,
          position: profile.position,
          unitWork: profile.unitWork,
          rankGrade: profile.rankGrade,
          employeeStatus: profile.employeeStatus,
          schoolHeadName: profile.schoolHeadName,
          schoolHeadNip: profile.schoolHeadNip,
          cityLocation: profile.cityLocation,
        },
        ...DEFAULT_STAFF_LIST.filter(
          (s) => (s.name || '').trim().toLowerCase() !== (profile.name || '').trim().toLowerCase()
        ),
      ];
    }
    return DEFAULT_STAFF_LIST;
  }, [staffList, profile]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Helper to format YYYY-MM-DD
  const formatDayDateStr = (day: number) => {
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${selectedYear}-${mm}-${dd}`;
  };

  // Check if a day is Saturday (6) or Sunday (0)
  const isDayWeekend = (day: number) => {
    const dt = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = dt.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Minggu, 6 = Sabtu
  };

  // Day of week in Indonesian
  const getDayNameShort = (day: number) => {
    const dt = new Date(selectedYear, selectedMonth, day);
    const dayIndex = dt.getDay(); // 0 = Min, 1 = Sen, 2 = Sel, 3 = Rab, 4 = Kam, 5 = Jum, 6 = Sab
    const names = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return names[dayIndex];
  };

  // Helper: check if a specific teacher filled the journal on dateStr and saved as PDF
  const getTeacherJournalStatus = (
    teacher: Partial<UserProfile>,
    dateStr: string
  ): {
    isFilled: boolean;
    journal: JournalDay | null;
    activitiesCount: number;
    hasActivities: boolean;
    isPdfSaved: boolean;
  } => {
    const tName = (teacher.name || '').trim().toLowerCase();
    const tNip = (teacher.nip || '').trim().replace(/[^0-9]/g, '');

    const match = journals.find((j) => {
      if (j.dateStr !== dateStr) return false;

      const jNip = (j.teacherNip || j.profileSnapshot?.nip || '').trim().replace(/[^0-9]/g, '');
      if (tNip && jNip && tNip === jNip) return true;

      const jName = (j.teacherName || j.profileSnapshot?.name || '').trim().toLowerCase();
      if (tName && jName) {
        if (tName === jName || jName.includes(tName) || tName.includes(jName)) return true;
      }

      // If journal lacks teacher metadata, check against current profile if this teacher matches current profile
      if (!jName && !jNip) {
        const curName = (profile.name || '').trim().toLowerCase();
        const curNip = (profile.nip || '').trim().replace(/[^0-9]/g, '');
        if ((tNip && curNip && tNip === curNip) || (tName && curName && tName === curName)) {
          return true;
        }
      }

      return false;
    });

    if (!match) {
      return {
        isFilled: false,
        journal: null,
        activitiesCount: 0,
        hasActivities: false,
        isPdfSaved: false,
      };
    }

    const validActs = (match.activities || []).filter(
      (a) => a.activity && a.activity.trim() !== '' && a.activity.trim() !== '-'
    );

    const hasActivities = validActs.length > 0;
    const isPdfSaved = Boolean(match.isPdfSaved);

    // KOTAK PADA MATRIKS HANYA BERWARNA HIJAU KETIKA:
    // 1. Guru telah mengisi Jurnal Harian (hasActivities = true)
    // 2. DAN Guru mengklik Tombol Simpan PDF (isPdfSaved = true)
    // Ketika guru belum mengisi Jurnal dan Simpan PDF, kotak tidak berubah warna (tetap merah muda)
    const isCompletedAndPdfSaved = hasActivities && isPdfSaved;

    return {
      isFilled: isCompletedAndPdfSaved,
      journal: match,
      activitiesCount: validActs.length,
      hasActivities,
      isPdfSaved,
    };
  };

  // 2. Computed Statistics for the Month (Weekdays vs Weekends)
  const matrixStats = useMemo(() => {
    const workingDaysCount = daysArray.filter((d) => !isDayWeekend(d)).length;
    const weekendDaysCount = daysArray.filter((d) => isDayWeekend(d)).length;
    let totalWorkingFilledCount = 0;

    const teacherStats = effectiveStaffList.map((teacher) => {
      let filledWorkingDays = 0;
      let unfilledWorkingDays = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        if (isDayWeekend(d)) {
          // Sabtu & Minggu adalah hari libur (tidak ada kegiatan jurnal)
          continue;
        }
        const dateStr = formatDayDateStr(d);
        const status = getTeacherJournalStatus(teacher, dateStr);
        if (status.isFilled) {
          filledWorkingDays++;
        } else {
          unfilledWorkingDays++;
        }
      }

      totalWorkingFilledCount += filledWorkingDays;
      const percentage = workingDaysCount > 0 ? Math.round((filledWorkingDays / workingDaysCount) * 100) : 0;

      return {
        teacher,
        filledWorkingDays,
        unfilledWorkingDays,
        percentage,
      };
    });

    const averageCompliance =
      effectiveStaffList.length > 0
        ? Math.round(
            (teacherStats.reduce((acc, curr) => acc + curr.percentage, 0) / effectiveStaffList.length)
          )
        : 0;

    // Selected day status
    const activeDayDateStr = formatDayDateStr(selectedDayNumber);
    const isSelectedDayWeekend = isDayWeekend(selectedDayNumber);

    let dayFilledTeachers = 0;
    let dayUnfilledTeachers = 0;

    if (!isSelectedDayWeekend) {
      effectiveStaffList.forEach((t) => {
        const st = getTeacherJournalStatus(t, activeDayDateStr);
        if (st.isFilled) dayFilledTeachers++;
        else dayUnfilledTeachers++;
      });
    }

    return {
      teacherStats,
      workingDaysCount,
      weekendDaysCount,
      totalTeachers: effectiveStaffList.length,
      totalWorkingFilledCount,
      averageCompliance,
      dayFilledTeachers,
      dayUnfilledTeachers,
      activeDayDateStr,
      isSelectedDayWeekend,
    };
  }, [effectiveStaffList, daysInMonth, selectedYear, selectedMonth, journals, selectedDayNumber, daysArray]);

  // 3. Filtered journals for the standard list view
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      if (!j.dateStr) return false;
      const parts = j.dateStr.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === selectedYear && m === selectedMonth;
    }).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [journals, selectedYear, selectedMonth]);

  // 4. Export Matrix to CSV
  const handleExportMatrixCsv = () => {
    const headers = [
      'No',
      'Nama Guru / Pegawai',
      'NIP',
      'Jabatan',
      'Status Kepegawaian',
      ...daysArray.map((d) => `Tgl ${d} (${getDayNameShort(d)})`),
      'Hari Kerja Terisi (Hijau)',
      'Hari Kerja Belum (Merah Muda)',
      'Hari Libur Akhir Pekan (Merah)',
      'Kepatuhan Hari Kerja (%)',
    ];

    const rows: string[][] = [];

    effectiveStaffList.forEach((teacher, idx) => {
      let filledCount = 0;
      let unfilledCount = 0;

      const dayStatuses = daysArray.map((d) => {
        if (isDayWeekend(d)) {
          return 'LIBUR SABTU/MINGGU (MERAH)';
        }
        const dateStr = formatDayDateStr(d);
        const st = getTeacherJournalStatus(teacher, dateStr);
        if (st.isFilled) {
          filledCount++;
          return 'TERISI (HIJAU)';
        }
        unfilledCount++;
        return 'BELUM (MERAH MUDA)';
      });

      const percentage =
        matrixStats.workingDaysCount > 0
          ? Math.round((filledCount / matrixStats.workingDaysCount) * 100)
          : 0;

      rows.push([
        String(idx + 1),
        `"${(teacher.name || '').replace(/"/g, '""')}"`,
        `"${(teacher.nip || '-').replace(/"/g, '""')}"`,
        `"${(teacher.position || '-').replace(/"/g, '""')}"`,
        `"${(teacher.employeeStatus || '-').replace(/"/g, '""')}"`,
        ...dayStatuses.map((s) => `"${s}"`),
        String(filledCount),
        String(unfilledCount),
        String(matrixStats.weekendDaysCount),
        `${percentage}%`,
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `"REKAPITULASI PENGISIAN JURNAL HARIAN GURU"`,
        `"Bulan: ${indonesianMonths[selectedMonth]} ${selectedYear}"`,
        `"Hari Kerja Efektif: ${matrixStats.workingDaysCount} Hari | Hari Libur Akhir Pekan: ${matrixStats.weekendDaysCount} Hari"`,
        `"Sekolah: ${schoolSettings.subUnitName || 'SDN Babelan Kota 01'}"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Keterisian_Jurnal_Guru_${indonesianMonths[selectedMonth]}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Month & Year Selection Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Rekapitulasi Jurnal Bulanan
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Master Data Pegawai
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month & Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 px-2 py-1.5 focus:outline-none cursor-pointer"
            >
              {indonesianMonths.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 px-2 py-1.5 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export to CSV / Excel */}
          <button
            type="button"
            onClick={handleExportMatrixCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download Rekapitulasi Matriks ke File Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          {/* Print Monthly Report */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            title="Cetak Laporan Rekapitulasi"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Guru */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">Guru Terdaftar</div>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{matrixStats.totalTeachers}</span>
            <span className="text-xs font-normal text-slate-500">Orang</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Tabel Master Data Pegawai</span>
          </div>
        </div>

        {/* Hari Kerja Efektif */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">Hari Kerja Efektif</div>
            <CalendarDays className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 flex items-baseline gap-1">
            <span>{matrixStats.workingDaysCount}</span>
            <span className="text-xs font-normal text-slate-500">Hari</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {matrixStats.weekendDaysCount} Hari Libur (Sabtu &amp; Minggu)
          </div>
        </div>

        {/* Status Hari Terpilih */}
        {matrixStats.isSelectedDayWeekend ? (
          <div className="bg-red-50/70 border border-red-200 p-4 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-red-800">Tgl {selectedDayNumber}: Akhir Pekan</div>
              <div className="w-3.5 h-3.5 rounded-sm bg-red-600" />
            </div>
            <div className="text-base font-bold text-red-700 mt-1 leading-tight">
              LIBUR AKHIR PEKAN
            </div>
            <div className="text-[11px] text-red-600 mt-1">
              Tidak ada kegiatan jurnal harian
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-emerald-800">Tgl {selectedDayNumber}: Sudah Isi</div>
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-baseline gap-1">
              <span>{matrixStats.dayFilledTeachers}</span>
              <span className="text-xs font-medium text-emerald-600">/{matrixStats.totalTeachers} Guru</span>
            </div>
            <div className="text-[11px] text-pink-600 mt-1 font-medium">
              {matrixStats.dayUnfilledTeachers} Guru Belum Mengisi
            </div>
          </div>
        )}

        {/* Kepatuhan Rata-Rata */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">Rata-rata Kepatuhan</div>
            <CalendarCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-baseline gap-1">
            <span>{matrixStats.averageCompliance}%</span>
            <span className="text-xs font-normal text-slate-500">Hari Kerja</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, matrixStats.averageCompliance))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Status Legend & Master Data shortcut */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Keterangan Kotak:</span>
          </span>

          {/* Green box indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
              ✓
            </div>
            <span className="font-semibold text-emerald-900">
              Sudah Mengisi
            </span>
          </div>

          {/* Pink box indicator */}
          <div className="flex items-center gap-2 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
            <div className="w-5 h-5 rounded-md bg-pink-100 text-pink-700 font-bold text-[10px] flex items-center justify-center border border-pink-300">
              -
            </div>
            <span className="font-semibold text-pink-900">
              Belum Mengisi
            </span>
          </div>

          {/* Red box indicator for Weekend */}
          <div className="flex items-center gap-2 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            <div className="w-5 h-5 rounded-md bg-red-600 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
              L
            </div>
            <span className="font-bold text-red-900">
              Libur-Sabtu &amp; Minggu
            </span>
          </div>
        </div>

        {onOpenMasterData && (
          <button
            type="button"
            onClick={onOpenMasterData}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer self-start md:self-auto shrink-0"
          >
            <span>Tabel Master Data Pegawai</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Lock Notice Info Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        <div>
          <strong className="text-slate-800">Matriks Terkunci (Hanya Baca):</strong> Kotak tanggal pada matriks hanya dapat berubah menjadi <strong>Hijau</strong> ketika Guru telah mengisi kegiatan pada <strong>Jurnal Harian</strong> dan mengklik tombol <strong>Simpan PDF</strong>. Ketika guru belum mengisi Jurnal dan Simpan PDF, warna kotak tidak berubah (tetap merah muda).
        </div>
      </div>

      {/* View Mode Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Matriks Bulanan</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('daily_monitor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'daily_monitor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tinjauan Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('journal_list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'journal_list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daftar Terisi ({filteredJournals.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Matriks hanya baca berdasarkan data tersimpan</span>
        </span>
      </div>

      {/* TAB 1: KALENDER MATRIKS BULANAN (KOTAK HIJAU, MERAH MUDA, & MERAH UNTUK SABTU/MINGGU) */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <span>Matriks Keterisian Jurnal Guru</span>
                <span className="text-xs font-normal text-slate-500">
                  ({indonesianMonths[selectedMonth]} {selectedYear})
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Total Guru: <strong>{effectiveStaffList.length}</strong></span>
              <span>•</span>
              <span>Hari Kerja: <strong>{matrixStats.workingDaysCount}</strong></span>
              <span>•</span>
              <span className="text-red-600 font-semibold">Libur Sabtu &amp; Minggu: {matrixStats.weekendDaysCount}</span>
            </div>
          </div>

          {/* Matrix Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="py-3 px-2 w-10 text-center sticky left-0 bg-slate-100 z-10 border-r border-slate-200 shadow-xs">
                    No
                  </th>
                  <th className="py-3 px-3 min-w-[190px] sticky left-10 bg-slate-100 z-10 border-r border-slate-200 shadow-xs">
                    Nama Guru / Pegawai
                  </th>
                  <th className="py-3 px-2 min-w-[85px] text-slate-600 border-r border-slate-200">
                    Status
                  </th>

                  {/* Day Columns 1 to N */}
                  {daysArray.map((day) => {
                    const isWeekend = isDayWeekend(day);
                    const dayName = getDayNameShort(day);

                    return (
                      <th
                        key={day}
                        className={`py-2 px-1 text-center min-w-[34px] border-r font-mono ${
                          isWeekend
                            ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                            : 'text-slate-700 border-slate-200'
                        }`}
                        title={
                          isWeekend
                            ? `Hari ${dayName}: Libur Akhir Pekan (Tidak Ada Kegiatan Jurnal)`
                            : `Hari ${dayName}, Tgl ${day} ${indonesianMonths[selectedMonth]}`
                        }
                      >
                        <div
                          className={`text-[9px] uppercase tracking-tighter ${
                            isWeekend ? 'text-red-600 font-extrabold' : 'opacity-70'
                          }`}
                        >
                          {dayName}
                        </div>
                        <div
                          className={`text-xs font-bold leading-tight ${
                            isWeekend ? 'text-red-700 font-black' : ''
                          }`}
                        >
                          {day}
                        </div>
                      </th>
                    );
                  })}

                  {/* Summary Columns */}
                  <th className="py-3 px-2 min-w-[75px] text-center bg-emerald-50 text-emerald-900 border-r border-slate-200">
                    Terisi (✓)
                  </th>
                  <th className="py-3 px-2 min-w-[75px] text-center bg-pink-50 text-pink-900 border-r border-slate-200">
                    Belum (-)
                  </th>
                  <th className="py-3 px-2 min-w-[75px] text-center bg-red-50 text-red-900 border-r border-slate-200">
                    Libur (L)
                  </th>
                  <th className="py-3 px-2 min-w-[70px] text-center">
                    % Kepatuhan
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {effectiveStaffList.map((teacher, idx) => {
                  let teacherFilledWorkingDays = 0;
                  let teacherUnfilledWorkingDays = 0;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Column 1: No (Sticky) */}
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                        {idx + 1}
                      </td>

                      {/* Column 2: Nama Guru & NIP (Sticky) */}
                      <td className="py-2.5 px-3 sticky left-10 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                        <div className="font-bold text-slate-800 text-xs truncate max-w-[180px]">
                          {teacher.name || 'Guru Tanpa Nama'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NIP. {teacher.nip || '-'}
                        </div>
                      </td>

                      {/* Column 3: Status Kepegawaian */}
                      <td className="py-2.5 px-2 border-r border-slate-200 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                          {teacher.employeeStatus || 'PNS'}
                        </span>
                      </td>

                      {/* Day Cells (Kotak Hijau, Kotak Merah Muda, & Kotak Merah untuk Sabtu/Minggu) */}
                      {daysArray.map((day) => {
                        const isWeekend = isDayWeekend(day);
                        const dayName = getDayNameShort(day);

                        if (isWeekend) {
                          // HARI SABTU & MINGGU: KOTAK MERAH (LIBUR, TIDAK ADA KEGIATAN JURNAL)
                          return (
                            <td
                              key={day}
                              className="py-1.5 px-0.5 text-center border-r border-slate-200/60 bg-red-50/20"
                            >
                              <div
                                className="w-7 h-7 mx-auto rounded-lg bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs border border-red-700 select-none cursor-default"
                                title={`LIBUR: Hari ${dayName} (Tgl ${day} ${indonesianMonths[selectedMonth]} - Libur Akhir Pekan, tidak ada kegiatan jurnal harian)`}
                              >
                                <span>{day}</span>
                              </div>
                            </td>
                          );
                        }

                        // HARI KERJA (SENIN - JUMAT): KOTAK HIJAU JIKA SUDAH DIISI, KOTAK MERAH MUDA JIKA BELUM
                        const dateStr = formatDayDateStr(day);
                        const status = getTeacherJournalStatus(teacher, dateStr);

                        if (status.isFilled) {
                          teacherFilledWorkingDays++;
                          return (
                            <td
                              key={day}
                              className="py-1.5 px-0.5 text-center border-r border-slate-200/60 bg-emerald-50/15"
                            >
                              {/* KOTAK HIJAU: SUDAH MENGISI DAN SIMPAN PDF (DIKUNCI / NONAKTIF KLIK) */}
                              <div
                                className="w-7 h-7 mx-auto rounded-lg bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs border border-emerald-600 select-none cursor-default"
                                title={`SUDAH MENGISI & SIMPAN PDF: ${teacher.name} (Tgl ${day} ${indonesianMonths[selectedMonth]} - ${status.activitiesCount} kegiatan terisi, PDF tersimpan)`}
                              >
                                <span>{day}</span>
                              </div>
                            </td>
                          );
                        } else {
                          teacherUnfilledWorkingDays++;
                          const tooltipReason = status.hasActivities
                            ? `BELUM SIMPAN PDF: ${teacher.name} (Tgl ${day} ${indonesianMonths[selectedMonth]} - ${status.activitiesCount} kegiatan terisi, tetapi belum klik Simpan PDF)`
                            : `BELUM MENGISI: ${teacher.name} (Tgl ${day} ${indonesianMonths[selectedMonth]} - Belum mengisi jurnal harian)`;

                          return (
                            <td
                              key={day}
                              className="py-1.5 px-0.5 text-center border-r border-slate-200/60 bg-pink-50/15"
                            >
                              {/* KOTAK MERAH MUDA: BELUM MENGISI ATAU BELUM SIMPAN PDF (DIKUNCI / NONAKTIF KLIK) */}
                              <div
                                className="w-7 h-7 mx-auto rounded-lg bg-pink-100 text-pink-700 font-medium text-[11px] flex items-center justify-center border border-pink-300 shadow-2xs select-none cursor-default"
                                title={tooltipReason}
                              >
                                <span>{day}</span>
                              </div>
                            </td>
                          );
                        }
                      })}

                      {/* Summary: Total Terisi (Kotak Hijau) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 bg-emerald-50/40">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{teacherFilledWorkingDays}</span>
                        </span>
                      </td>

                      {/* Summary: Total Belum (Kotak Merah Muda) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 bg-pink-50/40">
                        <span className="inline-flex items-center gap-1 font-semibold text-pink-700 text-xs">
                          <span className="w-2 h-2 rounded-full bg-pink-400" />
                          <span>{teacherUnfilledWorkingDays}</span>
                        </span>
                      </td>

                      {/* Summary: Total Libur (Kotak Merah) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 bg-red-50/40">
                        <span className="inline-flex items-center gap-1 font-semibold text-red-700 text-xs">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          <span>{matrixStats.weekendDaysCount}</span>
                        </span>
                      </td>

                      {/* Percentage (Based on Effective Working Days) */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="font-bold text-slate-800 text-[11px]">
                          {matrixStats.workingDaysCount > 0
                            ? Math.round((teacherFilledWorkingDays / matrixStats.workingDaysCount) * 100)
                            : 0}
                          %
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {effectiveStaffList.length === 0 && (
                  <tr>
                    <td colSpan={daysInMonth + 7} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-slate-600">Belum ada data di Tabel Master Data Pegawai.</p>
                      <p className="text-xs mt-1">Buka tab Pengaturan untuk mengimpor atau menambahkan guru.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary Legend */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 inline-block border border-emerald-600 shadow-2xs" />
                <strong className="text-emerald-800">Kotak Hijau:</strong> Sudah Mengisi (Hari Kerja)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-pink-100 inline-block border border-pink-300 shadow-2xs" />
                <strong className="text-pink-700">Kotak Merah Muda:</strong> Belum Mengisi (Hari Kerja)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-red-600 inline-block border border-red-700 shadow-2xs" />
                <strong className="text-red-700">Kotak Merah:</strong> Hari Sabtu &amp; Minggu (Libur)
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>*Kotak pada matriks dikunci. Pengisian jurnal dilakukan dari menu <strong>Jurnal Harian</strong>.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TINJAUAN HARIAN (MONITORING PER TANGGAL) */}
      {viewMode === 'daily_monitor' && (
        <div className="space-y-4">
          {/* Day Picker Ribbon */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Pilih Tanggal Pemantauan Harian:</span>
              </h4>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {parseDateStrToIndonesian(formatDayDateStr(selectedDayNumber))}
              </span>
            </div>

            {/* Scrollable Day Buttons (1 - N) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {daysArray.map((day) => {
                const isSelected = day === selectedDayNumber;
                const isWeekend = isDayWeekend(day);
                const dayDateStr = formatDayDateStr(day);

                // Check how many teachers filled on this day
                let filledCount = 0;
                if (!isWeekend) {
                  effectiveStaffList.forEach((t) => {
                    if (getTeacherJournalStatus(t, dayDateStr).isFilled) filledCount++;
                  });
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayNumber(day)}
                    className={`shrink-0 w-11 py-2 rounded-xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? isWeekend
                          ? 'bg-red-600 text-white border-red-700 shadow-xs font-bold scale-105'
                          : 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold scale-105'
                        : isWeekend
                        ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[9px] uppercase tracking-tight opacity-75 font-semibold">
                      {getDayNameShort(day)}
                    </div>
                    <div className="text-sm font-bold">{day}</div>
                    <div className="text-[9px] mt-0.5">
                      {isWeekend ? (
                        <span className="font-bold text-red-600">Libur</span>
                      ) : (
                        `${filledCount}/${effectiveStaffList.length}`
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekend Notice Banner if selected day is Saturday or Sunday */}
          {isDayWeekend(selectedDayNumber) ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-red-800 text-base">
                Hari {getDayNameShort(selectedDayNumber)}, {selectedDayNumber} {indonesianMonths[selectedMonth]} {selectedYear} adalah Hari Libur Akhir Pekan
              </h4>
              <p className="text-xs text-red-600 max-w-lg mx-auto">
                Sesuai ketentuan, tidak ada kegiatan jurnal harian untuk seluruh guru pada hari Sabtu dan Minggu. Kotak pada rekapitulasi diberi tanda <strong className="font-bold underline">Warna Merah</strong>.
              </p>
            </div>
          ) : (
            /* Cards for each Teacher for the selected working day */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {effectiveStaffList.map((teacher, idx) => {
                const activeDateStr = formatDayDateStr(selectedDayNumber);
                const status = getTeacherJournalStatus(teacher, activeDateStr);

                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-4.5 shadow-xs transition-all flex flex-col justify-between ${
                      status.isFilled
                        ? 'bg-white border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-pink-50/40 border-pink-200 ring-1 ring-pink-300/30'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header: Teacher Name & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {teacher.name || 'Guru Tanpa Nama'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            NIP. {teacher.nip || '-'} • {teacher.position || 'Guru'}
                          </p>
                        </div>

                        {/* Badge Kotak Hijau vs Merah Muda */}
                        {status.isFilled ? (
                          <div className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs shrink-0">
                            <Check className="w-3 h-3" />
                            <span>SUDAH SIMPAN PDF</span>
                          </div>
                        ) : status.hasActivities ? (
                          <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>BELUM SIMPAN PDF</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-300 font-bold text-[10px] flex items-center gap-1 shrink-0">
                            <X className="w-3 h-3" />
                            <span>BELUM MENGISI</span>
                          </div>
                        )}
                      </div>

                      {/* Journal Details or Empty State */}
                      {status.isFilled && status.journal ? (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                            <span>{status.journal.shift || 'Shift Pagi'}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                              {status.activitiesCount} Kegiatan • PDF Disimpan
                            </span>
                          </div>
                          <div className="space-y-1">
                            {status.journal.activities.slice(0, 2).map((act, actIdx) => (
                              <div key={actIdx} className="text-slate-600 truncate text-[11px]">
                                • <span className="font-mono text-slate-400">{act.startHour}:{act.startMinute}</span> {act.activity}
                              </div>
                            ))}
                            {status.journal.activities.length > 2 && (
                              <div className="text-[10px] text-emerald-700 italic">
                                +{status.journal.activities.length - 2} kegiatan lainnya...
                              </div>
                            )}
                          </div>
                        </div>
                      ) : status.hasActivities && status.journal ? (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                            <span>{status.journal.shift || 'Shift Pagi'}</span>
                            <span className="bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                              {status.activitiesCount} Kegiatan Terisi
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-snug">
                            Guru telah mengisi kegiatan, namun <strong>belum mengklik tombol Simpan PDF</strong> sehingga kotak matriks tetap merah muda.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-pink-100/50 border border-pink-200/70 rounded-xl p-3 text-center space-y-1 text-xs">
                          <p className="text-pink-800 font-semibold">Belum Ada Jurnal Harian</p>
                          <p className="text-[11px] text-pink-600">
                            Guru ini belum membuat entri kegiatan untuk tanggal {parseDateStrToIndonesian(activeDateStr)}.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Tgl {selectedDayNumber} {indonesianMonths[selectedMonth]}
                      </span>
                      <span className={`text-[11px] font-semibold ${status.isFilled ? 'text-emerald-700' : 'text-pink-600'}`}>
                        {status.isFilled ? '✓ Kotak Hijau' : '— Kotak Merah Muda'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DAFTAR JURNAL DETAIL YANG SUDAH TERISI */}
      {viewMode === 'journal_list' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Daftar Riwayat Jurnal Terisi ({indonesianMonths[selectedMonth]} {selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredJournals.length} entri jurnal harian yang telah terdata.
              </p>
            </div>
          </div>

          {filteredJournals.length === 0 ? (
            <div className="text-center py-14 px-4 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-medium">
                Belum ada jurnal yang tercatat pada bulan {indonesianMonths[selectedMonth]} {selectedYear}.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan beralih ke tab <strong className="text-blue-600">Jurnal Harian</strong> untuk memilih tanggal dan mulai mengisi aktivitas kerja.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredJournals.map((journal) => {
                const photoCount = journal.activities.filter((a) => !!a.photoUrl).length;
                const teacherName = journal.teacherName || journal.profileSnapshot?.name || profile.name;
                const teacherNip = journal.teacherNip || journal.profileSnapshot?.nip || profile.nip;

                return (
                  <div
                    key={journal.id || journal.dateStr}
                    className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {parseDateStrToIndonesian(journal.dateStr)}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          {journal.shift || 'Shift Pagi'}
                        </span>
                        {teacherName && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            {teacherName}
                          </span>
                        )}
                      </div>

                      {/* Preview of first 2 activities */}
                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        {journal.activities.slice(0, 2).map((act, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono">
                              {act.startHour}:{act.startMinute} - {act.endHour}:{act.endMinute}
                            </span>
                            <span className="truncate max-w-md font-medium">{act.activity}</span>
                          </div>
                        ))}
                        {journal.activities.length > 2 && (
                          <div className="text-[11px] text-slate-400 italic">
                            +{journal.activities.length - 2} kegiatan lainnya...
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {journal.activities.length} Kegiatan Terisi
                        </span>
                        {photoCount > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <ImageIcon className="w-3.5 h-3.5" />
                            {photoCount} Foto Bukti
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectDateToEdit(journal.dateStr, {
                            name: teacherName,
                            nip: teacherNip,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Buka di Form Jurnal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Yakin ingin menghapus jurnal ${teacherName} tanggal ${journal.dateStr}?`
                            )
                          ) {
                            onDeleteJournal(journal.id || journal.dateStr, journal.dateStr);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Jurnal Tanggal Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
