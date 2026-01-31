import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getMultipleInputFiles,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeMerge(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', 0) as string;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    // URL-based merge
    const urls = this.getNodeParameter('fileUrls', 0) as string[];

    if (urls.length < 2) {
      throw new Error('At least 2 URLs are required for merging');
    }

    const body = { urls };
    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/merge',
      body,
    )) as Buffer;
  } else {
    // Binary-based merge - collect all input files
    const files = await getMultipleInputFiles.call(this, items);

    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    // Build multipart form data
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
      '/pdf/merge',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(this, 0, responseBuffer, 'merged.pdf', 'application/pdf');
}
