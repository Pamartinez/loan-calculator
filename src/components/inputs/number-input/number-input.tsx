import { Component, Prop, h, Event, EventEmitter, State, Method } from '@stencil/core';
import { NumericInputTypeEnum } from '../../../data/models';

@Component({
  tag: 'number-input',
  styleUrl: 'number-input.scss',
  shadow: true,
})
/********************************************************************************
 * @component NumberInput
 * @description A custom number input component that restricts input to numbers only.
 * @prop {number} value - The current value of the input.
 * @prop {string} propertyName - The name of the property associated with the input.
 * @event valueChange - Emitted when the value changes.
 ********************************************************************************/
export class NumberInput {
  @Prop({ mutable: true }) value: number = null;
  @Prop() readonly min: number = 0;
  @Prop() readonly max: number = null;
  @Prop() readonly propertyName: string = '';
  @Prop() readonly required: boolean = true;
  @Prop() readonly numericInputType: NumericInputTypeEnum = NumericInputTypeEnum.Integer;
  @Prop() readonly numberOfDecimalsAllowed: number = 2;

  @Event() valueChange: EventEmitter<{ value: number; propertyName: string }>;
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

  private readonly handleKeyDownDecimals = (event: KeyboardEvent) => {
    // Block invalid characters: -, +, e, E
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    const dotIndex = input.value.indexOf('.');

    // If we are already at the maximum number of decimals, block additional characters
    if (dotIndex !== -1 && input.value.length - dotIndex > this.numberOfDecimalsAllowed) {
      const isNumberKey = event.key >= '0' && event.key <= '9';
      if (isNumberKey) {
        event.preventDefault();
      }
    }
  };

  private readonly handleKeyDownInteger = (event: KeyboardEvent) => {
    const excludedKeys = ['.', '-', '+', 'e', 'E'];
    if (excludedKeys.includes(event.key)) {
      event.preventDefault();
    }
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    return this.numericInputType === NumericInputTypeEnum.Decimal ? this.handleKeyDownDecimals(event) : this.handleKeyDownInteger(event);
  };

  private readonly handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text');
    if (!pastedText) return;

    // Remove all non-numeric characters except decimal point
    let cleanedValue = pastedText.replace(/[^\d.]/g, '');

    // Remove extra decimal points (keep only the first one)
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // For integer type, remove decimal point
    if (this.numericInputType === NumericInputTypeEnum.Integer) {
      cleanedValue = cleanedValue.replace(/\./g, '');
    }

    // Limit decimal places
    if (this.numericInputType === NumericInputTypeEnum.Decimal && cleanedValue.includes('.')) {
      const [integerPart, decimalPart] = cleanedValue.split('.');
      cleanedValue = integerPart + '.' + decimalPart.substring(0, this.numberOfDecimalsAllowed);
    }

    // Update the input value
    if (this.inputEl && cleanedValue !== '') {
      this.inputEl.value = cleanedValue;
      // Trigger input event to update the value
      const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true });
      this.inputEl.dispatchEvent(inputEvent);
    }
  };

  private readonly handleInput = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    if (newValue === null || newValue === '') {
      // Match valid number with up to 2 decimals
      const validPattern = new RegExp(`^\\d*\\.?\\d{0,${this.numberOfDecimalsAllowed}}$`);
      // Only update state if pattern matches
      if (validPattern.test(newValue)) {
        this.value = Number(newValue);
      } else {
        // Revert if invalid
        input.value = this.value?.toString();
      }
    }

    if (await this.validateInput()) {
      this.value = Number(input.value) || 0;
    } else {
      this.value = null;
    }

    if (this.numericInputType == NumericInputTypeEnum.Percentage && this.value !== null && this.value !== undefined) {
      this.value = this.value / 100;
    }

    this.valueChange?.emit({ value: this.value, propertyName: this.propertyName });
  };

  private getValueForInput() {
    if (this.value === null || this.value === undefined) {
      return null;
    }

    const value = this.numericInputType === NumericInputTypeEnum.Percentage ? Number((this.value * 100).toFixed(2)) : this.value;
    return value;
  }

  render() {
    return (
      <input
        ref={el => (this.inputEl = el)}
        class={`input-style ${this.isValid ? '' : 'red-border'}`}
        type="number"
        min={this.min}
        {...(this.max !== null ? { max: this.max } : {})}
        {...(this.numericInputType === NumericInputTypeEnum.Decimal ? { inputMode: 'decimal' } : {})}
        value={this.getValueForInput()}
        onKeyDown={this.handleKeyDown}
        onPaste={this.handlePaste}
        onInput={this.handleInput}
      />
    );
  }
}
