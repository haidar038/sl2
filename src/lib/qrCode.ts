export type QRCodeFormat = 'png' | 'jpg' | 'svg';

export async function generateQRCode(
  text: string,
  format: QRCodeFormat = 'png',
  size: number = 512
): Promise<string> {
  const QRCode = await import('qrcode');

  if (format === 'svg') {
    return QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff',
      },
    });
  }

  // For PNG and JPG, generate as data URL
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  });

  if (format === 'jpg') {
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  return canvas.toDataURL('image/png');
}

export function downloadQRCode(data: string, filename: string, format: QRCodeFormat = 'png') {
  const link = document.createElement('a');

  if (format === 'svg') {
    // For SVG, create a blob from the SVG string
    const blob = new Blob([data], { type: 'image/svg+xml' });
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.svg`;
  } else {
    // For PNG and JPG, use data URL directly
    link.href = data;
    link.download = `${filename}.${format}`;
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL if SVG
  if (format === 'svg') {
    URL.revokeObjectURL(link.href);
  }
}
