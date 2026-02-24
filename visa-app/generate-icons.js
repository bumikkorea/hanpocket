import sharp from 'sharp';
import fs from 'fs';

const svgBuffer = fs.readFileSync('./public/icon.svg');

async function generateIcons() {
  try {
    // 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('./public/icon-192x192.png');

    // 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('./public/icon-512x512.png');

    // Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile('./public/apple-touch-icon.png');

    // Favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon.ico');

    console.log('✓ PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();