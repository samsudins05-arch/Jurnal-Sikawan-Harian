import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { JournalDay, UserProfile, SchoolSettings } from '../types/journal';
import { indonesianMonths, parseDateStrToIndonesian } from '../utils/dateFormat';

interface MonthlyRecapProps {
  journals: JournalDay[];
  onSelectDateToEdit: (dateStr: string) => void;
  onDeleteJournal: (journalId: string, dateStr: string) => void;
  profile: UserProfile;
  schoolSettings: SchoolSettings;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  journals,
  onSelectDateToEdit,
  onDeleteJournal,
  profile,
  schoolSettings,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed

  // Filter journals for selected month and year
  const filteredJournals = journals.filter((j) => {
    if (!j.dateStr) return false;
    const parts = j.dateStr.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === selectedYear && m === selectedMonth;
  }).sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  // Compute metrics
  const totalDays = filteredJournals.length;
  const totalActivities = filteredJournals.reduce((acc, curr) => acc + (curr.activities?.length || 0), 0);
  const totalPhotos = filteredJournals.reduce(
    (acc, curr) => acc + (curr.activities?.filter((a) => !!a.photoUrl).length || 0),
    0
  );
  const avgPerDay = totalDays > 0 ? (totalActivities / totalDays).toFixed(1) : '0';

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['No', 'Tanggal', 'Shift', 'Waktu', 'Kegiatan', 'Keterangan', 'Ada Foto'];
    const rows: string[][] = [];
    let rowNum = 1;

    filteredJournals.forEach((j) => {
      j.activities.forEach((act) => {
        rows.push([
          String(rowNum++),
          j.dateStr,
          `"${(j.shift || '').replace(/"/g, '""')}"`,
          `${act.startHour}:${act.startMinute} - ${act.endHour}:${act.endMinute}`,
          `"${(act.activity || '').replace(/"/g, '""')}"`,
          `"${(act.notes || '').replace(/"/g, '""')}"`,
          act.photoUrl ? 'Ya' : 'Tidak',
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Jurnal_${indonesianMonths[selectedMonth]}_${selectedYear}_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Month & Year Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Rekapitulasi Jurnal Bulanan</h2>
            <p className="text-xs text-slate-500">
              Laporan kerja bulanan untuk penilaian kinerja dan arsip administrasi guru.
            </p>
          </div>
        </div>

        {/* Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 px-2 py-1 focus:outline-none cursor-pointer"
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
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 px-2 py-1 focus:outline-none cursor-pointer"
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
            onClick={handleExportCsv}
            disabled={filteredJournals.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Download file Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          {/* Print Monthly Report */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-slate-500">Hari Terisi</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{totalDays}</span>
            <span className="text-xs font-normal text-slate-500">Hari</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Kegiatan</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 flex items-baseline gap-1">
            <span>{totalActivities}</span>
            <span className="text-xs font-normal text-slate-500">Aktivitas</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-slate-500">Bukti Foto</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-baseline gap-1">
            <span>{totalPhotos}</span>
            <span className="text-xs font-normal text-slate-500">Dokumentasi</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-slate-500">Rata-rata/Hari</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-baseline gap-1">
            <span>{avgPerDay}</span>
            <span className="text-xs font-normal text-slate-500">Item</span>
          </div>
        </div>
      </div>

      {/* Monthly Table / Journal Day List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Daftar Jurnal Bulan {indonesianMonths[selectedMonth]} {selectedYear}
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {filteredJournals.length} Catatan Harian
          </span>
        </div>

        {filteredJournals.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">
              Belum ada jurnal yang tercatat pada bulan {indonesianMonths[selectedMonth]} {selectedYear}.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan kembali ke tab <strong className="text-blue-600">Jurnal Harian</strong> untuk mulai mengisi kegiatan kerja harian Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJournals.map((journal) => {
              const photoCount = journal.activities.filter((a) => !!a.photoUrl).length;
              return (
                <div
                  key={journal.id || journal.dateStr}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {parseDateStrToIndonesian(journal.dateStr)}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {journal.shift || 'Shift Pagi'}
                      </span>
                    </div>

                    {/* Preview of first 2 activities */}
                    <div className="space-y-1 text-xs text-slate-600">
                      {journal.activities.slice(0, 2).map((act, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">
                            {act.startHour}:{act.startMinute} - {act.endHour}:{act.endMinute}
                          </span>
                          <span className="truncate max-w-md">{act.activity}</span>
                        </div>
                      ))}
                      {journal.activities.length > 2 && (
                        <div className="text-[11px] text-slate-400 italic">
                          +{journal.activities.length - 2} kegiatan lainnya...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {journal.activities.length} Kegiatan
                      </span>
                      {photoCount > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {photoCount} Foto Bukti
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons for day */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectDateToEdit(journal.dateStr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Buka &amp; Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus jurnal tanggal ${journal.dateStr}?`)) {
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
    </div>
  );
};
