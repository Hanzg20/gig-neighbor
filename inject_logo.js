const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'qr-logo.png');
const assetsPath = path.join(__dirname, 'src', 'constants', 'assets.ts');

if (fs.existsSync(logoPath)) {
    const base64 = fs.readFileSync(logoPath).toString('base64');
    const content = `/**
 * Base64 encoded brand logo for QR codes
 * Using base64 ensures the logo is always loaded during html2canvas capture
 */
export const QR_LOGO_BASE64 = "data:image/png;base64,${base64}";

export const getBrandLogo = () => QR_LOGO_BASE64;
`;
    fs.writeFileSync(assetsPath, content);
    console.log('Successfully injected Base64 logo into assets.ts');
} else {
    console.error('Logo file not found at ' + logoPath);
    process.exit(1);
}
