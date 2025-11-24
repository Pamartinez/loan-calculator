import { Component, h, Prop, State, Watch } from '@stencil/core';
import { AmortizationRow, LoanFormData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
  tag: 'amortization-schedule-with-additional',
  styleUrl: 'amortization-schedule-with-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithAdditional {
  @Prop() loanData: LoanFormData;

  @State() amortizationScheduleWithAdditionalPrincipal: AmortizationRow[] = [];

  componentWillLoad() {
    this.calculateSchedule();
  }

  @Watch('loanData')
  handleLoanDataChange() {
    this.calculateSchedule();
  }

  private calculateSchedule() {
    if (!this.loanData || !this.loanData.loanAmount || !this.loanData.rate || !this.loanData.totalMonthlyPayment || !this.loanData.startDate) {
      return;
    }

    // Calculate amortization with additional principal if applicable
    if (this.loanData.additionalPrincipal && this.loanData.additionalPrincipal > 0) {
      this.amortizationScheduleWithAdditionalPrincipal = calculateAmortization(this.loanData);
    } else {
      this.amortizationScheduleWithAdditionalPrincipal = [];
    }
  }

  render() {
    return (
      <div >
        
        <schedule-summary schedule={this.amortizationScheduleWithAdditionalPrincipal} />
        <key-metrics-dashboard loanData={this.loanData} />
        <payoff-progress loanData={this.loanData} />
        <savings-comparison-graph loanData={this.loanData} />
        <pie-chart schedule={this.amortizationScheduleWithAdditionalPrincipal} />
        <cumulative-payment-graph schedule={this.amortizationScheduleWithAdditionalPrincipal} />
        <amortization-schedule
          schedule={this.amortizationScheduleWithAdditionalPrincipal}
          style={{
            '--bar-interest': '#d4edda',
            '--bar-interest-hover': '#b8dcc4',
            '--bar-principal': '#28a745',
            '--bar-principal-hover': '#218838'
          }}
        />
      </div>
    );
  }
}
