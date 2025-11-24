import { Component, h, Prop } from '@stencil/core';
import { LoanFormData } from '../../../data/models';

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
      <div class="loan-summary">
        <div class="summary-item">
          <span class="summary-label">Loan Amount:</span>
          <span class="summary-value">${this.loanData.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Interest Rate:</span>
          <span class="summary-value">{this.loanData.rate}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Monthly P&I:</span>
          <span class="summary-value">${monthlyPI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Additional Principal (monthly):</span>
          <span class="summary-value">${this.loanData.additionalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {this.loanData.escrow !== undefined && this.loanData.escrow > 0 && (
          <div class="summary-item">
            <span class="summary-label">Escrow (monthly):</span>
            <span class="summary-value">${this.loanData.escrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        <div class="summary-item">
          <span class="summary-label">Total Monthly Payment (incl. escrow):</span>
          <span class="summary-value">${this.loanData.totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {this.loanData.startDate && (
          <div class="summary-item">
            <span class="summary-label">Start Date:</span>
            <span class="summary-value">{this.loanData.startDate}</span>
          </div>
        )}
      </div>
    );
  }
}
