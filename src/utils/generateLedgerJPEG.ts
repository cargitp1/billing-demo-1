import { toPng } from 'html-to-image';

export async function generateClientLedgerJPEG(elementId: string, clientNicName: string): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error('Ledger element not found');
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  link.download = `ledger_${clientNicName}_${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating ledger image:', error);
    throw error;
  }
}
