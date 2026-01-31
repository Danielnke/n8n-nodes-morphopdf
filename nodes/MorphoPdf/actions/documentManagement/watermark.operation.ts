import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeWatermark(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const watermarkType = this.getNodeParameter('watermarkType', itemIndex) as string;
  const position = this.getNodeParameter('watermarkPosition', itemIndex) as string;
  const opacity = this.getNodeParameter('watermarkOpacity', itemIndex) as number;

  // Build watermark options
  const watermarkOptions: Record<string, unknown> = {
    type: watermarkType,
    position,
    opacity,
  };

  if (watermarkType === 'text') {
    watermarkOptions.text = this.getNodeParameter('watermarkText', itemIndex) as string;
    watermarkOptions.rotation = this.getNodeParameter('watermarkRotation', itemIndex) as number;
  } else {
    watermarkOptions.imageUrl = this.getNodeParameter('watermarkImageUrl', itemIndex) as string;
  }

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      watermarkType,
      watermarkOptions,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/watermark',
      body,
    )) as Buffer;
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
      watermarkOptions: JSON.stringify(watermarkOptions),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/watermark',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'watermarked.pdf',
    'application/pdf',
  );
}
