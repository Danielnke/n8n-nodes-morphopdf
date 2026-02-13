# n8n-nodes-morphopdf

> n8n community node for [MorphoPDF](https://morphopdf.com) - Professional PDF processing and conversion

This node allows you to use the MorphoPDF API in your n8n workflows to merge, split, compress, convert, and manipulate PDF files

## Features

### PDF Operations
- **Merge** - Combine multiple PDFs into one
- **Split** - Split PDF by page ranges or extract individual pages
- **Compress** - Reduce PDF file size
- **Rotate** - Rotate pages by 90°, 180°, or 270°
- **Watermark** - Add text or image watermarks
- **Protect** - Add password protection
- **Unlock** - Remove password protection

### Conversions
- **PDF to Word** - Convert PDF to DOCX
- **PDF to Excel** - Extract tables to XLSX
- **PDF to PowerPoint** - Convert PDF to PPTX
- **PDF to Image** - Convert pages to PNG/JPG
- **Word to PDF** - Convert DOCX to PDF
- **Excel to PDF** - Convert XLSX to PDF
- **PowerPoint to PDF** - Convert PPTX to PDF
- **Image to PDF** - Combine images into PDF
- **HTML to PDF** - Render webpage or HTML to PDF
- **Markdown to PDF** - Convert Markdown to PDF

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-morphopdf`
4. Agree to the risks and click **Install**

### Manual Installation

```bash
npm install n8n-nodes-morphopdf
```

## Credentials

1. Sign up at [MorphoPDF](https://morphopdf.com)
2. Go to your Dashboard and copy your API key
3. In n8n, create new credentials for "MorphoPDF API"
4. Paste your API key (starts with `pk_`)

## Usage

### Input Methods

Each operation supports two input methods:

1. **Binary Data** - Use file data from a previous node (HTTP Request, Read Binary File, etc.)
2. **URL** - Provide a public URL to the file

### Example: Merge PDFs

1. Add multiple PDF files using HTTP Request nodes or file inputs
2. Add the MorphoPDF node
3. Select **PDF > Merge**
4. Choose **Binary Data** input method
5. Execute the workflow

### Example: Compress PDF

1. Add a PDF file to your workflow
2. Add the MorphoPDF node
3. Select **PDF > Compress**
4. Choose quality level (Low = smallest file, High = best quality)
5. Execute the workflow

### Example: Convert PDF to Word

1. Add a PDF file to your workflow
2. Add the MorphoPDF node
3. Select **Convert > PDF to Word**
4. Enable OCR if the PDF contains scanned images
5. Execute the workflow

## Error Handling

The node provides clear error messages for common issues:

- **Invalid API key** - Check your credentials
- **Rate limit exceeded** - Upgrade your plan or wait
- **File too large** - Maximum 50MB per file
- **Invalid file type** - Check the input file format
- **Password protected** - Use the Unlock operation first

## Resources

- [MorphoPDF Website](https://morphopdf.com)
- [API Documentation](https://docs.morphopdf.com/api)
- [n8n Community](https://community.n8n.io)

## License

[MIT](LICENSE.md)
