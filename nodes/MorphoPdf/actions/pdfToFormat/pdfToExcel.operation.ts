import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executePdfToExcel(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const mode = this.getNodeParameter('excelMode', itemIndex, 'convert') as string;
  const regionsJson = this.getNodeParameter('excelRegions', itemIndex, '') as string;
  let regions: Array<{x: number; y: number; width: number; height: number; page?: number}> | undefined;
  if (regionsJson) {
    try {
      regions = JSON.parse(regionsJson);
    } catch {
      throw new Error('Invalid JSON format for regions. Expected array of objects with x, y, width, height, and optional page properties.');
    }
  }

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = { url: fileUrl, mode };
    if (regions) {
      body.regions = regions;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-excel',
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
      mode,
    };
    if (regions) {
      formData.regions = JSON.stringify(regions);
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-excel',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'spreadsheet.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}
