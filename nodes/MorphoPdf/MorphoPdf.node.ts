import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
  resourceProperty,
  pdfOperationProperty,
  convertOperationProperty,
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
} from './shared/descriptions';

import { executeMerge } from './actions/pdf/merge.operation';
import { executeSplit } from './actions/pdf/split.operation';
import { executeCompress } from './actions/pdf/compress.operation';
import { executeRotate } from './actions/pdf/rotate.operation';
import { executeCrop } from './actions/pdf/crop.operation';
import { executeOrganize } from './actions/pdf/organize.operation';
import { executeEdit } from './actions/pdf/edit.operation';
import { executeWatermark } from './actions/pdf/watermark.operation';
import { executeSign } from './actions/pdf/sign.operation';
import { executeProtect } from './actions/pdf/protect.operation';
import { executeUnlock } from './actions/pdf/unlock.operation';
import { executePdfToWord } from './actions/convert/pdfToWord.operation';
import { executePdfToExcel } from './actions/convert/pdfToExcel.operation';
import { executePdfToPowerpoint } from './actions/convert/pdfToPowerpoint.operation';
import { executePdfToImage } from './actions/convert/pdfToImage.operation';
import { executeWordToPdf } from './actions/convert/wordToPdf.operation';
import { executeExcelToPdf } from './actions/convert/excelToPdf.operation';
import { executePowerpointToPdf } from './actions/convert/powerpointToPdf.operation';
import { executeImageToPdf } from './actions/convert/imageToPdf.operation';
import { executeHtmlToPdf } from './actions/convert/htmlToPdf.operation';
import { executeMarkdownToPdf } from './actions/convert/markdownToPdf.operation';

export class MorphoPdf implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MorphoPDF',
    name: 'morphoPdf',
    icon: 'file:morphopdf.svg',
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
      pdfOperationProperty,
      convertOperationProperty,
      inputMethodProperty,
      binaryPropertyNameProperty,
      fileUrlProperty,
      fileUrlsProperty,
      outputBinaryPropertyNameProperty,
      // PDF operation parameters
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
      // Convert operation parameters
      imageFormatProperty,
      dpiProperty,
      pageRangeProperty,
      htmlSourceTypeProperty,
      htmlUrlProperty,
      htmlContentProperty,
      pageFormatProperty,
      landscapeProperty,
      ocrForScannedProperty,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    // For merge operation, process all items at once
    if (resource === 'pdf' && operation === 'merge') {
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

        // PDF operations
        if (resource === 'pdf') {
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
            case 'edit':
              result = await executeEdit.call(this, i);
              break;
            case 'sign':
              result = await executeSign.call(this, i);
              break;
            case 'watermark':
              result = await executeWatermark.call(this, i);
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
                `Unsupported PDF operation: ${operation}`,
              );
          }
        }
        // Convert operations
        else if (resource === 'convert') {
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
                `Unsupported convert operation: ${operation}`,
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
