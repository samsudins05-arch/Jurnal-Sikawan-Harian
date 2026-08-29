import * as XLSX from 'xlsx';
import { UserProfile, SchoolSettings } from '../types/journal';

export interface ExcelStaffRow {
  'No'?: number | string;
  'Nama Pegawai / Guru': string;
  'NIP Pegawai': string;
  'Jabatan': string;
  'Unit Kerja': string;
  'Pangkat / Golongan': string;
  'Status Pegawai': string;
  'Nama Kepala Sekolah': string;
  'NIP Kepala Sekolah': string;
  'Kota / Titimangsa': string;
}

/**
 * Downloads a pre-formatted Excel template for Pegawai & Pejabat Penandatangan
 */
export function downloadStaffExcelTemplate(): void {
  const sampleData: ExcelStaffRow[] = [
    {
      'No': 1,
      'Nama Pegawai / Guru': 'SAMSUDIN, S.Pd',
      'NIP Pegawai': '198506152010011025',
      'Jabatan': 'Guru Kelas',
      'Unit Kerja': 'SDN Babelan Kota 01',
      'Pangkat / Golongan': 'Penata / III/c',
      'Status Pegawai': 'PNS',
      'Nama Kepala Sekolah': 'NAMA KEPALA SEKOLAH, M.Pd',
      'NIP Kepala Sekolah': '197501012000031005',
      'Kota / Titimangsa': 'Bekasi',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for nice appearance
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 30 }, // Nama Pegawai
    { wch: 22 }, // NIP Pegawai
    { wch: 24 }, // Jabatan
    { wch: 26 }, // Unit Kerja
    { wch: 22 }, // Pangkat/Golongan
    { wch: 18 }, // Status Pegawai
    { wch: 30 }, // Nama Kepala Sekolah
    { wch: 22 }, // NIP Kepala Sekolah
    { wch: 18 }, // Kota
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai & Pejabat');

  XLSX.writeFile(workbook, 'Format_Data_Pegawai_Pejabat.xlsx');
}

/**
 * Exports current active profile & school data to Excel file
 */
export function exportStaffDataToExcel(profile: UserProfile, schoolSettings?: SchoolSettings): void {
  const exportData: ExcelStaffRow[] = [
    {
      'No': 1,
      'Nama Pegawai / Guru': profile.name || '',
      'NIP Pegawai': profile.nip || '',
      'Jabatan': profile.position || '',
      'Unit Kerja': profile.unitWork || schoolSettings?.subUnitName || '',
      'Pangkat / Golongan': profile.rankGrade || '',
      'Status Pegawai': profile.employeeStatus || '',
      'Nama Kepala Sekolah': profile.schoolHeadName || '',
      'NIP Kepala Sekolah': profile.schoolHeadNip || '',
      'Kota / Titimangsa': profile.cityLocation || 'Bekasi',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 22 },
    { wch: 24 },
    { wch: 26 },
    { wch: 22 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai');

  const safeName = (profile.name || 'Pegawai').replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `Data_Pegawai_${safeName}.xlsx`);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls, .csv) file and extracts staff & headmaster data
 */
export async function parseStaffExcelFile(file: File): Promise<Partial<UserProfile>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('File Excel kosong atau tidak memiliki data.');
        }

        const parsedProfiles: Partial<UserProfile>[] = jsonRows.map((row) => {
          // Flexible key lookup to support multiple naming styles in headers
          const name = row['Nama Pegawai / Guru'] || row['Nama Pegawai'] || row['Nama Guru'] || row['Nama'] || row['NAMA'] || '';
          const nip = String(row['NIP Pegawai'] || row['NIP Guru'] || row['NIP'] || '').trim();
          const position = row['Jabatan'] || row['JABATAN'] || row['Posisi'] || '';
          const unitWork = row['Unit Kerja'] || row['UNIT KERJA'] || row['Sekolah'] || row['Instansi'] || '';
          const rankGrade = row['Pangkat / Golongan'] || row['Pangkat/Golongan'] || row['Pangkat'] || row['Golongan'] || '';
          const employeeStatus = row['Status Pegawai'] || row['Status'] || row['STATUS'] || '';
          const schoolHeadName = row['Nama Kepala Sekolah'] || row['Kepala Sekolah'] || row['Nama KS'] || '';
          const schoolHeadNip = String(row['NIP Kepala Sekolah'] || row['NIP KS'] || '').trim();
          const cityLocation = row['Kota / Titimangsa'] || row['Kota'] || row['Titimangsa'] || 'Bekasi';

          return {
            name: String(name).trim(),
            nip,
            position: String(position).trim(),
            unitWork: String(unitWork).trim(),
            rankGrade: String(rankGrade).trim(),
            employeeStatus: String(employeeStatus).trim(),
            schoolHeadName: String(schoolHeadName).trim(),
            schoolHeadNip,
            cityLocation: String(cityLocation).trim(),
          };
        });

        resolve(parsedProfiles);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
