import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeExcelToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { url: fileUrl };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/excel-to-pdf',
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

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/excel-to-pdf',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'spreadsheet.pdf',
    'application/pdf',
  );
}
