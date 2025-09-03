# Task: QR Code Generation System

## Objective
Implement a robust QR code generation system that creates unique, trackable codes for restaurant tables/locations with batch generation and download capabilities.

## Requirements

### Core Functionality

1. **Single QR Code Generation**
   - Generate unique short code (6-8 alphanumeric characters)
   - Create QR code image (SVG format)
   - Embed restaurant branding (optional logo)
   - Include tracking parameters

2. **Batch Generation**
   - Generate multiple codes at once (1-100)
   - Auto-labeling system (Table 1, Table 2, etc.)
   - Custom label support
   - Batch ID for grouping

3. **Export Formats**
   - SVG (individual files)
   - PDF (print sheet with multiple codes)
   - PNG (high resolution for printing)
   - CSV (metadata export)

4. **URL Structure**
   - Base URL: `https://[domain]/r/[shortcode]`
   - Trackable parameters: utm_source, utm_medium
   - Client identification embedded

## Implementation Steps

### Step 1: QR Code Service
```typescript
interface QRCodeService {
  generateSingle(params: QRGenerateParams): Promise<QRCode>
  generateBatch(params: BatchGenerateParams): Promise<QRCode[]>
  exportAsPDF(codes: QRCode[]): Promise<Buffer>
  exportAsZip(codes: QRCode[]): Promise<Buffer>
}
```

### Step 2: Short Code Generation
- Use nanoid or similar for unique codes
- Check for collisions in database
- Reserve codes before generation
- Implement retry logic

### Step 3: QR Image Generation
- Use `qrcode` npm package
- Set error correction level to High
- Add logo overlay capability
- Implement size options (small, medium, large)

### Step 4: PDF Generation
- Use `pdfkit` or `jsPDF`
- Create print-ready layouts:
  - 4 per page (large)
  - 9 per page (medium)
  - 16 per page (small)
- Include labels under each code

### Step 5: API Endpoints
```typescript
POST /api/qr/generate
POST /api/qr/batch
GET /api/qr/download/:batchId
GET /api/qr/:id/svg
```

## Acceptance Criteria

- [ ] Unique short codes generated without collisions
- [ ] QR codes scan successfully on all major devices
- [ ] Batch generation handles up to 100 codes
- [ ] PDF export is print-ready with proper margins
- [ ] SVG files are scalable without quality loss
- [ ] Logo overlay doesn't interfere with scanning
- [ ] Download links expire after 24 hours
- [ ] Proper error handling for generation failures

## Technical Specifications

### QR Code Settings
```javascript
{
  errorCorrectionLevel: 'H',
  type: 'svg',
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 300
}
```

### PDF Layout Options
```javascript
{
  format: 'A4',
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  codesPerPage: 9,
  includeLabels: true,
  includeCutLines: true
}
```

## Dependencies

- `qrcode` - QR code generation
- `nanoid` - Short code generation
- `pdfkit` or `jsPDF` - PDF creation
- `archiver` - ZIP file creation
- `sharp` or `jimp` - Image manipulation

## Performance Requirements

- Single QR generation < 100ms
- Batch of 100 codes < 5 seconds
- PDF generation < 3 seconds
- Concurrent generation support

## Testing Requirements

- Unit tests for code generation
- Integration tests for API endpoints
- Visual regression tests for QR codes
- Load testing for batch generation
- Mobile device scanning tests

## File Structure
```
/lib/qr/
  ├── generator.ts
  ├── shortcode.ts
  ├── exporter.ts
  └── templates.ts
/app/api/qr/
  ├── generate/route.ts
  ├── batch/route.ts
  └── download/[id]/route.ts
```

## Security Considerations

- Rate limiting on generation endpoints
- Validate client ownership before generation
- Secure download links with tokens
- Prevent enumeration attacks on short codes
- Log all generation activities

## Error Handling

- Collision detection and retry
- Database transaction rollback
- Graceful degradation for logo errors
- User-friendly error messages
- Logging for debugging

## Future Enhancements

- Dynamic QR codes (editable destination)
- QR code analytics dashboard
- A/B testing different designs
- NFC tag integration
- Custom design templates