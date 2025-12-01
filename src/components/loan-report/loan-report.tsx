import { Component, h, Prop } from '@stencil/core';
import { LoanFormData } from '../../data/models';

@Component({
  tag: 'loan-report',
  styleUrl: 'loan-report.scss',
  shadow: true,
})
export class LoanReport {
  @Prop() loanDataDictionary: { [key: string]: LoanFormData };

  render() {
    if (!this.loanDataDictionary || Object.keys(this.loanDataDictionary).length === 0) {
      return null;
    }

    return (
      <div class="loan-report">
        <h1 class="report-title">Loan Amortization Report</h1>
        <div class="report-date">
          Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {Object.keys(this.loanDataDictionary).map((key) => {
          const loanData = this.loanDataDictionary[key];
          const amortizationCalculatorData = {
            loanData: loanData,
            amortizationEntries: [],
            paymentRecords: []
          }

          return (
            <div class="loan-section">
              <h2 class="loan-title">{loanData.displayName}</h2>

              <loan-details loanData={loanData} />

              <div class="schedule-section">
                <h3 class="schedule-title">Standard Amortization Schedule</h3>
                <amortization-schedule-without-additional loanData={loanData} />
              </div>

              {loanData.additionalPrincipal > 0 && (
                <div class="schedule-section page-break">
                  <h3 class="schedule-title">With Additional Principal Payment</h3>
                  <amortization-schedule-with-additional amortizationCalculatorData={amortizationCalculatorData} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}
