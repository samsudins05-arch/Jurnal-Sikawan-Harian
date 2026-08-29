import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  User, 
  Smartphone,
  Laptop,
  Share2
} from 'lucide-react';
import { UserProfile, ActivityItem } from '../types/journal';
import { downloadPdfDirectly, sharePdfToMobile, PdfExportResult } from '../utils/pdfExport';

interface SavePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  activities: ActivityItem[];
  profile: UserProfile;
  onSuccessNotification: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SavePdfModal: React.FC<SavePdfModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  activities,
  profile,
  onSuccessNotification,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const filledActivitiesCount = activities.filter((a) => a.activity.trim().length > 0).length;
  const safeName = (profile.name || 'Guru').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Jurnal_Kerja_Harian_${selectedDate}_${safeName}.pdf`;

  // Option 1: Direct High-Res PDF Download to Computer/Android Storage
  const handleDirectDownload = async () => {
    setIsProcessing(true);
    setStatusMessage({
      type: 'info',
      text: 'Sedang memproses & mengunduh berkas PDF A4...',
    });

    try {
      const result: PdfExportResult = await downloadPdfDirectly('printable-journal-sheet', filename);
      
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Berhasil! Berkas "${filename}" berhasil diunduh dan tersimpan di folder Download perangkat Anda.`,
        });
        onSuccessNotification(
          'UNDUH PDF BERHASIL',
          `Berkas PDF (${filename}) telah tersimpan ke penyimpanan perangkat Anda.`,
          'success'
        );
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        window.print();
        onClose();
      }
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setStatusMessage({
        type: 'error',
        text: 'Mengalihkan ke jendela simpan / cetak...',
      });
      window.print();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Option 2: Mobile Share API (Direct save to Drive, WA, File Manager on Android)
  const handleMobileShare = async () => {
    setIsProcessing(true);
    setStatusMessage({
      type: 'info',
      text: 'Membuka menu simpan / bagikan Android...',
    });

    try {
      const result = await sharePdfToMobile('printable-journal-sheet', filename);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Menu simpan Android dibuka.',
        });
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      console.warn('Share error:', err);
      // Fallback to direct download
      await handleDirectDownload();
    } finally {
      setIsProcessing(false);
    }
  };

  // Option 3: Native System Print / Save as PDF Dialog
  const handleSystemPrintDialog = () => {
    setStatusMessage({
      type: 'info',
      text: 'Membuka dialog sistem simpan PDF / cetak...',
    });
    setTimeout(() => {
      window.print();
      onSuccessNotification(
        'Dialog Simpan PDF / Cetak Dibuka',
        'Pilih opsi "Simpan sebagai PDF" atau "Save as PDF" pada jendela peramban Anda.',
        'info'
      );
      onClose();
    }, 200);
  };

  // Format date in Indonesian for header
  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Simpan Lembar Kerja (PDF)
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Simpan &amp; Unduh dokumen Jurnal ke Komputer atau Android
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Document Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-800">Ringkasan Dokumen:</span>
              <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                Kertas A4 Potrait
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{formatDateDisplay(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate font-medium">{profile.name || 'Belum ada nama'}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
              <span>Kegiatan terisi: <strong>{filledActivitiesCount} butir</strong></span>
              <span className="font-mono text-slate-400 truncate max-w-[200px]">{filename}</span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            {/* Option 1: Direct Download to Device (Laptop/PC & Android) */}
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={isProcessing}
              className="w-full group text-left p-3.5 rounded-xl border-2 border-red-500 hover:border-red-600 bg-red-50/50 hover:bg-red-50 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs disabled:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-red-700 flex items-center gap-1.5">
                    <span>1. Unduh / Download File PDF Langsung</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                      Aktif (PC &amp; HP)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Otomatis mengunduh dan menyimpan berkas <strong>.pdf</strong> ke folder <em>Downloads</em> di Komputer atau Android Anda.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-red-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
            </button>

            {/* Option 2: Mobile Share / Save to Drive / WhatsApp (If on Mobile or Web Share supported) */}
            {isMobileDevice && (
              <button
                type="button"
                onClick={handleMobileShare}
                disabled={isProcessing}
                className="w-full group text-left p-3.5 rounded-xl border border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                      <span>2. Simpan ke Google Drive / WhatsApp (Android)</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        HP Android
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Buka menu Android untuk simpan ke Google Drive, Manajer Berkas, atau kirim ke WhatsApp.
                    </p>
                  </div>
                </div>
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>
            )}

            {/* Option 3: System Print / Save as PDF Dialog */}
            <button
              type="button"
              onClick={handleSystemPrintDialog}
              disabled={isProcessing}
              className="w-full group text-left p-3.5 rounded-xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                    <span>{isMobileDevice ? '3.' : '2.'} Dialog Cetak / Simpan PDF Sistem</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      Pilih Folder
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Membuka dialog cetak browser peramban (Ctrl+P) untuk memilih folder simpan manual atau printer.
                  </p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-blue-600 shrink-0" />
            </button>
          </div>

          {/* Device Compatibility Guide */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Laptop className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-700">Komputer / Laptop:</span>
                Tersimpan di folder <em>C:\Users\...\Downloads</em>.
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-700">Ponsel Android:</span>
                Tersimpan di <em>Penyimpanan Internal &gt; Download</em>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Format: Dokumen Resmi A4 (Siap Cetak)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
