import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeSplit(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const splitMode = this.getNodeParameter('splitMode', itemIndex) as string;
  const ranges = splitMode === 'ranges'
    ? this.getNodeParameter('ranges', itemIndex) as string
    : undefined;
  const pageNumbersInput = splitMode === 'individual'
    ? this.getNodeParameter('pageNumbers', itemIndex, '') as string
    : undefined;
  const pageNumbers = pageNumbersInput
    ? pageNumbersInput.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n))
    : [];

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = {
      url: fileUrl,
      splitMode,
    };
    if (ranges) {
      body.ranges = ranges;
    }
    if (pageNumbers.length > 0) {
      body.pageNumbers = pageNumbers;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/split',
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
      splitMode,
    };
    if (ranges) {
      formData.ranges = ranges;
    }
    if (pageNumbers.length > 0) {
      formData.pageNumbers = JSON.stringify(pageNumbers);
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/split',
      undefined,
      formData,
    )) as Buffer;
  }

  // Split always returns a ZIP file
  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'split.zip',
    'application/zip',
  );
}
