import React, { useRef, useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Users, 
  Sparkles,
  Info,
  CheckCircle2,
  UserPlus,
  Plus
} from 'lucide-react';
import { UserProfile, SchoolSettings } from '../types/journal';
import { downloadStaffExcelTemplate, parseStaffExcelFile } from '../utils/excelHelper';

interface ExcelStaffTableProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  schoolSettings: SchoolSettings;
  staffList?: Partial<UserProfile>[];
  setStaffList?: React.Dispatch<React.SetStateAction<Partial<UserProfile>[]>>;
  onSaveToCloud: () => Promise<void>;
  isSaving: boolean;
}

export const ExcelStaffTable: React.FC<ExcelStaffTableProps> = ({
  profile,
  setProfile,
  schoolSettings,
  staffList,
  setStaffList,
  onSaveToCloud,
  isSaving,
}) => {
  const excelFileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // List of imported staff rows from Excel if multi-row spreadsheet
  const [importedStaffList, setImportedStaffList] = useState<Partial<UserProfile>[]>(() => {
    if (staffList && staffList.length > 0) return staffList;
    const savedList = localStorage.getItem('sijunawan_staff_list');
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<UserProfile>>({
    name: '',
    nip: '',
    position: 'Guru Kelas',
    unitWork: schoolSettings.subUnitName || 'SDN Babelan Kota 01',
    rankGrade: 'Penata Muda / III/a',
    employeeStatus: 'PNS',
    schoolHeadName: profile.schoolHeadName || 'NAMA KEPALA SEKOLAH, M.Pd',
    schoolHeadNip: profile.schoolHeadNip || '197501012000031005',
    cityLocation: profile.cityLocation || 'Bekasi',
  });

  const handleDownloadTemplate = () => {
    try {
      downloadStaffExcelTemplate();
      setImportStatus({
        type: 'success',
        message: 'Format Excel berhasil diunduh! Silakan isi data dan unggah kembali.',
      });
      setTimeout(() => setImportStatus(null), 5000);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: 'Gagal mengunduh format Excel: ' + (err.message || 'Kesalahan sistem'),
      });
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus({
        type: 'info',
        message: 'Sedang membaca file Excel...',
      });

      const parsedRows = await parseStaffExcelFile(file);
      if (parsedRows.length === 0) {
        throw new Error('Tidak ditemukan data baris pegawai di file Excel tersebut.');
      }

      // Save the parsed staff list
      setImportedStaffList(parsedRows);
      if (setStaffList) {
        setStaffList(parsedRows);
      }
      localStorage.setItem('sijunawan_staff_list', JSON.stringify(parsedRows));

      // Apply first row immediately as active profile
      const first = parsedRows[0];
      setProfile((prev) => {
        const updated: UserProfile = {
          ...prev,
          name: first.name ?? prev.name,
          nip: first.nip ?? prev.nip,
          position: first.position ?? prev.position,
          unitWork: first.unitWork ?? prev.unitWork,
          rankGrade: first.rankGrade ?? prev.rankGrade,
          employeeStatus: first.employeeStatus ?? prev.employeeStatus,
          schoolHeadName: first.schoolHeadName ?? prev.schoolHeadName,
          schoolHeadNip: first.schoolHeadNip ?? prev.schoolHeadNip,
          cityLocation: first.cityLocation ?? prev.cityLocation,
        };
        // Persist immediately to localStorage
        localStorage.setItem('sijunawan_profile', JSON.stringify(updated));
        return updated;
      });

      setImportStatus({
        type: 'success',
        message: `Berhasil mengimpor ${parsedRows.length} data Guru/Pegawai dari Excel! Data telah diterapkan dan tersimpan di Master Data Pegawai.`,
      });

      // Auto trigger cloud save to ensure permanence
      onSaveToCloud();

      // Reset file input
      if (excelFileInputRef.current) {
        excelFileInputRef.current.value = '';
      }

      setTimeout(() => setImportStatus(null), 6000);
    } catch (err: any) {
      console.error('Import excel error:', err);
      setImportStatus({
        type: 'error',
        message: 'Gagal mengimpor file Excel: ' + (err.message || 'Pastikan format kolom sesuai'),
      });
    }
  };

  const handleSelectStaffRow = (staff: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        name: staff.name ?? prev.name,
        nip: staff.nip ?? prev.nip,
        position: staff.position ?? prev.position,
        unitWork: staff.unitWork ?? prev.unitWork,
        rankGrade: staff.rankGrade ?? prev.rankGrade,
        employeeStatus: staff.employeeStatus ?? prev.employeeStatus,
        schoolHeadName: staff.schoolHeadName ?? prev.schoolHeadName,
        schoolHeadNip: staff.schoolHeadNip ?? prev.schoolHeadNip,
        cityLocation: staff.cityLocation ?? prev.cityLocation,
      };
      localStorage.setItem('sijunawan_profile', JSON.stringify(updated));
      return updated;
    });

    setImportStatus({
      type: 'success',
      message: `Profil aktif diubah menjadi: ${staff.name || 'Pegawai terpilih'}`,
    });
    onSaveToCloud();
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleClearTableList = () => {
    if (window.confirm('Hapus daftar impor tabel excel ini? Data aktif di formulir tetap tersimpan.')) {
      setImportedStaffList([]);
      if (setStaffList) {
        setStaffList([]);
      }
      localStorage.removeItem('sijunawan_staff_list');
    }
  };

  const handleAddManualStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name?.trim()) {
      alert('Mohon masukkan Nama Guru / Pegawai');
      return;
    }

    const updatedList = [...displayRows, newStaff];
    setImportedStaffList(updatedList);
    if (setStaffList) {
      setStaffList(updatedList);
    }
    localStorage.setItem('sijunawan_staff_list', JSON.stringify(updatedList));
    setIsAddFormOpen(false);
    setNewStaff({
      name: '',
      nip: '',
      position: 'Guru Kelas',
      unitWork: schoolSettings.subUnitName || 'SDN Babelan Kota 01',
      rankGrade: 'Penata Muda / III/a',
      employeeStatus: 'PNS',
      schoolHeadName: profile.schoolHeadName || 'NAMA KEPALA SEKOLAH, M.Pd',
      schoolHeadNip: profile.schoolHeadNip || '197501012000031005',
      cityLocation: profile.cityLocation || 'Bekasi',
    });
    setImportStatus({
      type: 'success',
      message: `Guru ${newStaff.name} berhasil ditambahkan ke Master Data Pegawai!`,
    });
    onSaveToCloud();
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleDeleteStaffRow = (indexToDelete: number) => {
    const staff = displayRows[indexToDelete];
    if (window.confirm(`Hapus ${staff.name || 'guru ini'} dari Tabel Master Data Pegawai?`)) {
      const updatedList = displayRows.filter((_, idx) => idx !== indexToDelete);
      setImportedStaffList(updatedList);
      if (setStaffList) {
        setStaffList(updatedList);
      }
      localStorage.setItem('sijunawan_staff_list', JSON.stringify(updatedList));
      setImportStatus({
        type: 'info',
        message: `Data pegawai berhasil dihapus.`,
      });
      onSaveToCloud();
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  // Compile rows to display: either staffList / imported list or current profile
  const displayRows = (staffList && staffList.length > 0)
    ? staffList
    : importedStaffList.length > 0 
    ? importedStaffList 
    : [
        {
          name: profile.name,
          nip: profile.nip,
          position: profile.position,
          unitWork: profile.unitWork,
          rankGrade: profile.rankGrade,
          employeeStatus: profile.employeeStatus,
          schoolHeadName: profile.schoolHeadName,
          schoolHeadNip: profile.schoolHeadNip,
          cityLocation: profile.cityLocation,
        }
      ];

  const hasAnyData = profile.name || profile.nip || profile.schoolHeadName || displayRows.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <span>Format Excel &amp; Tabel Master Data Pegawai / Pejabat</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Excel (.xlsx, .csv)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Impor dan ekspor data Pegawai, Guru, dan Kepala Sekolah secara instan dan tersimpan permanen.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Manual Teacher Button */}
          <button
            type="button"
            onClick={() => setIsAddFormOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Tambah data guru/pegawai secara manual ke Master Data"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Guru</span>
          </button>

          {/* Download Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="Unduh Format Template Excel Kosong/Contoh"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh Format Excel</span>
          </button>

          {/* Hidden File Input for Excel */}
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={excelFileInputRef}
            className="hidden"
            onChange={handleFileImport}
          />

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => excelFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Unggah dan impor file Excel ke aplikasi"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor dari Excel</span>
          </button>
        </div>
      </div>

      {/* Status / Alert Message */}
      {importStatus && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border animate-in fade-in duration-200 ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : importStatus.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : importStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Master Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Tabel Master Data Pegawai &amp; Pejabat Penandatangan ({displayRows.length} Baris Data)</span>
          </span>
          {importedStaffList.length > 0 && (
            <button
              onClick={handleClearTableList}
              className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer font-normal"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan Daftar Impor</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[170px]">Nama Pegawai / Guru</th>
                <th className="py-2.5 px-3 min-w-[140px]">NIP Pegawai</th>
                <th className="py-2.5 px-3 min-w-[130px]">Jabatan</th>
                <th className="py-2.5 px-3 min-w-[140px]">Unit Kerja</th>
                <th className="py-2.5 px-3 min-w-[110px]">Pangkat/Gol</th>
                <th className="py-2.5 px-3 min-w-[90px]">Status</th>
                <th className="py-2.5 px-3 min-w-[160px]">Kepala Sekolah</th>
                <th className="py-2.5 px-3 min-w-[140px]">NIP KS</th>
                <th className="py-2.5 px-3 min-w-[90px]">Kota</th>
                <th className="py-2.5 px-3 text-center min-w-[100px]">Aksi / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {displayRows.map((row, idx) => {
                const isActive = (row.name === profile.name && row.nip === profile.nip) || displayRows.length === 1;
                const isRowEmpty = !row.name && !row.nip && !row.schoolHeadName;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isActive ? 'bg-blue-50/50 font-medium text-slate-900' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {row.name || (
                        <span className="text-slate-400 italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.nip || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.position || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.unitWork || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.rankGrade || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.employeeStatus ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {row.employeeStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {row.schoolHeadName || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.schoolHeadNip || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.cityLocation || 'Bekasi'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <Check className="w-3 h-3" />
                            <span>Sedang Aktif</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectStaffRow(row)}
                            className="px-2 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-400 rounded-md text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                            title="Aktifkan data pegawai ini"
                          >
                            Pilih
                          </button>
                        )}
                        {displayRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteStaffRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus baris pegawai ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!hasAnyData && displayRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    <p className="font-medium">Belum ada data pegawai atau kepala sekolah.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Klik <strong>Unduh Format Excel</strong> lalu <strong>Impor dari Excel</strong> atau isi formulir di bawah ini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-slate-600 text-[11px]">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Tips:</strong> Data yang diimpor dari Excel atau diubah di formulir akan <strong>otomatis tersimpan permanen di memori &amp; Cloud</strong> sehingga tidak akan hilang atau reset saat halaman di-refresh.
          </span>
        </div>
      </div>

      {/* Modal Tambah Guru Manual */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                  Tambah Guru / Pegawai ke Master Data
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualStaff} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Guru / Pegawai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SAMSUDIN, S.Pd"
                  value={newStaff.name || ''}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    placeholder="198506152010011025 atau -"
                    value={newStaff.nip || ''}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, nip: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Guru Kelas V"
                    value={newStaff.position || ''}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penata / III/c"
                    value={newStaff.rankGrade || ''}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, rankGrade: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Kepegawaian</label>
                  <select
                    value={newStaff.employeeStatus || 'PNS'}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, employeeStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Guru Honorer">Guru Honorer</option>
                    <option value="Tenaga Honorer">Tenaga Honorer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Unit Kerja / Sekolah</label>
                <input
                  type="text"
                  placeholder="Contoh: SDN Babelan Kota 01"
                  value={newStaff.unitWork || ''}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, unitWork: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Guru ke Master Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
