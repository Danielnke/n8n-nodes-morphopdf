# Changelog

All notable changes to this project will be documented in this file.

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
