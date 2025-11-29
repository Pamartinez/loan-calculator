import { Component, h, State, Event, EventEmitter, Prop } from '@stencil/core';
import { AmortizationData, NumericInputTypeEnum } from '../../../data/models';
import { formatCurrency } from '../../../utils/utils';

@Component({
  tag: 'amortization-entry-form',
  styleUrl: 'amortization-entry-form.scss',
  shadow: true,
})
export class AmortizationEntry {
  @State() amount: number = 0;
  @State() date: string = '';
  @State() inputsValid: boolean = false;
  @Prop() entries?: AmortizationData[];
  @Event() updateEntries: EventEmitter<AmortizationData[]>; // retained for backward compatibility
  @Event() addEntry: EventEmitter<AmortizationData>;
  @Event() deleteEntry: EventEmitter<string>;
  private numberInputRef?: any; // Expect component with validateInput()
  private dateInputRef?: any;   // Expect component with validateInput()
  private inputRefs: any[] = [];

  private async validateAllInputs(): Promise<boolean> {
    this.inputRefs = [this.numberInputRef, this.dateInputRef];
    const validationResults = await Promise.all(
      this.inputRefs.map(input => input?.validateInput?.())
    );
    const allValid = validationResults.every(result => result === true);
    this.inputsValid = allValid;
    return allValid;
  }

  // Controlled component: parent owns entries. No internal copy.


  private handleAmountChange = (event: CustomEvent<number>) => {
    this.amount = event?.detail;
    this.validateAllInputs();
  };

  private handleDateChange = (event: CustomEvent<string>) => {
    this.date = (event?.detail || '').trim();
    this.validateAllInputs();
  };

  private handleAdd = async () => {
    const baseValid = typeof this.amount === 'number' && this.amount > 0 && !!this.date;
    const inputsValid = await this.validateAllInputs();
    if (baseValid && inputsValid) {
      const id = this.generateId();
      const entry: AmortizationData = {
        amount: this.amount,
        date: this.date,
        id
      };
      const current = Array.isArray(this.entries) ? this.entries : [];
      const next = [...current, entry];
      // Emit both granular add and the full list for any listener styles
      this.addEntry.emit(entry);
      this.updateEntries.emit(next);
      // Reset fields
      this.amount = null;
      this.date = '';
      this.inputsValid = false;
    }
  };

  private formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const match = /^(\d{4})-(\d{1,2})/.exec(dateString);
    if (!match) return dateString;
    const [, year, month] = match;
    return `${month.padStart(2, '0')}/${year}`;
  };

  private generateId(): string {
    try {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `amortization-${Date.now()}-${arr[0].toString(16)}${arr[1].toString(16)}`;
    } catch {
      return `amortization-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  render() {
    const isValid = typeof this.amount === 'number' && this.amount > 0 && !!this.date && this.inputsValid;
    const items = Array.isArray(this.entries) ? this.entries : [];
    const handleDeleteIndex = (ev: CustomEvent<number>) => {
      const index = ev.detail;
      if (index >= 0 && index < items.length) {
        const id = items[index].id;
        this.deleteEntry.emit(id);
        // Also emit full list minus deleted for legacy listeners
        const next = items.filter((_, i) => i !== index);
        this.updateEntries.emit(next);
      }
    };

    return (
      <div class="card">
        <h2>Amortization Entries</h2>
        <div class="amortization-entry">
          <div class="form-grid">
            <div class="form-row-columns">
              <div class="row">
                <div class="column ">
                  <label htmlFor="amount">Amount</label>
                  <numeric-input
                    value={this.amount}
                    propertyName="amount"
                    onValueChange={this.handleAmountChange}
                    numericInputType={NumericInputTypeEnum.Currency}
                    ref={el => (this.numberInputRef = el)}
                  />
                </div>
                <div class="column">
                  <label htmlFor="amortization-date">Date</label>
                  <date-input
                    value={this.date}
                    inputId="amortization-date"
                    onDateChange={this.handleDateChange}
                    ref={el => (this.dateInputRef = el)}
                  />
                </div>
                <div class="column">
                  <button
                    class="button-style add-button"
                    onClick={this.handleAdd}
                    disabled={!isValid}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="entries-preview">
          <component-list
            items={items.map((entry) => (
              <div class="entry-item" key={entry.id}>
                <span class="amount">{formatCurrency(entry.amount)}</span>
                <span class="date">{this.formatDate(entry.date)}</span>
              </div>
            ))}
            emptyMessage="No amortization entries added yet."
            onDeleteItem={handleDeleteIndex}
          ></component-list>
        </div>
      </div>
    );
  }
}
