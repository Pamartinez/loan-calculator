import { Component, h, Prop } from '@stencil/core';
import { LoanFormData } from '../../../../data/models';
import { formatCurrency } from '../../../../utils/utils';

@Component({
  tag: 'loan-details',
  styleUrl: 'loan-details.scss',
  shadow: true,
})
export class LoanDetails {
  @Prop() loanData: LoanFormData;

  render() {
    if (!this.loanData || !this.loanData.loanAmount) {
      return null;
    }

    const monthlyPI = this.loanData.totalMonthlyPayment - (this.loanData.escrow || 0);

    return (
      <div class="loan-summary section">
        <h3 class="loan-summary-title">Loan Details</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-icon">💵</div>
            <div class="card-content">
              <span class="summary-label">Loan Amount</span>
              <span class="summary-value">{formatCurrency(this.loanData.loanAmount)}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <span class="summary-label">Interest Rate</span>
              <span class="summary-value rate-value">{this.loanData.rate}%</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon">💳</div>
            <div class="card-content">
              <span class="summary-label">Monthly P&I</span>
              <span class="summary-value">{formatCurrency(monthlyPI)}</span>
            </div>
          </div>

          {this.loanData.additionalPrincipal > 0 && (
            <div class="summary-card highlight">
              <div class="card-icon">➕</div>
              <div class="card-content">
                <span class="summary-label">Additional Principal</span>
                <span class="summary-value">{formatCurrency(this.loanData.additionalPrincipal)}</span>
                <span class="summary-subtitle">per month</span>
              </div>
            </div>
          )}

          {this.loanData.escrow !== undefined && this.loanData.escrow > 0 && (
            <div class="summary-card">
              <div class="card-icon">🏠</div>
              <div class="card-content">
                <span class="summary-label">Escrow</span>
                <span class="summary-value">{formatCurrency(this.loanData.escrow)}</span>
                <span class="summary-subtitle">per month</span>
              </div>
            </div>
          )}

          <div class="summary-card primary">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <span class="summary-label">Total Monthly Payment</span>
              <span class="summary-value">{formatCurrency(this.loanData.totalMonthlyPayment)}</span>
              <span class="summary-subtitle">including escrow</span>
            </div>
          </div>

          {this.loanData.startDate && (
            <div class="summary-card">
              <div class="card-icon">📅</div>
              <div class="card-content">
                <span class="summary-label">Start Date</span>
                <span class="summary-value date-value">{this.loanData.startDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
