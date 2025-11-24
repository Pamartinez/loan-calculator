import { Component, h, State, Method, Prop, Watch, Event, EventEmitter } from '@stencil/core';
import { LoanFormData, NumericInputTypeEnum } from '../../data/models';

@Component({
    tag: 'loan-calculator',
    styleUrl: 'loan-calculator.scss',
    shadow: true,
})
export class LoanCalculator {
    @Prop() initialFormData?: LoanFormData;

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
        canBeDeleted: true,
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
                        {this.renderNumberInput('Additional Principal', 'additionalPrincipal', '$')}
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
                                <input
                                    type="month"
                                    id="startDate"
                                    class="input-style"
                                    value={this.formData.startDate || ''}
                                    onInput={(e) => this.handleValueChange('startDate', (e.target as HTMLInputElement).value)}
                                    onKeyDown={(e) => {
                                        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                        if (!allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div class="form-group button-container">
                            <button
                                class={`button-style ${this.isEditMode ? 'button-style-edit' : 'button-style-add'}`}
                                onClick={() => this.handleAddClick()}
                            >
                                {this.isEditMode ? 'Edit' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
