import { toPng, toJpeg } from 'html-to-image';
import { format } from 'date-fns';

interface InvoiceGenerationOptions {
  quality?: number;
  width?: number;
  format?: 'png' | 'jpeg';
  backgroundColor?: string;
}

export const generateInvoiceImage = async (
  elementId: string,
  billNumber: string,
  options: InvoiceGenerationOptions = {}
): Promise<string | null> => {
  try {
    console.log('Starting invoice generation for bill:', billNumber);

    // Get the invoice element
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Invoice template element not found:', elementId);
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Default options
    const {
      quality = 0.95,
      width = 1200,
      format = 'jpeg',
      backgroundColor = '#ffffff'
    } = options;

    // Log generation attempt
    console.log('Generating invoice with options:', {
      quality,
      width,
      format,
      elementSize: {
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    });

    // Generate image
    const imageFunction = format === 'png' ? toPng : toJpeg;
    const dataUrl = await imageFunction(element, {
      quality,
      width,
      backgroundColor,
      style: {
        // Ensure proper rendering
        '@font-face': {
          cssFontFamily: "'Inter', sans-serif"
        }
      },
      filter: (node) => {
        // Filter out any unwanted elements
        const exclusions = ['no-print', 'button', 'actions'];
        return !exclusions.some(className => 
          node.classList?.contains(className)
        );
      }
    });

    console.log('Invoice generation successful');
    return dataUrl;

  } catch (error) {
    console.error('Error generating invoice:', error);
    return null;
  }
};

export const downloadInvoice = (
  dataUrl: string,
  billNumber: string,
  billingDate: string
): void => {
  try {
    console.log('Initiating invoice download');

    const link = document.createElement('a');
    link.download = `Invoice_${billNumber}_${format(new Date(billingDate), 'yyyy-MM-dd')}.jpg`;
    link.href = dataUrl;
    
    // Log download attempt
    console.log('Download details:', {
      filename: link.download,
      dataUrlLength: dataUrl.length
    });

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Invoice download initiated successfully');
  } catch (error) {
    console.error('Error downloading invoice:', error);
  }
};

// Verify DOM readiness
export const verifyInvoiceElement = (elementId: string): boolean => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Invoice template element not found:', elementId);
    return false;
  }

  // Check if all required sections exist
  const requiredSections = [
    'company-header',
    'client-details',
    'rental-charges',
    'extra-costs',
    'discounts',
    'bill-summary',
    'payment-details'
  ];

  const missingSections = requiredSections.filter(
    section => !element.querySelector(`#${section}`)
  );

  if (missingSections.length > 0) {
    console.error('Missing required invoice sections:', missingSections);
    return false;
  }

  // Check if all dynamic data fields are populated
  const emptyFields = Array.from(element.querySelectorAll('[data-field]'))
    .filter(el => !el.textContent?.trim());

  if (emptyFields.length > 0) {
    console.warn('Empty data fields found:', 
      emptyFields.map(el => el.getAttribute('data-field'))
    );
  }

  console.log('Invoice element verification complete:', {
    width: element.offsetWidth,
    height: element.offsetHeight,
    sections: requiredSections.length - missingSections.length,
    dataFields: element.querySelectorAll('[data-field]').length
  });

  return true;
};