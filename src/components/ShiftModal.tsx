import React, { useState } from 'react';
import { X, Clock, Check, Plus } from 'lucide-react';
import { ShiftConfig } from '../types/journal';
import { DEFAULT_SHIFTS } from '../data/initialData';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShift: string;
  onSelectShift: (shiftTitle: string) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  currentShift,
  onSelectShift,
}) => {
  const [shifts, setShifts] = useState<ShiftConfig[]>(DEFAULT_SHIFTS);
  const [customShiftText, setCustomShiftText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleAddCustomShift = () => {
    if (!customShiftText.trim()) return;
    const newTitle = customShiftText.trim();
    onSelectShift(newTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Pilih Shift Kerja Guru / Pegawai</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Pilih shift kerja yang sesuai dengan penugasan harian Anda di sekolah:
        </p>

        {/* List of predefined shifts */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {shifts.map((s) => {
            const isSelected = currentShift.includes(s.startTime) || currentShift === s.title;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSelectShift(s.title);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold">{s.title}</div>
                    <div className="text-[11px] text-slate-500">{s.startTime} s/d {s.endTime} WIB</div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Shift Option */}
        <div className="pt-2 border-t border-slate-100">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Shift Kustom Lainnya
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Nama &amp; Jam Shift Kustom:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customShiftText}
                  onChange={(e) => setCustomShiftText(e.target.value)}
                  placeholder="Guru : Shift Sore (13.00 - 18.00)"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCustomShift}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
