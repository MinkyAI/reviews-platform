import * as QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'image/svg+xml';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}

export interface QRBatchOptions {
  count: number;
  labelPrefix: string;
  clientId: string;
  locationId?: string;
  batchId?: string;
}

export interface QRCodeData {
  id: string;
  shortCode: string;
  url: string;
  label: string;
  qrCodeDataUrl?: string;
  svgString?: string;
}

export function generateShortCode(length: number = 8): string {
  return nanoid(length);
}

export function getQRUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/r/${shortCode}`;
}

export async function generateQRCode(
  shortCode: string, 
  options: QRCodeOptions = {}
): Promise<{ dataUrl?: string; svg?: string }> {
  const url = getQRUrl(shortCode);
  
  try {
    if (options.type === 'image/svg+xml') {
      const svgString = await QRCode.toString(url, {
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        margin: options.margin || 2,
        color: options.color || { dark: '#000000', light: '#FFFFFF' },
        width: options.width || 256,
        type: 'svg'
      });
      return { svg: svgString };
    } else {
      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        margin: options.margin || 2,
        color: options.color || { dark: '#000000', light: '#FFFFFF' },
        width: options.width || 256
      });
      return { dataUrl };
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeBatch(
  options: QRBatchOptions
): Promise<QRCodeData[]> {
  const batchId = options.batchId || nanoid(12);
  const qrCodes: QRCodeData[] = [];
  
  for (let i = 1; i <= options.count; i++) {
    const shortCode = generateShortCode();
    const label = `${options.labelPrefix} ${i.toString().padStart(2, '0')}`;
    const url = getQRUrl(shortCode);
    
    const { dataUrl } = await generateQRCode(shortCode, {
      type: 'image/png',
      width: 256
    });
    
    qrCodes.push({
      id: nanoid(),
      shortCode,
      url,
      label,
      qrCodeDataUrl: dataUrl
    });
  }
  
  return qrCodes;
}

export interface PDFLayoutOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  codesPerRow: number;
  codesPerPage: number;
  includeUrl: boolean;
  includeLabel: boolean;
  brandColors?: {
    primary: string;
    secondary?: string;
  };
  logo?: string;
}

export async function generateQRCodesPDF(
  qrCodes: QRCodeData[],
  clientName: string,
  options: PDFLayoutOptions = {
    format: 'A4',
    orientation: 'portrait',
    codesPerRow: 3,
    codesPerPage: 9,
    includeUrl: true,
    includeLabel: true
  }
): Promise<Uint8Array> {
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.format
  });
  
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  
  const qrSize = (contentWidth - (options.codesPerRow - 1) * 10) / options.codesPerRow;
  const labelHeight = options.includeLabel ? 8 : 0;
  const urlHeight = options.includeUrl ? 6 : 0;
  const cellHeight = qrSize + labelHeight + urlHeight + 10;
  
  let currentPage = 0;
  let currentRow = 0;
  let currentCol = 0;
  
  for (let i = 0; i < qrCodes.length; i++) {
    const qrCode = qrCodes[i];
    
    if (i > 0 && i % options.codesPerPage === 0) {
      pdf.addPage();
      currentPage++;
      currentRow = 0;
      currentCol = 0;
    }
    
    const x = margin + currentCol * (qrSize + 10);
    const y = margin + currentRow * cellHeight;
    
    if (qrCode.qrCodeDataUrl) {
      try {
        pdf.addImage(qrCode.qrCodeDataUrl, 'PNG', x, y, qrSize, qrSize);
      } catch (error) {
        console.error('Error adding QR code image to PDF:', error);
      }
    }
    
    let textY = y + qrSize + 4;
    
    if (options.includeLabel) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(qrCode.label, x + qrSize / 2, textY, { align: 'center' });
      textY += labelHeight;
    }
    
    if (options.includeUrl) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(qrCode.url, x + qrSize / 2, textY, { align: 'center' });
    }
    
    currentCol++;
    if (currentCol >= options.codesPerRow) {
      currentCol = 0;
      currentRow++;
    }
  }
  
  if (options.brandColors?.primary) {
    pdf.setDrawColor(options.brandColors.primary);
  }
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`QR Codes for ${clientName}`, pageWidth / 2, 15, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return pdf.output('arraybuffer');
}

export function downloadFile(data: Uint8Array | string, filename: string, mimeType: string) {
  const blob = new Blob([data as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export async function convertElementToPDF(element: HTMLElement): Promise<Uint8Array> {
  const canvas = await html2canvas(element, {
    useCORS: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  return pdf.output('arraybuffer');
}

export function validateQRCodeData(qrCodes: QRCodeData[]): string[] {
  const errors: string[] = [];
  const shortCodes = new Set<string>();
  
  qrCodes.forEach((qrCode, index) => {
    if (!qrCode.shortCode || qrCode.shortCode.length < 4) {
      errors.push(`QR code ${index + 1}: Invalid short code`);
    }
    
    if (shortCodes.has(qrCode.shortCode)) {
      errors.push(`QR code ${index + 1}: Duplicate short code '${qrCode.shortCode}'`);
    }
    shortCodes.add(qrCode.shortCode);
    
    if (!qrCode.label || qrCode.label.trim().length === 0) {
      errors.push(`QR code ${index + 1}: Label is required`);
    }
    
    if (!qrCode.url || !qrCode.url.startsWith('http')) {
      errors.push(`QR code ${index + 1}: Invalid URL`);
    }
  });
  
  return errors;
}