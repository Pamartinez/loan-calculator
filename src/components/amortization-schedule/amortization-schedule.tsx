import { Component, h, Prop, State } from '@stencil/core';
import { AmortizationRow } from '../../data/models';

@Component({
    tag: 'amortization-schedule',
    styleUrl: 'amortization-schedule.scss',
    shadow: true,
})
export class AmortizationSchedule {
    @Prop() schedule: AmortizationRow[] = [];

    @State() showPopup: boolean = false;
    @State() selectedRow: AmortizationRow | null = null;

    handleRowClick(event: CustomEvent<AmortizationRow>) {
        this.selectedRow = event.detail;
        this.showPopup = true;
    }

    render() {
        if (this.schedule.length === 0) {
            return null;
        }

        return (
            <div>
                <schedule-view
                    schedule={this.schedule}
                    onRowClicked={(e) => this.handleRowClick(e)}
                />

                {/* Popup Modal */}
                <popup-modal
                    modalTitle={`Year ${this.selectedRow?.time} Details`}
                    isOpen={this.showPopup}
                    onClosePopup={() => this.showPopup = false}
                >
                    {this.selectedRow && (
                        <schedule-view schedule={this.selectedRow.details} style={{ "--chart-height": "150px" }} />
                    )}
                </popup-modal>
            </div>
        );
    }
}
