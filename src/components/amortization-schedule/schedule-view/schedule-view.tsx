import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'schedule-view',
  styleUrl: 'schedule-view.scss',
  shadow: false,
})
export class ScheduleView {
  @Prop() schedule: AmortizationRow[] = [];
  @Event() rowClicked: EventEmitter<AmortizationRow>;

  private currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  handleRowClick(row: AmortizationRow) {
    this.rowClicked.emit(row);
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    return (
      <div>
        <bar-chart schedule={this.schedule} onRowClicked={(e) => this.rowClicked.emit(e.detail)} />

        {/* Table */}
        <table class="schedule-table">
          <thead>
            <tr class="table-header">
              <th>Year</th>
              <th class="text-right">Principal</th>
              <th class="text-right">Additional Principal</th>
              <th class="text-right">Total Principal</th>
              <th class="text-right">Interest</th>
              <th class="text-right">Remaining Balance</th>
            </tr>
          </thead>
          <tbody>
            {this.schedule.map((row) => (
              <tr class="table-row">
                <td>{row.time}</td>
                <td class="text-right">{this.formatCurrency(row.principal)}</td>
                <td class="text-right">{this.formatCurrency(row.additionalPrincipal)}</td>
                <td class="text-right">{this.formatCurrency(row.principal + row.additionalPrincipal)}</td>
                <td class="text-right">{this.formatCurrency(row.interest)}</td>
                <td class="text-right">{this.formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr class="table-footer">
              <td>Time</td>
              <td class="text-right">
                {this.formatCurrency(this.schedule.reduce((sum, row) => sum + row.principal, 0))}
              </td>
              <td class="text-right">
                {this.formatCurrency(this.schedule.reduce((sum, row) => sum + row.additionalPrincipal, 0))}
              </td>
              <td class="text-right">
                {this.formatCurrency(this.schedule.reduce((sum, row) => sum + (row.additionalPrincipal + row.principal), 0))}
              </td>
              <td class="text-right">
                {this.formatCurrency(this.schedule.reduce((sum, row) => sum + row.interest, 0))}
              </td>
              <td class="text-right"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
}
