import { Component, h, Prop } from '@stencil/core';
import { LoanFormData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
  tag: 'payoff-progress',
  styleUrl: 'payoff-progress.scss',
  shadow: true,
})
export class PayoffProgress {
  @Prop() loanData: LoanFormData;
  @Prop() currentDate?: string; // Format: YYYY-MM

  private calculateProgress() {
    if (!this.loanData || !this.loanData.loanAmount || !this.loanData.startDate) {
      return null;
    }

    const schedule = calculateAmortization(this.loanData);
    const totalYears = schedule.length;

    // Calculate years passed
    const startDate = new Date(this.loanData.startDate + '-01');
    const current = this.currentDate ? new Date(this.currentDate + '-01') : new Date();
    const yearsPassed = (current.getFullYear() - startDate.getFullYear()) +
      (current.getMonth() - startDate.getMonth()) / 12;

    const percentComplete = Math.min(Math.max((yearsPassed / totalYears) * 100, 0), 100);
    const yearsRemaining = Math.max(totalYears - yearsPassed, 0);

    // Calculate amount paid
    const totalLoanAmount = this.loanData.loanAmount;
    const monthlyPrincipal = totalLoanAmount / (totalYears * 12);
    const monthsPassed = yearsPassed * 12;
    const principalPaid = Math.min(monthlyPrincipal * monthsPassed, totalLoanAmount);
    const principalRemaining = Math.max(totalLoanAmount - principalPaid, 0);

    const milestones = [
      { percent: 25, label: '25%', reached: percentComplete >= 25 },
      { percent: 50, label: '50%', reached: percentComplete >= 50 },
      { percent: 75, label: '75%', reached: percentComplete >= 75 },
      { percent: 100, label: 'Paid Off', reached: percentComplete >= 100 },
    ];

    return {
      percentComplete,
      yearsRemaining,
      totalYears,
      principalPaid,
      principalRemaining,
      milestones,
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  render() {
    const progress = this.calculateProgress();

    if (!progress) {
      return null;
    }

    return (
      <div class="payoff-progress">
        <h3 class="progress-title">Loan Payoff Progress</h3>

        <div class="progress-stats">
          <div class="stat">
            <div class="stat-label">Progress</div>
            <div class="stat-value">{progress.percentComplete.toFixed(1)}%</div>
          </div>
          <div class="stat">
            <div class="stat-label">Years Remaining</div>
            <div class="stat-value">{progress.yearsRemaining.toFixed(1)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Principal Paid</div>
            <div class="stat-value">{this.formatCurrency(progress.principalPaid)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Principal Remaining</div>
            <div class="stat-value">{this.formatCurrency(progress.principalRemaining)}</div>
          </div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style={{ width: `${progress.percentComplete}%` }}
            >
              <span class="progress-text">{progress.percentComplete.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div class="milestones">
          {progress.milestones.map((milestone) => (
            <div class={`milestone ${milestone.reached ? 'reached' : ''}`}>
              <div class="milestone-marker"></div>
              <div class="milestone-label">{milestone.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
