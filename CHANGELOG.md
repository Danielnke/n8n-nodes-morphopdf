# Changelog

All notable changes to this project will be documented in this file.

## [1.1.6] - 2026-02-05

### Fixed
- **n8n Cloud Compatibility**: Removed `form-data` package dependency
  - n8n Cloud does not allow community nodes with external dependencies
  - Implemented native multipart form data construction using Buffer concatenation
  - All file upload operations now use custom boundary-based multipart serialization
  - Fully compatible with n8n Cloud's strict mode linting

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
