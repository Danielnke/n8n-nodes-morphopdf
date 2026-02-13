import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executeWatermark(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';
  const watermarkType = this.getNodeParameter('watermarkType', itemIndex) as string;
  const position = this.getNodeParameter('watermarkPosition', itemIndex) as string;
  const opacity = this.getNodeParameter('watermarkOpacity', itemIndex) as number;

  // Pages to watermark (all, 1,3,5, or 1-5)
  const pages = this.getNodeParameter('watermarkPages', itemIndex, 'all') as string;

  // Build watermark options
  const watermarkOptions: Record<string, unknown> = {
    position,
    opacity,
  };

  if (watermarkType === 'text') {
    watermarkOptions.text = this.getNodeParameter('watermarkText', itemIndex) as string;
    watermarkOptions.rotation = this.getNodeParameter('watermarkRotation', itemIndex) as number;
    watermarkOptions.fontSize = this.getNodeParameter('watermarkFontSize', itemIndex, 48) as number;
    watermarkOptions.color = this.getNodeParameter('watermarkColor', itemIndex, '#000000') as string;
  } else {
    watermarkOptions.imageUrl = this.getNodeParameter('watermarkImageUrl', itemIndex) as string;

    // Width and height are optional for image watermarks
    const width = this.getNodeParameter('watermarkWidth', itemIndex, '') as string;
    const height = this.getNodeParameter('watermarkHeight', itemIndex, '') as string;

    if (width) {
      watermarkOptions.width = parseInt(width, 10);
    }
    if (height) {
      watermarkOptions.height = parseInt(height, 10);
    }
  }

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      watermarkType,
      pages,
      watermarkOptions,
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/watermark',
      body,
      undefined,
      undefined,
      outputType,
    );
  } else {
    const inputFile = await getInputFile.call(this, itemIndex);

    const formData: Record<string, unknown> = {
      file: {
        value: inputFile.content,
        options: {
          filename: inputFile.fileName,
          contentType: inputFile.mimeType,
        },
      },
      watermarkType,
      pages,
      watermarkOptions: JSON.stringify(watermarkOptions),
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/watermark',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  return prepareOutput.call(
    this,
    itemIndex,
    response,
    'watermarked.pdf',
    'application/pdf',
    outputType,
  );
}
