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

  const err = error as { response?: { body?: { error?: { code?: string; message?: string } } }; message?: string };
  const errorBody = err.response?.body;

  if (errorBody?.error?.code) {
    const knownError = MORPHOPDF_ERROR_CODES[errorBody.error.code];
    if (knownError) {
      throw new MorphoPdfError(errorBody.error.code, errorBody.error.message);
    }
  }

  throw new Error(`MorphoPDF API Error: ${err.message || 'Unknown error'}`);
}
