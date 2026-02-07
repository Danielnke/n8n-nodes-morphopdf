// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { DynamicStructuredTool } from '@langchain/core/tools';
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
  IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import {
  morphoPdfToolSchema,
  operationEndpoints,
  formatToolResponse,
  type MorphoPdfToolInput,
} from './shared/toolSchema';

const API_BASE_URL = 'https://api.morphopdf.com/v1';

/**
 * Build request body from tool input based on operation type
 */
function buildRequestBody(input: MorphoPdfToolInput): Record<string, unknown> {
  const { operation } = input;

  switch (operation) {
    case 'compress':
      return {
        url: input.inputUrl,
        quality: input.quality || 'low',
      };

    case 'merge':
      return {
        urls: [input.inputUrl, ...(input.additionalUrls || [])],
      };

    case 'split':
      return {
        url: input.inputUrl,
        mode: input.splitMode || 'ranges',
        ranges: input.pageRanges || ['1-1'],
      };

    case 'rotate':
      return {
        url: input.inputUrl,
        angle: parseInt(input.rotationAngle || '90', 10),
      };

    case 'watermark':
      return {
        url: input.inputUrl,
        text: input.watermarkText,
        position: input.watermarkPosition || 'center',
        opacity: input.watermarkOpacity ?? 0.3,
      };

    case 'pdfToWord':
      return {
        url: input.inputUrl,
      };

    case 'pdfToExcel':
      return {
        url: input.inputUrl,
      };

    case 'pdfToImage':
      return {
        url: input.inputUrl,
        format: input.imageFormat || 'png',
        dpi: parseInt(input.dpi || '150', 10),
      };

    case 'wordToPdf':
      return {
        url: input.inputUrl,
      };

    case 'htmlToPdf':
      // Use htmlContent if provided, otherwise use inputUrl
      if (input.htmlContent) {
        return {
          html: input.htmlContent,
        };
      }
      return {
        url: input.inputUrl,
      };

    default:
      return { url: input.inputUrl };
  }
}

/**
 * MorphoPDF AI Tool Node
 *
 * This node provides PDF processing capabilities for AI agents.
 * It uses DynamicStructuredTool to expose operations to LangChain-compatible agents.
 *
 * Unlike the regular MorphoPdf node which uses execute(), this node uses supplyData()
 * to provide a tool that agents can call dynamically.
 */
export class MorphoPdfTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MorphoPDF Tool',
    name: 'morphoPdfTool',
    icon: 'file:morphopdf.svg',
    iconColor: 'blue',
    group: ['transform'],
    version: 1,
    description: 'PDF processing for AI agents - merge, split, convert, compress, watermark',
    defaults: {
      name: 'MorphoPDF Tool',
    },
    usableAsTool: true,
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Tools'],
        Tools: ['Recommended Tools'],
      },
      resources: {
        primaryDocumentation: [{ url: 'https://docs.morphopdf.com/api' }],
      },
    },
    inputs: [],
    outputs: [NodeConnectionTypes.AiTool],
    outputNames: ['Tool'],
    credentials: [
      {
        name: 'morphoPdfApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName:
          'This tool exposes MorphoPDF operations to AI agents. ' +
          'Connect this to an AI Agent node. The agent will automatically ' +
          'choose the appropriate operation based on the task.',
        name: 'notice',
        type: 'notice',
        default: '',
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async supplyData(this: ISupplyDataFunctions, _itemIndex: number): Promise<SupplyData> {
    const credentials = await this.getCredentials('morphoPdfApi');
    const apiKey = credentials.apiKey as string;

    // Get reference to context for use in tool function
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    const tool = new DynamicStructuredTool({
      name: 'morphopdf_tool',
      description:
        'Process PDF files - merge, split, compress, rotate, watermark, and convert formats. ' +
        'Supports: compress (reduce file size), merge (combine PDFs), split (divide into parts), ' +
        'rotate (turn pages), watermark (add text overlay), pdfToWord, pdfToExcel, pdfToImage, ' +
        'wordToPdf, htmlToPdf. Requires public URLs for input files.',
      schema: morphoPdfToolSchema,
      func: async (input: MorphoPdfToolInput): Promise<string> => {
        // Log input for n8n execution panel
        const { index } = context.addInputData(NodeConnectionTypes.AiTool, [
          [{ json: input as unknown as IDataObject }],
        ]);

        try {
          // Validate required inputUrl for operations that need it
          if (input.operation !== 'htmlToPdf' && !input.inputUrl) {
            throw new NodeOperationError(
              context.getNode(),
              `inputUrl is required for ${input.operation} operation`,
            );
          }

          // For htmlToPdf, require either inputUrl or htmlContent
          if (input.operation === 'htmlToPdf' && !input.inputUrl && !input.htmlContent) {
            throw new NodeOperationError(
              context.getNode(),
              'htmlToPdf requires either inputUrl or htmlContent',
            );
          }

          // For merge, require at least one additional URL
          if (
            input.operation === 'merge' &&
            (!input.additionalUrls || input.additionalUrls.length === 0)
          ) {
            throw new NodeOperationError(
              context.getNode(),
              'merge operation requires at least one URL in additionalUrls',
            );
          }

          // For watermark, require watermarkText
          if (input.operation === 'watermark' && !input.watermarkText) {
            throw new NodeOperationError(
              context.getNode(),
              'watermark operation requires watermarkText',
            );
          }

          // Build API request
          const endpoint = operationEndpoints[input.operation];
          const body = buildRequestBody(input);

          // Make API request using httpRequest helper
          const response = await context.helpers.httpRequest({
            method: 'POST',
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          });

          // Format response for LLM
          const result = formatToolResponse(
            input.operation,
            response as {
              success?: boolean;
              downloadUrl?: string;
              fileName?: string;
              error?: { code?: string; message?: string };
              [key: string]: unknown;
            },
          );

          // Log output
          context.addOutputData(NodeConnectionTypes.AiTool, index, [
            [{ json: result as unknown as IDataObject }],
          ]);

          return JSON.stringify(result, null, 2);
        } catch (error) {
          // Handle errors gracefully - return error string instead of throwing
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          const errorResult = {
            success: false,
            operation: input.operation,
            operationName: input.operation,
            message: `Operation failed: ${errorMessage}`,
            error: errorMessage,
          };

          // Log error output
          context.addOutputData(NodeConnectionTypes.AiTool, index, [
            [{ json: errorResult as unknown as IDataObject }],
          ]);

          return JSON.stringify(errorResult, null, 2);
        }
      },
    });

    return { response: tool };
  }
}
