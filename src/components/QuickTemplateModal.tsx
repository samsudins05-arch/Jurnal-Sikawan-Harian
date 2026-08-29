import React, { useState } from 'react';
import { X, Sparkles, Plus, BookOpen, Check } from 'lucide-react';
import { QUICK_ACTIVITY_TEMPLATES } from '../data/initialData';

interface QuickTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (activityText: string, notesText: string) => void;
}

export const QuickTemplateModal: React.FC<QuickTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Pustaka Template Kegiatan Guru &amp; Tendik</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
          {QUICK_ACTIVITY_TEMPLATES.map((cat, idx) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === idx
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* List of template items in selected category */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {QUICK_ACTIVITY_TEMPLATES[activeCategory].items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectTemplate(item.text, item.notes);
                onClose();
              }}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 transition-all space-y-1.5 group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-900 leading-snug">
                  {item.text}
                </span>
                <span className="shrink-0 p-1 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
              {item.notes && (
                <div className="text-[11px] text-slate-500 italic">
                  Ket: {item.notes}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          Klik salah satu pilihan di atas untuk langsung menyalin ke baris kegiatan.
        </div>
      </div>
    </div>
  );
};
