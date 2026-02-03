import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeProtect(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const userPassword = this.getNodeParameter('userPassword', itemIndex) as string;
  const ownerPassword = this.getNodeParameter('ownerPassword', itemIndex, '') as string;
  
  // Encryption level
  const encryptionLevel = this.getNodeParameter('encryptionLevel', itemIndex, '256') as string;
  
  // Permissions - all default to true (allowed)
  const permissions = {
    modifying: this.getNodeParameter('permModifying', itemIndex, true) as boolean,
    copying: this.getNodeParameter('permCopying', itemIndex, true) as boolean,
    annotating: this.getNodeParameter('permAnnotating', itemIndex, true) as boolean,
    fillingForms: this.getNodeParameter('permFillingForms', itemIndex, true) as boolean,
    contentAccessibility: this.getNodeParameter('permContentAccessibility', itemIndex, true) as boolean,
    documentAssembly: this.getNodeParameter('permDocumentAssembly', itemIndex, true) as boolean,
  };

  if (!userPassword) {
    throw new Error('User password is required to protect a PDF');
  }

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = {
      url: fileUrl,
      userPassword,
      encryptionLevel,
      permissions,
    };
    if (ownerPassword) {
      body.ownerPassword = ownerPassword;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/protect',
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
      userPassword,
      encryptionLevel,
      permissions: JSON.stringify(permissions),
    };
    if (ownerPassword) {
      formData.ownerPassword = ownerPassword;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/protect',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'protected.pdf',
    'application/pdf',
  );
}
