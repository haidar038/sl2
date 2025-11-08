export async function generateQRCode(text: string): Promise<string> {
  // Using qrcode library for QR generation
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  });
}

export function downloadQRCode(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
