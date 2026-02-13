import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
  resourceProperty,
  documentManagementOperationProperty,
  pdfToFormatOperationProperty,
  formatToPdfOperationProperty,
  securitySigningOperationProperty,
  inputMethodProperty,
  binaryPropertyNameProperty,
  fileUrlProperty,
  fileUrlsProperty,
  outputTypeProperty,
  outputBinaryPropertyNameProperty,
  splitModeProperty,
  rangesProperty,
  rotationAngleProperty,
  rotatePagesProperty,
  watermarkTypeProperty,
  watermarkTextProperty,
  watermarkImageUrlProperty,
  watermarkPositionProperty,
  watermarkOpacityProperty,
  watermarkRotationProperty,
  userPasswordProperty,
  ownerPasswordProperty,
  passwordProperty,
  imageFormatProperty,
  dpiProperty,
  pageRangeProperty,
  htmlSourceTypeProperty,
  htmlUrlProperty,
  htmlContentProperty,
  htmlBinaryPropertyNameProperty,
  pageFormatProperty,
  landscapeProperty,
  ocrForScannedProperty,
  // New properties for organize, crop, and sign
  newPageOrderProperty,
  cropModeProperty,
  cropDataProperty,
  // Sign properties - new API structure
  signerNameProperty,
  signatureInputTypeProperty,
  signatureImageUrlProperty,
  signatureDataProperty,
  signaturesJsonProperty,
  // Markdown to PDF
  markdownInputMethodProperty,
  markdownContentProperty,
  markdownBinaryPropertyNameProperty,
  markdownUrlProperty,
  // New properties for enhanced operations (Tasks 9-13)
  // PDF to Image - JPEG quality
  jpegQualityProperty,
  // Split PDF - page numbers for individual mode
  pageNumbersProperty,
  // Rotate PDF - per-page rotations (use rotationsProperty)
  rotationsProperty,
  // Organize PDF - rotated pages
  rotatedPagesProperty,
  // PDF to Excel - mode and regions
  excelModeProperty,
  excelRegionsProperty,
  // HTML to PDF - extended options
  printBackgroundProperty,
  scaleProperty,
  marginTopProperty,
  marginRightProperty,
  marginBottomProperty,
  marginLeftProperty,
  waitUntilProperty,
  timeoutProperty,
  waitForSelectorProperty,
  forceBrowserRenderingProperty,
  // Image to PDF - extended options
  imageToPdfPageSizeProperty,
  imageToPdfMarginProperty,
  imageFileUrlsProperty,
  backgroundColorProperty,
  imageOrderProperty,
  // Protect PDF - encryption level and permissions
  encryptionLevelProperty,
  permModifyingProperty,
  permCopyingProperty,
  permAnnotatingProperty,
  permFillingFormsProperty,
  permContentAccessibilityProperty,
  permDocumentAssemblyProperty,
  // Watermark - extended options
  watermarkFontSizeProperty,
  watermarkColorProperty,
  watermarkWidthProperty,
  watermarkHeightProperty,
  watermarkPagesProperty,
} from './shared/descriptions';

// Document Management operations
import { executeMerge } from './actions/documentManagement/merge.operation';
import { executeSplit } from './actions/documentManagement/split.operation';
import { executeCompress } from './actions/documentManagement/compress.operation';
import { executeRotate } from './actions/documentManagement/rotate.operation';
import { executeCrop } from './actions/documentManagement/crop.operation';
import { executeOrganize } from './actions/documentManagement/organize.operation';
import { executeWatermark } from './actions/documentManagement/watermark.operation';

// Security & Signing operations
import { executeSign } from './actions/securitySigning/sign.operation';
import { executeProtect } from './actions/securitySigning/protect.operation';
import { executeUnlock } from './actions/securitySigning/unlock.operation';

// PDF to Format operations
import { executePdfToWord } from './actions/pdfToFormat/pdfToWord.operation';
import { executePdfToExcel } from './actions/pdfToFormat/pdfToExcel.operation';
import { executePdfToPowerpoint } from './actions/pdfToFormat/pdfToPowerpoint.operation';
import { executePdfToImage } from './actions/pdfToFormat/pdfToImage.operation';

// Format to PDF operations
import { executeWordToPdf } from './actions/formatToPdf/wordToPdf.operation';
import { executeExcelToPdf } from './actions/formatToPdf/excelToPdf.operation';
import { executePowerpointToPdf } from './actions/formatToPdf/powerpointToPdf.operation';
import { executeImageToPdf } from './actions/formatToPdf/imageToPdf.operation';
import { executeHtmlToPdf } from './actions/formatToPdf/htmlToPdf.operation';
import { executeMarkdownToPdf } from './actions/formatToPdf/markdownToPdf.operation';

export class MorphoPdf implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MorphoPDF',
    name: 'morphoPdf',
    icon: 'file:morphopdf.svg',
    iconColor: 'blue',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Professional PDF processing - merge, split, convert, compress, protect & more',
    defaults: {
      name: 'MorphoPDF',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [
      {
        name: 'morphoPdfApi',
        required: true,
      },
    ],
    properties: [
      // 1. Resource & Operation Selection
      resourceProperty,
      documentManagementOperationProperty,
      pdfToFormatOperationProperty,
      formatToPdfOperationProperty,
      securitySigningOperationProperty,

      // 2. Input Configuration (Input Method & Source)
      // Global Input Method (Hidden for HTML/Markdown)
      inputMethodProperty,
      // HTML Input Method
      htmlSourceTypeProperty,
      // Markdown Input Method
      markdownInputMethodProperty,

      // 3. Input Fields (URLs, Content, File Properties)
      // Global File URL
      fileUrlProperty,
      // Multiple File URLs (Merge)
      fileUrlsProperty,
      // HTML Inputs
      htmlUrlProperty,
      htmlContentProperty,
      // Markdown Inputs
      markdownContentProperty,
      markdownUrlProperty,

      // Binary Property Names
      binaryPropertyNameProperty,
      htmlBinaryPropertyNameProperty,
      markdownBinaryPropertyNameProperty,

      // 4. Operation Parameters
      // Document Management
      splitModeProperty,
      rangesProperty,
      pageNumbersProperty,

      rotationAngleProperty,
      rotatePagesProperty,
      rotationsProperty,

      newPageOrderProperty,
      rotatedPagesProperty,

      cropModeProperty,
      cropDataProperty,

      // Watermark
      watermarkTypeProperty,
      watermarkTextProperty,
      watermarkImageUrlProperty,
      watermarkPositionProperty,
      watermarkOpacityProperty,
      watermarkRotationProperty,
      watermarkFontSizeProperty,
      watermarkColorProperty,
      watermarkWidthProperty,
      watermarkHeightProperty,
      watermarkPagesProperty,

      // Security & Signing
      userPasswordProperty,
      ownerPasswordProperty,
      passwordProperty,
      signerNameProperty,
      signatureInputTypeProperty,
      signatureImageUrlProperty,
      signatureDataProperty,
      signaturesJsonProperty,
      encryptionLevelProperty,
      permModifyingProperty,
      permCopyingProperty,
      permAnnotatingProperty,
      permFillingFormsProperty,
      permContentAccessibilityProperty,
      permDocumentAssemblyProperty,

      // PDF to Format
      imageFormatProperty,
      dpiProperty,
      jpegQualityProperty,
      pageRangeProperty,
      ocrForScannedProperty,
      excelModeProperty,
      excelRegionsProperty,

      // Format to PDF
      pageFormatProperty,
      landscapeProperty,
      // HTML to PDF options
      printBackgroundProperty,
      scaleProperty,
      marginTopProperty,
      marginRightProperty,
      marginBottomProperty,
      marginLeftProperty,
      waitUntilProperty,
      timeoutProperty,
      waitForSelectorProperty,
      forceBrowserRenderingProperty,
      // Image to PDF options
      imageToPdfPageSizeProperty,
      imageToPdfMarginProperty,
      imageFileUrlsProperty,
      backgroundColorProperty,
      imageOrderProperty,

      // 5. Output Configuration (Last)
      outputTypeProperty,
      outputBinaryPropertyNameProperty,
    ],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    // Dynamic requires — these exist in n8n's runtime but are NOT in our package.json
    const { DynamicStructuredTool } = require('@langchain/core/tools') as {
      DynamicStructuredTool: any;
    };
    const { z } = require('zod') as { z: any };

    const ctx = this;
    const resource = ctx.getNodeParameter('resource', itemIndex) as string;
    const operation = ctx.getNodeParameter('operation', itemIndex) as string;

    // Sanitize node name for LangChain tool name (alphanumeric + underscores only)
    const rawName = ctx.getNode().name || 'MorphoPDF';
    const toolName = rawName.replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_|_$/g, '') || 'MorphoPDF';

    // Human-readable operation descriptions
    const operationDescriptions: Record<string, Record<string, string>> = {
      documentManagement: {
        merge: 'Merge multiple PDF files into one',
        split: 'Split a PDF into separate files',
        compress: 'Compress a PDF to reduce file size',
        rotate: 'Rotate pages of a PDF',
        crop: 'Crop pages of a PDF',
        organize: 'Reorganize pages of a PDF',
        watermark: 'Add a watermark to a PDF',
      },
      securitySigning: {
        protect: 'Password-protect a PDF',
        unlock: 'Remove password protection from a PDF',
        sign: 'Digitally sign a PDF',
      },
      pdfToFormat: {
        pdfToWord: 'Convert a PDF to Word document',
        pdfToExcel: 'Convert a PDF to Excel spreadsheet',
        pdfToPowerpoint: 'Convert a PDF to PowerPoint presentation',
        pdfToImage: 'Convert PDF pages to images',
      },
      formatToPdf: {
        wordToPdf: 'Convert a Word document to PDF',
        excelToPdf: 'Convert an Excel spreadsheet to PDF',
        powerpointToPdf: 'Convert a PowerPoint presentation to PDF',
        imageToPdf: 'Convert images to a PDF document',
        htmlToPdf: 'Convert HTML or a webpage to PDF',
        markdownToPdf: 'Convert Markdown content to PDF',
      },
    };

    const description =
      operationDescriptions[resource]?.[operation] ||
      `Process a PDF using MorphoPDF (${resource}/${operation})`;

    // API endpoint map
    const endpointMap: Record<string, Record<string, string>> = {
      documentManagement: {
        merge: '/pdf/merge',
        split: '/pdf/split',
        compress: '/pdf/compress',
        rotate: '/pdf/rotate',
        crop: '/pdf/crop',
        organize: '/pdf/organize',
        watermark: '/pdf/watermark',
      },
      securitySigning: {
        protect: '/pdf/protect',
        unlock: '/pdf/unlock',
        sign: '/pdf/sign',
      },
      pdfToFormat: {
        pdfToWord: '/convert/pdf-to-word',
        pdfToExcel: '/convert/pdf-to-excel',
        pdfToPowerpoint: '/convert/pdf-to-ppt',
        pdfToImage: '/convert/pdf-to-image',
      },
      formatToPdf: {
        wordToPdf: '/convert/word-to-pdf',
        excelToPdf: '/convert/excel-to-pdf',
        powerpointToPdf: '/convert/ppt-to-pdf',
        imageToPdf: '/convert/image-to-pdf',
        htmlToPdf: '/convert/html-to-pdf',
        markdownToPdf: '/convert/markdown-to-pdf',
      },
    };

    const endpoint = endpointMap[resource]?.[operation];
    if (!endpoint) {
      throw new NodeOperationError(
        ctx.getNode(),
        `No endpoint found for ${resource}/${operation}`,
      );
    }

    // Build Zod schema based on the operation
    let schema: any;
    if (operation === 'merge') {
      schema = z.object({
        fileUrls: z
          .string()
          .describe('Comma-separated URLs of PDF files to merge'),
      });
    } else if (operation === 'imageToPdf') {
      schema = z.object({
        imageUrls: z
          .string()
          .describe('Comma-separated image URLs to convert to PDF'),
      });
    } else if (operation === 'htmlToPdf') {
      schema = z.object({
        url: z.string().optional().describe('URL of the webpage to convert'),
        htmlContent: z
          .string()
          .optional()
          .describe('Raw HTML content to convert'),
      });
    } else if (operation === 'markdownToPdf') {
      schema = z.object({
        markdownContent: z
          .string()
          .optional()
          .describe('Markdown content to convert'),
        markdownUrl: z
          .string()
          .optional()
          .describe('URL to a markdown file to convert'),
      });
    } else {
      // Default: single file URL operations
      schema = z.object({
        fileUrl: z
          .string()
          .describe('URL of the PDF or file to process'),
      });
    }

    const tool = new DynamicStructuredTool({
      name: toolName,
      description,
      schema,
      func: async (args: Record<string, string>) => {
        const { index } = ctx.addInputData(NodeConnectionTypes.AiTool, [[{ json: args }]]);

        try {
          // Build request body based on operation
          let body: Record<string, unknown>;

          if (operation === 'merge') {
            const urls = args.fileUrls.split(',').map((u: string) => u.trim()).filter(Boolean);
            body = { urls };
          } else if (operation === 'imageToPdf') {
            const urls = args.imageUrls.split(',').map((u: string) => u.trim()).filter(Boolean);
            body = { urls };
          } else if (operation === 'htmlToPdf') {
            if (args.htmlContent) {
              body = { html: args.htmlContent };
            } else if (args.url) {
              body = { url: args.url };
            } else {
              const response = 'Error: Please provide either a URL or HTML content';
              ctx.addOutputData(NodeConnectionTypes.AiTool, itemIndex, [[{ json: { response } }]]);
              return response;
            }
          } else if (operation === 'markdownToPdf') {
            if (args.markdownContent) {
              body = { markdown: args.markdownContent };
            } else if (args.markdownUrl) {
              body = { url: args.markdownUrl };
            } else {
              const response = 'Error: Please provide either markdown content or a markdown URL';
              ctx.addOutputData(NodeConnectionTypes.AiTool, itemIndex, [[{ json: { response } }]]);
              return response;
            }
          } else {
            body = { url: args.fileUrl };
          }

          const requestOptions = {
            method: 'POST' as const,
            url: `https://api.morphopdf.com/v1${endpoint}`,
            body,
            headers: { 'Content-Type': 'application/json' },
            json: true,
          };

          const result = (await ctx.helpers.httpRequestWithAuthentication.call(
            ctx,
            'morphoPdfApi',
            requestOptions,
          )) as {
            success?: boolean;
            downloadUrl?: string;
            fileName?: string;
            outputSize?: number;
            message?: string;
          };

          let downloadUrl = result.downloadUrl || '';
          if (downloadUrl.startsWith('/')) {
            downloadUrl = `https://api.morphopdf.com${downloadUrl}`;
          }

          const response = result.success
            ? `Successfully completed "${description}". Download URL: ${downloadUrl} (expires in 1 hour). File: ${result.fileName || 'output'}, Size: ${result.outputSize || 'unknown'} bytes.`
            : `Error: ${result.message || 'Operation failed'}`;

          ctx.addOutputData(NodeConnectionTypes.AiTool, itemIndex, [[{ json: { response } }]]);
          return response;
        } catch (error) {
          const errMsg = `Error: ${(error as Error).message}`;
          ctx.addOutputData(NodeConnectionTypes.AiTool, itemIndex, [[{ json: { response: errMsg } }]]);
          return errMsg;
        }
      },
    });

    return { response: tool };
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    try {
      let items = this.getInputData();
      // When called as AI tool, getInputData() returns empty because the tool
      // wrapper creates context with no Main input data. Create a synthetic
      // item so the for loop executes at least once.
      if (items.length === 0) {
        items = [{ json: {} }];
      }
      const returnData: INodeExecutionData[] = [];

      const resource = this.getNodeParameter('resource', 0) as string;
      const operation = this.getNodeParameter('operation', 0) as string;

      // For merge operation, process all items at once
      if (resource === 'documentManagement' && operation === 'merge') {
        try {
          const result = await executeMerge.call(this, items);
          returnData.push(result);
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: { error: (error as Error).message },
              pairedItem: { item: 0 },
            });
          } else {
            throw error;
          }
        }
        return [returnData];
      }

      // For other operations, process each item individually
      for (let i = 0; i < items.length; i++) {
        try {
          let result: INodeExecutionData;

          // Document Management operations
          if (resource === 'documentManagement') {
            switch (operation) {
              case 'split':
                result = await executeSplit.call(this, i);
                break;
              case 'compress':
                result = await executeCompress.call(this, i);
                break;
              case 'rotate':
                result = await executeRotate.call(this, i);
                break;
              case 'crop':
                result = await executeCrop.call(this, i);
                break;
              case 'organize':
                result = await executeOrganize.call(this, i);
                break;
              case 'watermark':
                result = await executeWatermark.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unsupported Document Management operation: ${operation}`,
                );
            }
          }
          // PDF to Format operations
          else if (resource === 'pdfToFormat') {
            switch (operation) {
              case 'pdfToWord':
                result = await executePdfToWord.call(this, i);
                break;
              case 'pdfToExcel':
                result = await executePdfToExcel.call(this, i);
                break;
              case 'pdfToPowerpoint':
                result = await executePdfToPowerpoint.call(this, i);
                break;
              case 'pdfToImage':
                result = await executePdfToImage.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unsupported PDF to Format operation: ${operation}`,
                );
            }
          }
          // Format to PDF operations
          else if (resource === 'formatToPdf') {
            switch (operation) {
              case 'wordToPdf':
                result = await executeWordToPdf.call(this, i);
                break;
              case 'excelToPdf':
                result = await executeExcelToPdf.call(this, i);
                break;
              case 'powerpointToPdf':
                result = await executePowerpointToPdf.call(this, i);
                break;
              case 'imageToPdf':
                result = await executeImageToPdf.call(this, i);
                break;
              case 'htmlToPdf':
                result = await executeHtmlToPdf.call(this, i);
                break;
              case 'markdownToPdf':
                result = await executeMarkdownToPdf.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unsupported Format to PDF operation: ${operation}`,
                );
            }
          }
          // Security & Signing operations
          else if (resource === 'securitySigning') {
            switch (operation) {
              case 'sign':
                result = await executeSign.call(this, i);
                break;
              case 'protect':
                result = await executeProtect.call(this, i);
                break;
              case 'unlock':
                result = await executeUnlock.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unsupported Security & Signing operation: ${operation}`,
                );
            }
          } else {
            throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
          }

          returnData.push(result);
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: { error: (error as Error).message },
              pairedItem: { item: i },
            });
          } else {
            throw error;
          }
        }
      }

      return [returnData];
    } catch (error) {
      // Top-level catch: return error as JSON so AI agent gets meaningful feedback
      // instead of an empty string when used via usableAsTool
      return [[{
        json: {
          success: false,
          error: (error as Error).message,
          message: `MorphoPDF tool error: ${(error as Error).message}`,
        },
      }]];
    }
  }
}
