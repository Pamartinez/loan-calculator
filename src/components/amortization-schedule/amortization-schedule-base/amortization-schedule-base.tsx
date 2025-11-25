import { Component, h, Prop, State, Watch } from '@stencil/core';
import { AmortizationRow, LoanFormData, AmortizationData } from '../../../data/models';
import { calculateAmortization } from '../../../utils/amortization';

@Component({
    tag: 'amortization-schedule-base',
    styleUrl: 'amortization-schedule-base.scss',
    shadow: true,
})
export class AmortizationScheduleBase {
    @Prop() loanData: LoanFormData;
    @Prop() amortizationEntries: AmortizationData[] = [];

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
        if (!this.loanData || !this.loanData.loanAmount || !this.loanData.rate || !this.loanData.totalMonthlyPayment || !this.loanData.startDate) {
            return;
        }

        this.amortizationSchedule = calculateAmortization(this.loanData, this.amortizationEntries);
    }

    render() {
        return (
            <div >
                <schedule-summary schedule={this.amortizationSchedule} />
                <key-metrics-dashboard loanData={this.loanData} schedule={this.amortizationSchedule} />
                <payoff-progress loanData={this.loanData} amortizationEntries={this.amortizationEntries} />
                <savings-comparison-graph loanData={this.loanData} amortizationEntries={this.amortizationEntries} />
                <pie-chart schedule={this.amortizationSchedule} />
                <cumulative-payment-graph schedule={this.amortizationSchedule} />
                <balance-graph schedule={this.amortizationSchedule} />
                <amortization-schedule schedule={this.amortizationSchedule} />
            </div>
        );
    }
}
