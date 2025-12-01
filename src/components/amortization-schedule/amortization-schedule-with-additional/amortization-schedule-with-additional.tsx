import { Component, h, Prop } from '@stencil/core';
import { AmortizationCalculatorData } from '../../../utils/amortization';

@Component({
  tag: 'amortization-schedule-with-additional',
  styleUrl: 'amortization-schedule-with-additional.scss',
  shadow: true,
})
export class AmortizationScheduleWithAdditional {
  @Prop() amortizationCalculatorData: AmortizationCalculatorData;

  render() {
    return (
      <div>
        <amortization-schedule-base
          amortizationCalculatorData={this.amortizationCalculatorData}
        // style={{
        //   '--bar-principal': '#28a745',
        //   '--bar-principal-hover': '#218838'
        // }}
        />
      </div>
    );
  }
}
