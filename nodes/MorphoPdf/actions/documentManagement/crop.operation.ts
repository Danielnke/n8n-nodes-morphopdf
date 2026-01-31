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
  const cropMode = this.getNodeParameter('cropMode', itemIndex, 'uniform') as string;
  const cropData = {
    top: this.getNodeParameter('cropTop', itemIndex, 0) as number,
    right: this.getNodeParameter('cropRight', itemIndex, 0) as number,
    bottom: this.getNodeParameter('cropBottom', itemIndex, 0) as number,
    left: this.getNodeParameter('cropLeft', itemIndex, 0) as number,
  };

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
