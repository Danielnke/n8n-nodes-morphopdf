import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executePdfToImage(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';
  const format = this.getNodeParameter('imageFormat', itemIndex, 'png') as string;
  const dpi = this.getNodeParameter('dpi', itemIndex, 150) as number;
  const pageRange = this.getNodeParameter('pageRange', itemIndex, 'all') as string;
  const quality = this.getNodeParameter('jpegQuality', itemIndex, 85) as number;

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = { url: fileUrl, format, dpi, pageRange };
    if (format === 'jpg') {
      body.quality = quality;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-image',
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
      format,
      dpi: String(dpi),
      pageRange,
    };
    if (format === 'jpg') {
      formData.quality = String(quality);
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/pdf-to-image',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  // Determine output type - single image or ZIP for multiple pages
  const isSinglePage = pageRange.match(/^\d+$/) !== null;
  const outputFileName = isSinglePage ? `page.${format}` : 'images.zip';
  const mimeType = isSinglePage
    ? `image/${format === 'jpg' ? 'jpeg' : format}`
    : 'application/zip';

  return prepareOutput.call(
    this,
    itemIndex,
    response,
    outputFileName,
    mimeType,
    outputType,
  );
}
