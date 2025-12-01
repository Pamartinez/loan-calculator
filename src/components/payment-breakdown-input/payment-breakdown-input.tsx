import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { NumericInputTypeEnum } from '../../data/models';
import { chevronUp, chevronDown } from '../../svg';
import { formatCurrency } from '../../utils/utils';

export interface PaymentBreakdownData {
    principal?: number;
    additionalPrincipal?: number;
    interest?: number;
    escrow?: number;
    additionalEscrow?: number;
    feesAndCharges?: number;
    date?: string; // YYYY-MM
}

@Component({
    tag: 'payment-breakdown-input',
    styleUrl: 'payment-breakdown-input.scss',
    shadow: true,
})
export class PaymentBreakdownInput {

    @State() initialData: PaymentBreakdownData = {
        "date": "2025-11",
        "principal": 481.66,
        "additionalPrincipal": 0.00,
        "interest": 2671.87,
        "escrow": 739.92,
        "additionalEscrow": 0.00,
        "feesAndCharges": 0.00
    };
    @Prop() paymentRecords?: PaymentBreakdownData[] = [];
    @Event() paymentChange!: EventEmitter<PaymentBreakdownData[]>;
    @State() isValid: boolean = true;
    @State() expandedIdx: number | null = null;


    private inputRefs: (HTMLNumericInputElement)[] = [];

    private updateField = (key: keyof PaymentBreakdownData, value: number | string) => {
        this.validateAllInputs();
        this.initialData = { ...this.initialData, [key]: value as any };
    };

    private handleDeleteItem(ev: CustomEvent<number>) {
        const items = this.getItems();
        const index = ev.detail;
        if (index >= 0 && index < items.length) {
            // Remove the item at the given index
            const next = items.filter((_, i) => i !== index);
            this.paymentRecords = next;
            // Optionally collapse expandedIdx if deleted
            if (this.expandedIdx === index) {
                this.expandedIdx = null;
            } else if (this.expandedIdx && this.expandedIdx > index) {
                this.expandedIdx = this.expandedIdx - 1;
            }
        }

        this.paymentChange.emit(this.paymentRecords);
    }

    private handleSubmit = () => {
        if (this.isValid) {
            // Add current initialData to paymentRecords
            this.paymentRecords = [...(this.paymentRecords || []), { ...this.initialData }];
            this.paymentChange.emit(this.paymentRecords);

            this.initialData = {
                "date": '',
                "principal": null,
                "additionalPrincipal": 0.00,
                "interest": null,
                "escrow": null,
                "additionalEscrow": 0.00,
                "feesAndCharges": 0.00
            }
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
        return `${parseInt(month, 10)}/${year}`;
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
                        value={this.initialData?.[key] as number}
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

    private getItems(): PaymentBreakdownData[] {
        const items = Array.isArray(this.paymentRecords) ? this.paymentRecords : [];
        // Sort by date ascending (oldest at the end)
        return items.slice().sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            // Convert YYYY-MM to Date for comparison
            const dateA = new Date(a.date + '-01');
            const dateB = new Date(b.date + '-01');
            return dateB.getTime() - dateA.getTime(); // newest first, oldest last
        });
    }

    render() {
        const items = this.getItems();
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
                                                value={this.initialData?.date || ''}
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
                            items={items.map((item, idx) => {
                                const isOpen = this.expandedIdx === idx;
                                return (
                                    <div key={idx}>
                                        <div class="payment-summary" onClick={() => this.toggleExpand(idx)} style={{ cursor: 'pointer' }}>
                                            <span class="arrow" innerHTML={isOpen ? chevronUp : chevronDown}>
                                            </span>
                                            <span class="amount">{formatCurrency(item.principal + item.additionalPrincipal + item.interest + item.escrow + item.additionalEscrow + item.feesAndCharges)}</span>
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
                            })}
                            onDeleteItem={this.handleDeleteItem.bind(this)}>
                        </component-list>
                    </div>
                </div>
            </div>
        );
    }
}
