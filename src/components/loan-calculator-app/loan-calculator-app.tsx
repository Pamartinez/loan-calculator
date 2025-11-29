import { Component, h, State } from '@stencil/core';
import { LoanFormData } from '../../data/models';
import { generatePDFClientSide } from '../../utils/pdf-generator';

@Component({
  tag: 'loan-calculator-app',
  styleUrl: 'loan-calculator-app.scss',
  shadow: true,
})
export class LoanCalculatorApp {

  @State() isFormValid: boolean = false;
  @State() activeTabIndex: number = 0;
  @State() isFormCollapsed: boolean = false;
  @State() isExporting: boolean = false;
  @State() loanDataDictionary: { [key: string]: LoanFormData } = {
    'current-loan-id': {
      id: 'current-loan-id',
      displayName: 'Current Loan',
      loanAmount: 474000,
      rate: 7,
      totalMonthlyPayment: 3913.45,
      escrow: 739.9,
      additionalPrincipal: 0,
      startDate: '2023-07',
      loanTermsTime: 30
    },
    'loan-1763889304119-jefb3qmtp': {
      id: 'loan-1763889304119-jefb3qmtp',
      displayName: 'Valon A',
      loanAmount: 467000,
      rate: 5.875,
      totalMonthlyPayment: 3502,
      escrow: 739.92,
      additionalPrincipal: 0,
      startDate: '2026-01',
      summaryTabSelected: 0,
      loanTermsTime: 30
    },
    // 'loan-1763889679372-bed31br2v': {
    //   id: 'loan-1763889679372-bed31br2v',
    //   displayName: 'Valon B',
    //   loanAmount: 467000,
    //   rate: 5.990,
    //   totalMonthlyPayment: 3536,
    //   escrow: 739.92,
    //   additionalPrincipal: 0,
    //   startDate: '2026-01',
    //   summaryTabSelected: 0,
    //   loanTermsTime: 30
    // },
    'loan-1763891483798-pxe01qzbi': {
      id: 'loan-1763891483798-pxe01qzbi',
      displayName: 'Loan Depot',
      loanAmount: 469000,
      rate: 5.99,
      totalMonthlyPayment: 3558,
      escrow: 739.92,
      additionalPrincipal: 0,
      startDate: '2026-01',
      summaryTabSelected: 0,
      loanTermsTime: 30
    }
  };


  @State() currentFormData: LoanFormData = null;

  componentWillLoad() {
    // Load data from local storage
    const storedData = localStorage.getItem('loanDataDictionary');
    if (storedData) {
      try {
        this.loanDataDictionary = JSON.parse(storedData);
      } catch (e) {
        console.error('Failed to parse stored loan data:', e);
      }
    }
    this.isFormValid = Object.keys(this.loanDataDictionary).length > 0;

    // Set currentFormData to the first value in loanDataDictionary
    const firstKey = Object.keys(this.loanDataDictionary)[0];
    if (firstKey) {
      this.currentFormData = this.loanDataDictionary[firstKey];
    }
  }

  private handleFormSubmit = (event: CustomEvent<LoanFormData>) => {
    const formData = event.detail;
    // Add the form data to the dictionary using id as key
    if (formData.id) {
      this.loanDataDictionary = {
        ...this.loanDataDictionary,
        [formData.id]: formData
      };
      // Save to local storage
      localStorage.setItem('loanDataDictionary', JSON.stringify(this.loanDataDictionary));
      this.currentFormData = formData;
    }
  };

  private handleDeleteLoan = (event: CustomEvent<string>) => {
    const loanId = event.detail;
    const { [loanId]: removed, ...remaining } = this.loanDataDictionary;
    this.loanDataDictionary = remaining;
    // Save to local storage
    localStorage.setItem('loanDataDictionary', JSON.stringify(this.loanDataDictionary));
    // Reset to first tab
    this.activeTabIndex = Object.keys(this.loanDataDictionary).length - 1;
  };

  private handleSummaryTabChange = (event: CustomEvent<{ loanId: string; tabIndex: number }>) => {
    const { loanId, tabIndex } = event.detail;
    if (this.loanDataDictionary[loanId]) {
      this.loanDataDictionary = {
        ...this.loanDataDictionary,
        [loanId]: {
          ...this.loanDataDictionary[loanId],
          summaryTabSelected: tabIndex
        }
      };
      // Save to local storage
      localStorage.setItem('loanDataDictionary', JSON.stringify(this.loanDataDictionary));
    }
  };

  private handleNewLoan = () => {
    // Get current date and add 1 month
    const now = new Date();
    const futureDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const defaultStartDate = `${year}-${month}`;

    this.currentFormData = {
      id: null,
      displayName: '',
      loanAmount: null,
      rate: null,
      totalMonthlyPayment: null,
      escrow: 739.92,
      additionalPrincipal: 0,
      startDate: defaultStartDate,
      summaryTabSelected: 0,
      loanTermsTime: 30,
      loanTermsType: 'years'
    };
  };

  private handleFormValidityChange = (event: CustomEvent<boolean>) => {
    this.isFormValid = event.detail;
  };

  private handleTabChange = (event: CustomEvent<number>) => {
    const tabIndex = event.detail;
    const loanIds = Object.keys(this.loanDataDictionary);
    if (loanIds[tabIndex]) {
      this.currentFormData = this.loanDataDictionary[loanIds[tabIndex]];
    }
  };

  private toggleFormCollapse = () => {
    this.isFormCollapsed = !this.isFormCollapsed;
  };

  private handleExportToPdf = async () => {
    try {
      this.isExporting = true;
      // Client-side PDF generation using browser print
      await generatePDFClientSide(this.loanDataDictionary);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      this.isExporting = false;
    }
  };

  private getTabs() {
    return Object.keys(this.loanDataDictionary).map((key) => ({
      name: this.loanDataDictionary[key].displayName,
      content: (
        <loan-summary
          loanData={this.loanDataDictionary[key]}
          onDeleteLoan={this.handleDeleteLoan}
          onSummaryTabChange={this.handleSummaryTabChange}
        />
      )
    }));
  }

  render() {
    return (
      <div>
        <div class="collapse-header">
          <button class="collapse-toggle" onClick={this.toggleFormCollapse}>
            {this.isFormCollapsed ? '▼' : '▲'} {this.isFormCollapsed ? 'Show' : 'Hide'} Form
          </button>
        </div>

        {!this.isFormCollapsed && (
          <div class="loan-form-section">
            <loan-calculator
              initialFormData={this.currentFormData}
              onFormValidityChange={this.handleFormValidityChange}
              onFormSubmit={this.handleFormSubmit}
            />

            <div class="new-loan-container">
              <button class="button-style" onClick={this.handleNewLoan}>
                <span class="button-content">
                  <svg class="new-loan-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  New Loan
                </span>
              </button>
              <button class="button-style pdf-export-button" onClick={this.handleExportToPdf} disabled={this.isExporting}>
                {this.isExporting ? (
                  <span class="export-loading">
                    <span class="spinner"></span>
                    Preparing PDF...
                  </span>
                ) : (
                  <span class="button-content">
                    <svg class="pdf-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export to PDF
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <tabs-controller
          key={Object.keys(this.loanDataDictionary).join('-')}
          tabs={this.getTabs()}
          defaultActiveIndex={this.activeTabIndex}
          onTabChange={this.handleTabChange}
        />
      </div>
    );
  }
}
