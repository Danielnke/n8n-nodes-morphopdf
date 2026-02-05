import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getMultipleInputFiles,
  prepareOutput,
} from '../../shared/helpers';

export async function executeMerge(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', 0) as string;
  const outputType = this.getNodeParameter('outputType', 0, 'binary') as 'binary' | 'url';

  let response: Buffer | object;

  if (inputMethod === 'url') {
    // URL-based merge
    const urls = this.getNodeParameter('fileUrls', 0) as string[];

    if (urls.length < 2) {
      throw new Error('At least 2 URLs are required for merging');
    }

    const body = { urls };
    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/merge',
      body,
      undefined,
      undefined,
      outputType,
    );
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

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/merge',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  return prepareOutput.call(this, 0, response, 'merged.pdf', 'application/pdf', outputType);
}
