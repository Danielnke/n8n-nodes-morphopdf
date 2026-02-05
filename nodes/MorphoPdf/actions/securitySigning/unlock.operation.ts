import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executeUnlock(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'binary') as 'binary' | 'url';
  const password = this.getNodeParameter('password', itemIndex) as string;

  if (!password) {
    throw new Error('Password is required to unlock a PDF');
  }

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      password,
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/unlock',
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
      password,
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/unlock',
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
    'unlocked.pdf',
    'application/pdf',
    outputType,
  );
}
