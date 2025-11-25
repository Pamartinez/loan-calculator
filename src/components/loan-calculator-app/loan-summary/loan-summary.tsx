import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { LoanFormData } from '../../../data/models';

@Component({
  tag: 'loan-summary',
  styleUrl: 'loan-summary.scss',
  shadow: true,
})
export class LoanSummary {
  @Prop() loanData: LoanFormData;

  @Event() deleteLoan: EventEmitter<string>;
  @Event() summaryTabChange: EventEmitter<{ loanId: string; tabIndex: number }>;

  private handleDelete = () => {
    if (this.loanData?.id) {
      this.deleteLoan.emit(this.loanData.id);
    }
  };

  private handleTabChange = (event: CustomEvent<number>) => {
    if (this.loanData?.id) {
      this.summaryTabChange.emit({ loanId: this.loanData.id, tabIndex: event.detail });
    }
  };

  private getTabs() {
    const tabs = [
      {
        name: 'Loan',
        content: <amortization-schedule-without-additional loanData={this.loanData} />
      }
    ];

    if (this.loanData?.additionalPrincipal && this.loanData.additionalPrincipal > 0) {
      tabs.push({
        name: 'Loan with Additional Principal',
        content: <amortization-schedule-with-additional loanData={this.loanData} />
      });
    }

    return tabs;
  }

  render() {
    if (!this.loanData || !this.loanData.loanAmount) {
      return null;
    }

    return (
      <div>
        <div class="action-buttons">
          {this.loanData.canBeDeleted && (
            <button class="button-style button-style-delete" onClick={this.handleDelete}>
              Delete
            </button>
          )}
        </div>
        <loan-details loanData={this.loanData} />

        {/* Amortization Schedules */}
        <tabs-controller
          tabs={this.getTabs()}
          defaultActiveIndex={this.loanData.summaryTabSelected || 0}
          onTabChange={this.handleTabChange}
        />
      </div>
    );
  }
}
