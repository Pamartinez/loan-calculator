import { Component, h, Prop, State, Watch } from '@stencil/core';
import { LoanFormData } from '../../../data/models';

@Component({
  tag: 'amortization-schedule-without-additional',
  styleUrl: 'amortization-schedule-without-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithoutAdditional {
  @Prop() loanData: LoanFormData;

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
    this.loanDataWithoutAdditional = { ...this.loanData, additionalPrincipal: 0 };
  }

  render() {
    return (
      <amortization-schedule-base loanData={this.loanDataWithoutAdditional} />
    );
  }
}
