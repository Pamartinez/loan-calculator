import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { AmortizationData } from '../../../data/models';
import { formatCurrency } from '../../../utils/utils';

@Component({
  tag: 'amortization-list',
  styleUrl: 'amortization-list.scss',
  shadow: true,
})
export class AmortizationList {
  @Prop() entries: AmortizationData[] = [];

  @Event() deleteEntry: EventEmitter<string>;

  private handleDelete = (id: string) => {
    this.deleteEntry.emit(id);
  };

  private formatDate = (dateString: string): string => {
    const [year, month] = dateString.split('-');
    return `${month}/${year}`;
  };

  render() {
    if (!this.entries || this.entries.length === 0) {
      return (
        <div class="amortization-list empty">
          <p>No amortization entries added yet.</p>
        </div>
      );
    }

    return (
      <div class="amortization-list">
        <div class="list-container">
          {this.entries.map((entry) => (
            <div key={entry.id} class="entry-item">
              <span class="amount">{formatCurrency(entry.amount)}</span>
              <span class="date">{this.formatDate(entry.date)}</span>
              <button
                class="button-style delete-button"
                onClick={() => this.handleDelete(entry.id)}
                aria-label="Delete entry"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
