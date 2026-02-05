export const MORPHOPDF_ERROR_CODES: Record<string, { message: string; httpStatus: number }> = {
  AUTHENTICATION_REQUIRED: { message: 'API key is required', httpStatus: 401 },
  AUTHENTICATION_FAILED: { message: 'Invalid or revoked API key', httpStatus: 401 },
  RATE_LIMIT_EXCEEDED: { message: 'Monthly request limit reached', httpStatus: 429 },
  INVALID_INPUT: { message: 'Invalid request parameters', httpStatus: 400 },
  FILE_NOT_FOUND: { message: 'Requested file not found', httpStatus: 404 },
  INVALID_FILE_TYPE: { message: 'Wrong file type for this operation', httpStatus: 400 },
  FILE_TOO_LARGE: { message: 'File exceeds size limit (50MB)', httpStatus: 413 },
  PROCESSING_FAILED: { message: 'File processing error', httpStatus: 422 },
  CORRUPTED_FILE: { message: 'File is corrupted or invalid', httpStatus: 422 },
  PASSWORD_PROTECTED: { message: 'PDF requires password', httpStatus: 422 },
  INTERNAL_ERROR: { message: 'Server error', httpStatus: 500 },
};

export class MorphoPdfError extends Error {
  code: string;
  httpStatus: number;

  constructor(code: string, message?: string) {
    const knownError = MORPHOPDF_ERROR_CODES[code];
    super(message || knownError?.message || 'Unknown error');
    this.name = 'MorphoPdfError';
    this.code = code;
    this.httpStatus = knownError?.httpStatus || 500;
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof MorphoPdfError) {
    throw error;
  }

  // n8n's httpRequest can put error data in various locations depending on the error type
  // Try to extract the API's structured error response: { error: { code, message, hint } }
  const err = error as {
    response?: {
      body?: unknown;
      data?: unknown;
    };
    body?: unknown;
    message?: string;
    cause?: { message?: string };
  };

  // Try multiple locations where n8n might put the response body
  const possibleBodies = [
    err.response?.body,
    err.response?.data,
    err.body,
  ];

  for (const body of possibleBodies) {
    if (body && typeof body === 'object') {
      const parsed = body as {
        success?: boolean;
        error?: {
          code?: string;
          message?: string;
          hint?: string;
        };
      };

      // Check for API's structured error format
      if (parsed.error?.code || parsed.error?.message) {
        const code = parsed.error.code || 'UNKNOWN_ERROR';
        const message = parsed.error.message || 'Unknown error occurred';
        const hint = parsed.error.hint;

        // Build a helpful error message including the hint if available
        const fullMessage = hint
          ? `${message}. Hint: ${hint}`
          : message;

        // Check if it's a known error code
        if (MORPHOPDF_ERROR_CODES[code]) {
          throw new MorphoPdfError(code, fullMessage);
        }

        // Unknown error code but still has structured error
        throw new Error(`MorphoPDF API Error: ${fullMessage}`);
      }
    }

    // Try parsing string body as JSON
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        if (parsed.error?.message) {
          const hint = parsed.error.hint;
          const fullMessage = hint
            ? `${parsed.error.message}. Hint: ${hint}`
            : parsed.error.message;
          throw new Error(`MorphoPDF API Error: ${fullMessage}`);
        }
      } catch {
        // Not valid JSON, continue to next
      }
    }
  }

  // Fall back to the error message itself
  const fallbackMessage = err.message || err.cause?.message || 'Unknown error';
  throw new Error(`MorphoPDF API Error: ${fallbackMessage}`);
}

