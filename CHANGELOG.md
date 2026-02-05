# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-02-05

### Added
- **URL Output Support**: All 20 operations now support returning a temporary download URL instead of binary data
  - New "Output Type" parameter allows choosing between "Binary Data" (default) and "URL"
  - URL output returns a temporary download link valid for 1 hour
  - Useful for workflows that need to pass URLs to other services
- **Image to PDF Multi-URL Support**: Image to PDF action now accepts multiple image URLs
  - New `imageFileUrls` parameter with `multipleValues: true`
  - Allows batch conversion of multiple images in a single operation

### Changed
- **Background Color Visibility**: Background color option in Image to PDF now only appears when page size is A4, Letter, or Legal
  - Hidden when page size is "Original" since background color doesn't apply

### Technical
- Added unified `prepareOutput()` helper function to handle both binary and URL responses
- Modified `morphoPdfApiRequest()` to conditionally set `format=binary` query parameter
- All operations updated to pass `outputType` parameter through API request chain

### Fixed
- **Image to PDF URL Input**: Fixed bug where "File URL" field was shown instead of "Image URLs"
  - Added `hide: { operation: ['imageToPdf'] }` to `fileUrlProperty` displayOptions
  - Users now correctly see "Image URLs" field when using URL input method for Image to PDF
- **Merge PDF URL Input**: Fixed same issue where both "File URL" and "File URLs" fields appeared
  - Added `merge` to the hide list in `fileUrlProperty`
- **URL Array Normalization**: Added `normalizeUrls()` function to both Merge and Image to PDF operations
  - Handles n8n's various multipleValues formats: strings, arrays, nested arrays
  - Supports comma-separated and newline-separated URLs
  - Improved error messages to show URL count

## [1.1.6] - 2026-02-05


### Fixed
- **n8n Cloud Compatibility**: Removed `form-data` package dependency
  - n8n Cloud does not allow community nodes with external dependencies
  - Implemented native multipart form data construction using Buffer concatenation
  - All file upload operations now use custom boundary-based multipart serialization
  - Fully compatible with n8n Cloud's strict mode linting
- **Markdown to PDF Tool**: Added missing URL input method
  - Now supports three input methods: Binary Data, Raw Markdown, and URL
  - URL method fetches markdown content from a public URL and converts to PDF
  - Raw Markdown method correctly sends content as JSON with `markdown` field

### Removed
- `form-data` package dependency (replaced with native implementation)

## [1.1.5] - 2026-02-04

### Fixed
- **CRITICAL**: Fixed multipart form data handling in API requests
  - Requests with file uploads (binary input mode) were failing with "invalid request" errors
  - The issue was caused by improper serialization of multipart form data bodies
  - All file-upload operations (Compress, Split, Rotate, Merge, Watermark, etc.) now work correctly
- Fixed multi-file operations (Merge PDF, Image to PDF) to use correct field names for backend compatibility
  - Numbered file fields (`file0`, `file1`, etc.) are now converted to `files` field as expected by backend


## [1.1.0] - 2026-01-31

### Changed
- **BREAKING**: Reorganized resource categories to match API documentation structure
  - **Document Management**: Merge PDF, Split PDF, Compress PDF, Organize PDF, Crop PDF, Rotate PDF, Watermark PDF
  - **PDF to Format**: PDF to Word, PDF to Excel, PDF to PowerPoint, PDF to Image
  - **Format to PDF**: Word to PDF, Excel to PDF, PowerPoint to PDF, Image to PDF, HTML to PDF, Markdown to PDF
  - **Security & Signing**: Protect PDF, Unlock PDF, Sign PDF
- Restructured folder organization: `actions/documentManagement`, `actions/pdfToFormat`, `actions/formatToPdf`, `actions/securitySigning`

### Removed
- Deprecated `Edit` operation (not present in current API documentation)
- Old `pdf` and `convert` resource categories (replaced with 4 new categories)

## [1.0.1] - 2026-01-31

### Fixed
- Consistent capitalization for all convert action names (removed "Convert" prefix)
- All action names now properly capitalized (e.g., "Excel to PDF", "PDF to Word")
- Updated documentation URL to https://docs.morphopdf.com
- Replaced placeholder icon with branded MorphoPDF favicon

### Added
- GitHub Actions workflow for automated npm publishing
- Support for manual and release-triggered deployments

## [1.0.0] - 2026-01-30

### Added
- Initial release
- PDF Operations: Merge, Split, Compress, Rotate, Crop, Organize, Edit, Watermark, Sign, Protect, Unlock
- Conversion Operations: PDF to Word/Excel/PowerPoint/Images, Word/Excel/PowerPoint/Images/HTML/Markdown to PDF
- Support for binary data and URL input methods
- Bearer token authentication with API key
- Comprehensive error handling
