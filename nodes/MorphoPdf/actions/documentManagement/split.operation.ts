import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executeSplit(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex, 'url') as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';
  const splitMode = this.getNodeParameter('splitMode', itemIndex, 'ranges') as string;
  const ranges = splitMode === 'ranges'
    ? this.getNodeParameter('ranges', itemIndex) as string
    : undefined;
  const pageNumbersInput = splitMode === 'individual'
    ? this.getNodeParameter('pageNumbers', itemIndex, '') as string
    : undefined;
  const pageNumbers = pageNumbersInput
    ? pageNumbersInput.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n))
    : [];

  let response: Buffer | object;

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

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/split',
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
      splitMode,
    };
    if (ranges) {
      formData.ranges = ranges;
    }
    if (pageNumbers.length > 0) {
      formData.pageNumbers = JSON.stringify(pageNumbers);
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/split',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  // Split always returns a ZIP file
  return prepareOutput.call(
    this,
    itemIndex,
    response,
    'split.zip',
    'application/zip',
    outputType,
  );
}
