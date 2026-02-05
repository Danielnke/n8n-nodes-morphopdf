import type { INodeProperties } from 'n8n-workflow';

/**
 * Resource selector - 4 categories matching API documentation
 */
export const resourceProperty: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Document Management',
      value: 'documentManagement',
      description: 'Merge, split, compress, organize, crop, rotate, and watermark PDFs',
    },
    {
      name: 'PDF to Format',
      value: 'pdfToFormat',
      description: 'Convert PDF to Word, Excel, PowerPoint, or Image',
    },
    {
      name: 'Format to PDF',
      value: 'formatToPdf',
      description: 'Convert Word, Excel, PowerPoint, Image, HTML, or Markdown to PDF',
    },
    {
      name: 'Security & Signing',
      value: 'securitySigning',
      description: 'Protect, unlock, or sign PDF documents',
    },
  ],
  default: 'documentManagement',
};

/**
 * Document Management Operations
 */
export const documentManagementOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['documentManagement'],
    },
  },
  options: [
    { name: 'Compress PDF', value: 'compress', action: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality' },
    { name: 'Crop PDF', value: 'crop', action: 'Crop PDF', description: 'Crop page margins or specific areas' },
    { name: 'Merge PDF', value: 'merge', action: 'Merge PDF', description: 'Combine 2 or more PDF files into a single document' },
    { name: 'Organize PDF', value: 'organize', action: 'Organize PDF', description: 'Reorder, delete, or duplicate pages' },
    { name: 'Rotate PDF', value: 'rotate', action: 'Rotate PDF', description: 'Rotate all or specific pages by 90, 180, or 270 degrees' },
    { name: 'Split PDF', value: 'split', action: 'Split PDF', description: 'Split PDF by page ranges or extract individual pages' },
    { name: 'Watermark PDF', value: 'watermark', action: 'Watermark PDF', description: 'Add text or image watermark to pages' },
  ],
  default: 'merge',
};

/**
 * PDF to Format Operations
 */
export const pdfToFormatOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['pdfToFormat'],
    },
  },
  options: [
    { name: 'PDF to Excel', value: 'pdfToExcel', action: 'Pdf to excel', description: 'Extract tables from PDF to XLSX' },
    { name: 'PDF to Image', value: 'pdfToImage', action: 'Pdf to image', description: 'Convert PDF pages to PNG or JPG' },
    { name: 'PDF to PowerPoint', value: 'pdfToPowerpoint', action: 'Pdf to power point', description: 'Convert PDF to PPTX format' },
    { name: 'PDF to Word', value: 'pdfToWord', action: 'Pdf to word', description: 'Convert PDF to DOCX format' },
  ],
  default: 'pdfToWord',
};

/**
 * Format to PDF Operations
 */
export const formatToPdfOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
    },
  },
  options: [
    { name: 'Excel to PDF', value: 'excelToPdf', action: 'Excel to PDF', description: 'Convert XLSX to PDF' },
    { name: 'HTML to PDF', value: 'htmlToPdf', action: 'Html to pdf', description: 'Render webpage or HTML content to PDF' },
    { name: 'Image to PDF', value: 'imageToPdf', action: 'Image to PDF', description: 'Combine images into a PDF document' },
    { name: 'Markdown to PDF', value: 'markdownToPdf', action: 'Markdown to PDF', description: 'Convert Markdown text to PDF' },
    { name: 'PowerPoint to PDF', value: 'powerpointToPdf', action: 'Power point to pdf', description: 'Convert PPTX to PDF' },
    { name: 'Word to PDF', value: 'wordToPdf', action: 'Word to PDF', description: 'Convert DOCX to PDF' },
  ],
  default: 'wordToPdf',
};

/**
 * Security & Signing Operations
 */
export const securitySigningOperationProperty: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['securitySigning'],
    },
  },
  options: [
    { name: 'Protect PDF', value: 'protect', action: 'Protect PDF', description: 'Add password and set permissions' },
    { name: 'Sign PDF', value: 'sign', action: 'Sign PDF', description: 'Add signature image to PDF' },
    { name: 'Unlock PDF', value: 'unlock', action: 'Unlock PDF', description: 'Remove password protection from PDF' },
  ],
  default: 'protect',
};

/**
 * Input Method - Binary or URL
 */
export const inputMethodProperty: INodeProperties = {
  displayName: 'Input Method',
  name: 'inputMethod',
  type: 'options',
  displayOptions: {
    hide: {
      operation: ['htmlToPdf', 'markdownToPdf'],
    },
  },
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
 * HTML Binary Property Name (for HTML to PDF file upload)
 */
export const htmlBinaryPropertyNameProperty: INodeProperties = {
  displayName: 'Input Binary Property',
  name: 'binaryPropertyName',
  type: 'string',
  default: 'data',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
      htmlSourceType: ['binary'],
    },
  },
  description: 'Name of the binary property containing the HTML file',
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['documentManagement'],
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
      resource: ['securitySigning'],
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
      resource: ['securitySigning'],
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
      resource: ['securitySigning'],
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
      resource: ['pdfToFormat'],
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
      resource: ['pdfToFormat'],
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
      resource: ['pdfToFormat'],
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
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  options: [
    { name: 'URL', value: 'url', description: 'Render a webpage to PDF' },
    { name: 'HTML Content', value: 'html', description: 'Convert HTML string to PDF' },
    { name: 'HTML File', value: 'binary', description: 'Upload an HTML file to convert' },
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
      resource: ['formatToPdf'],
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
      resource: ['formatToPdf'],
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
      resource: ['formatToPdf'],
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
      resource: ['formatToPdf'],
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
      resource: ['pdfToFormat'],
      operation: ['pdfToWord'],
    },
  },
  default: false,
  description: 'Whether to enable OCR to extract text from scanned/image-based PDFs',
};

/**
 * New Page Order (for organize)
 */
export const newPageOrderProperty: INodeProperties = {
  displayName: 'New Page Order',
  name: 'newPageOrder',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['organize'],
    },
  },
  default: '',
  placeholder: '3,1,2,4',
  description: 'New order of pages (comma-separated page numbers). E.g., "3,1,2,4" moves page 3 first.',
};

/**
 * Crop Mode
 */
export const cropModeProperty: INodeProperties = {
  displayName: 'Crop Mode',
  name: 'cropMode',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  options: [
    { name: 'Uniform (All Pages)', value: 'uniform' },
    { name: 'Per Page', value: 'perPage' },
  ],
  default: 'uniform',
  description: 'Whether to apply the same crop to all pages or different crops per page',
};

/**
 * Crop Top Margin
 */
export const cropTopProperty: INodeProperties = {
  displayName: 'Top Margin (Points)',
  name: 'cropTop',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  default: 0,
  description: 'Amount to crop from the top edge (in points, 72 points = 1 inch)',
};

/**
 * Crop Right Margin
 */
export const cropRightProperty: INodeProperties = {
  displayName: 'Right Margin (Points)',
  name: 'cropRight',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  default: 0,
  description: 'Amount to crop from the right edge (in points)',
};

/**
 * Crop Bottom Margin
 */
export const cropBottomProperty: INodeProperties = {
  displayName: 'Bottom Margin (Points)',
  name: 'cropBottom',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  default: 0,
  description: 'Amount to crop from the bottom edge (in points)',
};

/**
 * Crop Left Margin
 */
export const cropLeftProperty: INodeProperties = {
  displayName: 'Left Margin (Points)',
  name: 'cropLeft',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  default: 0,
  description: 'Amount to crop from the left edge (in points)',
};

/**
 * Signature Image URL
 */
export const signatureImageUrlProperty: INodeProperties = {
  displayName: 'Signature Image URL',
  name: 'signatureImageUrl',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: '',
  required: true,
  placeholder: 'https://example.com/signature.png',
  description: 'Public URL of the signature image (PNG or JPG)',
};

/**
 * Signature Page
 */
export const signaturePageProperty: INodeProperties = {
  displayName: 'Page Number',
  name: 'signaturePage',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: 1,
  description: 'Page number to place the signature on (1-based)',
};

/**
 * Signature X Position
 */
export const signatureXProperty: INodeProperties = {
  displayName: 'X Position (Points)',
  name: 'signatureX',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: 100,
  description: 'Horizontal position of the signature from the left edge (in points)',
};

/**
 * Signature Y Position
 */
export const signatureYProperty: INodeProperties = {
  displayName: 'Y Position (Points)',
  name: 'signatureY',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: 100,
  description: 'Vertical position of the signature from the bottom edge (in points)',
};

/**
 * Signature Width
 */
export const signatureWidthProperty: INodeProperties = {
  displayName: 'Width (Points)',
  name: 'signatureWidth',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: 150,
  description: 'Width of the signature image (in points)',
};

/**
 * Signature Height
 */
export const signatureHeightProperty: INodeProperties = {
  displayName: 'Height (Points)',
  name: 'signatureHeight',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: 50,
  description: 'Height of the signature image (in points)',
};

// ============================================================================
// NEW PROPERTIES FOR API PARITY (Added for full API alignment)
// ============================================================================

// ----------------------------------------------------------------------------
// CROP PDF - Region-based cropping (replaces margin-based approach)
// ----------------------------------------------------------------------------

/**
 * Crop Data JSON - Region-based crop areas
 * API expects: [{ pageNumber: 1, cropArea: { x, y, width, height, unit } }]
 */
export const cropDataProperty: INodeProperties = {
  displayName: 'Crop Data (JSON)',
  name: 'cropData',
  type: 'string',
  typeOptions: {
    rows: 6,
  },
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['crop'],
    },
  },
  default: '[{"pageNumber": 1, "cropArea": {"x": 50, "y": 50, "width": 500, "height": 700, "unit": "pt"}}]',
  description: 'JSON array defining crop regions. Each item: { pageNumber, cropArea: { x, y, width, height, unit } }. Units: pt (points), px, mm, in.',
  hint: 'For "all" mode, only the first entry is used. For "single" mode, only listed pages are included in output.',
};

// ----------------------------------------------------------------------------
// SIGN PDF - Full signature object with signerName and multi-page support
// ----------------------------------------------------------------------------

/**
 * Signer Name - Required fallback if image fails
 */
export const signerNameProperty: INodeProperties = {
  displayName: 'Signer Name',
  name: 'signerName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: '',
  required: true,
  placeholder: 'John Doe',
  description: 'Name of the signer (used as fallback if image embedding fails)',
};

/**
 * Signature Input Type - URL or Base64
 */
export const signatureInputTypeProperty: INodeProperties = {
  displayName: 'Signature Input Type',
  name: 'signatureInputType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  options: [
    { name: 'Image URL', value: 'url', description: 'Provide a public URL to the signature image' },
    { name: 'Base64 Data', value: 'base64', description: 'Provide base64-encoded signature image' },
  ],
  default: 'url',
  description: 'How to provide the signature image',
};

/**
 * Signature Data - Base64 encoded signature image
 */
export const signatureDataProperty: INodeProperties = {
  displayName: 'Signature Image (Base64)',
  name: 'signatureData',
  type: 'string',
  typeOptions: {
    rows: 4,
  },
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
      signatureInputType: ['base64'],
    },
  },
  default: '',
  placeholder: 'iVBORw0KGgoAAAANSUhEUgAA...',
  description: 'Base64-encoded signature image (PNG or JPG)',
};

/**
 * Signatures JSON - Multi-page signature placements
 */
export const signaturesJsonProperty: INodeProperties = {
  displayName: 'Signature Placements (JSON)',
  name: 'signaturesJson',
  type: 'string',
  typeOptions: {
    rows: 4,
  },
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['sign'],
    },
  },
  default: '[{"page": 1, "x": 100, "y": 500, "width": 200, "height": 50}]',
  description: 'JSON array of signature placements. Each: { page, x, y, width, height }. Coordinates in points from top-left.',
  hint: 'Add multiple entries to sign on multiple pages in one operation.',
};

// ----------------------------------------------------------------------------
// MARKDOWN TO PDF - Input method for raw text (replaces broken URL)
// ----------------------------------------------------------------------------

/**
 * Markdown Input Method - Binary, Text, or URL
 */
export const markdownInputMethodProperty: INodeProperties = {
  displayName: 'Input Method',
  name: 'markdownInputMethod',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['markdownToPdf'],
    },
  },
  options: [
    {
      name: 'Binary Data',
      value: 'binary',
      description: 'Use markdown file from a previous node',
    },
    {
      name: 'Raw Markdown',
      value: 'text',
      description: 'Enter markdown content directly',
    },
    {
      name: 'URL',
      value: 'url',
      description: 'Fetch markdown file from a public URL',
    },
  ],
  default: 'binary',
  description: 'How to provide the markdown content',
};

/**
 * Markdown Content - Raw text input
 */
export const markdownContentProperty: INodeProperties = {
  displayName: 'Markdown Content',
  name: 'markdownContent',
  type: 'string',
  typeOptions: {
    rows: 10,
  },
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['markdownToPdf'],
      markdownInputMethod: ['text'],
    },
  },
  default: '',
  placeholder: '# Hello World\n\nThis is **bold** and *italic* text.',
  description: 'Raw Markdown content to convert to PDF',
};

/**
 * Markdown Binary Property Name (for file upload)
 */
export const markdownBinaryPropertyNameProperty: INodeProperties = {
  displayName: 'Input Binary Property',
  name: 'binaryPropertyName',
  type: 'string',
  default: 'data',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['markdownToPdf'],
      markdownInputMethod: ['binary'],
    },
  },
  description: 'Name of the binary property containing the markdown file',
  hint: 'The property name from a previous node (e.g., "data" from HTTP Request)',
};

/**
 * Markdown URL (for URL input)
 */
export const markdownUrlProperty: INodeProperties = {
  displayName: 'Markdown File URL',
  name: 'markdownUrl',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['markdownToPdf'],
      markdownInputMethod: ['url'],
    },
  },
  default: '',
  placeholder: 'https://example.com/document.md',
  description: 'URL of the markdown file to fetch and convert',
};

// ----------------------------------------------------------------------------
// HTML TO PDF - Advanced options for PDF generation
// ----------------------------------------------------------------------------

/**
 * Print Background
 */
export const printBackgroundProperty: INodeProperties = {
  displayName: 'Print Background',
  name: 'printBackground',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: true,
  description: 'Whether to print background colors and images',
};

/**
 * Scale
 */
export const scaleProperty: INodeProperties = {
  displayName: 'Scale',
  name: 'scale',
  type: 'number',
  typeOptions: {
    minValue: 0.1,
    maxValue: 2,
    numberStepSize: 0.1,
  },
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: 1,
  description: 'Scale factor for rendering (0.1 to 2)',
};

/**
 * Margin Top
 */
export const marginTopProperty: INodeProperties = {
  displayName: 'Margin Top',
  name: 'marginTop',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: '0mm',
  placeholder: '10mm',
  description: 'Top margin (e.g., "10mm", "1in", "72pt")',
};

/**
 * Margin Right
 */
export const marginRightProperty: INodeProperties = {
  displayName: 'Margin Right',
  name: 'marginRight',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: '0mm',
  placeholder: '10mm',
  description: 'Right margin',
};

/**
 * Margin Bottom
 */
export const marginBottomProperty: INodeProperties = {
  displayName: 'Margin Bottom',
  name: 'marginBottom',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: '0mm',
  placeholder: '10mm',
  description: 'Bottom margin',
};

/**
 * Margin Left
 */
export const marginLeftProperty: INodeProperties = {
  displayName: 'Margin Left',
  name: 'marginLeft',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: '0mm',
  placeholder: '10mm',
  description: 'Left margin',
};

/**
 * Wait Until - Navigation strategy
 */
export const waitUntilProperty: INodeProperties = {
  displayName: 'Wait Until',
  name: 'waitUntil',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  options: [
    { name: 'Load', value: 'load', description: 'Wait for load event' },
    { name: 'DOM Content Loaded', value: 'domcontentloaded', description: 'Wait for DOMContentLoaded event' },
    { name: 'Network Idle (0)', value: 'networkidle0', description: 'Wait until no network connections for 500ms' },
    { name: 'Network Idle (2)', value: 'networkidle2', description: 'Wait until max 2 network connections for 500ms' },
  ],
  default: 'networkidle2',
  description: 'When to consider navigation complete',
};

/**
 * Timeout
 */
export const timeoutProperty: INodeProperties = {
  displayName: 'Timeout (Ms)',
  name: 'timeout',
  type: 'number',
  typeOptions: {
    minValue: 1000,
    maxValue: 55000,
  },
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: 55000,
  description: 'Maximum time to wait for page load (max 55000ms)',
};

/**
 * Wait For Selector
 */
export const waitForSelectorProperty: INodeProperties = {
  displayName: 'Wait For Selector',
  name: 'waitForSelector',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: '',
  placeholder: '#content, .main-container',
  description: 'CSS selector to wait for before generating PDF (optional)',
};

/**
 * Force Browser Rendering
 */
export const forceBrowserRenderingProperty: INodeProperties = {
  displayName: 'Force Browser Rendering',
  name: 'forceBrowserRendering',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['htmlToPdf'],
    },
  },
  default: false,
  description: 'Whether to force Puppeteer/Chromium instead of wkhtmltopdf for rendering',
};

// ----------------------------------------------------------------------------
// IMAGE TO PDF - Page and layout options
// ----------------------------------------------------------------------------

/**
 * Image to PDF Page Size
 */
export const imageToPdfPageSizeProperty: INodeProperties = {
  displayName: 'Page Size',
  name: 'pageSize',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['imageToPdf'],
    },
  },
  options: [
    { name: 'A4', value: 'A4' },
    { name: 'Letter', value: 'Letter' },
    { name: 'Legal', value: 'Legal' },
    { name: 'Original (Fit to Image)', value: 'Original' },
  ],
  default: 'A4',
  description: 'Page size for the output PDF',
};

/**
 * Image to PDF Margin
 */
export const imageToPdfMarginProperty: INodeProperties = {
  displayName: 'Margin (Points)',
  name: 'margin',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['imageToPdf'],
    },
  },
  default: 36,
  description: 'Margin around images in points (72 points = 1 inch)',
};

/**
 * Background Color
 */
export const backgroundColorProperty: INodeProperties = {
  displayName: 'Background Color',
  name: 'backgroundColor',
  type: 'color',
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['imageToPdf'],
    },
  },
  default: '#FFFFFF',
  placeholder: '#FFFFFF',
  description: 'Background color in hex format',
};

/**
 * Image Order JSON
 */
export const imageOrderProperty: INodeProperties = {
  displayName: 'Image Order (JSON)',
  name: 'imageOrder',
  type: 'string',
  typeOptions: {
    rows: 4,
  },
  displayOptions: {
    show: {
      resource: ['formatToPdf'],
      operation: ['imageToPdf'],
    },
  },
  default: '',
  placeholder: '[{"name": "photo1.jpg", "rotation": 0, "order": 0}]',
  description: 'Optional JSON array to control order and rotation: [{ name, rotation (0/90/180/270), order }]',
};

// ----------------------------------------------------------------------------
// PROTECT PDF - Encryption and permissions
// ----------------------------------------------------------------------------

/**
 * Encryption Level
 */
export const encryptionLevelProperty: INodeProperties = {
  displayName: 'Encryption Level',
  name: 'encryptionLevel',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  options: [
    { name: '128-bit', value: '128' },
    { name: '256-Bit (Recommended)', value: '256' },
  ],
  default: '256',
  description: 'Encryption strength for the protected PDF',
};

/**
 * Permission: Modifying
 */
export const permModifyingProperty: INodeProperties = {
  displayName: 'Allow Modifying',
  name: 'permModifying',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to allow document modification',
};

/**
 * Permission: Copying
 */
export const permCopyingProperty: INodeProperties = {
  displayName: 'Allow Copying',
  name: 'permCopying',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to allow copying text and images',
};

/**
 * Permission: Annotating
 */
export const permAnnotatingProperty: INodeProperties = {
  displayName: 'Allow Annotating',
  name: 'permAnnotating',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to allow adding comments and annotations',
};

/**
 * Permission: Filling Forms
 */
export const permFillingFormsProperty: INodeProperties = {
  displayName: 'Allow Filling Forms',
  name: 'permFillingForms',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to allow filling in form fields',
};

/**
 * Permission: Content Accessibility
 */
export const permContentAccessibilityProperty: INodeProperties = {
  displayName: 'Allow Content Accessibility',
  name: 'permContentAccessibility',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to enable content access for screen readers',
};

/**
 * Permission: Document Assembly
 */
export const permDocumentAssemblyProperty: INodeProperties = {
  displayName: 'Allow Document Assembly',
  name: 'permDocumentAssembly',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['securitySigning'],
      operation: ['protect'],
    },
  },
  default: true,
  description: 'Whether to allow inserting, rotating, or deleting pages',
};

// ----------------------------------------------------------------------------
// WATERMARK PDF - Font size, color, dimensions, and page selection
// ----------------------------------------------------------------------------

/**
 * Watermark Font Size
 */
export const watermarkFontSizeProperty: INodeProperties = {
  displayName: 'Font Size',
  name: 'watermarkFontSize',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['watermark'],
      watermarkType: ['text'],
    },
  },
  default: 48,
  description: 'Font size for text watermark in points',
};

/**
 * Watermark Color
 */
export const watermarkColorProperty: INodeProperties = {
  displayName: 'Color',
  name: 'watermarkColor',
  type: 'color',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['watermark'],
      watermarkType: ['text'],
    },
  },
  default: '#000000',
  placeholder: '#FF0000',
  description: 'Text color in hex format',
};

/**
 * Watermark Width (for image)
 */
export const watermarkWidthProperty: INodeProperties = {
  displayName: 'Width (Points)',
  name: 'watermarkWidth',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['watermark'],
      watermarkType: ['image'],
    },
  },
  default: 0,
  description: 'Width of watermark image in points (0 = auto)',
};

/**
 * Watermark Height (for image)
 */
export const watermarkHeightProperty: INodeProperties = {
  displayName: 'Height (Points)',
  name: 'watermarkHeight',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['watermark'],
      watermarkType: ['image'],
    },
  },
  default: 0,
  description: 'Height of watermark image in points (0 = auto)',
};

/**
 * Watermark Pages
 */
export const watermarkPagesProperty: INodeProperties = {
  displayName: 'Pages',
  name: 'watermarkPages',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['watermark'],
    },
  },
  default: 'all',
  placeholder: 'all, 1,3,5, or 1-5',
  description: 'Which pages to watermark: "all", specific pages "1,3,5", or range "1-5"',
};

// ----------------------------------------------------------------------------
// PDF TO IMAGE - JPEG Quality
// ----------------------------------------------------------------------------

/**
 * JPEG Quality
 */
export const jpegQualityProperty: INodeProperties = {
  displayName: 'JPEG Quality',
  name: 'jpegQuality',
  type: 'number',
  typeOptions: {
    minValue: 1,
    maxValue: 100,
  },
  displayOptions: {
    show: {
      resource: ['pdfToFormat'],
      operation: ['pdfToImage'],
      imageFormat: ['jpg'],
    },
  },
  default: 85,
  description: 'JPEG compression quality (1-100, higher = better quality, larger file)',
};

// ----------------------------------------------------------------------------
// SPLIT PDF - Page numbers for individual mode
// ----------------------------------------------------------------------------

/**
 * Page Numbers (for individual split mode)
 */
export const pageNumbersProperty: INodeProperties = {
  displayName: 'Page Numbers (JSON)',
  name: 'pageNumbers',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['split'],
      splitMode: ['individual'],
    },
  },
  default: '[1, 2, 3]',
  placeholder: '[1, 3, 5, 7]',
  description: 'JSON array of specific page numbers to extract',
};

// ----------------------------------------------------------------------------
// ROTATE PDF - Per-page rotations
// ----------------------------------------------------------------------------

/**
 * Rotations JSON - Per-page rotation angles
 */
export const rotationsProperty: INodeProperties = {
  displayName: 'Per-Page Rotations (JSON)',
  name: 'rotations',
  type: 'string',
  typeOptions: {
    rows: 3,
  },
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['rotate'],
    },
  },
  default: '',
  placeholder: '{"1": 90, "3": 180, "5": 270}',
  description: 'JSON object mapping page numbers to rotation angles. Overrides global angle when provided.',
  hint: 'Leave empty to use global rotation angle for specified pages.',
};

// ----------------------------------------------------------------------------
// ORGANIZE PDF - Rotated pages during reorganization
// ----------------------------------------------------------------------------

/**
 * Rotated Pages
 */
export const rotatedPagesProperty: INodeProperties = {
  displayName: 'Rotated Pages (JSON)',
  name: 'rotatedPages',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['documentManagement'],
      operation: ['organize'],
    },
  },
  default: '',
  placeholder: '[2, 4]',
  description: 'JSON array of page numbers to rotate 90 degrees clockwise during reorganization',
};

// ----------------------------------------------------------------------------
// PDF TO EXCEL - Mode and regions
// ----------------------------------------------------------------------------

/**
 * Excel Conversion Mode
 */
export const excelModeProperty: INodeProperties = {
  displayName: 'Mode',
  name: 'excelMode',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pdfToFormat'],
      operation: ['pdfToExcel'],
    },
  },
  options: [
    { name: 'Convert (Extract Tables)', value: 'convert', description: 'Extract tables and create Excel file' },
    { name: 'Detect (Find Table Regions)', value: 'detect', description: 'Return JSON with detected table locations' },
  ],
  default: 'convert',
  description: 'Convert mode extracts tables to Excel. Detect mode returns table region coordinates.',
};

/**
 * Excel Regions JSON
 */
export const excelRegionsProperty: INodeProperties = {
  displayName: 'Table Regions (JSON)',
  name: 'excelRegions',
  type: 'string',
  typeOptions: {
    rows: 4,
  },
  displayOptions: {
    show: {
      resource: ['pdfToFormat'],
      operation: ['pdfToExcel'],
      excelMode: ['convert'],
    },
  },
  default: '',
  placeholder: '[{"page": 1, "x": 50, "y": 100, "width": 500, "height": 200}]',
  description: 'Optional JSON array defining explicit table regions to extract. Leave empty for auto-detection.',
};
