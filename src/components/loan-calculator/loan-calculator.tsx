import { Component, h, State, Method, Prop, Watch, Event, EventEmitter } from '@stencil/core';
import { LoanFormData, NumericInputTypeEnum } from '../../data/models';

@Component({
    tag: 'loan-calculator',
    styleUrl: 'loan-calculator.scss',
    shadow: true,
})
export class LoanCalculator {
    @Prop() initialFormData?: LoanFormData;
    @Prop() hideAdditionalPrincipal?: boolean = false;

    @Event() formValidityChange: EventEmitter<boolean>;
    @Event() formSubmit: EventEmitter<LoanFormData>;

    private inputRefs: (HTMLTextInputElement | HTMLNumericInputElement)[] = [];

    @State() formData: LoanFormData = {
        id: null,
        displayName: '',
        loanAmount: null,
        rate: null,
        totalMonthlyPayment: null,
        escrow: 739.92,
        additionalPrincipal: 0,
        startDate: null,
        loanTermsTime: 30,
        loanTermsType: 'years'
    };

    @Watch('initialFormData')
    watchInitialFormData(newValue: LoanFormData) {
        if (newValue) {
            this.formData = { ...newValue };
        }
    }

    componentWillLoad() {
        if (this.initialFormData) {
            this.formData = { ...this.initialFormData };
        }
    }

    private async validateAllInputs(): Promise<boolean> {
        const validationResults = await Promise.all(
            this.inputRefs.map(input => input?.validateInput())
        );
        return validationResults.every(result => result === true);
    }

    private async handleValueChange(propertyName: string, value: number | string) {
        this.formData = {
            ...this.formData,
            [propertyName]: value,
        };
        console.log('Form Data Updated:', this.formData);
    }

    @Method()
    async getFormData() {
        return this.formData;
    }

    private get isEditMode(): boolean {
        return this.formData.id !== null && this.formData.id !== '' && this.formData.displayName !== null && this.formData.displayName !== '';
    }

    private async handleAddClick() {
        const isValid = await this.validateAllInputs();

        if (isValid) {
            if (!this.isEditMode) {
                // Generate unique id for new loan
                this.formData = {
                    ...this.formData,
                    id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
            }
            this.formSubmit.emit(this.formData);
        }
    }

    private renderNumberInput(
        label: string,
        propertyName: keyof LoanFormData,
        numericInputType: NumericInputTypeEnum = NumericInputTypeEnum.Currency
    ) {
        return (
            <div class="column">
                <label htmlFor={propertyName}>{label}</label>
                <div class="input-wrapper">
                    <numeric-input
                        ref={el => {
                            if (el && !this.inputRefs.includes(el)) {
                                this.inputRefs.push(el);
                            }
                        }}
                        value={this.formData[propertyName] as number}
                        propertyName={propertyName}
                        numericInputType={numericInputType}
                        onValueChange={(e) => this.handleValueChange(propertyName, e.detail)}
                    />
                </div>
            </div>
        );
    }

    private renderStartDateInput() {
        return (
            <div class="column">
                <label htmlFor="startDate" >Start Date</label>
                <div class="input-wrapper">
                    <date-input
                        style={{ '--input-width': '150px' }}
                        value={this.formData.startDate || ''}
                        inputId="startDate"
                        onDateChange={(e) => this.handleValueChange('startDate', e.detail)}
                    />
                </div>
            </div>
        )
    }
    render() {
        return (
            <div class="loan-calculator card">

                <h2>Loan Details</h2>
                {/* Unified Grid Layout */}
                <div class="form-grid">

                    <div class="form-row-columns">

                        <div class="row full-width">
                            <div class="column">
                                <label htmlFor="displayName">Display Name</label>
                                <div class="input-wrapper">
                                    <text-input
                                        ref={el => {
                                            if (el && !this.inputRefs.includes(el)) {
                                                this.inputRefs.push(el);
                                            }
                                        }}
                                        value={this.formData.displayName}
                                        propertyName="displayName"
                                        disabled={this.isEditMode}
                                        onValueChange={(e) => this.handleValueChange('displayName', e.detail.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            {this.renderNumberInput('Loan Amount', 'loanAmount')}
                            {this.renderNumberInput('Rate', 'rate', NumericInputTypeEnum.Percentage)}
                        </div>
                        <div class="row">
                            {this.renderNumberInput('Total Monthly Payment', 'totalMonthlyPayment')}
                            {this.renderNumberInput('Escrow', 'escrow')}
                        </div>
                        <div class="row">
                            {!this.hideAdditionalPrincipal && this.renderNumberInput('Additional Principal', 'additionalPrincipal')}
                            <div class="column">
                                <label htmlFor="loanTerms">Loan Terms</label>
                                <div class="input-wrapper flex_column" style={{ width: '141px' }}>
                                    <numeric-input
                                        ref={el => {
                                            if (el && !this.inputRefs.includes(el)) {
                                                this.inputRefs.push(el);
                                            }
                                        }}
                                        style={{ '--input-width': '80px', }}
                                        value={this.formData.loanTermsTime}
                                        propertyName="loanTermsTime"
                                        numericInputType={NumericInputTypeEnum.Integer}
                                        numberOfDecimalsAllowed={0}
                                        onValueChange={(e) => this.handleValueChange('loanTermsTime', e.detail)}
                                    />
                                    <select
                                        class="input-style"
                                        onInput={(e) => this.handleValueChange('loanTermsType', (e.target as HTMLSelectElement).value)}
                                        style={{ width: '160px' }}
                                    >
                                        <option value="years" selected={this.formData.loanTermsType === 'years'}>Years</option>
                                        <option value="months" selected={this.formData.loanTermsType === 'months'}>Months</option>
                                    </select>
                                </div>
                            </div>
                            {this.hideAdditionalPrincipal && (this.renderStartDateInput())}
                        </div>
                        {!this.hideAdditionalPrincipal && (
                            <div class="row">
                                {this.renderStartDateInput()}
                            </div>
                        )}
                        <div class="row button-container">
                            <button
                                class={` ${this.isEditMode ? 'button-style-edit' : 'button-style-add'}`}
                                onClick={() => this.handleAddClick()}
                            >
                                {this.isEditMode ? " Edit" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
