import { Component, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';
import { formatCurrency } from '../../../utils/utils';

@Component({
  tag: 'bar-chart',
  styleUrl: 'bar-chart.scss',
  shadow: true,
})
export class BarChart {
  @Prop() schedule: AmortizationRow[] = [];
  @Event() rowClicked: EventEmitter<AmortizationRow>;

  @State() hoveredYear: number | string | null = null;
  @State() hoveredData: { principal: number; additionalPrincipal: number; interest: number } | null = null;

  handleRowClick(row: AmortizationRow) {
    this.rowClicked.emit(row);
  }

  render() {
    if (this.schedule.length === 0) {
      return null;
    }

    const maxAmount = Math.max(...this.schedule.map(row => row.principal + row.additionalPrincipal + row.interest));

    return (
      <div class="chart-container section">
        <h3 class="chart-title">Annual Payment Breakdown</h3>
        <div class="chart-bars">
          {this.schedule.map((row) => {
            const principalHeight = (row.principal / maxAmount) * 100;
            const additionalPrincipalHeight = (row.additionalPrincipal / maxAmount) * 100;
            const interestHeight = (row.interest / maxAmount) * 100;

            return (
              <div
                key={row.time}
                class="bar-wrapper"
                onClick={() => this.handleRowClick(row)}
                onMouseEnter={() => {
                  this.hoveredYear = row.time;
                  this.hoveredData = { principal: row.principal, additionalPrincipal: row.additionalPrincipal, interest: row.interest };
                }}
                onMouseLeave={() => {
                  this.hoveredYear = null;
                  this.hoveredData = null;
                }}
              >
                {this.hoveredYear === row.time && this.hoveredData && (
                  <div class="tooltip">
                    <div class="tooltip-header">Year {row.time}</div>
                    <div class="tooltip-content">
                      <div class="tooltip-item interest">
                        <span class="tooltip-label">Interest</span>
                        <span class="tooltip-value">{formatCurrency(this.hoveredData.interest)}</span>
                      </div>
                      <div class="tooltip-item principal">
                        <span class="tooltip-label">Principal</span>
                        <span class="tooltip-value">{formatCurrency(this.hoveredData.principal)}</span>
                      </div>
                      {this.hoveredData.additionalPrincipal > 0 && (
                        <div class="tooltip-item additional">
                          <span class="tooltip-label">Additional</span>
                          <span class="tooltip-value">{formatCurrency(this.hoveredData.additionalPrincipal)}</span>
                        </div>
                      )}
                      <div class="tooltip-total">
                        <span class="tooltip-label">Total</span>
                        <span class="tooltip-value">{formatCurrency(this.hoveredData.interest + this.hoveredData.principal + this.hoveredData.additionalPrincipal)}</span>
                      </div>
                    </div>
                    <div class="tooltip-arrow" />
                  </div>
                )}
                <div
                  class="bar-interest"
                  style={{ height: `${interestHeight}%` }}
                />
                {row.additionalPrincipal > 0 && (
                  <div
                    class="bar-additional-principal"
                    style={{ height: `${additionalPrincipalHeight}%` }}
                  />
                )}
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
