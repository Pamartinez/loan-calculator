import { Component, h, Prop } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'schedule-summary',
  styleUrl: 'schedule-summary.scss',
  shadow: true,
})
export class ScheduleSummary {
  @Prop() schedule: AmortizationRow[] = [];

  private currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    const totalAmountPaid = this.schedule.reduce((sum, row) => sum + row.principal + row.additionalPrincipal + row.interest, 0);
    const yearsToPayOff = this.schedule.length;

    return (
      <div class="summary-section">
        <div class="summary-item">
          <span class="summary-label">Total Amount Paid:</span>
          <span class="summary-value">{this.formatCurrency(totalAmountPaid)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Years to Pay Off:</span>
          <span class="summary-value">{yearsToPayOff} {yearsToPayOff === 1 ? 'year' : 'years'}</span>
        </div>
      </div>
    );
  }
}
