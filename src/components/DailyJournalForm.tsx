import React, { useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  Plus, 
  Camera, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ActivityItem, ShiftConfig } from '../types/journal';
import { HOURS, MINUTES_STEP_5, formatSlashDate, parseDateStrToIndonesian } from '../utils/dateFormat';

interface DailyJournalFormProps {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  currentShift: string;
  onOpenShiftModal: () => void;
  activities: ActivityItem[];
  setActivities: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  onOpenTemplateModal: (targetIndex: number) => void;
}

export const DailyJournalForm: React.FC<DailyJournalFormProps> = ({
  selectedDate,
  setSelectedDate,
  currentShift,
  onOpenShiftModal,
  activities,
  setActivities,
  onOpenTemplateModal,
}) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Handlers for date navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Activity list handlers
  const handleAddActivity = () => {
    // Determine smart default start/end times based on previous activity
    let startH = '07';
    let startM = '00';
    let endH = '08';
    let endM = '00';

    if (activities.length > 0) {
      const last = activities[activities.length - 1];
      startH = last.endHour;
      startM = last.endMinute;
      const nextHourNum = (parseInt(last.endHour, 10) + 1) % 24;
      endH = String(nextHourNum).padStart(2, '0');
      endM = last.endMinute;
    }

    const newItem: ActivityItem = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      startHour: startH,
      startMinute: startM,
      endHour: endH,
      endMinute: endM,
      activity: '',
      notes: '',
      photoUrl: '',
    };
    setActivities([...activities, newItem]);
  };

  const handleUpdateActivity = (index: number, field: keyof ActivityItem, value: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  // Photo upload and compression handler
  const handlePhotoUpload = (index: number, file: File) => {
    if (!file) return;

    // Check size limit and resize using canvas to keep Firestore document compact
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        const scaleSize = MAX_WIDTH / img.width;
        
        const targetWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const targetHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          handleUpdateActivity(index, 'photoUrl', compressedDataUrl);
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* 1. Shift Banner matching screenshot */}
      <button
        id="btn-shift-selector"
        onClick={onOpenShiftModal}
        className="w-full bg-[#dbeafe] hover:bg-blue-100 text-[#1e40af] font-semibold text-center py-2 px-3 rounded-lg border border-blue-300 shadow-xs transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
        title="Klik untuk mengubah shift kerja"
      >
        <Clock className="w-4 h-4 text-blue-600" />
        <span>{currentShift}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* 2. Box "Hari / Tanggal" matching screenshot styling */}
      <div className="bg-[#fffbeb] border border-[#fef08a] rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <span>Hari / Tanggal</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded hover:bg-amber-100 text-amber-800 text-xs transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded hover:bg-amber-100 text-amber-800 text-xs transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Input with clean picker */}
        <div className="relative">
          <input
            id="input-journal-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
          />
        </div>
        <div className="text-[11px] text-amber-800 mt-1 font-medium italic">
          {parseDateStrToIndonesian(selectedDate)}
        </div>
      </div>

      {/* 3. Box "Kegiatan Hari Ini" matching screenshot */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm sm:text-base">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Kegiatan Hari Ini</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activities.length} Kegiatan
            </span>
          </div>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            *Atur Jam Mulai &amp; Selesai.
          </p>
        </div>

        {/* List of activity entries */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500">Belum ada kegiatan untuk tanggal ini.</p>
              <button
                onClick={handleAddActivity}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kegiatan Sekarang
              </button>
            </div>
          ) : (
            activities.map((item, index) => (
              <div
                key={item.id}
                id={`activity-card-${index}`}
                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative group hover:border-slate-300 transition-colors"
              >
                {/* Time picker row with delete button */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-700">
                    {/* Mulai */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">Mulai:</span>
                      <select
                        value={item.startHour}
                        onChange={(e) => handleUpdateActivity(index, 'startHour', e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="font-bold">:</span>
                      <select
                        value={item.startMinute}
                        onChange={(e) => handleUpdateActivity(index, 'startMinute', e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      >
                        {MINUTES_STEP_5.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Selesai */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">Selesai:</span>
                      <select
                        value={item.endHour}
                        onChange={(e) => handleUpdateActivity(index, 'endHour', e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="font-bold">:</span>
                      <select
                        value={item.endMinute}
                        onChange={(e) => handleUpdateActivity(index, 'endMinute', e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      >
                        {MINUTES_STEP_5.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteActivity(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus baris kegiatan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea kegiatan */}
                <div>
                  <textarea
                    rows={2}
                    value={item.activity}
                    onChange={(e) => handleUpdateActivity(index, 'activity', e.target.value)}
                    placeholder="Ketik kegiatan..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y shadow-2xs"
                  />
                </div>

                {/* Photo & Quick Template toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileInputRefs.current[item.id] = el)}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoUpload(index, e.target.files[0]);
                        }
                      }}
                    />

                    {/* Upload Foto Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.photoUrl ? 'Ubah Foto' : 'Upload Foto'}</span>
                    </button>

                    {/* Quick Template Button */}
                    <button
                      type="button"
                      onClick={() => onOpenTemplateModal(index)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 transition-colors cursor-pointer"
                      title="Pilih narasi kegiatan otomatis dari template guru"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Template</span>
                    </button>
                  </div>

                  {/* Thumbnail preview if uploaded */}
                  {item.photoUrl && (
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200">
                      <img
                        src={item.photoUrl}
                        alt="Bukti Dukung"
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-[10px] text-emerald-600 font-semibold">Foto Terunggah</span>
                      <button
                        onClick={() => handleUpdateActivity(index, 'photoUrl', '')}
                        className="p-0.5 text-slate-400 hover:text-rose-500 rounded"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Notes input */}
                <div>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleUpdateActivity(index, 'notes', e.target.value)}
                    placeholder="Isikan Keterangan Tambahan..."
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* "+ Tambah Baris Baru" button matching screenshot */}
        <button
          id="btn-add-activity-row"
          type="button"
          onClick={handleAddActivity}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Baris Baru</span>
        </button>
      </div>

      {/* Footer credit text matching screenshot */}
      <div className="text-center py-2 text-[11px] text-slate-500 font-semibold tracking-wide">
        Informasi Jurnal Sikawan Harian - SAMSUDIN APP CUSTOM
      </div>
    </div>
  );
};
