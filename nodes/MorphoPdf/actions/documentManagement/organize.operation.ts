import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeOrganize(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  // Get new page order from UI parameter
  const newPageOrderInput = this.getNodeParameter('newPageOrder', itemIndex, '') as string;
  const newPageOrder: number[] = newPageOrderInput
    ? newPageOrderInput.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n))
    : [];

  // Get rotated pages (pages to rotate 90° clockwise)
  const rotatedPagesInput = this.getNodeParameter('rotatedPages', itemIndex, '') as string;
  const rotatedPages: number[] = rotatedPagesInput
    ? rotatedPagesInput.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n))
    : [];

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = {
      url: fileUrl,
    };
    if (newPageOrder.length > 0) {
      body.newPageOrder = newPageOrder;
    }
    if (rotatedPages.length > 0) {
      body.rotatedPages = rotatedPages;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/organize',
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
    };
    if (newPageOrder.length > 0) {
      formData.newPageOrder = JSON.stringify(newPageOrder);
    }
    if (rotatedPages.length > 0) {
      formData.rotatedPages = JSON.stringify(rotatedPages);
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/organize',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'organized.pdf',
    'application/pdf',
  );
}
