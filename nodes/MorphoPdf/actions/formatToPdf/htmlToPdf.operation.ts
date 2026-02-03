import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { morphoPdfApiRequest, getInputFile, prepareBinaryOutput } from '../../shared/helpers';

export async function executeHtmlToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const htmlSourceType = this.getNodeParameter('htmlSourceType', itemIndex) as string;
  
  // PDF options
  const pageFormat = this.getNodeParameter('pageFormat', itemIndex, 'A4') as string;
  const landscape = this.getNodeParameter('landscape', itemIndex, false) as boolean;
  const printBackground = this.getNodeParameter('printBackground', itemIndex, true) as boolean;
  const scale = this.getNodeParameter('scale', itemIndex, 1) as number;
  
  // Margin options
  const marginTop = this.getNodeParameter('marginTop', itemIndex, '0mm') as string;
  const marginRight = this.getNodeParameter('marginRight', itemIndex, '0mm') as string;
  const marginBottom = this.getNodeParameter('marginBottom', itemIndex, '0mm') as string;
  const marginLeft = this.getNodeParameter('marginLeft', itemIndex, '0mm') as string;
  
  // Navigation options
  const waitUntil = this.getNodeParameter('waitUntil', itemIndex, 'networkidle2') as string;
  const timeout = this.getNodeParameter('timeout', itemIndex, 55000) as number;
  const waitForSelector = this.getNodeParameter('waitForSelector', itemIndex, '') as string;
  
  // Other options
  const forceBrowserRendering = this.getNodeParameter('forceBrowserRendering', itemIndex, false) as boolean;

  let responseBuffer: Buffer;

  // Build comprehensive options object matching API spec
  const options: Record<string, unknown> = {
    pdf: {
      format: pageFormat,
      landscape,
      printBackground,
      scale,
      margin: {
        top: marginTop,
        right: marginRight,
        bottom: marginBottom,
        left: marginLeft,
      },
    },
    navigation: {
      waitUntil,
      timeout,
      ...(waitForSelector ? { waitForSelector } : {}),
    },
    forceBrowserRendering,
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
  } else if (htmlSourceType === 'binary') {
    // Binary input - upload HTML file
    const inputFile = await getInputFile.call(this, itemIndex, 'binary');

    const formData: Record<string, unknown> = {
      file: {
        value: inputFile.content,
        options: {
          filename: inputFile.fileName,
          contentType: inputFile.mimeType || 'text/html',
        },
      },
      options: JSON.stringify(options),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/html-to-pdf',
      undefined,
      formData,
    )) as Buffer;
  } else {
    // Raw HTML content
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
