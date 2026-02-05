import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executePdfToWord(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'binary') as 'binary' | 'url';
  const ocrForScanned = this.getNodeParameter('ocrForScanned', itemIndex, false) as boolean;

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { url: fileUrl, ocrForScanned };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-word',
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
      ocrForScanned: String(ocrForScanned),
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-word',
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
    'document.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    outputType,
  );
}
