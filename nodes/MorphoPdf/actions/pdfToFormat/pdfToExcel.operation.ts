import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executePdfToExcel(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';
  const mode = this.getNodeParameter('excelMode', itemIndex, 'convert') as string;
  const regionsJson = this.getNodeParameter('excelRegions', itemIndex, '') as string;
  let regions: Array<{ x: number; y: number; width: number; height: number; page?: number }> | undefined;
  if (regionsJson) {
    try {
      regions = JSON.parse(regionsJson);
    } catch {
      throw new Error('Invalid JSON format for regions. Expected array of objects with x, y, width, height, and optional page properties.');
    }
  }

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = { url: fileUrl, mode };
    if (regions) {
      body.regions = regions;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-excel',
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
      mode,
    };
    if (regions) {
      formData.regions = JSON.stringify(regions);
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-excel',
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
    'spreadsheet.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    outputType,
  );
}
