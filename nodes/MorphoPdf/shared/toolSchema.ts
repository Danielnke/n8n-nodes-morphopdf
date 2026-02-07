import { z } from 'zod';

/**
 * Zod schema for MorphoPDF AI Tool input
 * Used by AI agents to process PDF files via the MorphoPDF API
 *
 * Design: Flat schema (no discriminated unions) for LLM compatibility.
 * Each operation-specific parameter is optional with clear .describe() text
 * explaining when it applies.
 */
export const morphoPdfToolSchema = z
  .object({
    operation: z
      .enum([
        'compress',
        'merge',
        'split',
        'rotate',
        'watermark',
        'pdfToWord',
        'pdfToExcel',
        'pdfToImage',
        'wordToPdf',
        'htmlToPdf',
      ])
      .describe(
        'The PDF operation to perform. ' +
          'compress=reduce file size, ' +
          'merge=combine multiple PDFs into one, ' +
          'split=divide PDF into parts, ' +
          'rotate=turn pages by angle, ' +
          'watermark=add text overlay, ' +
          'pdfToWord=convert PDF to DOCX, ' +
          'pdfToExcel=extract tables to XLSX, ' +
          'pdfToImage=convert pages to PNG/JPG, ' +
          'wordToPdf=convert DOCX to PDF, ' +
          'htmlToPdf=render HTML/URL to PDF',
      ),

    inputUrl: z
      .string()
      .url()
      .optional()
      .describe(
        'Public URL of the input file. Required for all operations EXCEPT htmlToPdf when using htmlContent. ' +
          'For compress/split/rotate/watermark: must be a PDF URL. ' +
          'For merge: the first PDF to merge (additional URLs go in additionalUrls). ' +
          'For pdfToWord/pdfToExcel/pdfToImage: must be a PDF URL. ' +
          'For wordToPdf: must be a DOCX URL. ' +
          'For htmlToPdf: must be a webpage URL (or omit if using htmlContent).',
      ),

    // === COMPRESS OPERATION ===
    quality: z
      .enum(['low', 'medium', 'high'])
      .optional()
      .describe(
        'FOR COMPRESS ONLY. Compression quality level. ' +
          'low=smallest file size (max compression, ~50 DPI), ' +
          'medium=balanced quality and size (~100 DPI), ' +
          'high=best quality, larger file (~150 DPI). ' +
          'Default: low',
      ),

    // === MERGE OPERATION ===
    additionalUrls: z
      .array(z.string().url())
      .optional()
      .describe(
        'FOR MERGE ONLY. Array of additional PDF URLs to combine with inputUrl. ' +
          'Minimum 1 URL required. PDFs are merged in order: inputUrl first, then these URLs. ' +
          'Example: ["https://example.com/doc2.pdf", "https://example.com/doc3.pdf"]',
      ),

    // === SPLIT OPERATION ===
    splitMode: z
      .enum(['ranges', 'individual'])
      .optional()
      .describe(
        'FOR SPLIT ONLY. How to split the PDF. ' +
          'ranges=split by page ranges (use pageRanges param), ' +
          'individual=extract each specified page as separate PDF. ' +
          'Default: ranges',
      ),

    pageRanges: z
      .array(z.string())
      .optional()
      .describe(
        'FOR SPLIT ONLY (when splitMode=ranges). Array of page range strings. ' +
          'Each range becomes a separate PDF file. ' +
          'Example: ["1-3", "4-6", "7-10"] creates 3 PDFs. ' +
          'Format: "start-end" (1-based page numbers).',
      ),

    // === ROTATE OPERATION ===
    rotationAngle: z
      .enum(['90', '180', '270'])
      .optional()
      .describe(
        'FOR ROTATE ONLY. Clockwise rotation angle in degrees. ' +
          '90=quarter turn right, 180=upside down, 270=quarter turn left. ' +
          'Applied to all pages. Default: 90',
      ),

    // === WATERMARK OPERATION ===
    watermarkText: z
      .string()
      .optional()
      .describe(
        'FOR WATERMARK ONLY. Text to overlay on pages. ' +
          'Example: "CONFIDENTIAL", "DRAFT", "SAMPLE". ' +
          'Required when using watermark operation.',
      ),

    watermarkPosition: z
      .enum([
        'center',
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ])
      .optional()
      .describe(
        'FOR WATERMARK ONLY. Where to place the watermark on each page. ' + 'Default: center',
      ),

    watermarkOpacity: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe(
        'FOR WATERMARK ONLY. Transparency of watermark (0=invisible, 1=fully opaque). ' +
          'Typical values: 0.1-0.3 for subtle watermarks. Default: 0.3',
      ),

    // === PDF TO IMAGE OPERATION ===
    imageFormat: z
      .enum(['png', 'jpg'])
      .optional()
      .describe(
        'FOR PDF_TO_IMAGE ONLY. Output image format. ' +
          'png=lossless, larger files, supports transparency. ' +
          'jpg=lossy compression, smaller files. ' +
          'Default: png',
      ),

    dpi: z
      .enum(['72', '96', '150', '300', '600'])
      .optional()
      .describe(
        'FOR PDF_TO_IMAGE ONLY. Resolution in dots per inch. ' +
          '72=screen/web preview, 96=standard web, 150=good quality, ' +
          '300=print quality, 600=high-quality print. ' +
          'Higher DPI = larger files. Default: 150',
      ),

    // === HTML TO PDF OPERATION ===
    htmlContent: z
      .string()
      .optional()
      .describe(
        'FOR HTML_TO_PDF ONLY. Raw HTML content to convert to PDF. ' +
          'Use this instead of inputUrl when you have HTML as a string. ' +
          'Example: "<html><body><h1>Hello World</h1></body></html>". ' +
          'Either inputUrl OR htmlContent is required for htmlToPdf.',
      ),
  })
  .describe(
    'MorphoPDF AI Tool - Process PDF files with various operations. ' +
      'Supports compression, merging, splitting, rotation, watermarking, ' +
      'and format conversions (PDF to Word/Excel/Image, Word/HTML to PDF).',
  );

/**
 * TypeScript type inferred from the Zod schema
 */
export type MorphoPdfToolInput = z.infer<typeof morphoPdfToolSchema>;

/**
 * API endpoint mapping for each operation
 * Used to route requests to the correct MorphoPDF API endpoint
 */
export const operationEndpoints: Record<string, string> = {
  compress: '/pdf/compress',
  merge: '/pdf/merge',
  split: '/pdf/split',
  rotate: '/pdf/rotate',
  watermark: '/pdf/watermark',
  pdfToWord: '/convert/pdf-to-word',
  pdfToExcel: '/convert/pdf-to-excel',
  pdfToImage: '/convert/pdf-to-image',
  wordToPdf: '/convert/word-to-pdf',
  htmlToPdf: '/convert/html-to-pdf',
};

/**
 * Human-readable operation names for response formatting
 */
const operationNames: Record<string, string> = {
  compress: 'PDF Compression',
  merge: 'PDF Merge',
  split: 'PDF Split',
  rotate: 'PDF Rotation',
  watermark: 'PDF Watermarking',
  pdfToWord: 'PDF to Word Conversion',
  pdfToExcel: 'PDF to Excel Conversion',
  pdfToImage: 'PDF to Image Conversion',
  wordToPdf: 'Word to PDF Conversion',
  htmlToPdf: 'HTML to PDF Conversion',
};

/**
 * Format API response for LLM consumption
 * Transforms raw API response into a structured, readable format
 *
 * @param operation - The operation that was performed
 * @param response - Raw API response from MorphoPDF
 * @returns Formatted response object suitable for LLM output
 */
export function formatToolResponse(
  operation: string,
  response: {
    success?: boolean;
    downloadUrl?: string;
    fileName?: string;
    error?: { code?: string; message?: string };
    [key: string]: unknown;
  },
): {
  success: boolean;
  operation: string;
  operationName: string;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  error?: { code?: string; message?: string };
} {
  const operationName = operationNames[operation] || operation;

  if (response.success === false || response.error) {
    return {
      success: false,
      operation,
      operationName,
      message: `${operationName} failed: ${response.error?.message || 'Unknown error'}`,
      error: response.error,
    };
  }

  return {
    success: true,
    operation,
    operationName,
    message: `${operationName} completed successfully.`,
    downloadUrl: response.downloadUrl,
    fileName: response.fileName,
  };
}
