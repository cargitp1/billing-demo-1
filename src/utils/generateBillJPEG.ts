import { toJpeg } from 'html-to-image';

export const generateBillJPEG = async (
  billNumber: string
): Promise<void> => {
  // Add delay to ensure template is fully loaded
  await new Promise(resolve => setTimeout(resolve, 500));

  const node = document.getElementById('invoice-template');
  if (!node) {
    throw new Error('Invoice template not found');
  }

  try {
    const dataUrl = await toJpeg(node, {
      quality: 0.98,
      width: 1200,
      // Height will be determined by content
    });

    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.download = `Bill_${billNumber}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating bill JPEG:', error);
    throw error;
  }
};