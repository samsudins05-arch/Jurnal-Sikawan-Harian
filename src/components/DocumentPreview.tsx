import React, { useRef, useState, useEffect } from 'react';
import { 
  FileCheck,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { ActivityItem, UserProfile, SchoolSettings } from '../types/journal';
import { parseDateStrToIndonesian, parseDateStrToIndonesianNoDay } from '../utils/dateFormat';
import { LOGO_KAB_BEKASI_SVG, LOGO_DISDIK_SVG } from '../utils/logos';

interface DocumentPreviewProps {
  selectedDate: string;
  activities: ActivityItem[];
  profile: UserProfile;
  schoolSettings: SchoolSettings;
  onExportPdf?: () => void;
  isExporting?: boolean;
  onUploadStamp?: (base64: string) => void;
  onNavigateToSettings?: () => void;
}

const SHEET_BASE_WIDTH = 794; // 210mm in pixels at 96 DPI (210 * 96 / 25.4 = 793.7)

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedDate,
  activities,
  profile,
  schoolSettings,
  onExportPdf,
  isExporting,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [sheetHeight, setSheetHeight] = useState<number>(1247);
  const [zoomMode, setZoomMode] = useState<'fit' | '100' | 'custom'>('fit');
  const [customScale, setCustomScale] = useState<number>(1);

  // ResizeObserver to detect container width and height dynamically on Android and Desktop
  useEffect(() => {
    if (!containerRef.current) return;

    let rafId: number;
    const updateDims = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.clientWidth);
        }
        if (sheetRef.current) {
          setSheetHeight(sheetRef.current.scrollHeight || 1247);
        }
      });
    };

    updateDims();

    const observer = new ResizeObserver(() => {
      updateDims();
    });

    observer.observe(containerRef.current);
    if (sheetRef.current) {
      observer.observe(sheetRef.current);
    }

    window.addEventListener('resize', updateDims);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', updateDims);
    };
  }, [activities]);

  // Compute responsive fit scale based on available container width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const padding = isMobile ? 8 : 24;
  const availableWidth = containerWidth > 0 ? Math.max(260, containerWidth - padding) : SHEET_BASE_WIDTH;
  const fitScale = Math.min(1, availableWidth / SHEET_BASE_WIDTH);

  const currentScale = zoomMode === 'fit'
    ? fitScale
    : zoomMode === '100'
    ? 1.0
    : customScale;

  const handleToggleFit = () => {
    setZoomMode('fit');
  };

  const handleSet100 = () => {
    setZoomMode('100');
  };

  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomScale((prev) => Math.min(2.0, Math.round((currentScale + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomScale((prev) => Math.max(0.3, Math.round((currentScale - 0.1) * 10) / 10));
  };

  const schoolStamp = schoolSettings.schoolStampUrl || profile.schoolStampUrl;

  const formattedDate = parseDateStrToIndonesian(selectedDate) || 'Jumat, 28 Agustus 2026';
  const titimangsaDate = parseDateStrToIndonesianNoDay(selectedDate) || '28 Agustus 2026';

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header for document preview */}
      <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>LEMBAR KERJA</span>
          </span>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
            210 x 330 mm (Folio)
          </span>
        </div>

        {/* Zoom & View Controls for Android & Desktop */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
          {/* Fit to screen toggle button */}
          <button
            type="button"
            onClick={handleToggleFit}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer border ${
              zoomMode === 'fit'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Sesuaikan lembar kerja pas layar Android (Full terbaca)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pas Layar</span>
          </button>

          {/* 100% button */}
          <button
            type="button"
            onClick={handleSet100}
            className={`px-2 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer border ${
              zoomMode === '100'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Tampilkan dalam ukuran asli 100%"
          >
            100%
          </button>

          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer disabled:opacity-40"
            disabled={currentScale <= 0.3}
            title="Perkecil"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Percentage badge */}
          <span className="font-mono text-[11px] text-slate-600 px-1 min-w-[38px] text-center font-medium">
            {Math.round(currentScale * 100)}%
          </span>

          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer disabled:opacity-40"
            disabled={currentScale >= 2.0}
            title="Perbesar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* F4 Sheet Viewport Container */}
      <div
        id="printable-journal-sheet-container"
        ref={containerRef}
        className="flex-1 bg-slate-300/40 rounded-2xl p-1 sm:p-4 overflow-x-auto overflow-y-auto flex flex-col items-center min-h-[550px] border border-slate-300/60 print:p-0 print:m-0 print:border-none print:bg-transparent print:min-h-0 print:overflow-visible print:block print:w-full touch-pan-x touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Mobile notice banner when in Fit mode */}
        {isMobile && zoomMode === 'fit' && currentScale < 0.9 && (
          <div className="w-full max-w-sm mb-2 px-2.5 py-1 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center justify-between shrink-0 print:hidden">
            <span>Ukuran pas layar Android (tidak terpotong).</span>
            <button
              type="button"
              onClick={handleSet100}
              className="text-emerald-700 font-bold hover:underline cursor-pointer ml-1"
            >
              Perbesar 100%
            </button>
          </div>
        )}

        {/* Scaled Sheet Wrapper: precisely sized to the scaled bounds so no phantom scroll or clipping */}
        <div
          style={{
            width: `${Math.round(SHEET_BASE_WIDTH * currentScale)}px`,
            height: `${Math.round((sheetHeight || 1247) * currentScale)}px`,
          }}
          className="relative shrink-0 overflow-hidden mx-auto print:w-full print:h-auto print:overflow-visible transition-[width,height] duration-150 ease-out"
        >
          {/* The Authentic F4 Printable Page */}
          <div
            id="printable-journal-sheet"
            ref={sheetRef}
            style={{
              width: '210mm',
              minHeight: '330mm',
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              fontFamily: "'Tinos', 'Times New Roman', Times, serif",
              paddingTop: '1.2cm',
              paddingRight: '1.5cm',
              paddingBottom: '1.2cm',
              paddingLeft: '1.5cm',
              boxSizing: 'border-box',
            }}
            className="bg-white text-black shadow-xl rounded-sm leading-snug shrink-0 print:shadow-none print:m-0 print:w-full print:transform-none print:relative print:top-auto print:left-auto select-text flex flex-col justify-between absolute top-0 left-0"
          >
          <div>
          {/* 1. KOP SURAT PEMERINTAH & DINAS PENDIDIKAN / KOP SEKOLAH */}
          <div className="relative pb-2 mb-4">
            {schoolSettings.kopMode === 'image' && schoolSettings.customKopImage ? (
              <div className="w-full flex flex-col items-center justify-center">
                <img
                  src={schoolSettings.customKopImage}
                  alt="Kop Surat Sekolah"
                  className="w-full max-h-36 object-contain"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Logo Pemkab Bekasi / Logo Daerah Custom */}
                  <div className="w-16 h-20 shrink-0 flex items-center justify-center">
                    {schoolSettings.customLogoLeft ? (
                      <img
                        src={schoolSettings.customLogoLeft}
                        alt="Logo Daerah"
                        className="max-h-20 max-w-16 object-contain"
                      />
                    ) : (
                      <div
                        className="w-16 h-20"
                        dangerouslySetInnerHTML={{ __html: LOGO_KAB_BEKASI_SVG }}
                      />
                    )}
                  </div>

                  {/* Center: Kop Text */}
                  <div className="flex-1 text-center font-serif text-black uppercase">
                    <h2 className="text-base sm:text-lg font-bold tracking-wide">
                      {schoolSettings.govName || 'PEMERINTAH KABUPATEN BEKASI'}
                    </h2>
                    <h3 className="text-lg sm:text-xl font-bold tracking-wider mt-0.5">
                      {schoolSettings.deptName || 'DINAS PENDIDIKAN'}
                    </h3>
                    {schoolSettings.subUnitName && (
                      <h4 className="text-base sm:text-lg font-bold tracking-wider mt-0.5">
                        {schoolSettings.subUnitName}
                      </h4>
                    )}
                    {schoolSettings.address && (
                      <p className="text-[10px] font-sans font-normal normal-case text-slate-700 mt-0.5">
                        {schoolSettings.address}
                      </p>
                    )}
                  </div>

                  {/* Right: Logo Dinas Pendidikan / Tut Wuri Handayani / Custom Logo */}
                  <div className="w-16 h-20 shrink-0 flex items-center justify-center">
                    {schoolSettings.customLogoRight ? (
                      <img
                        src={schoolSettings.customLogoRight}
                        alt="Logo Disdik"
                        className="max-h-20 max-w-16 object-contain"
                      />
                    ) : (
                      <div
                        className="w-16 h-20"
                        dangerouslySetInnerHTML={{ __html: LOGO_DISDIK_SVG }}
                      />
                    )}
                  </div>
                </div>

                {/* Official Double Border Line under Kop Surat */}
                <div className="mt-3">
                  <div className="border-b-[2.5px] border-black" />
                  <div className="border-b border-black mt-[1.5px]" />
                </div>
              </>
            )}
          </div>

          {/* 2. JUDUL DOKUMEN */}
          <div className="text-center my-4">
            <h1 className="text-base sm:text-lg font-bold tracking-wide uppercase underline underline-offset-4 decoration-1.5">
              JURNAL KERJA HARIAN
            </h1>
          </div>

          {/* 3. BIODATA PEGAWAI & PAS FOTO */}
          <div className="flex justify-between items-start gap-4 mb-5 text-[12px] sm:text-[13px]">
            {/* Biodata fields */}
            <div className="flex-1 space-y-1">
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Nama</span>
                <span>:</span>
                <span>{profile.name || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">NIP</span>
                <span>:</span>
                <span>{profile.nip || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Jabatan</span>
                <span>:</span>
                <span>{profile.position || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Unit Kerja</span>
                <span>:</span>
                <span>{profile.unitWork || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Pangkat / Gol</span>
                <span>:</span>
                <span>{profile.rankGrade || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Status Pegawai</span>
                <span>:</span>
                <span>{profile.employeeStatus || '................................................'}</span>
              </div>
              <div className="grid grid-cols-[110px_12px_1fr]">
                <span className="font-semibold">Hari/Tanggal</span>
                <span>:</span>
                <span className="font-semibold">{formattedDate}</span>
              </div>
            </div>

            {/* Pas Foto Box */}
            <div className="w-24 h-32 shrink-0 border-2 border-black flex items-center justify-center bg-slate-50 relative overflow-hidden">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Pas Foto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400 font-sans">
                  <div className="text-xs font-bold tracking-widest text-slate-500">FOTO</div>
                  <div className="text-[9px] mt-0.5">3 x 4</div>
                </div>
              )}
            </div>
          </div>

          {/* 4. TABEL KEGIATAN HARIAN */}
          <div className="mb-6 print:mb-3">
            <table className="w-full border-collapse border border-black text-[11px] sm:text-[12px] print:text-[11px]">
              <thead>
                <tr className="bg-slate-100/75 text-center font-bold">
                  <th className="border border-black py-2 print:py-1 px-1 w-[6%]">No</th>
                  <th className="border border-black py-2 print:py-1 px-2 w-[18%]">Waktu</th>
                  <th className="border border-black py-2 print:py-1 px-3 w-[42%] text-center">Kegiatan</th>
                  <th className="border border-black py-2 print:py-1 px-2 w-[20%] text-center">Bukti Dukung</th>
                  <th className="border border-black py-2 print:py-1 px-2 w-[14%] text-center">Ket.</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td className="border border-black py-2 print:py-1.5 px-1 text-center font-mono">1</td>
                    <td className="border border-black py-2 print:py-1.5 px-2 text-center">06:30 - 07:30</td>
                    <td className="border border-black py-2 print:py-1.5 px-3">-</td>
                    <td className="border border-black py-2 print:py-1.5 px-2 text-center">-</td>
                    <td className="border border-black py-2 print:py-1.5 px-2 text-center"></td>
                  </tr>
                ) : (
                  activities.map((item, idx) => (
                    <tr key={item.id || idx} className="align-top">
                      <td className="border border-black py-2 print:py-1.5 px-1 text-center font-semibold">
                        {idx + 1}
                      </td>
                      <td className="border border-black py-2 print:py-1.5 px-2 text-center whitespace-nowrap font-medium">
                        {item.startHour}:{item.startMinute} - {item.endHour}:{item.endMinute}
                      </td>
                      <td className="border border-black py-2 print:py-1.5 px-3 leading-relaxed">
                        <div className="font-serif whitespace-pre-wrap">{item.activity || '-'}</div>
                      </td>
                      <td className="border border-black py-2 print:py-1.5 px-2 text-center">
                        {item.photoUrl ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <img
                              src={item.photoUrl}
                              alt="Bukti"
                              className="max-h-20 print:max-h-16 max-w-28 print:max-w-24 object-contain border border-slate-300 rounded-xs shadow-2xs"
                            />
                            <span className="text-[9px] font-sans text-slate-600 italic">Foto Terlampir</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans text-[10px]">-</span>
                        )}
                      </td>
                      <td className="border border-black py-2 print:py-1.5 px-2 text-center leading-tight">
                        <span className="font-serif text-[11px]">{item.notes || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. TANDA TANGAN (SIGNATURES) */}
          <div className="mt-8 print:mt-4 pt-4 print:pt-1 break-inside-avoid text-[12px] sm:text-[13px]">
            <div className="grid grid-cols-2 gap-6 text-center">
              {/* Kolom Kiri: Kepala Sekolah */}
              <div className="flex flex-col items-center relative">
                <p className="font-normal">Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-20 print:h-18 w-full flex items-center justify-center relative z-30 my-1">
                  {/* Stempel Sekolah: Ukuran 40x40 mm, posisi layer berada di atas menindih nama & tanda tangan Kepala Sekolah */}
                  {schoolStamp && (
                    <div
                      id="school-stamp-preview"
                      className="absolute pointer-events-none z-30 select-none flex items-center justify-center"
                      style={{
                        width: '40mm',
                        height: '40mm',
                        left: '8mm',
                        top: '-8mm',
                        transform: 'rotate(-3deg)',
                      }}
                    >
                      <img
                        src={schoolStamp}
                        alt="Stempel Sekolah"
                        className="w-full h-full object-contain"
                        style={{
                          mixBlendMode: 'multiply',
                        }}
                      />
                    </div>
                  )}
                  {profile.schoolHeadSignatureUrl ? (
                    <img
                      src={profile.schoolHeadSignatureUrl}
                      alt="Tanda Tangan Kepala Sekolah"
                      className="max-h-20 print:max-h-18 max-w-36 object-contain relative z-10"
                    />
                  ) : null}
                </div>
                <p className="font-bold underline underline-offset-2">
                  {profile.schoolHeadName || '...................................................'}
                </p>
                <p className="text-[11px]">
                  NIP. {profile.schoolHeadNip || '...................................................'}
                </p>
              </div>

              {/* Kolom Kanan: Pegawai Yang Bersangkutan */}
              <div className="flex flex-col items-center">
                <p className="font-normal">
                  {profile.cityLocation || 'Bekasi'}, {titimangsaDate}
                </p>
                <p className="font-semibold">Pegawai Yang Bersangkutan,</p>
                <div className="h-20 print:h-18 w-full flex items-center justify-center relative my-1">
                  {profile.signatureUrl ? (
                    <img
                      src={profile.signatureUrl}
                      alt="Tanda Tangan Pegawai"
                      className="max-h-20 print:max-h-18 max-w-36 object-contain"
                    />
                  ) : null}
                </div>
                <p className="font-bold underline underline-offset-2">
                  {profile.name || '...................................................'}
                </p>
                <p className="text-[11px]">
                  NIP. {profile.nip || '...................................................'}
                </p>
              </div>
            </div>
          </div>
          </div>

          {/* 5. FOOTER LEMBAR KERJA DENGAN GARIS PEMISAH */}
          <div className="mt-8 print:mt-2 pt-2 border-t border-black flex items-center justify-between text-[10px] text-slate-800 font-sans print:text-[9px] break-inside-avoid">
            <div className="font-mono tracking-tight font-medium">
              {profile.nip || 'NIP'}_{profile.name || 'Nama Guru'}_{titimangsaDate}
            </div>
            <div className="text-slate-500 italic text-[9px]">
              Jurnal Harian Kerja Pegawai
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
