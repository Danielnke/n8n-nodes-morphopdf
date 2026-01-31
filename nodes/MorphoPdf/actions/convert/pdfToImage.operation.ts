import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executePdfToImage(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const format = this.getNodeParameter('imageFormat', itemIndex, 'png') as string;
  const dpi = this.getNodeParameter('dpi', itemIndex, 150) as number;
  const pageRange = this.getNodeParameter('pageRange', itemIndex, 'all') as string;

  let responseBuffer: Buffer;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body = { url: fileUrl, format, dpi, pageRange };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-image',
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
      format,
      dpi: String(dpi),
      pageRange,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-image',
      undefined,
      formData,
    )) as Buffer;
  }

  // Determine output type - single image or ZIP for multiple pages
  const isSinglePage = pageRange.match(/^\d+$/) !== null;
  const outputFileName = isSinglePage ? `page.${format}` : 'images.zip';
  const mimeType = isSinglePage
    ? `image/${format === 'jpg' ? 'jpeg' : format}`
    : 'application/zip';

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    outputFileName,
    mimeType,
  );
}
