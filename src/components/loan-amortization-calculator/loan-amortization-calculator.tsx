import { Component, h, State } from '@stencil/core';
import { LoanFormData, AmortizationData } from '../../data/models';

@Component({
    tag: 'loan-amortization-calculator',
    styleUrl: 'loan-amortization-calculator.scss',
    shadow: true,
})
export class LoanAmortizationCalculator {
    @State() currentLoanData: LoanFormData = {
        id: 'current-loan-id',
        displayName: 'Current Loan',
        loanAmount: 474000,
        rate: 7,
        totalMonthlyPayment: 3913.45,
        escrow: 739.9,
        additionalPrincipal: 0,
        startDate: '2023-07',
        loanTermsTime: 30
    };
    @State() amortizationEntries: AmortizationData[] = [
        {
            id: 'default-1',
            amount: 3800,
            date: '2024-11'
        },
        {
            id: 'default-2',
            amount: 3800,
            date: '2025-10'
        }
    ];

    componentWillLoad() {
        // Load loan data from localStorage
        const storedLoanData = localStorage.getItem('currentLoanData');
        if (storedLoanData) {
            try {
                this.currentLoanData = JSON.parse(storedLoanData);
            } catch (e) {
                console.error('Failed to parse stored loan data:', e);
            }
        }

        // Load amortization entries from localStorage
        const storedEntries = localStorage.getItem('amortizationEntries');
        if (storedEntries) {
            try {
                this.amortizationEntries = JSON.parse(storedEntries);
            } catch (e) {
                console.error('Failed to parse stored amortization entries:', e);
            }
        }
    }

    private handleFormSubmit = (event: CustomEvent<LoanFormData>) => {
        const formData = event.detail;
        this.currentLoanData = formData;
        // Save to localStorage
        localStorage.setItem('currentLoanData', JSON.stringify(formData));
    };

    private handleAddEntry = (event: CustomEvent<AmortizationData>) => {
        const entry = event.detail;
        this.amortizationEntries = [...this.amortizationEntries, entry];
        // Save to localStorage
        localStorage.setItem('amortizationEntries', JSON.stringify(this.amortizationEntries));
    };

    private handleDeleteEntry = (event: CustomEvent<string>) => {
        const id = event.detail;
        this.amortizationEntries = [...this.amortizationEntries.filter(entry => entry.id !== id)];
        // Save to localStorage
        localStorage.setItem('amortizationEntries', JSON.stringify(this.amortizationEntries));
    };

    private handleFormValidityChange = (_event: CustomEvent<boolean>) => {
        // Form validity tracking
    };

    render() {
        return (
            <div>
                <div class="loan-amortization-calculator">
                    <div>
                        <h2>Loan Details</h2>
                        <div class="content-container">
                            <div class="calculator-section">
                                <loan-calculator
                                    initialFormData={this.currentLoanData}
                                    hideAdditionalPrincipal={true}
                                    onFormValidityChange={this.handleFormValidityChange}
                                    onFormSubmit={this.handleFormSubmit}
                                />
                            </div>

                            <div class="amortization-section">
                                <h2>Amortization Entries</h2>
                                <amortization-entry onAddEntry={this.handleAddEntry} />
                                <amortization-list
                                    entries={this.amortizationEntries}
                                    onDeleteEntry={this.handleDeleteEntry}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <amortization-schedule-with-additional
                    loanData={this.currentLoanData}
                    amortizationEntries={this.amortizationEntries}
                />
            </div>
        );
    }
}