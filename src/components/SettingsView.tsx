import React, { useRef, useState } from 'react';
import { 
  User, 
  Building2, 
  FileCheck2, 
  Upload, 
  Trash2, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  Download, 
  FileUp,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  Stamp
} from 'lucide-react';
import { UserProfile, SchoolSettings } from '../types/journal';
import { ExcelStaffTable } from './ExcelStaffTable';

interface SettingsViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  schoolSettings: SchoolSettings;
  setSchoolSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  staffList?: Partial<UserProfile>[];
  setStaffList?: React.Dispatch<React.SetStateAction<Partial<UserProfile>[]>>;
  onSaveToCloud: () => Promise<void>;
  isSaving: boolean;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  setProfile,
  schoolSettings,
  setSchoolSettings,
  staffList,
  setStaffList,
  onSaveToCloud,
  isSaving,
  onResetDefaults,
}) => {
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const employeeSigInputRef = useRef<HTMLInputElement | null>(null);
  const schoolHeadSigInputRef = useRef<HTMLInputElement | null>(null);
  const schoolStampInputRef = useRef<HTMLInputElement | null>(null);
  const kopImageInputRef = useRef<HTMLInputElement | null>(null);
  const logoLeftRef = useRef<HTMLInputElement | null>(null);
  const logoRightRef = useRef<HTMLInputElement | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveWithFeedback = async () => {
    await onSaveToCloud();
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 4000);
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('sijunawan_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSchoolChange = (field: keyof SchoolSettings, value: any) => {
    setSchoolSettings((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('sijunawan_school', JSON.stringify(updated));
      return updated;
    });
  };

  // Image compressor for Pas Foto and Logos
  const handleImageUpload = (
    file: File, 
    callback: (base64: string) => void,
    maxDim = 500
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/png', 0.85));
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Export full backup JSON
  const handleExportBackup = () => {
    const backupData = {
      profile,
      schoolSettings,
      exportedAt: new Date().toISOString(),
      app: 'SIJUNAWAN',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIJUNAWAN_Backup_Pengaturan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.schoolSettings) setSchoolSettings(data.schoolSettings);
        alert('Pengaturan berhasil dipulihkan dari file backup!');
      } catch (err) {
        alert('Format file backup tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Notification Banner if recently saved */}
      {justSaved && (
        <div className="bg-emerald-600 text-white px-4 py-3.5 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-700/25 border border-emerald-400/40 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-lg bg-emerald-700/80 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>(SIMPAN BERHASIL)</span>
                <span className="text-[11px] font-normal bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Cloud &amp; Lokal Tersinkron
                </span>
              </h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                Semua data profil, data kepala sekolah, tanda tangan, dan kop surat telah berhasil disimpan!
              </p>
            </div>
          </div>
          <button
            onClick={() => setJustSaved(false)}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Dokumen &amp; Profil Pegawai</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data ini akan otomatis tercetak pada Kop Surat, Biodata, dan Lembar Tanda Tangan Jurnal Harian.
          </p>
        </div>

        <button
          id="btn-save-settings-cloud"
          onClick={handleSaveWithFeedback}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Cloud...</span>
            </>
          ) : justSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-100">(SIMPAN BERHASIL)</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </div>

      {/* 0. Excel Import/Export & Master Data Table */}
      <ExcelStaffTable
        profile={profile}
        setProfile={setProfile}
        schoolSettings={schoolSettings}
        staffList={staffList}
        setStaffList={setStaffList}
        onSaveToCloud={onSaveToCloud}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Data Identitas Pegawai */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Data Pegawai / Guru</span>
            </h3>
          </div>

          {/* Pas Foto Upload */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="w-20 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-white overflow-hidden shrink-0 relative">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Pas Foto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-slate-400 font-medium text-center">Pas Foto 3x4</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-700 block">Foto Pegawai</span>
              <p className="text-[11px] text-slate-500">Akan tampil di kotak foto lembar jurnal F4.</p>
              
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0], (b64) => handleProfileChange('photoUrl', b64), 600);
                  }
                }}
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  {profile.photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                </button>
                {profile.photoUrl && (
                  <button
                    type="button"
                    onClick={() => handleProfileChange('photoUrl', '')}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap (dengan Gelar)
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap beserta gelar..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Pegawai
              </label>
              <input
                type="text"
                value={profile.nip}
                onChange={(e) => handleProfileChange('nip', e.target.value)}
                placeholder="Masukkan NIP (contoh: 198506152010011025)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={profile.position}
                onChange={(e) => handleProfileChange('position', e.target.value)}
                placeholder="Contoh: Guru Kelas / Guru Mata Pelajaran"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Kerja (Sekolah / Instansi)
              </label>
              <input
                type="text"
                value={profile.unitWork}
                onChange={(e) => handleProfileChange('unitWork', e.target.value)}
                placeholder="Contoh: SDN Babelan Kota 01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pangkat / Golongan
                </label>
                <input
                  type="text"
                  value={profile.rankGrade}
                  onChange={(e) => handleProfileChange('rankGrade', e.target.value)}
                  placeholder="Contoh: Penata Muda / III/a"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pegawai
                </label>
                <input
                  type="text"
                  value={profile.employeeStatus}
                  onChange={(e) => handleProfileChange('employeeStatus', e.target.value)}
                  placeholder="PNS / PPPK / Honorer"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Upload Tanda Tangan Pegawai */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanda Tangan Pegawai Yang Bersangkutan
              </label>
              <input
                type="file"
                accept="image/*"
                ref={employeeSigInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(
                      e.target.files[0],
                      (b64) => handleProfileChange('signatureUrl', b64),
                      600
                    );
                  }
                }}
              />

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-28 h-14 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {profile.signatureUrl ? (
                    <img
                      src={profile.signatureUrl}
                      alt="TTD Pegawai"
                      className="max-h-12 max-w-24 object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium text-center">Belum ada TTD</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] text-slate-500">
                    Otomatis menempel pada kolom TTD Pegawai di Jurnal Harian.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => employeeSigInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium cursor-pointer"
                    >
                      {profile.signatureUrl ? 'Ganti TTD' : 'Upload TTD'}
                    </button>
                    {profile.signatureUrl && (
                      <button
                        type="button"
                        onClick={() => handleProfileChange('signatureUrl', '')}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Hapus Tanda Tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Data Kepala Sekolah & Kop Surat */}
        <div className="space-y-6">
          {/* Kepala Sekolah & Lokasi */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>2. Pejabat Penandatangan</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={profile.schoolHeadName}
                  onChange={(e) => handleProfileChange('schoolHeadName', e.target.value)}
                  placeholder="Masukkan nama Kepala Sekolah beserta gelar..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={profile.schoolHeadNip}
                  onChange={(e) => handleProfileChange('schoolHeadNip', e.target.value)}
                  placeholder="Masukkan NIP Kepala Sekolah (contoh: 197501012000031005)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Tempat Tanda Tangan
                </label>
                <input
                  type="text"
                  value={profile.cityLocation}
                  onChange={(e) => handleProfileChange('cityLocation', e.target.value)}
                  placeholder="Contoh: Bekasi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload Tanda Tangan Kepala Sekolah */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanda Tangan Kepala Sekolah
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={schoolHeadSigInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(
                        e.target.files[0],
                        (b64) => handleProfileChange('schoolHeadSignatureUrl', b64),
                        600
                      );
                    }
                  }}
                />

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-28 h-14 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {profile.schoolHeadSignatureUrl ? (
                      <img
                        src={profile.schoolHeadSignatureUrl}
                        alt="TTD Kepala Sekolah"
                        className="max-h-12 max-w-24 object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium text-center">Belum ada TTD</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-500">
                      Otomatis menempel pada kolom TTD Kepala Sekolah di Jurnal Harian.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => schoolHeadSigInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium cursor-pointer"
                      >
                        {profile.schoolHeadSignatureUrl ? 'Ganti TTD' : 'Upload TTD'}
                      </button>
                      {profile.schoolHeadSignatureUrl && (
                        <button
                          type="button"
                          onClick={() => handleProfileChange('schoolHeadSignatureUrl', '')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Hapus Tanda Tangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Stempel Sekolah */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-purple-600" />
                    <span>Stempel Sekolah (Cap Resmi Lembaga)</span>
                  </label>
                  <span className="text-[10px] text-purple-700 bg-purple-50 font-medium px-2 py-0.5 rounded-full border border-purple-200">
                    Menempel di Kiri Kepala Sekolah
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={schoolStampInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(
                        e.target.files[0],
                        (b64) => {
                          handleSchoolChange('schoolStampUrl', b64);
                          handleProfileChange('schoolStampUrl', b64);
                        },
                        600
                      );
                    }
                  }}
                />

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-24 h-16 border border-dashed border-purple-300 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                    {(schoolSettings.schoolStampUrl || profile.schoolStampUrl) ? (
                      <img
                        src={schoolSettings.schoolStampUrl || profile.schoolStampUrl}
                        alt="Stempel Sekolah"
                        className="max-h-14 max-w-20 object-contain drop-shadow-xs"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 text-slate-400">
                        <Stamp className="w-4 h-4 text-purple-400" />
                        <span className="text-[9px] font-medium text-center">Belum ada</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Stempel otomatis ditempatkan <strong>berukuran 40x40 mm menggeser ke kanan mengenai tanda tangan Kepala Sekolah</strong> pada Lembar Kerja &amp; cetak PDF.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Disarankan file format PNG transparan atau foto cap stempel yang jelas.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => schoolStampInputRef.current?.click()}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{(schoolSettings.schoolStampUrl || profile.schoolStampUrl) ? 'Ganti Stempel' : 'Upload Stempel Sekolah'}</span>
                      </button>
                      {(schoolSettings.schoolStampUrl || profile.schoolStampUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleSchoolChange('schoolStampUrl', '');
                            handleProfileChange('schoolStampUrl', '');
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                          title="Hapus Stempel Sekolah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kop Surat Setting & Upload Kop Sekolah */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>3. Kop Surat Kedinasan &amp; Kop Sekolah</span>
              </h3>
            </div>

            {/* Selector: Mode Teks & Logo vs Gambar Kop Utuh */}
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex gap-1">
              <button
                type="button"
                onClick={() => handleSchoolChange('kopMode', 'text')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  (schoolSettings.kopMode || 'text') === 'text'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Format Teks &amp; Logo
              </button>
              <button
                type="button"
                onClick={() => handleSchoolChange('kopMode', 'image')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  schoolSettings.kopMode === 'image'
                    ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Gambar Kop Sekolah</span>
              </button>
            </div>

            {/* TAB A: UPLOAD GAMBAR KOP SEKOLAH UTUH */}
            {schoolSettings.kopMode === 'image' && (
              <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200/70">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Berkas Gambar Kop Sekolah (Banner Utuh)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Gunakan hasil scan atau file gambar Kop Surat resmi sekolah Anda (Format PNG/JPG/WebP).
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={kopImageInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(
                        e.target.files[0],
                        (b64) => handleSchoolChange('customKopImage', b64),
                        1800
                      );
                    }
                  }}
                />

                {schoolSettings.customKopImage ? (
                  <div className="space-y-2">
                    <div className="border border-purple-300 rounded-lg p-2 bg-white flex items-center justify-center overflow-hidden max-h-36">
                      <img
                        src={schoolSettings.customKopImage}
                        alt="Preview Kop Sekolah"
                        className="max-h-32 w-auto object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Gambar Kop Aktif &amp; Siap Dicetak
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => kopImageInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          Ganti Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSchoolChange('customKopImage', '')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Hapus gambar kop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => kopImageInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Klik untuk Unggah Gambar Kop Sekolah</p>
                      <p className="text-[11px] text-slate-500">Rekomendasi rasio ~5:1 atau lebar 1200 - 1800 px</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: FORMAT TEKS & DUAL LOGO KOP SURAT */}
            {(!schoolSettings.kopMode || schoolSettings.kopMode === 'text') && (
              <div className="space-y-3">
                {/* Upload Logos (Kiri: Pemkab/Daerah, Kanan: Disdik/Tut Wuri/Sekolah) */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {/* Logo Kiri */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Logo Kiri (Pemda)</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={logoLeftRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0], (b64) => handleSchoolChange('customLogoLeft', b64), 500);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-14 border border-slate-300 rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {schoolSettings.customLogoLeft ? (
                          <img src={schoolSettings.customLogoLeft} alt="Logo Kiri" className="max-h-12 max-w-10 object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-center leading-tight">Default Bekasi</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => logoLeftRef.current?.click()}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[10px] font-medium cursor-pointer"
                        >
                          {schoolSettings.customLogoLeft ? 'Ganti' : 'Upload'}
                        </button>
                        {schoolSettings.customLogoLeft && (
                          <button
                            type="button"
                            onClick={() => handleSchoolChange('customLogoLeft', '')}
                            className="block text-[10px] text-rose-600 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logo Kanan */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Logo Kanan (Disdik/Sekolah)</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={logoRightRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0], (b64) => handleSchoolChange('customLogoRight', b64), 500);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-14 border border-slate-300 rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {schoolSettings.customLogoRight ? (
                          <img src={schoolSettings.customLogoRight} alt="Logo Kanan" className="max-h-12 max-w-10 object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-center leading-tight">Default Disdik</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => logoRightRef.current?.click()}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[10px] font-medium cursor-pointer"
                        >
                          {schoolSettings.customLogoRight ? 'Ganti' : 'Upload'}
                        </button>
                        {schoolSettings.customLogoRight && (
                          <button
                            type="button"
                            onClick={() => handleSchoolChange('customLogoRight', '')}
                            className="block text-[10px] text-rose-600 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Header Baris 1 (Pemerintah Daerah)
                  </label>
                  <input
                    type="text"
                    value={schoolSettings.govName}
                    onChange={(e) => handleSchoolChange('govName', e.target.value)}
                    placeholder="PEMERINTAH KABUPATEN BEKASI"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Header Baris 2 (Dinas Terkait)
                  </label>
                  <input
                    type="text"
                    value={schoolSettings.deptName}
                    onChange={(e) => handleSchoolChange('deptName', e.target.value)}
                    placeholder="DINAS PENDIDIKAN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Header Baris 3 (Nama Satuan Pendidikan / Sekolah)
                  </label>
                  <input
                    type="text"
                    value={schoolSettings.subUnitName || ''}
                    onChange={(e) => handleSchoolChange('subUnitName', e.target.value)}
                    placeholder="Contoh: SD NEGERI BABELAN KOTA 01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap &amp; Kontak Sekolah (Baris Bawah Kop)
                  </label>
                  <input
                    type="text"
                    value={schoolSettings.address || ''}
                    onChange={(e) => handleSchoolChange('address', e.target.value)}
                    placeholder="Contoh: Jl. Raya Babelan No. 12, Kec. Babelan, Kab. Bekasi - Telp: (021) 89123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Backup, Sinkronisasi & Pemulihan Data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-amber-600" />
          <span>4. Backup &amp; Keamanan Data</span>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-700">Ekspor &amp; Impor Cadangan Data</p>
            <p className="text-[11px] text-slate-500">
              Simpan berkas konfigurasi akun dan profil Anda ke dalam komputer/HP agar selalu aman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              ref={backupFileInputRef}
              className="hidden"
              onChange={handleImportBackup}
            />

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Backup</span>
            </button>

            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Pulihkan Backup</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset data profil dan kop surat ke pengaturan awal?')) {
                  onResetDefaults();
                }
              }}
              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Reset Default
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky / Prominent Save Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-blue-800/60">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 shrink-0 hidden sm:block">
            <Save className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">Simpan Seluruh Konfigurasi Dokumen</h4>
            <p className="text-xs text-blue-200">
              Perubahan pada Data Guru, Kepala Sekolah, Tanda Tangan, dan Kop Surat akan diterapkan ke seluruh Jurnal.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveWithFeedback}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-70 shrink-0"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Cloud...</span>
            </>
          ) : justSaved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-100">(SIMPAN BERHASIL)</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
