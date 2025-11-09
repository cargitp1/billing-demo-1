import html2canvas from 'html2canvas';

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
    // Ensure white background
    const originalStyle = node.style.cssText;
    node.style.backgroundColor = '#ffffff';

    const canvas = await html2canvas(node, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: node.scrollHeight,
      logging: false,
      removeContainer: true
    });

    // Restore original style
    node.style.cssText = originalStyle;

    // Convert to JPEG and download
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `Bill_${billNumber}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dataUrl);

  } catch (error) {
    console.error('Error generating bill JPEG:', error);
    throw error;
  }
};