import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeUnlock(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const password = this.getNodeParameter('password', itemIndex) as string;

  if (!password) {
    throw new Error('Password is required to unlock a PDF');
  }

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      password,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/unlock',
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
      password,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/unlock',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'unlocked.pdf',
    'application/pdf',
  );
}
