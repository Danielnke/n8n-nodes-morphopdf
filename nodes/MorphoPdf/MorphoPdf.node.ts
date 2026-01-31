import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
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
  outputBinaryPropertyNameProperty,
  qualityProperty,
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
  pageFormatProperty,
  landscapeProperty,
  ocrForScannedProperty,
  // New properties for organize, crop, and sign
  newPageOrderProperty,
  cropModeProperty,
  cropTopProperty,
  cropRightProperty,
  cropBottomProperty,
  cropLeftProperty,
  signatureImageUrlProperty,
  signaturePageProperty,
  signatureXProperty,
  signatureYProperty,
  signatureWidthProperty,
  signatureHeightProperty,
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
      resourceProperty,
      documentManagementOperationProperty,
      pdfToFormatOperationProperty,
      formatToPdfOperationProperty,
      securitySigningOperationProperty,
      inputMethodProperty,
      binaryPropertyNameProperty,
      fileUrlProperty,
      fileUrlsProperty,
      outputBinaryPropertyNameProperty,
      // Document Management parameters
      qualityProperty,
      splitModeProperty,
      rangesProperty,
      rotationAngleProperty,
      rotatePagesProperty,
      // Organize parameters
      newPageOrderProperty,
      // Crop parameters
      cropModeProperty,
      cropTopProperty,
      cropRightProperty,
      cropBottomProperty,
      cropLeftProperty,
      // Watermark parameters
      watermarkTypeProperty,
      watermarkTextProperty,
      watermarkImageUrlProperty,
      watermarkPositionProperty,
      watermarkOpacityProperty,
      watermarkRotationProperty,
      // Security & Signing parameters
      userPasswordProperty,
      ownerPasswordProperty,
      passwordProperty,
      // Sign parameters
      signatureImageUrlProperty,
      signaturePageProperty,
      signatureXProperty,
      signatureYProperty,
      signatureWidthProperty,
      signatureHeightProperty,
      // PDF to Format parameters
      imageFormatProperty,
      dpiProperty,
      pageRangeProperty,
      ocrForScannedProperty,
      // Format to PDF parameters
      htmlSourceTypeProperty,
      htmlUrlProperty,
      htmlContentProperty,
      pageFormatProperty,
      landscapeProperty,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
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
  }
}
