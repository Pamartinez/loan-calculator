import { Component, h, State, Event, EventEmitter } from '@stencil/core';
import { AmortizationData } from '../../../data/models';

@Component({
  tag: 'amortization-entry',
  styleUrl: 'amortization-entry.scss',
  shadow: true,
})
export class AmortizationEntryComponent {
  @State() amount: number = null;
  @State() date: string = '';

  @Event() addEntry: EventEmitter<AmortizationData>;

  private handleAmountChange = (event: CustomEvent<{ value: number; propertyName: string }>) => {
    this.amount = event.detail.value;
  };

  private handleDateChange = (event: CustomEvent<string>) => {
    this.date = event.detail;
  };

  private handleAdd = () => {
    if (this.amount && this.amount > 0 && this.date) {
      const entry: AmortizationData = {
        amount: this.amount,
        date: this.date,
        id: `amortization-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      this.addEntry.emit(entry);
      // Reset fields
      this.amount = null;
      this.date = '';
    }
  };

  render() {
    const isValid = this.amount && this.amount > 0 && this.date;

    return (
      <div class="amortization-entry">
        <div class="input-group">
          <div class="amount-input">
            <label htmlFor="amount">Amount</label>
            <number-input
              value={this.amount}
              propertyName="amount"
              onValueChange={this.handleAmountChange}
            />
          </div>
          <div class="date-input-wrapper">
            <label htmlFor="amortization-date">Date</label>
            <date-input
              value={this.date}
              inputId="amortization-date"
              onDateChange={this.handleDateChange}
            />
          </div>
          <button
            class="button-style add-button"
            onClick={this.handleAdd}
            disabled={!isValid}
          >
            Add
          </button>
        </div>
      </div>
    );
  }
}
