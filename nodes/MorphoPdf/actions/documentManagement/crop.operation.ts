import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeCrop(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  // Get crop parameters from UI
  // cropMode: 'all' applies first cropData entry to all pages
  // cropMode: 'single' applies each entry to its specified page (only those pages appear in output)
  const cropMode = this.getNodeParameter('cropMode', itemIndex, 'all') as string;
  
  // cropData is now a JSON string defining region-based crop areas
  // Format: [{ pageNumber: 1, cropArea: { x, y, width, height, unit } }]
  const cropDataJson = this.getNodeParameter('cropData', itemIndex, '[]') as string;
  
  // Parse and validate cropData
  let cropData: Array<{ pageNumber: number; cropArea: { x: number; y: number; width: number; height: number; unit?: string } }>;
  try {
    cropData = JSON.parse(cropDataJson);
    if (!Array.isArray(cropData) || cropData.length === 0) {
      throw new Error('cropData must be a non-empty array');
    }
    // Validate structure
    for (const item of cropData) {
      if (typeof item.pageNumber !== 'number' || !item.cropArea) {
        throw new Error('Each cropData item must have pageNumber (number) and cropArea (object)');
      }
      const { x, y, width, height } = item.cropArea;
      if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('cropArea must have x, y, width, height (all numbers)');
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid cropData JSON: ${error.message}. Expected format: [{"pageNumber": 1, "cropArea": {"x": 50, "y": 50, "width": 500, "height": 700, "unit": "pt"}}]`);
    }
    throw error;
  }

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      cropMode,
      cropData,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/crop',
      body,
    )) as Buffer;
  } else {
    const inputFile = await getInputFile.call(this, itemIndex);

    // For multipart form data, cropData must be sent as JSON string
    const formData: Record<string, unknown> = {
      file: {
        value: inputFile.content,
        options: {
          filename: inputFile.fileName,
          contentType: inputFile.mimeType,
        },
      },
      cropMode,
      cropData: JSON.stringify(cropData),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/crop',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'cropped.pdf',
    'application/pdf',
  );
}
