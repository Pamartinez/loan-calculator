import { Component, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';

@Component({
  tag: 'bar-chart',
  styleUrl: 'bar-chart.scss',
  shadow: true,
})
export class BarChart {
  @Prop() schedule: AmortizationRow[] = [];
  @Event() rowClicked: EventEmitter<AmortizationRow>;

  @State() hoveredYear: number | string | null = null;
  @State() hoveredData: { principal: number; interest: number } | null = null;

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

    const maxAmount = Math.max(...this.schedule.map(row => row.principal + row.interest));

    return (
      <div class="chart-container">
        <div class="chart-bars">
          {this.schedule.map((row) => {
            const principalHeight = (row.principal / maxAmount) * 100;
            const interestHeight = (row.interest / maxAmount) * 100;

            return (
              <div
                key={row.time}
                class="bar-wrapper"
                onClick={() => this.handleRowClick(row)}
                onMouseEnter={() => {
                  this.hoveredYear = row.time;
                  this.hoveredData = { principal: row.principal + row.additionalPrincipal, interest: row.interest };
                }}
                onMouseLeave={() => {
                  this.hoveredYear = null;
                  this.hoveredData = null;
                }}
              >
                {this.hoveredYear === row.time && this.hoveredData && (
                  <div class="tooltip">
                    <div class="tooltip-item">Interest: {this.formatCurrency(this.hoveredData.interest)}</div>
                    <div>Principal: {this.formatCurrency(this.hoveredData.principal)}</div>
                    <div class="tooltip-arrow" />
                  </div>
                )}
                <div
                  class="bar-interest"
                  style={{ height: `${interestHeight}%` }}
                />
                <div
                  class="bar-principal"
                  style={{ height: `${principalHeight}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div class="x-axis-labels">
          {this.schedule.map((row) => (
            <div key={row.time} class="x-axis-label">
              {row.time}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
