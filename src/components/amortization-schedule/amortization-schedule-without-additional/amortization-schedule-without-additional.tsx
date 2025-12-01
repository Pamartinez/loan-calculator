import { Component, h, Prop, State, Watch } from '@stencil/core';
import { LoanFormData } from '../../../data/models';
import { AmortizationCalculatorData } from '../../../utils/amortization';

@Component({
  tag: 'amortization-schedule-without-additional',
  styleUrl: 'amortization-schedule-without-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithoutAdditional {
  @Prop() loanData: LoanFormData;

  @State() amortizationCalculatorData: AmortizationCalculatorData;

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
    this.amortizationCalculatorData = {
      loanData: { ...this.loanData, additionalPrincipal: 0 },
      amortizationEntries: [],
      paymentRecords: []
    };
  }

  render() {
    return (
      <amortization-schedule-base amortizationCalculatorData={this.amortizationCalculatorData} />
    );
  }
}
