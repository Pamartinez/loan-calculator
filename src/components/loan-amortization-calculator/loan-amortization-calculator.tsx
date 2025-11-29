import { Component, h, State } from '@stencil/core';
import { LoanFormData, AmortizationData } from '../../data/models';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../../utils/local-storage-helper';

interface AmortizationCalculatorData {
    currentLoanData: LoanFormData;
    amortizationEntries: AmortizationData[];
}

@Component({
    tag: 'loan-amortization-calculator',
    styleUrl: 'loan-amortization-calculator.scss',
    shadow: true,
})

export class LoanAmortizationCalculator {
    @State() data: AmortizationCalculatorData = {
        currentLoanData: {
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
        amortizationEntries: [
            { id: 'default-1', amount: 3800, date: '2024-11' },
            { id: 'default-2', amount: 3800, date: '2025-10' },
            { id: 'default-3', amount: 3800, date: '2025-10' },
            { id: 'default-4', amount: 3800, date: '2025-10' },
            { id: 'default-5', amount: 3800, date: '2025-10' }
        ]
    };

    @State() paymentRecords: { id: string; amount: number; date: string }[] = [];

    componentWillLoad() {
        // Always load/persist the combined object; legacy separate keys no longer used.
        this.data = loadFromLocalStorage<AmortizationCalculatorData>(
            STORAGE_KEYS.AMORTIZATION_DATA,
            this.data
        );
    }

    private persistAll() {
        saveToLocalStorage(STORAGE_KEYS.AMORTIZATION_DATA, this.data);
    }

    private handleFormSubmit = (event: CustomEvent<LoanFormData>) => {
        const formData = event.detail;
        this.data = { ...this.data, currentLoanData: formData };
        this.persistAll();
    };

    private handleAddEntry = (event: CustomEvent<AmortizationData>) => {
        const entry = event.detail;
        this.data = { ...this.data, amortizationEntries: [...this.data.amortizationEntries, entry] };
        this.persistAll();
    };

    private handleDeleteEntry = (event: CustomEvent<string>) => {
        const id = event.detail;
        this.data = { ...this.data, amortizationEntries: this.data.amortizationEntries.filter(entry => entry.id !== id) };
        this.persistAll();
    };

    // private handlePaymentRecordSubmit = (event: CustomEvent<PaymentBreakdownData>) => {
    //     const d = event.detail;
    //     const amount = (d.principal || 0) + (d.additionalPrincipal || 0) + (d.interest || 0) + (d.escrow || 0) + (d.additionalEscrow || 0) + (d.feesAndCharges || 0);
    //     const id = `pr-${Date.now()}`;
    //     const date = d.date || '';
    //     this.paymentRecords = [...this.paymentRecords, { id, amount, date }];
    // };

    // private handleDeletePaymentRecord = (event: CustomEvent<string>) => {
    //     const id = event.detail;
    //     this.paymentRecords = this.paymentRecords.filter(r => r.id !== id);
    // };

    render() {
        return (
            <div class="two-row-layout">
                <div class="loan-amortization-calculator">
                    <div class="content-container">
                        <div class="calculator-section">
                            <loan-calculator
                                initialFormData={this.data.currentLoanData}
                                hideAdditionalPrincipal={true}
                                onFormSubmit={this.handleFormSubmit}
                            />
                        </div>
                        <div class="amortization-section">
                            <amortization-entry-form
                                entries={this.data.amortizationEntries}
                                onAddEntry={this.handleAddEntry}
                                onDeleteEntry={this.handleDeleteEntry}
                            />
                        </div>
                    </div>
                    <div>
                        <div class="payment-breakdown-section">
                            <payment-breakdown-input></payment-breakdown-input>
                        </div>
                    </div>
                </div>
                <div class="amortization-schedule-section">
                    <amortization-schedule-with-additional
                        loanData={this.data.currentLoanData}
                        amortizationEntries={this.data.amortizationEntries}
                    />
                </div>
            </div>
        );
    }
}