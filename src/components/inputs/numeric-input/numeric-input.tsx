import { Component, h, Prop, Event, EventEmitter, State, Method } from '@stencil/core';
import { NumericInputTypeEnum } from '../../../data/models';
import { formatNumber, getCurrencySymbol } from '../../../utils/utils';

@Component({
    tag: 'numeric-input',
    styleUrl: 'numeric-input.scss',
    shadow: true,
})
export class NumericInput {
    // Core props
    @Prop({ mutable: true }) value: number = null;
    @Prop() min: number = 0;
    @Prop() max: number = null;
    @Prop() propertyName: string = '';
    @Prop() required: boolean = true;
    @Prop() numericInputType: NumericInputTypeEnum = NumericInputTypeEnum.Integer;
    @Prop() numberOfDecimalsAllowed: number = 2;
    @Prop() placeholder?: string;
    @Prop() name?: string;

    // Events
    @Event() valueChange!: EventEmitter<number>;

    @State() isValid: boolean = true;
    private inputEl: HTMLInputElement;

    @Method()
    async setFocus() {
        if (this.inputEl) {
            this.inputEl.focus();
            this.inputEl.select();
        }
    }

    @Method()
    async validateInput(): Promise<boolean> {
        const valueStr = this.inputEl?.value || '';
        if (this.required) {
            this.isValid = valueStr !== null && valueStr !== '';
        } else {
            this.isValid = true;
        }
        return this.isValid;
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        // Allow Ctrl+C, Ctrl+V, and Ctrl+X for copy, paste, and cut
        if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x'].includes(event.key.toLowerCase())) {
            return;
        }
        const isNumberKey = event.key >= '0' && event.key <= '9';
        const allowedControlKeys = ['Backspace', 'Delete'];
        if (isNumberKey || allowedControlKeys.includes(event.key)) return;

        if (this.numericInputType === NumericInputTypeEnum.Integer) {
            if (['.', '-', '+', 'e', 'E'].includes(event.key)) {
                event.preventDefault();
                return;
            }
        } else {
            if (["-", "+", "e", "E"].includes(event.key)) {
                event.preventDefault();
                return;
            }
            // Prevent decimal point if numberOfDecimalsAllowed is 0
            if (event.key === '.' && this.numberOfDecimalsAllowed === 0) {
                event.preventDefault();
                return;
            }
            if (event.key === '.') {
                const input = event.target as HTMLInputElement;
                if (input.value.includes('.')) {
                    event.preventDefault();
                    return;
                }
                return;
            }

        }
        // Block any other non-numeric key
        event.preventDefault();
    };

    private handlePaste = (event: ClipboardEvent) => {
        event.preventDefault();
        let pastedText = event.clipboardData?.getData('text') ?? '';
        const allowNegative = this.min < 0;
        // Clean: allow digits, one dot, one leading negative
        let cleanedValue = pastedText.replace(/[^0-9.\-]/g, '');
        if (!allowNegative) cleanedValue = cleanedValue.replace(/-/g, '');
        // Only one leading negative
        if (allowNegative && cleanedValue.indexOf('-') > 0) cleanedValue = cleanedValue.replace(/-/g, '');
        // Only one decimal point
        const parts = cleanedValue.split('.');
        if (parts.length > 2) cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        // Limit decimals

        const [integerPart, decimalPart] = cleanedValue.split('.');
        if (this.numericInputType === NumericInputTypeEnum.Integer) {
            cleanedValue = integerPart;
        }
        else if (cleanedValue.includes('.')) {
            if (this.numberOfDecimalsAllowed === 0) {
                // Remove all decimal points if not allowed
                cleanedValue = integerPart;
            } else {
                cleanedValue = integerPart + (decimalPart?.length > 0 ? '.' + decimalPart.substring(0, this.numberOfDecimalsAllowed) : '');
            }
        }

        if (cleanedValue !== '') {
            this.inputEl.value = cleanedValue;
            const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
            this.inputEl.dispatchEvent(inputEvent);
        }
    };

    private formatInput(value: string): string {
        if (!value) return '';
        const allowDecimal = this.numericInputType !== NumericInputTypeEnum.Integer;
        const allowNegative = this.min < 0;
        let [wholePart = '', decimalPart] = value.split('.');

        if (this.numberOfDecimalsAllowed == 0)
            decimalPart = undefined;
        if (
            allowDecimal &&
            decimalPart !== undefined &&
            this.isNumber(wholePart, allowNegative) &&
            this.isNumber(decimalPart)
        ) {
            // Limit the number of decimals
            const limitedDecimal = decimalPart.substring(0, this.numberOfDecimalsAllowed);
            return `${wholePart === '' ? '0' : this.addFormatting(wholePart)}.${limitedDecimal}`;
        }
        else if (this.isNumber(wholePart, allowNegative)) {
            return this.addFormatting(wholePart);
        }
        return value;
    }

    private addFormatting(value: string): string {
        if (!value) return '';
        const num = Number(value.replace(/,/g, ''));
        if (isNaN(num)) return value;
        return formatNumber(num);
    }

    private isNumber(num: string, allowNegative = false): boolean {
        return allowNegative ? /^-?\d*$/.test(num) : /^\d*$/.test(num);
    }

    private handleInput = async (event: InputEvent) => {
        const input = event.target as HTMLInputElement;
        let value = input.value;
        // Remove formatting
        value = this.removeFormatting(value);
        // Split into whole and decimal parts
        // let [wholePart, decimalPart] = value.split('.');
        // let formattedValue = '';
        // if (this.numericInputType !== NumericInputTypeEnum.Integer && decimalPart !== undefined) {
        //     // Enforce decimal limit during typing
        //     //decimalPart = decimalPart.substring(0, this.numberOfDecimalsAllowed);  
        //     //formattedValue = `${wholePart === '' ? '0' : this.formatInput(wholePart)}.${decimalPart}`;
        //     //value = `${wholePart}.${decimalPart}`;
        // } else {
        //     formattedValue = this.formatInput(value);
        // }

        input.value = this.formatInput(value);;
        if (value === '.') return;
        if (await this.validateInput()) {
            this.value = Number(value);
            this.valueChange.emit(this.value);
        } else {
            this.value = null;
            this.valueChange.emit(null);
        }
    }

    private removeFormatting(value: string): string {
        // Remove all non-digit, non-decimal, non-negative chars
        return value.replace(/[^\d.\-]/g, '');
    }

    private getValueForInput() {
        if (this.value === null || this.value === undefined) {
            return '';
        }
        return this.formatInput(this.value.toString());
    }

    render() {
        const inputPrefix = this.numericInputType === NumericInputTypeEnum.Currency ? getCurrencySymbol('USD') : null;
        const inputSuffix = this.numericInputType === NumericInputTypeEnum.Percentage ? '%' : null;
        return (
            <div class={`base-input-group ${this.isValid ? '' : 'red-border'}`}>
                {inputPrefix && <span class="input-prefix">{inputPrefix}</span>}
                <input
                    ref={el => (this.inputEl = el as HTMLInputElement)}
                    class="ids-form-control"
                    type="text"
                    name={this.name}
                    placeholder={this.placeholder}
                    value={this.getValueForInput()}
                    required={this.required}
                    min={this.min}
                    {...(this.max !== null ? { max: this.max } : {})}
                    {...(this.numericInputType === NumericInputTypeEnum.Decimal ? { inputMode: 'decimal' } : {})}
                    onInput={this.handleInput}
                    onKeyDown={this.handleKeyDown}
                    onPaste={this.handlePaste}
                />
                {inputSuffix && <span class="input-suffix">{inputSuffix}</span>}
            </div>
        );
    }
}