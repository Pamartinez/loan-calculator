import { Component, h, Prop, State, Watch } from '@stencil/core';
import { AmortizationRow, LoanFormData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
  tag: 'amortization-schedule-without-additional',
  styleUrl: 'amortization-schedule-without-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithoutAdditional {
  @Prop() loanData: LoanFormData;

  @State() amortizationSchedule: AmortizationRow[] = [];
  @State() loanDataWithoutAdditional: LoanFormData;

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

    // Calculate standard amortization schedule without additional principal
    this. loanDataWithoutAdditional = { ...this.loanData, additionalPrincipal: 0 };
    this.amortizationSchedule = calculateAmortization(this. loanDataWithoutAdditional);
  }

  render() {
    return (
      <div >
        <schedule-summary schedule={this.amortizationSchedule} />
        <key-metrics-dashboard loanData={this.loanDataWithoutAdditional} />
        <payoff-progress loanData={this.loanDataWithoutAdditional} />
        <pie-chart schedule={this.amortizationSchedule} />
        <cumulative-payment-graph schedule={this.amortizationSchedule} />
        <amortization-schedule schedule={this.amortizationSchedule} />
      </div>
    );
  }
}
