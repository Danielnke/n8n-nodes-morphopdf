import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getInputFile,
  prepareBinaryOutput,
} from '../../shared/helpers';

export async function executeRotate(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const angle = this.getNodeParameter('angle', itemIndex) as number;
  const pages = this.getNodeParameter('pages', itemIndex) as string;
  const rotationsJson = this.getNodeParameter('rotations', itemIndex, '') as string;
  let rotations: Record<string, number> | undefined;
  if (rotationsJson) {
    try {
      rotations = JSON.parse(rotationsJson);
    } catch {
      throw new Error('Invalid JSON format for per-page rotations. Use format like {"1": 90, "3": 180}');
    }
  }

  let responseBuffer: Buffer;

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

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/rotate',
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
    };
    // If per-page rotations provided, use those; otherwise use global angle
    if (rotations) {
      formData.rotations = JSON.stringify(rotations);
    } else {
      formData.angle = String(angle);
      formData.pages = pages;
    }

    responseBuffer = (await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/rotate',
      undefined,
      formData,
    )) as Buffer;
  }

  return prepareBinaryOutput.call(
    this,
    itemIndex,
    responseBuffer,
    'rotated.pdf',
    'application/pdf',
  );
}
