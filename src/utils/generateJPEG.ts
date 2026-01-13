import { toJpeg } from 'html-to-image';

export const generateJPEG = async (
  challanType: 'udhar' | 'jama',
  challanNumber: string,
  date: string,
  width: number = 1200,
  height: number = 1697
): Promise<void> => {
  // Add delay to ensure template and background image are fully loaded
  await new Promise(resolve => setTimeout(resolve, 500));

  const node = document.getElementById('receipt-template');
  if (!node) {
    throw new Error('Receipt template not found');
  }

  try {
    const dataUrl = await toJpeg(node, {
      quality: 0.98,
      width: width,
      height: height,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      },
      pixelRatio: 2,
      cacheBust: true
    });

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
