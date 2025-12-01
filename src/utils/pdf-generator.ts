export async function generatePDFClientSide(loanDataDictionary: { [key: string]: any }) {
  // Create an iframe to render the print content - needs to be visible for canvas to render
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '210mm'; // A4 width
  iframe.style.height = '297mm'; // A4 height
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error('Could not access iframe document');
  }

  // Create the HTML content with the loan report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Loan Amortization Report</title>
        <script type="module" src="${window.location.origin}/build/loan-calculator.esm.js"></script>
        <script nomodule src="${window.location.origin}/build/loan-calculator.js"></script>
        <style>
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 20px;
           }
          @media print {
            body {
              padding: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          
          /* Prevent orphaned headers and improve table breaking */
          table { 
            border-collapse: collapse;
            width: 100%;
          }
          
          tr { 
            page-break-inside: avoid;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          /* Ensure minimal orphans and widows */
          p, h1, h2, h3, h4, h5, h6 {
            orphans: 3;
            widows: 3;
          }
        </style>
      </head>
      <body>
        <loan-report id="loan-report"></loan-report>
      </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for components to load and render
  await new Promise<void>((resolve) => {
    iframe.contentWindow?.addEventListener('load', async () => {
      // Wait for custom elements to be defined
      await iframe.contentWindow?.customElements.whenDefined('loan-report');
      await iframe.contentWindow?.customElements.whenDefined('loan-details');
      await iframe.contentWindow?.customElements.whenDefined('amortization-schedule');
      await iframe.contentWindow?.customElements.whenDefined('amortization-schedule-without-additional');
      await iframe.contentWindow?.customElements.whenDefined('amortization-schedule-with-additional');
      await iframe.contentWindow?.customElements.whenDefined('schedule-view');
      await iframe.contentWindow?.customElements.whenDefined('schedule-summary');
      await iframe.contentWindow?.customElements.whenDefined('balance-graph');
      await iframe.contentWindow?.customElements.whenDefined('payoff-progress');
      await iframe.contentWindow?.customElements.whenDefined('pie-chart');
      await iframe.contentWindow?.customElements.whenDefined('cumulative-payment-graph');
      await iframe.contentWindow?.customElements.whenDefined('savings-comparison-graph');
      await iframe.contentWindow?.customElements.whenDefined('bar-chart');
      await iframe.contentWindow?.customElements.whenDefined('key-metrics-dashboard');

      const loanReport = iframeDoc.getElementById('loan-report') as any;
      if (loanReport) {
        loanReport.loanDataDictionary = loanDataDictionary;
      }

      // Wait for initial render
      setTimeout(() => {
        // Force a second render pass for canvas elements
        if (iframe.contentWindow) {
          iframe.contentWindow.requestAnimationFrame(() => {
            iframe.contentWindow?.requestAnimationFrame(() => {
              // Wait additional time for canvas rendering to complete
              setTimeout(() => resolve(), 2000);
            });
          });
        } else {
          setTimeout(() => resolve(), 2000);
        }
      }, 3000);
    });
  });

  iframe.contentWindow?.print();

  // Clean up iframe after print dialog closes
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}
