import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getMultipleInputFiles,
  prepareOutput,
} from '../../shared/helpers';

export async function executeImageToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'binary') as 'binary' | 'url';

  // Get PDF options
  const pageSize = this.getNodeParameter('imageToPdfPageSize', itemIndex, 'A4') as string;
  const margin = this.getNodeParameter('imageToPdfMargin', itemIndex, 36) as number;
  const backgroundColor = this.getNodeParameter('backgroundColor', itemIndex, '#FFFFFF') as string;

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrls = this.getNodeParameter('imageFileUrls', itemIndex) as string[];

    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }

    const body: Record<string, unknown> = {
      urls: fileUrls,
      pageSize,
      margin,
    };

    // Only include backgroundColor when pageSize is not 'Original'
    if (pageSize !== 'Original') {
      body.backgroundColor = backgroundColor;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/image-to-pdf',
      body,
      undefined,
      undefined,
      outputType,
    );
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
    };

    // Only include backgroundColor when pageSize is not 'Original'
    if (pageSize !== 'Original') {
      formData.backgroundColor = backgroundColor;
    }

    files.forEach((file, index) => {
      formData[`file${index}`] = {
        value: file.content,
        options: {
          filename: file.fileName,
          contentType: file.mimeType,
        },
      };
    });

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/image-to-pdf',
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
    'images.pdf',
    'application/pdf',
    outputType,
  );
}
