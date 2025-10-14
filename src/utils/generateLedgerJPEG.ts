import { toPng } from 'html-to-image';

export const generateLedgerJPEG = async (clientNicName: string): Promise<void> => {
  try {
    // Wait for the hidden template to be rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the template element
    const element = document.getElementById('ledger-template');
    if (!element) {
      throw new Error('Template element not found');
    }

    // Generate PNG data
    const dataUrl = await toPng(element, {
      quality: 0.95,
      backgroundColor: 'white',
    });

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.download = `${clientNicName}_ledger_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating ledger JPEG:', error);
    throw error;
  }
};