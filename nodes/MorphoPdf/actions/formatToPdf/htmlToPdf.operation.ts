import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { morphoPdfApiRequest, prepareBinaryOutput } from '../../shared/helpers';

export async function executeHtmlToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const htmlSourceType = this.getNodeParameter('htmlSourceType', itemIndex) as string;
  const pageFormat = this.getNodeParameter('pageFormat', itemIndex, 'A4') as string;
  const landscape = this.getNodeParameter('landscape', itemIndex, false) as boolean;

  let responseBuffer: Buffer;

  const options = {
    pdf: {
      format: pageFormat,
      landscape,
    },
  };

  if (htmlSourceType === 'url') {
    const url = this.getNodeParameter('htmlUrl', itemIndex) as string;

    if (!url) {
      throw new Error('URL is required for URL source type');
    }

    const body = {
      url,
      options,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/html-to-pdf',
      body,
    )) as Buffer;
  } else {
    const htmlContent = this.getNodeParameter('htmlContent', itemIndex) as string;

    if (!htmlContent) {
      throw new Error('HTML content is required for HTML source type');
    }

    const body = {
      html: htmlContent,
      options,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/html-to-pdf',
      body,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'webpage.pdf',
    'application/pdf',
  );
}
