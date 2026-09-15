import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Zap,
  Check
} from 'lucide-react';
import { 
  QUICK_ACTIVITY_TEMPLATES, 
  SIX_ACTIVITIES_GURU, 
  SIX_ACTIVITIES_TENDIK 
} from '../data/initialData';
import { ActivityItem } from '../types/journal';

interface QuickTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    activityText: string, 
    notesText?: string, 
    asNewRow?: boolean
  ) => void;
  onApplyFullDayActivities?: (activities: ActivityItem[], shiftTitle?: string) => void;
}

type MainTab = 'paket_6' | 'guru' | 'tendik';

export const QuickTemplateModal: React.FC<QuickTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onApplyFullDayActivities,
}) => {
  const [mainTab, setMainTab] = useState<MainTab>('guru');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);

  if (!isOpen) return null;

  // Filter categories by role for the selected tab
  const guruCategories = QUICK_ACTIVITY_TEMPLATES.filter((c) => c.role === 'Guru');
  const tendikCategories = QUICK_ACTIVITY_TEMPLATES.filter((c) => c.role === 'Tendik');

  const currentCategories = mainTab === 'guru' ? guruCategories : tendikCategories;
  const safeCategoryIdx = Math.min(activeCategoryIdx, Math.max(0, currentCategories.length - 1));
  const activeCategoryData = currentCategories[safeCategoryIdx];

  const handleApplyPackage = (pkgActivities: ActivityItem[], shiftTitle?: string) => {
    if (onApplyFullDayActivities) {
      onApplyFullDayActivities(pkgActivities, shiftTitle);
      onClose();
    }
  };

  // Quick Apply Item directly when card is clicked
  const handleUseItem = (item: { text: string; notes?: string }, asNewRow: boolean = false) => {
    onSelectTemplate(item.text, item.notes || '', asNewRow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Pustaka Template Kegiatan Guru &amp; Tendik</span>
              <span className="text-[11px] font-normal text-slate-500">
                Klik langsung pada kegiatan di bawah untuk memasukkannya ke jurnal harian
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setMainTab('guru');
              setActiveCategoryIdx(0);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'guru'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pustaka Guru (6 Kategori Ringkas)</span>
          </button>

          <button
            onClick={() => {
              setMainTab('tendik');
              setActiveCategoryIdx(0);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'tendik'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Pustaka Tendik (6 Kategori Ringkas)</span>
          </button>

          <button
            onClick={() => {
              setMainTab('paket_6');
              setActiveCategoryIdx(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'paket_6'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Paket 6 Lengkap</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/30 text-white uppercase font-black">
              1-Klik
            </span>
          </button>
        </div>

        {/* Tab 1 & 2: Pustaka Satuan per Kategori Guru / Tendik */}
        {mainTab !== 'paket_6' ? (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {/* Sub-Category Horizontal Selector */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
              {currentCategories.map((cat, idx) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    setActiveCategoryIdx(idx);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    safeCategoryIdx === idx
                      ? mainTab === 'guru'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* List of Standard Template Items in Selected Category - Clickable cards without buttons */}
            <div className="space-y-2 pt-1">
              {activeCategoryData?.items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseItem(item, false)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 hover:shadow-xs transition-all space-y-1.5 group bg-white cursor-pointer active:scale-[0.99]"
                  title="Klik untuk memilih kegiatan ini"
                >
                  {/* Row Top: Role badge & hover indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 group-hover:bg-emerald-100 text-emerald-800 font-semibold text-[10px] border border-emerald-200/60">
                      {item.role || (mainTab === 'guru' ? 'Guru' : 'Tendik')}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>Pilih kegiatan</span>
                      <span>&rarr;</span>
                    </span>
                  </div>

                  {/* Uraian Kegiatan */}
                  <div className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-emerald-950 leading-relaxed">
                    {item.text}
                  </div>

                  {/* Keterangan / Bukti Dukung */}
                  {item.notes && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 italic pl-0.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Bukti/Ket: {item.notes}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 3: Paket 6 Kegiatan Lengkap 1 Hari Penuh */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">💡 Fitur Pengisian Otomatis: </span>
              Pilih paket di bawah ini untuk langsung mengisi <strong>6 baris kegiatan harian ringkas standar</strong> dari awal hingga akhir jam kerja.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Card Paket 6 Guru */}
              <div className="border-2 border-emerald-200 hover:border-emerald-500 rounded-xl p-4 bg-gradient-to-b from-emerald-50/40 to-white flex flex-col justify-between space-y-3 transition-all shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      GURU KELAS / MAPEL
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      06.30 - 15.00
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Paket 6 Kegiatan Harian Guru
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Format ringkas 6 sesi kerja guru mencakup Kegiatan Pagi Ceria &amp; Gerakan 7 Kebiasaan, KBM modul ajar, bimbingan literasi/remedial, asesmen formatif, penyusunan perangkat ajar, dan refleksi Kombel.
                  </p>

                  {/* List mini ringkasan 6 kegiatan */}
                  <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5 text-[11px]">
                    {SIX_ACTIVITIES_GURU.map((act, i) => (
                      <div key={act.id || i} className="flex items-start gap-1.5 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">
                            {act.startHour}:{act.startMinute} - {act.endHour}:{act.endMinute}:
                          </span>{' '}
                          <span className="text-slate-600 line-clamp-1">{act.activity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPackage(SIX_ACTIVITIES_GURU, 'Guru : Shift Pagi (06.30 - 15.00)')}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan 6 Kegiatan Guru ke Jurnal</span>
                  </button>
                </div>
              </div>

              {/* Card Paket 6 Tendik */}
              <div className="border-2 border-emerald-200 hover:border-emerald-500 rounded-xl p-4 bg-gradient-to-b from-emerald-50/40 to-white flex flex-col justify-between space-y-3 transition-all shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      TENAGA KEPENDIDIKAN / TU
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      07.00 - 15.30
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Paket 6 Kegiatan Harian Tendik / TU
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Format ringkas 6 sesi kerja Tenaga Kependidikan mencakup presensi pegawai, agenda persuratan dinas, validasi Dapodikdasmen, inventaris BMD/KIR, SPJ BOSP, dan layanan kesiswaan.
                  </p>

                  {/* List mini ringkasan 6 kegiatan */}
                  <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5 text-[11px]">
                    {SIX_ACTIVITIES_TENDIK.map((act, i) => (
                      <div key={act.id || i} className="flex items-start gap-1.5 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">
                            {act.startHour}:{act.startMinute} - {act.endHour}:{act.endMinute}:
                          </span>{' '}
                          <span className="text-slate-600 line-clamp-1">{act.activity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPackage(SIX_ACTIVITIES_TENDIK, 'Tenaga Kependidikan / TU (07.00 - 15.30)')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan 6 Kegiatan Tendik ke Jurnal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 shrink-0 flex items-center justify-between flex-wrap gap-1">
          <span>Klik langsung pada kegiatan yang diinginkan untuk menerapkannya ke baris jurnal.</span>
          <span className="text-slate-500 font-medium">Sistem Jurnal Harian Guru &amp; Tendik</span>
        </div>
      </div>
    </div>
  );
};
