import { Component, h, Prop } from '@stencil/core';
import { LoanFormData, AmortizationData } from '../../../data/models';

@Component({
  tag: 'amortization-schedule-with-additional',
  styleUrl: 'amortization-schedule-with-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithAdditional {
  @Prop() loanData: LoanFormData;
  @Prop() amortizationEntries: AmortizationData[] = [];

  render() {
    return (
      <div >
        <amortization-schedule-base
          loanData={this.loanData}
          amortizationEntries={this.amortizationEntries}
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
