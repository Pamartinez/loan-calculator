import { Component, Prop, h, Event, EventEmitter, State, Method } from '@stencil/core';

@Component({
  tag: 'text-input',
  styleUrl: 'text-input.scss',
  shadow: true,
})
/********************************************************************************
 * @component TextInput
 * @description A custom text input component with validation support.
 * @prop {string} value - The current value of the input.
 * @prop {string} propertyName - The name of the property associated with the input.
 * @event valueChange - Emitted when the value changes.
 ********************************************************************************/
export class TextInput {
  @Prop({ mutable: true }) value: string = '';
  @Prop() readonly propertyName: string = '';
  @Prop() readonly required: boolean = true;
  @Prop() readonly maxLength: number = null;
  @Prop() readonly disabled: boolean = false;

  @Event() valueChange: EventEmitter<{ value: string; propertyName: string }>;
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
    if (this.required) {
      this.isValid = this.value !== null && this.value !== '';
    } else {
      this.isValid = true;
    }
    return this.isValid;
  }

  private readonly handleInput = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    this.value = newValue;
    await this.validateInput();

    if (!this.isValid) {
      this.value = '';
    }

    this.valueChange?.emit({ value: this.value, propertyName: this.propertyName });
  };

  render() {
    return (
      <input
        ref={el => (this.inputEl = el)}
        class={`input-style ${this.isValid ? '' : 'red-border'}`}
        type="text"
        disabled={this.disabled}
        {...(this.maxLength !== null ? { maxLength: this.maxLength } : {})}
        value={this.value || ''}
        onInput={this.handleInput}
      />
    );
  }
}
