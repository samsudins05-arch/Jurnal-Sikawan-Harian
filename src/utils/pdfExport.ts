import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toCanvas } from 'html-to-image';

export interface PdfExportResult {
  success: boolean;
  method: 'directDownload' | 'mobileShare' | 'filePicker' | 'printFallback';
  message?: string;
}

/**
 * Render an HTML element to a jsPDF instance
 */
export async function renderElementToJsPdf(
  elementId: string
): Promise<{ pdf: jsPDF; pdfBlob: Blob }> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dokumen dengan ID "${elementId}" tidak ditemukan.`);
  }

  let canvas: HTMLCanvasElement;

  try {
    // Primary: Render using html2canvas-pro with high DPI and oklch/color support
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.margin = '0 auto';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.paddingTop = '1.2cm';
          clonedElement.style.paddingRight = '1.5cm';
          clonedElement.style.paddingBottom = '1.2cm';
          clonedElement.style.paddingLeft = '1.5cm';
          clonedElement.style.boxSizing = 'border-box';
          clonedElement.style.width = '210mm';
          clonedElement.style.minHeight = '330mm';
        }
      },
    });
  } catch (h2cError) {
    console.warn('html2canvas-pro fallback to html-to-image:', h2cError);
    // Fallback: html-to-image
    canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Gagal merender kanvas dokumen PDF.');
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
  // F4 (Folio) dimensions in mm (210 x 330)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 330],
  });

  const pdfWidth = 210; // 210mm
  const pdfHeight = 330; // 330mm

  const cWidth = canvas.width || 1;
  const cHeight = canvas.height || 1;
  let imgWidth = Number(pdfWidth.toFixed(2));
  let imgHeight = Number(((cHeight * pdfWidth) / cWidth).toFixed(2));

  // Fit to 1 page F4 (210 x 330 mm) if content is close to 1 page, preventing bottom overflow
  if (imgHeight > pdfHeight && imgHeight <= pdfHeight * 1.12) {
    const scaleRatio = pdfHeight / imgHeight;
    imgWidth = Number((imgWidth * scaleRatio).toFixed(2));
    imgHeight = Number(pdfHeight.toFixed(2));
    const xOffset = Number(((pdfWidth - imgWidth) / 2).toFixed(2));
    pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if document content extends beyond 1 page
    while (heightLeft > 5) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  }

  const pdfBlob = pdf.output('blob');
  return { pdf, pdfBlob };
}

/**
 * Universal Direct Download for PC and Android (Saves to device's Downloads folder)
 */
export async function downloadPdfDirectly(
  elementId: string,
  fileName: string = 'Jurnal_Kerja_Harian.pdf'
): Promise<PdfExportResult> {
  try {
    const { pdf, pdfBlob } = await renderElementToJsPdf(elementId);

    // Method 1: jsPDF built-in save (proven and battle-tested for all browsers)
    try {
      pdf.save(fileName);
    } catch (saveErr) {
      console.warn('pdf.save failed, using standard blob anchor download:', saveErr);
      // Method 2: Standard Blob Object URL download trigger
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 3000);
    }

    return {
      success: true,
      method: 'directDownload',
      message: 'File PDF berhasil diunduh dan tersimpan di memori perangkat Anda (folder Downloads).',
    };
  } catch (err: any) {
    console.error('Download PDF error:', err);
    window.print();
    return {
      success: false,
      method: 'printFallback',
      message: 'Dialihkan ke jendela Simpan PDF / Cetak sistem peramban.',
    };
  }
}

/**
 * Mobile Web Share API for Android & iOS (Share/Save to Drive, WhatsApp, File Manager)
 */
export async function sharePdfToMobile(
  elementId: string,
  fileName: string = 'Jurnal_Kerja_Harian.pdf'
): Promise<PdfExportResult> {
  try {
    const { pdfBlob } = await renderElementToJsPdf(elementId);
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title: fileName,
        text: 'Jurnal Kerja Harian Pegawai / Guru',
        files: [pdfFile],
      });
      return {
        success: true,
        method: 'mobileShare',
        message: 'Menu simpan & bagikan Android berhasil dibuka.',
      };
    } else {
      // Fallback to direct download
      return downloadPdfDirectly(elementId, fileName);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        method: 'mobileShare',
        message: 'Aksi penyimpanan dibatalkan pengguna.',
      };
    }
    console.warn('Share error, falling back to direct download:', err);
    return downloadPdfDirectly(elementId, fileName);
  }
}

/**
 * Universal export function used by default
 */
export async function exportElementToPdf(
  elementId: string, 
  fileName: string = 'Jurnal_Kerja_Harian.pdf'
): Promise<PdfExportResult> {
  return downloadPdfDirectly(elementId, fileName);
}

/**
 * Native Browser Print helper
 */
export function triggerNativePrint(): void {
  window.print();
}

