import { Component, h, State } from '@stencil/core';
import { LoanFormData, AmortizationData } from '../../data/models';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../../utils/local-storage-helper';
import { PaymentBreakdownData } from '../..';

interface AmortizationCalculatorData {
    loanData: LoanFormData;
    amortizationEntries: AmortizationData[];
    paymentRecords: PaymentBreakdownData[];
}

@Component({
    tag: 'loan-amortization-calculator',
    styleUrl: 'loan-amortization-calculator.scss',
    shadow: true,
})

export class LoanAmortizationCalculator {

    @State() data: AmortizationCalculatorData = {
        loanData: {
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
            { id: 'default-1', amount: 1958.61, date: '2025-01' },
            { id: 'default-2', amount: 2773.66, date: '2024-07' }
        ],
        paymentRecords: [
            {
                "date": "2025-11",
                "principal": 481.66,
                "additionalPrincipal": 0.00,
                "interest": 2671.87,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-10",
                "principal": 478.86,
                "additionalPrincipal": 0.00,
                "interest": 2674.67,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-09",
                "principal": 476.09,
                "additionalPrincipal": 0.00,
                "interest": 2677.44,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-08",
                "principal": 473.32,
                "additionalPrincipal": 0.00,
                "interest": 2680.21,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-07",
                "principal": 470.58,
                "additionalPrincipal": 0.00,
                "interest": 2682.95,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-06",
                "principal": 467.85,
                "additionalPrincipal": 0.00,
                "interest": 2685.68,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-05",
                "principal": 465.14,
                "additionalPrincipal": 0.00,
                "interest": 2688.39,
                "escrow": 739.92,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-04",
                "principal": 462.44,
                "additionalPrincipal": 0.00,
                "interest": 2691.09,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-03",
                "principal": 459.76,
                "additionalPrincipal": 0.00,
                "interest": 2693.77,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-02",
                "principal": 457.09,
                "additionalPrincipal": 0.00,
                "interest": 2696.44,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2025-01",
                "principal": 443.08,
                "additionalPrincipal": 0.00,
                "interest": 2710.45,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-12",
                "principal": 440.51,
                "additionalPrincipal": 0.00,
                "interest": 2713.02,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-11",
                "principal": 437.96,
                "additionalPrincipal": 0.00,
                "interest": 2715.57,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-10",
                "principal": 435.42,
                "additionalPrincipal": 0.00,
                "interest": 2718.11,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-09",
                "principal": 432.89,
                "additionalPrincipal": 0.00,
                "interest": 2720.64,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-08",
                "principal": 430.38,
                "additionalPrincipal": 0.00,
                "interest": 2723.15,
                "escrow": 667.26,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-07",
                "principal": 411.80,
                "additionalPrincipal": 0.00,
                "interest": 2741.73,
                "escrow": 667.25,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            }, {
                "date": "2024-06",
                "principal": 409.41,
                "additionalPrincipal": 0.00,
                "interest": 2744.12,
                "escrow": 667.25,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            },
            {
                "date": "2024-05",
                "principal": 407.04,
                "additionalPrincipal": 0.00,
                "interest": 2746.49,
                "escrow": 667.25,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            }
        ]
    };

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


    private handleUpdateEntries = (event: CustomEvent<AmortizationData[]>) => {
        const updatedEntries = event.detail;
        this.data = {
            ...this.data,
            amortizationEntries: updatedEntries
        };
        this.persistAll();
    };

    private handleFormSubmit = (event: CustomEvent<LoanFormData>) => {
        const formData = event.detail;
        this.data = { ...this.data, loanData: formData };
        this.persistAll();
    };

    private handlePaymentChange = (event: CustomEvent<PaymentBreakdownData[]>) => {
        const newRecord = event.detail;
        this.data = {
            ...this.data,
            paymentRecords: newRecord
        };
        this.persistAll();
    };

    render() {
        return (
            <div class="two-row-layout">
                <div class="loan-amortization-calculator">
                    <div class="content-container">
                        <div class="calculator-section">
                            <loan-calculator
                                initialFormData={this.data.loanData}
                                hideAdditionalPrincipal={true}
                                onFormSubmit={this.handleFormSubmit}
                            />
                        </div>
                        <div class="amortization-section">
                            <amortization-entry-form
                                entries={this.data.amortizationEntries}
                                onUpdateEntries={this.handleUpdateEntries}
                            />
                        </div>
                    </div>
                    <div>
                        <div class="payment-breakdown-section">
                            <payment-breakdown-input
                                paymentRecords={this.data.paymentRecords}
                                onPaymentChange={this.handlePaymentChange}
                            >
                            </payment-breakdown-input>
                        </div>
                    </div>
                </div>
                <div class="amortization-schedule-section">
                    <amortization-schedule-with-additional
                        amortizationCalculatorData={this.data}
                    />
                </div>
            </div>
        );
    }
}