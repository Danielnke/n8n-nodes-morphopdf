import type { IDataObject } from 'n8n-workflow';

export interface InputFile {
  content: Buffer;
  fileName: string;
  mimeType: string;
}

export interface MorphoPdfApiResponse {
  success: boolean;
  fileName?: string;
  downloadUrl?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface BinaryOutputData {
  json: IDataObject;
  binary: {
    [key: string]: {
      data: string;
      mimeType: string;
      fileName: string;
    };
  };
}

export type InputMethod = 'binary' | 'url';

export type PdfResource = 'pdf' | 'convert';

export type PdfOperation =
  | 'merge'
  | 'split'
  | 'compress'
  | 'rotate'
  | 'crop'
  | 'organize'
  | 'edit'
  | 'watermark'
  | 'sign'
  | 'protect'
  | 'unlock';

export type ConvertOperation =
  | 'pdfToWord'
  | 'pdfToExcel'
  | 'pdfToPowerpoint'
  | 'pdfToImage'
  | 'wordToPdf'
  | 'excelToPdf'
  | 'powerpointToPdf'
  | 'imageToPdf'
  | 'htmlToPdf'
  | 'markdownToPdf';

export type CompressionQuality = 'low' | 'medium' | 'high';

export type SplitMode = 'ranges' | 'individual';

export type WatermarkType = 'text' | 'image';

export type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface WatermarkOptions {
  type: WatermarkType;
  text?: string;
  imageUrl?: string;
  position: WatermarkPosition;
  opacity: number;
  rotation?: number;
  fontSize?: number;
  color?: string;
}

export interface ProtectOptions {
  userPassword?: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
  };
}

export interface HtmlToPdfOptions {
  sourceType: 'url' | 'html';
  url?: string;
  htmlContent?: string;
  pageFormat?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
}

export interface PdfToImageOptions {
  format: 'png' | 'jpg';
  dpi: number;
  pageRange: string;
  quality?: number;
}
