import type { INodeProperties } from 'n8n-workflow';

/**
 * Resource selector - PDF operations or Conversions
 */
export const resourceProperty: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'PDF',
      value: 'pdf',
      description: 'Manipulate PDF files - merge, split, compress, rotate, etc',
    },
    {
      name: 'Convert',
      value: 'convert',
      description: 'Convert between PDF and other formats',
    },
  ],
  default: 'pdf',
};

/**
 * PDF Operations
 */
export const pdfOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['pdf'],
    },
  },
  options: [
    { name: 'Compress', value: 'compress', action: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality' },
    { name: 'Crop', value: 'crop', action: 'Crop PDF', description: 'Crop page margins or specific areas' },
    { name: 'Edit', value: 'edit', action: 'Edit PDF', description: 'Add text, shapes, or annotations' },
    { name: 'Merge', value: 'merge', action: 'Merge PDF', description: 'Combine 2 or more PDF files into a single document' },
    { name: 'Organize', value: 'organize', action: 'Organize PDF', description: 'Reorder, delete, or duplicate pages' },
    { name: 'Protect', value: 'protect', action: 'Protect PDF', description: 'Add password and set permissions' },
    { name: 'Rotate', value: 'rotate', action: 'Rotate PDF', description: 'Rotate all or specific pages by 90, 180, or 270 degrees' },
    { name: 'Sign', value: 'sign', action: 'Sign PDF', description: 'Add signature image to PDF' },
    { name: 'Split', value: 'split', action: 'Split PDF', description: 'Split PDF by page ranges or extract individual pages' },
    { name: 'Unlock', value: 'unlock', action: 'Unlock PDF', description: 'Remove password protection from PDF' },
    { name: 'Watermark', value: 'watermark', action: 'Watermark PDF', description: 'Add text or image watermark to pages' },
  ],
  default: 'compress',
};

/**
 * Convert Operations
 */
export const convertOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['convert'],
    },
  },
  options: [
    { name: 'Excel to PDF', value: 'excelToPdf', action: 'Excel to PDF', description: 'Convert XLSX to PDF' },
    { name: 'HTML to PDF', value: 'htmlToPdf', action: 'Html to pdf', description: 'Render webpage or HTML content to PDF' },
    { name: 'Images to PDF', value: 'imageToPdf', action: 'Images to PDF', description: 'Combine images into a PDF document' },
    { name: 'Markdown to PDF', value: 'markdownToPdf', action: 'Markdown to PDF', description: 'Convert Markdown text to PDF' },
    { name: 'PDF to Excel', value: 'pdfToExcel', action: 'Pdf to excel', description: 'Extract tables from PDF to XLSX' },
    { name: 'PDF to Images', value: 'pdfToImage', action: 'Pdf to images', description: 'Convert PDF pages to PNG or JPG' },
    { name: 'PDF to PowerPoint', value: 'pdfToPowerpoint', action: 'Pdf to power point', description: 'Convert PDF to PPTX format' },
    { name: 'PDF to Word', value: 'pdfToWord', action: 'Pdf to word', description: 'Convert PDF to DOCX format' },
    { name: 'PowerPoint to PDF', value: 'powerpointToPdf', action: 'Power point to pdf', description: 'Convert PPTX to PDF' },
    { name: 'Word to PDF', value: 'wordToPdf', action: 'Word to PDF', description: 'Convert DOCX to PDF' },
  ],
  default: 'pdfToWord',
};

/**
 * Input Method - Binary or URL
 */
export const inputMethodProperty: INodeProperties = {
  displayName: 'Input Method',
  name: 'inputMethod',
  type: 'options',
  options: [
    {
      name: 'Binary Data',
      value: 'binary',
      description: 'Use binary data from a previous node',
    },
    {
      name: 'URL',
      value: 'url',
      description: 'Fetch file from a public URL',
    },
  ],
  default: 'binary',
  description: 'How to provide the input file',
};

/**
 * Binary Property Name (for binary input)
 */
export const binaryPropertyNameProperty: INodeProperties = {
  displayName: 'Input Binary Property',
  name: 'binaryPropertyName',
  type: 'string',
  default: 'data',
  displayOptions: {
    show: {
      inputMethod: ['binary'],
    },
  },
  description: 'Name of the binary property containing the input file',
  hint: 'The property name from a previous node (e.g., "data" from HTTP Request)',
};

/**
 * File URL (for URL input)
 */
export const fileUrlProperty: INodeProperties = {
  displayName: 'File URL',
  name: 'fileUrl',
  type: 'string',
  default: '',
  displayOptions: {
    show: {
      inputMethod: ['url'],
    },
  },
  description: 'Public URL of the file to process',
  placeholder: 'https://example.com/document.pdf',
};

/**
 * Multiple File URLs (for merge with URL input)
 */
export const fileUrlsProperty: INodeProperties = {
  displayName: 'File URLs',
  name: 'fileUrls',
  type: 'string',
  typeOptions: {
    multipleValues: true,
  },
  default: [],
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['merge'],
      inputMethod: ['url'],
    },
  },
  description: 'Public URLs of PDF files to merge (minimum 2)',
  placeholder: 'https://example.com/file1.pdf',
};

/**
 * Output Binary Property Name
 */
export const outputBinaryPropertyNameProperty: INodeProperties = {
  displayName: 'Output Binary Property',
  name: 'outputBinaryPropertyName',
  type: 'string',
  default: 'data',
  description: 'Name of the binary property to store the output file',
};

/**
 * Compression Quality
 */
export const qualityProperty: INodeProperties = {
  displayName: 'Quality',
  name: 'quality',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['compress'],
    },
  },
  options: [
    {
      name: 'Low (Smallest File)',
      value: 'low',
      description: 'Maximum compression - smallest file size',
    },
    {
      name: 'Medium (Balanced)',
      value: 'medium',
      description: 'Balanced compression and quality',
    },
    {
      name: 'High (Best Quality)',
      value: 'high',
      description: 'Minimal compression - best visual quality',
    },
  ],
  default: 'medium',
  description: 'Compression level. "Low" = maximum compression = smallest file.',
};

/**
 * Split Mode
 */
export const splitModeProperty: INodeProperties = {
  displayName: 'Split Mode',
  name: 'splitMode',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['split'],
    },
  },
  options: [
    {
      name: 'By Page Ranges',
      value: 'ranges',
      description: 'Split by page ranges (e.g., "1-3,4-6")',
    },
    {
      name: 'Individual Pages',
      value: 'individual',
      description: 'Extract each page as a separate PDF',
    },
  ],
  default: 'ranges',
};

/**
 * Page Ranges (for split)
 */
export const rangesProperty: INodeProperties = {
  displayName: 'Page Ranges',
  name: 'ranges',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['split'],
      splitMode: ['ranges'],
    },
  },
  default: '1-3,4-6',
  placeholder: '1-3,4-6,7-10',
  description: 'Comma-separated page ranges to extract',
};

/**
 * Rotation Angle
 */
export const rotationAngleProperty: INodeProperties = {
  displayName: 'Rotation Angle',
  name: 'angle',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['rotate'],
    },
  },
  options: [
    { name: '90° Clockwise', value: 90 },
    { name: '180°', value: 180 },
    { name: '90° Counter-Clockwise', value: 270 },
  ],
  default: 90,
};

/**
 * Pages to Rotate
 */
export const rotatePagesProperty: INodeProperties = {
  displayName: 'Pages',
  name: 'pages',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['rotate'],
    },
  },
  default: 'all',
  placeholder: 'all, 1,3,5, or 1-5',
  description: 'Which pages to rotate: "all", specific pages "1,3,5", or range "1-5"',
};

/**
 * Watermark Type
 */
export const watermarkTypeProperty: INodeProperties = {
  displayName: 'Watermark Type',
  name: 'watermarkType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
    },
  },
  options: [
    { name: 'Text', value: 'text' },
    { name: 'Image', value: 'image' },
  ],
  default: 'text',
};

/**
 * Watermark Text
 */
export const watermarkTextProperty: INodeProperties = {
  displayName: 'Watermark Text',
  name: 'watermarkText',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
      watermarkType: ['text'],
    },
  },
  default: 'CONFIDENTIAL',
  description: 'Text to use as watermark',
};

/**
 * Watermark Image URL
 */
export const watermarkImageUrlProperty: INodeProperties = {
  displayName: 'Watermark Image URL',
  name: 'watermarkImageUrl',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
      watermarkType: ['image'],
    },
  },
  default: '',
  placeholder: 'https://example.com/logo.png',
  description: 'Public URL of the watermark image (PNG or JPG)',
};

/**
 * Watermark Position
 */
export const watermarkPositionProperty: INodeProperties = {
  displayName: 'Position',
  name: 'watermarkPosition',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
    },
  },
  options: [
    { name: 'Bottom Center', value: 'bottom-center' },
    { name: 'Bottom Left', value: 'bottom-left' },
    { name: 'Bottom Right', value: 'bottom-right' },
    { name: 'Center', value: 'center' },
    { name: 'Top Center', value: 'top-center' },
    { name: 'Top Left', value: 'top-left' },
    { name: 'Top Right', value: 'top-right' },
  ],
  default: 'center',
};

/**
 * Watermark Opacity
 */
export const watermarkOpacityProperty: INodeProperties = {
  displayName: 'Opacity',
  name: 'watermarkOpacity',
  type: 'number',
  typeOptions: {
    minValue: 0,
    maxValue: 1,
    numberStepSize: 0.1,
  },
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
    },
  },
  default: 0.3,
  description: 'Watermark transparency (0 = invisible, 1 = opaque)',
};

/**
 * Watermark Rotation
 */
export const watermarkRotationProperty: INodeProperties = {
  displayName: 'Rotation (Degrees)',
  name: 'watermarkRotation',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['watermark'],
      watermarkType: ['text'],
    },
  },
  default: -45,
  description: 'Rotation angle for text watermark',
};

/**
 * User Password (for protect)
 */
export const userPasswordProperty: INodeProperties = {
  displayName: 'User Password',
  name: 'userPassword',
  type: 'string',
  typeOptions: { password: true },
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['protect'],
    },
  },
  default: '',
  description: 'Password required to open the PDF',
};

/**
 * Owner Password (for protect)
 */
export const ownerPasswordProperty: INodeProperties = {
  displayName: 'Owner Password',
  name: 'ownerPassword',
  type: 'string',
  typeOptions: { password: true },
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['protect'],
    },
  },
  default: '',
  description: 'Password required to edit permissions (optional)',
};

/**
 * Password (for unlock)
 */
export const passwordProperty: INodeProperties = {
  displayName: 'Password',
  name: 'password',
  type: 'string',
  typeOptions: { password: true },
  displayOptions: {
    show: {
      resource: ['pdf'],
      operation: ['unlock'],
    },
  },
  default: '',
  required: true,
  description: 'Password to unlock the PDF',
};

/**
 * Image Format (for pdfToImage)
 */
export const imageFormatProperty: INodeProperties = {
  displayName: 'Image Format',
  name: 'imageFormat',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['pdfToImage'],
    },
  },
  options: [
    { name: 'PNG', value: 'png' },
    { name: 'JPEG', value: 'jpg' },
  ],
  default: 'png',
};

/**
 * DPI (for pdfToImage)
 */
export const dpiProperty: INodeProperties = {
  displayName: 'DPI (Resolution)',
  name: 'dpi',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['pdfToImage'],
    },
  },
  options: [
    { name: '72 (Screen)', value: 72 },
    { name: '96 (Web)', value: 96 },
    { name: '150 (Standard)', value: 150 },
    { name: '300 (Print)', value: 300 },
    { name: '600 (High Quality)', value: 600 },
  ],
  default: 150,
};

/**
 * Page Range (for pdfToImage)
 */
export const pageRangeProperty: INodeProperties = {
  displayName: 'Page Range',
  name: 'pageRange',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['pdfToImage'],
    },
  },
  default: 'all',
  placeholder: 'all, 1, 1-5, or 1,3,5',
  description: 'Pages to convert: "all", single page "1", range "1-5", or list "1,3,5"',
};

/**
 * HTML Source Type
 */
export const htmlSourceTypeProperty: INodeProperties = {
  displayName: 'Source Type',
  name: 'htmlSourceType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['htmlToPdf'],
    },
  },
  options: [
    { name: 'URL', value: 'url', description: 'Render a webpage to PDF' },
    { name: 'HTML Content', value: 'html', description: 'Convert HTML string to PDF' },
  ],
  default: 'url',
};

/**
 * HTML URL
 */
export const htmlUrlProperty: INodeProperties = {
  displayName: 'URL',
  name: 'htmlUrl',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['htmlToPdf'],
      htmlSourceType: ['url'],
    },
  },
  default: '',
  placeholder: 'https://example.com',
  description: 'URL of the webpage to convert',
};

/**
 * HTML Content
 */
export const htmlContentProperty: INodeProperties = {
  displayName: 'HTML Content',
  name: 'htmlContent',
  type: 'string',
  typeOptions: {
    rows: 10,
  },
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['htmlToPdf'],
      htmlSourceType: ['html'],
    },
  },
  default: '',
  placeholder: '<html><body><h1>Hello World</h1></body></html>',
  description: 'HTML content to convert to PDF',
};

/**
 * Page Format
 */
export const pageFormatProperty: INodeProperties = {
  displayName: 'Page Format',
  name: 'pageFormat',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['htmlToPdf', 'markdownToPdf'],
    },
  },
  options: [
    { name: 'A4', value: 'A4' },
    { name: 'Letter', value: 'Letter' },
    { name: 'Legal', value: 'Legal' },
  ],
  default: 'A4',
};

/**
 * Landscape orientation
 */
export const landscapeProperty: INodeProperties = {
  displayName: 'Landscape',
  name: 'landscape',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['htmlToPdf', 'markdownToPdf'],
    },
  },
  default: false,
  description: 'Whether to use landscape orientation',
};

/**
 * OCR for scanned PDFs
 */
export const ocrForScannedProperty: INodeProperties = {
  displayName: 'OCR for Scanned PDFs',
  name: 'ocrForScanned',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['convert'],
      operation: ['pdfToWord'],
    },
  },
  default: false,
  description: 'Whether to enable OCR to extract text from scanned/image-based PDFs',
};
