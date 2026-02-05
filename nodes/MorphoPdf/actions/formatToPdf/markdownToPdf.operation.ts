import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeMarkdownToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('markdownInputMethod', itemIndex) as string;
  const pageFormat = this.getNodeParameter('pageFormat', itemIndex, 'A4') as string;
  const landscape = this.getNodeParameter('landscape', itemIndex, false) as boolean;

  const options = {
    pdf: {
      format: pageFormat,
      landscape,
    },
  };

  let responseBuffer: Buffer;

  if (inputMethod === 'text') {
    // Raw markdown text input - send as JSON body with markdown field
    const markdownContent = this.getNodeParameter('markdownContent', itemIndex, '') as string;
    if (!markdownContent) {
      throw new Error('Markdown Content is required when using Raw Text input method');
    }

    const body = {
      markdown: markdownContent,
      options,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/markdown-to-pdf',
      body,
    )) as Buffer;
  } else if (inputMethod === 'url') {
    // URL input - fetch markdown file from URL and send as JSON with URL field
    const markdownUrl = this.getNodeParameter('markdownUrl', itemIndex, '') as string;
    if (!markdownUrl) {
      throw new Error('Markdown URL is required when using URL input method');
    }

    // Fetch the markdown content from the URL
    const fetchResponse = await this.helpers.httpRequest({
      method: 'GET',
      url: markdownUrl,
      returnFullResponse: false,
    });

    // The response should be the markdown content as a string
    const markdownContent = typeof fetchResponse === 'string' ? fetchResponse : String(fetchResponse);

    if (!markdownContent) {
      throw new Error('Failed to fetch markdown content from URL');
    }

    const body = {
      markdown: markdownContent,
      options,
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/markdown-to-pdf',
      body,
    )) as Buffer;
  } else {
    // Binary data input - send as multipart form
    const inputFile = await getInputFile.call(this, itemIndex, 'binary');

    const formData: Record<string, unknown> = {
      file: {
        value: inputFile.content,
        options: {
          filename: inputFile.fileName,
          contentType: 'text/markdown',
        },
      },
      options: JSON.stringify(options),
    };

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/markdown-to-pdf',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'document.pdf',
    'application/pdf',
  );
}
