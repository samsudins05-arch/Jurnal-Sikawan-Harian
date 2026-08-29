import React, { useState } from 'react';
import { 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  FileCheck,
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
  onExportPdf: () => void;
  isExporting: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedDate,
  activities,
  profile,
  schoolSettings,
  onExportPdf,
  isExporting,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const formattedDate = parseDateStrToIndonesian(selectedDate) || 'Jumat, 28 Agustus 2026';
  const titimangsaDate = parseDateStrToIndonesianNoDay(selectedDate) || '28 Agustus 2026';

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Toolbar for document preview */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Pratinjau Lembar Kerja A4</span>
          </span>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
            {zoomLevel}%
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
            title="Reset Ukuran (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Cetak Dokumen Langsung"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Red Download PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-70"
            title="Download Dokumen A4 dalam format PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Proses...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Viewport Container */}
      <div className="flex-1 bg-slate-600/20 backdrop-blur-xs rounded-2xl p-2 sm:p-6 overflow-auto flex justify-center items-start min-h-[600px] border border-slate-300/40">
        {/* The Authentic A4 Printable Page */}
        <div
          id="printable-journal-sheet"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: '210mm',
            minHeight: '297mm',
            fontFamily: "'Tinos', 'Times New Roman', Times, serif",
            paddingTop: '1.2cm',
            paddingRight: '1.8cm',
            paddingBottom: '1.2cm',
            paddingLeft: '1.8cm',
            boxSizing: 'border-box',
          }}
          className="bg-white text-black shadow-2xl rounded-sm leading-snug shrink-0 print:shadow-none print:m-0 print:w-full print:transform-none select-text flex flex-col justify-between"
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
          <div className="mb-6">
            <table className="w-full border-collapse border border-black text-[11px] sm:text-[12px]">
              <thead>
                <tr className="bg-slate-100/75 text-center font-bold">
                  <th className="border border-black py-2 px-1 w-[6%]">No</th>
                  <th className="border border-black py-2 px-2 w-[18%]">Waktu</th>
                  <th className="border border-black py-2 px-3 w-[42%] text-center">Kegiatan</th>
                  <th className="border border-black py-2 px-2 w-[20%] text-center">Bukti Dukung</th>
                  <th className="border border-black py-2 px-2 w-[14%] text-center">Ket.</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td className="border border-black py-2 px-1 text-center font-mono">1</td>
                    <td className="border border-black py-2 px-2 text-center">06:30 - 07:30</td>
                    <td className="border border-black py-2 px-3">-</td>
                    <td className="border border-black py-2 px-2 text-center">-</td>
                    <td className="border border-black py-2 px-2 text-center"></td>
                  </tr>
                ) : (
                  activities.map((item, idx) => (
                    <tr key={item.id || idx} className="align-top">
                      <td className="border border-black py-2 px-1 text-center font-semibold">
                        {idx + 1}
                      </td>
                      <td className="border border-black py-2 px-2 text-center whitespace-nowrap font-medium">
                        {item.startHour}:{item.startMinute} - {item.endHour}:{item.endMinute}
                      </td>
                      <td className="border border-black py-2 px-3 leading-relaxed">
                        <div className="font-serif whitespace-pre-wrap">{item.activity || '-'}</div>
                      </td>
                      <td className="border border-black py-2 px-2 text-center">
                        {item.photoUrl ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <img
                              src={item.photoUrl}
                              alt="Bukti"
                              className="max-h-20 max-w-28 object-contain border border-slate-300 rounded-xs shadow-2xs"
                            />
                            <span className="text-[9px] font-sans text-slate-600 italic">Foto Terlampir</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans text-[10px]">-</span>
                        )}
                      </td>
                      <td className="border border-black py-2 px-2 text-center leading-tight">
                        <span className="font-serif text-[11px]">{item.notes || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. TANDA TANGAN (SIGNATURES) */}
          <div className="mt-8 pt-4 break-inside-avoid text-[12px] sm:text-[13px]">
            <div className="grid grid-cols-2 gap-6 text-center">
              {/* Kolom Kiri: Kepala Sekolah */}
              <div className="flex flex-col items-center">
                <p className="font-normal">Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-20 w-full flex items-center justify-center relative my-1">
                  {profile.schoolHeadSignatureUrl ? (
                    <img
                      src={profile.schoolHeadSignatureUrl}
                      alt="Tanda Tangan Kepala Sekolah"
                      className="max-h-20 max-w-36 object-contain"
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
                <div className="h-20 w-full flex items-center justify-center relative my-1">
                  {profile.signatureUrl ? (
                    <img
                      src={profile.signatureUrl}
                      alt="Tanda Tangan Pegawai"
                      className="max-h-20 max-w-36 object-contain"
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
          <div className="mt-8 pt-2 border-t border-black flex items-center justify-between text-[10px] text-slate-800 font-sans print:text-[9.5px]">
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
  );
};
