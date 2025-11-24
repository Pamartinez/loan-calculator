import { Component, h, Prop } from '@stencil/core';
import { LoanFormData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
  tag: 'key-metrics-dashboard',
  styleUrl: 'key-metrics-dashboard.scss',
  shadow: true,
})
export class KeyMetricsDashboard {
  @Prop() loanData: LoanFormData;

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatDate(yearMonth: string): string {
    if (!yearMonth) return 'N/A';
    const [year, month] = yearMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  private calculateMetrics() {
    if (!this.loanData || !this.loanData.loanAmount) {
      return null;
    }

    const standardSchedule = calculateAmortization({ ...this.loanData, additionalPrincipal: 0 });
    const withAdditionalSchedule = this.loanData.additionalPrincipal > 0
      ? calculateAmortization(this.loanData)
      : null;

    const totalInterestStandard = standardSchedule.reduce((sum, row) => sum + row.interest, 0);

    // Use the schedule with additional principal if it exists for total paid calculation
    const activeSchedule = withAdditionalSchedule || standardSchedule;
    const totalInterest = activeSchedule.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = activeSchedule.reduce((sum, row) => sum + row.principal + row.additionalPrincipal, 0);
    const totalPaid = totalPrincipal + totalInterest;

    const monthlyPrincipalInterest = this.loanData.totalMonthlyPayment - (this.loanData.escrow || 0);

    const startDate = this.loanData.startDate ? new Date(this.loanData.startDate + '-01') : new Date();
    const payoffDate = new Date(startDate);
    payoffDate.setFullYear(payoffDate.getFullYear() + standardSchedule.length);
    const payoffDateStr = payoffDate.toISOString().substring(0, 7);

    let interestSaved = 0;
    let timeSaved = 0;
    let payoffDateWithAdditional = payoffDateStr;

    if (withAdditionalSchedule) {
      const totalInterestWithAdditional = withAdditionalSchedule.reduce((sum, row) => sum + row.interest, 0);
      interestSaved = totalInterestStandard - totalInterestWithAdditional;
      timeSaved = standardSchedule.length - withAdditionalSchedule.length;

      const payoffWithAdditional = new Date(startDate);
      payoffWithAdditional.setFullYear(payoffWithAdditional.getFullYear() + withAdditionalSchedule.length);
      payoffDateWithAdditional = payoffWithAdditional.toISOString().substring(0, 7);
    }

    const percentPaid = 0; // This would need to track actual payments made
    const effectiveRate = this.loanData.rate;

    return {
      loanAmount: this.loanData.loanAmount,
      totalInterest,
      totalPaid,
      monthlyPayment: monthlyPrincipalInterest,
      totalMonthlyPayment: this.loanData.totalMonthlyPayment,
      escrow: this.loanData.escrow || 0,
      payoffDate: withAdditionalSchedule ? payoffDateWithAdditional : payoffDateStr,
      yearsToPayoff: activeSchedule.length,
      effectiveRate,
      percentPaid,
      interestSaved,
      timeSaved,
      payoffDateWithAdditional,
      hasAdditional: this.loanData.additionalPrincipal > 0,
      additionalPrincipal: this.loanData.additionalPrincipal,
    };
  }

  render() {
    const metrics = this.calculateMetrics();

    if (!metrics) {
      return null;
    }

    return (
      <div class="metrics-dashboard">
        <h3 class="dashboard-title">Loan Summary</h3>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Loan Amount</div>
            <div class="metric-value">{this.formatCurrency(metrics.loanAmount)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Interest Rate</div>
            <div class="metric-value">{metrics.effectiveRate}%</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Total Interest</div>
            <div class="metric-value highlight-red">{this.formatCurrency(metrics.totalInterest)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Total Amount Paid</div>
            <div class="metric-value">{this.formatCurrency(metrics.totalPaid)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Monthly P&I Payment</div>
            <div class="metric-value">{this.formatCurrency(metrics.monthlyPayment)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Monthly Escrow</div>
            <div class="metric-value">{this.formatCurrency(metrics.escrow)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Total Monthly Payment</div>
            <div class="metric-value highlight-blue">{this.formatCurrency(metrics.totalMonthlyPayment)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Years to Payoff</div>
            <div class="metric-value">{metrics.yearsToPayoff} years</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Debt-Free Date</div>
            <div class="metric-value">{this.formatDate(metrics.payoffDate)}</div>
          </div>

          {metrics.hasAdditional && (
            <div class="metric-card highlight-card">
              <div class="metric-label">Additional Principal</div>
              <div class="metric-value">{this.formatCurrency(metrics.additionalPrincipal)}/month</div>
            </div>
          )}

          {metrics.hasAdditional && metrics.interestSaved > 0 && (
            <div class="metric-card highlight-card">
              <div class="metric-label">Interest Saved</div>
              <div class="metric-value highlight-green">{this.formatCurrency(metrics.interestSaved)}</div>
            </div>
          )}

          {metrics.hasAdditional && metrics.timeSaved > 0 && (
            <div class="metric-card highlight-card">
              <div class="metric-label">Time Saved</div>
              <div class="metric-value highlight-green">{metrics.timeSaved} years</div>
            </div>
          )}

          {metrics.hasAdditional && (
            <div class="metric-card highlight-card">
              <div class="metric-label">New Payoff Date</div>
              <div class="metric-value">{this.formatDate(metrics.payoffDateWithAdditional)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
