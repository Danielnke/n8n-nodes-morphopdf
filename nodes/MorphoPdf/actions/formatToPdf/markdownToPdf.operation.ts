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
    // Raw markdown text input - send as JSON body
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
  } else {
    // Binary data input - send as multipart form
    const inputFile = await getInputFile.call(this, itemIndex);

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
