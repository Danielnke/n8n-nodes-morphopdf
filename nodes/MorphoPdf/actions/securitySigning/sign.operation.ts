import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeSign(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  // Get signature parameters from UI
  const signatureImageUrl = this.getNodeParameter('signatureImageUrl', itemIndex) as string;
  
  if (!signatureImageUrl) {
    throw new Error('Signature image URL is required');
  }
  
  const signature = {
    imageUrl: signatureImageUrl,
    page: this.getNodeParameter('signaturePage', itemIndex, 1) as number,
    x: this.getNodeParameter('signatureX', itemIndex, 100) as number,
    y: this.getNodeParameter('signatureY', itemIndex, 100) as number,
    width: this.getNodeParameter('signatureWidth', itemIndex, 150) as number,
    height: this.getNodeParameter('signatureHeight', itemIndex, 50) as number,
  };

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = {
      url: fileUrl,
      signature,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/sign',
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
      signature: JSON.stringify(signature),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/sign',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'signed.pdf',
    'application/pdf',
  );
}
