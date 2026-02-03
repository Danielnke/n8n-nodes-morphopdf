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
  
  // Get PDF options
  const pageSize = this.getNodeParameter('imageToPdfPageSize', itemIndex, 'A4') as string;
  const margin = this.getNodeParameter('imageToPdfMargin', itemIndex, 36) as number;
  const backgroundColor = this.getNodeParameter('backgroundColor', itemIndex, '#FFFFFF') as string;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      urls: [fileUrl],
      pageSize,
      margin,
      backgroundColor,
    };

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

    const formData: Record<string, unknown> = {
      pageSize,
      margin: margin.toString(),
      backgroundColor,
    };
    
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
