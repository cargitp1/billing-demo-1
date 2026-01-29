import html2canvas from 'html2canvas';

export const generateBillJPEG = async (
  billNumber: string
): Promise<void> => {
  // Add delay to ensure template is fully loaded
  await new Promise(resolve => setTimeout(resolve, 500));

  const sourceNode = document.getElementById('invoice-template');
  if (!sourceNode) {
    throw new Error('Invoice template not found');
  }

  // Clone the node to render it in viewport (but hidden via z-index/opacity)
  // This ensures browsers render it fully/correctly compared to off-screen
  const clone = sourceNode.cloneNode(true) as HTMLElement;

  // Style the clone to be visible to html2canvas but not interactable/visible to user
  clone.style.display = 'block';
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.zIndex = '-9999';
  clone.style.width = '794px'; // Enforce A4 width
  clone.style.backgroundColor = '#ffffff';

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: clone.scrollHeight,
      logging: false,
      removeContainer: true,
      windowWidth: 794 // Simulate window width
    });

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
  } finally {
    // Always remove the clone
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};