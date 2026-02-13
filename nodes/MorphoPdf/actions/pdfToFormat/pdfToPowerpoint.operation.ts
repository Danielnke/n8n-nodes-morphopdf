import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executePdfToPowerpoint(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { url: fileUrl };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-powerpoint',
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
    };

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-powerpoint',
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
    'presentation.pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    outputType,
  );
}
