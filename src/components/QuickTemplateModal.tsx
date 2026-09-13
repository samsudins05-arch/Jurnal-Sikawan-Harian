import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  Target, 
  FileText, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  Zap,
  Edit3,
  Trash2,
  BookmarkPlus
} from 'lucide-react';
import { 
  QUICK_ACTIVITY_TEMPLATES, 
  FULL_DAY_PACKAGES, 
  SIX_ACTIVITIES_GURU, 
  SIX_ACTIVITIES_TENDIK 
} from '../data/initialData';
import { ActivityItem, ActivityTemplateItem } from '../types/journal';

export interface CustomTemplateRecord {
  id: string;
  category: string;
  role: 'Guru' | 'Tendik';
  text: string;
  indicator: string;
  notes: string;
  timeRange?: string;
  createdAt: number;
}

interface QuickTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    activityText: string, 
    notesText: string, 
    indicatorText?: string,
    timeData?: { startHour?: string; startMinute?: string; endHour?: string; endMinute?: string },
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

  // Custom User Templates persisted in localStorage
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateRecord[]>([]);

  // Manual Input Form State
  const [isManualFormOpen, setIsManualFormOpen] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');
  const [manualIndicator, setManualIndicator] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualStartTime, setManualStartTime] = useState<string>('07:15');
  const [manualEndTime, setManualEndTime] = useState<string>('08:45');
  const [manualFormMode, setManualFormMode] = useState<'create' | 'edit'>('create');

  // Load custom templates on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sijunawan_custom_templates');
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error loading custom templates:', e);
    }
  }, []);

  if (!isOpen) return null;

  // Filter categories by role for the selected tab
  const guruCategories = QUICK_ACTIVITY_TEMPLATES.filter((c) => c.role === 'Guru');
  const tendikCategories = QUICK_ACTIVITY_TEMPLATES.filter((c) => c.role === 'Tendik');

  const currentCategories = mainTab === 'guru' ? guruCategories : tendikCategories;
  const safeCategoryIdx = Math.min(activeCategoryIdx, Math.max(0, currentCategories.length - 1));
  const activeCategoryData = currentCategories[safeCategoryIdx];

  // Custom templates for current category & role
  const categoryCustoms = customTemplates.filter(
    (ct) => ct.category === activeCategoryData?.category && ct.role === (mainTab === 'guru' ? 'Guru' : 'Tendik')
  );

  const handleApplyPackage = (pkgActivities: ActivityItem[], shiftTitle?: string) => {
    if (onApplyFullDayActivities) {
      onApplyFullDayActivities(pkgActivities, shiftTitle);
      onClose();
    }
  };

  // Helper to parse time string HH:MM
  const parseTimeString = (timeStr?: string) => {
    if (!timeStr) return undefined;
    const parts = timeStr.replace('.', ':').split('-');
    if (parts.length >= 2) {
      const startParts = parts[0].trim().split(':');
      const endParts = parts[1].trim().split(':');
      return {
        startHour: startParts[0] || '07',
        startMinute: startParts[1] || '00',
        endHour: endParts[0] || '08',
        endMinute: endParts[1] || '00',
      };
    }
    return undefined;
  };

  // Quick Apply Item directly
  const handleUseItem = (item: ActivityTemplateItem, asNewRow: boolean = false) => {
    const timeData = parseTimeString(item.timeRange);
    onSelectTemplate(item.text, item.notes, item.indicator, timeData, asNewRow);
    onClose();
  };

  // Open Manual Form with clean fields
  const handleOpenNewManualForm = () => {
    setManualText('');
    setManualIndicator('');
    setManualNotes('Foto kegiatan & presensi');
    setManualStartTime('07:15');
    setManualEndTime('08:45');
    setManualFormMode('create');
    setIsManualFormOpen(true);
  };

  // Open Manual Form with existing item pre-filled to edit
  const handleEditAndCustomize = (item: ActivityTemplateItem) => {
    setManualText(item.text);
    setManualIndicator(item.indicator || '');
    setManualNotes(item.notes || 'Foto kegiatan & presensi');
    if (item.timeRange && item.timeRange.includes('-')) {
      const parts = item.timeRange.replace('.', ':').split('-');
      setManualStartTime(parts[0].trim());
      setManualEndTime(parts[1].trim());
    }
    setManualFormMode('edit');
    setIsManualFormOpen(true);
  };

  // Save manual entry into custom templates in localStorage
  const handleSaveToCustomTemplates = (alsoApply: boolean = true) => {
    if (!manualText.trim()) {
      alert('Mohon ketikkan uraian kegiatan terlebih dahulu.');
      return;
    }

    const newRecord: CustomTemplateRecord = {
      id: `ct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category: activeCategoryData.category,
      role: mainTab === 'guru' ? 'Guru' : 'Tendik',
      text: manualText.trim(),
      indicator: manualIndicator.trim(),
      notes: manualNotes.trim(),
      timeRange: `${manualStartTime} - ${manualEndTime}`,
      createdAt: Date.now(),
    };

    const updated = [newRecord, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('sijunawan_custom_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving custom templates:', e);
    }

    if (alsoApply) {
      const startParts = manualStartTime.split(':');
      const endParts = manualEndTime.split(':');
      onSelectTemplate(
        newRecord.text,
        newRecord.notes,
        newRecord.indicator,
        {
          startHour: startParts[0] || '07',
          startMinute: startParts[1] || '15',
          endHour: endParts[0] || '08',
          endMinute: endParts[1] || '45',
        },
        false
      );
      onClose();
    } else {
      setIsManualFormOpen(false);
    }
  };

  // Apply manual entry without saving to templates library
  const handleApplyManualDirect = (asNewRow: boolean = false) => {
    if (!manualText.trim()) {
      alert('Mohon ketikkan uraian kegiatan terlebih dahulu.');
      return;
    }
    const startParts = manualStartTime.split(':');
    const endParts = manualEndTime.split(':');
    onSelectTemplate(
      manualText.trim(),
      manualNotes.trim(),
      manualIndicator.trim(),
      {
        startHour: startParts[0] || '07',
        startMinute: startParts[1] || '15',
        endHour: endParts[0] || '08',
        endMinute: endParts[1] || '45',
      },
      asNewRow
    );
    onClose();
  };

  // Delete a custom template
  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus template kustom manual ini?')) {
      const updated = customTemplates.filter((ct) => ct.id !== id);
      setCustomTemplates(updated);
      try {
        localStorage.setItem('sijunawan_custom_templates', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error deleting custom template:', err);
      }
    }
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
                Pilih template standar atau input kegiatan manual dengan tombol (+)
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
              setIsManualFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'guru'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pustaka Guru (6 Kategori)</span>
          </button>

          <button
            onClick={() => {
              setMainTab('tendik');
              setActiveCategoryIdx(0);
              setIsManualFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              mainTab === 'tendik'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Pustaka Tendik (6 Kategori)</span>
          </button>

          <button
            onClick={() => {
              setMainTab('paket_6');
              setActiveCategoryIdx(0);
              setIsManualFormOpen(false);
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
                    setIsManualFormOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    safeCategoryIdx === idx
                      ? mainTab === 'guru'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Category Action Header with (+) Tambah Manual Button */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {activeCategoryData?.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {(activeCategoryData?.items.length || 0) + categoryCustoms.length} Kegiatan
                </span>
              </div>

              {/* (+) Tombol Tambah Kegiatan Manual */}
              <button
                type="button"
                onClick={handleOpenNewManualForm}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                  mainTab === 'guru'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Input kegiatan manual baru pada kategori ini"
              >
                <Plus className="w-4 h-4" />
                <span>(+) Tambah Kegiatan Manual</span>
              </button>
            </div>

            {/* Inline Manual Form (when opened) */}
            {isManualFormOpen && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <span>
                      {manualFormMode === 'create'
                        ? `Input Kegiatan Manual Baru (${activeCategoryData?.category})`
                        : `Edit & Sesuaikan Kegiatan Manual`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualFormOpen(false)}
                    className="p-1 rounded text-amber-700 hover:bg-amber-100"
                    title="Batal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Field 1: Uraian Kegiatan */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Uraian Kegiatan Kerja <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Ketik uraian kegiatan kerja yang ingin diinput secara manual..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Field 2 & 3: Jam & Indikator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rentang Jam Pelaksanaan (Mulai - Selesai)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={manualStartTime}
                        onChange={(e) => setManualStartTime(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                      />
                      <span className="text-xs text-slate-500 font-bold">-</span>
                      <input
                        type="time"
                        value={manualEndTime}
                        onChange={(e) => setManualEndTime(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Keterangan / Bukti Dukung (Opsional)
                    </label>
                    <input
                      type="text"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder="misal: Foto kegiatan, presensi, buku piket"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Field 4: Indikator Kinerja */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Indikator Kinerja / Capaian Output (Opsional)
                  </label>
                  <input
                    type="text"
                    value={manualIndicator}
                    onChange={(e) => setManualIndicator(e.target.value)}
                    placeholder="misal: Terlaksananya pembiasaan 5S dan KBM aktif-partisipatif"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setIsManualFormOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-100 rounded-lg"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveToCustomTemplates(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    title="Simpan kegiatan ini ke pustaka template kategori dan terapkan ke jurnal"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>💾 Simpan ke Pustaka &amp; Terapkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyManualDirect(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    title="Langsung terapkan kegiatan manual ini ke baris jurnal terpilih"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>(+) Terapkan ke Baris Jurnal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyManualDirect(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    title="Tambahkan sebagai baris kegiatan baru di jurnal"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>(+) Tambah Baris Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Custom Manual Templates in This Category (if any) */}
            {categoryCustoms.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kegiatan Manual / Kustom Tersimpan ({categoryCustoms.length})</span>
                </div>
                {categoryCustoms.map((ct) => (
                  <div
                    key={ct.id}
                    className="w-full text-left p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Manual / Kustom
                        </span>
                        {ct.timeRange && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-200 text-slate-700 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {ct.timeRange}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditAndCustomize(ct)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                          title="Edit teks kegiatan ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomTemplate(ct.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                          title="Hapus template kustom ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUseItem(ct, false)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer"
                          title="Gunakan ke jurnal"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pilih</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                      {ct.text}
                    </div>

                    {ct.indicator && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-1.5">
                        🎯 <strong>Indikator:</strong> {ct.indicator}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* List of Standard Template Items in Selected Category */}
            <div className="space-y-2.5">
              {activeCategoryData?.items.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all space-y-2 group bg-white shadow-2xs"
                >
                  {/* Row Top: Time range & Quick Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      {item.timeRange && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {item.timeRange}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        {item.role || (mainTab === 'guru' ? 'Guru' : 'Tendik')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Button Edit & Tambah Manual */}
                      <button
                        type="button"
                        onClick={() => handleEditAndCustomize(item)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-md text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                        title="Salin dan edit narasi kegiatan ini secara manual sebelum diterapkan"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Edit Manual</span>
                      </button>

                      {/* Button (+) Pilih & Terapkan */}
                      <button
                        type="button"
                        onClick={() => handleUseItem(item, false)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        title="Langsung terapkan kegiatan ini ke baris jurnal"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>(+) Pilih</span>
                      </button>
                    </div>
                  </div>

                  {/* Uraian Kegiatan */}
                  <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {item.text}
                  </div>

                  {/* Indikator Kinerja */}
                  {item.indicator && (
                    <div className="flex items-start gap-1.5 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg p-2">
                      <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-emerald-950">Indikator Kinerja:</strong>{' '}
                        <span>{item.indicator}</span>
                      </div>
                    </div>
                  )}

                  {/* Keterangan / Bukti Dukung */}
                  {item.notes && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 italic pl-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Bukti/Ket: {item.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 3: Paket 6 Kegiatan Lengkap 1 Hari Penuh */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">💡 Fitur Pengisian Otomatis: </span>
              Pilih paket di bawah ini untuk langsung mengisi <strong>6 baris kegiatan harian lengkap</strong> dari jam awal hingga akhir kerja, disertai jam teratur, uraian kegiatan, dan <strong>indikator kinerja</strong> masing-masing.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Card Paket 6 Guru */}
              <div className="border-2 border-blue-200 hover:border-blue-500 rounded-xl p-4 bg-gradient-to-b from-blue-50/40 to-white flex flex-col justify-between space-y-3 transition-all shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">
                      GURU KELAS / MAPEL
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" /> 06.30 - 15.00
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Paket 6 Kegiatan Harian Guru
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Format resmi 6 sesi kerja guru mencakup penyambutan 5S, KBM aktif Kurikulum Merdeka, bimbingan literasi &amp; remedial, asesmen formatif, penyusunan modul ajar, dan refleksi Kombel.
                  </p>

                  {/* List mini ringkasan 6 kegiatan */}
                  <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5 text-[11px]">
                    {SIX_ACTIVITIES_GURU.map((act, i) => (
                      <div key={act.id || i} className="flex items-start gap-1.5 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800">
                            {act.startHour}:{act.startMinute} - {act.endHour}:{act.endMinute}:
                          </span>{' '}
                          <span className="text-slate-600 line-clamp-1">{act.activity}</span>
                          {act.indicator && (
                            <span className="text-[10px] text-emerald-700 block font-medium">
                              🎯 Indikator: {act.indicator}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPackage(SIX_ACTIVITIES_GURU, 'Guru : Shift Pagi (06.30 - 15.00)')}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan 6 Kegiatan Guru ke Jurnal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMainTab('guru');
                      setActiveCategoryIdx(0);
                      handleOpenNewManualForm();
                    }}
                    className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>(+) Tambah Kegiatan Manual Guru</span>
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
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> 07.00 - 15.30
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Paket 6 Kegiatan Harian Tendik / TU
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Format resmi 6 sesi kerja Tenaga Kependidikan mencakup presensi fingerprint, tata kelola persuratan dinas, validasi Dapodikdasmen, inventaris BMD/KIR, administrasi SPJ BOSP, dan layanan kesiswaan.
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
                          {act.indicator && (
                            <span className="text-[10px] text-emerald-700 block font-medium">
                              🎯 Indikator: {act.indicator}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPackage(SIX_ACTIVITIES_TENDIK, 'Tenaga Kependidikan / TU (07.00 - 15.30)')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan 6 Kegiatan Tendik ke Jurnal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMainTab('tendik');
                      setActiveCategoryIdx(0);
                      handleOpenNewManualForm();
                    }}
                    className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg border border-emerald-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>(+) Tambah Kegiatan Manual Tendik</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 shrink-0 flex items-center justify-between flex-wrap gap-1">
          <span>Gunakan tombol <strong>(+) Pilih</strong> untuk langsung menerapkan atau <strong>Edit Manual</strong> untuk mengubah uraian.</span>
          <span className="text-slate-500 font-medium">Sistem Jurnal Harian Guru &amp; Tendik</span>
        </div>
      </div>
    </div>
  );
};
