import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { NumericInputTypeEnum } from '../../data/models';
import { chevronUp, chevronDown } from '../../svg';
import { formatCurrency } from '../../utils/utils';

export interface PaymentBreakdownData {
    principal: number;
    additionalPrincipal: number;
    interest: number;
    escrow: number;
    additionalEscrow: number;
    feesAndCharges: number;
    date: string; // YYYY-MM
}

@Component({
    tag: 'payment-breakdown-input',
    styleUrl: 'payment-breakdown-input.scss',
    shadow: true,
})
export class PaymentBreakdownInput {
    @State() expandedIdx: number | null = null;

    @Prop() initialData?: Partial<PaymentBreakdownData>;
    @Event() paymentChange!: EventEmitter<PaymentBreakdownData>;
    @Event() customSubmit!: EventEmitter<PaymentBreakdownData>;
    @State() isValid: boolean = true;

    @State() data: PaymentBreakdownData = {
        principal: 481.66,
        additionalPrincipal: 0,
        interest: 2671.87,
        escrow: 739.92,
        additionalEscrow: 0,
        feesAndCharges: 0,
        date: '',
    };

    @State() fakePaymentBreakdownList: PaymentBreakdownData[] = [
        {
            principal: 500,
            additionalPrincipal: 50,
            interest: 2500,
            escrow: 700,
            additionalEscrow: 20,
            feesAndCharges: 10,
            date: '2024-01',
        },
        {
            principal: 510,
            additionalPrincipal: 40,
            interest: 2490,
            escrow: 710,
            additionalEscrow: 25,
            feesAndCharges: 15,
            date: '2024-02',
        },
        {
            principal: 520,
            additionalPrincipal: 30,
            interest: 2480,
            escrow: 720,
            additionalEscrow: 30,
            feesAndCharges: 20,
            date: '2024-03',
        },
        {
            principal: 530,
            additionalPrincipal: 20,
            interest: 2470,
            escrow: 730,
            additionalEscrow: 35,
            feesAndCharges: 25,
            date: '2024-04',
        },
        {
            principal: 540,
            additionalPrincipal: 10,
            interest: 2460,
            escrow: 740,
            additionalEscrow: 40,
            feesAndCharges: 30,
            date: '2024-05',
        },
        {
            principal: 550,
            additionalPrincipal: 0,
            interest: 2450,
            escrow: 750,
            additionalEscrow: 45,
            feesAndCharges: 35,
            date: '2024-06',
        },
        {
            principal: 560,
            additionalPrincipal: 5,
            interest: 2440,
            escrow: 760,
            additionalEscrow: 50,
            feesAndCharges: 40,
            date: '2024-07',
        },
        {
            principal: 570,
            additionalPrincipal: 15,
            interest: 2430,
            escrow: 770,
            additionalEscrow: 55,
            feesAndCharges: 45,
            date: '2024-08',
        },
        {
            principal: 580,
            additionalPrincipal: 25,
            interest: 2420,
            escrow: 780,
            additionalEscrow: 60,
            feesAndCharges: 50,
            date: '2024-09',
        },
        {
            principal: 590,
            additionalPrincipal: 35,
            interest: 2410,
            escrow: 790,
            additionalEscrow: 65,
            feesAndCharges: 55,
            date: '2024-10',
        },
    ];

    private inputRefs: (HTMLNumericInputElement)[] = [];

    componentWillLoad() {
        if (this.initialData) {
            this.data = { ...this.data, ...this.initialData };
        }
    }

    private updateField = (key: keyof PaymentBreakdownData, value: number | string) => {
        this.data = { ...this.data, [key]: value as any };
        this.paymentChange.emit(this.data);
        this.validateAllInputs();
    };

    private handleSubmit = () => {
        if (this.isValid) {
            this.customSubmit.emit(this.data);
        }
    };

    private async validateAllInputs() {
        const results = await Promise.all(
            this.inputRefs.map(input => input?.validateInput?.())
        );
        this.isValid = results.every(r => r === true);
    }

    // Toggle expand/collapse for payment details
    private toggleExpand(idx: number) {
        this.expandedIdx = this.expandedIdx === idx ? null : idx;
    }

    // Helper to format YYYY-MM to M/D/YYYY for demo
    private formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const [year, month] = dateStr.split('-');
        // Use 1st of month for demo
        return `${parseInt(month, 10)}/1/${year}`;
    }

    private renderNumberInput(
        label: string,
        key: keyof PaymentBreakdownData,
        numericInputType: NumericInputTypeEnum = NumericInputTypeEnum.Currency
    ) {
        return (
            <div class="column">
                <label htmlFor={key}>{label}</label>
                <div class="input-wrapper">
                    <numeric-input
                        ref={el => {
                            if (el && !this.inputRefs.includes(el)) {
                                this.inputRefs.push(el);
                            }
                        }}
                        value={this.data[key] as number}
                        propertyName={key as string}
                        numericInputType={numericInputType} numberOfDecimalsAllowed={2}
                        onValueChange={(e) => this.updateField(key, e.detail)}
                    />
                </div>
            </div>
        );
    }


    // Common function to render a details row for payment breakdown
    private renderDetailsRow(label: string, value: number) {
        return (
            <div class="details-row">
                <span class="details-label">{label}</span>
                <span class="details-value">{formatCurrency(value)}</span>
            </div>
        );
    }

    render() {

        return (
            <div class="card two-row-layout">
                <div class="content-container">
                    <div class="form-content">
                        <h2>Payment Record</h2>
                        <div class="form-grid">
                            <div class="form-row-columns">
                                <div class="row">
                                    {this.renderNumberInput('Principal', 'principal')}
                                    {this.renderNumberInput('Additional Principal', 'additionalPrincipal')}
                                </div>
                                <div class="row">
                                    {this.renderNumberInput('Interest', 'interest')}
                                    {this.renderNumberInput('Escrow', 'escrow')}
                                </div>
                                <div class="row">
                                    {this.renderNumberInput('Additional Escrow', 'additionalEscrow')}
                                    {this.renderNumberInput('Fees and Charges', 'feesAndCharges')}
                                </div>
                                <div class="row">
                                    <div class="column">
                                        <label>Date</label>
                                        <div class="input-wrapper">
                                            <date-input
                                                style={{ '--input-width': '150px' }}
                                                value={this.data.date}
                                                onDateChange={(e) => this.updateField('date', e.detail as string)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div class="row button-container">
                                    <button class="button-style-add" disabled={!this.isValid} onClick={this.handleSubmit}>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="list-container">
                        <component-list style={{ "--container-height": "357px" }}
                            items={this.fakePaymentBreakdownList.map((item, idx) => {
                                const isOpen = this.expandedIdx === idx;
                                return (
                                    <div key={idx}>
                                        <div class="payment-summary" onClick={() => this.toggleExpand(idx)} style={{ cursor: 'pointer' }}>
                                            <span class="arrow" innerHTML={isOpen ? chevronUp : chevronDown}>
                                            </span>
                                            <span class="amount">${item.principal + item.additionalPrincipal + item.interest + item.escrow + item.additionalEscrow + item.feesAndCharges}.00</span>
                                            <span class="date">{this.formatDate(item.date)}</span>
                                        </div>
                                        {isOpen && (
                                            <div class="card">
                                                {this.renderDetailsRow('Principal', item.principal)}
                                                {this.renderDetailsRow('Additional Principal', item.additionalPrincipal)}
                                                {this.renderDetailsRow('Interest', item.interest)}
                                                {this.renderDetailsRow('Escrow', item.escrow)}
                                                {this.renderDetailsRow('Additional Escrow', item.additionalEscrow)}
                                                {this.renderDetailsRow('Fees and Charges', item.feesAndCharges)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}>

                        </component-list>
                    </div>
                </div>
            </div>
        );
    }
}
