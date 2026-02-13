import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareOutput,
} from '../../shared/helpers';

export async function executeRotate(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex, 'url') as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';
  const angle = this.getNodeParameter('angle', itemIndex, 90) as number;
  const pages = this.getNodeParameter('pages', itemIndex, 'all') as string;
  const rotationsJson = this.getNodeParameter('rotations', itemIndex, '') as string;
  let rotations: Record<string, number> | undefined;
  if (rotationsJson) {
    try {
      rotations = JSON.parse(rotationsJson);
    } catch {
      throw new Error('Invalid JSON format for per-page rotations. Use format like {"1": 90, "3": 180}');
    }
  }

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
    const body: Record<string, unknown> = { url: fileUrl };
    // If per-page rotations provided, use those; otherwise use global angle
    if (rotations) {
      body.rotations = rotations;
    } else {
      body.angle = angle;
      body.pages = pages;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/rotate',
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
    };
    // If per-page rotations provided, use those; otherwise use global angle
    if (rotations) {
      formData.rotations = JSON.stringify(rotations);
    } else {
      formData.angle = String(angle);
      formData.pages = pages;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/rotate',
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
    'rotated.pdf',
    'application/pdf',
    outputType,
  );
}
