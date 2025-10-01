import { toJpeg } from 'html-to-image';

export const generateJPEG = async (
  challanType: 'udhar' | 'jama',
  challanNumber: string,
  date: string
): Promise<void> => {
  const node = document.getElementById('receipt-template');
  if (!node) {
    throw new Error('Receipt template not found');
  }

  try {
    const dataUrl = await toJpeg(node, { quality: 0.95, width: 1200 });

    const link = document.createElement('a');
    link.download = `${challanType}_${challanNumber}_${date.replace(/\//g, '-')}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating JPEG:', error);
    throw error;
  }
};
