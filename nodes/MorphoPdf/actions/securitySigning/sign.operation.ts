import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

/**
 * Fetches an image from URL and converts it to base64
 */
async function fetchImageAsBase64(this: IExecuteFunctions, url: string): Promise<string> {
  const response = await this.helpers.httpRequest({
    method: 'GET',
    url,
    encoding: 'arraybuffer',
    returnFullResponse: false,
  });

  return Buffer.from(response as ArrayBuffer).toString('base64');
}

export async function executeSign(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  // Get required signer name (used as fallback if image embedding fails)
  const signerName = this.getNodeParameter('signerName', itemIndex) as string;
  if (!signerName) {
    throw new Error('Signer Name is required');
  }

  // Get signature input type and data
  const signatureInputType = this.getNodeParameter('signatureInputType', itemIndex, 'url') as string;
  
  let signatureData: string;
  
  if (signatureInputType === 'base64') {
    // Direct base64 input
    signatureData = this.getNodeParameter('signatureData', itemIndex, '') as string;
    if (!signatureData) {
      throw new Error('Signature Image (Base64) is required when using Base64 input type');
    }
  } else {
    // URL input - fetch and convert to base64
    const signatureImageUrl = this.getNodeParameter('signatureImageUrl', itemIndex, '') as string;
    if (!signatureImageUrl) {
      throw new Error('Signature Image URL is required when using URL input type');
    }
    signatureData = await fetchImageAsBase64.call(this, signatureImageUrl);
  }

  // Get signature placements from JSON
  const signaturesJsonStr = this.getNodeParameter('signaturesJson', itemIndex, '[]') as string;
  
  let signatures: Array<{ page: number; x: number; y: number; width: number; height: number }>;
  try {
    signatures = JSON.parse(signaturesJsonStr);
    if (!Array.isArray(signatures) || signatures.length === 0) {
      throw new Error('signatures must be a non-empty array');
    }
    // Validate structure
    for (const sig of signatures) {
      if (typeof sig.page !== 'number' || typeof sig.x !== 'number' || 
          typeof sig.y !== 'number' || typeof sig.width !== 'number' || 
          typeof sig.height !== 'number') {
        throw new Error('Each signature must have: page, x, y, width, height (all numbers)');
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid signatures JSON: ${error.message}. Expected format: [{"page": 1, "x": 100, "y": 500, "width": 200, "height": 50}]`);
    }
    throw error;
  }

  // Build the signature object as expected by the API
  const signature = {
    signerName,
    signatureData,
    signatures,
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

    // For multipart form data, signature must be sent as JSON string
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
