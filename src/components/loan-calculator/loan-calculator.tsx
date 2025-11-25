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

    private inputRefs: (HTMLTextInputElement | HTMLNumberInputElement)[] = [];

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
        prefix: string | null = null,
        suffix: string | null = null,
        numberOfDecimalsAllowed: number = 2
    ) {
        return (
            <div class="form-group">
                <label htmlFor={propertyName}>{label}</label>
                <div class="input-wrapper">
                    {prefix && <span class="prefix">{prefix}</span>}
                    <number-input
                        ref={el => {
                            if (el && !this.inputRefs.includes(el)) {
                                this.inputRefs.push(el);
                            }
                        }}
                        value={this.formData[propertyName] as number}
                        propertyName={propertyName}
                        numericInputType={NumericInputTypeEnum.Decimal}
                        numberOfDecimalsAllowed={numberOfDecimalsAllowed}
                        onValueChange={(e) => this.handleValueChange(propertyName, e.detail.value)}
                    />
                    {suffix && <span class="suffix">{suffix}</span>}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div class="loan-calculator">
                <div class="form-container">
                    {/* Display Name - Full Width */}
                    <div class="form-group full-width">
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

                    {/* First Row - Loan Amount and Rate */}
                    <div class="form-row">
                        {this.renderNumberInput('Loan Amount', 'loanAmount', '$')}
                        {this.renderNumberInput('Rate', 'rate', null, '%', 3)}
                    </div>

                    {/* Second Row - Total Monthly Payment and Escrow */}
                    <div class="form-row">
                        {this.renderNumberInput('Total Monthly Payment', 'totalMonthlyPayment', '$')}
                        {this.renderNumberInput('Escrow', 'escrow', '$')}
                    </div>

                    {/* Third Row - Additional Principal and Loan Terms */}
                    <div class="form-row">
                        {!this.hideAdditionalPrincipal && this.renderNumberInput('Additional Principal', 'additionalPrincipal', '$')}
                        <div class="form-group">
                            <label htmlFor="loanTerms">Loan Terms</label>
                            <div class="input-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <number-input
                                    ref={el => {
                                        if (el && !this.inputRefs.includes(el)) {
                                            this.inputRefs.push(el);
                                        }
                                    }}
                                    style={{ '--input-width': '100px' }}
                                    value={this.formData.loanTermsTime}
                                    propertyName="loanTermsTime"
                                    numericInputType={NumericInputTypeEnum.Integer}
                                    numberOfDecimalsAllowed={0}
                                    onValueChange={(e) => this.handleValueChange('loanTermsTime', e.detail.value)}
                                />
                                <select
                                    class="input-style"
                                    onInput={(e) => this.handleValueChange('loanTermsType', (e.target as HTMLSelectElement).value)}
                                    style={{ width: '100px' }}
                                >
                                    <option value="years" selected={this.formData.loanTermsType === 'years'}>Years</option>
                                    <option value="months" selected={this.formData.loanTermsType === 'months'}>Months</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fourth Row - Start Date and Button */}
                    <div class="form-row">
                        <div class="form-group">
                            <label htmlFor="startDate">Start Date</label>
                            <div class="input-wrapper">
                                <date-input
                                    value={this.formData.startDate || ''}
                                    inputId="startDate"
                                    onDateChange={(e) => this.handleValueChange('startDate', e.detail)}
                                />
                            </div>
                        </div>
                        <div class="form-group button-container">
                            <button
                                class={`button-style ${this.isEditMode ? 'button-style-edit' : 'button-style-add'}`}
                                onClick={() => this.handleAddClick()}
                            >
                                {this.isEditMode ? (
                                    <span class="button-content">
                                        <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Edit
                                    </span>
                                ) : (
                                    <span class="button-content">
                                        <svg class="add-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="16"></line>
                                            <line x1="8" y1="12" x2="16" y2="12"></line>
                                        </svg>
                                        Add
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
