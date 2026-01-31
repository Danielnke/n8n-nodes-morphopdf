import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getMultipleInputFiles,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeImageToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { urls: [fileUrl] };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/image-to-pdf',
      body,
    )) as Buffer;
  } else {
    // Get all input items for batch image processing
    const items = this.getInputData();
    const files = await getMultipleInputFiles.call(this, items);

    if (files.length === 0) {
      throw new Error('At least one image is required');
    }

    const formData: Record<string, unknown> = {};
    files.forEach((file, index) => {
      formData[`file${index}`] = {
        value: file.content,
        options: {
          filename: file.fileName,
          contentType: file.mimeType,
        },
      };
    });

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/image-to-pdf',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'images.pdf',
    'application/pdf',
  );
}
