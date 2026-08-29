import React from 'react';
import { Download, Cloud, CloudOff, RefreshCw, UserCheck, LogIn, Phone, ExternalLink } from 'lucide-react';
import sikawanLogoImg from '../assets/images/sikawan_logo_1788023332948.jpg';

interface HeaderProps {
  onExportPdf: () => void;
  isExporting: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
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
    <header className="bg-[#1b4db3] text-white shadow-lg sticky top-0 z-40">
      {/* Top Banner Row matching reference screenshot */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: SIJUNAWAN Logo and Title */}
        <div className="flex items-center gap-3.5">
          {/* Logo Badge */}
          <div 
            id="header-app-logo"
            className="w-13 h-13 sm:w-14 sm:h-14 bg-white/95 rounded-2xl p-0.5 shadow-md shrink-0 flex items-center justify-center border-2 border-amber-300/80 overflow-hidden hover:scale-105 transition-transform"
          >
            <img 
              src={sikawanLogoImg} 
              alt="Logo Informasi Jurnal Sikawan Harian" 
              className="w-full h-full object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
              Informasi Jurnal Sikawan Harian
            </h1>
            <div className="text-[11px] sm:text-xs text-blue-100 mt-0.5 leading-snug">
              <span className="opacity-90">Aplikasi ini dibuat oleh : </span>
              <span className="font-semibold text-amber-200">SAMSUDIN</span>
              <div className="flex items-center gap-2 mt-0.5">
                <a 
                  href="https://wa.me/628561240622?text=Halo%20Pak%20Samsudin,%20saya%20menggunakan%20aplikasi%20Informasi%20Jurnal%20Sikawan%20Harian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition-colors underline"
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
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-[11px]">
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />
                <span className="text-amber-200">Menyimpan...</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-200">Firebase Realtime Aktif</span>
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-800/80 hover:bg-blue-700 text-blue-100 rounded-lg text-xs font-medium border border-blue-400/30 transition-all cursor-pointer"
            title="Kelola Akun & Sinkronisasi"
          >
            {currentUser && !currentUser.isAnonymous ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[110px] truncate">{currentUser.displayName || currentUser.email || 'Akun'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Akun Cloud</span>
              </>
            )}
          </button>

          {/* Mobile Tab View Toggle (Form vs Preview) */}
          <div className="flex lg:hidden bg-blue-900/80 p-0.5 rounded-lg border border-blue-400/40 text-xs font-medium">
            <button
              onClick={() => setActiveViewMobile('form')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeViewMobile === 'form' 
                  ? 'bg-white text-blue-900 shadow-xs font-semibold' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveViewMobile('preview')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeViewMobile === 'preview' 
                  ? 'bg-white text-blue-900 shadow-xs font-semibold' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Lihat PDF
            </button>
          </div>

          {/* Red "Simpan PDF" button matching reference image */}
          <button
            id="btn-export-pdf-header"
            onClick={onExportPdf}
            disabled={isExporting}
            className="bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-75 cursor-pointer"
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
