import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executePdfToWord(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const ocrForScanned = this.getNodeParameter('ocrForScanned', itemIndex, false) as boolean;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { url: fileUrl, ocrForScanned };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-word',
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
      ocrForScanned: String(ocrForScanned),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-word',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'document.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
}
