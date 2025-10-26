import { pdf } from '@react-pdf/renderer';
import { ReactElement } from 'react';

/**
 * Generate and download a PDF document
 * @param pdfDocument - The React PDF document component
 * @param filename - The desired filename for the PDF
 */
export async function downloadPDF(pdfDocument: ReactElement, filename: string) {
  try {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generate a PDF blob (useful for email attachments)
 * @param pdfDocument - The React PDF document component
 * @returns Promise<Blob>
 */
export async function generatePDFBlob(pdfDocument: ReactElement): Promise<Blob> {
  try {
    return await pdf(pdfDocument).toBlob();
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Failed to generate PDF blob');
  }
}

/**
 * Open PDF in new tab/window for preview
 * @param pdfDocument - The React PDF document component
 */
export async function previewPDF(pdfDocument: ReactElement) {
  try {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: We don't revoke the URL immediately to allow the preview to load
  } catch (error) {
    console.error('Error previewing PDF:', error);
    throw new Error('Failed to preview PDF');
  }
}
