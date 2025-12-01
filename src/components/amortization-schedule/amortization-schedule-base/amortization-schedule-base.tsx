import { Component, h, Prop, State, Watch } from '@stencil/core';
import { AmortizationRow } from '../../../data/models';
import { calculateAmortization, AmortizationCalculatorData } from '../../../utils/amortization';

@Component({
    tag: 'amortization-schedule-base',
    styleUrl: 'amortization-schedule-base.scss',
    shadow: true,
})
export class AmortizationScheduleBase {
    @Prop() amortizationCalculatorData: AmortizationCalculatorData;
    @State() amortizationSchedule: AmortizationRow[] = [];

    componentWillLoad() {
        this.calculateSchedule();
    }

    @Watch('loanData')
    handleLoanDataChange() {
        this.calculateSchedule();
    }

    @Watch('amortizationEntries')
    handleAmortizationEntriesChange() {
        this.calculateSchedule();
    }

    private calculateSchedule() {
        if (!this.amortizationCalculatorData || !this.amortizationCalculatorData.loanData || !this.amortizationCalculatorData.loanData.loanAmount || !this.amortizationCalculatorData.loanData.rate || !this.amortizationCalculatorData.loanData.totalMonthlyPayment || !this.amortizationCalculatorData.loanData.startDate) {
            return;
        }
        this.amortizationSchedule = calculateAmortization(this.amortizationCalculatorData);
    }

    render() {
        return (
            <div >
                <schedule-summary schedule={this.amortizationSchedule} />
                <key-metrics-dashboard loanData={this.amortizationCalculatorData.loanData} schedule={this.amortizationSchedule} />
                <payoff-progress loanData={this.amortizationCalculatorData.loanData} schedule={this.amortizationSchedule} />
                <savings-comparison-graph amortizationCalculatorData={this.amortizationCalculatorData} />
                <pie-chart schedule={this.amortizationSchedule} />
                <cumulative-payment-graph schedule={this.amortizationSchedule} />
                <balance-graph schedule={this.amortizationSchedule} />
                <amortization-schedule schedule={this.amortizationSchedule} />
            </div>
        );
    }
}
