import React from 'react';
import { Download, Cloud, CloudOff, RefreshCw, UserCheck, LogIn, Phone, ExternalLink, HardDrive } from 'lucide-react';

const APP_LOGO_URL = 'https://i.ibb.co.com/zWdzNGqj/logo-bakot-01.png';
const APP_LOGO_FALLBACK = 'https://i.ibb.co/zWdzNGqj/logo-bakot-01.png';

interface HeaderProps {
  onExportPdf: () => void;
  isExporting: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'quota-exhausted';
  currentUser: { email?: string | null; displayName?: string | null; isAnonymous?: boolean } | null;
  onOpenAuth: () => void;
  activeViewMobile: 'form' | 'preview';
  setActiveViewMobile: (view: 'form' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPdf,
  isExporting,
  syncStatus,
  currentUser,
  onOpenAuth,
  activeViewMobile,
  setActiveViewMobile,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#043e2f] text-white shadow-xl shadow-emerald-950/20 border-b-2 border-emerald-500/30 sticky top-0 z-40">
      {/* Top Banner Row matching reference screenshot */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: SIJUNAWAN Logo and Title */}
        <div className="flex items-center gap-3.5">
          {/* Logo Full tanpa bulatan */}
          <div 
            id="header-app-logo"
            className="shrink-0 flex items-center justify-center"
          >
            <img 
              src={APP_LOGO_URL} 
              alt="Logo Informasi Jurnal Sikawan Harian" 
              className="h-13 sm:h-15 w-auto max-w-[90px] sm:max-w-[120px] object-contain drop-shadow-md hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = 'true';
                  target.src = APP_LOGO_FALLBACK;
                }
              }}
            />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-2">
              <span>Informasi Jurnal Sikawan Harian</span>
            </h1>
            <div className="text-[11px] sm:text-xs text-emerald-100 mt-0.5 leading-snug">
              <span className="opacity-90">Aplikasi ini dibuat oleh : </span>
              <span className="font-bold text-amber-300">SAMSUDIN</span>
              <div className="flex items-center gap-2 mt-0.5">
                <a 
                  href="https://wa.me/628561240622?text=Halo%20Pak%20Samsudin,%20saya%20menggunakan%20aplikasi%20Informasi%20Jurnal%20Sikawan%20Harian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-amber-200 font-medium transition-colors underline"
                  title="Hubungi via WhatsApp"
                >
                  <Phone className="w-3 h-3" />
                  WA : 08561240622
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Status */}
        <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto">
          {/* Firebase Real-time Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/30 text-[11px]">
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
                <span className="text-amber-200">Menyimpan...</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-200">Firebase Cloud Aktif</span>
              </>
            ) : syncStatus === 'quota-exhausted' ? (
              <>
                <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-200" title="Batas kuota harian Firebase tercapai. Data tersimpan aman di browser Anda.">Mode Lokal (Kuota Penuh)</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-200">Offline (Lokal)</span>
              </>
            )}
          </div>

          {/* User Profile / Auth Button */}
          <button
            id="btn-auth-user"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 active:bg-emerald-900 text-emerald-50 rounded-lg text-xs font-semibold border border-emerald-400/30 transition-all cursor-pointer shadow-xs"
            title="Kelola Akun & Sinkronisasi"
          >
            {currentUser && !currentUser.isAnonymous ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span className="max-w-[110px] truncate">{currentUser.displayName || currentUser.email || 'Akun'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Akun Cloud</span>
              </>
            )}
          </button>

          {/* Mobile Tab View Toggle (Form vs Preview) */}
          <div className="flex lg:hidden bg-emerald-950/80 p-0.5 rounded-lg border border-emerald-500/40 text-xs font-medium">
            <button
              onClick={() => setActiveViewMobile('form')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeViewMobile === 'form' 
                  ? 'bg-white text-emerald-950 shadow-xs font-bold' 
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveViewMobile('preview')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeViewMobile === 'preview' 
                  ? 'bg-white text-emerald-950 shadow-xs font-bold' 
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Lembar Kerja
            </button>
          </div>

          {/* Red "Simpan PDF" button matching reference image */}
          <button
            id="btn-export-pdf-header"
            onClick={onExportPdf}
            disabled={isExporting}
            className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:from-red-700 active:to-rose-800 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-75 cursor-pointer border border-red-400/30"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
